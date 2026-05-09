import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/lib/game-context";

export function ShakeContainer({ children }: { children: ReactNode }) {
  const { shake } = useGame();
  const [tick, setTick] = useState(0);
  useEffect(() => { if (shake > 0) setTick((t) => t + 1); }, [shake]);
  return (
    <motion.div
      key={tick}
      animate={tick > 0 ? { x: [0, -8, 8, -5, 5, 0], y: [0, 3, -3, 2, -2, 0] } : {}}
      transition={{ duration: 0.45 }}
    >
      {children}
    </motion.div>
  );
}
