import type { RequestHandler } from "express";
import { createAnswer } from "../../../shared/http/createAnswer";
import type { CalculateBuildStatsInput } from "../schemas/buildStats.schema";
import { calculateBuildStatsFromInput } from "../services/calculateBuildStats.service";

export const calculateSelectedBuildStats: RequestHandler = async (_request, response) => {
  const input = response.locals.validatedBuildStats as CalculateBuildStatsInput;
  const result = await calculateBuildStatsFromInput(input);
  response.status(200).json(createAnswer(200, "Build stats calculated", [result]));
};
