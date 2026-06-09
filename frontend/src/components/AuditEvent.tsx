import { AuditLog } from "../types/audit";
import { AuditChanges } from "./AuditChanges";

type AuditEventProps = {
  auditLog: AuditLog;
};

export function AuditEvent({ auditLog }: AuditEventProps) {
  return (
    <article>
      <p>
        {auditLog.actorName} - {auditLog.action} -{" "}
        {new Date(auditLog.createdAt).toLocaleString()}
      </p>
      <AuditChanges changes={auditLog.changes} />
    </article>
  );
}
