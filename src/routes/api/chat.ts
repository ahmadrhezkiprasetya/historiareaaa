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

const GEMINI_API_KEY = "AIzaSyAedc7vjKtLcNnST0XdtHpUsdQ15DRheiw";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "content-type, authorization",
        },
      }),
      POST: async ({ request }) => {
        const cors = {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "content-type, authorization",
          "Content-Type": "application/json",
        };
        try {
          const { persona, messages, playerName, gameContext, lang } = await request.json();

          const personaSys = SYSTEMS[persona as string] ?? SYSTEMS.diponegoro;
          const langDirective = lang === "en"
            ? "Respond in English while keeping all Indonesian/Javanese/Minang exclamations intact."
            : "Jawab dalam Bahasa Indonesia.";
          const memory = playerName ? `Nama lawan bicara Anda adalah ${playerName}. Sapalah dia dengan namanya sesekali.` : "";
          const ctx = gameContext ? `Konteks permainan saat ini: ${gameContext}.` : "";
          const systemPrompt = `${personaSys}\n\n${langDirective}\n${memory}\n${ctx}`;

          // Convert OpenAI-style messages -> Gemini contents
          const contents = (messages as Array<{ role: string; content: string }>).map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          }));

          const upstream = await fetch(GEMINI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { role: "system", parts: [{ text: systemPrompt }] },
              contents,
              generationConfig: { temperature: 0.9, maxOutputTokens: 1024 },
            }),
          });

          if (!upstream.ok) {
            const errText = await upstream.text().catch(() => "");
            console.error("[Gemini] upstream error", upstream.status, errText);
            return new Response(JSON.stringify({
              error: `Gemini API error (${upstream.status}): ${errText.slice(0, 300) || upstream.statusText}`,
            }), { status: upstream.status, headers: cors });
          }

          const data = await upstream.json();
          const text: string =
            data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") ?? "";

          if (!text) {
            return new Response(JSON.stringify({
              error: "Sang pahlawan terdiam — Gemini mengembalikan respon kosong.",
              raw: data,
            }), { status: 502, headers: cors });
          }

          return new Response(JSON.stringify({
            text,
            choices: [{ message: { role: "assistant", content: text } }],
          }), { status: 200, headers: cors });
        } catch (e) {
          console.error("[Gemini] handler error", e);
          return new Response(JSON.stringify({
            error: e instanceof Error ? e.message : "Unknown error",
          }), { status: 500, headers: cors });
        }
      },
    },
  },
});
