import type {
  CreateBuildData,
  UpdateBuildInput,
} from "../schemas/build.schema";
import { BuildModel } from "../models/build.model";

export function createBuild(data: CreateBuildData) {
  return BuildModel.create(data);
}

export function findAllBuildsByOwner(ownerId: string) {
  return BuildModel.find({ ownerId }).sort({ updatedAt: -1 }).exec();
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

export function findAllPublicBuilds() {
  return BuildModel.find({ visibility: "public" })
    .sort({ createdAt: -1 })
    .exec();
}

export function findPublicBuildById(buildId: string) {
  return BuildModel.findOne({ _id: buildId, visibility: "public" }).exec();
}
