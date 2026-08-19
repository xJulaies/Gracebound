import { config } from "dotenv";
import { parseEnvironment } from "./environment";

config({ quiet: true });

export const settings = parseEnvironment(process.env);
