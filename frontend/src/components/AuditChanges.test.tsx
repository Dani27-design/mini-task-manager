import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { AuditChanges } from "./AuditChanges";

describe("AuditChanges", () => {
  test("formats field names and status values for display", () => {
    render(
      <AuditChanges
        changes={[
          {
            id: "change-1",
            auditLogId: "audit-1",
            fieldName: "status",
            previousValue: "to_do",
            currentValue: "in_progress"
          }
        ]}
      />
    );

    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("To do")).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
  });
});
