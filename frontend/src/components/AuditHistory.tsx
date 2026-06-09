import { useEffect, useState } from "react";
import { getTaskAuditLogs } from "../services/task.api";
import { AuditLog } from "../types/audit";
import { AuditEvent } from "./AuditEvent";

type AuditHistoryProps = {
  taskId: string;
};

export function AuditHistory({ taskId }: AuditHistoryProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setIsLoading(true);
    setErrorMessage("");

    getTaskAuditLogs(taskId)
      .then((logs) => {
        setAuditLogs(logs);
      })
      .catch(() => {
        setErrorMessage("Failed to load audit history.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [taskId]);

  if (isLoading) {
    return <p className="muted">Loading audit history...</p>;
  }

  if (errorMessage) {
    return <p className="error-text">{errorMessage}</p>;
  }

  if (auditLogs.length === 0) {
    return <p className="muted">No audit history yet.</p>;
  }

  return (
    <section className="audit-history">
      {auditLogs.map((auditLog) => (
        <AuditEvent key={auditLog.id} auditLog={auditLog} />
      ))}
    </section>
  );
}
