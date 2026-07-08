import { auth } from "@/auth";
import { SignOutButton } from "@/components/auth/SignOutButton";

const AUTH_GATE_ENABLED = process.env.AUTH_GATE_ENABLED === "true";

export default async function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = AUTH_GATE_ENABLED ? await auth() : null;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border bg-surface px-8 py-4">
        <div className="text-lg font-bold tracking-tight text-foreground">
          Portal <span className="text-accent">do Cliente</span>
        </div>
        {session?.user && (
          <div className="flex items-center gap-4 text-sm text-muted">
            <span>{session.user.email}</span>
            <SignOutButton />
          </div>
        )}
      </header>
      <main className="flex-1 px-8 py-6">{children}</main>
    </div>
  );
}
