import { FormEvent, useState } from "react";
import { deleteTask, updateTask } from "../services/task.api";
import { Task } from "../types/task";
import { formatStatus } from "../utils/display";
import { AuditHistory } from "./AuditHistory";

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
  const [isAuditHistoryOpen, setIsAuditHistoryOpen] = useState(false);
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
    <article className="task-card">
      <form className="task-edit-form" onSubmit={handleSubmit}>
        <div className="field title-field">
          <label htmlFor={`task-title-${task.id}`}>Title</label>
          <input
            id={`task-title-${task.id}`}
            className="text-input"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
        <div className="field status-field">
          <label htmlFor={`task-status-${task.id}`}>Status</label>
          <select
            id={`task-status-${task.id}`}
            className="select-input status-select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {taskStatuses.map((taskStatus) => (
              <option key={taskStatus} value={taskStatus}>
                {formatStatus(taskStatus)}
              </option>
            ))}
          </select>
        </div>
        <div className="task-actions">
          <button className="button primary-button" type="submit" disabled={isSubmitting || !title.trim() || !actorId}>
            {isSubmitting ? "Saving..." : "Save"}
          </button>
          <button className="button danger-button" type="button" disabled={isSubmitting || !actorId} onClick={handleDelete}>
            Delete
          </button>
          <button
            className="button secondary-button"
            type="button"
            onClick={() => setIsAuditHistoryOpen((currentValue) => !currentValue)}
          >
            {isAuditHistoryOpen ? "Hide history" : "Show history"}
          </button>
        </div>
      </form>
      <p className="task-meta">Last updated: {new Date(task.updatedAt).toLocaleString()}</p>
      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
      {isAuditHistoryOpen ? <AuditHistory taskId={task.id} /> : null}
    </article>
  );
}
