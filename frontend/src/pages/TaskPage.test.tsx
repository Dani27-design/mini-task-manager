import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { TaskPage } from "./TaskPage";
import { getActors } from "../services/actor.api";
import {
  createTask,
  deleteTask,
  getTaskAuditLogs,
  getTasks,
  updateTask
} from "../services/task.api";
import { Task } from "../types/task";

vi.mock("../services/actor.api", () => ({
  getActors: vi.fn()
}));

vi.mock("../services/task.api", () => ({
  createTask: vi.fn(),
  deleteTask: vi.fn(),
  getTaskAuditLogs: vi.fn(),
  getTasks: vi.fn(),
  updateTask: vi.fn()
}));

const actors = [
  { id: "john-doe", name: "John Doe" },
  { id: "jane-smith", name: "Jane Smith" },
  { id: "alex-wilson", name: "Alex Wilson" }
];

const baseTask: Task = {
  id: "task-1",
  title: "Existing task",
  status: "to_do",
  createdAt: "2026-06-10T00:00:00.000Z",
  updatedAt: "2026-06-10T00:00:00.000Z",
  deletedAt: null
};

function mockDefaultApiState(tasks: Task[] = [baseTask]) {
  vi.mocked(getActors).mockResolvedValue(actors);
  vi.mocked(getTasks).mockResolvedValue(tasks);
  vi.mocked(createTask).mockResolvedValue({
    ...baseTask,
    id: "created-task",
    title: "New task"
  });
  vi.mocked(updateTask).mockResolvedValue({
    ...baseTask,
    title: "Updated task",
    status: "pending"
  });
  vi.mocked(deleteTask).mockResolvedValue({
    ...baseTask,
    deletedAt: "2026-06-10T01:00:00.000Z"
  });
  vi.mocked(getTaskAuditLogs).mockResolvedValue([
    {
      id: "audit-1",
      taskId: "task-1",
      actorId: "jane-smith",
      actorName: "Jane Smith",
      action: "TASK_UPDATED",
      createdAt: "2026-06-10T01:00:00.000Z",
      changes: [
        {
          id: "change-1",
          auditLogId: "audit-1",
          fieldName: "title",
          previousValue: "Existing task",
          currentValue: "Updated task"
        }
      ]
    }
  ]);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockDefaultApiState();
});

describe("TaskPage flows", () => {
  test("creates a task and refreshes the task list", async () => {
    const user = userEvent.setup();

    render(<TaskPage />);

    await screen.findByDisplayValue("John Doe");

    await user.type(screen.getAllByLabelText("Title")[0], "New task");
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

  test("updates a task and refreshes the task list", async () => {
    const user = userEvent.setup();

    render(<TaskPage />);

    const taskTitleInput = await screen.findByDisplayValue("Existing task");
    await user.clear(taskTitleInput);
    await user.type(taskTitleInput, "Updated task");
    await user.selectOptions(screen.getByLabelText("Status"), "pending");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(updateTask).toHaveBeenCalledWith("task-1", {
        title: "Updated task",
        status: "pending",
        actorId: "john-doe"
      });
    });
    await waitFor(() => {
      expect(getTasks).toHaveBeenCalledTimes(2);
    });
  });

  test("deletes a task and refreshes the task list", async () => {
    const user = userEvent.setup();

    render(<TaskPage />);

    await screen.findByDisplayValue("Existing task");
    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(deleteTask).toHaveBeenCalledWith("task-1", {
        actorId: "john-doe"
      });
    });
    await waitFor(() => {
      expect(getTasks).toHaveBeenCalledTimes(2);
    });
  });

  test("shows audit history for a task", async () => {
    const user = userEvent.setup();

    render(<TaskPage />);

    await screen.findByDisplayValue("Existing task");
    await user.click(screen.getByRole("button", { name: "Show history" }));

    await waitFor(() => {
      expect(getTaskAuditLogs).toHaveBeenCalledWith("task-1");
    });

    const history = await screen.findByText(/Jane Smith - TASK_UPDATED/);
    expect(history).toBeInTheDocument();
    expect(screen.getByText("title: Existing task -> Updated task")).toBeInTheDocument();
  });

  test("loads an empty task list", async () => {
    mockDefaultApiState([]);

    render(<TaskPage />);

    expect(await screen.findByText("No tasks yet.")).toBeInTheDocument();
  });
});
