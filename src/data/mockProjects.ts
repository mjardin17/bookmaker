import { PublishingProject } from '../types/storyforge';

export const INITIAL_PROJECTS: PublishingProject[] = [
  {
    id: 'sf-proj-001',
    name: 'The Chrono-Guardians of Aethelgard',
    goal: 'Build an epic 10-chapter middle-grade fantasy series introducing quantum physics concepts through time-traveling apprentices.',
    targetAge: 'Middle Grade (8-12y)',
    genre: 'Fantasy',
    theme: 'Courage, Scientific Curiosity, and Moral Responsibility',
    mode: 'professional',
    currentStep: 7,
    status: 'Drafting',
    createdAt: '2025-02-15T10:00:00Z',
    updatedAt: '2025-02-28T14:30:00Z',

    manuscript: {
      title: 'The Chrono-Guardians of Aethelgard',
      subtitle: 'Book 1: The Broken Sundial of Clockwork Keep',
      targetAge: 'Middle Grade (8-12y)',
      genre: 'Fantasy',
      theme: 'Scientific Curiosity & Time Travel Ethics',
      educationalGoals: [
        'Understanding Cause & Effect in History',
        'Basic Concepts of Relativity & Time Dilations',
        'Critical Problem Solving in High-Stakes Situations'
      ],
      wordCountTotal: 24500,
      readingLevelGrade: 'Grade 5.2 (Lexile 780L)',
      synopsis: 'When 12-year-old horologist apprentice Leo accidentally triggers an ancient brass chronometer, he uncovers a hidden dimension beneath Clockwork Keep where time flows backward. Alongside Kael, a swift-talking rogue from the 18th century, Leo must repair the Sundial of Aethelgard before the Shadow Paradox erases history.',
      chapters: [
        {
          id: 'ch-1',
          chapterNumber: 1,
          title: 'The Brass Gear in the Basement',
          synopsis: 'Leo discovers the glowing chronometer behind a false bookshelf in his grandfather workshop.',
          content: `The ticking in Grandfather Silas's workshop wasn't normal. It didn't follow the steady, comforting rhythm of the pendulum clocks lining the pine walls. Instead, it skipped—a double-thump like a startled heart.

Leo set down his brass tweezers, wiping oil-stained fingers on his leather apron. He stepped deeper into the vault beneath Clockwork Keep. Dust motes danced in the amber light filtering through the high iron-grated window. 

"Silas told you to leave the subterranean locks alone, didn't he?" a voice purred from the rafters.

Leo looked up. A silver-furred mechanical owl perched on a beam, glass eyes ticking as they zoomed in on Leo's face.

"Barnaby, if I don't fix the temporal regulator before sundown, the village clock will strike thirteen," Leo replied, crouching near the brass floorboard that had started humming three days ago.

He pried open the oak floor. Beneath lay not stone foundations, but an intricate lattice of gear-work stretching into darkness. At the center rested a sundial made of dark celestial metal, its shadow pointing not toward the sun, but toward Leo himself.`,
          wordCount: 2150,
          illustrationBrief: {
            sceneDescription: 'Young boy in leather apron leaning over open floorboards glowing with golden gearwork in a dusty clockmaker vault.',
            visualFocus: 'Glowing brass gears, intricate sundial shadow, workshop dust motes, brass mechanical owl on rafters.',
            midjourneyPrompt: 'Cinematic 8k fantasy illustration, young 12yo boy with dark hair and brass goggles around neck kneeling over glowing clockwork floor in a dusty Victorian workshop, silver mechanical owl overhead, warm amber volumetric lighting --ar 16:9 --v 6.1',
            dallePrompt: 'Detailed storybook illustration of a young clockmaker boy discovering glowing brass gears hidden beneath workshop floorboards, warm lighting, fantasy style.'
          },
          readabilityScore: 84,
          status: 'Approved',
          authorFormulaApplied: 'james-patterson',
          povCharacter: 'Leo (Lead Horologist Apprentice)',
          tickingClockNote: 'T-minus 3 hours before village clock strikes thirteen',
          cliffhangerHook: 'At the center rested a sundial made of dark celestial metal, its shadow pointing not toward the sun, but toward Leo himself.',
          attachedVideoUrl: '/output_books/little_zeus_gets_his_thunderbolt/videos/ch001/chapter_1_video.mp4',
          attachedAudioTitle: 'Clockwork Keep Rhythmic Theme (Lyria Pro)',
          pattersonCompliance: {
            overallScore: 96,
            overallGrade: 'A+ (Patterson Masterpiece)',
            wordCountScore: {
              count: 850,
              targetMin: 600,
              targetMax: 1100,
              pass: true,
              feedback: 'Complies with Patterson micro-chapter target (850 words). Rapid dopamine loop satisfied.'
            },
            cliffhangerAudit: {
              detected: true,
              intensity: 95,
              cliffhangerSentence: 'At the center rested a sundial made of dark celestial metal, its shadow pointing not toward the sun, but toward Leo himself.',
              tensionLevel: 'Heart-Stopping',
              feedback: 'Perfect Zeigarnik cliffhanger ending mid-anomaly. Readers compelled to turn page.'
            },
            fluffDetection: {
              fluffPercentage: 4,
              fillerSentencesFound: [],
              propulsionRating: 96,
              verdict: 'Zero wallpaper fluff. Rapid action propulsion with high sensory immediacy.'
            },
            pacingVelocity: 95,
            povIronyRating: 90,
            pattersonRulesFollowed: [
              'Rule 2: Micro-chapter under 1,000 words',
              'Rule 3: Zeigarnik Cliffhanger Mandate',
              'Rule 5: Ticking Clock Deadline',
              'Rule 6: Zero Fluff Propulsion',
              'Rule 7: In Media Res Sensory Opening'
            ],
            recommendations: [
              'Alternate in Chapter 2 to the Antagonist perspective in the Clockwork Keep Spire.'
            ]
          }
        },
        {
          id: 'ch-2',
          chapterNumber: 2,
          title: 'The Backward River',
          synopsis: 'Leo steps through the Temporal Rift into a version of Clockwork Keep where water flows uphill.',
          content: `The air turned crisp and tasted faintly of ozone and crushed peppermint. Leo blinked as the darkness dissolved into an impossible sky shaded violet and gold. 

Beside him, the River Aethel flowed not down from the mist-shrouded peaks of Mount Aethelgard, but upward toward the summit, carrying silver fish swimming backward against gravity.

"Fascinating, isn't it?" said a boy sitting atop a copper fence post, tossing an apple from hand to hand. He wore a velvet coat with tarnished brass buttons and a tricorn hat tilted precariously. "First time slipping through a Chrono-Rift?"

Leo pulled out his pocket sundial. The shadow was spinning counterclockwise. "Who are you? And why is gravity obeying the wrong laws?"

The stranger hopped down with a flair. "I am Kaelen Vance, late of the Royal Navy—1782 edition. And gravity isn't wrong, mate. Time is simply retracing its footsteps."`,
          wordCount: 2380,
          illustrationBrief: {
            sceneDescription: 'A glowing violet sky over a river flowing uphill toward a floating mountain citadel with two boys talking.',
            visualFocus: 'Upward-flowing river with silvery mist, violet-gold sky, copper fences, clockwork Citadel in background.',
            midjourneyPrompt: 'Epic fantasy landscape, a crystal river flowing backward up a mountain, floating clockwork towers in distance, violet and golden twilight sky, storybook art style --ar 16:9 --v 6.1',
            dallePrompt: 'Fantasy illustration of a magical river flowing uphill towards a floating castle in a twilight sky.'
          },
          readabilityScore: 82,
          status: 'Polished'
        }
      ]
    },

    worldBible: {
      universeName: 'The Aethelgard Chronoverse',
      settingOverview: 'A continent built atop ancient colossal clockwork engines buried underground during the First Cataclysm.',
      lore: 'Three hundred years ago, the Great Chronometer was built by Master Aethelgard to stabilize temporal streams. When the Sundial cracked, time fractured into pockets called Rifts.',
      magicOrTechSystem: 'Chrono-Mechanics: Resonance gears forged from Aetherite ore that manipulate local temporal velocity.',
      timeline: [
        { yearOrEra: 'Era 0', event: 'The First Cataclysm fractures linear time into local chronometer bubbles.' },
        { yearOrEra: 'Era 142', event: 'Clockwork Keep established over the Central Temporal Nexus.' },
        { yearOrEra: 'Era 300 (Present)', event: 'The Sundial shadow reverses direction, triggering the Shadow Paradox.' }
      ],
      locations: [
        { name: 'Clockwork Keep', description: 'A massive fortress housing hundreds of giant brass pendulums.', significance: 'Nexus of continental time flow.' },
        { name: 'The Backward River', description: 'A waterway flowing upward into Mount Aethelgard.', significance: 'Main conduit for temporal anomaly travel.' },
        { name: 'The Void Forge', description: 'An underground labyrinth where rogue temporal blacksmiths forge illegal chronometers.', significance: 'Antagonist hideout.' }
      ],
      factionsOrPolitics: 'The Order of the Sundial (Defenders) vs. The Entropy Syndicate (Rogue Time-Alchemists).',
      religionsOrBeliefs: 'Reverence for the Grand Pendulum and the Eternal Tick.',
      architectureAndCulture: 'Steampunk Victorian mixed with ancient brass monuments and floating astrolabes.',
      languagesAndIdioms: ['Tik-tok (slang for quick action)', 'Before the stroke (warning of danger)', 'Gear-bound (promise)'],
      rulesOfUniverse: [
        'Mass cannot exist in two identical time points simultaneously without causing temporal friction.',
        'Aetherite chronometers require manual calibration at sunrise.',
        'Reversing time by more than 12 hours causes localized memory haze.'
      ]
    },

    characters: [
      {
        id: 'char-1',
        name: 'Leo Pendelton',
        role: 'protagonist',
        biography: 'A 12-year-old apprentice horologist at Clockwork Keep with an innate instinct for spatial gear-ratios and spatial anomalies.',
        personalityTraits: ['Analytical', 'Cautious', 'Deeply Loyal', 'Curious under pressure'],
        dialogueStyle: {
          tone: 'Observant and precise, uses mechanical metaphors.',
          catchphrases: ['Check the Escapement!', 'Every gear has its place.'],
          vocabularyComplexity: 'Moderate'
        },
        goals: 'Repair the Sundial of Aethelgard and rescue his grandfather from the Temporal Void.',
        weaknesses: 'Overthinks in battle, hesitant to take impulsive risks.',
        visualDNA: {
          ethnicityOrSpecies: 'Human (Aethelgardian)',
          hairColorStyle: 'Messy dark brown hair with copper streaks',
          eyeColor: 'Hazel green with flecks of gold',
          distinctiveFeatures: 'Brass magnifying loupe resting over his forehead',
          attire: 'Leather artisan apron over a dark blue linen shirt, utility toolbelt with brass tweezers and wrenches',
          overallVibe: 'Intelligent, earnest young inventor'
        },
        characterArc: {
          startingState: 'Reluctant apprentice who fears leaving the safety of his workshop.',
          catalyst: 'Grandfather Silas vanishes through the subterranean Sundial.',
          climaxShift: 'Leo trusts his intuition over rigid calculations to recalibrate the Sundial in mid-air.',
          endingState: 'Confident Master Chrono-Guardian leading the protection of the realm.'
        },
        relationships: [
          { targetCharacterId: 'char-2', targetCharacterName: 'Kaelen Vance', relationshipType: 'ally', notes: 'Unlikely partnership balancing Leo logic with Kael recklessness.' },
          { targetCharacterId: 'char-3', targetCharacterName: 'Baroness Chronos', relationshipType: 'nemesis', notes: 'Rogue time-alchemist seeking to shatter the Sundial.' }
        ],
        expressions: ['Focused squint through magnifying loupe', 'Gasp of revelation', 'Determined jaw-clench'],
        futureDevelopment: 'Will unlock the ability to sense temporal vibrations without a brass chronometer.'
      },
      {
        id: 'char-2',
        name: 'Kaelen "Kael" Vance',
        role: 'deuteragonist',
        biography: 'A 14-year-old midshipman from 1782 who accidentally fell into a Chrono-Rift during a storm at sea.',
        personalityTraits: ['Bold', 'Charismatic', 'Impulsive', 'Surprisingly observant'],
        dialogueStyle: {
          tone: 'Nautical 18th-century slang with energetic flair.',
          catchphrases: ['By Neptune’s compass!', 'Full sail into the storm!'],
          vocabularyComplexity: 'Moderate'
        },
        goals: 'Find a way back to his ship while ensuring Leo survives the Entropy Syndicate.',
        weaknesses: 'Disregards safety instructions, jumps into fights without a plan.',
        visualDNA: {
          ethnicityOrSpecies: 'Human (Anglo-Maritime)',
          hairColorStyle: 'Wavy wind-blown blonde hair tied in a short queue',
          eyeColor: 'Sea blue',
          distinctiveFeatures: 'Faint saber scar across left cheek',
          attire: 'Tarnished navy blue coat with brass buttons, high leather boots, sea compass pendant',
          overallVibe: 'Dashing young rogue adventurer'
        },
        characterArc: {
          startingState: 'Lone adventurer looking only for an escape back to his own era.',
          catalyst: 'Leo saves Kael from the Shadow Paradox.',
          climaxShift: 'Kael sacrifices his chance to return home to defend Clockwork Keep.',
          endingState: 'Proud member of the Chrono-Guard, protecting all eras.'
        },
        relationships: [
          { targetCharacterId: 'char-1', targetCharacterName: 'Leo Pendelton', relationshipType: 'ally', notes: 'Brotherly bond forged in combat.' }
        ],
        expressions: ['Crooked grin', 'Daring wink', 'Stiff military posture when challenged'],
        futureDevelopment: 'Will master navigating the Backward River with celestial navigation tools.'
      }
    ],

    illustrationGuide: {
      styleGuideName: 'Steampunk Storybook Realism',
      artStyleDescription: 'Rich volumetric amber and teal lighting, intricate brass and mechanical detail, painterly textures with expressive character faces inspired by classic 19th century children’s book illustrations.',
      colorPalette: ['#1e293b', '#d97706', '#0284c7', '#78350f', '#f59e0b', '#0f172a'],
      characterSheets: [
        {
          characterId: 'char-1',
          characterName: 'Leo Pendelton',
          visualDNA: 'Messy dark hair, brass loupe on forehead, hazel green eyes, leather clockmaker apron, brass toolbelt',
          modelPrompt: 'Character sheet of Leo Pendelton, 12 year old boy clockmaker, multiple angles, front view, side profile, expression sheet, steampunk workshop, warm amber lighting --ar 16:9 --v 6.1'
        }
      ],
      scenePrompts: [
        {
          sceneId: 'sc-1',
          chapterNumber: 1,
          description: 'Leo discovering the subterranean glowing sundial in the vault',
          midjourneyPrompt: 'Cinematic wide shot of a dusty Victorian clockmaker vault, 12yo boy opening floorboards to reveal glowing golden clockwork gears, volumetric amber god-rays, hyperdetailed --ar 16:9'
        }
      ],
      coverBrief: {
        title: 'The Chrono-Guardians of Aethelgard',
        subtitle: 'The Broken Sundial of Clockwork Keep',
        coverArtPrompt: 'Book cover illustration, two adventurous boys standing atop a giant brass gear overlooking a floating clockwork citadel at sunset, golden hour lighting, bold fantasy title typography space --ar 2:3 --v 6.1',
        typographyStyle: 'Embossed Serif with brass filigree corners and subtle gear ornaments'
      },
      storyboardGuides: [
        { panelNumber: 1, cameraAngle: 'Low angle shot looking up at Leo', actionDescription: 'Leo holds his brass tweezers in shock as the gearwork begins to hum.' },
        { panelNumber: 2, cameraAngle: 'Wide establishing shot of the Backward River', actionDescription: 'Water flows uphill toward the floating citadel under a violet sky.' }
      ]
    },

    scorecard: {
      overallScore: 92,
      readabilityIndex: 84,
      fleschKincaidScore: 5.2,
      lexileEstimate: '780L',
      emotionalImpactScore: 90,
      educationalScaffoldingScore: 95,
      characterConsistencyScore: 94,
      pacingScore: 88,
      franchisePotential: 96,
      grammarAlerts: [],
      continuityAlerts: ['Ensure Kael’s sea compass is noted as non-magnetic inside Chrono-Rifts in Chapter 4.'],
      marketReadiness: 'Masterpiece Standard'
    },

    publishingMetadata: {
      kdpTitle: 'The Chrono-Guardians of Aethelgard: The Broken Sundial of Clockwork Keep',
      kdpSubtitle: 'An Epic Time-Travel Adventure for Kids Ages 8-12',
      authorName: 'E. P. Aethelgard',
      penName: 'Prof. Silas Quill',
      seriesName: 'The Chrono-Guardians',
      seriesVolume: 1,
      bisacCategories: [
        'JUVENILE FICTION / Action & Adventure / General',
        'JUVENILE FICTION / Fantasy & Magic',
        'JUVENILE FICTION / Science & Technology'
      ],
      amazonKeywords: [
        'time travel book for kids 8-12',
        'steampunk fantasy middle grade',
        'stem science fiction chapter book',
        'clockwork adventure book boys girls',
        'action adventure magic gears',
        'books like Percy Jackson and Harry Potter',
        'interactive learning adventure series'
      ],
      bookDescriptionHtml: `<b>When time itself breaks, only the bravest clockmakers can set it right!</b><br/><br/>Twelve-year-old Leo Pendelton thought he was just an ordinary apprentice in Clockwork Keep. But when an ancient subterranean sundial begins spinning backward, Leo uncovers a secret dimension where rivers flow uphill and time travels in reverse.<br/><br/>Joined by Kael Vance, a dashing 18th-century midshipman trapped in the present, Leo must solve the riddle of the Broken Sundial before the Shadow Paradox erases history forever.<br/><br/><b>Packed with STEM concepts, thrilling temporal puzzles, and unforgettable heroes! Perfect for fans of Percy Jackson and The Invention of Hugo Cabret.</b>`,
      isbn: '978-1-987654-32-1',
      printFormat: {
        trimSize: '5x8',
        paperType: 'Cream',
        bleed: false,
        coverFinish: 'Matte'
      },
      priceUSD: 12.99,
      estimatedRoyaltyPerSaleUSD: 6.85
    },

    marketingPack: {
      amazonBlurb: 'An epic STEM fantasy adventure where time travel meets clockwork magic!',
      tagline: 'When the sundial strikes thirteen, history begins to unspool...',
      socialPosts: [
        { platform: 'Instagram', caption: 'Step into Clockwork Keep! 🕰️✨ Discover the brand new middle-grade fantasy series where time flows backward and science meets magic. #MiddleGradeReads #STEMBooks #FantasyBooks', hashtags: ['#MiddleGradeBooks', '#STEMBooks', '#TimeTravel', '#ClockworkFantasy'] },
        { platform: 'TikTok / Reels', caption: 'What if water started flowing UPHILL? 🌊⏰ Leo Pendelton just opened the subterranean vault of Clockwork Keep...', hashtags: ['#BookTok', '#MiddleGrade', '#StoryForge', '#BookTrailer'] }
      ],
      emailCampaigns: [
        { stage: 'Pre-Launch Announcement', subject: '🕰️ Something impossible is happening at Clockwork Keep...', body: 'Dear Reader, The clocks in Aethelgard have stopped ticking forward. Get ready for an adventure beyond time...' }
      ],
      pressRelease: 'EMPIRE OS PUBLISHING ANNOUNCES REVOLUTIONARY MIDDLE-GRADE SERIES "THE CHRONO-GUARDIANS OF AETHELGARD"',
      blogArticles: [
        { title: 'How to Teach Kids Relativity Through Steampunk Fantasy', outline: '1. Introduce temporal dilation through clockwork mechanisms. 2. Engaging kids with interactive puzzles. 3. Questions for classroom reading circles.' }
      ],
      launchTimeline: [
        { day: 'Day -14', task: 'Send ARC review copies to top middle-grade book bloggers & teachers.' },
        { day: 'Day 0', task: 'Official KDP Amazon launch, trigger social media campaign.' }
      ]
    },

    videoPack: {
      narrationVoice: 'Prof. Silas Quill (Warm British Storyteller Voice)',
      sampleScriptText: 'The ticking in Grandfather Silas workshop was not normal. It skipped—a double-thump like a startled heart...',
      storyboardPrompts: [
        { timecode: '0:00 - 0:05', visualPrompt: 'Close up on brass gears turning slowly in twilight glow', audioText: 'In a world driven by clockwork, time was supposed to move forward...' },
        { timecode: '0:05 - 0:12', visualPrompt: 'Leo holding glowing chronometer in subterranean vault', audioText: 'Until the Sundial of Aethelgard cracked.' }
      ],
      tiktokReelsScripts: [
        { hook: 'POV: You find a secret door under your grandfather floorboards...', script: 'Show brass gear animation -> Cut to glowing river -> Reveal book cover!', visualNotes: 'Fast paced cuts with magical chime sound effect.' }
      ],
      trailerScript: 'A cinematic 60-second book trailer featuring orchestral clockwork music, voiceover narration, and epic Midjourney artwork passes.'
    },

    merchPack: {
      tShirtPrompts: [
        { title: 'Clockwork Keep Apprentice Tee', designPrompt: 'Minimalist brass gear graphic with the quote "Every Gear Has Its Place", distressed vintage print.' }
      ],
      mugPrompts: [
        { title: 'Backward River Mug', designPrompt: 'Color changing mug that reveals the floating clockwork citadel when hot liquid is poured.' }
      ],
      activityPages: [
        { title: 'The Sundial Gear Maze', type: 'maze', promptOrText: 'Help Leo navigate through the gearwork labyrinth to reach the Aetherite Sundial!' },
        { title: 'Aethelgard Coloring Sheet', type: 'coloring', promptOrText: 'Detailed line-art of Barnaby the mechanical owl perched on a giant brass pendulum.' }
      ],
      printableTeacherGuide: 'Comprehensive 12-page STEM & Language Arts Discussion Guide aligned with Common Core Grade 4-6 standards.'
    },

    analytics: {
      projectedSalesMonth1: 1450,
      projectedRoyaltiesMonth1USD: 9932.50,
      readThroughRatePercent: 88,
      targetAudienceMatchPercent: 96,
      mockReviews: [
        { reviewerName: 'TeacherSara_Reads', rating: 5, reviewText: 'My 5th graders were captivated from chapter 1! The STEM integration is seamless and the characters are so endearing.', verifiedPurchase: true },
        { reviewerName: 'FantasyFanatic99', rating: 5, reviewText: 'The worldbuilding of Aethelgard is brilliant. Reminds me of Hugo Cabret mixed with Golden Compass!', verifiedPurchase: true }
      ]
    },

    councilDebate: [
      {
        id: 'cd-1',
        specialistId: 'prof-quill',
        specialistName: 'Professor Quill',
        specialistRole: 'Dean of Literature',
        avatar: '🧙‍♂️',
        color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
        timestamp: '10:14 AM',
        type: 'analysis',
        content: 'The narrative arc in Chapter 1 sets up high stakes effectively. The ticking skipping motif anchors the reader immediately into the mechanical temporal anomaly.',
        ratingScore: 94
      },
      {
        id: 'cd-2',
        specialistId: 'lady-ink',
        specialistName: 'Lady Ink',
        specialistRole: 'Dialogue Specialist',
        avatar: '✒️',
        color: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
        timestamp: '10:16 AM',
        type: 'critique',
        content: 'Kaelen’s 18th-century nautical phrasing in Chapter 2 contrasts sharply with Leo’s structured mechanical terms. This dialogue duality reinforces their character origins without exposition dumps.',
        ratingScore: 92
      },
      {
        id: 'cd-3',
        specialistId: 'prof-curiosity',
        specialistName: 'Professor Curiosity',
        specialistRole: 'Dean of Children’s Wonder',
        avatar: '✨',
        color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
        timestamp: '10:18 AM',
        type: 'approval',
        content: 'The Backward River visual is pure magic. It satisfies the core curiosity requirement for Middle Grade readers while stealthily introducing physics principles!',
        ratingScore: 96
      }
    ],

    cartoonEpisodes: [
      {
        id: 'ep-chrono-01',
        title: 'Episode 1: The Broken Tick-Tock!',
        chapterId: 'ch-1',
        chapterTitle: 'Chapter 1: The Brass Gear in the Basement',
        animationStyle: '2d-classic',
        aspectRatio: '16:9',
        totalDuration: 28,
        fps: 24,
        voiceNarrator: 'Pip the Toon Narrator',
        bgmTrack: 'Upbeat Cartoon Bounce',
        generatedAt: '2025-02-28T15:00:00Z',
        scenes: [
          {
            id: 'sc-c1-1',
            sceneNumber: 1,
            title: 'The Ticking Workshop Mystery',
            duration: 7,
            visualDescription: 'Warm golden light streams through high windows into the dusty Victorian clockmaker workshop. Ticking grandfather clocks line the wooden walls as Leo examines vibrating floorboards.',
            cameraMotion: 'zoom-in',
            transition: 'iris-wipe',
            backgroundTheme: 'workshop_vault',
            ambientParticles: 'floating_gears',
            visualPrompt: 'Cartoon illustration of a cozy Victorian clockmaker workshop filled with ticking grandfather clocks, glowing brass gears on the floor, colorful warm lighting, Saturday morning cartoon style.',
            characters: [
              {
                characterId: 'char-1',
                characterName: 'Leo',
                positionX: 38,
                positionY: 66,
                scale: 1.0,
                action: 'examining',
                faceExpression: 'focused'
              }
            ],
            dialogue: [
              {
                id: 'd-c1-1',
                speaker: 'Leo',
                text: 'Wait a second... grandfather clocks don\'t skip beats like that! Look at that floorboard humming!',
                emotion: 'excited',
                voicePitch: 1.25,
                voiceRate: 1.1,
                startSec: 0.8,
                durationSec: 5.2
              }
            ],
            soundEffects: [
              { id: 'sfx-c1-1', sfxType: 'ticking', timestampSec: 0.4, label: 'Double Heartbeat Tick' },
              { id: 'sfx-c1-2', sfxType: 'boing', timestampSec: 3.2, label: 'Spring Floor Pop' }
            ]
          },
          {
            id: 'sc-c1-2',
            sceneNumber: 2,
            title: 'The Subterranean Sundial Awakens',
            duration: 7,
            visualDescription: 'The oak floorboards bounce open with a cartoon pop! Giant brass gear-rings rotate outward with luminous golden beams as a portal opens.',
            cameraMotion: 'dramatic-shake',
            transition: 'bounce-pop',
            backgroundTheme: 'clockwork_citadel',
            ambientParticles: 'sparkles',
            visualPrompt: 'Cartoon action scene, underground floor opening to reveal a glowing brass sundial with purple-gold energy vortex, bouncing expressive cartoon style.',
            characters: [
              {
                characterId: 'char-1',
                characterName: 'Leo',
                positionX: 25,
                positionY: 66,
                scale: 1.0,
                action: 'jumping',
                faceExpression: 'surprised'
              },
              {
                characterId: 'char-2',
                characterName: 'Kael',
                positionX: 70,
                positionY: 62,
                scale: 1.05,
                action: 'waving',
                faceExpression: 'happy'
              }
            ],
            dialogue: [
              {
                id: 'd-c1-2',
                speaker: 'Kael',
                text: 'Ahoy there, mate! Mind if I borrow a cup of sugar from the eighteenth century?',
                emotion: 'laughing',
                voicePitch: 1.05,
                voiceRate: 1.15,
                startSec: 1.0,
                durationSec: 4.8
              }
            ],
            soundEffects: [
              { id: 'sfx-c1-3', sfxType: 'clockwork-whir', timestampSec: 0.6, label: 'Gear Accelerator Spin' },
              { id: 'sfx-c1-4', sfxType: 'magic-sparkle', timestampSec: 2.8, label: 'Temporal Chime' }
            ]
          },
          {
            id: 'sc-c1-3',
            sceneNumber: 3,
            title: 'The Backward River Wonder',
            duration: 7,
            visualDescription: 'Vibrant purple and turquoise landscape where sparkling water flows backward up a mountain toward a floating clockwork citadel.',
            cameraMotion: 'pan-right',
            transition: 'star-wipe',
            backgroundTheme: 'backward_river',
            ambientParticles: 'bubbles',
            visualPrompt: 'Lush cartoon fantasy panorama with a luminous river flowing uphill against gravity, floating castle towers, bright sunny animated palette.',
            characters: [
              {
                characterId: 'char-1',
                characterName: 'Leo',
                positionX: 38,
                positionY: 66,
                scale: 1.0,
                action: 'talking',
                faceExpression: 'surprised'
              },
              {
                characterId: 'char-2',
                characterName: 'Kael',
                positionX: 68,
                positionY: 66,
                scale: 1.0,
                action: 'talking',
                faceExpression: 'mischievous'
              }
            ],
            dialogue: [
              {
                id: 'd-c1-3',
                speaker: 'Leo',
                text: 'The river... it is defying Newton\'s laws! The water is climbing Mount Aethelgard!',
                emotion: 'puzzled',
                voicePitch: 1.25,
                voiceRate: 1.05,
                startSec: 0.8,
                durationSec: 5.2
              }
            ],
            soundEffects: [
              { id: 'sfx-c1-5', sfxType: 'whoosh', timestampSec: 1.0, label: 'Upward River Surge' },
              { id: 'sfx-c1-6', sfxType: 'giggle-slide', timestampSec: 4.2, label: 'Playful Whistle' }
            ]
          },
          {
            id: 'sc-c1-4',
            sceneNumber: 4,
            title: 'Team-Up Into The Chrono-Rift',
            duration: 7,
            visualDescription: 'Both cartoon heroes strike a heroic high-five pose as glowing clockwork wings unfold and they leap into the adventure.',
            cameraMotion: 'zoom-out',
            transition: 'cross-dissolve',
            backgroundTheme: 'sky_docks',
            ambientParticles: 'sparkles',
            visualPrompt: 'Cartoon climax scene, two animated friends high fiving with heroic grins, brass compass shining, fireworks and fanfare atmosphere.',
            characters: [
              {
                characterId: 'char-1',
                characterName: 'Leo',
                positionX: 42,
                positionY: 66,
                scale: 1.1,
                action: 'jumping',
                faceExpression: 'happy'
              },
              {
                characterId: 'char-2',
                characterName: 'Kael',
                positionX: 58,
                positionY: 66,
                scale: 1.1,
                action: 'jumping',
                faceExpression: 'happy'
              }
            ],
            dialogue: [
              {
                id: 'd-c1-4',
                speaker: 'Kael',
                text: 'Hold onto your loupe, inventor! We\'ve got a timeline to save!',
                emotion: 'brave',
                voicePitch: 1.1,
                voiceRate: 1.2,
                startSec: 0.9,
                durationSec: 4.5
              }
            ],
            soundEffects: [
              { id: 'sfx-c1-7', sfxType: 'pop', timestampSec: 1.0, label: 'Heroic Clink' },
              { id: 'sfx-c1-8', sfxType: 'fanfare', timestampSec: 3.5, label: 'Triumphant Brass Toon Fanfare' }
            ]
          }
        ]
      },
      {
        id: 'ep-chrono-02',
        title: 'Episode 2: The Whispering Meadows of Aethelgard',
        chapterId: 'ch-2',
        chapterTitle: 'Chapter 2: The Boy with the Silver Compass',
        animationStyle: 'studio-ghibli',
        aspectRatio: '16:9',
        totalDuration: 28,
        fps: 24,
        voiceNarrator: 'Master Miyazaki Narrator',
        bgmTrack: 'Whimsical Adventure',
        generatedAt: '2025-02-28T16:30:00Z',
        scenes: [
          {
            id: 'sc-c2-1',
            sceneNumber: 1,
            title: 'Breeze Over Emerald Grass',
            duration: 7,
            visualDescription: 'Lush emerald green watercolor meadows sway gently beneath massive, painted cumulus clouds. Nostalgic warm sunlight dapples Leo as dandelion fluff floats in the breeze.',
            cameraMotion: 'pan-right',
            transition: 'cross-dissolve',
            backgroundTheme: 'enchanted_forest',
            ambientParticles: 'sparkles',
            visualPrompt: 'Studio Ghibli lush rolling green watercolor hills, giant fluffy white clouds, gentle breeze blowing grass, warm nostalgic sunlight, Hayao Miyazaki anime style.',
            characters: [
              {
                characterId: 'char-1',
                characterName: 'Leo',
                positionX: 34,
                positionY: 66,
                scale: 1.0,
                action: 'examining',
                faceExpression: 'focused'
              }
            ],
            dialogue: [
              {
                id: 'd-c2-1',
                speaker: 'Leo',
                text: 'Listen... the wind isn\'t just blowing. It is singing the same frequency as the brass gears!',
                emotion: 'whispering',
                voicePitch: 1.15,
                voiceRate: 1.0,
                startSec: 1.0,
                durationSec: 4.8
              }
            ],
            soundEffects: [
              { id: 'sfx-c2-1', sfxType: 'whoosh', timestampSec: 0.5, label: 'Pastoral Meadow Breeze' },
              { id: 'sfx-c2-2', sfxType: 'magic-sparkle', timestampSec: 3.2, label: 'Dandelion Shimmer' }
            ]
          },
          {
            id: 'sc-c2-2',
            sceneNumber: 2,
            title: 'Kael\'s Silver Compass Gleam',
            duration: 7,
            visualDescription: 'Kael stands atop a mossy boulder, his navy coat fluttering in the wind as his silver compass spins with luminous starlight needles.',
            cameraMotion: 'zoom-in',
            transition: 'cross-dissolve',
            backgroundTheme: 'mystic_canyon',
            ambientParticles: 'sparkles',
            visualPrompt: 'Studio Ghibli adventure anime, handsome boy with silver compass atop a hill overlooking distant floating castle, painterly watercolor background.',
            characters: [
              {
                characterId: 'char-2',
                characterName: 'Kael',
                positionX: 62,
                positionY: 65,
                scale: 1.05,
                action: 'talking',
                faceExpression: 'brave'
              }
            ],
            dialogue: [
              {
                id: 'd-c2-2',
                speaker: 'Kael',
                text: 'The compass never lies, inventor. The Temporal River is right over that ridge!',
                emotion: 'excited',
                voicePitch: 1.1,
                voiceRate: 1.1,
                startSec: 1.2,
                durationSec: 4.6
              }
            ],
            soundEffects: [
              { id: 'sfx-c2-3', sfxType: 'clockwork-whir', timestampSec: 1.0, label: 'Silver Needle Spin' },
              { id: 'sfx-c2-4', sfxType: 'fanfare', timestampSec: 3.8, label: 'Meadow Horn Call' }
            ]
          },
          {
            id: 'sc-c2-3',
            sceneNumber: 3,
            title: 'The Gravity-Defying Brook',
            duration: 7,
            visualDescription: 'A sparkling crystal brook splits into droplets that float upward like glowing blue lanterns against the watercolor sky.',
            cameraMotion: 'tracking-shot',
            transition: 'cross-dissolve',
            backgroundTheme: 'backward_river',
            ambientParticles: 'bubbles',
            visualPrompt: 'Water droplets defying gravity in a lush forest, Studio Ghibli magical nature scene, soft hand-painted gouache colors, whimsical.',
            characters: [
              {
                characterId: 'char-1',
                characterName: 'Leo',
                positionX: 38,
                positionY: 66,
                scale: 1.0,
                action: 'jumping',
                faceExpression: 'surprised'
              },
              {
                characterId: 'char-2',
                characterName: 'Kael',
                positionX: 65,
                positionY: 66,
                scale: 1.0,
                action: 'talking',
                faceExpression: 'happy'
              }
            ],
            dialogue: [
              {
                id: 'd-c2-3',
                speaker: 'Leo',
                text: 'Incredible! The water particles have reversed polarity! Touch one, Kael!',
                emotion: 'excited',
                voicePitch: 1.25,
                voiceRate: 1.15,
                startSec: 0.8,
                durationSec: 5.0
              }
            ],
            soundEffects: [
              { id: 'sfx-c2-5', sfxType: 'pop', timestampSec: 1.5, label: 'Water Droplet Bubble Pop' },
              { id: 'sfx-c2-6', sfxType: 'magic-sparkle', timestampSec: 3.5, label: 'Bioluminescent Bloom' }
            ]
          },
          {
            id: 'sc-c2-4',
            sceneNumber: 4,
            title: 'Gaze Toward The Floating Citadel',
            duration: 7,
            visualDescription: 'Both boys look out across the valley toward the majestic Floating Clockwork Citadel basking in the golden evening sunset.',
            cameraMotion: 'zoom-out',
            transition: 'cross-dissolve',
            backgroundTheme: 'sky_docks',
            ambientParticles: 'sparkles',
            visualPrompt: 'Majestic anime sunset landscape with two young adventurers gazing at a distant floating clockwork castle, Studio Ghibli cinematic masterpiece.',
            characters: [
              {
                characterId: 'char-1',
                characterName: 'Leo',
                positionX: 42,
                positionY: 66,
                scale: 1.05,
                action: 'waving',
                faceExpression: 'happy'
              },
              {
                characterId: 'char-2',
                characterName: 'Kael',
                positionX: 58,
                positionY: 66,
                scale: 1.05,
                action: 'waving',
                faceExpression: 'brave'
              }
            ],
            dialogue: [
              {
                id: 'd-c2-4',
                speaker: 'Kael',
                text: 'There she is. The Citadel of Aethelgard. Our greatest voyage begins now!',
                emotion: 'brave',
                voicePitch: 1.1,
                voiceRate: 1.05,
                startSec: 0.9,
                durationSec: 4.8
              }
            ],
            soundEffects: [
              { id: 'sfx-c2-7', sfxType: 'fanfare', timestampSec: 2.5, label: 'Sunset Symphonic Brass' }
            ]
          }
        ]
      }
    ],
    authorMachineConfig: {
      selectedFormulaId: 'james-patterson',
      enforcePattersonRules: true,
      targetChapterWords: 850,
      pacingDial: 95,
      cliffhangerSeverity: 92,
      fluffRemoverStrength: 85,
      dualPovMode: true
    },
    formulaOutline: [
      {
        chapterNumber: 1,
        title: 'The Brass Gear in the Basement',
        pov: 'Leo (Lead Horologist Apprentice)',
        tickingClock: 'T-minus 3 hours before village clock strikes thirteen',
        coreConflict: 'Leo discovers the glowing chronometer humming beneath the forbidden workshop floorboards.',
        cliffhangerBeat: 'The shadow of the dark celestial sundial points directly toward Leo himself.',
        wordTarget: 850,
        status: 'drafted'
      },
      {
        chapterNumber: 2,
        title: 'The Backward River',
        pov: 'Leo & Kaelen (Dual Perspective)',
        tickingClock: 'T-minus 2 hours 40 minutes',
        coreConflict: 'Leo slips through the temporal rift and encounters the swaggering 18th-century rogue Kael.',
        cliffhangerBeat: 'A deafening steam siren blares from the floating Citadel as black skyships deploy.',
        wordTarget: 850,
        status: 'drafted'
      },
      {
        chapterNumber: 3,
        title: 'The Shadow Horologist Strikes',
        pov: 'The Shadow Nemesis (Antagonist POV)',
        tickingClock: 'T-minus 2 hours 15 minutes',
        coreConflict: 'The villain observes the boys stepping into the Clockwork Keep ambush from the spires.',
        cliffhangerBeat: 'The sniper lines up the reticle: "Right on time, little apprentice."',
        wordTarget: 850,
        status: 'planned'
      },
      {
        chapterNumber: 4,
        title: 'The Glass Alibi',
        pov: 'Leo (Protagonist)',
        tickingClock: 'T-minus 1 hour 50 minutes',
        coreConflict: 'Leo and Kael must forge an alibi inside the temporal archives before the guards seal the gates.',
        cliffhangerBeat: 'The glass floor beneath their boots fractures into thousands of ticking shards.',
        wordTarget: 850,
        status: 'planned'
      },
      {
        chapterNumber: 5,
        title: 'Three Seconds Too Late',
        pov: 'Kael (Deuteragonist)',
        tickingClock: 'T-minus 1 hour 20 minutes',
        coreConflict: 'A runaway gear train threatens to crush the village below unless Kael cuts the main tension cable.',
        cliffhangerBeat: 'Kael swings down with his dagger, but the cable snaps backward into the dark.',
        wordTarget: 850,
        status: 'planned'
      },
      {
        chapterNumber: 6,
        title: 'The Midpoint Trap',
        pov: 'Leo & The Shadow (Dual POV)',
        tickingClock: 'T-minus 45 minutes',
        coreConflict: 'Leo believes he has successfully bypassed the central lock—only to discover it was a false dawn decoy.',
        cliffhangerBeat: 'The door closes behind them with heavy iron clanks: "Did you truly think you were the hunter?"',
        wordTarget: 850,
        status: 'planned'
      }
    ]
  }
];

