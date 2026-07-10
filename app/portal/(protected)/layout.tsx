import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentClientId } from "@/lib/current-user";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { PortalSidebar } from "@/components/portal/PortalSidebar";
import { PortalBottomNav } from "@/components/portal/PortalBottomNav";

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
      {/* Sidebar — só desktop */}
      <aside className="hidden flex-col gap-0 border-border bg-surface/70 px-4 backdrop-blur-sm md:sticky md:top-0 md:flex md:h-screen md:w-60 md:shrink-0 md:justify-between md:border-r md:py-6">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-gradient-accent text-sm font-extrabold text-accent-foreground shadow-[0_4px_14px_-4px_rgba(255,122,61,0.7)]">
              P
            </span>
            <span className="text-lg font-bold tracking-tight text-foreground">
              Portal <span className="text-gradient-accent">do Cliente</span>
            </span>
          </div>
          <PortalSidebar />
        </div>
        <div className="flex flex-col gap-2 border-t border-border pt-4 text-sm text-muted">
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

      {/* Top bar — só celular */}
      <header className="flex items-center justify-between border-b border-border bg-surface/80 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-gradient-accent text-sm font-extrabold text-accent-foreground shadow-[0_4px_14px_-4px_rgba(255,122,61,0.7)]">
            P
          </span>
          <span className="text-base font-bold tracking-tight text-foreground">
            {client?.name ?? "Portal"}
          </span>
        </div>
        {AUTH_GATE_ENABLED && <SignOutButton />}
      </header>

      {/* pb extra no celular pra não ficar atrás da barra de abas */}
      <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 md:px-10 md:pb-8 md:pt-8">
        {children}
      </main>

      <PortalBottomNav />
    </div>
  );
}
