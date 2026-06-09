import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { deleteTask, updateTask } from "../services/task.api";
import { baseTask, updatedTask } from "../test/fixtures";
import { TaskRow } from "./TaskRow";

vi.mock("../services/task.api", () => ({
  deleteTask: vi.fn(),
  getTaskAuditLogs: vi.fn(),
  updateTask: vi.fn()
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(updateTask).mockResolvedValue(updatedTask);
  vi.mocked(deleteTask).mockResolvedValue({
    ...baseTask,
    deletedAt: "2026-06-10T01:00:00.000Z"
  });
});

describe("TaskRow", () => {
  test("submits task updates", async () => {
    const user = userEvent.setup();
    const onTaskUpdated = vi.fn();

    render(<TaskRow actorId="john-doe" task={baseTask} onTaskUpdated={onTaskUpdated} />);

    const titleInput = screen.getByDisplayValue("Existing task");
    await user.clear(titleInput);
    await user.type(titleInput, "Updated task");
    await user.selectOptions(screen.getByLabelText("Status"), "pending");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(updateTask).toHaveBeenCalledWith("task-1", {
        title: "Updated task",
        status: "pending",
        actorId: "john-doe"
      });
    });
    expect(onTaskUpdated).toHaveBeenCalledTimes(1);
  });

  test("deletes a task", async () => {
    const user = userEvent.setup();
    const onTaskUpdated = vi.fn();

    render(<TaskRow actorId="john-doe" task={baseTask} onTaskUpdated={onTaskUpdated} />);

    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(deleteTask).toHaveBeenCalledWith("task-1", {
        actorId: "john-doe"
      });
    });
    expect(onTaskUpdated).toHaveBeenCalledTimes(1);
  });
});
