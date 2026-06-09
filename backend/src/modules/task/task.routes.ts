import { Router } from "express";
import { validateBody } from "../../middleware/validate.middleware";
import { createTaskController } from "./task.controller";
import { createTaskSchema } from "./task.schemas";

export const taskRouter = Router();

taskRouter.post("/", validateBody(createTaskSchema), createTaskController);
