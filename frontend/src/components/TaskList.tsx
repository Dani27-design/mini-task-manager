import { useEffect, useState } from "react";
import { getTasks } from "../services/task.api";
import { Task } from "../types/task";
import { TaskRow } from "./TaskRow";

type TaskListProps = {
  refreshKey: number;
};

export function TaskList({ refreshKey }: TaskListProps) {
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
    <section>
      <h2>Tasks</h2>
      {isLoading ? <p>Loading tasks...</p> : null}
      {errorMessage ? <p>{errorMessage}</p> : null}
      {!isLoading && !errorMessage && tasks.length === 0 ? <p>No tasks yet.</p> : null}
      {!isLoading && !errorMessage && tasks.length > 0 ? (
        <div>
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
