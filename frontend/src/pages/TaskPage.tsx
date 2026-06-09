import { useState } from "react";
import { ActorSelect } from "../components/ActorSelect";
import { TaskForm } from "../components/TaskForm";
import { TaskList } from "../components/TaskList";

export function TaskPage() {
  const [selectedActorId, setSelectedActorId] = useState("");
  const [taskRefreshKey, setTaskRefreshKey] = useState(0);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <h1>Mini Task Manager</h1>
          <p>Track tasks and every change made to them.</p>
        </div>
        <ActorSelect value={selectedActorId} onChange={setSelectedActorId} />
      </header>

      <div className="workspace">
        <TaskForm
          actorId={selectedActorId}
          onTaskCreated={() => setTaskRefreshKey((currentValue) => currentValue + 1)}
        />
        <TaskList
          actorId={selectedActorId}
          refreshKey={taskRefreshKey}
          onTaskUpdated={() => setTaskRefreshKey((currentValue) => currentValue + 1)}
        />
      </div>
    </main>
  );
}
