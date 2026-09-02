import { apiRequest } from "../../../shared/api/apiClient";
import { resolveApiAssetUrl } from "../../../shared/api/resolveApiAssetUrl";
import type { CharacterClass } from "../types/characterClass.types";

type CharacterClassApiResponse = Omit<CharacterClass, "imageUrl"> & {
  imageUrl: string;
};

export async function getCharacterClasses() {
  const response = await apiRequest<CharacterClassApiResponse>(
    "/character-classes",
  );

  return {
    ...response,
    data: response.data.map((characterClass) => ({
      ...characterClass,
      imageUrl: resolveApiAssetUrl(characterClass.imageUrl),
    })),
  };
}
