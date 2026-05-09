import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "id" | "en";

const dict = {
  // Nav
  "nav.home": { id: "Beranda", en: "Home" },
  "nav.chronicles": { id: "Babad", en: "Chronicles" },
  "nav.pakar": { id: "Pakar Sejarah", en: "Historian AI" },
  "nav.quest": { id: "Quest Gerilya", en: "Guerrilla Quest" },
  "nav.medals": { id: "Galeri Medali", en: "Medal Room" },
  "nav.arsip": { id: "Arsip Artefak", en: "Artifact Archive" },
  // Toggles
  "toggle.modern": { id: "Tampilan Modern", en: "Modern View" },
  "toggle.vintage": { id: "Tampilan Vintage", en: "Vintage View" },
  "toggle.audio.on": { id: "Suarakan ambience", en: "Play ambience" },
  "toggle.audio.off": { id: "Heningkan", en: "Mute" },
  // Common
  "common.start": { id: "Mulai", en: "Start" },
  "common.restart": { id: "Mulai Ulang", en: "Restart" },
  "common.next": { id: "Lanjut", en: "Next" },
  "common.close": { id: "Tutup", en: "Close" },
  "common.lives": { id: "Nyawa", en: "Lives" },
  "common.energy": { id: "Energi", en: "Energy" },
  "common.score": { id: "Skor", en: "Score" },
  "common.level": { id: "Level", en: "Level" },
  // Quest
  "quest.briefing": { id: "Mission Briefing", en: "Mission Briefing" },
  "quest.captured": { id: "Anda Tertangkap", en: "You Are Captured" },
  "quest.victory": { id: "Pahlawan Nasional", en: "National Hero" },
  // Pakar
  "pakar.choose": { id: "Pilih Roh Pahlawan", en: "Choose a Hero's Soul" },
  "pakar.send": { id: "Kirim", en: "Send" },
  "pakar.placeholder": { id: "Tanyakan kepada sang pahlawan…", en: "Ask the hero…" },
  "pakar.name.prompt": { id: "Siapa nama Anda, ksatria?", en: "What is your name, warrior?" },
} as const;

type Key = keyof typeof dict;

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string };
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("id");
  useEffect(() => {
    const v = typeof window !== "undefined" ? (localStorage.getItem("hist_lang") as Lang | null) : null;
    if (v === "id" || v === "en") setLangState(v);
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("hist_lang", l);
  };
  const t = (k: Key) => dict[k][lang];
  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const c = useContext(I18nContext);
  if (!c) throw new Error("useI18n must be inside I18nProvider");
  return c;
}
