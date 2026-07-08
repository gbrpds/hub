import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/auth/SignOutButton";

const AUTH_GATE_ENABLED = process.env.AUTH_GATE_ENABLED === "true";

const NAV_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/demandas", label: "Demandas" },
  { href: "/admin/cronograma", label: "Cronograma" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/financeiro", label: "Financeiro" },
  { href: "/admin/todo", label: "To-do" },
];

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Enquanto AUTH_GATE_ENABLED não é "true", não bloqueia acesso e não
  // tenta ler sessão (o Auth.js pode nem estar configurado ainda).
  // Ver proxy.ts para o motivo e como reativar o login de verdade.
  const session = AUTH_GATE_ENABLED ? await auth() : null;

  if (AUTH_GATE_ENABLED && (!session || session.user.role !== "ADMIN")) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 shrink-0 flex-col justify-between border-r border-border bg-surface px-4 py-6">
        <div className="flex flex-col gap-6">
          <div className="text-lg font-bold tracking-tight text-foreground">
            Hub <span className="text-accent">Admin</span>
          </div>
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-2 py-1.5 text-sm text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-2 text-sm text-muted">
          {session?.user ? (
            <>
              <span>{session.user.email}</span>
              <SignOutButton />
            </>
          ) : (
            <span>Login desativado (dev)</span>
          )}
        </div>
      </aside>
      <main className="flex-1 px-8 py-6">{children}</main>
    </div>
  );
}
