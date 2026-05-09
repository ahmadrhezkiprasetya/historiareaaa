import { createFileRoute } from "@tanstack/react-router";
import { heroes } from "@/lib/heroes-data";
import { Calendar, Compass } from "lucide-react";

export const Route = createFileRoute("/chronicles")({
  head: () => ({
    meta: [
      { title: "Babad Pahlawan — Historia Nusantara" },
      { name: "description", content: "Narasi panjang Pangeran Diponegoro dan Tuanku Imam Bonjol: garis waktu, strategi perang, dan benteng-benteng perlawanan." },
    ],
  }),
  component: Chronicles,
});

function Chronicles() {
  return (
    <div className="fade-in">
      <header className="mx-auto max-w-4xl px-6 pt-16 pb-10 text-center">
        <div className="text-[11px] uppercase tracking-[0.3em] text-maroon">Babad · Long Read</div>
        <h1 className="font-serif text-5xl md:text-6xl text-charcoal mt-4">Catatan Para Penyala Api</h1>
        <div className="editorial-rule mt-8 mx-auto w-32" />
      </header>

      {heroes.map((h, idx) => (
        <article key={h.id} id={h.id} className="mx-auto max-w-4xl px-6 py-16 border-t border-border first:border-t-0">
          <div className="text-[11px] uppercase tracking-[0.3em] text-maroon">{h.era}</div>
          <h2 className="font-serif text-4xl md:text-5xl mt-3 text-charcoal">{h.name}</h2>
          <p className="mt-2 text-lg italic text-muted-foreground font-serif">{h.title} — {h.region}</p>

          <figure className="mt-10">
            <div className={`aspect-[16/9] bg-gradient-to-br ${h.portraitGradient} relative overflow-hidden border border-charcoal/20`}>
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 70% 40%, rgba(255,255,255,0.5), transparent 60%)' }} />
              <div className="absolute bottom-6 left-6 text-parchment font-serif text-3xl">{h.name}</div>
            </div>
            <figcaption className="mt-3 text-xs italic font-serif text-muted-foreground text-center">
              Gambar {idx + 1}. Ilustrasi editorial — {h.name}, {h.era}.
            </figcaption>
          </figure>

          <p className="mt-10 text-lg leading-[1.85] text-charcoal/90 drop-cap">{h.intro}</p>

          {h.sections.map((s) => (
            <section key={s.heading} className="mt-12">
              <h3 className="font-serif text-2xl text-maroon">{s.heading}</h3>
              <div className="editorial-rule mt-3 w-16" />
              <p className="mt-4 leading-[1.85] text-charcoal/90">{s.body}</p>
            </section>
          ))}

          {/* Timeline */}
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

          {/* Strategy */}
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
        </article>
      ))}
    </div>
  );
}
