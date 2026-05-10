// Centralized asset registry. Swap any image in one place.
// Leave string empty ("") to force the styled "Arsip Sejarah" placeholder.

export const ASSETS = {
  hero_diponegoro: "",
  hero_bonjol: "",
  map_background: "",
  artifact_keris: "",
  ui_parchment: "",
} as const;

export type AssetKey = keyof typeof ASSETS;
