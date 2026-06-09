import { all, run } from "../../database/database";

export type Task = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export async function createTask(task: Task): Promise<void> {
  await run(
    `
      INSERT INTO tasks (id, title, status, createdAt, updatedAt, deletedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [task.id, task.title, task.status, task.createdAt, task.updatedAt, task.deletedAt]
  );
}

export async function listTasks(): Promise<Task[]> {
  return all<Task>(`
    SELECT id, title, status, createdAt, updatedAt, deletedAt
    FROM tasks
    WHERE deletedAt IS NULL
    ORDER BY updatedAt DESC
  `);
}
