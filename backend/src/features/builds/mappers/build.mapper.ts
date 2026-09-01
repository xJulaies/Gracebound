import type { HydratedDocument } from "mongoose";
import type { Build } from "../models/build.model";

export function mapBuildResponse(build: HydratedDocument<Build>) {
  const plainBuild = build.toObject();

  return {
    id: build.id,
    name: plainBuild.name,
    description: plainBuild.description,
    characterClassId: plainBuild.characterClassId,
    level: plainBuild.level,
    stats: plainBuild.stats,
    memoryStoneCount: plainBuild.memoryStoneCount,
    spellIds: plainBuild.spellIds,
    equipment: plainBuild.equipment,
    visibility: plainBuild.visibility,
    createdAt: plainBuild.createdAt,
    updatedAt: plainBuild.updatedAt,
  };
}
