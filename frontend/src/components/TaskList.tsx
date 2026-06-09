import { useEffect, useState } from "react";
import { getTasks } from "../services/task.api";
import { Task } from "../types/task";
import { TaskRow } from "./TaskRow";

type TaskListProps = {
  actorId: string;
  refreshKey: number;
  onTaskUpdated: () => void;
};

export function TaskList({ actorId, refreshKey, onTaskUpdated }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setIsLoading(true);
    setErrorMessage("");

    getTasks()
      .then((taskList) => {
        setTasks(taskList);
      })
      .catch(() => {
        setErrorMessage("Failed to load tasks.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [refreshKey]);

  return (
    <section className="panel task-panel">
      <div className="panel-heading">
        <h2>Tasks</h2>
        {!isLoading && !errorMessage ? <span>{tasks.length} active</span> : null}
      </div>
      {isLoading ? <p className="muted">Loading tasks...</p> : null}
      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
      {!isLoading && !errorMessage && tasks.length === 0 ? (
        <div className="empty-state">No tasks yet.</div>
      ) : null}
      {!isLoading && !errorMessage && tasks.length > 0 ? (
        <div className="task-list">
          {tasks.map((task) => (
            <TaskRow key={task.id} actorId={actorId} task={task} onTaskUpdated={onTaskUpdated} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
