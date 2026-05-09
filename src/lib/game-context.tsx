import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

export type ItemId = "horse" | "sorban" | "naskah";
export type MedalId = "first_blood" | "perfect_quiz" | "hutan_clear" | "bonjol_clear" | "magelang_clear" | "pahlawan";

type GameState = {
  energy: number;
  lives: number;
  score: number;
  level: number; // 0,1,2
  inventory: Record<ItemId, number>;
  medals: MedalId[];
  playerName: string;
  setPlayerName: (n: string) => void;
  spend: (cost: number) => boolean;
  restoreEnergy: (amount: number) => void;
  loseLife: () => void;
  addScore: (n: number) => void;
  addItem: (id: ItemId) => void;
  useItem: (id: ItemId) => boolean;
  awardMedal: (id: MedalId) => void;
  setLevel: (n: number) => void;
  reset: () => void;
};

const STORE = "hist_game_v2";
const initialInv: Record<ItemId, number> = { horse: 0, sorban: 0, naskah: 0 };

const GameContext = createContext<GameState | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [energy, setEnergy] = useState(100);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [level, setLevelState] = useState(0);
  const [inventory, setInventory] = useState<Record<ItemId, number>>(initialInv);
  const [medals, setMedals] = useState<MedalId[]>([]);
  const [playerName, setPlayerNameState] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) {
        const s = JSON.parse(raw);
        if (typeof s.energy === "number") setEnergy(s.energy);
        if (typeof s.lives === "number") setLives(s.lives);
        if (typeof s.score === "number") setScore(s.score);
        if (typeof s.level === "number") setLevelState(s.level);
        if (s.inventory) setInventory({ ...initialInv, ...s.inventory });
        if (Array.isArray(s.medals)) setMedals(s.medals);
        if (typeof s.playerName === "string") setPlayerNameState(s.playerName);
      }
    } catch { /* noop */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    localStorage.setItem(STORE, JSON.stringify({ energy, lives, score, level, inventory, medals, playerName }));
  }, [hydrated, energy, lives, score, level, inventory, medals, playerName]);

  const spend = useCallback((cost: number) => {
    let ok = true;
    setEnergy((e) => { if (e < cost) { ok = false; return e; } return Math.max(0, e - cost); });
    return ok;
  }, []);
  const restoreEnergy = useCallback((amount: number) => setEnergy((e) => Math.min(100, e + amount)), []);
  const loseLife = useCallback(() => setLives((l) => Math.max(0, l - 1)), []);
  const addScore = useCallback((n: number) => setScore((s) => s + n), []);
  const addItem = useCallback((id: ItemId) => setInventory((i) => ({ ...i, [id]: i[id] + 1 })), []);
  const useItem = useCallback((id: ItemId) => {
    let ok = false;
    setInventory((i) => { if (i[id] > 0) { ok = true; return { ...i, [id]: i[id] - 1 }; } return i; });
    return ok;
  }, []);
  const awardMedal = useCallback((id: MedalId) => {
    setMedals((m) => (m.includes(id) ? m : [...m, id]));
  }, []);
  const setLevel = useCallback((n: number) => setLevelState(n), []);
  const setPlayerName = useCallback((n: string) => setPlayerNameState(n), []);
  const reset = useCallback(() => {
    setEnergy(100); setLives(3); setScore(0); setLevelState(0);
    setInventory(initialInv);
  }, []);

  return (
    <GameContext.Provider value={{
      energy, lives, score, level, inventory, medals, playerName,
      setPlayerName, spend, restoreEnergy, loseLife, addScore,
      addItem, useItem, awardMedal, setLevel, reset,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}
