import type { RequestHandler } from "express";
import { createAnswer } from "../../../shared/http/createAnswer";
import { calculateHitDamage } from "../domain/calculateDamage";
import type { CalculateDamageInput } from "../schemas/damage.schema";

export const calculateDamage: RequestHandler = (_request, response) => {
  const input = response.locals
    .validatedDamageCalculation as CalculateDamageInput;
  const result = calculateHitDamage(input);

  response
    .status(200)
    .json(createAnswer(200, "Damage calculated", [result]));
};

