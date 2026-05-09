import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import { MapPin, Sword, Flag, Apple, Trees, RefreshCcw, Heart, Zap, Trophy, Award, ScrollText, Play } from "lucide-react";
import { useGame } from "@/lib/game-context";
import { quizBank, type QuizQuestion } from "@/lib/quiz-data";

export const Route = createFileRoute("/quest")({
  head: () => ({
    meta: [
      { title: "Quest Gerilya — Tactical Survival Map" },
      { name: "description", content: "Permainan strategi peta gerilya: jelajahi medan perang, hindari patroli Belanda, dan capai tujuan misi." },
    ],
  }),
  component: Quest,
});

const SIZE = 5;
type TileKind = "empty" | "enemy" | "supply" | "goal";
type Tile = { kind: TileKind; revealed: boolean };
type Pos = { r: number; c: number };

const QUOTES = [
  "“Sekali merdeka, tetap merdeka.” — semangat para pejuang.",
  "“Adat basandi syarak, syarak basandi Kitabullah.” — Imam Bonjol",
  "“Lawan penjajah dengan iman dan strategi.” — pesan gerilya",
  "“Tegalrejo boleh dibakar, tapi semangat tak padam.” — Diponegoro",
];

function randInt(n: number) { return Math.floor(Math.random() * n); }
function randPos(): Pos { return { r: randInt(SIZE), c: randInt(SIZE) }; }
function eq(a: Pos, b: Pos) { return a.r === b.r && a.c === b.c; }
function adjacent(a: Pos, b: Pos) { return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1; }

function buildMap(): { tiles: Tile[][]; start: Pos; goal: Pos } {
  const tiles: Tile[][] = Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => ({ kind: "empty" as TileKind, revealed: false }))
  );
  const start = randPos();
  let goal = randPos();
  while (eq(goal, start)) goal = randPos();
  tiles[goal.r][goal.c].kind = "goal";

  const taken = new Set<string>([`${start.r},${start.c}`, `${goal.r},${goal.c}`]);
  const place = (kind: TileKind, count: number) => {
    let placed = 0;
    while (placed < count) {
      const p = randPos();
      const key = `${p.r},${p.c}`;
      if (taken.has(key)) continue;
      tiles[p.r][p.c].kind = kind;
      taken.add(key);
      placed++;
    }
  };
  place("enemy", 5);
  place("supply", 4);
  tiles[start.r][start.c].revealed = true;
  return { tiles, start, goal };
}

function pickQuiz(): QuizQuestion {
  return quizBank[Math.floor(Math.random() * Math.min(quizBank.length, 10))];
}

