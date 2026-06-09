import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { TaskPage } from "../../src/pages/TaskPage";
import { actors, auditLogs, baseTask } from "../../src/test/fixtures";
import { getActors } from "../../src/services/actor.api";
import { createTask, deleteTask, getTasks, getTaskAuditLogs, updateTask } from "../../src/services/task.api";

vi.mock("../../src/services/actor.api", () => ({
  getActors: vi.fn()
}));

vi.mock("../../src/services/task.api", () => ({
  createTask: vi.fn(),
  deleteTask: vi.fn(),
  getTaskAuditLogs: vi.fn(),
  getTasks: vi.fn(),
  updateTask: vi.fn()
}));

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getActors).mockResolvedValue(actors);
  vi.mocked(getTasks).mockResolvedValue([baseTask]);
  vi.mocked(getTaskAuditLogs).mockResolvedValue(auditLogs);
  vi.mocked(createTask).mockResolvedValue(baseTask);
  vi.mocked(updateTask).mockResolvedValue(baseTask);
  vi.mocked(deleteTask).mockResolvedValue({
    ...baseTask,
    deletedAt: "2026-06-10T02:00:00.000Z"
  });
});

describe("task audit flow e2e", () => {
  test("loads the app, opens task history, and displays formatted audit changes", async () => {
    const user = userEvent.setup();

    render(<TaskPage />);

    await screen.findByDisplayValue("Existing task");
    await user.click(screen.getByRole("button", { name: "Show history" }));

    const auditEvent = await screen.findByText("Task updated");
    const auditContainer = auditEvent.closest("article") as HTMLElement;

    expect(getTaskAuditLogs).toHaveBeenCalledWith("task-1");
    expect(within(auditContainer).getByText(/Jane Smith/)).toBeInTheDocument();
    expect(within(auditContainer).getByText("Title")).toBeInTheDocument();
    expect(within(auditContainer).getByText("Existing task")).toBeInTheDocument();
    expect(within(auditContainer).getByText("Updated task")).toBeInTheDocument();
    expect(within(auditContainer).getByText("→")).toBeInTheDocument();
  });

  test("shows the selected actor in write requests during the page flow", async () => {
    const user = userEvent.setup();

    render(<TaskPage />);

    await screen.findByDisplayValue("Existing task");
    const actorPanel = screen.getByLabelText("Actor selection");
    await user.selectOptions(within(actorPanel).getByRole("combobox"), "jane-smith");
    const createPanel = screen.getByRole("heading", { name: "Create Task" }).closest("section") as HTMLElement;
    await user.type(within(createPanel).getByLabelText("Title"), "Created from e2e flow");
    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(createTask).toHaveBeenCalledWith({
        title: "Created from e2e flow",
        actorId: "jane-smith"
      });
    });
  });
});
