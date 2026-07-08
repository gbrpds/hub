import { redirect } from "next/navigation";
import { auth } from "@/auth";

const AUTH_GATE_ENABLED = process.env.AUTH_GATE_ENABLED === "true";

export default async function PortalProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Ver app/admin/layout.tsx e proxy.ts: login desligado por padrão.
  if (!AUTH_GATE_ENABLED) {
    return <>{children}</>;
  }

  const session = await auth();

  if (!session || session.user.role !== "CLIENT") {
    redirect("/portal/login");
  }

  return <>{children}</>;
}
