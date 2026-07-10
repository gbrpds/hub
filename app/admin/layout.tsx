import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { AdminShell } from "@/components/admin/AdminShell";

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
    <AdminShell
      footer={
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
      }
    >
      {children}
    </AdminShell>
  );
}
