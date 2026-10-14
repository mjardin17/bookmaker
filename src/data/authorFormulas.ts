import { AuthorFormulaProfile, AuthorFormulaId } from '../types/storyforge';

export const BESTSELLER_FORMULAS: Record<AuthorFormulaId, AuthorFormulaProfile> = {
  'james-patterson': {
    id: 'james-patterson',
    authorName: 'James Patterson',
    formulaTitle: 'The Suspense Velocity & Zeigarnik Cliffhanger Matrix',
    bestsellerCredentials: '425+ Million Copies Sold | 114 #1 NYT Bestsellers | Guinness World Record Holder',
    pacingVelocity: 'relentless-hyper',
    targetChapterWordCount: { min: 600, max: 1100, typical: 850 },
    cliffhangerMandate: true,
    cliffhangerRuleDescription: 'Every single chapter MUST terminate on an unresolved dilemma, shocking revelation, ticking countdown, or imminent physical threat. Zero exceptions.',
    coreRules: [
      {
        ruleNumber: 1,
        title: 'Exhaustive 60-80 Page Outline First',
        mechanism: 'Before writing page one of prose, Patterson drafts an ultra-detailed scene-by-scene outline where every single chapter has its conflict, turning point, and cliffhanger locked.',
        whyItWorks: 'Eliminates writer block, ensures the narrative never wanders, and guarantees every scene acts as an engine for the main plot.'
      },
      {
        ruleNumber: 2,
        title: 'Micro-Chapters (The Dopamine Hook)',
        mechanism: 'Chapters are strictly 2 to 3 pages (600 to 1,100 words max). Rapid chapter completions give readers frequent psychological rewards.',
        whyItWorks: 'Readers say "just one more chapter" before bed, creating an unputdownable binge-reading addiction.'
      },
      {
        ruleNumber: 3,
        title: 'The Zeigarnik Cliffhanger Mandate',
        mechanism: 'End every chapter with an open cognitive loop: a ringing telephone, a shadow in the doorway, a test result that changes everything, or a gun cocking.',
        whyItWorks: 'Human brains are hardwired to resolve uncompleted tasks. Ending mid-crisis forces the reader to turn the page.'
      },
      {
        ruleNumber: 4,
        title: 'Dual / Multi-POV with Asymmetric Information',
        mechanism: 'Alternate chapters between the Detective/Protagonist and the Killer/Mastermind. Let the reader see the predator preparing the ambush before the hero steps into the room.',
        whyItWorks: 'Creates intense Hitchcockian suspense through dramatic irony. The reader screams at the hero to look behind them.'
      },
      {
        ruleNumber: 5,
        title: 'Ticking Clock & Compounded Urgency',
        mechanism: 'Every story has an immutable countdown: a bomb timer, a 48-hour ransom window, an impending execution, or an accelerating pathogen.',
        whyItWorks: 'Temporal pressure prevents characters from lingering or philosophizing; every action is urgent and high-stakes.'
      },
      {
        ruleNumber: 6,
        title: 'Zero-Fluff Plot Propulsion ("Cut the Wallpaper")',
        mechanism: 'Patterson famously said: "I don\'t believe in sitting around describing what the wallpaper looks like." Strip away decorative filler, meteorological rambling, and mundane transitions.',
        whyItWorks: 'Maximizes forward momentum. Every sentence either reveals character motive, escalates conflict, or triggers action.'
      },
      {
        ruleNumber: 7,
        title: 'In Media Res Sensory Punch Opening',
        mechanism: 'Open chapter one in the middle of a pulse-pounding action sequence, visceral crime scene, or life-or-death decision.',
        whyItWorks: 'Hooks the reader within 15 seconds before they can judge or put down the book.'
      },
      {
        ruleNumber: 8,
        title: 'Staccato Dialogue & Active Verb Dominance',
        mechanism: 'Use crisp, colloquial dialogue with minimal tags (said/asked). Eliminate passive voice and adverb-heavy qualifiers.',
        whyItWorks: 'Accelerates reading cadence, making the prose read like a cinematic screenplay.'
      },
      {
        ruleNumber: 9,
        title: 'The Midpoint False-Dawn & Double-Twist Reversal',
        mechanism: 'At 50% and 75%, deliver a seismic shock where the apparent killer or victory is proven to be a catastrophic decoy trap.',
        whyItWorks: 'Keeps experienced thriller readers from predicting the ending and resets the stakes to double intensity.'
      }
    ],
    povStructure: 'Dual Alternate POV (Hero Detective 1st/3rd Person vs. Antagonist Mastermind 3rd Person)',
    fluffTolerance: 'zero-tolerance',
    dialogueRatioPercent: 55,
    keyTechniques: [
      'Zeigarnik Cliffhanger Ending',
      'Short Staccato Paragraphs',
      'Dramatic Irony POV Alternation',
      '24-72 Hour Ticking Clock',
      'Zero Fluff / Rapid Propulsion',
      'False-Dawn Midpoint Reversal'
    ],
    sampleOpeningHook: 'The digital timer on the titanium lock was glowing crimson: 00:04:12. Alex Cross could smell the copper tang of fresh blood before his flashlight beam even touched the marble staircase.',
    sampleEndingCliffhanger: 'He reached for the brass doorknob, his Glock drawn. But before his fingers made contact, a whisper came through the vents directly above his head: "You\'re three seconds too late, Alex."',
    formulaColor: 'amber',
    avatar: '⚡'
  },
  'dan-brown': {
    id: 'dan-brown',
    authorName: 'Dan Brown',
    formulaTitle: 'The 24-Hour Symbology & High-Stakes Conspiratorial Puzzle',
    bestsellerCredentials: '250+ Million Copies Sold | #1 Bestseller in 50+ Languages | Author of The Da Vinci Code',
    pacingVelocity: 'ticking-clock',
    targetChapterWordCount: { min: 900, max: 1500, typical: 1100 },
    cliffhangerMandate: true,
    cliffhangerRuleDescription: 'End chapters on mid-discovery revelations, ancient code translations, or sudden captures by secret societies.',
    coreRules: [
      {
        ruleNumber: 1,
        title: 'The 24-Hour Countdown',
        mechanism: 'The entire catastrophic event (antimatter detonation, bio-weapon release, papal assassination) will occur at midnight or within 24 hours.',
        whyItWorks: 'Crushes temporal hesitation and creates relentless forward propulsion.'
      },
      {
        ruleNumber: 2,
        title: 'Erudite Academic + Brilliant Female Specialist Duo',
        mechanism: 'Pair an intellectually formidable protagonist (e.g., Harvard symbologist) with a fierce, brilliant female scientist or cryptographer.',
        whyItWorks: 'Enables high-level intellectual banter, puzzle exposition without boring the reader, and natural romantic undercurrent.'
      },
      {
        ruleNumber: 3,
        title: 'The Secret Society & Ancient Iconography Hook',
        mechanism: 'Ground the mystery in real historic architecture (Louvre, Vatican, Washington DC), Renaissance art, Latin anagrams, and secret brotherhoods.',
        whyItWorks: 'Gives the fictional chase the intoxicating illusion of real forbidden history and conspiracy truth.'
      },
      {
        ruleNumber: 4,
        title: 'The Masked Puppet Master & Shadow Enforcer',
        mechanism: 'A fanatical zealot assassin carries out orders from an anonymous "Teacher" or high-ranking government/religious official.',
        whyItWorks: 'Distributes physical threat through the assassin while maintaining intellectual mystery around the puppet master.'
      }
    ],
    povStructure: 'Omniscient 3rd Person tracking Robert Langdon, the Female Specialist, the Shadow Assassin, and the Police Chief',
    fluffTolerance: 'spartan',
    dialogueRatioPercent: 45,
    keyTechniques: [
      '24-Hour Imminent Catastrophe',
      'Real Historical & Cryptographic Puzzles',
      'Hidden Clues in Classical Masterpieces',
      'Fanatical Shadow Assassin Subplot',
      'Shocking Betrayal by Respected Authority Figure'
    ],
    sampleOpeningHook: 'Renowned symbologist Robert Langdon awoke in the dead of night to the urgent chime of his bedside telephone. The man on the other end was the director of CERN.',
    sampleEndingCliffhanger: 'Langdon adjusted the black-light torch over the faded parchment. Beneath the Latin liturgy, letters glowing in phosphorus spelled out a single word: ILLUMINATI.',
    formulaColor: 'indigo',
    avatar: '🗝️'
  },
  'stephen-king': {
    id: 'stephen-king',
    authorName: 'Stephen King',
    formulaTitle: 'The Small-Town Dread & Psychological Pressure Cooker',
    bestsellerCredentials: '350+ Million Copies Sold | 65+ Published Novels | The King of Modern Horror & Suspense',
    pacingVelocity: 'slow-burn-dread',
    targetChapterWordCount: { min: 1400, max: 2800, typical: 1800 },
    cliffhangerMandate: false,
    cliffhangerRuleDescription: 'End chapters with haunting ominous foreshadowing rather than abrupt cliffhangers: "It was the last sunny afternoon Castle Rock would ever see."',
    coreRules: [
      {
        ruleNumber: 1,
        title: 'The "What-If" Pressure Cooker',
        mechanism: 'Take deeply relatable, flawed blue-collar characters in an ordinary Maine town, then insert an uncanny, relentless supernatural or psychological terror.',
        whyItWorks: 'Emotional grounding makes the terror visceral; if the reader loves the town barber or schoolteacher, the monster feels genuinely dangerous.'
      },
      {
        ruleNumber: 2,
        title: 'Tactile Sensory Immersion & Pop-Culture Anchors',
        mechanism: 'Use visceral sensory details: the smell of wet wool, warm asphalt after rain, chewing gum brands, crackling radio static.',
        whyItWorks: 'Creates an airtight reality where supernatural elements hit with shocking weight.'
      },
      {
        ruleNumber: 3,
        title: 'The Ominous Foreshadowing Sting',
        mechanism: 'Casually drop haunting future knowledge into mundane scenes: "He waved goodbye to his wife at the kitchen door. He would never see her alive again."',
        whyItWorks: 'Creates unbearable psychological dread that keeps the reader turning pages to see when the axe will fall.'
      },
      {
        ruleNumber: 4,
        title: 'Raw Internal Monologue & Unfiltered Subconscious',
        mechanism: 'Expose the secret shame, ugly thoughts, and childhood fears of characters through stream-of-consciousness parenthesis.',
        whyItWorks: 'Makes characters bleed real humanity rather than acting as cardboard thriller archetypes.'
      }
    ],
    povStructure: 'Deep Close 3rd Person with Omniscient Nostalgic Overlook',
    fluffTolerance: 'rich-atmospheric',
    dialogueRatioPercent: 40,
    keyTechniques: [
      'Nostalgic Small-Town Americana Realism',
      'Eerie Foreshadowing Stings',
      'Visceral Tactile Sensory Grounding',
      'Deep Flawed Character Psychology',
      'The Creeping Corruption of Everyday Objects'
    ],
    sampleOpeningHook: 'The boy was eleven the summer the dogs stopped barking in Derry, though no one paid much attention to that until the drainage ditch behind the junior high began to smell like carnations and spoiled meat.',
    sampleEndingCliffhanger: 'Johnny turned off the porch light and locked the screen door, feeling silly for checking three times. But deep beneath the floorboards, something cold and patient clicked its fingernails against the cast-iron pipes.',
    formulaColor: 'rose',
    avatar: '🩸'
  },
  'brandon-sanderson': {
    id: 'brandon-sanderson',
    authorName: 'Brandon Sanderson',
    formulaTitle: 'The 3-Laws Hard Magic & "Sanderstorm" Convergent Climax',
    bestsellerCredentials: '40+ Million Copies Sold | Record-Breaking $41M Kickstarter | Master of Epic Worldbuilding',
    pacingVelocity: 'convergent-avalanche',
    targetChapterWordCount: { min: 2000, max: 4000, typical: 2800 },
    cliffhangerMandate: false,
    cliffhangerRuleDescription: 'Chapters end on tactical breakthroughs, magic discoveries, or philosophical epiphanies.',
    coreRules: [
      {
        ruleNumber: 1,
        title: 'Sanderson\'s 3 Laws of Magic',
        mechanism: 'Law 1: An author\'s ability to solve problems with magic is directly proportional to how well the reader understands said magic. Law 2: Limitations > Powers. Law 3: Expand what you already have before adding something new.',
        whyItWorks: 'Magic feels like a rigorous martial art or science; climactic victories feel earned rather than like deus ex machina.'
      },
      {
        ruleNumber: 2,
        title: 'Three Interlocking Plot Strands',
        mechanism: 'Weave three distinct threads: (1) The Macro World Threat, (2) The Micro Heist/Investigation, (3) The Protagonist\'s Intimate Psychological Trauma/Oath.',
        whyItWorks: 'Ensures epic scope never disconnects from deep emotional intimacy.'
      },
      {
        ruleNumber: 3,
        title: 'The Trademark "Sanderstorm" Climax',
        mechanism: 'In the final 15% of the book, every unresolved mystery, magic rule, character arc, and military conflict collides at lightning speed.',
        whyItWorks: 'Delivers an unprecedented adrenaline rush where puzzle pieces snap together in rapid, breathtaking sequence.'
      }
    ],
    povStructure: 'Multiple 3rd Person Limited POV with Epic Interludes',
    fluffTolerance: 'rich-atmospheric',
    dialogueRatioPercent: 40,
    keyTechniques: [
      'Hard Rule-Based Magic Mechanics',
      'Convergent Sanderstorm Avalanche Climax',
      'Moral Oaths & Idealistic Character Progression',
      'Micro-Heist within Epic War Scale',
      'Foreshadowed Epiphanies Based on Established Lore'
    ],
    sampleOpeningHook: 'Ash fell from the sky. Vin watched it drift across the stained cobblestones of Luthadel like gray snow that carried the scent of burnt sugar and iron.',
    sampleEndingCliffhanger: 'Kaladin looked down at the spear in his calloused hands. The stormlight inside his lungs flared with incandescent heat, and for the first time in his life, gravity let go.',
    formulaColor: 'sky',
    avatar: '⚔️'
  },
  'agatha-christie': {
    id: 'agatha-christie',
    authorName: 'Agatha Christie',
    formulaTitle: 'The Closed-Circle Whodunit & Mathematical Puzzle Matrix',
    bestsellerCredentials: '2+ Billion Copies Sold | #1 Best-Selling Fiction Author of All Time | Creator of Hercule Poirot & Miss Marple',
    pacingVelocity: 'cerebral-methodical',
    targetChapterWordCount: { min: 1200, max: 2000, typical: 1500 },
    cliffhangerMandate: true,
    cliffhangerRuleDescription: 'End chapters on contradictory alibis, discovered secrets, missing items, or sudden screams in the dark.',
    coreRules: [
      {
        ruleNumber: 1,
        title: 'The Closed-Circle Isolation Trap',
        mechanism: 'Trap 8 to 12 distinct characters in an isolated manor, snowbound train, yacht, or remote island. No one can enter or leave.',
        whyItWorks: 'Limits suspect space, heightens claustrophobia, and guarantees the killer is breathing the same air as the victims.'
      },
      {
        ruleNumber: 2,
        title: 'Universal Motive & Mathematical Red Herrings',
        mechanism: 'Every single suspect has something scandalous to hide (blackmail, secret debt, forged will), providing convincing motives for murder.',
        whyItWorks: 'The reader is constantly guessing and second-guessing as layers of secrets peel away.'
      },
      {
        ruleNumber: 3,
        title: 'The Eccentric Sleuth & The "Little Grey Cells"',
        mechanism: 'An observant detective notes tiny social mannerisms, misplaced ornaments, and slips of syntax that everyone else ignores.',
        whyItWorks: 'Celebrates pure psychological deduction over physical brute force.'
      },
      {
        ruleNumber: 4,
        title: 'The Grand Parlor Room Unmasking',
        mechanism: 'Assemble every surviving suspect in the drawing room. Systematically accuse each person, explaining how they COULD have done it, before revealing the true culprit.',
        whyItWorks: 'Creates unmatched theatrical climax and absolute narrative closure.'
      }
    ],
    povStructure: 'Close 3rd Person through an Associate or Objective Observer (e.g. Captain Hastings)',
    fluffTolerance: 'spartan',
    dialogueRatioPercent: 65,
    keyTechniques: [
      'Closed-Circle Physical Isolation',
      'Mathematical Distribution of Suspicion',
      'Slip-of-the-Tongue Clues',
      'The Grand Parlor Assembly Denouement',
      'The Least-Likely Suspect Solution'
    ],
    sampleOpeningHook: 'The grandfather clock in the library of Blackwood Manor struck midnight, and with the twelfth chime, the French windows blew inward, extinguishing the hearth fire.',
    sampleEndingCliffhanger: 'Poirot twirled his mustache and picked up the stained silver coffee spoon with a silk handkerchief. "Regardez, my friends. Our murderer was not left-handed after all."',
    formulaColor: 'emerald',
    avatar: '🔍'
  },
  'colleen-hoover': {
    id: 'colleen-hoover',
    authorName: 'Colleen Hoover',
    formulaTitle: 'The Devastating First-Person Vulnerability & Taboo Secret Engine',
    bestsellerCredentials: '50+ Million Copies Sold | Dominated NYT Bestseller Lists for 100+ Weeks | BookTok Phenomenon',
    pacingVelocity: 'emotional-cyclone',
    targetChapterWordCount: { min: 1000, max: 2000, typical: 1400 },
    cliffhangerMandate: true,
    cliffhangerRuleDescription: 'End chapters on devastating emotional revelations, broken boundaries, or shocking confessional entries.',
    coreRules: [
      {
        ruleNumber: 1,
        title: 'Raw, Unfiltered First-Person Confession',
        mechanism: 'Write in immediate, conversational first-person present tense. Expose the narrator\'s deepest insecurities, secret desires, and ugly flaws.',
        whyItWorks: 'Builds instant intimate empathy; the reader feels like they are reading their best friend\'s locked diary.'
      },
      {
        ruleNumber: 2,
        title: 'The Dual-Timeline or Hidden Journal Device',
        mechanism: 'Intersperse present romantic tension with letters, diary entries, or past memories that conceal a catastrophic trauma.',
        whyItWorks: 'Feeds dramatic mystery into emotional drama, creating a two-track narrative engine.'
      },
      {
        ruleNumber: 3,
        title: 'The Taboo / High-Voltage Moral Dilemma',
        mechanism: 'The romantic interest is magnetic but carries a profound moral hazard or forbidden boundary.',
        whyItWorks: 'Generates intense emotional friction and reader debate.'
      },
      {
        ruleNumber: 4,
        title: 'The Midpoint Gut-Punch Revelation',
        mechanism: 'At the exact center of the story, reveal the hidden trauma or betrayal that turns the relationship upside down.',
        whyItWorks: 'Shatters the romantic fantasy and forces both characters into agonizing emotional growth.'
      }
    ],
    povStructure: '1st Person Present Tense (often Dual Alternate Chapters between Lovers)',
    fluffTolerance: 'spartan',
    dialogueRatioPercent: 60,
    keyTechniques: [
      'Visceral Confessional 1st Person Voice',
      'Dual-Timeline Secret Letters / Diaries',
      'High-Stakes Emotional Friction & Taboo Longing',
      'Midpoint Devastating Revelation',
      'Gut-Wrenching Moral Dilemma'
    ],
    sampleOpeningHook: 'I was sitting on the edge of the roof with my bare feet dangling over the Boston skyline when I decided that falling wouldn\'t be the worst thing that happened to me today.',
    sampleEndingCliffhanger: 'I unfolded the yellowed letter hidden behind his bathroom mirror. The handwriting belonged to my sister. And the opening line was: "He doesn\'t know that I\'m pregnant, Lily."',
    formulaColor: 'purple',
    avatar: '💔'
  },
  'michael-crichton': {
    id: 'michael-crichton',
    authorName: 'Michael Crichton',
    formulaTitle: 'The Cassandra Curve & Runaway Techno-Thriller Matrix',
    bestsellerCredentials: '200+ Million Copies Sold | Author of Jurassic Park, Andromeda Strain, Prey | Father of Techno-Thriller',
    pacingVelocity: 'ticking-clock',
    targetChapterWordCount: { min: 1000, max: 1800, typical: 1300 },
    cliffhangerMandate: true,
    cliffhangerRuleDescription: 'End chapters on systemic alarm failures, anomalous scientific readings, or the first escaped predator.',
    coreRules: [
      {
        ruleNumber: 1,
        title: 'The "Cassandra" Scientist vs. Arrogant Corporate Hubris',
        mechanism: 'An ethical scientist warns that an exponential technology cannot be controlled. A billionaire or corporation ignores the warnings to meet a commercial launch date.',
        whyItWorks: 'Taps into profound existential human anxiety about runaway scientific progress and greed.'
      },
      {
        ruleNumber: 2,
        title: 'Pseudo-Academic Veracity & Technical Precision',
        mechanism: 'Embed real scientific terminology, mathematical chaos theory, computer code snippets, and clinical autopsy reports into the narrative.',
        whyItWorks: 'Convinces the reader that the terrifying events are not fantasy, but tomorrow morning\'s headline.'
      },
      {
        ruleNumber: 3,
        title: 'The Systemic Cascading Failure ("Murphy\'s Law at Scale")',
        mechanism: 'A seemingly minor glitch (power fluctuation, storm, human greed) triggers an irreversible chain reaction of automated security collapses.',
        whyItWorks: 'The threat escalates naturally through systemic vulnerability rather than arbitrary writer coincidence.'
      },
      {
        ruleNumber: 4,
        title: 'The Clinical Procedural Action Sequence',
        mechanism: 'Describe life-and-death encounters with biological or robotic apex predators using precise, objective, almost documentary prose.',
        whyItWorks: 'Understated clinical tone heightens the horror far more than overdramatic adjectives.'
      }
    ],
    povStructure: 'Ensemble 3rd Person Objective tracking Scientists, Executives, Field Workers, and Children',
    fluffTolerance: 'spartan',
    dialogueRatioPercent: 40,
    keyTechniques: [
      'The Cassandra Scientific Warning',
      'Real-World Graphs & Technical Authenticity',
      'Chaos Theory Systemic Cascade Failure',
      'Clinical Shock Value & Biological Detail',
      'Runaway Commercial Ambition as True Villain'
    ],
    sampleOpeningHook: 'The tropical storm hit Isla Nublar at 4:15 PM, cutting primary satellite telemetry to the mainland just as the mainframe reported an unexplainable pressure drop in Enclosure Nine.',
    sampleEndingCliffhanger: 'Dr. Grant leaned over the thermal display. The motion sensors in the nursery showed eleven infant Velociraptors. But the automated feeding log only recorded seven eggs having ever been laid.',
    formulaColor: 'teal',
    avatar: '🧬'
  },
  'lee-child': {
    id: 'lee-child',
    authorName: 'Lee Child',
    formulaTitle: 'The Tactical Loner & Geometry-of-Violence Procedural',
    bestsellerCredentials: '100+ Million Copies Sold | Jack Reacher Series | One of the Fastest-Paced Action Thrillers in Print',
    pacingVelocity: 'relentless-hyper',
    targetChapterWordCount: { min: 800, max: 1400, typical: 1050 },
    cliffhangerMandate: true,
    cliffhangerRuleDescription: 'End chapters with an analytical observation that proves a deadly ambush is about to occur.',
    coreRules: [
      {
        ruleNumber: 1,
        title: 'The Knight-Errant Without Baggage',
        mechanism: 'The hero possesses no phone, no car, no home, and only an expired passport and a toothbrush. He moves through the world entirely untethered.',
        whyItWorks: 'Ultimate reader wish-fulfillment: absolute freedom combined with formidable moral agency.'
      },
      {
        ruleNumber: 2,
        title: 'Analytical Tactical Geometry in Combat',
        mechanism: 'Break down physical altercations into micro-second calculations of leverage, sightlines, bone density, and spatial awareness before the first punch is thrown.',
        whyItWorks: 'Transforms standard action fights into brilliant chess matches of tactical intellect.'
      },
      {
        ruleNumber: 3,
        title: 'The Sleepy Town Conspiracy',
        mechanism: 'Hero steps off a bus in a deceptively quiet American town, orders black coffee, notices a tiny anomaly (too many new sedans, an overly nervous waitress), and pulls the thread.',
        whyItWorks: 'Natural organic escalation from curiosity to war against a corrupt power structure.'
      }
    ],
    povStructure: '1st Person or Close 3rd Person with Staccato Analytical Cadence',
    fluffTolerance: 'zero-tolerance',
    dialogueRatioPercent: 45,
    keyTechniques: [
      'Staccato Single-Clause Sentence Cadence',
      'Micro-Second Combat Calculation',
      'Deceptively Mundane Town Hook',
      'Hyper-Observational Investigative Eye',
      'Uncompromising Retributive Justice'
    ],
    sampleOpeningHook: 'Reacher said nothing. He sat at the counter of the diner, drank his black coffee, and watched the three men in cheap gray suits step out of the Buick across the street.',
    sampleEndingCliffhanger: 'The tallest man reached inside his coat. He was fast, but Reacher had already timed the distance at six feet two inches. That meant three-tenths of a second. More than enough.',
    formulaColor: 'stone',
    avatar: '🎯'
  },
  'gillian-flynn': {
    id: 'gillian-flynn',
    authorName: 'Gillian Flynn',
    formulaTitle: 'The Toxic Dual-Unreliable Narrator & Dark Cynical Noir',
    bestsellerCredentials: '20+ Million Copies Sold | Author of Gone Girl, Sharp Objects | Queen of Dark Domestic Suspense',
    pacingVelocity: 'ticking-clock',
    targetChapterWordCount: { min: 1200, max: 2200, typical: 1600 },
    cliffhangerMandate: true,
    cliffhangerRuleDescription: 'End chapters when a narrator reveals that everything they just told the reader was a calculated lie.',
    coreRules: [
      {
        ruleNumber: 1,
        title: 'The Competing Toxic Unreliable Narrators',
        mechanism: 'Alternate chapters between two characters who despise each other. Both are charming, articulate, and completely lying to the reader.',
        whyItWorks: 'The reader becomes an active detective trying to find the truth between two competing fabrications.'
      },
      {
        ruleNumber: 2,
        title: 'The Seismic Midpoint Reversal ("The Cool Girl Twist")',
        mechanism: 'At the exact midpoint, drop the curtain and reveal that the apparent victim was actually orchestrating the crime all along.',
        whyItWorks: 'Completely recontextualizes the first half of the book and turns the remaining story into a sinister psychological duel.'
      },
      {
        ruleNumber: 3,
        title: 'Acerbic Social & Domestic Satire',
        mechanism: 'Infuse the mystery with biting cynicism about marriage, media circuses, performative gender roles, and consumerist superficiality.',
        whyItWorks: 'Elevates a thriller into razor-sharp literary commentary on modern human relationships.'
      }
    ],
    povStructure: 'Dual 1st Person (Husband vs. Wife / Hunter vs. Prey)',
    fluffTolerance: 'spartan',
    dialogueRatioPercent: 50,
    keyTechniques: [
      'Dual Pathological Unreliable Narrators',
      'The Midpoint Perspective Inversion',
      'Acerbic Cynical Social Satire',
      'Diary Entries with Fabricated Dates',
      'Psychological Weaponization of Intimacy'
    ],
    sampleOpeningHook: 'When I think of my wife, I always think of her head. The shape of it. I picture cracking her lovely skull, unspooling her brain, trying to catch her thoughts like minnows.',
    sampleEndingCliffhanger: 'I smiled for the news cameras on our front lawn, squeezing my mother-in-law\'s hand. Nobody noticed that inside my jacket pocket, I was deleting the GPS log from my rental car.',
    formulaColor: 'zinc',
    avatar: '♟️'
  },
  'malcolm-gladwell': {
    id: 'malcolm-gladwell',
    authorName: 'Malcolm Gladwell',
    formulaTitle: 'The Counter-Intuitive Narrative Arc (Bestselling Non-Fiction)',
    bestsellerCredentials: '10+ Million Copies Sold | Author of The Tipping Point, Outliers, Blink | #1 NYT Non-Fiction Master',
    pacingVelocity: 'cerebral-methodical',
    targetChapterWordCount: { min: 1500, max: 2500, typical: 1900 },
    cliffhangerMandate: false,
    cliffhangerRuleDescription: 'End chapters on paradoxical questions that reframe how the reader views human nature or history.',
    coreRules: [
      {
        ruleNumber: 1,
        title: 'The Gripping Micro-Anecdote Opening',
        mechanism: 'Open every chapter with a cinematic historical vignette or bizarre biographical mystery that seems completely unrelated to the book\'s topic.',
        whyItWorks: 'Hooks the reader through storytelling rather than dry academic thesis.'
      },
      {
        ruleNumber: 2,
        title: 'The Counter-Intuitive Revelation',
        mechanism: 'Prove that common sense is 180 degrees backwards using a surprising psychological, sociological, or neurological study.',
        whyItWorks: 'Gives the reader an exhilarating intellectual epiphany they can brag about at dinner parties.'
      },
      {
        ruleNumber: 3,
        title: 'The Sticky Conceptual Metaphor',
        mechanism: 'Invent a simple, unforgettable term ("The 10,000-Hour Rule", "The Tipping Point", "Thin-Slicing", "The Broken Windows Theory").',
        whyItWorks: 'Enables virality; readers can summarize the book\'s core thesis in a 3-word phrase.'
      }
    ],
    povStructure: 'Curious, Conversational 1st/3rd Person Journalistic Voice',
    fluffTolerance: 'spartan',
    dialogueRatioPercent: 25,
    keyTechniques: [
      'Narrative Micro-Anecdote Hook',
      'Counter-Intuitive Empirical Study',
      'Sticky Three-Word Conceptual Metaphor',
      'Socratic Inquisitive Cadence',
      'Universal Paradigm Shift Takeaway'
    ],
    sampleOpeningHook: 'On a humid Tuesday morning in July 1971, a 23-year-old mathematician named Arthur walked into a bank in Milan with a suitcase containing nothing but seventy-four rubber bands.',
    sampleEndingCliffhanger: 'We assume that genius is born in a flash of lightning. But what if the greatest predictor of world-changing success is not talent at all, but the date printed on your birth certificate?',
    formulaColor: 'amber',
    avatar: '💡'
  },
  'custom-clone': {
    id: 'custom-clone',
    authorName: 'Custom Author Voice Clone',
    formulaTitle: 'AI Syntactic Fingerprint & Stylistic Persona Clone',
    bestsellerCredentials: 'Trained on User-Supplied Prose Excerpts | Dynamic Syntactic Matching Engine',
    pacingVelocity: 'relentless-hyper',
    targetChapterWordCount: { min: 700, max: 1500, typical: 900 },
    cliffhangerMandate: true,
    cliffhangerRuleDescription: 'Adheres to the stylistic rhythm of the cloned author with optional Patterson cliffhanger enforcement.',
    coreRules: [
      {
        ruleNumber: 1,
        title: 'Syntactic Cadence Extraction',
        mechanism: 'Analyzes sentence length distribution, compound vs. complex structures, and rhythmic variation.',
        whyItWorks: 'Captures the distinct musicality and tempo of the target author\'s prose.'
      },
      {
        ruleNumber: 2,
        title: 'Sensory Palette & Vocabulary Density',
        mechanism: 'Identifies the author\'s sensory biases (visual, tactile, auditory) and lexical complexity.',
        whyItWorks: 'Ensures the cloned voice uses the exact tonal register and imagery density.'
      },
      {
        ruleNumber: 3,
        title: 'Dialogue-to-Narrative Ratio',
        mechanism: 'Calibrates speech tags, subtext subtlety, and conversational rhythm.',
        whyItWorks: 'Replicates character interaction dynamics precisely.'
      }
    ],
    povStructure: 'Custom Configured based on Excerpt Analysis',
    fluffTolerance: 'spartan',
    dialogueRatioPercent: 50,
    keyTechniques: [
      'Voice Fingerprint Extraction',
      'Lexical Density Matching',
      'Syntactic Cadence Emulation',
      'Sensory Bias Alignment',
      'Patterson Formula Hybridization'
    ],
    sampleOpeningHook: 'Custom opening generated based on your cloned author voice profile.',
    sampleEndingCliffhanger: 'Custom cliffhanger engineered following Patterson velocity rules.',
    formulaColor: 'emerald',
    avatar: '🧬'
  }
};

