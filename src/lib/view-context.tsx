import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type ViewMode = "modern" | "vintage";
type CursorMode = "default" | "quill" | "sword";

type Ctx = {
  view: ViewMode;
  toggleView: () => void;
  audioOn: boolean;
  toggleAudio: () => void;
  cursor: CursorMode;
  setCursor: (c: CursorMode) => void;
};

const ViewContext = createContext<Ctx | null>(null);

export function ViewProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ViewMode>("modern");
  const [audioOn, setAudioOn] = useState(false);
  const [cursor, setCursor] = useState<CursorMode>("default");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const v = localStorage.getItem("hist_view") as ViewMode | null;
    if (v === "vintage" || v === "modern") setView(v);
    const a = localStorage.getItem("hist_audio");
    if (a === "1") setAudioOn(true);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.toggle("vintage", view === "vintage");
    localStorage.setItem("hist_view", view);
  }, [view]);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("hist_audio", audioOn ? "1" : "0");
  }, [audioOn]);

  const toggleView = useCallback(() => setView((v) => (v === "modern" ? "vintage" : "modern")), []);
  const toggleAudio = useCallback(() => setAudioOn((a) => !a), []);

  return (
    <ViewContext.Provider value={{ view, toggleView, audioOn, toggleAudio, cursor, setCursor }}>
      {children}
    </ViewContext.Provider>
  );
}

export function useView() {
  const c = useContext(ViewContext);
  if (!c) throw new Error("useView must be inside ViewProvider");
  return c;
}
