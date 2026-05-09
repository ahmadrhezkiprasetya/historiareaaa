import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, X } from "lucide-react";
import { useGame } from "@/lib/game-context";
import { quizBank } from "@/lib/quiz-data";

export function DailyQuest() {
  const { dailyDate, completeDaily } = useGame();
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const today = new Date().toISOString().slice(0, 10);
  const q = useMemo(() => quizBank[Math.floor(Math.random() * quizBank.length)], [open]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (dailyDate !== today) {
      const t = setTimeout(() => setOpen(true), 2200);
      return () => clearTimeout(t);
    }
  }, [dailyDate, today]);

  function answer(i: number) {
    setPicked(i);
    setTimeout(() => {
      if (i === q.answer) completeDaily();
      setOpen(false);
      setPicked(null);
    }, 900);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] bg-charcoal/70 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
            className="relative bg-parchment border-2 border-maroon max-w-md w-full p-7 shadow-2xl">
            <button onClick={() => setOpen(false)} className="absolute top-3 right-3 text-charcoal/60 hover:text-maroon">
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-maroon">
              <Coins className="h-4 w-4" /> Daily Quest · 25 Koin
            </div>
            <h3 className="font-serif text-xl mt-3 text-charcoal">{q.question}</h3>
            <div className="mt-5 space-y-2">
              {q.options.map((o, i) => {
                const isC = picked !== null && i === q.answer;
                const isW = picked !== null && i === picked && i !== q.answer;
                return (
                  <button key={i} onClick={() => answer(i)} disabled={picked !== null}
                    className={`w-full text-left text-sm font-serif border px-3 py-2 transition ${
                      isC ? "border-maroon bg-maroon text-parchment" :
                      isW ? "border-destructive bg-destructive/10 text-destructive" :
                      "border-border hover:border-maroon"
                    }`}>
                    <span className="text-xs text-muted-foreground mr-2">{String.fromCharCode(65 + i)}.</span>{o}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
