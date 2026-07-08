export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-surface px-8 py-4">
        <div className="text-lg font-bold tracking-tight text-foreground">
          Portal <span className="text-accent">do Cliente</span>
        </div>
      </header>
      <main className="flex-1 px-8 py-6">{children}</main>
    </div>
  );
}
