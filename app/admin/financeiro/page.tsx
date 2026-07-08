import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/Card";
import { RevenueChart, type RevenuePoint } from "./RevenueChart";
import { PayButton } from "./PayButton";

export const dynamic = "force-dynamic";

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
const MONTHS_SHORT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

function monthKey(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { m } = await searchParams;
  const now = new Date();

  let year = now.getFullYear();
  let month = now.getMonth();
  if (m && /^\d{4}-\d{2}$/.test(m)) {
    const [y, mo] = m.split("-").map(Number);
    year = y;
    month = mo - 1;
  }

  const start = new Date(year, month, 1);
  const next = new Date(year, month + 1, 1);

  // Clientes ativos do mês.
  const activeClients = await prisma.client.findMany({
    where: { status: "ATIVO" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, monthlyValue: true, paymentDay: true },
  });

  // Auto-geração: garante um FinanceEntry PENDENTE por cliente ativo com
  // valor mensal, se ainda não existir um para este mês.
  const existing = await prisma.financeEntry.findMany({
    where: { referenceMonth: { gte: start, lt: next } },
    select: { clientId: true },
  });
  const haveEntry = new Set(existing.map((entry) => entry.clientId));
  const toCreate = activeClients.filter(
    (client) =>
      client.monthlyValue != null &&
      Number(client.monthlyValue) > 0 &&
      !haveEntry.has(client.id),
  );
  if (toCreate.length > 0) {
    await prisma.financeEntry.createMany({
      data: toCreate.map((client) => ({
        clientId: client.id,
        value: client.monthlyValue!,
        referenceMonth: start,
        status: "PENDENTE" as const,
      })),
    });
  }

  // Lançamentos do mês (após a auto-geração).
  const entries = await prisma.financeEntry.findMany({
    where: { referenceMonth: { gte: start, lt: next } },
    select: { id: true, value: true, status: true, clientId: true },
  });
  const entryByClient = new Map(entries.map((entry) => [entry.clientId, entry]));

  const totalEsperado = activeClients.reduce(
    (sum, client) => sum + Number(client.monthlyValue ?? 0),
    0,
  );
  const totalRecebido = entries
    .filter((entry) => entry.status === "PAGO")
    .reduce((sum, entry) => sum + Number(entry.value), 0);
  const totalPendente = entries
    .filter((entry) => entry.status === "PENDENTE")
    .reduce((sum, entry) => sum + Number(entry.value), 0);

  const isPast =
    year < now.getFullYear() ||
    (year === now.getFullYear() && month < now.getMonth());
  const isCurrent =
    year === now.getFullYear() && month === now.getMonth();

  function isOverdue(status: string, paymentDay: number | null) {
    if (status !== "PENDENTE") return false;
    if (isPast) return true;
    if (isCurrent && paymentDay != null) return now.getDate() > paymentDay;
    return false;
  }

  const overdueTotal = activeClients.reduce((sum, client) => {
    const entry = entryByClient.get(client.id);
    if (entry && isOverdue(entry.status, client.paymentDay)) {
      return sum + Number(entry.value);
    }
    return sum;
  }, 0);

  // Gráfico: receita paga nos 6 meses até o mês selecionado.
  const chartStart = new Date(year, month - 5, 1);
  const paidInRange = await prisma.financeEntry.findMany({
    where: { status: "PAGO", referenceMonth: { gte: chartStart, lt: next } },
    select: { referenceMonth: true, value: true },
  });
  const chartData: RevenuePoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, month - i, 1);
    const key = monthKey(d.getFullYear(), d.getMonth());
    const value = paidInRange
      .filter(
        (entry) =>
          monthKey(
            entry.referenceMonth.getFullYear(),
            entry.referenceMonth.getMonth(),
          ) === key,
      )
      .reduce((sum, entry) => sum + Number(entry.value), 0);
    chartData.push({
      label: `${MONTHS_SHORT[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`,
      value,
    });
  }

  const prev = new Date(year, month - 1, 1);
  const nextMonth = new Date(year, month + 1, 1);
  const prevHref = `/admin/financeiro?m=${monthKey(prev.getFullYear(), prev.getMonth())}`;
  const nextHref = `/admin/financeiro?m=${monthKey(nextMonth.getFullYear(), nextMonth.getMonth())}`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
        <div className="flex items-center gap-2">
          <Link
            href={prevHref}
            className="rounded-sm border border-border px-2 py-1 text-sm text-foreground hover:bg-surface"
          >
            ‹
          </Link>
          <span className="min-w-[150px] text-center text-sm font-bold text-foreground">
            {MONTHS[month]} {year}
          </span>
          <Link
            href={nextHref}
            className="rounded-sm border border-border px-2 py-1 text-sm text-foreground hover:bg-surface"
          >
            ›
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent>
            <p className="text-xs uppercase tracking-wide text-muted">
              Esperado no mês
            </p>
            <p className="mt-1 text-xl font-bold text-foreground">
              {formatCurrency(totalEsperado)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs uppercase tracking-wide text-muted">Recebido</p>
            <p className="mt-1 text-xl font-bold text-success">
              {formatCurrency(totalRecebido)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs uppercase tracking-wide text-muted">Pendente</p>
            <p className="mt-1 text-xl font-bold text-accent">
              {formatCurrency(totalPendente)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs uppercase tracking-wide text-muted">
              Inadimplência
            </p>
            <p className="mt-1 text-xl font-bold text-danger">
              {formatCurrency(overdueTotal)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 rounded border border-border bg-surface p-4">
        <h2 className="mb-4 text-sm font-bold tracking-tight text-foreground">
          Receita recebida (últimos 6 meses)
        </h2>
        <RevenueChart data={chartData} />
      </div>

      <div className="mt-6 overflow-x-auto rounded border border-border">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-3 py-2 font-semibold">Cliente</th>
              <th className="px-3 py-2 font-semibold">Valor</th>
              <th className="px-3 py-2 font-semibold">Dia pgto.</th>
              <th className="px-3 py-2 font-semibold">Status</th>
              <th className="px-3 py-2 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {activeClients.map((client) => {
              const entry = entryByClient.get(client.id);
              const value = entry
                ? Number(entry.value)
                : Number(client.monthlyValue ?? 0);
              const overdue = entry
                ? isOverdue(entry.status, client.paymentDay)
                : false;
              return (
                <tr
                  key={client.id}
                  className="border-b border-border last:border-0 hover:bg-surface"
                >
                  <td className="px-3 py-2">
                    <Link
                      href={`/admin/clientes/${client.id}`}
                      className="text-foreground hover:text-accent"
                    >
                      {client.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-foreground">
                    {value > 0 ? formatCurrency(value) : "—"}
                  </td>
                  <td className="px-3 py-2 text-muted">
                    {client.paymentDay ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    {!entry ? (
                      <span className="text-muted">—</span>
                    ) : entry.status === "PAGO" ? (
                      <span className="text-success">Pago</span>
                    ) : (
                      <span className={overdue ? "font-semibold text-danger" : "text-accent"}>
                        {overdue ? "Atrasado" : "Pendente"}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {entry && (
                      <PayButton
                        entryId={entry.id}
                        paid={entry.status === "PAGO"}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
            {activeClients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-muted">
                  Nenhum cliente ativo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
