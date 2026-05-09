import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, User, Flame, Mountain } from "lucide-react";
import { useGame } from "@/lib/game-context";
import { useI18n } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/pakar")({
  head: () => ({
    meta: [
      { title: "Pakar Sejarah — Roh Pahlawan" },
      { name: "description", content: "Bicaralah langsung dengan roh Pangeran Diponegoro atau Tuanku Imam Bonjol — AI persona dengan dialek otentik." },
    ],
  }),
  component: Pakar,
});

type Msg = { role: "user" | "assistant"; content: string };
type Persona = "diponegoro" | "bonjol";

const PERSONAS: Record<Persona, { name: string; title: string; bg: string; icon: React.ReactNode; greeting: string }> = {
  diponegoro: {
    name: "Pangeran Diponegoro",
    title: "Erucakra · Goa Selarong",
    bg: "persona-bg-diponegoro",
    icon: <Flame className="h-5 w-5 text-amber-400" />,
    greeting: "Salam, Ananda. Duduklah di sebelah pelita ini. Apa yang ingin kau ketahui dari babak gerilya kita?",
  },
  bonjol: {
    name: "Tuanku Imam Bonjol",
    title: "Singa Minang · Benteng Bonjol",
    bg: "persona-bg-bonjol",
    icon: <Mountain className="h-5 w-5 text-stone-300" />,
    greeting: "Assalamu'alaikum, Saudara. Angin gunung membawa engkau ke benteng ini. Bertanyalah dengan jernih.",
  },
};

function Pakar() {
  const { lang } = useI18n();
  const game = useGame();
  const [persona, setPersona] = useState<Persona>("diponegoro");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [namePrompt, setNamePrompt] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!game.playerName) setNamePrompt(true);
  }, [game.playerName]);

  useEffect(() => {
    setMessages([{ role: "assistant", content: PERSONAS[persona].greeting }]);
  }, [persona]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  function saveName() {
    const n = nameDraft.trim();
    if (!n) return;
    game.setPlayerName(n);
    setNamePrompt(false);
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    const gameContext = `Pemain berada di level ${game.level + 1}, skor ${game.score}, nyawa ${game.lives}, medali yang sudah diraih: ${game.medals.length}.`;

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona,
          messages: next,
          playerName: game.playerName,
          gameContext,
          lang,
        }),
      });
      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${resp.status}`);
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      setMessages((m) => [...m, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx); buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const j = line.slice(6).trim();
          if (j === "[DONE]") continue;
          try {
            const p = JSON.parse(j);
            const c = p.choices?.[0]?.delta?.content;
            if (c) {
              acc += c;
              setMessages((m) => m.map((x, i) => i === m.length - 1 ? { ...x, content: acc } : x));
            }
          } catch { buf = line + "\n" + buf; break; }
        }
      }
    } catch (e) {
      console.error("[Pakar] AI error:", e);
      setMessages((m) => [...m, { role: "assistant", content: "📜 Maaf, Arsip sedang sibuk. Asap dupa pekat dan suara sang pahlawan tertahan. Cobalah bertanya kembali sesaat lagi." }]);
    } finally {
      setLoading(false);
    }
  }

  const p = PERSONAS[persona];

  return (
    <div className={`fade-in min-h-[calc(100vh-200px)] cursor-quill transition-all duration-700 ${p.bg}`}>
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-parchment/20 pb-6">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-amber-300/80">Roh Pahlawan</div>
            <h1 className="font-serif text-4xl md:text-5xl mt-2 text-parchment">{p.name}</h1>
            <p className="mt-1 text-sm italic font-serif text-parchment/70">{p.title}</p>
          </div>
          <div className="flex gap-2">
            {(Object.keys(PERSONAS) as Persona[]).map((k) => (
              <button key={k} onClick={() => setPersona(k)}
                className={`cursor-sword px-4 py-2 text-xs uppercase tracking-[0.2em] border transition ${persona === k ? "bg-parchment text-charcoal border-parchment" : "text-parchment/80 border-parchment/40 hover:border-parchment"}`}>
                {PERSONAS[k].name.split(" ").slice(-1)[0]}
              </button>
            ))}
          </div>
        </div>

        {game.playerName && (
          <p className="mt-4 text-xs text-parchment/60 italic">Sang pahlawan mengingat nama Anda: <strong className="text-amber-300">{game.playerName}</strong>.</p>
        )}

        <div ref={scrollRef} className="mt-6 h-[55vh] overflow-y-auto bg-charcoal/40 backdrop-blur border border-parchment/10 p-6 space-y-5">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`h-9 w-9 shrink-0 flex items-center justify-center border ${m.role === "user" ? "border-parchment bg-parchment/10 text-parchment" : "border-amber-400/50 bg-amber-900/30 text-amber-200"}`}>
                  {m.role === "user" ? <User className="h-4 w-4" /> : p.icon}
                </div>
                <div className={`max-w-[80%] ${m.role === "user" ? "text-right" : ""}`}>
                  <div className="text-[10px] uppercase tracking-[0.25em] text-parchment/50 mb-1">
                    {m.role === "user" ? game.playerName || "Anda" : p.name}
                  </div>
                  <div className={`whitespace-pre-wrap leading-relaxed ${m.role === "user" ? "font-sans text-parchment" : "font-serif text-parchment/95"}`}>
                    {m.content || (loading ? "…" : "")}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-3 items-center text-parchment/60 italic font-serif">
              <Sparkles className="h-4 w-4 animate-pulse text-amber-400" /> Sang pahlawan menarik napas…
            </div>
          )}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(); }}
          className="mt-4 flex items-center gap-2 border border-parchment/20 bg-charcoal/40 backdrop-blur p-2">
          <input value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Tanyakan kepada sang pahlawan…"
            className="cursor-quill flex-1 bg-transparent px-3 py-2 outline-none text-parchment placeholder:text-parchment/40" />
          <button type="submit" disabled={loading || !input.trim()}
            className="cursor-sword inline-flex items-center gap-2 bg-amber-700 text-parchment px-4 py-2 disabled:opacity-50 hover:bg-amber-600 transition">
            <Send className="h-4 w-4" /> Kirim
          </button>
        </form>
      </div>

      {/* Name prompt */}
      <AnimatePresence>
        {namePrompt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-charcoal/80 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="bg-parchment border-2 border-maroon max-w-md w-full p-8">
              <div className="text-[11px] uppercase tracking-[0.3em] text-maroon">Pengenalan</div>
              <h2 className="font-serif text-2xl mt-2 text-charcoal">Siapa nama Anda, ksatria?</h2>
              <p className="mt-2 text-sm text-muted-foreground italic">Sang pahlawan akan mengingat dan menyapa Anda.</p>
              <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                autoFocus placeholder="Nama Anda…"
                className="mt-4 w-full border border-input bg-card px-3 py-2 outline-none focus:border-maroon" />
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setNamePrompt(false)} className="px-4 py-2 text-sm border border-border">Lewati</button>
                <button onClick={saveName} disabled={!nameDraft.trim()}
                  className="cursor-sword px-4 py-2 text-sm bg-maroon text-parchment hover:bg-maroon-deep disabled:opacity-50">Simpan</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
