import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import { MapPin, Sword, Flag, Apple, Trees, RefreshCcw, Heart, Zap, Trophy, Award, ScrollText, Play, Shield, BookOpen as Book, Rabbit } from "lucide-react";
import { useGame, type ItemId } from "@/lib/game-context";
import { quizBank, type QuizQuestion } from "@/lib/quiz-data";
import { levels, bosses } from "@/lib/battles-data";
import { ClashAnimation } from "@/components/ClashAnimation";
import { BossBattle } from "@/components/BossBattle";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/quest")({
  head: () => ({
    meta: [
      { title: "Quest Gerilya 2.0 — War Room" },
      { name: "description", content: "Tactical Survival Map dengan tiga level, boss debate, dan inventory artefak." },
    ],
  }),
  component: Quest,
});

const SIZE = 5;
type TileKind = "empty" | "enemy" | "supply" | "goal" | "item";
type Tile = { kind: TileKind; revealed: boolean; itemId?: ItemId };
type Pos = { r: number; c: number };

const QUOTES = [
  "“Sekali merdeka, tetap merdeka.”",
  "“Adat basandi syarak, syarak basandi Kitabullah.” — Imam Bonjol",
  "“Tegalrejo boleh dibakar, semangat tak padam.” — Diponegoro",
  "“Benteng kita adalah Iman.” — Imam Bonjol",
];

