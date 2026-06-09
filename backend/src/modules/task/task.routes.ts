import { Router } from "express";
import { validateBody } from "../../middleware/validate.middleware";
import {
  createTaskController,
  listTasksController,
  updateTaskController
} from "./task.controller";
import { createTaskSchema, updateTaskSchema } from "./task.schemas";

export const taskRouter = Router();

taskRouter.get("/", listTasksController);
taskRouter.post("/", validateBody(createTaskSchema), createTaskController);
taskRouter.put("/:id", validateBody(updateTaskSchema), updateTaskController);
