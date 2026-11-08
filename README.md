# Eachother Being Together 💕

> A fun, romantic game room for couples. Play Truth or Dare, Never Have I Ever, and Would You Rather — on one device or across two devices online.

![Screenshot placeholder](docs/screenshot-placeholder.png)

## ✨ Features

- 🎲 **Three games**: Truth or Dare, Never Have I Ever, Would You Rather
- 📱 **Local mode**: Two players, one device — pass and play
- 📡 **Online mode**: Shared room with a 5-character code or invite link
- 🎚️ **Three levels**: Wholesome 🌸 · Flirty 💋 · Spicy 🔥 (age-gated)
- 🃏 **Smart deck**: No repeated cards until the whole deck is played
- ✍️ **Custom cards**: Add your own and save them locally
- 🎨 **Dark & light themes**, smooth flip animations, confetti on milestones
- ♿ **Accessible**: visible focus, good contrast, prefers-reduced-motion
- 🌍 **i18n ready**: All UI strings in `/i18n/en.json` — add translations easily
- 🔒 **Privacy**: Secret answers enforced server-side with Supabase RLS

## 🚀 Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/eachother-being-together.git
cd eachother-being-together

# 2. Install dependencies
npm install

# 3. Set up environment (online mode is optional)
cp .env.example .env
# Edit .env with your Supabase URL and anon key (see STEP 6 in the README)

# 4. Start the dev server
npm run dev
```

Then open http://localhost:5173 in your browser. For local-only play, you don't need Supabase.

## 🗂️ Project Structure

```
.
├── cards/                   # Question cards (JSON)
│   ├── truth-or-dare/
│   │   ├── wholesome.json
│   │   ├── flirty.json
│   │   └── spicy.json
│   ├── never-have-i-ever/
│   └── would-you-rather/
├── games/                   # Game modules (one folder per game)
│   ├── _template/           # Copy this to add a new game
│   ├── truth-or-dare/
│   ├── never-have-i-ever/
│   └── would-you-rather/
├── i18n/                    # Translations
│   └── en.json
├── src/
│   ├── lib/                 # Shared utilities (router, state, deck, supabase…)
│   ├── styles/              # CSS
│   └── views/               # Page views (home, setup, room, game, end)
├── supabase/
│   └── schema.sql           # Database schema + RLS policies
├── scripts/
│   └── validate-cards.js    # Card validation script
└── public/                  # Static assets (favicon, etc.)
```

## ⚙️ Supabase Setup (Online Mode)

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor → New Query**, paste `supabase/schema.sql`, click **Run**
3. Go to **Authentication → Providers**, enable **Anonymous Sign-ins**
4. Go to **Database → Realtime**, enable realtime for the `rooms` table
5. Go to **Project Settings → API**, copy your **Project URL** and **anon key**
6. Add them to your `.env`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
7. Restart `npm run dev` and test with two browser windows

## 🛠️ Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start dev server at localhost:5173 |
| `npm run build` | Build production files to `/dist` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint on `/src` |
| `npm run format` | Prettier format |
| `npm run validate-cards` | Validate all card JSON files |

## 🗺️ Roadmap

- [ ] 🎥 **Video call mode** — WebRTC video alongside the game
- [ ] 🎬 **Synced movie watching** — watch together with chat
- [ ] 💬 **In-game chat** — text chat in online rooms
- [ ] 🌍 **More languages** — Hindi, Spanish, French, Portuguese…
- [ ] 🎮 **More games** — Couples Trivia, Hot Seat, Finish the Sentence
- [ ] 🏆 **Persistent profiles** — streaks, badges, game history
- [ ] 📱 **PWA** — installable as a home screen app

## 🤝 Contributing

We 💕 contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for how to get started.

Please read our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) and [CONTENT_GUIDELINES.md](CONTENT_GUIDELINES.md) before contributing cards.

## 📄 License

MIT — see [LICENSE](LICENSE).

---

*For consenting adult couples. Skip anything you don't like.*
