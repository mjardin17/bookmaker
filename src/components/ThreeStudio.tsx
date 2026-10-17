import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  RotateCcw,
  Eye,
  Sliders,
  Layers,
  Sparkles,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Compass,
  Play,
  Pause,
  Sun,
  Shield,
  Box,
  Cpu
} from 'lucide-react';

// Scratch vector helpers pre-allocated outside render loop for zero-GC 60fps performance
const _v1 = new THREE.Vector3();
const _targetPos = new THREE.Vector3();
const _targetLook = new THREE.Vector3();

export type ModelId = 'thunderbolt' | 'athena_owl' | 'quantum_core';
export type MaterialFinish = 'gold' | 'obsidian' | 'marble' | 'titanium';
export type LightPreset = 'olympian' | 'studio' | 'midnight' | 'golden_hour';
export type CameraPreset = 'hero' | 'top' | 'low' | 'macro';

interface ThreeStudioProps {
  initialModel?: ModelId;
}

export const ThreeStudio: React.FC<ThreeStudioProps> = ({ initialModel = 'thunderbolt' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // UI state
  const [activeModel, setActiveModel] = useState<ModelId>(initialModel);
  const [explodedRatio, setExplodedRatio] = useState<number>(0);
  const [materialFinish, setMaterialFinish] = useState<MaterialFinish>('gold');
  const [lightPreset, setLightPreset] = useState<LightPreset>('olympian');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('hero');
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [rotationSpeed, setRotationSpeed] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(60);

  // Mutable refs for Three.js state without React re-render tearing
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const currentModelGroupRef = useRef<THREE.Group | null>(null);
  const modelPartsRef = useRef<{ mesh: THREE.Mesh; basePos: THREE.Vector3; explodeDir: THREE.Vector3 }[]>([]);
  const lightsRef = useRef<{ keyLight: THREE.DirectionalLight; hemiLight: THREE.HemisphereLight; rimLight: THREE.DirectionalLight } | null>(null);
  const materialsRef = useRef<Record<string, THREE.Material>>({});

  // Audio synthesizer helper (Web Audio API)
  const playUiSound = (freq = 440, type: OscillatorType = 'sine', duration = 0.08) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
      // Audio not permitted or suspended
    }
  };

  // Helper: Create a procedural radial contact shadow texture
  const createContactShadowTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
    gradient.addColorStop(0.35, 'rgba(0, 0, 0, 0.5)');
    gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.15)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };

  // Helper: Create a procedural runic/circuit bump map
  const createProceduralBumpMap = (type: 'runic' | 'circuit' | 'marble') => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;

    if (type === 'runic') {
      // Meander / Greek Key border & geometric sun runes
      ctx.beginPath();
      for (let i = 0; i < 512; i += 64) {
        ctx.moveTo(i, 32);
        ctx.lineTo(i + 32, 32);
        ctx.lineTo(i + 32, 64);
        ctx.lineTo(i + 16, 64);
        ctx.lineTo(i + 16, 48);
      }
      ctx.stroke();

      // Central symbol
      ctx.beginPath();
      ctx.arc(256, 256, 120, 0, Math.PI * 2);
      ctx.stroke();
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        ctx.moveTo(256 + Math.cos(a) * 80, 256 + Math.sin(a) * 80);
        ctx.lineTo(256 + Math.cos(a) * 140, 256 + Math.sin(a) * 140);
      }
      ctx.stroke();
    } else if (type === 'circuit') {
      // Traces & bus lines
      for (let i = 40; i < 500; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 40);
        ctx.lineTo(i, 200);
        ctx.lineTo(i + 30, 230);
        ctx.lineTo(i + 30, 480);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(i, 40, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Veined marble noise
      for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * 512, Math.random() * 512);
        ctx.bezierCurveTo(
          Math.random() * 512, Math.random() * 512,
          Math.random() * 512, Math.random() * 512,
          Math.random() * 512, Math.random() * 512
        );
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + Math.random() * 0.2})`;
        ctx.lineWidth = 1 + Math.random() * 4;
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  };

  // Build Procedural Materials with varied roughness & metalness
  const getPbrMaterials = (finish: MaterialFinish) => {
    const bumpRunic = createProceduralBumpMap('runic');
    const bumpCircuit = createProceduralBumpMap('circuit');
    const bumpMarble = createProceduralBumpMap('marble');

    let heroColor = 0xf5ba2c; // Olympian Gold
    let heroMetal = 0.95;
    let heroRough = 0.15;
    let heroClearcoat = 0.6;

    if (finish === 'obsidian') {
      heroColor = 0x111317;
      heroMetal = 0.4;
      heroRough = 0.12;
      heroClearcoat = 1.0;
    } else if (finish === 'marble') {
      heroColor = 0xeaeef4;
      heroMetal = 0.08;
      heroRough = 0.35;
      heroClearcoat = 0.3;
    } else if (finish === 'titanium') {
      heroColor = 0x98a2b3;
      heroMetal = 0.92;
      heroRough = 0.22;
      heroClearcoat = 0.8;
    }

    return {
      hero: new THREE.MeshPhysicalMaterial({
        color: heroColor,
        metalness: heroMetal,
        roughness: heroRough,
        clearcoat: heroClearcoat,
        clearcoatRoughness: 0.1,
        bumpMap: finish === 'obsidian' ? bumpCircuit : bumpRunic,
        bumpScale: 0.015,
        reflectivity: 0.9
      }),
      accentGold: new THREE.MeshStandardMaterial({
        color: 0xffb703,
        metalness: 0.9,
        roughness: 0.2
      }),
      flutedPedestal: new THREE.MeshStandardMaterial({
        color: finish === 'obsidian' ? 0x1e2430 : 0xd8dde6,
        metalness: 0.1,
        roughness: 0.65, // >= 0.25 variance from hero
        bumpMap: bumpMarble,
        bumpScale: 0.02
      }),
      gemCrystal: new THREE.MeshPhysicalMaterial({
        color: 0x06b6d4,
        metalness: 0.05,
        roughness: 0.08,
        transmission: 0.92,
        ior: 1.55,
        thickness: 1.2,
        clearcoat: 1.0
      }),
      amberGem: new THREE.MeshPhysicalMaterial({
        color: 0xf59e0b,
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.88,
        ior: 1.6,
        thickness: 1.4,
        clearcoat: 1.0
      }),
      agedBronze: new THREE.MeshStandardMaterial({
        color: 0x85582c,
        metalness: 0.75,
        roughness: 0.45
      }),
      darkWalnut: new THREE.MeshStandardMaterial({
        color: 0x271911,
        metalness: 0.05,
        roughness: 0.75
      }),
      cloudVapor: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.95,
        metalness: 0.0,
        transparent: true,
        opacity: 0.8
      }),
      radianceGlow: new THREE.MeshBasicMaterial({
        color: 0x38bdf8
      })
    };
  };

  // 1. Build Model: "Little Zeus Thunderbolt & Olympian Altar" (10 distinct parts)
  const buildThunderboltModel = (mats: ReturnType<typeof getPbrMaterials>) => {
    const group = new THREE.Group();
    group.name = 'hero_thunderbolt';
    const parts: { mesh: THREE.Mesh; basePos: THREE.Vector3; explodeDir: THREE.Vector3 }[] = [];

    // Part 1: Stepped Foundation Plinth (bottom-center flush with y = 0)
    const baseGeo = new THREE.CylinderGeometry(2.4, 2.7, 0.4, 32);
    const baseMesh = new THREE.Mesh(baseGeo, mats.flutedPedestal);
    baseMesh.position.set(0, 0.2, 0);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    group.add(baseMesh);
    parts.push({ mesh: baseMesh, basePos: baseMesh.position.clone(), explodeDir: new THREE.Vector3(0, -0.4, 0) });

    // Part 2: Fluted Column Pedestal (Lathe Geometry)
    const columnPoints: THREE.Vector2[] = [];
    for (let i = 0; i <= 20; i++) {
      const y = i * 0.1;
      const r = 1.3 - 0.2 * Math.sin((i / 20) * Math.PI) + (i === 0 || i === 20 ? 0.35 : 0);
      columnPoints.push(new THREE.Vector2(r, y));
    }
    const columnGeo = new THREE.LatheGeometry(columnPoints, 32);
    const columnMesh = new THREE.Mesh(columnGeo, mats.flutedPedestal);
    columnMesh.position.set(0, 0.4, 0);
    columnMesh.castShadow = true;
    columnMesh.receiveShadow = true;
    group.add(columnMesh);
    parts.push({ mesh: columnMesh, basePos: columnMesh.position.clone(), explodeDir: new THREE.Vector3(0, -0.2, 0) });

    // Part 3: Bronze Collar Rings (Top of Altar)
    const collarGeo = new THREE.TorusGeometry(1.4, 0.12, 16, 48);
    const collarMesh = new THREE.Mesh(collarGeo, mats.agedBronze);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.set(0, 2.45, 0);
    collarMesh.castShadow = true;
    group.add(collarMesh);
    parts.push({ mesh: collarMesh, basePos: collarMesh.position.clone(), explodeDir: new THREE.Vector3(0, 0.1, 0) });

    // Part 4: Aegis Crest Sun Medallion
    const medallionShape = new THREE.Shape();
    medallionShape.absarc(0, 0, 1.2, 0, Math.PI * 2, false);
    const medallionHole = new THREE.Path();
    medallionHole.absarc(0, 0, 0.8, 0, Math.PI * 2, true);
    medallionShape.holes.push(medallionHole);
    const medallionGeo = new THREE.ExtrudeGeometry(medallionShape, {
      depth: 0.15,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 0.05,
      bevelThickness: 0.05
    });
    const medallionMesh = new THREE.Mesh(medallionGeo, mats.accentGold);
    medallionMesh.position.set(0, 3.2, 0);
    medallionMesh.castShadow = true;
    group.add(medallionMesh);
    parts.push({ mesh: medallionMesh, basePos: medallionMesh.position.clone(), explodeDir: new THREE.Vector3(0, 0.5, 0) });

    // Part 5: The Golden Thunderbolt (Sharp Beveled Zigzag Extrusion)
    const boltShape = new THREE.Shape();
    boltShape.moveTo(0, 3.8);
    boltShape.lineTo(0.55, 2.7);
    boltShape.lineTo(0.18, 2.7);
    boltShape.lineTo(0.7, 1.4);
    boltShape.lineTo(0.25, 1.4);
    boltShape.lineTo(0.65, 0.2);
    boltShape.lineTo(-0.15, 1.1);
    boltShape.lineTo(0.15, 1.1);
    boltShape.lineTo(-0.35, 2.3);
    boltShape.lineTo(0.05, 2.3);
    boltShape.closePath();

    const boltGeo = new THREE.ExtrudeGeometry(boltShape, {
      depth: 0.35,
      bevelEnabled: true,
      bevelSegments: 5,
      bevelSize: 0.08,
      bevelThickness: 0.08
    });
    boltGeo.center();
    const boltMesh = new THREE.Mesh(boltGeo, mats.hero);
    boltMesh.position.set(0, 3.8, 0.05);
    boltMesh.scale.set(1.4, 1.4, 1.4);
    boltMesh.castShadow = true;
    group.add(boltMesh);
    parts.push({ mesh: boltMesh, basePos: boltMesh.position.clone(), explodeDir: new THREE.Vector3(0, 1.2, 0) });

    // Part 6 & 7: Dual Levitating Radiant Crystals (Orbital Sapphires)
    const gemGeo = new THREE.OctahedronGeometry(0.35, 0);
    const gemLeft = new THREE.Mesh(gemGeo, mats.gemCrystal);
    gemLeft.position.set(-1.8, 3.6, 0);
    gemLeft.castShadow = true;
    group.add(gemLeft);
    parts.push({ mesh: gemLeft, basePos: gemLeft.position.clone(), explodeDir: new THREE.Vector3(-1.2, 0.4, 0) });

    const gemRight = new THREE.Mesh(gemGeo, mats.amberGem);
    gemRight.position.set(1.8, 3.6, 0);
    gemRight.castShadow = true;
    group.add(gemRight);
    parts.push({ mesh: gemRight, basePos: gemRight.position.clone(), explodeDir: new THREE.Vector3(1.2, 0.4, 0) });

    // Part 8: Energy Arc Filament (Curved Tube Geometry)
    const curvePoints = [];
    for (let c = 0; c <= 30; c++) {
      const angle = (c / 30) * Math.PI * 3;
      const radius = 1.0 + 0.3 * Math.sin(c * 0.2);
      curvePoints.push(new THREE.Vector3(Math.cos(angle) * radius, 2.5 + c * 0.08, Math.sin(angle) * radius));
    }
    const tubeCurve = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeo = new THREE.TubeGeometry(tubeCurve, 40, 0.04, 12, false);
    const tubeMesh = new THREE.Mesh(tubeGeo, mats.radianceGlow);
    group.add(tubeMesh);
    parts.push({ mesh: tubeMesh, basePos: tubeMesh.position.clone(), explodeDir: new THREE.Vector3(0, 0.8, 0) });

    // Part 9: Storm Cloud Vapor Ring (Base Cushion)
    const cloudRingGeo = new THREE.TorusGeometry(1.8, 0.3, 16, 32);
    const cloudRing = new THREE.Mesh(cloudRingGeo, mats.cloudVapor);
    cloudRing.rotation.x = Math.PI / 2;
    cloudRing.position.set(0, 0.5, 0);
    group.add(cloudRing);
    parts.push({ mesh: cloudRing, basePos: cloudRing.position.clone(), explodeDir: new THREE.Vector3(0, -0.1, 0) });

    // Part 10: Soft Radial Contact Shadow Ground Plane (y = 0.01)
    const shadowGeo = new THREE.PlaneGeometry(6.5, 6.5);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: createContactShadowTexture(),
      transparent: true,
      depthWrite: false,
      opacity: 0.45
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, 0.01, 0);
    group.add(shadowMesh);

    return { group, parts };
  };

  // 2. Build Model: "Athena's Clockwork Automaton Owl" (11 distinct parts)
  const buildAthenaOwlModel = (mats: ReturnType<typeof getPbrMaterials>) => {
    const group = new THREE.Group();
    group.name = 'hero_athena_owl';
    const parts: { mesh: THREE.Mesh; basePos: THREE.Vector3; explodeDir: THREE.Vector3 }[] = [];

    // Part 1: Perch Crossbar (bottom ground fixture)
    const perchGeo = new THREE.CylinderGeometry(0.2, 0.22, 4.0, 16);
    const perchMesh = new THREE.Mesh(perchGeo, mats.darkWalnut);
    perchMesh.rotation.z = Math.PI / 2;
    perchMesh.position.set(0, 0.6, 0);
    perchMesh.castShadow = true;
    perchMesh.receiveShadow = true;
    group.add(perchMesh);
    parts.push({ mesh: perchMesh, basePos: perchMesh.position.clone(), explodeDir: new THREE.Vector3(0, -0.4, 0) });

    // Part 2: Clockwork Brass Torso
    const torsoPoints: THREE.Vector2[] = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const y = t * 2.2;
      const r = Math.sin(t * Math.PI) * 0.95 + 0.2;
      torsoPoints.push(new THREE.Vector2(r, y));
    }
    const torsoGeo = new THREE.LatheGeometry(torsoPoints, 24);
    const torsoMesh = new THREE.Mesh(torsoGeo, mats.hero);
    torsoMesh.position.set(0, 0.8, 0);
    torsoMesh.castShadow = true;
    group.add(torsoMesh);
    parts.push({ mesh: torsoMesh, basePos: torsoMesh.position.clone(), explodeDir: new THREE.Vector3(0, 0.1, 0) });

    // Part 3: Exposed Rotating Escapement Gear (Front Chest)
    const gearShape = new THREE.Shape();
    const teeth = 16;
    for (let i = 0; i < teeth; i++) {
      const a1 = (i / teeth) * Math.PI * 2;
      const a2 = ((i + 0.5) / teeth) * Math.PI * 2;
      const rOuter = 0.55;
      const rInner = 0.42;
      if (i === 0) gearShape.moveTo(Math.cos(a1) * rOuter, Math.sin(a1) * rOuter);
      else gearShape.lineTo(Math.cos(a1) * rOuter, Math.sin(a1) * rOuter);
      gearShape.lineTo(Math.cos(a2) * rInner, Math.sin(a2) * rInner);
    }
    gearShape.closePath();
    const gearGeo = new THREE.ExtrudeGeometry(gearShape, { depth: 0.1, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 });
    const gearMesh = new THREE.Mesh(gearGeo, mats.accentGold);
    gearMesh.position.set(0, 1.8, 0.85);
    gearMesh.castShadow = true;
    group.add(gearMesh);
    parts.push({ mesh: gearMesh, basePos: gearMesh.position.clone(), explodeDir: new THREE.Vector3(0, 0, 0.8) });

    // Part 4 & 5: Articulated Wing Plates (Left & Right)
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(0.8, 1.4);
    wingShape.lineTo(0.5, 2.2);
    wingShape.lineTo(-0.1, 1.8);
    wingShape.closePath();
    const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03 });

    const wingLeft = new THREE.Mesh(wingGeo, mats.agedBronze);
    wingLeft.position.set(-1.1, 1.2, 0);
    wingLeft.rotation.y = 0.25;
    wingLeft.castShadow = true;
    group.add(wingLeft);
    parts.push({ mesh: wingLeft, basePos: wingLeft.position.clone(), explodeDir: new THREE.Vector3(-1.1, 0.2, 0) });

    const wingRight = new THREE.Mesh(wingGeo, mats.agedBronze);
    wingRight.position.set(1.1, 1.2, 0);
    wingRight.rotation.y = -0.25;
    wingRight.scale.x = -1;
    wingRight.castShadow = true;
    group.add(wingRight);
    parts.push({ mesh: wingRight, basePos: wingRight.position.clone(), explodeDir: new THREE.Vector3(1.1, 0.2, 0) });

    // Part 6: Crested Head Helm (Upper Head)
    const headGeo = new THREE.SphereGeometry(0.85, 24, 20);
    const headMesh = new THREE.Mesh(headGeo, mats.hero);
    headMesh.position.set(0, 3.1, 0.1);
    headMesh.scale.set(1.1, 0.95, 1.0);
    headMesh.castShadow = true;
    group.add(headMesh);
    parts.push({ mesh: headMesh, basePos: headMesh.position.clone(), explodeDir: new THREE.Vector3(0, 0.9, 0) });

    // Part 7 & 8: Amber Optical Eyes
    const eyeGeo = new THREE.CylinderGeometry(0.3, 0.25, 0.2, 24);
    const eyeLeft = new THREE.Mesh(eyeGeo, mats.amberGem);
    eyeLeft.rotation.x = Math.PI / 2;
    eyeLeft.position.set(-0.45, 3.15, 0.85);
    eyeLeft.castShadow = true;
    group.add(eyeLeft);
    parts.push({ mesh: eyeLeft, basePos: eyeLeft.position.clone(), explodeDir: new THREE.Vector3(-0.4, 0.3, 0.6) });

    const eyeRight = new THREE.Mesh(eyeGeo, mats.amberGem);
    eyeRight.rotation.x = Math.PI / 2;
    eyeRight.position.set(0.45, 3.15, 0.85);
    eyeRight.castShadow = true;
    group.add(eyeRight);
    parts.push({ mesh: eyeRight, basePos: eyeRight.position.clone(), explodeDir: new THREE.Vector3(0.4, 0.3, 0.6) });

    // Part 9: Beveled Obsidian Beak
    const beakGeo = new THREE.ConeGeometry(0.22, 0.6, 4);
    const beakMesh = new THREE.Mesh(beakGeo, mats.darkWalnut);
    beakMesh.rotation.x = 2.1;
    beakMesh.position.set(0, 2.75, 0.95);
    beakMesh.castShadow = true;
    group.add(beakMesh);
    parts.push({ mesh: beakMesh, basePos: beakMesh.position.clone(), explodeDir: new THREE.Vector3(0, -0.2, 0.8) });

    // Part 10: Mechanical Talons Claws
    const talonGeo = new THREE.TorusGeometry(0.25, 0.06, 8, 16, Math.PI);
    const talonLeft = new THREE.Mesh(talonGeo, mats.accentGold);
    talonLeft.rotation.x = Math.PI / 2;
    talonLeft.position.set(-0.45, 0.75, 0.1);
    group.add(talonLeft);
    parts.push({ mesh: talonLeft, basePos: talonLeft.position.clone(), explodeDir: new THREE.Vector3(-0.3, -0.2, 0) });

    // Part 11: Contact Shadow
    const shadowGeo = new THREE.PlaneGeometry(5.0, 5.0);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: createContactShadowTexture(),
      transparent: true,
      depthWrite: false,
      opacity: 0.45
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, 0.01, 0);
    group.add(shadowMesh);

    return { group, parts };
  };

  // 3. Build Model: "Empire OS Quantum Knowledge Core" (9 distinct parts)
  const buildQuantumCoreModel = (mats: ReturnType<typeof getPbrMaterials>) => {
    const group = new THREE.Group();
    group.name = 'hero_quantum_core';
    const parts: { mesh: THREE.Mesh; basePos: THREE.Vector3; explodeDir: THREE.Vector3 }[] = [];

    // Part 1: Sub-deck Heat Sink Pedestal (Octagonal)
    const baseGeo = new THREE.CylinderGeometry(2.2, 2.6, 0.5, 8);
    const baseMesh = new THREE.Mesh(baseGeo, mats.flutedPedestal);
    baseMesh.position.set(0, 0.25, 0);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    group.add(baseMesh);
    parts.push({ mesh: baseMesh, basePos: baseMesh.position.clone(), explodeDir: new THREE.Vector3(0, -0.5, 0) });

    // Part 2: Monolithic Obsidian Core Spire (Tapered Prism)
    const spireGeo = new THREE.CylinderGeometry(0.7, 1.2, 3.2, 4);
    const spireMesh = new THREE.Mesh(spireGeo, mats.hero);
    spireMesh.rotation.y = Math.PI / 4;
    spireMesh.position.set(0, 2.1, 0);
    spireMesh.castShadow = true;
    group.add(spireMesh);
    parts.push({ mesh: spireMesh, basePos: spireMesh.position.clone(), explodeDir: new THREE.Vector3(0, 0.2, 0) });

    // Part 3: Outer Magnetic Containment Gimbal Ring (Beveled Torus)
    const ringOuterGeo = new THREE.TorusGeometry(1.8, 0.12, 16, 64);
    const ringOuter = new THREE.Mesh(ringOuterGeo, mats.accentGold);
    ringOuter.rotation.x = 0.5;
    ringOuter.position.set(0, 2.2, 0);
    ringOuter.castShadow = true;
    group.add(ringOuter);
    parts.push({ mesh: ringOuter, basePos: ringOuter.position.clone(), explodeDir: new THREE.Vector3(0.6, 0.6, 0) });

    // Part 4: Inner Counter-Rotating Gimbal Ring
    const ringInnerGeo = new THREE.TorusGeometry(1.4, 0.08, 16, 64);
    const ringInner = new THREE.Mesh(ringInnerGeo, mats.agedBronze);
    ringInner.rotation.y = 0.8;
    ringInner.position.set(0, 2.2, 0);
    ringInner.castShadow = true;
    group.add(ringInner);
    parts.push({ mesh: ringInner, basePos: ringInner.position.clone(), explodeDir: new THREE.Vector3(-0.6, -0.4, 0) });

    // Part 5: Apex Quantum Prism (Floating Transmissive Crystal)
    const prismGeo = new THREE.OctahedronGeometry(0.5, 0);
    const prismMesh = new THREE.Mesh(prismGeo, mats.gemCrystal);
    prismMesh.position.set(0, 4.1, 0);
    prismMesh.castShadow = true;
    group.add(prismMesh);
    parts.push({ mesh: prismMesh, basePos: prismMesh.position.clone(), explodeDir: new THREE.Vector3(0, 1.3, 0) });

    // Part 6 & 7: Twin Auxiliary Data Pylons (Left & Right)
    const pylonGeo = new THREE.BoxGeometry(0.3, 1.8, 0.3);
    const pylonLeft = new THREE.Mesh(pylonGeo, mats.flutedPedestal);
    pylonLeft.position.set(-1.8, 1.3, 0);
    pylonLeft.castShadow = true;
    group.add(pylonLeft);
    parts.push({ mesh: pylonLeft, basePos: pylonLeft.position.clone(), explodeDir: new THREE.Vector3(-0.9, 0, 0) });

    const pylonRight = new THREE.Mesh(pylonGeo, mats.flutedPedestal);
    pylonRight.position.set(1.8, 1.3, 0);
    pylonRight.castShadow = true;
    group.add(pylonRight);
    parts.push({ mesh: pylonRight, basePos: pylonRight.position.clone(), explodeDir: new THREE.Vector3(0.9, 0, 0) });

    // Part 8: Energy Rails Conduit Rings
    const railGeo = new THREE.TorusGeometry(0.8, 0.04, 8, 32);
    const railMesh = new THREE.Mesh(railGeo, mats.radianceGlow);
    railMesh.rotation.x = Math.PI / 2;
    railMesh.position.set(0, 3.4, 0);
    group.add(railMesh);
    parts.push({ mesh: railMesh, basePos: railMesh.position.clone(), explodeDir: new THREE.Vector3(0, 0.7, 0) });

    // Part 9: Contact Shadow
    const shadowGeo = new THREE.PlaneGeometry(5.5, 5.5);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: createContactShadowTexture(),
      transparent: true,
      depthWrite: false,
      opacity: 0.45
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, 0.01, 0);
    group.add(shadowMesh);

    return { group, parts };
  };

  // Re-build active 3D model
  const switchModel = (modelId: ModelId, finish: MaterialFinish) => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Remove existing model
    if (currentModelGroupRef.current) {
      scene.remove(currentModelGroupRef.current);
      currentModelGroupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh;
          m.geometry?.dispose();
        }
      });
      currentModelGroupRef.current = null;
    }

    const mats = getPbrMaterials(finish);
    materialsRef.current = mats;

    let res: { group: THREE.Group; parts: { mesh: THREE.Mesh; basePos: THREE.Vector3; explodeDir: THREE.Vector3 }[] };
    if (modelId === 'thunderbolt') {
      res = buildThunderboltModel(mats);
    } else if (modelId === 'athena_owl') {
      res = buildAthenaOwlModel(mats);
    } else {
      res = buildQuantumCoreModel(mats);
    }

    scene.add(res.group);
    currentModelGroupRef.current = res.group;
    modelPartsRef.current = res.parts;
  };

  // Apply Lighting Environment Preset
  const applyLightingPreset = (preset: LightPreset) => {
    if (!lightsRef.current || !sceneRef.current) return;
    const { keyLight, hemiLight, rimLight } = lightsRef.current;
    const scene = sceneRef.current;

    if (preset === 'olympian') {
      keyLight.color.setHex(0xfffaed);
      keyLight.intensity = 2.4;
      hemiLight.color.setHex(0x60a5fa);
      hemiLight.groundColor.setHex(0x1e293b);
      hemiLight.intensity = 0.8;
      rimLight.color.setHex(0xf59e0b);
      rimLight.intensity = 1.6;
      scene.fog = new THREE.FogExp2(0x090d16, 0.025);
    } else if (preset === 'studio') {
      keyLight.color.setHex(0xffffff);
      keyLight.intensity = 3.0;
      hemiLight.color.setHex(0xffffff);
      hemiLight.groundColor.setHex(0x334155);
      hemiLight.intensity = 1.0;
      rimLight.color.setHex(0xe2e8f0);
      rimLight.intensity = 1.2;
      scene.fog = new THREE.FogExp2(0x0f172a, 0.02);
    } else if (preset === 'midnight') {
      keyLight.color.setHex(0x38bdf8);
      keyLight.intensity = 1.8;
      hemiLight.color.setHex(0x1e1b4b);
      hemiLight.groundColor.setHex(0x020617);
      hemiLight.intensity = 0.6;
      rimLight.color.setHex(0xa855f7);
      rimLight.intensity = 2.2;
      scene.fog = new THREE.FogExp2(0x020617, 0.035);
    } else if (preset === 'golden_hour') {
      keyLight.color.setHex(0xfb923c);
      keyLight.intensity = 2.8;
      hemiLight.color.setHex(0x9333ea);
      hemiLight.groundColor.setHex(0x451a03);
      hemiLight.intensity = 0.9;
      rimLight.color.setHex(0xfef08a);
      rimLight.intensity = 2.0;
      scene.fog = new THREE.FogExp2(0x1a0f1e, 0.022);
    }
  };

  // Interpolate camera to preset
  const setCameraView = (preset: CameraPreset) => {
    if (!cameraRef.current || !controlsRef.current) return;
    playUiSound(580, 'triangle');

    if (preset === 'hero') {
      _targetPos.set(4.5, 3.8, 5.5);
      _targetLook.set(0, 2.2, 0);
    } else if (preset === 'top') {
      _targetPos.set(0.1, 7.5, 0.2);
      _targetLook.set(0, 1.8, 0);
    } else if (preset === 'low') {
      _targetPos.set(3.2, 0.8, 3.8);
      _targetLook.set(0, 2.8, 0);
    } else if (preset === 'macro') {
      _targetPos.set(1.5, 3.0, 1.8);
      _targetLook.set(0, 2.9, 0);
    }
  };

  // Initialize Three.js WebGL Scene (runs once)
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || (window.innerHeight - 64);

    // 1. Scene & Fog (Horizon-matched)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);
    scene.fog = new THREE.FogExp2(0x090d16, 0.025);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4.5, 3.8, 5.5);
    cameraRef.current = camera;
    _targetPos.copy(camera.position);
    _targetLook.set(0, 2.2, 0);

    // 3. Renderer with Studio PBR pipeline & ACESFilmicToneMapping
    const isHeadless = navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isHeadless;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Studio Environment Reflection via RoomEnvironment & PMREMGenerator
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Studio 3-Point Lighting Rig
    // Warm Key Light with tight shadow frustum
    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.4);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.camera.left = -4;
    keyLight.shadow.camera.right = 4;
    keyLight.shadow.camera.top = 4;
    keyLight.shadow.camera.bottom = -4;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    // Cool Sky/Ground HemisphereLight fill
    const hemiLight = new THREE.HemisphereLight(0x60a5fa, 0x1e293b, 0.8);
    scene.add(hemiLight);

    // Rim/Backlight for edge sparkle on metal and glass bevels
    const rimLight = new THREE.DirectionalLight(0xf59e0b, 1.6);
    rimLight.position.set(-6, 5, -5);
    scene.add(rimLight);

    lightsRef.current = { keyLight, hemiLight, rimLight };

    // 6. Damped OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2.0;
    controls.maxDistance = 18.0;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Keep grounded, no clipping beneath floor
    controls.target.set(0, 2.2, 0);
    controlsRef.current = controls;

    // 7. Initial Model Build
    switchModel('thunderbolt', 'gold');

    // Pre-warm shaders
    renderer.compile(scene, camera);

    // 8. Animation & Render Loop with Exponential Damping
    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let lastFpsUpdate = performance.now();

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // FPS counter
      frameCount++;
      if (time - lastFpsUpdate >= 1000) {
        setFps(Math.round((frameCount * 1000) / (time - lastFpsUpdate)));
        frameCount = 0;
        lastFpsUpdate = time;
      }

      // Smooth Camera Damping to target preset
      const dampFactor = 1 - Math.exp(-6 * dt);
      camera.position.lerp(_targetPos, dampFactor);
      controls.target.lerp(_targetLook, dampFactor);
      controls.update();

      // Continuous turntable rotation if enabled
      if (currentModelGroupRef.current && isRotating) {
        currentModelGroupRef.current.rotation.y += dt * 0.4 * rotationSpeed;
      }

      // Exploded View Assembly Damping
      const parts = modelPartsRef.current;
      for (let i = 0; i < parts.length; i++) {
        const item = parts[i];
        _v1.copy(item.basePos).addScaledVector(item.explodeDir, explodedRatio * 1.5);
        item.mesh.position.lerp(_v1, dampFactor);
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // 9. Resize Observer
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || (window.innerHeight - 64);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update model when activeModel or materialFinish changes
  useEffect(() => {
    switchModel(activeModel, materialFinish);
  }, [activeModel, materialFinish]);

  // Update lighting preset
  useEffect(() => {
    applyLightingPreset(lightPreset);
  }, [lightPreset]);

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-slate-950 select-none">
      {/* 3D WebGL Canvas Mount (Isolated from React UI re-renders) */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Spec & Telemetry Badge (Minimal, Top-Left) */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 shadow-xl pointer-events-auto">
        <div className="flex items-center gap-1.5 font-bold text-amber-400">
          <Sparkles className="w-4 h-4" />
          <span>Three.js PBR Studio</span>
        </div>
        <span className="text-slate-600">|</span>
        <span className="font-mono text-slate-400">{fps} FPS</span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-300 font-medium">
          {activeModel === 'thunderbolt' && 'The Celestial Thunderbolt (10-Part Procedural)'}
          {activeModel === 'athena_owl' && "Athena's Clockwork Automaton (11-Part Procedural)"}
          {activeModel === 'quantum_core' && 'Empire OS Quantum Core (9-Part Procedural)'}
        </span>
      </div>

      {/* Top Right Quick Actions: Audio & Reset View */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
        <button
          onClick={() => {
            setSoundEnabled(!soundEnabled);
            playUiSound(400, 'square');
          }}
          className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 p-2 rounded-lg transition-all"
          title={soundEnabled ? 'Disable Synthesizer Audio' : 'Enable Synthesizer Audio'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        <button
          onClick={() => {
            setCameraView('hero');
            setExplodedRatio(0);
          }}
          className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 p-2 rounded-lg transition-all flex items-center gap-1.5 text-xs font-semibold"
          title="Reset Camera & Assembly"
        >
          <RotateCcw className="w-4 h-4 text-sky-400" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Collapsible Unified Bottom Control Dock (<= 15% Viewport Footprint, Solid Surfaces, No backdrop-filter over WebGL) */}
      <div
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[94vw] max-w-4xl transition-all duration-300 ease-out pointer-events-auto ${
          isCollapsed ? 'translate-y-[calc(100%-36px)]' : 'translate-y-0'
        }`}
      >
        {/* Collapse / Expand Tab Toggle */}
        <div className="flex justify-center -mb-px">
          <button
            onClick={() => {
              setIsCollapsed(!isCollapsed);
              playUiSound(isCollapsed ? 620 : 440, 'triangle');
            }}
            className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-amber-400 text-xs font-semibold px-4 py-1.5 rounded-t-lg flex items-center gap-1.5 transition-colors shadow-2xl"
          >
            {isCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
                <span>▴ Show 3D Studio Controls</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                <span>▾ Cinema / Zen Mode</span>
              </>
            )}
          </button>
        </div>

        {/* Dock Surface (Solid rgba slate surface to prevent WebGL GPU stalls) */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-3.5 shadow-2xl text-xs text-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
            {/* 1. Subject Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1">
                <Box className="w-3 h-3 text-amber-400" />
                <span>Procedural Hero Subject</span>
              </label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'thunderbolt', label: 'Thunderbolt' },
                  { id: 'athena_owl', label: 'Owl Automaton' },
                  { id: 'quantum_core', label: 'Quantum Core' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveModel(item.id as ModelId);
                      playUiSound(520, 'sine');
                    }}
                    className={`py-1.5 px-2 rounded-lg text-center font-medium truncate transition-all ${
                      activeModel === item.id
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                        : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Exploded Assembly Slider & Kinematics */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3 text-sky-400" />
                  <span>Exploded View</span>
                </span>
                <span className="font-mono text-sky-400">{Math.round(explodedRatio * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={explodedRatio}
                onChange={(e) => setExplodedRatio(parseFloat(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
              />
              <div className="flex items-center justify-between pt-0.5">
                <button
                  onClick={() => setIsRotating(!isRotating)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 ${
                    isRotating ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isRotating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isRotating ? 'Turntable Active' : 'Turntable Paused'}</span>
                </button>
                <button
                  onClick={() => setRotationSpeed(rotationSpeed === 1 ? 2 : 1)}
                  className="text-[10px] font-mono text-slate-400 hover:text-slate-200"
                >
                  {rotationSpeed}x Speed
                </button>
              </div>
            </div>

            {/* 3. PBR Material Finish & Lighting Studio */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1">
                <Sun className="w-3 h-3 text-amber-400" />
                <span>PBR Finish & Lighting</span>
              </label>
              <div className="flex items-center gap-1">
                {[
                  { id: 'gold', label: '24K Gold', color: '#f5ba2c' },
                  { id: 'obsidian', label: 'Obsidian', color: '#111317' },
                  { id: 'marble', label: 'Marble', color: '#e2e8f0' },
                  { id: 'titanium', label: 'Titanium', color: '#94a3b8' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setMaterialFinish(m.id as MaterialFinish);
                      playUiSound(480, 'sine');
                    }}
                    title={m.label}
                    className={`flex-1 py-1 rounded text-[10px] font-semibold border flex items-center justify-center gap-1 transition-all ${
                      materialFinish === m.id
                        ? 'border-amber-400 bg-amber-500/15 text-amber-300'
                        : 'border-slate-800 bg-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                    <span className="truncate">{m.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-1 pt-0.5">
                {[
                  { id: 'olympian', label: 'Olympus' },
                  { id: 'studio', label: 'Studio' },
                  { id: 'midnight', label: 'Midnight' },
                  { id: 'golden_hour', label: 'Sunset' }
                ].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => {
                      setLightPreset(l.id as LightPreset);
                      playUiSound(540, 'triangle');
                    }}
                    className={`py-0.5 rounded text-[9px] font-medium transition-all ${
                      lightPreset === l.id
                        ? 'bg-sky-500/30 text-sky-300 border border-sky-500/50'
                        : 'bg-slate-800/50 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Camera View Angles */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1">
                <Compass className="w-3 h-3 text-sky-400" />
                <span>Camera Framing Presets</span>
              </label>
              <div className="grid grid-cols-2 gap-1">
                {[
                  { id: 'hero', label: 'Cinematic 45°' },
                  { id: 'top', label: 'Top Blueprint' },
                  { id: 'low', label: 'Heroic Low' },
                  { id: 'macro', label: 'Macro Bevel' }
                ].map((cam) => (
                  <button
                    key={cam.id}
                    onClick={() => {
                      setCameraPreset(cam.id as CameraPreset);
                      setCameraView(cam.id as CameraPreset);
                    }}
                    className={`py-1 px-2 rounded-lg text-[10px] font-medium text-center transition-all ${
                      cameraPreset === cam.id
                        ? 'bg-indigo-600 text-white font-bold shadow'
                        : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    {cam.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