export const AUTHOR_CLONING_PRESETS = [
  {
    authorName: 'Ernest Hemingway',
    styleSummary: 'Iceberg theory, short declarative sentences, minimal adjectives, profound subtext beneath simple words.',
    sampleText: 'In the late summer of that year we lived in a house in a village that looked across the river and the plain to the mountains. In the bed of the river there were pebbles and boulders, dry and white in the sun, and the water was clear and swiftly moving and blue in the channels.'
  },
  {
    authorName: 'Cormac McCarthy',
    styleSummary: 'Biblical cadences, polysyndeton (and... and... and...), stark apocalyptic landscapes, poetic brutality, no quotation marks.',
    sampleText: 'He walked out in the gray light and stood and he saw for a brief moment the absolute truth of the world. The cold relentless circling of the intestate earth. Darkness implacable. The blind dogs of the sun in their running.'
  },
  {
    authorName: 'Haruki Murakami',
    styleSummary: 'Surreal magical realism in modern Tokyo, melancholy jazz records, cooking spaghetti, mysterious cats, wells, and parallel realities.',
    sampleText: 'When I opened the refrigerator at 2:00 AM, there was nothing inside but half a lemon and an opened bottle of dry vermouth. A girl with a red velvet coat was waiting at the bottom of the dry well behind the alleyway.'
  },
  {
    authorName: 'Jane Austen',
    styleSummary: 'Regency wit, free indirect discourse, razor-sharp irony regarding social rank, marriage, and subtle human vanity.',
    sampleText: 'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families.'
  },
  {
    authorName: 'George R.R. Martin',
    styleSummary: 'Gritty feudal realism, rich heraldry and feasting descriptions, morally gray antiheroes, sudden shocking deaths, multiple competing claims.',
    sampleText: 'The morning had dawned clear and cold, with a crispness that hinted at the end of summer. They set forth at daybreak to see a man beheaded, twenty of them in all, and Bran rode among them, nervous and excited.'
  }
];
