import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hourglass } from "lucide-react";
import { useView } from "@/lib/view-context";

export function TimeTravel() {
  const { view, toggleView } = useView();
  const [sweeping, setSweeping] = useState(false);

  function trigger() {
    if (sweeping) return;
    setSweeping(true);
    setTimeout(() => toggleView(), 350);
    setTimeout(() => setSweeping(false), 1100);
  }

  return (
    <>
      <button
        onClick={trigger}
        className="cursor-sword fixed z-40 right-4 bottom-20 md:bottom-6 bg-maroon text-parchment p-3 rounded-full shadow-2xl hover:bg-maroon-deep transition active:scale-95 touch-manipulation"
        title={view === "modern" ? "Lompat ke 1825" : "Kembali ke 2024"}
        aria-label="Time travel toggle"
      >
        <Hourglass className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {sweeping && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: "easeInOut" }}
            className="pointer-events-none fixed inset-0 z-[150]"
            style={{
              background: "linear-gradient(110deg, transparent 0%, rgba(74,4,4,0.35) 35%, rgba(251,250,245,0.95) 50%, rgba(74,4,4,0.35) 65%, transparent 100%)",
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
