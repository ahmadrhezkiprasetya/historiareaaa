import { useGame } from "@/lib/game-context";

export function LiberationBar() {
  const { liberationProgress } = useGame();
  return (
    <div className="w-full h-1 bg-border/60 relative overflow-hidden" title={`Liberation Progress: ${liberationProgress}%`}>
      <div
        className="h-full bg-gradient-to-r from-maroon via-accent to-maroon transition-all duration-700"
        style={{ width: `${liberationProgress}%` }}
      />
    </div>
  );
}
