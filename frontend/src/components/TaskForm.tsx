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
    <section>
      <h2>Create Task</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="task-title">Title</label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <button type="submit" disabled={isSubmitting || !title.trim() || !actorId}>
          {isSubmitting ? "Creating..." : "Create"}
        </button>
      </form>
      {errorMessage ? <p>{errorMessage}</p> : null}
    </section>
  );
}
