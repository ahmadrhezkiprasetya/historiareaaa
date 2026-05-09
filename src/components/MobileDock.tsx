import { Link } from "@tanstack/react-router";
import { Home, BookOpen, Sparkles, Swords, Award, Archive } from "lucide-react";

const items = [
  { to: "/", label: "Beranda", icon: Home },
  { to: "/chronicles", label: "Babad", icon: BookOpen },
  { to: "/quest", label: "Quest", icon: Swords },
  { to: "/pakar", label: "Pakar", icon: Sparkles },
  { to: "/arsip", label: "Arsip", icon: Archive },
  { to: "/medals", label: "Medali", icon: Award },
] as const;

export function MobileDock() {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-parchment/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Mobile navigation"
    >
      <ul className="grid grid-cols-6">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              className="flex flex-col items-center justify-center gap-0.5 py-2 text-[9px] uppercase tracking-[0.15em] text-charcoal/70"
              activeProps={{ className: "text-maroon font-semibold" }}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
