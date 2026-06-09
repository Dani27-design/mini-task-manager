import { AuditLogChange } from "../types/audit";

type AuditChangesProps = {
  changes: AuditLogChange[];
};

export function AuditChanges({ changes }: AuditChangesProps) {
  if (changes.length === 0) {
    return null;
  }

  return (
    <ul>
      {changes.map((change) => (
        <li key={change.id}>
          {change.fieldName}: {change.previousValue ?? ""} -&gt; {change.currentValue ?? ""}
        </li>
      ))}
    </ul>
  );
}
