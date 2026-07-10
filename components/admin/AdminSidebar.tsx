"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/utils";
import {
  ClientesIcon,
  CronogramaIcon,
  DashboardIcon,
  DemandasIcon,
  EstudioIcon,
  FinanceiroIcon,
  TodoIcon,
} from "./nav-icons";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

// Ferramentas separadas em boxes por área de trabalho.
const NAV_GROUPS: NavGroup[] = [
  {
    title: "Operação",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: DashboardIcon },
      { href: "/admin/demandas", label: "Demandas", icon: DemandasIcon },
      { href: "/admin/cronograma", label: "Cronograma", icon: CronogramaIcon },
      { href: "/admin/estudio", label: "Estúdio IA", icon: EstudioIcon },
      { href: "/admin/todo", label: "To-do", icon: TodoIcon },
    ],
  },
  {
    title: "Gestão",
    items: [
      { href: "/admin/clientes", label: "Clientes", icon: ClientesIcon },
      { href: "/admin/financeiro", label: "Financeiro", icon: FinanceiroIcon },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-6">
      {NAV_GROUPS.map((group) => (
        <div key={group.title} className="flex flex-col gap-2">
          <span className="px-1 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted">
            {group.title}
          </span>
          <div className="flex flex-col gap-1 rounded border border-border bg-background/40 p-1.5">
            {group.items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 overflow-hidden rounded-sm px-2.5 py-2 text-sm transition-all duration-200 ease-out",
                    active
                      ? "bg-gradient-to-r from-accent/20 via-accent/[0.06] to-transparent text-foreground shadow-[inset_0_0_0_1px_rgba(255,122,61,0.45)]"
                      : "text-muted hover:bg-surface-hover hover:text-foreground hover:translate-x-0.5",
                  )}
                >
                  {/* Barra lateral laranja no item ativo. */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-0 top-1/2 h-5 -translate-y-1/2 rounded-r bg-gradient-accent transition-all duration-200",
                      active
                        ? "w-[3px] opacity-100 shadow-[0_0_10px_1px_rgba(255,122,61,0.6)]"
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
