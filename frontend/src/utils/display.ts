const statusLabels: Record<string, string> = {
  to_do: "To do",
  pending: "Pending",
  in_progress: "In progress",
  done: "Done"
};

const auditActionLabels: Record<string, string> = {
  TASK_CREATED: "Task created",
  TASK_UPDATED: "Task updated",
  TASK_DELETED: "Task deleted"
};

const fieldLabels: Record<string, string> = {
  title: "Title",
  status: "Status"
};

export function formatStatus(status: string): string {
  return statusLabels[status] ?? status;
}

export function formatAuditAction(action: string): string {
  return auditActionLabels[action] ?? action;
}

export function formatFieldName(fieldName: string): string {
  return fieldLabels[fieldName] ?? fieldName;
}

export function formatFieldValue(fieldName: string, value: string | null): string {
  if (value === null || value === "") {
    return "-";
  }

  if (fieldName === "status") {
    return formatStatus(value);
  }

  return value;
}
