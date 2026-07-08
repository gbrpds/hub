import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Rota de uso único para criar o primeiro usuário ADMIN sem precisar
// rodar comandos localmente. Protegida por ADMIN_BOOTSTRAP_SECRET.
// Depois de usar, remova essa variável de ambiente na Vercel para
// desativar a rota (ela responde 404 se a variável não existir).
function secretsMatch(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function GET(request: NextRequest) {
  const bootstrapSecret = process.env.ADMIN_BOOTSTRAP_SECRET;

  if (!bootstrapSecret) {
    return new NextResponse("Not found", { status: 404 });
  }

  const providedSecret = request.nextUrl.searchParams.get("secret") ?? "";

  if (!secretsMatch(providedSecret, bootstrapSecret)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    return new NextResponse(
      "ADMIN_EMAIL e ADMIN_PASSWORD precisam estar configurados nas Environment Variables da Vercel.",
      { status: 500 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN" },
    create: { email, passwordHash, role: "ADMIN", name: "Admin" },
  });

  return new NextResponse(
    `Usuário ADMIN pronto: ${user.email}. Já pode acessar /login. Agora remova a variável ADMIN_BOOTSTRAP_SECRET da Vercel para desativar esta rota.`,
    { status: 200 },
  );
}
