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
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col justify-between border-r border-border bg-surface px-4 py-6">
        <div className="flex flex-col gap-6">
          <div className="text-lg font-bold tracking-tight text-foreground">
            Portal <span className="text-accent">do Cliente</span>
          </div>
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-sm px-2 py-2 text-sm text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-2 text-sm text-muted">
          {client && <span className="font-medium text-foreground">{client.name}</span>}
          {AUTH_GATE_ENABLED ? (
            <SignOutButton />
          ) : (
            <span className="text-xs">Prévia (login desativado)</span>
          )}
        </div>
      </aside>
      <main className="flex-1 px-6 py-6 sm:px-10">{children}</main>
    </div>
  );
}
