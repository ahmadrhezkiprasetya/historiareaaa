// Centralized asset registry. Swap any image in one place.
// Leave string empty ("") to force the styled "Arsip Sejarah" placeholder.

export const ASSETS = {
  hero_diponegoro: "https://i.pinimg.com/736x/6c/72/3e/6c723e846372a3079d654b2d91e7ea92.jpg",
  hero_bonjol: "https://i.pinimg.com/736x/d6/11/f9/d611f92542cee29f5b207fd35d263a57.jpg",
  map_background: "https://i.pinimg.com/736x/8b/06/70/8b0670cfaec8fe8c1ed9249bef411a94.jpg",
  artifact_keris: "https://i.pinimg.com/736x/73/a1/80/73a1806984b46fe826b929ab70dea7bc.jpg",
  ui_parchment: "",
} as const;

export type AssetKey = keyof typeof ASSETS;
