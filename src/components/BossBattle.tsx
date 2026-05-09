import { motion } from "framer-motion";
import { useState } from "react";
import { type Boss } from "@/lib/battles-data";
import { quizBank } from "@/lib/quiz-data";
import { Skull, Crown } from "lucide-react";

function pickThree() {
  const shuffled = [...quizBank].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

export function BossBattle({ boss, onResolve }: { boss: Boss; onResolve: (won: boolean) => void }) {
  const [questions] = useState(pickThree);
  const [round, setRound] = useState(0);
  const [bossHP, setBossHP] = useState(3);
  const [playerHP, setPlayerHP] = useState(3);
  const [picked, setPicked] = useState<number | null>(null);
  const [shaking, setShaking] = useState(false);

  const q = questions[round];

  function answer(i: number) {
    if (picked !== null) return;
    setPicked(i);
    const correct = i === q.answer;
    setShaking(true);
    setTimeout(() => setShaking(false), 500);

    setTimeout(() => {
      const newBoss = correct ? bossHP - 1 : bossHP;
      const newPlayer = correct ? playerHP : playerHP - 1;
      setBossHP(newBoss);
      setPlayerHP(newPlayer);

      if (newBoss <= 0) { onResolve(true); return; }
      if (newPlayer <= 0) { onResolve(false); return; }
      setRound((r) => (r + 1) % questions.length);
      setPicked(null);
    }, 900);
  }

  return (
    <div className="fixed inset-0 z-[70] bg-charcoal/95 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className={`max-w-2xl w-full bg-parchment border-2 border-maroon p-8 ${shaking ? "shake" : ""}`}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-maroon">Boss · Babak {round + 1}</div>
            <h2 className="font-serif text-2xl text-charcoal mt-1">{boss.name}</h2>
            <p className="text-xs italic text-muted-foreground">{boss.title}</p>
          </div>
          <div className="space-y-2">
            <HPBar label="Lawan" value={bossHP} max={3} icon={<Skull className="h-3.5 w-3.5" />} color="bg-charcoal" />
            <HPBar label="Anda" value={playerHP} max={3} icon={<Crown className="h-3.5 w-3.5" />} color="bg-maroon" />
          </div>
        </div>

        <p className="font-serif italic text-charcoal/70 border-l-2 border-maroon pl-4">{boss.intro}</p>

        <h3 className="mt-6 font-serif text-xl text-charcoal">{q.question}</h3>
        <div className="mt-4 space-y-2">
          {q.options.map((opt, i) => {
            const isPick = picked === i;
            const isAns = picked !== null && i === q.answer;
            const isWrong = picked !== null && isPick && i !== q.answer;
            return (
              <button key={i} onClick={() => answer(i)} disabled={picked !== null}
                className={`cursor-sword w-full text-left border px-4 py-3 transition font-serif ${
                  isAns ? "border-maroon bg-maroon text-parchment" :
                  isWrong ? "border-destructive bg-destructive/10 text-destructive" :
                  "border-border hover:border-maroon hover:bg-maroon/5"
                }`}>
                <span className="text-xs text-muted-foreground mr-3">{String.fromCharCode(65 + i)}.</span>{opt}
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

function HPBar({ label, value, max, icon, color }: { label: string; value: number; max: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="w-44">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
        {icon} {label}
      </div>
      <div className="flex gap-1">
        {Array.from({ length: max }).map((_, i) => (
          <div key={i} className={`h-2 flex-1 ${i < value ? color : "bg-border"}`} />
        ))}
      </div>
    </div>
  );
}
