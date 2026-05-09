import { Eye, Sparkles, Volume2, VolumeX, Languages } from "lucide-react";
import { useView } from "@/lib/view-context";
import { useI18n } from "@/lib/i18n";

export function ViewToggle() {
  const { view, toggleView } = useView();
  const { t } = useI18n();
  return (
    <button
      onClick={toggleView}
      className="cursor-quill inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-charcoal/70 hover:text-maroon transition border-l border-border pl-3"
      title={view === "modern" ? t("toggle.vintage") : t("toggle.modern")}
    >
      {view === "modern" ? <Sparkles className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      <span className="hidden xl:inline">{view === "modern" ? "Vintage" : "Modern"}</span>
    </button>
  );
}

export function AudioToggle() {
  const { audioOn, toggleAudio } = useView();
  const { t } = useI18n();
  return (
    <button
      onClick={toggleAudio}
      className="cursor-quill text-charcoal/70 hover:text-maroon transition"
      title={audioOn ? t("toggle.audio.off") : t("toggle.audio.on")}
    >
      {audioOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </button>
  );
}

export function LangToggle() {
  const { lang, setLang } = useI18n();
  return (
    <button
      onClick={() => setLang(lang === "id" ? "en" : "id")}
      className="cursor-quill inline-flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-charcoal/70 hover:text-maroon transition"
      title="Language"
    >
      <Languages className="h-3.5 w-3.5" />
      <span className="font-mono">{lang.toUpperCase()}</span>
    </button>
  );
}
