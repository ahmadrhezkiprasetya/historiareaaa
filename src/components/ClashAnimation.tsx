import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords } from "lucide-react";

const CLASH_MS = 1200;

export function ClashAnimation({
  show,
  onAutoEnd,
  onDone,
}: {
  show: boolean;
  /** Called after CLASH_MS so the parent can flip `show` to false. */
  onAutoEnd?: () => void;
  /** Called after the exit animation completes. */
  onDone?: () => void;
}) {
  useEffect(() => {
    if (!show) return;
    console.log("[Clash] Started");
    const t = setTimeout(() => {
      onAutoEnd?.();
    }, CLASH_MS);
    return () => clearTimeout(t);
  }, [show, onAutoEnd]);

  return (
    <AnimatePresence
      onExitComplete={() => {
        console.log("[Clash] Ended");
        onDone?.();
      }}
    >
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[90] bg-charcoal/90 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.4, rotate: -20, opacity: 0 }}
            animate={{ scale: [0.4, 1.4, 1], rotate: [-20, 20, 0], opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="text-parchment"
          >
            <Swords className="h-32 w-32 text-gold drop-shadow-[0_0_20px_rgba(192,160,96,0.8)]" />
          </motion.div>
          <motion.div
            initial={{ x: -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 font-serif text-2xl text-parchment tracking-[0.3em] uppercase"
          >
            Bentrok!
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
