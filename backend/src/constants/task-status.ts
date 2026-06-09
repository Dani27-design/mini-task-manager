export const taskStatuses = ["to_do", "pending", "in_progress", "done"] as const;

export type TaskStatus = (typeof taskStatuses)[number];
