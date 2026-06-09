import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { TaskPage } from "../../src/pages/TaskPage";
import { actors, baseTask, updatedTask } from "../../src/test/fixtures";
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
  vi.mocked(getTaskAuditLogs).mockResolvedValue([]);
  vi.mocked(createTask).mockResolvedValue(baseTask);
  vi.mocked(updateTask).mockResolvedValue(updatedTask);
  vi.mocked(deleteTask).mockResolvedValue({
    ...baseTask,
    deletedAt: "2026-06-10T02:00:00.000Z"
  });
});

describe("TaskPage integration", () => {
  test("creates a task and refreshes the task list", async () => {
    const user = userEvent.setup();
    const createdTask = {
      ...updatedTask,
      id: "task-2",
      title: "New task"
    };
    vi.mocked(createTask).mockResolvedValue(createdTask);
    vi.mocked(getTasks).mockResolvedValueOnce([baseTask]).mockResolvedValueOnce([baseTask, createdTask]);

    render(<TaskPage />);

    await screen.findByDisplayValue("Existing task");
    const createPanel = screen.getByRole("heading", { name: "Create Task" }).closest("section") as HTMLElement;
    await user.type(within(createPanel).getByLabelText("Title"), "New task");
    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(createTask).toHaveBeenCalledWith({
        title: "New task",
        actorId: "john-doe"
      });
    });
    await waitFor(() => {
      expect(getTasks).toHaveBeenCalledTimes(2);
    });
  });

  test("updates and deletes an existing task with the selected actor", async () => {
    const user = userEvent.setup();

    render(<TaskPage />);

    const taskTitleInput = await screen.findByDisplayValue("Existing task");
    const taskCard = taskTitleInput.closest("article") as HTMLElement;
    await user.clear(taskTitleInput);
    await user.type(taskTitleInput, "Updated task");
    await user.selectOptions(within(taskCard).getByLabelText("Status"), "pending");
    await user.click(within(taskCard).getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(updateTask).toHaveBeenCalledWith("task-1", {
        title: "Updated task",
        status: "pending",
        actorId: "john-doe"
      });
    });

    await user.click(within(taskCard).getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(deleteTask).toHaveBeenCalledWith("task-1", {
        actorId: "john-doe"
      });
    });
  });

  test("renders an empty task list", async () => {
    vi.mocked(getTasks).mockResolvedValue([]);

    render(<TaskPage />);

    const tasksPanel = await screen.findByRole("heading", { name: "Tasks" });
    expect(within(tasksPanel.closest("section") as HTMLElement).getByText("No tasks yet.")).toBeInTheDocument();
  });
});
