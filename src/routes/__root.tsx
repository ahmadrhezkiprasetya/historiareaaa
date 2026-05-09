import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Heart, Zap, Trophy, BookOpen } from "lucide-react";

import appCss from "../styles.css?url";
import { GameProvider, useGame } from "@/lib/game-context";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-serif text-maroon">404</h1>
        <p className="mt-4 text-muted-foreground">Halaman tak ditemukan dalam babad ini.</p>
        <Link to="/" className="mt-6 inline-block border border-maroon px-5 py-2 text-maroon hover:bg-maroon hover:text-parchment transition">Kembali</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-serif">Halaman tak terbaca</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 border border-maroon px-5 py-2 text-maroon hover:bg-maroon hover:text-parchment transition">Coba lagi</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Historia Nusantara — Babad Para Pahlawan" },
      { name: "description", content: "Majalah sejarah editorial: Pangeran Diponegoro, Tuanku Imam Bonjol, dan kisah-kisah perlawanan Nusantara." },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function HUD() {
  const { energy, lives, score } = useGame();
  return (
    <div className="flex items-center gap-4 text-sm">
      <span className="flex items-center gap-1.5" title="Nyawa">
        <Heart className="h-4 w-4 text-maroon fill-maroon" />
        <span className="font-mono tabular-nums">{lives}</span>
      </span>
      <span className="flex items-center gap-1.5" title="Energi">
        <Zap className="h-4 w-4 text-accent fill-accent" />
        <span className="font-mono tabular-nums">{energy}</span>
      </span>
      <span className="flex items-center gap-1.5" title="Skor">
        <Trophy className="h-4 w-4 text-maroon" />
        <span className="font-mono tabular-nums">{score}</span>
      </span>
    </div>
  );
}

function Header() {
  const links = [
    { to: "/", label: "Beranda" },
    { to: "/chronicles", label: "Babad" },
    { to: "/pakar", label: "Pakar Sejarah" },
    { to: "/quest", label: "Quest Gerilya" },
  ] as const;
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-parchment/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2 group">
          <BookOpen className="h-5 w-5 text-maroon" />
          <div className="leading-tight">
            <div className="font-serif text-lg tracking-wide text-maroon">HISTORIA</div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground -mt-0.5">Nusantara Edisi Pahlawan</div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-charcoal/80 hover:text-maroon transition relative"
              activeProps={{ className: "text-maroon font-medium" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <HUD />
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row gap-4 justify-between text-xs text-muted-foreground">
        <div className="font-serif italic">"Sejarah adalah saksi yang membantah para pendusta zaman."</div>
        <div>© Historia Nusantara · Edisi Pahlawan</div>
      </div>
    </footer>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <GameProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
      </GameProvider>
    </QueryClientProvider>
  );
}
