import { actors } from "../../constants/actors";
import { auditActions } from "../../constants/audit-actions";
import { taskStatuses } from "../../constants/task-status";
import { transaction } from "../../database/database";
import { AppError } from "../../middleware/error.middleware";
import { createUuid } from "../../utils/uuid";
import { createAuditLog } from "./audit.repository";
import { CreateTaskInput } from "./task.schemas";
import { createTask, listTasks, Task } from "./task.repository";

type CreateTaskDependencies = {
  createTaskRecord: typeof createTask;
  createAuditLogRecord: typeof createAuditLog;
  runTransaction: typeof transaction;
  createId: typeof createUuid;
  getNow: () => Date;
};

const defaultDependencies: CreateTaskDependencies = {
  createTaskRecord: createTask,
  createAuditLogRecord: createAuditLog,
  runTransaction: transaction,
  createId: createUuid,
  getNow: () => new Date()
};

export async function createTaskService(
  input: CreateTaskInput,
  dependencies: CreateTaskDependencies = defaultDependencies
): Promise<Task> {
  const actorExists = actors.some((actor) => actor.id === input.actorId);

  if (!actorExists) {
    throw new AppError("VALIDATION_ERROR", "Actor does not exist", 400);
  }

  const now = dependencies.getNow().toISOString();
  const task: Task = {
    id: dependencies.createId(),
    title: input.title,
    status: taskStatuses[0],
    createdAt: now,
    updatedAt: now,
    deletedAt: null
  };

  await dependencies.runTransaction(async () => {
    await dependencies.createTaskRecord(task);
    await dependencies.createAuditLogRecord({
      id: dependencies.createId(),
      taskId: task.id,
      actorId: input.actorId,
      action: auditActions[0],
      createdAt: now
    });
  });

  return task;
}

export async function listTasksService(): Promise<Task[]> {
  return listTasks();
}
