import type { RequestHandler } from "express";
import { createError } from "../../../shared/errors/createError";
import { createAnswer } from "../../../shared/http/createAnswer";
import { mapBuildResponse } from "../mappers/build.mapper";
import {
  createBuild,
  deleteOwnedBuildById,
  findAllBuildsByOwner,
  findAllPublicBuilds,
  findOwnedBuildById,
  findPublicBuildById,
  updateOwnedBuildById,
} from "../repositories/build.repository";
import type {
  CreateBuildInput,
  UpdateBuildInput,
} from "../schemas/build.schema";

export const listOwnedBuilds: RequestHandler = async (_request, response) => {
  const ownerId = response.locals.authenticatedUserId as string;
  const builds = await findAllBuildsByOwner(ownerId);

  response
    .status(200)
    .json(createAnswer(200, "Builds found", builds.map(mapBuildResponse)));
};

export const createOwnedBuild: RequestHandler = async (_request, response) => {
  const ownerId = response.locals.authenticatedUserId as string;
  const input = response.locals.validatedBuild as CreateBuildInput;
  const build = await createBuild({ ...input, ownerId });

  response
    .status(201)
    .json(createAnswer(201, "Build created", [mapBuildResponse(build)]));
};

export const getOwnedBuild: RequestHandler = async (_request, response) => {
  const ownerId = response.locals.authenticatedUserId as string;
  const buildId = response.locals.buildId as string;
  const build = await findOwnedBuildById(buildId, ownerId);

  if (!build) {
    throw createError(404, "Build not found");
  }

  response
    .status(200)
    .json(createAnswer(200, "Build found", [mapBuildResponse(build)]));
};

export const updateOwnedBuild: RequestHandler = async (_request, response) => {
  const ownerId = response.locals.authenticatedUserId as string;
  const buildId = response.locals.buildId as string;
  const update = response.locals.validatedBuildUpdate as UpdateBuildInput;
  const build = await updateOwnedBuildById(buildId, ownerId, update);

  if (!build) {
    throw createError(404, "Build not found");
  }

  response
    .status(200)
    .json(createAnswer(200, "Build updated", [mapBuildResponse(build)]));
};

export const deleteOwnedBuild: RequestHandler = async (_request, response) => {
  const ownerId = response.locals.authenticatedUserId as string;
  const buildId = response.locals.buildId as string;
  const build = await deleteOwnedBuildById(buildId, ownerId);

  if (!build) {
    throw createError(404, "Build not found");
  }

  response.status(200).json(createAnswer(200, "Build deleted", []));
};

export const listPublicBuilds: RequestHandler = async (_request, response) => {
  const builds = await findAllPublicBuilds();

  response
    .status(200)
    .json(createAnswer(200, "Builds found", builds.map(mapBuildResponse)));
};

export const getPublicBuild: RequestHandler = async (_request, response) => {
  const buildId = response.locals.buildId as string;
  const build = await findPublicBuildById(buildId);

  if (!build) {
    throw createError(404, "Build not found");
  }

  response
    .status(200)
    .json(createAnswer(200, "Build found", [mapBuildResponse(build)]));
};
