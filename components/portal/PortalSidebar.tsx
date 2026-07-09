"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/utils";
import {
  CronogramaIcon,
  InicioIcon,
  NovaDemandaIcon,
  ProjetosIcon,
} from "./portal-nav-icons";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  exact?: boolean;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Acompanhar",
    items: [
      { href: "/portal", label: "Início", icon: InicioIcon, exact: true },
      { href: "/portal/demandas", label: "Meus projetos", icon: ProjetosIcon },
      { href: "/portal/cronograma", label: "Cronograma", icon: CronogramaIcon },
    ],
  },
  {
    title: "Solicitar",
    items: [
      {
        href: "/portal/nova-demanda",
        label: "Nova demanda",
        icon: NovaDemandaIcon,
      },
    ],
  },
];

export function PortalSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-3 overflow-x-auto pb-1 md:flex-col md:gap-6 md:overflow-visible md:pb-0">
      {NAV_GROUPS.map((group) => (
        <div key={group.title} className="flex flex-col gap-2">
          <span className="hidden px-1 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted md:block">
            {group.title}
          </span>
          <div className="flex gap-1 rounded border border-border bg-background/40 p-1.5 md:flex-col">
            {group.items.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 overflow-hidden whitespace-nowrap rounded-sm px-2.5 py-2 text-sm transition-all duration-200 ease-out",
                    active
                      ? "bg-gradient-to-r from-accent/20 via-accent/[0.06] to-transparent text-foreground shadow-[inset_0_0_0_1px_rgba(255,122,61,0.45)]"
                      : "text-muted hover:bg-surface-hover hover:text-foreground md:hover:translate-x-0.5",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-0 top-1/2 hidden h-5 -translate-y-1/2 rounded-r bg-gradient-accent transition-all duration-200 md:block",
                      active
                        ? "w-[3px] opacity-100 shadow-[0_0_10px_1px_rgba(255,122,61,0.7)]"
                        : "w-0 opacity-0",
                    )}
                  />
                  <Icon
                    className={cn(
                      "shrink-0 transition-colors duration-200",
                      active
                        ? "text-accent"
                        : "text-muted group-hover:text-accent",
                    )}
                  />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
