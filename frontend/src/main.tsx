import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { TaskPage } from "./pages/TaskPage";
import "./styles.css";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <TaskPage />
  </StrictMode>
);
