import { FormEvent, useState } from "react";
import { createTask } from "../services/task.api";

type TaskFormProps = {
  actorId: string;
  onTaskCreated: () => void;
};

export function TaskForm({ actorId, onTaskCreated }: TaskFormProps) {
  const [title, setTitle] = useState("");
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
      await createTask({ title: trimmedTitle, actorId });
      setTitle("");
      onTaskCreated();
    } catch {
      setErrorMessage("Failed to create task.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="panel create-panel">
      <div className="panel-heading">
        <h2>Create Task</h2>
      </div>
      <form className="create-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="task-title">Title</label>
          <input
            id="task-title"
            className="text-input"
            type="text"
            placeholder="Add a task title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
        <button className="button primary-button" type="submit" disabled={isSubmitting || !title.trim() || !actorId}>
          {isSubmitting ? "Creating..." : "Create"}
        </button>
      </form>
      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
    </section>
  );
}
