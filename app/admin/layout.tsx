import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

const AUTH_GATE_ENABLED = process.env.AUTH_GATE_ENABLED === "true";

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
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col justify-between border-r border-border bg-surface/70 px-4 py-6 backdrop-blur-sm">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-2.5 px-1">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-gradient-accent text-sm font-extrabold text-accent-foreground shadow-[0_4px_14px_-4px_rgba(255,122,61,0.7)]">
              H
            </span>
            <span className="text-lg font-bold tracking-tight text-foreground">
              Hub <span className="text-gradient-accent">Admin</span>
            </span>
          </div>
          <AdminSidebar />
        </div>
        <div className="flex flex-col gap-2 border-t border-border pt-4 text-sm text-muted">
          {session?.user ? (
            <>
              <span className="truncate px-1">{session.user.email}</span>
              <SignOutButton />
            </>
          ) : (
            <span className="flex items-center gap-2 px-1">
              <span className="glow-pulse h-2 w-2 rounded-full bg-accent" />
              Login desativado (dev)
            </span>
          )}
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
