import { createFileRoute } from "@tanstack/react-router";
import { heroes } from "@/lib/heroes-data";
import { Calendar, Compass } from "lucide-react";
import { useScroll, useTransform, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { InteractiveWarMap } from "@/components/InteractiveWarMap";
import { AudioGuide } from "@/components/AudioGuide";
import { useGame } from "@/lib/game-context";

export const Route = createFileRoute("/chronicles")({
  head: () => ({
    meta: [
      { title: "Babad Pahlawan — Historia Nusantara" },
      { name: "description", content: "Narasi panjang Pangeran Diponegoro dan Tuanku Imam Bonjol — parallax storytelling, garis waktu, dan peta perang interaktif." },
    ],
  }),
  component: Chronicles,
});

const QUOTES: Record<string, string> = {
  diponegoro: "“Tegalrejo boleh dibakar, semangat tak padam.”",
  bonjol: "“Adat basandi syarak, syarak basandi Kitabullah.”",
};

function ParallaxHero({ hero, idx }: { hero: typeof heroes[number]; idx: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yBg = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const yFg = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);
  const opQuote = useTransform(scrollYProgress, [0.1, 0.4, 0.6, 0.9], [0, 1, 1, 0]);

  return (
    <div ref={ref} className="relative h-[80vh] overflow-hidden border-y border-border">
      <motion.div style={{ y: yBg }} className={`absolute inset-0 -top-[20%] -bottom-[20%] bg-gradient-to-br ${hero.portraitGradient}`}>
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 60% 30%, rgba(255,255,255,0.4), transparent 60%)' }} />
      </motion.div>
      <motion.div style={{ y: yFg }} className="relative h-full flex flex-col items-center justify-center px-6 text-center text-parchment">
        <div className="text-[11px] uppercase tracking-[0.4em] opacity-80">Babad {idx + 1}</div>
        <h2 className="font-serif text-5xl md:text-7xl mt-3 drop-shadow-lg">{hero.name}</h2>
        <p className="mt-3 italic font-serif opacity-90">{hero.title}</p>
      </motion.div>
      <motion.blockquote
        style={{ opacity: opQuote }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 font-serif italic text-parchment text-xl md:text-2xl px-6 text-center max-w-2xl"
      >
        {QUOTES[hero.id] ?? ""}
      </motion.blockquote>
    </div>
  );
}

function Chronicles() {
  const { markArticleRead } = useGame();
  return (
    <div className="fade-in cursor-quill">
      <header className="mx-auto max-w-4xl px-4 sm:px-6 pt-10 sm:pt-16 pb-8 sm:pb-10 text-center">
        <div className="text-[11px] uppercase tracking-[0.3em] text-maroon">Babad · Long Read</div>
        <h1 className="font-serif text-charcoal mt-4">Catatan Para Penyala Api</h1>
        <div className="editorial-rule mt-6 sm:mt-8 mx-auto w-32" />
        <p className="mt-5 sm:mt-6 text-charcoal/70 font-serif italic">Gulir perlahan — biarkan parallax menggiring Anda menyusuri zaman.</p>
      </header>

      {/* Interactive War Map */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 mt-4 sm:mt-6">
        <div className="text-[11px] uppercase tracking-[0.3em] text-maroon">Peta Perang Interaktif</div>
        <h2 className="font-serif mt-2 text-charcoal">Klik titik untuk menelusuri skirmish.</h2>
        <InteractiveWarMap />
      </section>

      {heroes.map((h, idx) => (
        <Article key={h.id} h={h} idx={idx} onRead={() => markArticleRead(h.id)} />
      ))}
    </div>
  );
}

function Article({ h, idx, onRead }: { h: typeof heroes[number]; idx: number; onRead: () => void }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { onRead(); io.disconnect(); } });
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [onRead]);
  const audioText = `${h.name}. ${h.title}. ${h.intro} ${h.sections.map((s) => s.heading + ". " + s.body).join(" ")}`;
  return (
    <article ref={ref} id={h.id} className="mt-16 sm:mt-20">
      <ParallaxHero hero={h} idx={idx} />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-16">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-maroon">{h.era}</div>
            <h2 className="font-serif mt-3 text-charcoal">{h.name}</h2>
            <p className="mt-2 text-base sm:text-lg italic text-muted-foreground font-serif">{h.title} — {h.region}</p>
          </div>
          <AudioGuide text={audioText} />
        </div>

        <p className="mt-8 sm:mt-10 text-base sm:text-lg leading-[1.85] text-charcoal/90 drop-cap">{h.intro}</p>

            {h.sections.map((s) => (
              <motion.section
                key={s.heading}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
                className="mt-12"
              >
                <h3 className="font-serif text-2xl text-maroon">{s.heading}</h3>
                <div className="editorial-rule mt-3 w-16" />
                <p className="mt-4 leading-[1.85] text-charcoal/90">{s.body}</p>
              </motion.section>
            ))}

            <section className="mt-16 border border-border bg-card p-8">
              <div className="flex items-center gap-2 text-maroon">
                <Calendar className="h-4 w-4" />
                <h3 className="font-serif text-2xl">Garis Waktu</h3>
              </div>
              <ol className="mt-6 space-y-4">
                {h.timeline.map((t) => (
                  <li key={t.year} className="grid grid-cols-[80px_1fr] gap-4 items-baseline border-b border-border/60 pb-3 last:border-b-0">
                    <span className="font-serif text-2xl text-maroon">{t.year}</span>
                    <span className="text-charcoal/85">{t.event}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="mt-12">
              <div className="flex items-center gap-2 text-maroon">
                <Compass className="h-4 w-4" />
                <h3 className="font-serif text-2xl">Strategi Perang</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                {h.strategy.map((s) => (
                  <div key={s.title} className="border border-border p-5 bg-card">
                    <div className="font-serif text-lg text-charcoal">{s.title}</div>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.detail}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </article>
      ))}
    </div>
  );
}
