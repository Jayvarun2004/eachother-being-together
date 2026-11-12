# Changelog

All notable changes to **Eachother Being Together** are documented in this file.

---

## [2.0.0] - Upgrade & Hardening Release

### Phase 0: System Audit & Codebase Health
- **Card Bundling Verification**: Audited deck loading mechanics; confirmed cards are bundled at build time via `import.meta.glob('../../cards/*/*.json', { eager: true })` inside `src/lib/deck.js`, producing self-contained bundles in `dist/`.
- **Supabase Dependency Audit**: Verified Supabase client is dynamically imported from CDN ESM to keep client bundle lightweight and zero-dependency.
- **Vite Configuration Cleanup**: Retained dev proxy to Ollama with clear documentation comments for local offline AI prompt generation experimentation.
- **Fail-Safe Loading**: Replaced indefinite splash spinner with a 10-second timeout and interactive error screen with a "Retry" button.

### Phase 1: Fix & Harden
- **PWA Integration**:
  - Wired `manifest.webmanifest`, `icon.svg`, and Apple touch icons in `src/index.html`.
  - Configured Service Worker (`/sw.js`) registration exclusively for production environments (`import.meta.env.PROD`).
  - Implemented standalone Node.js script using pure `zlib` to generate valid 192x192 and 512x512 RGBA PNG icons without external dependencies.
  - Added smart dismissible "Install this app" home prompt using `beforeinstallprompt` on Android/Chrome and an iOS Safari installation guide hint.
- **Sound & Audio Governance**:
  - Sound now starts strictly muted by default until explicit user interaction.
  - Sound preference is preserved in `localStorage`.
- **Network Resilience & Room Robustness**:
  - Local pass-and-play works 100% offline.
  - Added global offline status banners and connectivity alerts for online room actions.
  - Prevented duplicate host room entries when navigating via shared links.
  - Added user-friendly error banners for expired or invalid 5-character room codes.
- **Repository Clean-up**:
  - Removed irrelevant open-source boilerplate (`CODE_OF_CONDUCT.md`, `SECURITY.md`, `CONTRIBUTING.md`).
  - Preserved `CONTENT_GUIDELINES.md` as private editorial rules for card generation.

### Phase 2: Gameplay Improvements
- **Skip & Swap Mechanic**:
  - Players get 3 skips per game with live counters.
  - Skips draw fresh, unrepeated cards matching current level and category.
- **Mood & Intensity Escalator**:
  - Retained Wholesome, Flirty, and Spicy tiers with age verification for Spicy.
  - Added "Mix it up" mode: dynamically escalates intensity from Wholesome to Flirty to Spicy as cards are played.
- **Turn Indicators & Local Handover Overlay**:
  - Clear animated turn notifications showing player names.
  - Privacy handover barrier ("Pass the phone to [Name] 💕") in local pass-and-play to prevent looking at cards prematurely.
- **Dare Timers**:
  - Added optional 30s and 60s dare countdown timers with warning audio chime and haptic vibration upon completion.
- **Secret Custom Cards**:
  - Partners can secretly craft custom cards without the other seeing them.
  - Length validation (10 to 300 characters) and duplicate suppression.
  - Distinctive "💌 from your partner" banner during gameplay.
- **End-of-Game Recap & Awards**:
  - Detailed stats: cards played, truths vs dares completed, skips used.
  - Fun playful couple awards ("Most Brave 🦁" and "Most Honest 💬").
  - Canvas-based 600x750 PNG recap card generator with instant download.
- **Favourites & Vault**:
  - One-tap heart button on any card to save it into the couple's persistent Favourites vault.

### Phase 3: New Feature Modules
- **How Well Do You Know Me?**:
  - Interactive quiz game where both players submit answers secretly and guess each other's choices.
  - Compatibility score calculation and summary.
  - 45 custom questions across Wholesome, Flirty, and Spicy tiers.
- **Date Night Roulette**:
  - Three spinning slot reels (Activity, Food, Movie Genre).
  - Slot locking mechanism, indoor/outdoor toggle, and budget filters (Free, Cheap, Treat-yourself).
  - Customizable items list with local persistence.
- **Days Together Counter**:
  - Anniversary date calculator displaying elapsed days and countdown to next anniversary.
  - Special milestone celebration confetti at 100, 365, 500, and 1,000 days.
- **Love Notes Jar**:
  - Digital love jar with confidential note writing and animated random draw.
  - "Open when..." timed seals (e.g., "open when you miss me").
- **Memory Lane**:
  - Private relationship timeline with titles, dates, descriptions, and optional photos.
  - Zero unconfigured cloud uploads: photos are stored safely in local browser IndexedDB.
- **Scoreboard & Streaks**:
  - Tracks games played, dares completed, and playing streak count.
  - Trophy showcase featuring 6 milestone badges.
- **New Quick-Play Games**:
  - *Finish the Sentence*: Open-ended romantic and playful sentence completions.
  - *This or That*: Quick preference matching with couple compatibility percentage.

### Phase 4: Content Expansion
- Added 25+ new unique cards per tier across all existing games.
- Expanded card catalog to 21 JSON decks (over 900 curated couple prompts).
- Validated every card file using `scripts/validate-cards.js` with zero errors.

### Phase 5: Design, Polish & Accessibility
- Complete CSS custom property design system (`main.css`) for consistent light and dark palettes.
- Mobile-first responsiveness tailored for 360px+ portrait screens with `100dvh` viewport handling and safe-area insets.
- Touch targets strictly ≥44x44px.
- Subtle floating hearts background respecting `prefers-reduced-motion`.
- Full WCAG AA contrast compliance, visible focus indicators, and ARIA screen reader announcements.
- Total gzipped JavaScript bundle size under 71 KB (well within the 150 KB limit).

### Phase 6: Privacy & Safety
- Salted SHA-256 PIN passcode protection with lockout timer after 5 failed attempts.
- Emergency "Clear my data on this device" wipe that flushes `localStorage`, `sessionStorage`, `IndexedDB`, and `CacheStorage`.
- Explicit `noindex, nofollow` search engine barrier.
- Complete Supabase Row Level Security (RLS) policies and security documentation.
