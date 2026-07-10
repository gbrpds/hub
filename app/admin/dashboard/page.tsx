import { prisma } from "@/lib/prisma";
import { getCurrentAdminId } from "@/lib/current-user";
import { formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import {
  ActivityIcon,
  AlertIcon,
  ChecklistIcon,
  ClockIcon,
  UsersIcon,
  WalletIcon,
} from "@/components/ui/icons";

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
    <div className="flex flex-col gap-10">
      <PageHeader
        index="01"
        title="Dashboard"
        description="Visão geral do estúdio — o que precisa de você hoje."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Clientes ativos"
          value={activeClients}
          icon={<UsersIcon />}
        />
        <StatCard
          label="Recebido no mês"
          value={totalRecebido}
          format="currency"
          icon={<WalletIcon />}
        />
        <StatCard
          label="Pendente no mês"
          value={totalPendente}
          format="currency"
          icon={<ClockIcon />}
          accent
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card glow>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-accent">
                <ChecklistIcon />
              </span>
              To-do de hoje
            </CardTitle>
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

        <Card glow>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className={overdueDemands.length > 0 ? "text-danger" : "text-muted"}>
                <AlertIcon />
              </span>
              Demandas em atraso
              {overdueDemands.length > 0 && (
                <Badge variant="danger" className="ml-1">
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

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-accent">
                <ActivityIcon />
              </span>
              Atividade recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted">Nenhuma atividade registrada ainda.</p>
            ) : (
              <ul className="flex flex-col">
                {recentActivity.map((activity) => (
                  <li
                    key={activity.id}
                    className="flex gap-3 border-b border-border py-3 text-sm first:pt-0 last:border-0 last:pb-0"
                  >
                    <span className="mt-0.5 shrink-0 text-muted">
                      <ActivityIcon width={14} height={14} />
                    </span>
                    <div>
                      <p className="text-foreground">{activity.description}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {activity.user?.name ?? activity.user?.email ?? "Sistema"} ·{" "}
                        {formatDate(activity.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
