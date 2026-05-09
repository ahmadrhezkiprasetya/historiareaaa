import { useEffect, useState } from "react";
import { useView } from "@/lib/view-context";

export function CustomCursor() {
  const { cursor } = useView();
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);
    document.body.classList.add("has-custom-cursor");
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.body.classList.remove("has-custom-cursor");
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="custom-cursor" style={{ transform: `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)` }}>
      {cursor === "sword" ? (
        <svg viewBox="0 0 32 32" width="36" height="36">
          <g stroke="#fbfaf5" strokeWidth="1.4" fill="none">
            <path d="M4 28 L20 12 L24 16 L8 32 Z" fill="#4a0404" />
            <path d="M20 12 L26 6 L28 8 L22 14 Z" fill="#c0a060" stroke="#4a0404" />
            <circle cx="6" cy="30" r="1.5" fill="#fbfaf5" />
          </g>
        </svg>
      ) : cursor === "quill" ? (
        <svg viewBox="0 0 32 32" width="32" height="32">
          <g fill="#4a0404" stroke="#fbfaf5" strokeWidth="0.8">
            <path d="M26 4 C18 6 10 14 6 24 L4 28 L8 26 C18 22 26 14 28 6 Z" />
            <line x1="6" y1="26" x2="14" y2="18" stroke="#fbfaf5" strokeWidth="1" />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <circle cx="12" cy="12" r="4" fill="#4a0404" stroke="#fbfaf5" strokeWidth="1.2" />
        </svg>
      )}
    </div>
  );
}
