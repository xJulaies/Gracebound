import { useQuery } from "@tanstack/react-query";
import { getCharacterClasses } from "../api/characterClasses.api";

export const characterClassesQueryKey = ["character-classes"] as const;

export function useCharacterClassesQuery() {
  return useQuery({
    queryKey: characterClassesQueryKey,
    queryFn: getCharacterClasses,
  });
}
