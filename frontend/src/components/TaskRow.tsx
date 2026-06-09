import { FormEvent, useState } from "react";
import { deleteTask, updateTask } from "../services/task.api";
import { Task } from "../types/task";

type TaskRowProps = {
  actorId: string;
  task: Task;
  onTaskUpdated: () => void;
};

const taskStatuses = ["to_do", "pending", "in_progress", "done"];

export function TaskRow({ actorId, task, onTaskUpdated }: TaskRowProps) {
  const [title, setTitle] = useState(task.title);
  const [status, setStatus] = useState(task.status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle || !actorId) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await updateTask(task.id, {
        title: trimmedTitle,
        status,
        actorId
      });
      onTaskUpdated();
    } catch {
      setErrorMessage("Failed to update task.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!actorId) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await deleteTask(task.id, { actorId });
      onTaskUpdated();
    } catch {
      setErrorMessage("Failed to delete task.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor={`task-title-${task.id}`}>Title</label>
        <input
          id={`task-title-${task.id}`}
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <label htmlFor={`task-status-${task.id}`}>Status</label>
        <select
          id={`task-status-${task.id}`}
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          {taskStatuses.map((taskStatus) => (
            <option key={taskStatus} value={taskStatus}>
              {taskStatus}
            </option>
          ))}
        </select>
        <button type="submit" disabled={isSubmitting || !title.trim() || !actorId}>
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </form>
      <button type="button" disabled={isSubmitting || !actorId} onClick={handleDelete}>
        Delete
      </button>
      <p>Last updated: {new Date(task.updatedAt).toLocaleString()}</p>
      {errorMessage ? <p>{errorMessage}</p> : null}
    </div>
  );
}
