## Digital Museum Excellence — Full Overhaul

This is a very large scope (5 modules, ~25 distinct features). I'll execute it as one cohesive sweep, but I want to confirm priorities and a few defaults before I start writing thousands of lines.

### What I'll build

**Module 1 — Visual & Immersive UX**
- Parallax scroll wrapper for `chronicles.tsx` (Framer Motion `useScroll` + `useTransform`), with quote layers that fade in/out per section.
- "Vintage / Modern" view toggle (global context → applies sepia + grain + paper texture overlay via CSS class on `<body>`).
- Reading progress indicator shaped like a Keris (SVG, fills via `scrollYProgress`), fixed left.
- Custom cursors: global SVG cursor that swaps between Quill / Sword based on hovered element class (`.cursor-quill`, `.cursor-sword`).

**Module 2 — Quest Gerilya 2.0**
- 3 levels (Hutan Selarong → Benteng Bonjol → Perundingan Magelang) with distinct map themes & enemy density.
- Boss battle at end of each level: multi-question "debate" (3 quiz rounds vs De Kock / Van den Bosch / Baron Sloet) with HP bars + Framer Motion clash animation.
- Inventory system: Kyai Wijayachapa (move range +1), Sorban Putih (1× immunity), Naskah Dakwah (2× quiz score). Items spawn on map, shown in sidebar, click to activate where relevant.
- Pre-combat clash animation (crossed swords, screen shake) before quiz/boss.
- Medal Room route `/medals` with all badges earned.

**Module 3 — AI Soul**
- Add Persona selector to `/pakar` (Diponegoro / Imam Bonjol).
- System prompt per persona with required speech patterns + sample phrases.
- Background swaps (candle-lit cave / mountain fort) via CSS gradients + texture.
- LocalStorage: player name (asked once), game progress summary injected into system prompt.
- Switch to **Lovable AI Gateway** (edge function) instead of user-supplied Gemini key — this is the recommended path. (Confirm in Q1.)

**Module 4 — Arsips & Maps**
- Interactive War Map component on `/chronicles`: SVG of Java/Sumatra with clickable battle pins → popover with skirmish details.
- Artifact Gallery route `/arsip` with masonry grid + tilt-on-hover (CSS 3D transform on mousemove). Click → full-screen deep-dive modal.
- i18n: lightweight ID/EN dictionary in `src/lib/i18n.tsx` with a context + `useT()` hook. Toggle in header.

**Module 5 — Technical Polish**
- Persist energy, lives, score, items, medals, level, playerName, language, viewMode in LocalStorage (extend `game-context.tsx`).
- Audio controller: global mute/volume in header, ambient loop per route (rainforest on quest, gamelan on chronicles, saluang on pakar). Uses Howler-like simple `<audio>` wrapper. (See Q2 for assets.)
- Framer Motion everywhere; install `framer-motion`.

### Files (created / heavily edited)

```
src/lib/
  game-context.tsx          (extended: items, medals, level, playerName, persistence)
  i18n.tsx                  (new — ID/EN provider + useT)
  view-context.tsx          (new — modern/vintage + audio + cursor state)
  audio-controller.tsx      (new)
  battles-data.ts           (new — skirmish pins, bosses, artifacts)
src/components/
  ParallaxSection.tsx
  KerisProgress.tsx
  CustomCursor.tsx
  ViewToggle.tsx
  LangToggle.tsx
  AudioToggle.tsx
  InteractiveWarMap.tsx
  TiltCard.tsx
  ClashAnimation.tsx
  BossBattle.tsx
  Inventory.tsx
src/routes/
  __root.tsx                (header: lang/view/audio toggles, cursor + progress mounts)
  chronicles.tsx            (parallax + war map)
  pakar.tsx                 (persona engine + dynamic bg + Lovable AI)
  quest.tsx                 (levels, inventory, boss, clash)
  medals.tsx                (new)
  arsip.tsx                 (new — artifact gallery)
src/routes/api/
  chat.ts                   (new — streaming Lovable AI edge function)
```

### Technical notes
- All new colors/textures via tokens in `src/styles.css` (sepia filter class, paper-grain SVG bg, persona gradients).
- Custom cursor uses `cursor: none` on `<body>` + a fixed-position element following pointer; falls back to default on touch devices.
- Tilt effect: pure React `onMouseMove` → CSS `transform: perspective(...) rotateX/Y`. No external lib.
- Boss battle: reuses quiz bank but in a 3-round structure with HP. Clash animation = motion.div with `animate={{ x: [0, -20, 20, 0], scale: [1, 1.2, 1] }}`.
- i18n: every UI string wrapped in `t('key')`. Content data (biographies) gets `_id`/`_en` fields; English versions will be concise translations of existing Indonesian copy.

### Scope realism
This is roughly 12–15 new files and major rewrites of 4 existing routes. I estimate the diff at ~3000–4000 lines. I'll build it in one pass but want your input on the questions below before starting.
