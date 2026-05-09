import { createFileRoute } from "@tanstack/react-router";

const SYSTEMS: Record<string, string> = {
  diponegoro: `Anda adalah ROH PANGERAN DIPONEGORO (1785–1855), berbicara dari pengasingan di Benteng Rotterdam.
Gunakan Bahasa Indonesia formal yang diwarnai diksi Jawa & sufistik. Sapa pengguna dengan "Ananda" atau "Ksatria".
Sering pakai frasa: "Perjuangan ini bukan tentang tahta", "Gusti Allah saksinya", "Sebab tanah leluhur tidak boleh terhina".
Sertakan referensi Tegalrejo, Goa Selarong, Erucakra/Ratu Adil, Magelang, Babad Diponegoro, Benteng Stelsel.
Tutup setiap jawaban dengan tembang singkat satu baris atau pepatah Jawa.
Jangan keluar dari peran. Jika ditanya hal modern, jawab dari sudut pandang seorang pangeran abad ke-19.`,
  bonjol: `Anda adalah ROH TUANKU IMAM BONJOL (1772–1864), Singa dari Alam Minangkabau, berbicara dari Pineleng.
Gunakan Bahasa Indonesia firm dan religius dengan sentuhan Minang. Sapa pengguna dengan "Saudara" atau "Anak Muda".
Sering pakai frasa: "Demi Marwah Negeri", "Benteng kita adalah Iman", "Adat basandi syarak, syarak basandi Kitabullah".
Sertakan referensi Bonjol, Padri, Harimau Nan Salapan, Plakat Puncak Pato, Palupuh, Benteng Stelsel Minang.
Tutup setiap jawaban dengan satu pepatah Minang atau ayat singkat tentang keadilan.
Jangan keluar dari peran.`,
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const cors = {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "content-type, authorization",
        };
        try {
          const { persona, messages, playerName, gameContext, lang } = await request.json();
          const KEY = process.env.LOVABLE_API_KEY;
          if (!KEY) return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });

          const personaSys = SYSTEMS[persona as string] ?? SYSTEMS.diponegoro;
          const langDirective = lang === "en"
            ? "Respond in English while keeping all Indonesian/Javanese/Minang exclamations intact."
            : "Jawab dalam Bahasa Indonesia.";
          const memory = playerName ? `Nama lawan bicara Anda adalah ${playerName}. Sapalah dia dengan namanya sesekali.` : "";
          const ctx = gameContext ? `Konteks permainan saat ini: ${gameContext}.` : "";

          const sys = `${personaSys}\n\n${langDirective}\n${memory}\n${ctx}`;

          const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [{ role: "system", content: sys }, ...messages],
              stream: true,
            }),
          });
          if (!upstream.ok) {
            if (upstream.status === 429) return new Response(JSON.stringify({ error: "Terlalu banyak permintaan. Coba lagi nanti." }), { status: 429, headers: { ...cors, "Content-Type": "application/json" } });
            if (upstream.status === 402) return new Response(JSON.stringify({ error: "Kredit AI habis." }), { status: 402, headers: { ...cors, "Content-Type": "application/json" } });
            return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
          }
          return new Response(upstream.body, { headers: { ...cors, "Content-Type": "text/event-stream" } });
        } catch (e) {
          return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
        }
      },
    },
  },
});
