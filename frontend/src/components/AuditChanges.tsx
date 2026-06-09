import { AuditLogChange } from "../types/audit";
import { formatFieldName, formatFieldValue } from "../utils/display";

type AuditChangesProps = {
  changes: AuditLogChange[];
};

export function AuditChanges({ changes }: AuditChangesProps) {
  if (changes.length === 0) {
    return null;
  }

  return (
    <ul className="audit-changes">
      {changes.map((change) => (
        <li key={change.id}>
          <span className="change-field">{formatFieldName(change.fieldName)}</span>
          <span className="change-value">
            {formatFieldValue(change.fieldName, change.previousValue)}
          </span>
          <span className="change-divider" aria-hidden="true">
            →
          </span>
          <span className="change-value current-value">
            {formatFieldValue(change.fieldName, change.currentValue)}
          </span>
        </li>
      ))}
    </ul>
  );
}
