import axios from "axios";
import { Task } from "../types/task";

type CreateTaskRequest = {
  title: string;
  actorId: string;
};

export async function createTask(request: CreateTaskRequest): Promise<Task> {
  const response = await axios.post<Task>("/tasks", request);
  return response.data;
}
