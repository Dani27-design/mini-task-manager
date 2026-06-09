import express from "express";
import { initDatabase } from "./database/init";
import { errorMiddleware } from "./middleware/error.middleware";
import { actorRouter } from "./modules/actor/actor.routes";
import { taskRouter } from "./modules/task/task.routes";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "127.0.0.1";

app.use(express.json());
app.use("/actors", actorRouter);
app.use("/tasks", taskRouter);
app.use(errorMiddleware);

initDatabase()
  .then(() => {
    const server = app.listen(port, host, () => {
      console.log(`Backend server running at http://${host}:${port}`);
    });

    server.on("error", (error) => {
      throw error;
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database", error);
    process.exit(1);
  });

export { app };
