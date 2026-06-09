import { Task } from "../types/task";

type TaskRowProps = {
  task: Task;
};

export function TaskRow({ task }: TaskRowProps) {
  return (
    <div>
      <h3>{task.title}</h3>
      <p>Status: {task.status}</p>
      <p>Last updated: {new Date(task.updatedAt).toLocaleString()}</p>
    </div>
  );
}
