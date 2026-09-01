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
  SavedBuildDamageInput,
  UpdateBuildInput,
} from "../schemas/build.schema";
import { createBuildSchema } from "../schemas/build.schema";
import { validateBuildCatalogSelections } from "../services/validateBuildSelections.service";
import { calculateDamageFromInput } from "../../damage/services/calculateDamage.service";

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
  await validateBuildCatalogSelections(input);
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
  const existingBuild = await findOwnedBuildById(buildId, ownerId);
  if (!existingBuild) throw createError(404, "Build not found");
  const existing = existingBuild.toObject();
  const mergedBuild = createBuildSchema.parse({
    name: update.name ?? existing.name,
    description: update.description ?? existing.description,
    characterClassId: update.characterClassId !== undefined
      ? update.characterClassId
      : existing.characterClassId ?? null,
    level: update.level ?? existing.level,
    stats: update.stats ?? existing.stats,
    memoryStoneCount: update.memoryStoneCount ?? existing.memoryStoneCount,
    spellIds: update.spellIds ?? existing.spellIds,
    equipment: update.equipment ?? existing.equipment,
    visibility: update.visibility ?? existing.visibility,
  });
  await validateBuildCatalogSelections(mergedBuild);
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

export const calculateOwnedBuildDamage: RequestHandler = async (_request, response) => {
  const ownerId = response.locals.authenticatedUserId as string;
  const buildId = response.locals.buildId as string;
  const selection = response.locals.validatedSavedBuildDamage as SavedBuildDamageInput;
  const build = await findOwnedBuildById(buildId, ownerId);
  if (!build) throw createError(404, "Build not found");
  const equipment = build.equipment;
  if ("spellId" in selection) {
    if (!build.spellIds.includes(selection.spellId) || !equipment.catalyst) {
      throw createError(400, "Spell or catalyst is not selected in this build");
    }
    const result = await calculateDamageFromInput({
      spellId: selection.spellId,
      catalystWeaponId: equipment.catalyst.weaponId,
      catalystVariantId: equipment.catalyst.variantId,
      upgradeLevel: equipment.catalyst.upgradeLevel,
      charged: selection.charged,
      stats: {
        strength: build.stats.strength, dexterity: build.stats.dexterity,
        intelligence: build.stats.intelligence, faith: build.stats.faith,
        arcane: build.stats.arcane,
      },
      talismanIds: equipment.talismanIds,
      buffSpellIds: equipment.buffSpellIds,
      ...(selection.bossId ? { bossId: selection.bossId } : {}),
    });
    response.status(200).json(createAnswer(200, "Build damage calculated", [result]));
    return;
  }
  const { weaponSlotId, skillBuffActive, ...action } = selection;
  const weaponSlot = equipment.weaponSlots[weaponSlotId];
  if (!weaponSlot) throw createError(400, "Selected build weapon slot is empty");
  const armorIds = [
    equipment.armor.headId, equipment.armor.chestId,
    equipment.armor.armsId, equipment.armor.legsId,
  ].filter((id): id is string => id !== null);
  const result = await calculateDamageFromInput({
    weaponId: weaponSlot.weaponId,
    weaponVariantId: weaponSlot.variantId,
    upgradeLevel: weaponSlot.upgradeLevel,
    stats: {
      strength: build.stats.strength, dexterity: build.stats.dexterity,
      intelligence: build.stats.intelligence, faith: build.stats.faith,
      arcane: build.stats.arcane,
    },
    talismanIds: equipment.talismanIds,
    armorIds,
    buffSpellIds: equipment.buffSpellIds,
    weaponBuff: equipment.weaponBuff ?? null,
    skillBuffAshOfWarId: skillBuffActive ? weaponSlot.ashOfWarId ?? null : null,
    ...action,
    ...("skillAttackId" in action && weaponSlot.ashOfWarId
      ? { ashOfWarId: weaponSlot.ashOfWarId }
      : {}),
  });
  response.status(200).json(createAnswer(200, "Build damage calculated", [result]));
};
