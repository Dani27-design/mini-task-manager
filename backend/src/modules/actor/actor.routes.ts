import { Router } from "express";
import { actors } from "../../constants/actors";

export const actorRouter = Router();

actorRouter.get("/", (_request, response) => {
  response.json(actors);
});