function Quest() {
  const { energy, lives, score, spend, restoreEnergy, loseLife, addScore, reset } = useGame();
  const [phase, setPhase] = useState<"briefing" | "playing" | "captured">("briefing");
  const [{ tiles, start, goal }, setMap] = useState(() => buildMap());
  const [pos, setPos] = useState<Pos>(start);
  const [wins, setWins] = useState(0);
  const [trial, setTrial] = useState<QuizQuestion | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [flash, setFlash] = useState<string>("");

  const newRound = useCallback(() => {
    const m = buildMap();
    setMap(m);
    setPos(m.start);
  }, []);

  const startGame = () => {
    reset();
    setWins(0);
    newRound();
    setPhase("playing");
    setFlash("Misi dimulai. Capai bendera tanpa terjebak patroli.");
  };

  // Trigger trial when energy hits 0
  useEffect(() => {
    if (phase === "playing" && energy <= 0 && !trial) {
      setTrial(pickQuiz());
      setPicked(null);
    }
  }, [energy, phase, trial]);

  // Capture when out of lives
  useEffect(() => {
    if (phase === "playing" && lives <= 0) {
      setPhase("captured");
      setTrial(null);
    }
  }, [lives, phase]);

  function revealAt(p: Pos, t: Tile[][]) {
    const copy = t.map((row) => row.map((x) => ({ ...x })));
    copy[p.r][p.c].revealed = true;
    return copy;
  }

  function tryMove(target: Pos) {
    if (phase !== "playing" || trial) return;
    if (!adjacent(pos, target)) { setFlash("Hanya bisa pindah ke tile bersebelahan."); return; }
    if (energy < 10) { setFlash("Energi tak cukup. Knowledge Trial akan dimulai."); return; }

    spend(10);
    const newTiles = revealAt(target, tiles);
    setMap((m) => ({ ...m, tiles: newTiles }));
    setPos(target);

    const tile = newTiles[target.r][target.c];
    if (tile.kind === "enemy") {
      loseLife();
      setFlash("Patroli Belanda! Anda kehilangan 1 nyawa.");
      // consume the enemy
      newTiles[target.r][target.c].kind = "empty";
      setMap((m) => ({ ...m, tiles: newTiles }));
    } else if (tile.kind === "supply") {
      restoreEnergy(20);
      addScore(5);
      newTiles[target.r][target.c].kind = "empty";
      setMap((m) => ({ ...m, tiles: newTiles }));
      setFlash("Logistik diamankan. +20 energi, +5 skor.");
    } else if (tile.kind === "goal") {
      addScore(50);
      const w = wins + 1;
      setWins(w);
      setFlash(`Misi tercapai! +50 skor. (${w}/3)`);
      if (w >= 3) {
        // keep playing but flag victory; show badge in UI
      }
      setTimeout(() => newRound(), 700);
    } else {
      setFlash("Hutan sunyi. Anda melanjutkan perjalanan.");
    }
  }

  function answerTrial(idx: number) {
    if (!trial || picked !== null) return;
    setPicked(idx);
    const correct = idx === trial.answer;
    setTimeout(() => {
      if (correct) {
        restoreEnergy(100);
        addScore(15);
        setFlash(`Benar! Pengetahuan tentang ${trial.topic} memulihkan energi penuh.`);
      } else {
        loseLife();
        setFlash(`Salah. "${trial.options[trial.answer]}". Anda dipulangkan ke titik awal.`);
        setPos(start);
        restoreEnergy(50);
      }
      setTrial(null);
      setPicked(null);
    }, 800);
  }

  const quote = useMemo(() => QUOTES[randInt(QUOTES.length)], [phase]);
  const energyPct = Math.max(0, Math.min(100, energy));

  return (
    <div className="fade-in mx-auto max-w-6xl px-6 py-12">
      <header className="border-b border-border pb-6">
        <div className="text-[11px] uppercase tracking-[0.3em] text-maroon">Mode Permainan</div>
        <h1 className="font-serif text-5xl text-charcoal mt-2">Tactical Survival Map</h1>
        <p className="mt-2 text-muted-foreground italic font-serif max-w-2xl">
          Sebuah simulasi gerilya 5×5. Hindari patroli, kumpulkan logistik, capai bendera misi tiga kali untuk meraih gelar Pahlawan Nasional.
        </p>
      </header>

      {/* Stats */}
      <section className="mt-6 grid grid-cols-4 gap-3">
        <Stat icon={Heart} label="Nyawa" value={lives} max={3} color="bg-maroon" />
        <Stat icon={Zap} label="Energi" value={energyPct} max={100} color="bg-accent" showBar />
        <Stat icon={Trophy} label="Skor" value={score} color="bg-charcoal" />
        <Stat icon={Award} label="Misi" value={wins} max={3} color="bg-maroon" />
      </section>

      {phase === "briefing" && (
        <Briefing onStart={startGame} />
      )}

      {phase === "captured" && (
        <Captured score={score} quote={quote} onRestart={() => { reset(); setWins(0); newRound(); setPhase("briefing"); }} />
      )}

      {phase === "playing" && (
        <section className="mt-8 grid lg:grid-cols-3 gap-6">
          {/* War Map */}
          <div className="lg:col-span-2 relative p-5 rounded-sm shadow-2xl"
            style={{
              background: "repeating-linear-gradient(90deg, #3b2417 0px, #4a2d1c 4px, #3b2417 8px, #2e1c12 12px), #2e1c12",
              boxShadow: "inset 0 0 60px rgba(0,0,0,0.6), 0 20px 40px rgba(0,0,0,0.4)",
            }}>
            <div className="text-[11px] uppercase tracking-[0.3em] text-amber-200/80 mb-3 font-serif">War Map · Hutan & Benteng</div>
            <div className="grid grid-cols-5 gap-2">
              {tiles.map((row, r) =>
                row.map((tile, c) => {
                  const here = pos.r === r && pos.c === c;
                  const isAdj = adjacent(pos, { r, c });
                  const isGoal = tile.kind === "goal";
                  const reveal = tile.revealed || here;

                  let bg = "bg-emerald-900/70 border-emerald-700"; // forest
                  if (reveal) {
                    if (tile.kind === "enemy") bg = "bg-red-900/80 border-red-700";
                    else if (tile.kind === "supply") bg = "bg-amber-700/70 border-amber-500";
                    else if (isGoal) bg = "bg-yellow-500 border-yellow-300";
                    else bg = "bg-emerald-800/80 border-emerald-600";
                  }

                  return (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => tryMove({ r, c })}
                      disabled={!isAdj || !!trial}
                      className={`aspect-square border-2 ${bg} relative flex items-center justify-center transition-all duration-150
                        ${isAdj && !trial ? "hover:scale-105 hover:ring-2 hover:ring-amber-300 cursor-pointer" : "cursor-default"}
                        ${here ? "ring-2 ring-amber-200 scale-105" : ""}`}
                      aria-label={`Tile ${r},${c}`}
                    >
                      {here ? (
                        <MapPin className="h-6 w-6 text-amber-100 drop-shadow" />
                      ) : reveal && tile.kind === "enemy" ? (
                        <Sword className="h-5 w-5 text-red-100" />
                      ) : reveal && tile.kind === "supply" ? (
                        <Apple className="h-5 w-5 text-amber-50" />
                      ) : reveal && isGoal ? (
                        <Flag className="h-6 w-6 text-maroon" />
                      ) : (
                        <Trees className="h-4 w-4 text-emerald-300/60" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-amber-100/80 font-serif">
              <Legend swatch="bg-emerald-800" label="Hutan" />
              <Legend swatch="bg-red-900" label="Patroli Belanda" />
              <Legend swatch="bg-amber-700" label="Logistik" />
              <Legend swatch="bg-yellow-500" label="Tujuan Misi" />
            </div>
          </div>

          {/* Side panel */}
          <div className="border border-border bg-card p-6">
            <h2 className="font-serif text-2xl text-maroon flex items-center gap-2"><ScrollText className="h-5 w-5" /> Catatan Lapangan</h2>
            <div className="editorial-rule mt-3 w-16" />
            <p className="mt-4 text-sm text-charcoal leading-relaxed font-serif">{flash}</p>
            <div className="mt-6 text-xs text-muted-foreground space-y-1">
              <p>• Pindah ke tile bersebelahan: <strong>−10 energi</strong></p>
              <p>• Patroli: <strong>−1 nyawa</strong></p>
              <p>• Logistik: <strong>+20 energi</strong></p>
              <p>• Bendera: <strong>+50 skor</strong>, peta diacak ulang</p>
              <p>• Energi 0 → <strong>Knowledge Trial</strong></p>
            </div>
            {wins >= 3 && (
              <div className="mt-6 border border-maroon bg-maroon/10 p-4 text-center">
                <Award className="h-8 w-8 text-maroon mx-auto" />
                <div className="font-serif text-xl text-maroon mt-2">Pahlawan Nasional</div>
                <p className="text-xs text-muted-foreground mt-1">Tiga misi tuntas. Nama Anda terukir di babad.</p>
              </div>
            )}
            <button onClick={() => { reset(); setWins(0); newRound(); setPhase("briefing"); }}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 border border-border px-4 py-2 hover:bg-maroon hover:text-parchment hover:border-maroon transition">
              <RefreshCcw className="h-4 w-4" /> Mulai Ulang
            </button>
          </div>
        </section>
      )}

      {/* Trial modal */}
      {trial && (
        <div className="fixed inset-0 z-50 bg-charcoal/80 flex items-center justify-center p-4 fade-in">
          <div className="bg-parchment border-2 border-maroon max-w-xl w-full p-8 shadow-2xl">
            <div className="text-[11px] uppercase tracking-[0.3em] text-maroon">Knowledge Trial · {trial.topic}</div>
            <h3 className="font-serif text-2xl mt-3 text-charcoal">{trial.question}</h3>
            <div className="mt-6 space-y-2">
              {trial.options.map((opt, i) => {
                const isPicked = picked === i;
                const isCorrect = picked !== null && i === trial.answer;
                const isWrongPick = picked !== null && isPicked && i !== trial.answer;
                return (
                  <button key={i} onClick={() => answerTrial(i)} disabled={picked !== null}
                    className={`w-full text-left border px-4 py-3 transition font-serif ${
                      isCorrect ? "border-maroon bg-maroon text-parchment" :
                      isWrongPick ? "border-destructive bg-destructive/10 text-destructive" :
                      "border-border hover:border-maroon hover:bg-maroon/5"
                    }`}>
                    <span className="text-xs text-muted-foreground mr-3">{String.fromCharCode(65 + i)}.</span>{opt}
                  </button>
                );
              })}
            </div>
            <p className="mt-5 text-xs text-muted-foreground italic">Benar: energi penuh & pertahankan posisi. Salah: −1 nyawa & kembali ke titik awal.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Briefing({ onStart }: { onStart: () => void }) {
  return (
    <section className="mt-8 border border-border bg-card p-8 text-center">
      <div className="text-[11px] uppercase tracking-[0.3em] text-maroon">Mission Briefing</div>
      <h2 className="font-serif text-3xl text-charcoal mt-3">Operasi Goa Selarong</h2>
      <div className="editorial-rule mt-3 w-24 mx-auto" />
      <p className="mt-5 text-charcoal/80 font-serif italic max-w-xl mx-auto leading-relaxed">
        Sang Pangeran membutuhkan kurir gerilya. Susuri lima petak demi lima petak hutan,
        hindari patroli kolonial, raih logistik tersembunyi, dan tegakkan bendera di posisi musuh.
        Tiga misi tuntas — Anda diangkat sebagai Pahlawan Nasional.
      </p>
      <button onClick={onStart}
        className="mt-7 inline-flex items-center gap-2 bg-maroon text-parchment px-7 py-3 hover:bg-maroon-deep transition font-serif tracking-wide">
        <Play className="h-4 w-4" /> Mulai Misi
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
      <p className="mt-4 text-sm text-muted-foreground">Skor akhir: <strong className="text-charcoal">{score}</strong>. Tubuh boleh terkurung, semangat tetap merdeka.</p>
      <button onClick={onRestart}
        className="mt-7 inline-flex items-center gap-2 bg-maroon text-parchment px-7 py-3 hover:bg-maroon-deep transition font-serif">
        <RefreshCcw className="h-4 w-4" /> Mulai dari Awal
      </button>
    </section>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-block w-3 h-3 ${swatch} border border-black/30`} /> {label}
    </div>
  );
}

function Stat({ icon: Icon, label, value, max, color, showBar }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: number; max?: number; color: string; showBar?: boolean;
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
          <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}
