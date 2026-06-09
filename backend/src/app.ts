import express from "express";
import { AppError, errorMiddleware } from "./middleware/error.middleware";
import { actorRouter } from "./modules/actor/actor.routes";
import { taskRouter } from "./modules/task/task.routes";

const app = express();

app.use(express.json());
app.use("/actors", actorRouter);
app.use("/tasks", taskRouter);
app.use((_request, _response, next) => {
  next(new AppError("NOT_FOUND", "Route not found", 404));
});
app.use(errorMiddleware);

export { app };
