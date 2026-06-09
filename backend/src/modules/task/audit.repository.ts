import { run } from "../../database/database";

export type AuditLog = {
  id: string;
  taskId: string;
  actorId: string;
  action: string;
  createdAt: string;
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
