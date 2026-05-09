import { useScroll, useTransform, motion } from "framer-motion";

export function KerisProgress() {
  const { scrollYProgress } = useScroll();
  const fillHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div className="hidden lg:block fixed left-4 top-1/2 -translate-y-1/2 z-30 pointer-events-none">
      <svg viewBox="0 0 30 200" width="30" height="200">
        <defs>
          <clipPath id="keris-shape">
            {/* curvy keris silhouette */}
            <path d="M15 0 C20 30 8 50 18 80 C8 110 22 130 12 160 C18 180 14 195 15 200 C16 195 12 180 18 160 C8 130 22 110 12 80 C22 50 10 30 15 0 Z" />
          </clipPath>
        </defs>
        <rect x="0" y="0" width="30" height="200" fill="#3a2010" clipPath="url(#keris-shape)" />
        <motion.rect
          x="0" width="30" fill="url(#keris-grad)"
          clipPath="url(#keris-shape)"
          style={{ height: fillHeight, y: useTransform(scrollYProgress, [0, 1], [200, 0]) }}
        />
        <linearGradient id="keris-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#c0a060" />
          <stop offset="100%" stopColor="#4a0404" />
        </linearGradient>
        {/* Hilt */}
        <ellipse cx="15" cy="195" rx="6" ry="5" fill="#2a1810" />
      </svg>
    </div>
  );
}
