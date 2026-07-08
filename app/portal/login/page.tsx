"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function PortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("nodemailer", {
      email,
      redirect: false,
      callbackUrl: "/portal",
    });

    setLoading(false);

    if (result?.error) {
      setError("Não foi possível enviar o link. Verifique se o e-mail está cadastrado.");
      return;
    }

    router.push("/portal/verify-request");
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Acessar Portal</h1>
        <p className="mt-2 text-sm text-muted">
          Digite seu e-mail para receber um link de acesso.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="E-mail"
          type="email"
          name="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Enviando..." : "Enviar link de acesso"}
        </Button>
      </form>
    </div>
  );
}
