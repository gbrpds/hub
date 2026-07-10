import { prisma } from "@/lib/prisma";
import { getCurrentAdminId } from "@/lib/current-user";
import { PageHeader } from "@/components/ui/PageHeader";
import { TodoClient } from "./TodoClient";
import type { TodoTask } from "./todo-meta";

export const dynamic = "force-dynamic";

export default async function TodoPage() {
  const ownerId = await getCurrentAdminId();

  const tasks = ownerId
    ? await prisma.task.findMany({
        where: { ownerId, parentId: null },
        orderBy: [
          { done: "asc" },
          { priority: "asc" },
          { dueDate: { sort: "asc", nulls: "last" } },
          { createdAt: "asc" },
        ],
        select: {
          id: true,
          title: true,
          description: true,
          done: true,
          dueDate: true,
          priority: true,
          subtasks: {
            orderBy: { createdAt: "asc" },
            select: { id: true, title: true, done: true },
          },
        },
      })
    : [];

  const data: TodoTask[] = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    done: task.done,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    priority: task.priority,
    subtasks: task.subtasks,
  }));

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        index="06"
        title="To-do"
        description="Suas tarefas pessoais."
      />
      <TodoClient tasks={data} />
    </div>
  );
}
