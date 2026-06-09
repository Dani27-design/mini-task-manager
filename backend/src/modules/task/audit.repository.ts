import { run } from "../../database/database";

export type AuditLog = {
  id: string;
  taskId: string;
  actorId: string;
  action: string;
  createdAt: string;
};

export type AuditLogChange = {
  id: string;
  auditLogId: string;
  fieldName: string;
  previousValue: string | null;
  currentValue: string | null;
};

export async function createAuditLog(auditLog: AuditLog): Promise<void> {
  await run(
    `
      INSERT INTO audit_logs (id, taskId, actorId, action, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `,
    [auditLog.id, auditLog.taskId, auditLog.actorId, auditLog.action, auditLog.createdAt]
  );
}

export async function createAuditLogChange(change: AuditLogChange): Promise<void> {
  await run(
    `
      INSERT INTO audit_log_changes (id, auditLogId, fieldName, previousValue, currentValue)
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      change.id,
      change.auditLogId,
      change.fieldName,
      change.previousValue,
      change.currentValue
    ]
  );
}
