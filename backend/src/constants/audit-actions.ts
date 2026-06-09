export const auditActions = ["TASK_CREATED", "TASK_UPDATED", "TASK_DELETED"] as const;

export type AuditAction = (typeof auditActions)[number];
