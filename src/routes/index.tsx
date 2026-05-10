import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Feather, Swords } from "lucide-react";
import { heroes } from "@/lib/heroes-data";
import { AssetImage } from "@/components/AssetImage";
import type { AssetKey } from "@/lib/assets";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Historia Nusantara — Babad Para Pahlawan" },
      { name: "description", content: "Edisi khusus: Pangeran Diponegoro & Tuanku Imam Bonjol — dua api perlawanan dari Jawa dan Minangkabau." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="fade-in">
      {/* Masthead */}
      <section className="mx-auto max-w-7xl px-6 pt-12 pb-6">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-muted-foreground border-b border-charcoal/30 pb-3">
          <span>Vol. I · Edisi Pahlawan</span>
          <span className="hidden sm:block">Babad · Riset · Permainan</span>
          <span>Nusantara</span>
        </div>
        <h1 className="mt-8 font-serif text-5xl md:text-7xl lg:text-8xl text-maroon leading-[0.95] tracking-tight">
          Dua Api,<br />
          <span className="italic">Satu Tanah Air.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-charcoal/80 font-serif italic">
          Dari Goa Selarong di kaki Merapi sampai Benteng Bonjol di lembah Pasaman — dua nama yang membakar kolonialisme dengan iman, strategi, dan kesetiaan pada tanah leluhur.
        </p>
      </section>

      {/* Split hero */}
      <section className="mx-auto max-w-7xl px-6 mt-8 grid md:grid-cols-2 gap-px bg-border border border-border">
        {heroes.map((h) => (
          <article key={h.id} className="bg-card p-8 md:p-12 group relative overflow-hidden">
            <div className={`aspect-[4/5] mb-6 bg-gradient-to-br ${h.portraitGradient} relative overflow-hidden border border-charcoal/20`}>
              <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent 60%)' }} />
              <div className="absolute bottom-4 left-4 right-4 text-parchment">
                <div className="text-[10px] uppercase tracking-[0.3em] opacity-80">Potret</div>
                <div className="font-serif text-2xl mt-1">{h.name}</div>
              </div>
            </div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground italic">— Arsip Historia, ilustrasi editorial</p>

            <div className="mt-6 text-[11px] uppercase tracking-[0.25em] text-maroon">{h.era}</div>
            <h2 className="font-serif text-3xl md:text-4xl mt-2 text-charcoal">{h.title}</h2>
            <p className="mt-4 text-charcoal/80 leading-relaxed">{h.intro}</p>

            <Link
              to="/chronicles"
              hash={h.id}
              className="mt-6 inline-flex items-center gap-2 text-maroon border-b border-maroon pb-1 text-sm uppercase tracking-[0.2em] hover:gap-3 transition-all"
            >
              Baca Babad <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </section>

      {/* Editorial CTA */}
      <section className="mx-auto max-w-7xl px-6 mt-20 grid md:grid-cols-2 gap-8">
        <Link to="/pakar" className="group border border-border bg-card p-8 hover:border-maroon transition">
          <Feather className="h-6 w-6 text-maroon" />
          <h3 className="font-serif text-2xl mt-4">Pakar Sejarah</h3>
          <p className="mt-2 text-sm text-muted-foreground">Bicaralah dengan roh Diponegoro atau Imam Bonjol — AI persona dengan dialek otentik.</p>
          <div className="mt-4 text-xs uppercase tracking-[0.2em] text-maroon group-hover:translate-x-1 transition inline-flex items-center gap-2">
            Mulai Percakapan <ArrowRight className="h-3 w-3" />
          </div>
        </Link>
        <Link to="/quest" className="group border border-border bg-card p-8 hover:border-maroon transition">
          <Swords className="h-6 w-6 text-maroon" />
          <h3 className="font-serif text-2xl mt-4">Quest Gerilya</h3>
          <p className="mt-2 text-sm text-muted-foreground">Rasakan strategi gerilya: 100 energi, 3 nyawa. Saat energi habis — uji pengetahuan Anda.</p>
          <div className="mt-4 text-xs uppercase tracking-[0.2em] text-maroon group-hover:translate-x-1 transition inline-flex items-center gap-2">
            Mulai Quest <ArrowRight className="h-3 w-3" />
          </div>
        </Link>
      </section>
    </div>
  );
}
