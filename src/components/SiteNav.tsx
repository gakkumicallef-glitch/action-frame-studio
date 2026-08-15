import { Link } from "@tanstack/react-router";
import { Lock, Menu } from "lucide-react";
import { useState } from "react";

const links = [
  { to: "/", label: "Home" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 sm:flex sm:justify-between">
        <Link to="/" className="min-w-0">
          <span className="block truncate font-display text-lg tracking-[0.22em] sm:text-xl">
            Versa<span className="text-primary">Sport</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 sm:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "text-foreground" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="text-[0.7rem] uppercase tracking-[0.25em] transition-colors hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/admin"
            aria-label="Admin login"
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            <Lock className="h-4 w-4" />
          </Link>
        </nav>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 text-muted-foreground sm:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-4 border-t border-border/40 px-5 py-5 sm:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="text-xs uppercase tracking-[0.25em] text-muted-foreground"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/admin"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground"
          >
            <Lock className="h-3.5 w-3.5" /> Admin
          </Link>
        </nav>
      )}
    </header>
  );
}