import axios from "axios";
import { Actor } from "../types/actor";

export async function getActors(): Promise<Actor[]> {
  const response = await axios.get<Actor[]>("/actors");
  return response.data;
}
