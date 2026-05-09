import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Footprints, Swords, Eye, Mountain, RefreshCcw, Heart, Zap, Trophy, ScrollText } from "lucide-react";
import { useGame } from "@/lib/game-context";
import { quizBank, type QuizQuestion } from "@/lib/quiz-data";

export const Route = createFileRoute("/quest")({
  head: () => ({
    meta: [
      { title: "Quest Gerilya — Historia Nusantara" },
      { name: "description", content: "Permainan strategi gerilya: kelola energi, nyawa, dan pengetahuan sejarah Anda." },
    ],
  }),
  component: Quest,
});

type Action = { id: string; label: string; cost: number; reward: number; icon: React.ComponentType<{ className?: string }>; flavor: string[] };

const actions: Action[] = [
  { id: "march", label: "Berbaris", cost: 10, reward: 5, icon: Footprints, flavor: ["Pasukan menyusuri lembah Selarong tanpa terlihat.", "Pijak demi pijak, kabut menutupi jejak gerilya."] },
  { id: "scout", label: "Intai", cost: 15, reward: 10, icon: Eye, flavor: ["Mata-mata kembali membawa peta posisi Belanda.", "Suatu kafilah kolonial terlihat menuju Magelang."] },
  { id: "ambush", label: "Sergap", cost: 30, reward: 25, icon: Swords, flavor: ["Sergapan kilat di tikungan jalan — musuh kalang-kabut.", "Tiga gerobak amunisi berhasil dirampas."] },
  { id: "fortify", label: "Bangun Benteng", cost: 25, reward: 15, icon: Mountain, flavor: ["Benteng tanah baru berdiri di tepi sungai.", "Bambu runcing ditanam mengelilingi surau."] },
];

function pickQuiz(): QuizQuestion {
  return quizBank[Math.floor(Math.random() * quizBank.length)];
}

