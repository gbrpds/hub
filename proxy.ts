import { NextResponse } from "next/server";
import { auth } from "@/auth";

const PUBLIC_PORTAL_PATHS = ["/portal/login", "/portal/verify-request"];

const protectedProxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const role = session?.user?.role;

  const isAdminPath = pathname.startsWith("/admin");
  const isPublicPortalPath = PUBLIC_PORTAL_PATHS.some((path) =>
    pathname.startsWith(path),
  );
  const isPortalPath = pathname.startsWith("/portal") && !isPublicPortalPath;

  if (isAdminPath) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/portal", req.nextUrl));
    }
  }

  if (isPortalPath) {
    if (!session) {
      return NextResponse.redirect(new URL("/portal/login", req.nextUrl));
    }
    if (role !== "CLIENT") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.nextUrl));
    }
  }

  return NextResponse.next();
});

// Trava de login DESLIGADA por padrão enquanto o Auth.js não está
// funcionando em produção — /admin e /portal ficam acessíveis sem
// sessão. Para reativar, defina AUTH_GATE_ENABLED=true na Vercel
// (Settings → Environment Variables) e redeploy. Nenhum código precisa
// mudar de novo, é só essa variável.
export default function proxy(...args: Parameters<typeof protectedProxy>) {
  if (process.env.AUTH_GATE_ENABLED !== "true") {
    return NextResponse.next();
  }
  return protectedProxy(...args);
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
