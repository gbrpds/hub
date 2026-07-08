import { prisma } from "@/lib/prisma";
import { getCurrentAdminId } from "@/lib/current-user";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

// Sem isso o Next.js pode renderizar essa página como estática no build
// (nenhum código aqui usa cookies/params), congelando os dados — "hoje",
// atrasos e o resumo do mês precisam ser recalculados a cada acesso.
export const dynamic = "force-dynamic";

const DEMAND_STATUS_LABEL: Record<string, string> = {
  RECEBIDA: "Recebida",
  EM_PRODUCAO: "Em produção",
  APROVACAO: "Aprovação",
  PROGRAMAR: "Programar",
  CONCLUIDO: "Concluído",
  REPROVADO: "Reprovado",
  INTERNO: "Interno",
};

const PRIORITY_BADGE: Record<string, "danger" | "accent" | "default" | "outline"> = {
  URGENTE: "danger",
  ALTA: "accent",
  MEDIA: "default",
  BAIXA: "outline",
};

async function getDashboardData() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const adminId = await getCurrentAdminId();

  const [todayTasks, overdueDemands, recentActivity, activeClients, financeByStatus] =
    await Promise.all([
      adminId
        ? prisma.task.findMany({
            where: {
              ownerId: adminId,
              done: false,
              dueDate: { gte: startOfToday, lt: startOfTomorrow },
            },
            orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
            select: { id: true, title: true, priority: true },
          })
        : Promise.resolve([]),
      prisma.demand.findMany({
        where: {
          dueDate: { lt: startOfToday },
          status: { not: "CONCLUIDO" },
        },
        orderBy: { dueDate: "asc" },
        take: 15,
        select: {
          id: true,
          title: true,
          status: true,
          dueDate: true,
          client: { select: { name: true } },
        },
      }),
      prisma.activity.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          description: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.client.count({ where: { status: "ATIVO" } }),
      prisma.financeEntry.groupBy({
        by: ["status"],
        where: { referenceMonth: { gte: startOfMonth, lt: startOfNextMonth } },
        _sum: { value: true },
      }),
    ]);

  const totalRecebido = Number(
    financeByStatus.find((entry) => entry.status === "PAGO")?._sum.value ?? 0,
  );
  const totalPendente = Number(
    financeByStatus.find((entry) => entry.status === "PENDENTE")?._sum.value ?? 0,
  );

  return { todayTasks, overdueDemands, recentActivity, activeClients, totalRecebido, totalPendente };
}

export default async function AdminDashboardPage() {
  const {
    todayTasks,
    overdueDemands,
    recentActivity,
    activeClients,
    totalRecebido,
    totalPendente,
  } = await getDashboardData();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-muted">Área interna do Hub.</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>To-do de hoje</CardTitle>
          </CardHeader>
          <CardContent>
            {todayTasks.length === 0 ? (
              <p className="text-sm text-muted">Nenhuma tarefa pra hoje.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {todayTasks.map((task) => (
                  <li key={task.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 shrink-0 border border-border" />
                      <span className="text-sm text-foreground">{task.title}</span>
                    </div>
                    <Badge variant={PRIORITY_BADGE[task.priority]}>{task.priority}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Demandas em atraso
              {overdueDemands.length > 0 && (
                <Badge variant="danger" className="ml-2">
                  {overdueDemands.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overdueDemands.length === 0 ? (
              <p className="text-sm text-muted">Nenhuma demanda atrasada.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {overdueDemands.map((demand) => (
                  <li
                    key={demand.id}
                    className="border-l-4 border-danger bg-danger/5 py-1 pl-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-foreground">
                        {demand.title}
                      </span>
                      <Badge variant="danger">
                        {DEMAND_STATUS_LABEL[demand.status] ?? demand.status}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      {demand.client?.name ?? "Interno"} · venceu em{" "}
                      {demand.dueDate ? formatDate(demand.dueDate) : "—"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade recente</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted">Nenhuma atividade registrada ainda.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {recentActivity.map((activity) => (
                  <li key={activity.id} className="text-sm">
                    <p className="text-foreground">{activity.description}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {activity.user?.name ?? activity.user?.email ?? "Sistema"} ·{" "}
                      {formatDate(activity.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Clientes ativos</p>
                <p className="mt-1 text-xl font-bold text-foreground">{activeClients}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Recebido no mês</p>
                <p className="mt-1 text-xl font-bold text-foreground">
                  {formatCurrency(totalRecebido)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Pendente no mês</p>
                <p className="mt-1 text-xl font-bold text-accent">
                  {formatCurrency(totalPendente)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
