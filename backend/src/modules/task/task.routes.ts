import { Router } from "express";
import { validateBody } from "../../middleware/validate.middleware";
import { createTaskController, listTasksController } from "./task.controller";
import { createTaskSchema } from "./task.schemas";

export const taskRouter = Router();

taskRouter.get("/", listTasksController);
taskRouter.post("/", validateBody(createTaskSchema), createTaskController);
