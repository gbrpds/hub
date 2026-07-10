import { prisma } from "@/lib/prisma";
import { getCurrentAdminId } from "@/lib/current-user";
import { PageHeader } from "@/components/ui/PageHeader";
import { TodoClient } from "./TodoClient";

// Mesmo motivo do /admin/dashboard: sem isso o Next.js pode congelar
// a lista como estática no build.
export const dynamic = "force-dynamic";

export default async function TodoPage() {
  const ownerId = await getCurrentAdminId();

  const tasks = ownerId
    ? await prisma.task.findMany({
        where: { ownerId },
        orderBy: [{ priority: "asc" }, { dueDate: { sort: "asc", nulls: "last" } }],
      })
    : [];

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        index="06"
        title="To-do"
        description="Sua lista de tarefas pessoais."
      />
      <div>
        <TodoClient tasks={tasks} />
      </div>
    </div>
  );
}
