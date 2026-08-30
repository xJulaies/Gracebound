import type { CharacterClassData } from "../../../features/characterClasses/domain/characterClass.types";
import type {
  CharacterInitialStatsRow,
  ClassSelectionRow,
} from "../schemas/characterClass.schema";

const FIRST_RETAIL_CLASS_SELECTION_ID = 2000;
const LAST_RETAIL_CLASS_SELECTION_ID = 2009;

export function mapRegulationCharacterClasses(
  selections: ClassSelectionRow[],
  initialStats: CharacterInitialStatsRow[],
): CharacterClassData[] {
  const initialStatsById = new Map(initialStats.map((row) => [row.ID, row]));
  const classes = selections
    .filter(({ ID, Name }) =>
      ID >= FIRST_RETAIL_CLASS_SELECTION_ID &&
      ID <= LAST_RETAIL_CLASS_SELECTION_ID &&
      Name.trim() !== "")
    .map((selection) => {
      const source = initialStatsById.get(selection.originChrInitParam);
      if (!source) {
        throw new Error(`Missing CharaInitParam ${selection.originChrInitParam} for ${selection.Name}`);
      }
      validatePlayableClass(selection.Name, source);
      return {
        id: slugify(selection.Name),
        name: selection.Name,
        level: source.soulLv,
        stats: {
          vigor: source.baseVit,
          mind: source.baseWil,
          endurance: source.baseEnd,
          strength: source.baseStr,
          dexterity: source.baseDex,
          intelligence: source.baseMag,
          faith: source.baseFai,
          arcane: source.baseLuc,
        },
      };
    });
  if (classes.length !== 10) {
    throw new Error(`Incomplete character class catalog: expected 10, mapped ${classes.length}`);
  }
  return classes;
}

function validatePlayableClass(name: string, source: CharacterInitialStatsRow) {
  const values = [
    source.soulLv, source.baseVit, source.baseWil, source.baseEnd, source.baseStr,
    source.baseDex, source.baseMag, source.baseFai, source.baseLuc,
  ];
  if (values.some((value) => value < 1)) {
    throw new Error(`Invalid starting values for ${name}`);
  }
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
