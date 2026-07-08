import { prisma } from "@/lib/prisma";
import { getCurrentAdminId } from "@/lib/current-user";
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
    <div>
      <h1 className="text-2xl font-bold tracking-tight">To-do</h1>
      <p className="mt-2 text-muted">Sua lista de tarefas pessoais.</p>
      <div className="mt-6">
        <TodoClient tasks={tasks} />
      </div>
    </div>
  );
}
