import { actors } from "../../constants/actors";
import { auditActions } from "../../constants/audit-actions";
import { taskStatuses } from "../../constants/task-status";
import { transaction } from "../../database/database";
import { AppError } from "../../middleware/error.middleware";
import { createUuid } from "../../utils/uuid";
import { createAuditLog, createAuditLogChange } from "./audit.repository";
import { CreateTaskInput, UpdateTaskInput } from "./task.schemas";
import { createTask, findTaskById, listTasks, Task, updateTask } from "./task.repository";

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

type TaskChange = {
  fieldName: "title" | "status";
  previousValue: string;
  currentValue: string;
};

const validStatusTransitions = new Map<string, string>([
  ["to_do", "pending"],
  ["pending", "in_progress"],
  ["in_progress", "done"]
]);

export function isValidStatusTransition(currentStatus: string, nextStatus: string): boolean {
  if (currentStatus === nextStatus) {
    return true;
  }

  return validStatusTransitions.get(currentStatus) === nextStatus;
}

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

export async function updateTaskService(taskId: string, input: UpdateTaskInput): Promise<Task> {
  const actorExists = actors.some((actor) => actor.id === input.actorId);

  if (!actorExists) {
    throw new AppError("VALIDATION_ERROR", "Actor does not exist", 400);
  }

  const existingTask = await findTaskById(taskId);

  if (!existingTask) {
    throw new AppError("TASK_NOT_FOUND", "Task not found", 404);
  }

  if (existingTask.deletedAt) {
    throw new AppError("TASK_NOT_FOUND", "Task not found", 404);
  }

  const changes: TaskChange[] = [];

  if (input.title !== undefined && input.title !== existingTask.title) {
    changes.push({
      fieldName: "title",
      previousValue: existingTask.title,
      currentValue: input.title
    });
  }

  if (input.status !== undefined && input.status !== existingTask.status) {
    if (!isValidStatusTransition(existingTask.status, input.status)) {
      throw new AppError(
        "INVALID_STATUS_TRANSITION",
        "Invalid status transition",
        400
      );
    }

    changes.push({
      fieldName: "status",
      previousValue: existingTask.status,
      currentValue: input.status
    });
  }

  if (changes.length === 0) {
    return existingTask;
  }

  const now = new Date().toISOString();
  const updatedTask: Task = {
    ...existingTask,
    title:
      changes.find((change) => change.fieldName === "title")?.currentValue ??
      existingTask.title,
    status:
      changes.find((change) => change.fieldName === "status")?.currentValue ??
      existingTask.status,
    updatedAt: now
  };

  await transaction(async () => {
    await updateTask(updatedTask);

    const auditLogId = createUuid();

    await createAuditLog({
      id: auditLogId,
      taskId: updatedTask.id,
      actorId: input.actorId,
      action: auditActions[1],
      createdAt: now
    });

    for (const change of changes) {
      await createAuditLogChange({
        id: createUuid(),
        auditLogId,
        fieldName: change.fieldName,
        previousValue: change.previousValue,
        currentValue: change.currentValue
      });
    }
  });

  return updatedTask;
}
