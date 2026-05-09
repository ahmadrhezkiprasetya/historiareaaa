import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Settings, KeyRound, Sparkles, X, User } from "lucide-react";

export const Route = createFileRoute("/pakar")({
  head: () => ({
    meta: [
      { title: "Pakar Sejarah — Historia Nusantara" },
      { name: "description", content: "Bertanya kepada arsiparis AI tentang sejarah Nusantara. Bawa kunci API Gemini Anda sendiri." },
    ],
  }),
  component: Pakar,
});

type Msg = { role: "user" | "model"; text: string };

const SYSTEM = `Anda adalah "Pakar Sejarah Historia" — arsiparis dan sejarawan ahli Nusantara, khususnya Perang Jawa (1825–1830) dan Perang Padri (1803–1838). Jawab dalam Bahasa Indonesia yang elegan namun jelas. Sertakan tahun, tempat, dan tokoh spesifik. Jika tidak tahu, katakan jujur. Hindari spekulasi.`;

function Pakar() {
  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [keyDraft, setKeyDraft] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    { role: "model", text: "Selamat datang. Saya arsiparis Historia. Tanyakan apa pun tentang Diponegoro, Imam Bonjol, atau peristiwa Nusantara lainnya." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const k = typeof window !== "undefined" ? localStorage.getItem("gemini_api_key") : null;
    if (k) setApiKey(k);
    else setShowSettings(true);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  function saveKey() {
    localStorage.setItem("gemini_api_key", keyDraft.trim());
    setApiKey(keyDraft.trim());
    setShowSettings(false);
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    if (!apiKey) { setShowSettings(true); return; }

    const next: Msg[] = [...messages, { role: "user", text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const contents = next.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM }] },
            contents,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || `HTTP ${res.status}`);
      }
      const reply: string =
        data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text).filter(Boolean).join("\n") ||
        "(Tidak ada jawaban)";
      setMessages((m) => [...m, { role: "model", text: reply }]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Galat tidak diketahui";
      setMessages((m) => [...m, { role: "model", text: `⚠️ Galat: ${msg}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fade-in mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-maroon">Ruang Tanya</div>
          <h1 className="font-serif text-4xl md:text-5xl mt-2 text-charcoal">Pakar Sejarah</h1>
          <p className="mt-2 text-sm text-muted-foreground italic font-serif">Arsiparis AI — bertenaga Gemini, dengan kunci API Anda.</p>
        </div>
        <button
          onClick={() => { setKeyDraft(apiKey); setShowSettings(true); }}
          className="inline-flex items-center gap-2 border border-border px-3 py-2 text-sm hover:border-maroon hover:text-maroon transition"
        >
          <Settings className="h-4 w-4" /> Pengaturan
        </button>
      </div>

      <div ref={scrollRef} className="mt-6 h-[55vh] overflow-y-auto border border-border bg-card p-6 space-y-5">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`h-8 w-8 shrink-0 flex items-center justify-center border ${m.role === "user" ? "border-charcoal bg-charcoal text-parchment" : "border-maroon bg-maroon text-parchment"}`}>
              {m.role === "user" ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            </div>
            <div className={`max-w-[80%] ${m.role === "user" ? "text-right" : ""}`}>
              <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">
                {m.role === "user" ? "Anda" : "Pakar Historia"}
              </div>
              <div className={`whitespace-pre-wrap leading-relaxed ${m.role === "user" ? "font-sans" : "font-serif text-charcoal"}`}>
                {m.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 items-center text-muted-foreground italic font-serif">
            <Sparkles className="h-4 w-4 animate-pulse text-maroon" /> Sang arsiparis sedang menulis…
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="mt-4 flex items-center gap-2 border border-border bg-card p-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={apiKey ? "Tanyakan sesuatu tentang sejarah Nusantara…" : "Masukkan kunci API Gemini terlebih dahulu →"}
          className="flex-1 bg-transparent px-3 py-2 outline-none text-charcoal placeholder:text-muted-foreground"
        />
        <button type="submit" disabled={loading || !input.trim()} className="inline-flex items-center gap-2 bg-maroon text-parchment px-4 py-2 disabled:opacity-50 hover:bg-maroon-deep transition">
          <Send className="h-4 w-4" /> Kirim
        </button>
      </form>

      {!apiKey && (
        <p className="mt-3 text-xs text-muted-foreground">
          Kunci API tidak tersimpan di server kami — hanya di peramban Anda (localStorage).
        </p>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 flex items-center justify-center p-4" onClick={() => setShowSettings(false)}>
          <div className="bg-parchment border border-charcoal max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl text-maroon flex items-center gap-2"><KeyRound className="h-5 w-5" /> Kunci API Gemini</h2>
              <button onClick={() => setShowSettings(false)} className="text-muted-foreground hover:text-charcoal"><X className="h-5 w-5" /></button>
            </div>
            <p className="mt-3 text-sm text-charcoal/80">
              Dapatkan kunci gratis di <a className="text-maroon underline" href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">Google AI Studio</a>. Kunci hanya disimpan di peramban Anda.
            </p>
            <input
              type="password"
              value={keyDraft}
              onChange={(e) => setKeyDraft(e.target.value)}
              placeholder="AIza..."
              className="mt-4 w-full border border-input bg-card px-3 py-2 outline-none focus:border-maroon font-mono text-sm"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowSettings(false)} className="px-4 py-2 text-sm border border-border hover:border-charcoal">Batal</button>
              <button onClick={saveKey} disabled={!keyDraft.trim()} className="px-4 py-2 text-sm bg-maroon text-parchment hover:bg-maroon-deep disabled:opacity-50">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
