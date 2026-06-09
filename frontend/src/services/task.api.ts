import axios from "axios";
import { Task } from "../types/task";

type CreateTaskRequest = {
  title: string;
  actorId: string;
};

type UpdateTaskRequest = {
  title?: string;
  status?: string;
  actorId: string;
};

type DeleteTaskRequest = {
  actorId: string;
};

export async function createTask(request: CreateTaskRequest): Promise<Task> {
  const response = await axios.post<Task>("/tasks", request);
  return response.data;
}

export async function getTasks(): Promise<Task[]> {
  const response = await axios.get<Task[]>("/tasks");
  return response.data;
}

export async function updateTask(id: string, request: UpdateTaskRequest): Promise<Task> {
  const response = await axios.put<Task>(`/tasks/${id}`, request);
  return response.data;
}

export async function deleteTask(id: string, request: DeleteTaskRequest): Promise<Task> {
  const response = await axios.delete<Task>(`/tasks/${id}`, {
    data: request
  });
  return response.data;
}
