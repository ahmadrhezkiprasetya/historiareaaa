import { useState } from "react";
import { ASSETS, type AssetKey } from "@/lib/assets";

type Props = {
  assetKey: AssetKey;
  alt: string;
  className?: string;
  /** Optional override label inside placeholder */
  placeholderLabel?: string;
};

/**
 * Renders an image from the centralized ASSETS map.
 * Falls back to a styled "Arsip Sejarah" placeholder if the URL is empty
 * or fails to load.
 */
export function AssetImage({ assetKey, alt, className, placeholderLabel }: Props) {
  const src = ASSETS[assetKey];
  const [failed, setFailed] = useState(false);
  const showPlaceholder = !src || failed;

  if (showPlaceholder) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`relative overflow-hidden bg-gradient-to-br from-maroon via-charcoal to-maroon-deep flex items-center justify-center ${className ?? ""}`}
      >
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage:
            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5), transparent 60%), repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 6px)",
        }} />
        <div className="relative text-center px-4">
          <div className="text-[10px] uppercase tracking-[0.35em] text-parchment/70">Arsip</div>
          <div className="font-serif italic text-parchment text-xl sm:text-2xl mt-1">Arsip Sejarah</div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-parchment/60 mt-1">{alt}</div>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={className}
      loading="lazy"
    />
  );
}

export { ASSETS };
