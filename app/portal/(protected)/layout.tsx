import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentClientId } from "@/lib/current-user";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { PortalSidebar } from "@/components/portal/PortalSidebar";

const AUTH_GATE_ENABLED = process.env.AUTH_GATE_ENABLED === "true";

export default async function PortalProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Login desligado por padrão (ver proxy.ts); com o gate ligado, só CLIENT.
  if (AUTH_GATE_ENABLED) {
    const session = await auth();
    if (!session || session.user.role !== "CLIENT") {
      redirect("/portal/login");
    }
  }

  const clientId = await getCurrentClientId();
  const client = clientId
    ? await prisma.client.findUnique({
        where: { id: clientId },
        select: { name: true },
      })
    : null;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* No mobile vira uma barra no topo; no desktop, sidebar à esquerda. */}
      <aside className="flex flex-col gap-4 border-b border-border bg-surface/70 px-4 py-4 backdrop-blur-sm md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:justify-between md:gap-0 md:border-b-0 md:border-r md:py-6">
        <div className="flex flex-col gap-4 md:gap-8">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded bg-gradient-accent text-sm font-extrabold text-accent-foreground shadow-[0_4px_14px_-4px_rgba(255,122,61,0.7)]">
                P
              </span>
              <span className="text-lg font-bold tracking-tight text-foreground">
                Portal <span className="text-gradient-accent">do Cliente</span>
              </span>
            </div>
            {/* Conta no mobile (canto superior direito) */}
            {AUTH_GATE_ENABLED && (
              <div className="md:hidden">
                <SignOutButton />
              </div>
            )}
          </div>
          <PortalSidebar />
        </div>
        {/* Rodapé com nome + sair: só no desktop */}
        <div className="hidden flex-col gap-2 border-t border-border pt-4 text-sm text-muted md:flex">
          {client && (
            <span className="truncate px-1 font-medium text-foreground">
              {client.name}
            </span>
          )}
          {AUTH_GATE_ENABLED ? (
            <SignOutButton />
          ) : (
            <span className="flex items-center gap-2 px-1 text-xs">
              <span className="glow-pulse h-2 w-2 rounded-full bg-accent" />
              Prévia (login desativado)
            </span>
          )}
        </div>
      </aside>
      <main className="flex-1 px-4 py-8 sm:px-6 md:px-10">{children}</main>
    </div>
  );
}
