import { NextFunction, Request, Response } from "express";
import { createTaskService, listTasksService, updateTaskService } from "./task.service";

export async function listTasksController(
  _request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  try {
    const tasks = await listTasksService();
    response.json(tasks);
  } catch (error) {
    next(error);
  }
}

export async function createTaskController(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  try {
    const task = await createTaskService(request.body);
    response.status(201).json(task);
  } catch (error) {
    next(error);
  }
}

export async function updateTaskController(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  try {
    const taskId = String(request.params.id);
    const task = await updateTaskService(taskId, request.body);
    response.json(task);
  } catch (error) {
    next(error);
  }
}