function Quest() {
  const { energy, lives, score, spend, restoreEnergy, loseLife, addScore, reset } = useGame();
  const [log, setLog] = useState<string[]>(["Anda berdiri di mulut Goa Selarong. Embun pagi turun. Quest dimulai."]);
  const [trial, setTrial] = useState<QuizQuestion | null>(null);
  const [picked, setPicked] = useState<number | null>(null);

  const gameOver = lives <= 0;

  function pushLog(s: string) {
    setLog((l) => [s, ...l].slice(0, 12));
  }

  function doAction(a: Action) {
    if (gameOver || trial) return;
    if (energy < a.cost) {
      pushLog(`Energi tak cukup untuk ${a.label}. Saatnya Knowledge Trial!`);
      setTrial(pickQuiz());
      setPicked(null);
      return;
    }
    spend(a.cost);
    addScore(a.reward);
    pushLog(`${a.label} (+${a.reward} skor, −${a.cost} energi). ${a.flavor[Math.floor(Math.random() * a.flavor.length)]}`);

    // After spending, if energy reached 0, trigger trial
    if (energy - a.cost <= 0) {
      setTimeout(() => {
        pushLog("Pasukan kelelahan. Knowledge Trial dimulai untuk memulihkan energi.");
        setTrial(pickQuiz());
        setPicked(null);
      }, 200);
    }
  }

  function answerTrial(idx: number) {
    if (!trial || picked !== null) return;
    setPicked(idx);
    const correct = idx === trial.answer;
    setTimeout(() => {
      if (correct) {
        restoreEnergy(50);
        addScore(20);
        pushLog(`Benar! Pengetahuan tentang ${trial.topic} memulihkan 50 energi (+20 skor).`);
      } else {
        loseLife();
        pushLog(`Salah. Anda kehilangan 1 nyawa. Jawaban benar: "${trial.options[trial.answer]}".`);
      }
      setTrial(null);
      setPicked(null);
    }, 900);
  }

  const energyPct = useMemo(() => Math.max(0, Math.min(100, energy)), [energy]);

  return (
    <div className="fade-in mx-auto max-w-6xl px-6 py-12">
      <header className="border-b border-border pb-6">
        <div className="text-[11px] uppercase tracking-[0.3em] text-maroon">Mode Permainan</div>
        <h1 className="font-serif text-5xl text-charcoal mt-2">Quest Gerilya</h1>
        <p className="mt-2 text-muted-foreground italic font-serif max-w-2xl">
          Pimpin pasukan kecil di rimba dan ngarai Nusantara. Setiap aksi memakan energi. Saat energi habis, hanya pengetahuan sejarah yang dapat menyelamatkan Anda.
        </p>
      </header>

      {/* Stats */}
      <section className="mt-8 grid grid-cols-3 gap-4">
        <Stat icon={Heart} label="Nyawa" value={lives} max={3} color="bg-maroon" />
        <Stat icon={Zap} label="Energi" value={energyPct} max={100} color="bg-accent" showBar />
        <Stat icon={Trophy} label="Skor" value={score} color="bg-charcoal" />
      </section>

      <section className="mt-8 grid lg:grid-cols-3 gap-6">
        {/* Actions */}
        <div className="lg:col-span-2 border border-border bg-card p-6">
          <h2 className="font-serif text-2xl text-maroon">Aksi Gerilya</h2>
          <div className="editorial-rule mt-3 w-16" />
          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            {actions.map((a) => {
              const Icon = a.icon;
              const disabled = gameOver || !!trial;
              return (
                <button
                  key={a.id}
                  onClick={() => doAction(a)}
                  disabled={disabled}
                  className="group text-left border border-border p-5 hover:border-maroon hover:bg-maroon hover:text-parchment transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Icon className="h-6 w-6 text-maroon group-hover:text-parchment transition" />
                  <div className="font-serif text-xl mt-3">{a.label}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.2em] opacity-75">−{a.cost} energi · +{a.reward} skor</div>
                </button>
              );
            })}
          </div>

          {gameOver && (
            <div className="mt-6 border border-maroon bg-maroon/5 p-5 text-center">
              <div className="font-serif text-2xl text-maroon">Pasukan tumbang.</div>
              <p className="mt-2 text-sm text-charcoal/80">Skor akhir: <strong>{score}</strong>. Setiap perlawanan butuh ingatan.</p>
              <button onClick={reset} className="mt-4 inline-flex items-center gap-2 bg-maroon text-parchment px-5 py-2 hover:bg-maroon-deep">
                <RefreshCcw className="h-4 w-4" /> Mulai Ulang
              </button>
            </div>
          )}
        </div>

        {/* Log */}
        <div className="border border-border bg-card p-6">
          <h2 className="font-serif text-2xl text-maroon flex items-center gap-2"><ScrollText className="h-5 w-5" /> Catatan Harian</h2>
          <div className="editorial-rule mt-3 w-16" />
          <ol className="mt-4 space-y-3 text-sm">
            {log.map((l, i) => (
              <li key={i} className={`leading-relaxed ${i === 0 ? "text-charcoal" : "text-muted-foreground"}`}>
                <span className="font-serif text-maroon mr-2">§</span>{l}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Trial modal */}
      {trial && (
        <div className="fixed inset-0 z-50 bg-charcoal/70 flex items-center justify-center p-4">
          <div className="bg-parchment border border-maroon max-w-xl w-full p-8">
            <div className="text-[11px] uppercase tracking-[0.3em] text-maroon">Knowledge Trial · {trial.topic}</div>
            <h3 className="font-serif text-2xl mt-3 text-charcoal">{trial.question}</h3>
            <div className="mt-6 space-y-2">
              {trial.options.map((opt, i) => {
                const isPicked = picked === i;
                const isCorrect = picked !== null && i === trial.answer;
                const isWrongPick = picked !== null && isPicked && i !== trial.answer;
                return (
                  <button
                    key={i}
                    onClick={() => answerTrial(i)}
                    disabled={picked !== null}
                    className={`w-full text-left border px-4 py-3 transition font-serif ${
                      isCorrect ? "border-maroon bg-maroon text-parchment" :
                      isWrongPick ? "border-destructive bg-destructive/10 text-destructive" :
                      "border-border hover:border-maroon hover:bg-maroon/5"
                    }`}
                  >
                    <span className="text-xs text-muted-foreground mr-3">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>
            <p className="mt-5 text-xs text-muted-foreground italic">Jawaban benar: +50 energi & +20 skor. Salah: −1 nyawa.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  icon: Icon, label, value, max, color, showBar,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: number; max?: number; color: string; showBar?: boolean;
}) {
  const pct = max ? (value / max) * 100 : 100;
  return (
    <div className="border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
        <Icon className="h-4 w-4 text-maroon" /> {label}
      </div>
      <div className="font-serif text-3xl mt-2 text-charcoal">
        {value}{max && showBar ? <span className="text-base text-muted-foreground"> / {max}</span> : null}
      </div>
      {showBar && (
        <div className="mt-3 h-1.5 bg-border overflow-hidden">
          <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}
