import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from "react";

export type ItemId = "horse" | "sorban" | "naskah";
export type MedalId = "first_blood" | "perfect_quiz" | "hutan_clear" | "bonjol_clear" | "magelang_clear" | "pahlawan";
export type SkillId = "stealth" | "charisma";

type Skills = Record<SkillId, number>; // 0..3

type GameState = {
  energy: number;
  lives: number;
  score: number;
  level: number;
  inventory: Record<ItemId, number>;
  medals: MedalId[];
  playerName: string;
  gold: number;
  skills: Skills;
  articlesRead: string[];
  dailyDate: string; // YYYY-MM-DD last completed
  shake: number; // tick to trigger global shake
  liberationProgress: number; // derived 0..100

  setPlayerName: (n: string) => void;
  spend: (cost: number) => boolean;
  restoreEnergy: (amount: number) => void;
  loseLife: () => void;
  addScore: (n: number) => void;
  addGold: (n: number) => void;
  spendGold: (n: number) => boolean;
  addItem: (id: ItemId) => void;
  useItem: (id: ItemId) => boolean;
  awardMedal: (id: MedalId) => void;
  setLevel: (n: number) => void;
  upgradeSkill: (id: SkillId) => boolean;
  markArticleRead: (id: string) => void;
  completeDaily: () => void;
  triggerShake: () => void;
  reset: () => void;
};

const STORE = "hist_game_v3";
const initialInv: Record<ItemId, number> = { horse: 0, sorban: 0, naskah: 0 };
const initialSkills: Skills = { stealth: 0, charisma: 0 };
export const SKILL_COST = [50, 120, 250]; // cost to reach level 1,2,3 (in score points)
export const MAX_SKILL = 3;

const GameContext = createContext<GameState | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [energy, setEnergy] = useState(100);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [level, setLevelState] = useState(0);
  const [inventory, setInventory] = useState<Record<ItemId, number>>(initialInv);
  const [medals, setMedals] = useState<MedalId[]>([]);
  const [playerName, setPlayerNameState] = useState("");
  const [gold, setGold] = useState(0);
  const [skills, setSkills] = useState<Skills>(initialSkills);
  const [articlesRead, setArticlesRead] = useState<string[]>([]);
  const [dailyDate, setDailyDate] = useState("");
  const [shake, setShake] = useState(0);
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
        if (typeof s.gold === "number") setGold(s.gold);
        if (s.skills) setSkills({ ...initialSkills, ...s.skills });
        if (Array.isArray(s.articlesRead)) setArticlesRead(s.articlesRead);
        if (typeof s.dailyDate === "string") setDailyDate(s.dailyDate);
      }
    } catch { /* noop */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    localStorage.setItem(STORE, JSON.stringify({
      energy, lives, score, level, inventory, medals, playerName,
      gold, skills, articlesRead, dailyDate,
    }));
  }, [hydrated, energy, lives, score, level, inventory, medals, playerName, gold, skills, articlesRead, dailyDate]);

  const spend = useCallback((cost: number) => {
    let ok = true;
    setEnergy((e) => { if (e < cost) { ok = false; return e; } return Math.max(0, e - cost); });
    return ok;
  }, []);
  const restoreEnergy = useCallback((amount: number) => setEnergy((e) => Math.min(100, e + amount)), []);
  const loseLife = useCallback(() => { setLives((l) => Math.max(0, l - 1)); setShake((s) => s + 1); }, []);
  const addScore = useCallback((n: number) => setScore((s) => s + n), []);
  const addGold = useCallback((n: number) => setGold((g) => g + n), []);
  const spendGold = useCallback((n: number) => {
    let ok = true; setGold((g) => { if (g < n) { ok = false; return g; } return g - n; }); return ok;
  }, []);
  const addItem = useCallback((id: ItemId) => setInventory((i) => ({ ...i, [id]: i[id] + 1 })), []);
  const useItem = useCallback((id: ItemId) => {
    let ok = false;
    setInventory((i) => { if (i[id] > 0) { ok = true; return { ...i, [id]: i[id] - 1 }; } return i; });
    return ok;
  }, []);
  const awardMedal = useCallback((id: MedalId) => setMedals((m) => (m.includes(id) ? m : [...m, id])), []);
  const setLevel = useCallback((n: number) => setLevelState(n), []);
  const setPlayerName = useCallback((n: string) => setPlayerNameState(n), []);
  const upgradeSkill = useCallback((id: SkillId) => {
    let ok = false;
    setSkills((sk) => {
      const cur = sk[id];
      if (cur >= MAX_SKILL) return sk;
      const cost = SKILL_COST[cur];
      let canBuy = false;
      setScore((s) => { if (s >= cost) { canBuy = true; return s - cost; } return s; });
      if (!canBuy) return sk;
      ok = true;
      return { ...sk, [id]: cur + 1 };
    });
    return ok;
  }, []);
  const markArticleRead = useCallback((id: string) => {
    setArticlesRead((a) => (a.includes(id) ? a : [...a, id]));
  }, []);
  const completeDaily = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    setDailyDate(today);
    setGold((g) => g + 25);
  }, []);
  const triggerShake = useCallback(() => setShake((s) => s + 1), []);
  const reset = useCallback(() => {
    setEnergy(100); setLives(3); setLevelState(0);
    setInventory(initialInv);
  }, []);

  // Liberation Progress: medals (max 6)*10 + articles (max 2)*15 + level*10  (cap 100)
  const liberationProgress = useMemo(() => {
    const v = Math.min(6, medals.length) * 10 + Math.min(2, articlesRead.length) * 15 + Math.min(3, level) * 10;
    return Math.min(100, v);
  }, [medals, articlesRead, level]);

  return (
    <GameContext.Provider value={{
      energy, lives, score, level, inventory, medals, playerName,
      gold, skills, articlesRead, dailyDate, shake, liberationProgress,
      setPlayerName, spend, restoreEnergy, loseLife, addScore,
      addGold, spendGold, addItem, useItem, awardMedal, setLevel,
      upgradeSkill, markArticleRead, completeDaily, triggerShake, reset,
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
