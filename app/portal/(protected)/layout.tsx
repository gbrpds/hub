import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentClientId } from "@/lib/current-user";
import { SignOutButton } from "@/components/auth/SignOutButton";

const AUTH_GATE_ENABLED = process.env.AUTH_GATE_ENABLED === "true";

const NAV_LINKS = [
  { href: "/portal", label: "Início" },
  { href: "/portal/demandas", label: "Meus projetos" },
  { href: "/portal/cronograma", label: "Cronograma" },
  { href: "/portal/nova-demanda", label: "Nova demanda" },
];

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
      <aside className="flex flex-col gap-3 border-b border-border bg-surface px-4 py-4 md:w-56 md:shrink-0 md:justify-between md:gap-0 md:border-b-0 md:border-r md:py-6">
        <div className="flex flex-col gap-3 md:gap-6">
          <div className="flex items-center justify-between gap-2">
            <div className="text-lg font-bold tracking-tight text-foreground">
              Portal <span className="text-accent">do Cliente</span>
            </div>
            {/* Conta no mobile (canto superior direito) */}
            {AUTH_GATE_ENABLED && (
              <div className="md:hidden">
                <SignOutButton />
              </div>
            )}
          </div>
          <nav className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap rounded-sm px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        {/* Rodapé com nome + sair: só no desktop */}
        <div className="hidden flex-col gap-2 text-sm text-muted md:flex">
          {client && <span className="font-medium text-foreground">{client.name}</span>}
          {AUTH_GATE_ENABLED ? (
            <SignOutButton />
          ) : (
            <span className="text-xs">Prévia (login desativado)</span>
          )}
        </div>
      </aside>
      <main className="flex-1 px-4 py-6 sm:px-6 md:px-10">{children}</main>
    </div>
  );
}
