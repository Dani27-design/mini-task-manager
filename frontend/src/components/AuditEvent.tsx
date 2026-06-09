import { AuditLog } from "../types/audit";
import { formatAuditAction } from "../utils/display";
import { AuditChanges } from "./AuditChanges";

type AuditEventProps = {
  auditLog: AuditLog;
};

export function AuditEvent({ auditLog }: AuditEventProps) {
  return (
    <article className="audit-event">
      <p className="audit-title">{formatAuditAction(auditLog.action)}</p>
      <p className="audit-meta">
        {auditLog.actorName} - {new Date(auditLog.createdAt).toLocaleString()}
      </p>
      <AuditChanges changes={auditLog.changes} />
    </article>
  );
}
