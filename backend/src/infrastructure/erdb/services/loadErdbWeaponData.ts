import {
  erdbWeaponImportSchema,
  type ErdbWeaponImport,
} from "../schemas/erdb.schema";

const WEAPON_TABLES = [
  "armaments",
  "reinforcements",
  "correction-attack",
  "correction-graph",
] as const;

interface ErdbHttpResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

export type ErdbFetch = (url: string) => Promise<ErdbHttpResponse>;

export async function loadErdbWeaponData(
  baseUrl: string,
  gameVersion: string,
  fetchErdb: ErdbFetch = (url) => fetch(url),
): Promise<ErdbWeaponImport> {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");
  const responses = await Promise.all(
    WEAPON_TABLES.map(async (table) => {
      const response = await fetchErdb(
        `${normalizedBaseUrl}/${gameVersion}/${table}/`,
      );

      if (!response.ok) {
        throw new Error(`ERDB ${table} request failed with ${response.status}`);
      }

      return response.json();
    }),
  );

  const [armaments, reinforcements, correctionAttacks, correctionGraphs] =
    responses;

  return erdbWeaponImportSchema.parse({
    gameVersion,
    armaments,
    reinforcements,
    correctionAttacks,
    correctionGraphs,
  });
}
