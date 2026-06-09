import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { createTask } from "../services/task.api";
import { baseTask } from "../test/fixtures";
import { TaskForm } from "./TaskForm";

vi.mock("../services/task.api", () => ({
  createTask: vi.fn()
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createTask).mockResolvedValue(baseTask);
});

describe("TaskForm", () => {
  test("submits title and actor ID", async () => {
    const user = userEvent.setup();
    const onTaskCreated = vi.fn();

    render(<TaskForm actorId="john-doe" onTaskCreated={onTaskCreated} />);

    await user.type(screen.getByLabelText("Title"), "New task");
    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(createTask).toHaveBeenCalledWith({
        title: "New task",
        actorId: "john-doe"
      });
    });
    expect(onTaskCreated).toHaveBeenCalledTimes(1);
  });

  test("does not submit without an actor", async () => {
    const user = userEvent.setup();

    render(<TaskForm actorId="" onTaskCreated={vi.fn()} />);

    await user.type(screen.getByLabelText("Title"), "New task");

    expect(screen.getByRole("button", { name: "Create" })).toBeDisabled();
    expect(createTask).not.toHaveBeenCalled();
  });
});
