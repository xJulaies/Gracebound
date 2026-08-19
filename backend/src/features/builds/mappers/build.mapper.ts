import type { HydratedDocument } from "mongoose";
import type { Build } from "../models/build.model";

export function mapBuildResponse(build: HydratedDocument<Build>) {
  const plainBuild = build.toObject();

  return {
    id: build.id,
    name: plainBuild.name,
    description: plainBuild.description,
    level: plainBuild.level,
    stats: plainBuild.stats,
    equipment: plainBuild.equipment,
    visibility: plainBuild.visibility,
    createdAt: plainBuild.createdAt,
    updatedAt: plainBuild.updatedAt,
  };
}
