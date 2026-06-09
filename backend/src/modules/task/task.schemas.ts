import { z } from "zod";
import { taskStatuses } from "../../constants/task-status";

export const emptyBodySchema = z.object({}).strict();

export const createTaskSchema = z
  .object({
    title: z.string().trim().min(1),
    actorId: z.string().trim().min(1)
  })
  .strict();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    status: z.enum(taskStatuses).optional(),
    actorId: z.string().trim().min(1)
  })
  .strict();

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const deleteTaskSchema = z
  .object({
    actorId: z.string().trim().min(1)
  })
  .strict();

export type DeleteTaskInput = z.infer<typeof deleteTaskSchema>;
