"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  CronogramaIcon,
  InicioIcon,
  NovaDemandaIcon,
  ProjetosIcon,
} from "./portal-nav-icons";

const TABS = [
  { href: "/portal", label: "Início", icon: InicioIcon, exact: true },
  { href: "/portal/demandas", label: "Projetos", icon: ProjetosIcon },
  { href: "/portal/cronograma", label: "Agenda", icon: CronogramaIcon },
  { href: "/portal/nova-demanda", label: "Nova", icon: NovaDemandaIcon },
];

// Barra de abas fixa embaixo — só no celular.
export function PortalBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      {TABS.map((tab) => {
        const active = tab.exact
          ? pathname === tab.href
          : pathname === tab.href || pathname.startsWith(tab.href + "/");
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
              active ? "text-accent" : "text-muted",
            )}
          >
            <Icon width={20} height={20} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
