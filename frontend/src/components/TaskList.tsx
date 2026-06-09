import { TaskRow } from "./TaskRow";

type TaskListProps = {
  refreshKey: number;
};

export function TaskList({ refreshKey }: TaskListProps) {
  void refreshKey;

  return (
    <section>
      <h2>Tasks</h2>
      <TaskRow />
    </section>
  );
}
