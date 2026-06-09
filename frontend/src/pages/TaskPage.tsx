import { ActorSelect } from "../components/ActorSelect";
import { TaskForm } from "../components/TaskForm";
import { TaskList } from "../components/TaskList";

export function TaskPage() {
  return (
    <main>
      <h1>Mini Task Manager</h1>
      <ActorSelect />
      <TaskForm />
      <TaskList />
    </main>
  );
}
