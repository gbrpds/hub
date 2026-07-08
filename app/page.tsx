import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
      <h1 className="text-3xl font-bold tracking-tight">
        Hub <span className="text-accent">de Gestão</span>
      </h1>
      <p className="max-w-md text-muted">
        Base do projeto pronta. Escolha uma área para continuar.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="border border-border bg-surface px-5 py-2.5 font-semibold text-foreground transition-colors hover:bg-surface-hover"
        >
          Área Admin
        </Link>
        <Link
          href="/portal/login"
          className="bg-accent px-5 py-2.5 font-semibold text-accent-foreground transition-opacity hover:opacity-90"
        >
          Portal do Cliente
        </Link>
      </div>
    </main>
  );
}
