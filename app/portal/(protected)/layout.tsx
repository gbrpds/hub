import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function PortalProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session || session.user.role !== "CLIENT") {
    redirect("/portal/login");
  }

  return <>{children}</>;
}
