import type { RequestHandler } from "express";
import { createAnswer } from "../../../shared/http/createAnswer";
import type { CalculateDamageInput } from "../schemas/damage.schema";
import { calculateDamageFromInput } from "../services/calculateDamage.service";

export const calculateDamage: RequestHandler = (_request, response) => {
  const input = response.locals
    .validatedDamageCalculation as CalculateDamageInput;
  const result = calculateDamageFromInput(input);

  response
    .status(200)
    .json(createAnswer(200, "Damage calculated", [result]));
};
