import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import { MapPin, Sword, Flag, Apple, Trees, RefreshCcw, Heart, Zap, Trophy, Award, ScrollText, Play, Shield, BookOpen as Book, Rabbit, CloudRain, Sun, Sparkles, Eye, Swords as SwordsIcon } from "lucide-react";
import { useGame, type ItemId, type SkillId, SKILL_COST, MAX_SKILL } from "@/lib/game-context";
import { quizBank, type QuizQuestion } from "@/lib/quiz-data";
import { levels, bosses } from "@/lib/battles-data";
import { ClashAnimation } from "@/components/ClashAnimation";
import { BossBattle } from "@/components/BossBattle";
import { motion, AnimatePresence } from "framer-motion";

type HeroChoice = "diponegoro" | "bonjol";

export const Route = createFileRoute("/quest")({
  head: () => ({
    meta: [
      { title: "Quest Gerilya 2.0 — War Room" },
      { name: "description", content: "Tactical Survival Map dengan tiga level, boss debate, cuaca dinamis, dan skill tree." },
    ],
  }),
  component: Quest,
});

const SIZE = 5;
type TileKind = "empty" | "enemy" | "supply" | "goal" | "item";
type Tile = { kind: TileKind; revealed: boolean; itemId?: ItemId };
type Pos = { r: number; c: number };
type Weather = "sunny" | "rainy";

const QUOTES = [
  "“Sekali merdeka, tetap merdeka.”",
  "“Adat basandi syarak, syarak basandi Kitabullah.” — Imam Bonjol",
  "“Tegalrejo boleh dibakar, semangat tak padam.” — Diponegoro",
  "“Benteng kita adalah Iman.” — Imam Bonjol",
];

const ITEM_META: Record<ItemId, { name: string; icon: React.ReactNode; effect: string }> = {
  horse: { name: "Kyai Wijayachapa", icon: <Rabbit className="h-4 w-4" />, effect: "Jangkauan +1" },
  sorban: { name: "Sorban Putih", icon: <Shield className="h-4 w-4" />, effect: "1× imun patroli" },
  naskah: { name: "Naskah Dakwah", icon: <Book className="h-4 w-4" />, effect: "Skor kuis ×2" },
  keris: { name: "Keris Pusaka", icon: <SwordsIcon className="h-4 w-4" />, effect: "Lewati 1 kuis berikutnya" },
};

function ri(n: number) { return Math.floor(Math.random() * n); }
function rp(): Pos { return { r: ri(SIZE), c: ri(SIZE) }; }
function eq(a: Pos, b: Pos) { return a.r === b.r && a.c === b.c; }
function dist(a: Pos, b: Pos) { return Math.abs(a.r - b.r) + Math.abs(a.c - b.c); }

function buildMap(level: number, includeItem: ItemId | null): { tiles: Tile[][]; start: Pos; goal: Pos } {
  const cfg = levels[level];
  const tiles: Tile[][] = Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => ({ kind: "empty" as TileKind, revealed: false }))
  );
  const start = rp();
  let goal = rp();
  while (eq(goal, start)) goal = rp();
  tiles[goal.r][goal.c].kind = "goal";
  const taken = new Set<string>([`${start.r},${start.c}`, `${goal.r},${goal.c}`]);
  const place = (kind: TileKind, count: number, itemId?: ItemId) => {
    let placed = 0; let tries = 0;
    while (placed < count && tries < 80) {
      tries++;
      const p = rp();
      const key = `${p.r},${p.c}`;
      if (taken.has(key)) continue;
      tiles[p.r][p.c].kind = kind;
      if (itemId) tiles[p.r][p.c].itemId = itemId;
      taken.add(key);
      placed++;
    }
  };
  place("enemy", cfg.enemyDensity);
  place("supply", cfg.supplyDensity);
  if (includeItem) place("item", 1, includeItem);
  tiles[start.r][start.c].revealed = true;
  return { tiles, start, goal };
}

const ITEM_POOL: ItemId[] = ["horse", "sorban", "naskah"];

