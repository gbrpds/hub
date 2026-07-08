import { auth } from "@/auth";

export default async function PortalHomePage() {
  const session = await auth();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Bem-vindo</h1>
      <p className="mt-2 text-muted">Área do cliente do Hub.</p>
      <p className="mt-4 text-sm text-muted">
        clientId: {session?.user.clientId ?? "não vinculado"}
      </p>
    </div>
  );
}
