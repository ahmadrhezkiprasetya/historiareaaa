import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { artifacts, type Artifact } from "@/lib/battles-data";
import { TiltCard } from "@/components/TiltCard";
import { motion, AnimatePresence } from "framer-motion";
import { X, ScrollText } from "lucide-react";

export const Route = createFileRoute("/arsip")({
  head: () => ({
    meta: [
      { title: "Arsip Artefak — Historia Nusantara" },
      { name: "description", content: "Galeri 3D artefak pahlawan: keris, naskah, sorban, dan saksi bisu perlawanan Nusantara." },
    ],
  }),
  component: Arsip,
});

function Arsip() {
  const [active, setActive] = useState<Artifact | null>(null);

  return (
    <div className="fade-in mx-auto max-w-7xl px-6 py-12 cursor-quill">
      <header className="border-b border-border pb-6">
        <div className="text-[11px] uppercase tracking-[0.3em] text-maroon">Arsip · Galeri</div>
        <h1 className="font-serif text-5xl text-charcoal mt-2">Artefak Para Pejuang</h1>
        <p className="mt-2 italic font-serif text-muted-foreground max-w-xl">
          Tilt — klik — selami. Setiap benda adalah pintu menuju babak yang nyaris terlupakan.
        </p>
      </header>

      <div className="mt-10 columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
        {artifacts.map((a) => (
          <TiltCard key={a.id} className="mb-6 break-inside-avoid">
            <button
              onClick={() => setActive(a)}
              className="cursor-sword block w-full text-left bg-card border border-border overflow-hidden group"
            >
              <div className={`tilt-inner aspect-[4/5] bg-gradient-to-br ${a.gradient} relative`}>
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent 60%)' }} />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-charcoal/80 to-transparent text-parchment">
                  <div className="text-[10px] uppercase tracking-[0.3em] opacity-80">{a.era}</div>
                  <div className="font-serif text-xl mt-1">{a.name}</div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-maroon">{a.hero}</p>
                <p className="mt-2 text-sm text-charcoal/80 leading-relaxed">{a.short}</p>
              </div>
            </button>
          </TiltCard>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-charcoal/90 flex items-center justify-center p-4"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-parchment max-w-3xl w-full grid md:grid-cols-2 max-h-[90vh] overflow-hidden border-2 border-maroon"
            >
              <div className={`bg-gradient-to-br ${active.gradient} aspect-square md:aspect-auto relative`}>
                <div className="absolute bottom-4 left-4 text-parchment">
                  <div className="text-[10px] uppercase tracking-[0.3em] opacity-80">{active.era}</div>
                  <div className="font-serif text-3xl">{active.name}</div>
                </div>
              </div>
              <div className="p-8 overflow-y-auto">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 text-maroon">
                    <ScrollText className="h-4 w-4" />
                    <span className="text-[11px] uppercase tracking-[0.3em]">Deep Dive</span>
                  </div>
                  <button onClick={() => setActive(null)} className="text-muted-foreground hover:text-maroon"><X className="h-5 w-5" /></button>
                </div>
                <h2 className="font-serif text-2xl text-charcoal mt-3">{active.name}</h2>
                <p className="text-xs italic text-muted-foreground">{active.hero} · {active.era}</p>
                <div className="editorial-rule mt-3 w-12" />
                <p className="mt-4 text-charcoal/85 leading-[1.8] text-sm">{active.deepDive}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