// Charisma reduces wrong options shown.
function maskQuiz(q: QuizQuestion, charisma: number): QuizQuestion {
  const drop = Math.min(2, Math.max(0, charisma));
  if (drop === 0) return q;
  const wrong = q.options.map((_, i) => i).filter((i) => i !== q.answer);
  // shuffle wrong, drop `drop` of them
  for (let i = wrong.length - 1; i > 0; i--) { const j = ri(i + 1); [wrong[i], wrong[j]] = [wrong[j], wrong[i]]; }
  const removed = new Set(wrong.slice(0, drop));
  const keptIdx = q.options.map((_, i) => i).filter((i) => !removed.has(i));
  return {
    ...q,
    options: keptIdx.map((i) => q.options[i]),
    answer: keptIdx.indexOf(q.answer),
  };
}

function pickQuiz(charisma: number): QuizQuestion {
  return maskQuiz(quizBank[ri(quizBank.length)], charisma);
}

function Quest() {
  const game = useGame();
  const { energy, lives, score, level, inventory, gold, skills,
    spend, restoreEnergy, loseLife, gainLife, addScore, addGold, spendGold,
    addItem, useItem, awardMedal, setLevel, upgradeSkill, triggerShake, reset } = game;
  void addGold;

  const [heroChoice, setHeroChoice] = useState<HeroChoice | null>(null);
  const [phase, setPhase] = useState<"briefing" | "playing" | "boss" | "captured" | "victory">("briefing");
  const [{ tiles, start, goal }, setMap] = useState(() => buildMap(0, null));
  const [pos, setPos] = useState<Pos>(start);
  const [winsInLevel, setWinsInLevel] = useState(0);
  const [trial, setTrial] = useState<QuizQuestion | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [flash, setFlash] = useState<string>("");
  const [clash, setClash] = useState(false);
  const [clashThen, setClashThen] = useState<null | "trial" | "boss">(null);
  const [bossLossless, setBossLossless] = useState(true);
  const [weather, setWeather] = useState<Weather>("sunny");
  const [showSkills, setShowSkills] = useState(false);
  const _ = goal;

  const moveCost = Math.max(4, 10 - skills.stealth * 2);
  const sightRange = heroChoice === "diponegoro" ? 2 : 1;

  const triggerClash = useCallback((then: "trial" | "boss") => {
    // Keris bypass: if entering a "trial" clash and player owns a Keris,
    // consume it to skip the encounter entirely.
    if (then === "trial" && inventory.keris > 0) {
      useItem("keris");
      restoreEnergy(30);
      addScore(5);
      setFlash("Keris Pusaka berkilat — patroli kabur. Kuis dilewati.");
      console.log("[Clash] bypassed by Keris");
      return;
    }
    console.log("[Clash] trigger requested →", then);
    triggerShake();
    setClashThen(then);
    setClash(true);
  }, [triggerShake, inventory.keris, useItem, restoreEnergy, addScore]);

  const newRound = useCallback((lv: number) => {
    const dropItem = Math.random() < 0.5 ? ITEM_POOL[ri(ITEM_POOL.length)] : null;
    const m = buildMap(lv, dropItem);
    setMap(m);
    setPos(m.start);
    setWeather(Math.random() < 0.5 ? "sunny" : "rainy");
  }, []);

  const startGame = (choice: HeroChoice) => {
    setHeroChoice(choice);
    if (lives <= 0 || energy <= 0) reset();
    if (choice === "bonjol") gainLife(1);
    setWinsInLevel(0);
    setBossLossless(true);
    // Hard-clear any in-flight modal state to prevent stuck overlays.
    setTrial(null); setPicked(null); setClash(false); setClashThen(null);
    newRound(level);
    setPhase("playing");
    setFlash(
      choice === "bonjol"
        ? `Benteng Kokoh: nyawa cadangan diberikan. Babak: ${levels[level].name}`
        : `Taktik Gerilya: pandangan diperluas. Babak: ${levels[level].name}`
    );
  };

  const safeReset = useCallback(() => {
    // Hard reset all transient + global game state — used by "Reset Game" / crash recovery.
    setTrial(null); setPicked(null); setClash(false); setClashThen(null);
    setHeroChoice(null); setWinsInLevel(0); setBossLossless(true);
    reset(); setLevel(0);
    const m = buildMap(0, null); setMap(m); setPos(m.start); setWeather("sunny");
    setPhase("briefing");
    setFlash("");
    console.log("[Game] safe reset");
  }, [reset, setLevel]);

  useEffect(() => {
    if ((phase === "playing" || phase === "boss") && lives <= 0) {
      setPhase("captured");
      setTrial(null); setClash(false); setClashThen(null);
    }
  }, [lives, phase]);

  useEffect(() => {
    if (phase === "playing" && energy <= 0 && !trial && !clash) {
      triggerClash("trial");
    }
  }, [energy, phase, trial, clash, triggerClash]);

  function revealAt(p: Pos, t: Tile[][]) {
    const c = t.map((r) => r.map((x) => ({ ...x })));
    c[p.r][p.c].revealed = true;
    // sunny: reveal adjacent. rainy: only stepped tile (fog of war).
    // Diponegoro's "Taktik Gerilya": always reveal at radius `sightRange`.
    const radius = weather === "sunny" ? Math.max(1, sightRange) : Math.max(0, sightRange - 1);
    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        const md = Math.abs(dr) + Math.abs(dc);
        if (md === 0 || md > radius) continue;
        const nr = p.r + dr, nc = p.c + dc;
        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) c[nr][nc].revealed = true;
      }
    }
    return c;
  }

  function tryMove(target: Pos) {
    if (phase !== "playing" || trial || clash) return;
    const range = inventory.horse > 0 ? 2 : 1;
    if (dist(pos, target) > range || dist(pos, target) === 0) {
      setFlash(`Hanya bisa pindah dalam jangkauan ${range}.`); return;
    }
    if (energy < moveCost) { setFlash("Energi tak cukup."); return; }
    spend(moveCost);
    const newTiles = revealAt(target, tiles);
    setMap((m) => ({ ...m, tiles: newTiles }));
    setPos(target);
    const tile = newTiles[target.r][target.c];

    if (tile.kind === "enemy") {
      newTiles[target.r][target.c].kind = "empty";
      setMap((m) => ({ ...m, tiles: newTiles }));
      if (inventory.sorban > 0) {
        useItem("sorban");
        setFlash("Sorban Putih melindungi Anda dari patroli!");
      } else {
        setFlash("Patroli Belanda! Hadapi dalam Knowledge Trial.");
        triggerClash("trial");
      }
    } else if (tile.kind === "supply") {
      // Loot system: 35% Keris item, otherwise +20 energy.
      const lootKeris = Math.random() < 0.35;
      if (lootKeris) {
        addItem("keris"); addScore(5);
        setFlash("Logistik berisi Keris Pusaka! Lewati 1 kuis berikutnya.");
      } else {
        restoreEnergy(20); addScore(5);
        setFlash("Logistik diamankan. +20 energi, +5 skor.");
      }
      newTiles[target.r][target.c].kind = "empty";
      setMap((m) => ({ ...m, tiles: newTiles }));
    } else if (tile.kind === "item" && tile.itemId) {
      addItem(tile.itemId);
      setFlash(`Artefak ditemukan: ${ITEM_META[tile.itemId].name}!`);
      newTiles[target.r][target.c].kind = "empty";
      newTiles[target.r][target.c].itemId = undefined;
      setMap((m) => ({ ...m, tiles: newTiles }));
    } else if (tile.kind === "goal") {
      addScore(50);
      const w = winsInLevel + 1;
      setWinsInLevel(w);
      if (w >= 2) {
        awardMedal("first_blood");
        setFlash(`Misi tuntas. Sang Jenderal menanti…`);
        setTimeout(() => triggerClash("boss"), 600);
      } else {
        setFlash(`Misi tercapai! +50 skor. Misi berikut menanti.`);
        setTimeout(() => newRound(level), 700);
      }
    } else {
      setFlash("Hutan sunyi. Anda terus melangkah.");
    }
  }

  function answerTrial(idx: number) {
    if (!trial || picked !== null) return;
    setPicked(idx);
    const correct = idx === trial.answer;
    setTimeout(() => {
      if (correct) {
        restoreEnergy(100);
        addScore(15 * (inventory.naskah > 0 ? 2 : 1));
        if (inventory.naskah > 0) useItem("naskah");
        setFlash(`Benar! Pengetahuan memulihkan energi penuh.`);
      } else {
        loseLife();
        setPos(start);
        restoreEnergy(50);
        setFlash(`Salah. Anda dipulangkan.`);
      }
      setTrial(null); setPicked(null);
    }, 800);
  }

  function onBossResolve(won: boolean) {
    if (won) {
      addScore(200);
      const medalMap = ["hutan_clear", "bonjol_clear", "magelang_clear"] as const;
      awardMedal(medalMap[level]);
      if (bossLossless) awardMedal("perfect_quiz");
      if (level >= 2) {
        awardMedal("pahlawan");
        setPhase("victory");
        return;
      }
      setLevel(level + 1);
      restoreEnergy(100);
      setWinsInLevel(0);
      newRound(level + 1);
      setPhase("playing");
      setFlash(`Babak ${level + 2}: ${levels[level + 1].name}`);
    } else {
      loseLife();
      setPhase(lives - 1 <= 0 ? "captured" : "playing");
    }
    setBossLossless(true);
  }

  function buyPowerup(kind: "energy" | "life") {
    const cost = kind === "energy" ? 10 : 30;
    if (!spendGold(cost)) { setFlash("Koin tak cukup."); return; }
    if (kind === "energy") { restoreEnergy(50); setFlash("Energi +50 dari kedai pasar."); }
    else { /* life cap */ if (lives < 3) { /* hack: addScore as side */ }
      // Simplify: refill energy fully + small score; we don't have +life setter, so alt:
      restoreEnergy(100); addScore(10); setFlash("Doa & ramuan: energi penuh, +10 skor."); }
  }

  const quote = useMemo(() => QUOTES[ri(QUOTES.length)], [phase]);
  const lvCfg = levels[level];
  const currentBoss = bosses[level];

  return (
    <div className="fade-in mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-12 cursor-quill">
      <header className="border-b border-border pb-4 sm:pb-6">
        <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-maroon">Mode Permainan · 2.0</div>
        <h1 className="font-serif text-charcoal mt-2">War Room</h1>
        <p className="mt-2 text-muted-foreground italic font-serif max-w-2xl text-sm sm:text-base">
          Tiga babak — tiga jenderal — satu nama. Cuaca berubah. Skill berkembang.
        </p>
      </header>

      <section className="mt-4 sm:mt-6 grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
        <Stat icon={Heart} label="Nyawa" value={lives} max={3} />
        <Stat icon={Zap} label="Energi" value={Math.max(0, energy)} max={100} showBar />
        <Stat icon={Trophy} label="Skor" value={score} />
        <Stat icon={Award} label="Babak" value={level + 1} max={3} />
        <Stat icon={Flag} label="Misi" value={winsInLevel} max={2} />
      </section>

      {phase === "briefing" && <Briefing onStart={startGame} level={level} />}

      {phase === "captured" && (
        <Captured score={score} quote={quote} onRestart={safeReset} />
      )}

      {phase === "victory" && (
        <Victory score={score} onAgain={safeReset} />
      )}

      {(phase === "playing" || phase === "boss") && (
        <section className="mt-6 sm:mt-8 grid lg:grid-cols-3 gap-4 sm:gap-6">
          <div className={`lg:col-span-2 relative p-3 sm:p-5 shadow-2xl bg-gradient-to-br ${lvCfg.palette} ${weather === "rainy" ? "weather-rain" : "weather-sunny"} overflow-hidden`}>
            <div className="flex justify-between items-baseline gap-2 flex-wrap">
              <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-amber-200/80 mb-3 font-serif">{lvCfg.name}</div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-amber-200/80">
                {weather === "rainy" ? <CloudRain className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
                {weather === "rainy" ? "Hujan · Fog" : "Cerah · Pandangan luas"}
              </div>
            </div>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2 max-w-full">
              {tiles.map((row, r) =>
                row.map((tile, c) => {
                  const here = pos.r === r && pos.c === c;
                  const range = inventory.horse > 0 ? 2 : 1;
                  const inRange = dist(pos, { r, c }) > 0 && dist(pos, { r, c }) <= range;
                  const isGoal = tile.kind === "goal";
                  const reveal = tile.revealed || here;

                  let bg = "bg-emerald-900/70 border-emerald-700";
                  if (reveal) {
                    if (tile.kind === "enemy") bg = "bg-red-900/80 border-red-700";
                    else if (tile.kind === "supply") bg = "bg-amber-700/70 border-amber-500";
                    else if (tile.kind === "item") bg = "bg-purple-700/70 border-purple-500";
                    else if (isGoal) bg = "bg-yellow-500 border-yellow-300";
                    else bg = "bg-emerald-800/80 border-emerald-600";
                  }
                  return (
                    <motion.button key={`${r}-${c}`}
                      whileHover={inRange ? { scale: 1.08 } : {}}
                      whileTap={inRange ? { scale: 0.92 } : {}}
                      onClick={() => tryMove({ r, c })}
                      disabled={!inRange || !!trial || clash}
                      className={`cursor-sword aspect-square border-2 ${bg} relative flex items-center justify-center transition-all touch-manipulation
                        ${inRange && !trial && !clash ? "ring-1 ring-amber-200/50" : ""}
                        ${here ? "ring-2 ring-amber-200 scale-105" : ""}`}
                      aria-label={`Tile ${r},${c}`}>
                      {here ? <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-amber-100 drop-shadow" />
                        : reveal && tile.kind === "enemy" ? <Sword className="h-4 w-4 sm:h-5 sm:w-5 text-red-100" />
                        : reveal && tile.kind === "supply" ? <Apple className="h-4 w-4 sm:h-5 sm:w-5 text-amber-50" />
                        : reveal && tile.kind === "item" ? <Award className="h-4 w-4 sm:h-5 sm:w-5 text-purple-100" />
                        : reveal && isGoal ? <Flag className="h-5 w-5 sm:h-6 sm:w-6 text-maroon" />
                        : <Trees className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-300/60" />}
                    </motion.button>
                  );
                })
              )}
            </div>
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-3 text-[10px] sm:text-[11px] text-amber-100/80 font-serif relative z-10">
              <Legend swatch="bg-emerald-800" label="Hutan" />
              <Legend swatch="bg-red-900" label="Patroli" />
              <Legend swatch="bg-amber-700" label="Logistik" />
              <Legend swatch="bg-purple-700" label="Artefak" />
              <Legend swatch="bg-yellow-500" label="Tujuan" />
              <span className="text-amber-100/60">· Energi/langkah: <strong className="text-amber-100">{moveCost}</strong></span>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="border border-border bg-card p-4 sm:p-6">
              <h2 className="font-serif text-xl sm:text-2xl text-maroon flex items-center gap-2"><ScrollText className="h-5 w-5" /> Catatan Lapangan</h2>
              <div className="editorial-rule mt-3 w-16" />
              <p className="mt-3 sm:mt-4 text-sm text-charcoal leading-relaxed font-serif min-h-[3em]">{flash}</p>
              <p className="mt-2 sm:mt-3 text-xs text-muted-foreground italic">2 misi → Boss · {currentBoss.name}</p>
            </div>

            <div className="border border-border bg-card p-4 sm:p-6">
              <button onClick={() => setShowSkills((s) => !s)} className="w-full text-left">
                <h2 className="font-serif text-lg sm:text-xl text-maroon flex items-center justify-between">
                  <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> Skill Tree</span>
                  <span className="text-xs text-muted-foreground">{showSkills ? "−" : "+"}</span>
                </h2>
              </button>
              {showSkills && (
                <div className="mt-3 space-y-3">
                  {(["stealth", "charisma"] as SkillId[]).map((id) => {
                    const lvl = skills[id];
                    const cost = lvl < MAX_SKILL ? SKILL_COST[lvl] : null;
                    const meta = id === "stealth"
                      ? { name: "Stealth", desc: `Energi/langkah: ${Math.max(4, 10 - lvl * 2)}` }
                      : { name: "Charisma", desc: `Kuis: ${lvl} pilihan dieliminasi` };
                    return (
                      <div key={id} className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-serif text-sm">{meta.name} <span className="text-xs text-muted-foreground">Lv.{lvl}/{MAX_SKILL}</span></div>
                          <div className="text-[11px] text-muted-foreground">{meta.desc}</div>
                        </div>
                        <button
                          disabled={cost === null || score < cost}
                          onClick={() => { if (upgradeSkill(id)) setFlash(`${meta.name} naik ke Lv.${lvl + 1}!`); }}
                          className="cursor-sword text-xs border border-maroon px-2 py-1 text-maroon hover:bg-maroon hover:text-parchment disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          {cost === null ? "MAX" : `−${cost} Skor`}
                        </button>
                      </div>
                    );
                  })}
                  <div className="border-t border-border pt-3">
                    <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">Pasar Koin</div>
                    <div className="flex gap-2">
                      <button onClick={() => buyPowerup("energy")}
                        className="cursor-sword flex-1 text-[11px] border border-amber-600 text-amber-700 px-2 py-1.5 hover:bg-amber-50 transition">
                        Energi +50 · 10 koin
                      </button>
                      <button onClick={() => buyPowerup("life")}
                        className="cursor-sword flex-1 text-[11px] border border-amber-600 text-amber-700 px-2 py-1.5 hover:bg-amber-50 transition">
                        Doa & Ramuan · 30 koin
                      </button>
                    </div>
                    <p className="mt-2 text-[10px] text-muted-foreground">Koin: <strong>{gold}</strong> · dari Daily Quest.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="border border-border bg-card p-4 sm:p-6">
              <h2 className="font-serif text-lg sm:text-xl text-maroon flex items-center gap-2"><Award className="h-4 w-4" /> Inventaris</h2>
              <div className="editorial-rule mt-3 w-12" />
              <ul className="mt-3 space-y-2 text-sm">
                {(Object.keys(ITEM_META) as ItemId[]).map((id) => (
                  <li key={id} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-charcoal/85">
                      <span className="text-maroon">{ITEM_META[id].icon}</span>
                      <span className="font-serif">{ITEM_META[id].name}</span>
                    </span>
                    <span className="font-mono text-xs text-charcoal">×{inventory[id]}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button onClick={safeReset}
              className="cursor-sword w-full inline-flex items-center justify-center gap-2 border border-border px-4 py-2 hover:bg-maroon hover:text-parchment hover:border-maroon transition">
              <RefreshCcw className="h-4 w-4" /> Reset Game
            </button>
          </div>
        </section>
      )}

      <ClashAnimation
        show={clash}
        onAutoEnd={() => setClash(false)}
        onDone={() => {
          const next = clashThen;
          setClashThen(null);
          if (next === "trial") { setTrial(pickQuiz(skills.charisma)); setPicked(null); }
          else if (next === "boss") { setPhase("boss"); }
        }}
      />

      <AnimatePresence>
        {trial && !clash && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-charcoal/85 flex items-center justify-center p-4 isolate">
            <div className="bg-parchment border-2 border-maroon max-w-xl w-full p-6 sm:p-8 shadow-2xl">
              <div className="text-[11px] uppercase tracking-[0.3em] text-maroon flex items-center justify-between gap-2">
                <span>Knowledge Trial · {trial.topic}</span>
                {skills.charisma > 0 && <span className="flex items-center gap-1 normal-case tracking-normal text-[10px] italic text-amber-700"><Eye className="h-3 w-3" /> Charisma aktif</span>}
              </div>
              <h3 className="font-serif text-xl sm:text-2xl mt-3 text-charcoal">{trial.question}</h3>
              <div className="mt-5 sm:mt-6 space-y-2">
                {trial.options.map((opt, i) => {
                  const isP = picked === i;
                  const isC = picked !== null && i === trial.answer;
                  const isW = picked !== null && isP && i !== trial.answer;
                  return (
                    <button key={i} onClick={() => answerTrial(i)} disabled={picked !== null}
                      className={`cursor-sword w-full text-left border px-3 sm:px-4 py-2.5 sm:py-3 transition font-serif touch-manipulation ${
                        isC ? "border-maroon bg-maroon text-parchment" :
                        isW ? "border-destructive bg-destructive/10 text-destructive" :
                        "border-border hover:border-maroon hover:bg-maroon/5 active:bg-maroon/10"
                      }`}>
                      <span className="text-xs text-muted-foreground mr-3">{String.fromCharCode(65 + i)}.</span>{opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "boss" && !clash && <BossBattle boss={currentBoss} onResolve={onBossResolve} />}
    </div>
  );
}

function Briefing({ onStart, level }: { onStart: () => void; level: number }) {
  const lv = levels[level];
  return (
    <section className="mt-6 sm:mt-8 border border-border bg-card p-6 sm:p-8 text-center">
      <div className="text-[11px] uppercase tracking-[0.3em] text-maroon">Mission Briefing · Babak {level + 1}</div>
      <h2 className="font-serif text-charcoal mt-3">{lv.name}</h2>
      <p className="text-xs italic text-muted-foreground">{lv.subtitle}</p>
      <div className="editorial-rule mt-3 w-24 mx-auto" />
      <p className="mt-5 text-charcoal/80 font-serif italic max-w-xl mx-auto leading-relaxed text-sm sm:text-base">
        Susuri petak demi petak, hindari patroli kolonial, raih logistik & artefak.
        Selesaikan dua misi — lalu hadapi Sang Jenderal dalam Tactical Stand-off.
      </p>
      <button onClick={onStart}
        className="cursor-sword mt-6 sm:mt-7 inline-flex items-center gap-2 bg-maroon text-parchment px-6 sm:px-7 py-3 hover:bg-maroon-deep transition font-serif tracking-wide active:scale-95 touch-manipulation">
        <Play className="h-4 w-4" /> Mulai Babak
      </button>
    </section>
  );
}

function Captured({ score, quote, onRestart }: { score: number; quote: string; onRestart: () => void }) {
  return (
    <section className="mt-6 sm:mt-8 border-2 border-maroon bg-maroon/5 p-6 sm:p-10 text-center">
      <div className="text-[11px] uppercase tracking-[0.3em] text-maroon">Captured</div>
      <h2 className="font-serif text-maroon mt-3">Anda Tertangkap</h2>
      <div className="editorial-rule mt-3 w-24 mx-auto" />
      <p className="mt-5 sm:mt-6 text-charcoal font-serif italic text-base sm:text-lg max-w-xl mx-auto">{quote}</p>
      <p className="mt-4 text-sm text-muted-foreground">Skor akhir: <strong className="text-charcoal">{score}</strong></p>
      <button onClick={onRestart}
        className="cursor-sword mt-6 sm:mt-7 inline-flex items-center gap-2 bg-maroon text-parchment px-6 sm:px-7 py-3 hover:bg-maroon-deep transition font-serif active:scale-95 touch-manipulation">
        <RefreshCcw className="h-4 w-4" /> Mulai dari Awal
      </button>
    </section>
  );
}

function Victory({ score, onAgain }: { score: number; onAgain: () => void }) {
  return (
    <motion.section initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className="mt-6 sm:mt-8 border-2 border-gold bg-gradient-to-br from-amber-50 to-amber-100 p-6 sm:p-10 text-center">
      <Award className="h-16 w-16 text-maroon mx-auto" />
      <div className="text-[11px] uppercase tracking-[0.3em] text-maroon mt-3">Pahlawan Nasional</div>
      <h2 className="font-serif text-maroon mt-3">Nama Anda Terukir</h2>
      <div className="editorial-rule mt-3 w-24 mx-auto" />
      <p className="mt-5 text-charcoal/80 font-serif italic max-w-xl mx-auto">
        Tiga babak tuntas. Babad menutup dengan nama Anda. Skor: <strong>{score}</strong>.
      </p>
      <div className="mt-6 sm:mt-7 flex flex-col sm:flex-row justify-center gap-3">
        <Link to="/medals" className="cursor-sword inline-flex items-center justify-center gap-2 bg-maroon text-parchment px-6 py-3 hover:bg-maroon-deep transition font-serif active:scale-95 touch-manipulation">
          <Award className="h-4 w-4" /> Lihat Galeri Medali
        </Link>
        <button onClick={onAgain} className="cursor-sword inline-flex items-center justify-center gap-2 border border-maroon text-maroon px-6 py-3 hover:bg-maroon hover:text-parchment transition font-serif active:scale-95 touch-manipulation">
          <RefreshCcw className="h-4 w-4" /> Main Lagi
        </button>
      </div>
    </motion.section>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return <div className="flex items-center gap-1.5"><span className={`inline-block w-3 h-3 ${swatch} border border-black/30`} /> {label}</div>;
}

function Stat({ icon: Icon, label, value, max, showBar }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: number; max?: number; showBar?: boolean;
}) {
  const pct = max ? (value / max) * 100 : 100;
  return (
    <div className="border border-border bg-card p-2 sm:p-3">
      <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-maroon" /> {label}
      </div>
      <div className="font-serif text-xl sm:text-2xl mt-1 text-charcoal">
        {value}{max ? <span className="text-xs sm:text-sm text-muted-foreground"> / {max}</span> : null}
      </div>
      {showBar && (
        <div className="mt-2 h-1.5 bg-border overflow-hidden">
          <div className="h-full bg-maroon transition-all" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}
