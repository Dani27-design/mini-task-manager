import express from "express";
import { errorMiddleware } from "./middleware/error.middleware";
import { actorRouter } from "./modules/actor/actor.routes";
import { taskRouter } from "./modules/task/task.routes";

const app = express();

app.use(express.json());
app.use("/actors", actorRouter);
app.use("/tasks", taskRouter);
app.use(errorMiddleware);

export { app };
