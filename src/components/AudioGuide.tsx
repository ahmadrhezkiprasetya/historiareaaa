import { useEffect, useState } from "react";
import { Volume2, VolumeX, Headphones } from "lucide-react";

export function AudioGuide({ text, label }: { text: string; label?: string }) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) setSupported(true);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function toggle() {
    if (!supported) return;
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "id-ID";
    u.rate = 0.82;
    u.pitch = 0.9;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(u);
    setSpeaking(true);
  }

  if (!supported) return null;
  return (
    <button
      onClick={toggle}
      className="cursor-quill inline-flex items-center gap-2 border border-maroon text-maroon px-3 py-1.5 text-xs uppercase tracking-[0.2em] hover:bg-maroon hover:text-parchment transition"
      aria-pressed={speaking}
    >
      {speaking ? <VolumeX className="h-3.5 w-3.5" /> : <Headphones className="h-3.5 w-3.5" />}
      {label ?? (speaking ? "Hentikan" : "Audio Guide")}
    </button>
  );
}
