import { z } from "zod";

export const emptyBodySchema = z.object({}).strict();

export const createTaskSchema = z
  .object({
    title: z.string().trim().min(1),
    actorId: z.string().trim().min(1)
  })
  .strict();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
