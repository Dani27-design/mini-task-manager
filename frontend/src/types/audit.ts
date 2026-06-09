export type AuditLogChange = {
  id: string;
  auditLogId: string;
  fieldName: string;
  previousValue: string | null;
  currentValue: string | null;
};

export type AuditLog = {
  id: string;
  taskId: string;
  actorId: string;
  actorName: string;
  action: string;
  createdAt: string;
  changes: AuditLogChange[];
};
