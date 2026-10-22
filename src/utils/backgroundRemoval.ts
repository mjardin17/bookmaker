/**
 * Client-Side Intelligent Background Removal Engine
 * Uses HTML5 Canvas pixel manipulation:
 * - Edge & boundary sample color clustering
 * - Color Euclidean distance / Delta-E tolerance thresholding
 * - Boundary flood-fill to preserve internal colors while removing outer backdrop
 * - Edge feathering and antialiasing
 */

export interface BackgroundRemovalOptions {
  tolerance?: number; // 0 to 100 (default 30)
  featherRadius?: number; // 0 to 10 (default 2)
  targetColor?: { r: number; g: number; b: number } | null; // specific color clicked, or null for auto-detect edges
  preserveInterior?: boolean; // flood fill from edges only
}

/**
 * Remove background from an HTMLImageElement or data URL using Canvas
 */
export async function removeImageBackground(
  imageSource: string | HTMLImageElement,
  options: BackgroundRemovalOptions = {}
): Promise<string> {
  const tolerance = (options.tolerance ?? 32) * 2.55; // convert 0-100 to 0-255 scale
  const feather = options.featherRadius ?? 2;
  const preserveInterior = options.preserveInterior ?? true;

  // Load image if string provided
  let img: HTMLImageElement;
  if (typeof imageSource === 'string') {
    img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.crossOrigin = 'anonymous';
      i.onload = () => resolve(i);
      i.onerror = (e) => reject(new Error('Failed to load image for background removal'));
      i.src = imageSource;
    });
  } else {
    img = imageSource;
  }

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width || 800;
  canvas.height = img.naturalHeight || img.height || 800;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not create canvas 2d context');

  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const w = canvas.width;
  const h = canvas.height;

  // 1. Determine key background colors to remove
  let bgColors: Array<{ r: number; g: number; b: number }> = [];

  if (options.targetColor) {
    bgColors.push(options.targetColor);
  } else {
    // Sample corner pixels and edge perimeter to detect background
    const samplePoints = [
      [2, 2], [w - 3, 2], [2, h - 3], [w - 3, h - 3],
      [Math.floor(w / 2), 2], [Math.floor(w / 2), h - 3],
      [2, Math.floor(h / 2)], [w - 3, Math.floor(h / 2)]
    ];

    samplePoints.forEach(([x, y]) => {
      const idx = (y * w + x) * 4;
      bgColors.push({
        r: data[idx],
        g: data[idx + 1],
        b: data[idx + 2]
      });
    });
  }

  // Helper color distance
  const colorDist = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) => {
    const dr = r1 - r2;
    const dg = g1 - g2;
    const db = b1 - b2;
    // Perceptual weighting: 0.3 R, 0.59 G, 0.11 B
    return Math.sqrt(0.3 * dr * dr + 0.59 * dg * dg + 0.11 * db * db);
  };

  const isBgMatch = (r: number, g: number, b: number) => {
    return bgColors.some(bg => colorDist(r, g, b, bg.r, bg.g, bg.b) <= tolerance);
  };

  // 2. Flood Fill from boundaries if preserveInterior is true
  if (preserveInterior) {
    const isBackground = new Uint8Array(w * h);
    const queue: number[] = [];

    // Seed edges
    for (let x = 0; x < w; x++) {
      // Top edge
      const topIdx = (0 * w + x) * 4;
      if (isBgMatch(data[topIdx], data[topIdx + 1], data[topIdx + 2])) {
        isBackground[x] = 1;
        queue.push(x);
      }
      // Bottom edge
      const btmY = h - 1;
      const btmIdx = (btmY * w + x) * 4;
      if (isBgMatch(data[btmIdx], data[btmIdx + 1], data[btmIdx + 2])) {
        const p = btmY * w + x;
        isBackground[p] = 1;
        queue.push(p);
      }
    }

    for (let y = 0; y < h; y++) {
      // Left edge
      const leftIdx = (y * w + 0) * 4;
      if (isBgMatch(data[leftIdx], data[leftIdx + 1], data[leftIdx + 2])) {
        const p = y * w;
        if (!isBackground[p]) {
          isBackground[p] = 1;
          queue.push(p);
        }
      }
      // Right edge
      const rightX = w - 1;
      const rightIdx = (y * w + rightX) * 4;
      if (isBgMatch(data[rightIdx], data[rightIdx + 1], data[rightIdx + 2])) {
        const p = y * w + rightX;
        if (!isBackground[p]) {
          isBackground[p] = 1;
          queue.push(p);
        }
      }
    }

    // BFS Flood Fill
    let head = 0;
    while (head < queue.length) {
      const p = queue[head++];
      const px = p % w;
      const py = Math.floor(p / w);

      // Check 4 neighbors
      const neighbors = [
        px > 0 ? p - 1 : -1,
        px < w - 1 ? p + 1 : -1,
        py > 0 ? p - w : -1,
        py < h - 1 ? p + w : -1
      ];

      for (let i = 0; i < 4; i++) {
        const n = neighbors[i];
        if (n !== -1 && !isBackground[n]) {
          const nIdx = n * 4;
          if (isBgMatch(data[nIdx], data[nIdx + 1], data[nIdx + 2])) {
            isBackground[n] = 1;
            queue.push(n);
          }
        }
      }
    }

    // Apply alpha mask
    for (let i = 0; i < w * h; i++) {
      if (isBackground[i]) {
        data[i * 4 + 3] = 0; // Transparent
      }
    }
  } else {
    // Global color threshold
    for (let i = 0; i < w * h; i++) {
      const idx = i * 4;
      if (isBgMatch(data[idx], data[idx + 1], data[idx + 2])) {
        data[idx + 3] = 0;
      }
    }
  }

  // 3. Simple edge feathering for smooth antialiasing
  if (feather > 0) {
    const alphaCopy = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) alphaCopy[i] = data[i * 4 + 3];

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = y * w + x;
        if (alphaCopy[idx] > 0) {
          // Check if neighboring transparent pixel exists
          const hasTransparentNeighbor = 
            alphaCopy[idx - 1] === 0 || 
            alphaCopy[idx + 1] === 0 || 
            alphaCopy[idx - w] === 0 || 
            alphaCopy[idx + w] === 0;

          if (hasTransparentNeighbor) {
            // Soften alpha edge
            data[idx * 4 + 3] = Math.floor(alphaCopy[idx] * 0.65);
          }
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * Fallback to call server-side background removal if available
 */
export async function removeBackgroundServer(imageBase64: string): Promise<string> {
  const res = await fetch('/api/remove-background', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64 })
  });

  if (!res.ok) {
    throw new Error(`Server returned status ${res.status}`);
  }
  const data = await res.json();
  if (data.success && data.cutoutImageUrl) {
    return data.cutoutImageUrl;
  }
  throw new Error(data.error || 'Server failed to remove background');
}
