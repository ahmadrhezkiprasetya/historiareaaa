import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type GameState = {
  energy: number;
  lives: number;
  score: number;
  spend: (cost: number) => boolean;
  restoreEnergy: (amount: number) => void;
  loseLife: () => void;
  addScore: (n: number) => void;
  reset: () => void;
};

const GameContext = createContext<GameState | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [energy, setEnergy] = useState(100);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);

  const spend = useCallback((cost: number) => {
    let ok = true;
    setEnergy((e) => {
      if (e < cost) { ok = false; return e; }
      return Math.max(0, e - cost);
    });
    return ok;
  }, []);

  const restoreEnergy = useCallback((amount: number) => {
    setEnergy((e) => Math.min(100, e + amount));
  }, []);

  const loseLife = useCallback(() => setLives((l) => Math.max(0, l - 1)), []);
  const addScore = useCallback((n: number) => setScore((s) => s + n), []);
  const reset = useCallback(() => { setEnergy(100); setLives(3); setScore(0); }, []);

  return (
    <GameContext.Provider value={{ energy, lives, score, spend, restoreEnergy, loseLife, addScore, reset }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}
