import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass } from "lucide-react";

const QUOTES = [
  "“Tegalrejo boleh dibakar, semangat tak padam.” — Diponegoro",
  "“Adat basandi syarak, syarak basandi Kitabullah.” — Imam Bonjol",
  "“Sekali merdeka, tetap merdeka.”",
  "“Benteng kita adalah Iman.” — Imam Bonjol",
];

export function LoadingScreen() {
  const [show, setShow] = useState(true);
  const [q, setQ] = useState(QUOTES[0]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setQ(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    const seen = sessionStorage.getItem("hist_loaded");
    if (seen) { setShow(false); return; }
    const t = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem("hist_loaded", "1");
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[200] bg-parchment flex flex-col items-center justify-center px-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="text-maroon"
          >
            <Compass className="h-16 w-16" strokeWidth={1.2} />
          </motion.div>
          <div className="mt-6 text-[10px] uppercase tracking-[0.3em] text-maroon">Historia Nusantara</div>
          <div className="font-serif text-charcoal/80 italic mt-3 text-center max-w-md">{q}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