const ITEM_META: Record<ItemId, { name: string; icon: React.ReactNode; effect: string }> = {
  horse: { name: "Kyai Wijayachapa", icon: <Rabbit className="h-4 w-4" />, effect: "Jangkauan +1 (otomatis aktif)" },
  sorban: { name: "Sorban Putih", icon: <Shield className="h-4 w-4" />, effect: "1× imun patroli (otomatis pakai)" },
  naskah: { name: "Naskah Dakwah", icon: <Book className="h-4 w-4" />, effect: "Skor kuis ×2 (otomatis aktif)" },
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

function pickQuiz(): QuizQuestion {
  return quizBank[ri(quizBank.length)];
}

const ITEM_POOL: ItemId[] = ["horse", "sorban", "naskah"];

function Quest() {
  const game = useGame();
  const { energy, lives, score, level, inventory, spend, restoreEnergy, loseLife, addScore, addItem, useItem, awardMedal, setLevel, reset } = game;

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
  const _ = goal; // unused but keep destructure shape

  const newRound = useCallback((lv: number) => {
    const dropItem = Math.random() < 0.5 ? ITEM_POOL[ri(ITEM_POOL.length)] : null;
    const m = buildMap(lv, dropItem);
    setMap(m);
    setPos(m.start);
  }, []);

  const startGame = () => {
    if (lives <= 0 || energy <= 0) reset();
    setWinsInLevel(0);
    setBossLossless(true);
    newRound(level);
    setPhase("playing");
    setFlash(`Level ${level + 1} dimulai: ${levels[level].name}`);
  };

  // out of lives → captured
  useEffect(() => {
    if ((phase === "playing" || phase === "boss") && lives <= 0) {
      setPhase("captured");
      setTrial(null);
    }
  }, [lives, phase]);

  // energy 0 → trial
  useEffect(() => {
    if (phase === "playing" && energy <= 0 && !trial && !clash) {
      setClash(true); setClashThen("trial");
    }
  }, [energy, phase, trial, clash]);

  function revealAt(p: Pos, t: Tile[][]) {
    const c = t.map((r) => r.map((x) => ({ ...x })));
    c[p.r][p.c].revealed = true;
    return c;
  }

  function tryMove(target: Pos) {
    if (phase !== "playing" || trial || clash) return;
    const range = inventory.horse > 0 ? 2 : 1;
    if (dist(pos, target) > range || dist(pos, target) === 0) {
      setFlash(`Hanya bisa pindah dalam jangkauan ${range}.`); return;
    }
    if (energy < 10) { setFlash("Energi tak cukup."); return; }
    spend(10);
    const newTiles = revealAt(target, tiles);
    setMap((m) => ({ ...m, tiles: newTiles }));
    setPos(target);
    const tile = newTiles[target.r][target.c];

    if (tile.kind === "enemy") {
      if (inventory.sorban > 0) {
        useItem("sorban");
        setFlash("Sorban Putih melindungi Anda dari patroli!");
      } else {
        loseLife();
        setFlash("Patroli Belanda! −1 nyawa.");
      }
      newTiles[target.r][target.c].kind = "empty";
      setMap((m) => ({ ...m, tiles: newTiles }));
    } else if (tile.kind === "supply") {
      restoreEnergy(20); addScore(5);
      newTiles[target.r][target.c].kind = "empty";
      setMap((m) => ({ ...m, tiles: newTiles }));
      setFlash("Logistik diamankan. +20 energi, +5 skor.");
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
        // boss time
        awardMedal("first_blood");
        setFlash(`Misi tuntas. Sang Jenderal menanti…`);
        setTimeout(() => { setClash(true); setClashThen("boss"); }, 700);
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
        setFlash(`Salah. Jawaban: "${trial.options[trial.answer]}". Anda dipulangkan.`);
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

  const quote = useMemo(() => QUOTES[ri(QUOTES.length)], [phase]);
  const lvCfg = levels[level];
  const currentBoss = bosses[level];

  return (
    <div className="fade-in mx-auto max-w-6xl px-6 py-12 cursor-quill">
      <header className="border-b border-border pb-6">
        <div className="text-[11px] uppercase tracking-[0.3em] text-maroon">Mode Permainan · 2.0</div>
        <h1 className="font-serif text-5xl text-charcoal mt-2">War Room</h1>
        <p className="mt-2 text-muted-foreground italic font-serif max-w-2xl">
          Tiga babak — tiga jenderal — satu nama. Satukan energi, kecerdasan, dan keberuntungan untuk meraih gelar Pahlawan Nasional.
        </p>
      </header>

      <section className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Stat icon={Heart} label="Nyawa" value={lives} max={3} />
        <Stat icon={Zap} label="Energi" value={Math.max(0, energy)} max={100} showBar />
        <Stat icon={Trophy} label="Skor" value={score} />
        <Stat icon={Award} label="Babak" value={level + 1} max={3} />
        <Stat icon={Flag} label="Misi" value={winsInLevel} max={2} />
      </section>

      {phase === "briefing" && <Briefing onStart={startGame} level={level} />}

      {phase === "captured" && (
        <Captured score={score} quote={quote}
          onRestart={() => { reset(); setLevel(0); setWinsInLevel(0); newRound(0); setPhase("briefing"); }} />
      )}

      {phase === "victory" && (
        <Victory score={score} onAgain={() => { reset(); setLevel(0); setWinsInLevel(0); newRound(0); setPhase("briefing"); }} />
      )}

      {(phase === "playing" || phase === "boss") && (
        <section className="mt-8 grid lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 relative p-5 shadow-2xl bg-gradient-to-br ${lvCfg.palette}`}>
            <div className="flex justify-between items-baseline">
              <div className="text-[11px] uppercase tracking-[0.3em] text-amber-200/80 mb-3 font-serif">{lvCfg.name}</div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-amber-200/60">{lvCfg.subtitle}</div>
            </div>
            <div className="grid grid-cols-5 gap-2">
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
                      onClick={() => tryMove({ r, c })}
                      disabled={!inRange || !!trial || clash}
                      className={`cursor-sword aspect-square border-2 ${bg} relative flex items-center justify-center transition-all
                        ${inRange && !trial && !clash ? "ring-1 ring-amber-200/50 hover:ring-2 hover:ring-amber-300" : ""}
                        ${here ? "ring-2 ring-amber-200 scale-105" : ""}`}
                      aria-label={`Tile ${r},${c}`}>
                      {here ? <MapPin className="h-6 w-6 text-amber-100 drop-shadow" />
                        : reveal && tile.kind === "enemy" ? <Sword className="h-5 w-5 text-red-100" />
                        : reveal && tile.kind === "supply" ? <Apple className="h-5 w-5 text-amber-50" />
                        : reveal && tile.kind === "item" ? <Award className="h-5 w-5 text-purple-100" />
                        : reveal && isGoal ? <Flag className="h-6 w-6 text-maroon" />
                        : <Trees className="h-4 w-4 text-emerald-300/60" />}
                    </motion.button>
                  );
                })
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-amber-100/80 font-serif">
              <Legend swatch="bg-emerald-800" label="Hutan" />
              <Legend swatch="bg-red-900" label="Patroli" />
              <Legend swatch="bg-amber-700" label="Logistik" />
              <Legend swatch="bg-purple-700" label="Artefak" />
              <Legend swatch="bg-yellow-500" label="Tujuan" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-border bg-card p-6">
              <h2 className="font-serif text-2xl text-maroon flex items-center gap-2"><ScrollText className="h-5 w-5" /> Catatan Lapangan</h2>
              <div className="editorial-rule mt-3 w-16" />
              <p className="mt-4 text-sm text-charcoal leading-relaxed font-serif min-h-[3em]">{flash}</p>
              <p className="mt-3 text-xs text-muted-foreground italic">2 misi → Boss · {currentBoss.name}</p>
            </div>

            <div className="border border-border bg-card p-6">
              <h2 className="font-serif text-xl text-maroon flex items-center gap-2"><Award className="h-4 w-4" /> Inventaris</h2>
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
              <p className="mt-3 text-[10px] text-muted-foreground italic leading-snug">
                Kuda menambah jangkauan ke 2. Sorban menyerap satu hit. Naskah menggandakan reward kuis.
              </p>
            </div>

            <button onClick={() => { reset(); setLevel(0); setWinsInLevel(0); newRound(0); setPhase("briefing"); }}
              className="cursor-sword w-full inline-flex items-center justify-center gap-2 border border-border px-4 py-2 hover:bg-maroon hover:text-parchment hover:border-maroon transition">
              <RefreshCcw className="h-4 w-4" /> Mulai Ulang
            </button>
          </div>
        </section>
      )}

      <ClashAnimation show={clash} onDone={() => {
        if (clashThen === "trial") { setTrial(pickQuiz()); setPicked(null); }
        else if (clashThen === "boss") { setPhase("boss"); }
        setClash(false); setClashThen(null);
      }} />

      <AnimatePresence>
        {trial && !clash && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-charcoal/80 flex items-center justify-center p-4">
            <div className="bg-parchment border-2 border-maroon max-w-xl w-full p-8 shadow-2xl">
              <div className="text-[11px] uppercase tracking-[0.3em] text-maroon">Knowledge Trial · {trial.topic}</div>
              <h3 className="font-serif text-2xl mt-3 text-charcoal">{trial.question}</h3>
              <div className="mt-6 space-y-2">
                {trial.options.map((opt, i) => {
                  const isP = picked === i;
                  const isC = picked !== null && i === trial.answer;
                  const isW = picked !== null && isP && i !== trial.answer;
                  return (
                    <button key={i} onClick={() => answerTrial(i)} disabled={picked !== null}
                      className={`cursor-sword w-full text-left border px-4 py-3 transition font-serif ${
                        isC ? "border-maroon bg-maroon text-parchment" :
                        isW ? "border-destructive bg-destructive/10 text-destructive" :
                        "border-border hover:border-maroon hover:bg-maroon/5"
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
    <section className="mt-8 border border-border bg-card p-8 text-center">
      <div className="text-[11px] uppercase tracking-[0.3em] text-maroon">Mission Briefing · Babak {level + 1}</div>
      <h2 className="font-serif text-3xl text-charcoal mt-3">{lv.name}</h2>
      <p className="text-xs italic text-muted-foreground">{lv.subtitle}</p>
      <div className="editorial-rule mt-3 w-24 mx-auto" />
      <p className="mt-5 text-charcoal/80 font-serif italic max-w-xl mx-auto leading-relaxed">
        Susuri petak demi petak, hindari patroli kolonial, raih logistik & artefak.
        Selesaikan dua misi — lalu hadapi Sang Jenderal dalam Tactical Stand-off.
      </p>
      <button onClick={onStart}
        className="cursor-sword mt-7 inline-flex items-center gap-2 bg-maroon text-parchment px-7 py-3 hover:bg-maroon-deep transition font-serif tracking-wide">
        <Play className="h-4 w-4" /> Mulai Babak
      </button>
    </section>
  );
}

function Captured({ score, quote, onRestart }: { score: number; quote: string; onRestart: () => void }) {
  return (
    <section className="mt-8 border-2 border-maroon bg-maroon/5 p-10 text-center">
      <div className="text-[11px] uppercase tracking-[0.3em] text-maroon">Captured</div>
      <h2 className="font-serif text-4xl text-maroon mt-3">Anda Tertangkap</h2>
      <div className="editorial-rule mt-3 w-24 mx-auto" />
      <p className="mt-6 text-charcoal font-serif italic text-lg max-w-xl mx-auto">{quote}</p>
      <p className="mt-4 text-sm text-muted-foreground">Skor akhir: <strong className="text-charcoal">{score}</strong></p>
      <button onClick={onRestart}
        className="cursor-sword mt-7 inline-flex items-center gap-2 bg-maroon text-parchment px-7 py-3 hover:bg-maroon-deep transition font-serif">
        <RefreshCcw className="h-4 w-4" /> Mulai dari Awal
      </button>
    </section>
  );
}

function Victory({ score, onAgain }: { score: number; onAgain: () => void }) {
  return (
    <motion.section initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className="mt-8 border-2 border-gold bg-gradient-to-br from-amber-50 to-amber-100 p-10 text-center">
      <Award className="h-16 w-16 text-maroon mx-auto" />
      <div className="text-[11px] uppercase tracking-[0.3em] text-maroon mt-3">Pahlawan Nasional</div>
      <h2 className="font-serif text-5xl text-maroon mt-3">Nama Anda Terukir</h2>
      <div className="editorial-rule mt-3 w-24 mx-auto" />
      <p className="mt-5 text-charcoal/80 font-serif italic max-w-xl mx-auto">
        Tiga babak tuntas. Babad menutup dengan nama Anda. Skor: <strong>{score}</strong>.
      </p>
      <div className="mt-7 flex justify-center gap-3">
        <Link to="/medals" className="cursor-sword inline-flex items-center gap-2 bg-maroon text-parchment px-6 py-3 hover:bg-maroon-deep transition font-serif">
          <Award className="h-4 w-4" /> Lihat Galeri Medali
        </Link>
        <button onClick={onAgain} className="cursor-sword inline-flex items-center gap-2 border border-maroon text-maroon px-6 py-3 hover:bg-maroon hover:text-parchment transition font-serif">
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
    <div className="border border-border bg-card p-3">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-maroon" /> {label}
      </div>
      <div className="font-serif text-2xl mt-1 text-charcoal">
        {value}{max ? <span className="text-sm text-muted-foreground"> / {max}</span> : null}
      </div>
      {showBar && (
        <div className="mt-2 h-1.5 bg-border overflow-hidden">
          <div className="h-full bg-maroon transition-all" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}
