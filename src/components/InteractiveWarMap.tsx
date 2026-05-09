import { useState } from "react";
import { battles } from "@/lib/battles-data";
import { motion } from "framer-motion";

export function InteractiveWarMap() {
  const [active, setActive] = useState<typeof battles[number] | null>(battles[0]);

  return (
    <div className="grid md:grid-cols-[1.6fr_1fr] gap-6 mt-10">
      <div className="relative aspect-[16/10] bg-gradient-to-br from-amber-100 to-stone-300 border border-charcoal/30 overflow-hidden paper-texture">
        {/* stylized map */}
        <svg viewBox="0 0 100 60" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          {/* Sumatra silhouette */}
          <path d="M10 10 L28 8 L34 22 L30 38 L20 50 L12 44 L8 28 Z" fill="#d8c89a" stroke="#6b4a20" strokeWidth="0.3" />
          {/* Java silhouette */}
          <path d="M40 50 L48 48 L60 52 L70 50 L78 54 L70 58 L50 58 L40 56 Z" fill="#d8c89a" stroke="#6b4a20" strokeWidth="0.3" />
          <text x="18" y="28" fontSize="2.4" fill="#6b4a20" fontStyle="italic" fontFamily="serif">Sumatra</text>
          <text x="58" y="56" fontSize="2.4" fill="#6b4a20" fontStyle="italic" fontFamily="serif">Jawa</text>
        </svg>

        {battles.map((b) => (
          <motion.button
            key={b.id}
            whileHover={{ scale: 1.4 }}
            onClick={() => setActive(b)}
            className="cursor-sword absolute -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${b.x}%`, top: `${b.y}%` }}
            title={b.name}
          >
            <span className={`block w-3 h-3 rounded-full border-2 border-parchment ${active?.id === b.id ? "bg-gold" : "bg-maroon"} shadow`} />
            <span className="opacity-0 group-hover:opacity-100 transition absolute left-4 top-0 whitespace-nowrap text-[10px] bg-charcoal text-parchment px-1.5 py-0.5 font-serif">
              {b.name}
            </span>
          </motion.button>
        ))}
      </div>

      <div className="border border-border bg-card p-6">
        <div className="text-[11px] uppercase tracking-[0.3em] text-maroon">Detail Skirmish</div>
        {active && (
          <motion.div key={active.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="font-serif text-2xl mt-2 text-charcoal">{active.name}</h3>
            <p className="text-xs italic text-muted-foreground">{active.year} · {active.region === "java" ? "Tanah Jawa" : "Ranah Minang"}</p>
            <div className="editorial-rule mt-3 w-12" />
            <p className="mt-4 text-sm leading-relaxed text-charcoal/85">{active.description}</p>
            <p className="mt-3 text-sm font-serif italic text-maroon">→ {active.outcome}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
