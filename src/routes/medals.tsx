import { createFileRoute, Link } from "@tanstack/react-router";
import { useGame, type MedalId } from "@/lib/game-context";
import { Award, Lock } from "lucide-react";

export const Route = createFileRoute("/medals")({
  head: () => ({
    meta: [
      { title: "Galeri Medali — Historia Nusantara" },
      { name: "description", content: "Ruang medali: lencana yang Anda raih dari quest gerilya dan trial pengetahuan." },
    ],
  }),
  component: Medals,
});

const ALL: { id: MedalId; name: string; desc: string }[] = [
  { id: "first_blood", name: "Patriot Pertama", desc: "Misi pertama tuntas." },
  { id: "perfect_quiz", name: "Cendekia Sempurna", desc: "Boss dikalahkan tanpa kehilangan HP." },
  { id: "hutan_clear", name: "Penjelajah Selarong", desc: "Babak Hutan Selarong tuntas." },
  { id: "bonjol_clear", name: "Singa Bonjol", desc: "Babak Benteng Bonjol tuntas." },
  { id: "magelang_clear", name: "Pencatat Babad", desc: "Babak Perundingan Magelang tuntas." },
  { id: "pahlawan", name: "Pahlawan Nasional", desc: "Tiga babak tuntas — gelar tertinggi." },
];

function Medals() {
  const { medals, score, playerName } = useGame();
  return (
    <div className="fade-in mx-auto max-w-5xl px-6 py-12 cursor-quill">
      <header className="border-b border-border pb-6">
        <div className="text-[11px] uppercase tracking-[0.3em] text-maroon">Medal Room</div>
        <h1 className="font-serif text-5xl text-charcoal mt-2">Galeri Kehormatan</h1>
        <p className="mt-2 italic font-serif text-muted-foreground">
          {playerName ? `Catatan ksatria ${playerName}.` : "Catatan ksatria tanpa nama."} Skor total: <strong className="text-charcoal">{score}</strong>.
        </p>
      </header>

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {ALL.map((m) => {
          const earned = medals.includes(m.id);
          return (
            <div key={m.id} className={`border p-6 text-center transition ${earned ? "border-maroon bg-maroon/5" : "border-border bg-card opacity-60"}`}>
              <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center border-2 ${earned ? "border-gold bg-gradient-to-br from-gold to-amber-700 text-charcoal" : "border-border text-muted-foreground"}`}>
                {earned ? <Award className="h-8 w-8" /> : <Lock className="h-6 w-6" />}
              </div>
              <h3 className="font-serif text-xl mt-3 text-charcoal">{m.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground italic">{m.desc}</p>
              <p className={`mt-2 text-[10px] uppercase tracking-[0.25em] ${earned ? "text-maroon" : "text-muted-foreground"}`}>
                {earned ? "Diraih" : "Belum diraih"}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <Link to="/quest" className="cursor-sword inline-block border border-maroon text-maroon px-6 py-2 hover:bg-maroon hover:text-parchment transition">
          Lanjutkan Misi
        </Link>
      </div>
    </div>
  );
}
