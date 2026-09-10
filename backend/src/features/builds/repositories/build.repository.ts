import type {
  CreateBuildData,
  OwnedBuildListQuery,
  PublicBuildListQuery,
  UpdateBuildInput,
} from "../schemas/build.schema";
import { BuildModel } from "../models/build.model";

export function createBuild(data: CreateBuildData) {
  return BuildModel.create(data);
}

export async function findBuildPageByOwner(
  ownerId: string,
  { page, limit, visibility }: OwnedBuildListQuery,
) {
  const filter = { ownerId, ...(visibility && { visibility }) };
  const [builds, total] = await Promise.all([
    BuildModel.find(filter)
      .sort({ updatedAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec(),
    BuildModel.countDocuments(filter).exec(),
  ]);
  return { builds, total };
}

export function countBuildsByOwner(ownerId: string) {
  return BuildModel.countDocuments({ ownerId }).exec();
}

export function findOwnedBuildById(buildId: string, ownerId: string) {
  return BuildModel.findOne({ _id: buildId, ownerId }).exec();
}

export function updateOwnedBuildById(
  buildId: string,
  ownerId: string,
  update: UpdateBuildInput,
) {
  return BuildModel.findOneAndUpdate({ _id: buildId, ownerId }, update, {
    returnDocument: "after",
    runValidators: true,
  }).exec();
}

export function deleteOwnedBuildById(buildId: string, ownerId: string) {
  return BuildModel.findOneAndDelete({ _id: buildId, ownerId }).exec();
}

export async function findPublicBuildPage({ page, limit }: PublicBuildListQuery) {
  const filter = { visibility: "public" } as const;
  const [builds, total] = await Promise.all([
    BuildModel.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec(),
    BuildModel.countDocuments(filter).exec(),
  ]);
  return { builds, total };
}

export function findPublicBuildById(buildId: string) {
  return BuildModel.findOne({ _id: buildId, visibility: "public" }).exec();
}
