import { Link } from "@tanstack/react-router";
import { CloudSun } from "lucide-react";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  const links = [
    { to: "/", label: "Weer" },
    { to: "/dashboard", label: "Overzicht" },
  ] as const;

  return (
    <header className="site-header sticky top-0 z-20 border-b border-border/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Weer — naar home">
            <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
              <CloudSun className="size-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold tracking-tight">weer.</span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex" aria-label="Hoofdnavigatie">
            {links.map(({ to, label }) => {
              return (
                <Link
                  key={to}
                  to={to}
                  className="rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  activeProps={{ className: "bg-muted text-foreground" }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
