# Empire OS - Enterprise Media & Narrative Operating System

Empire OS is an enterprise operating system featuring the **StoryForge Publishing Engine**, shared semantic memory, Grand Council AI debate chamber, multi-engine illustration pipeline, KDP/EPUB publishing factory, and cross-universe continuity guardrails.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration (Optional)
Copy `.env.example` to `.env` and configure your API keys:
```bash
cp .env.example .env
```
Add your Gemini API key (optional — includes fallback simulation if omitted):
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run Development Server
```bash
npm run dev
```
The server will boot on `http://localhost:3000`.

### 4. Production Build
```bash
npm run build
npm start
```

---

## 🏛️ System Architecture

- **StoryForge Module**: Contained narrative production, universe & character lore management, 20-stage pipeline tracker.
- **Grand Literary Council**: 9-expert debate & consensus system (Professor Quill, Lady Ink, Captain Grimm, Archivist Atlas, Doctor Heart, Master Ember, Professor Curiosity, Professor Plotter, Professor Finish).
- **Shared Semantic Memory**: Universe-level lore, terminology, and character visual DNA persistence.
- **Visual DNA & Illustration Manifest**: Midjourney & DALL-E structured prompt engines with consistent styling seeds.
- **Publishing Factory**: Automated generation of KDP-ready metadata, EPUB, PDF structure, and marketing social kits.
- **Continuity Protection**: Multi-pass consistency audit across lore, technology limits, and character physical profiles.

---

## 📦 Project Structure

```
├── src/
│   ├── components/       # Core UI modules (CouncilRoom, ManuscriptEditor, PipelineTracker, etc.)
│   ├── data/             # Enterprise seed data & project structures
│   ├── types/            # TypeScript interfaces & domain models
│   ├── App.tsx           # Main Empire OS workspace shell
│   ├── main.tsx          # React application entrypoint
│   └── index.css         # Tailwind styling
├── server.ts             # Express backend with Gemini API proxy & memory store
├── vite.config.ts        # Vite configuration
├── package.json          # Dependencies & scripts
└── tsconfig.json         # TypeScript configuration
```
