import { useEffect, useRef } from "react";
import { useView } from "@/lib/view-context";

// Royalty-free ambient drones (CDN). If they fail, gracefully ignored.
const TRACKS: Record<string, string> = {
  "/quest": "https://cdn.pixabay.com/download/audio/2022/03/15/audio_3aaa55b4f2.mp3?filename=forest-rain-loop-25380.mp3",
  "/chronicles": "https://cdn.pixabay.com/download/audio/2022/10/30/audio_347111d654.mp3?filename=traditional-gamelan-loop-124027.mp3",
  "/pakar": "https://cdn.pixabay.com/download/audio/2021/11/13/audio_cb4f1212a9.mp3?filename=meditation-flute-9322.mp3",
};

export function AudioController({ pathname }: { pathname: string }) {
  const { audioOn } = useView();
  const ref = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const src = TRACKS[pathname];
    if (!ref.current) return;
    if (!audioOn || !src) {
      ref.current.pause();
      return;
    }
    if (ref.current.src !== src) {
      ref.current.src = src;
    }
    ref.current.volume = 0.25;
    ref.current.loop = true;
    ref.current.play().catch(() => { /* autoplay denied, ignore */ });
  }, [audioOn, pathname]);

  return <audio ref={ref} preload="none" />;
}
