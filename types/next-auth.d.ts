import type { Role } from "@/app/generated/prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      clientId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    clientId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    clientId: string | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role: Role;
    clientId: string | null;
  }
}
