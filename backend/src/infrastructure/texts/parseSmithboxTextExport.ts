import { z } from "zod";

const entrySchema = z.object({
  ID: z.coerce.number().int(),
  Text: z.string().nullable(),
});

const wrapperSchema = z.object({
  Name: z.string(),
  Fmg: z.object({ Entries: z.array(entrySchema) }),
});

const exportSchema = z.object({ FmgWrappers: z.array(wrapperSchema) });

export interface ItemTextEntry {
  title: string | null;
  summary: string | null;
  description: string | null;
}

export interface ItemTextCatalogs {
  weapons: Map<number, ItemTextEntry>;
  armor: Map<number, ItemTextEntry>;
  talismans: Map<number, ItemTextEntry>;
  goods: Map<number, ItemTextEntry>;
  ashesOfWar: Map<number, ItemTextEntry>;
}

export function parseSmithboxTextExport(json: string): ItemTextCatalogs {
  const parsed = exportSchema.parse(JSON.parse(json));
  const wrappers = new Map(
    parsed.FmgWrappers.map((wrapper) => [wrapper.Name, wrapper.Fmg.Entries]),
  );

  return {
    weapons: combine(wrappers, "Weapon"),
    armor: combine(wrappers, "Protector"),
    talismans: combine(wrappers, "Accessory"),
    goods: combine(wrappers, "Goods"),
    ashesOfWar: combine(wrappers, "Gem"),
  };
}

function combine(
  wrappers: Map<string, Array<{ ID: number; Text: string | null }>>,
  prefix: string,
): Map<number, ItemTextEntry> {
  const titles = layeredEntries(wrappers, `${prefix}Name`);
  const summaries = layeredEntries(wrappers, `${prefix}Info`);
  const descriptions = layeredEntries(wrappers, `${prefix}Caption`);
  const ids = new Set([...titles.keys(), ...summaries.keys(), ...descriptions.keys()]);

  return new Map(
    [...ids].map((id) => [
      id,
      {
        title: titles.get(id) ?? null,
        summary: summaries.get(id) ?? null,
        description: descriptions.get(id) ?? null,
      },
    ]),
  );
}

function layeredEntries(
  wrappers: Map<string, Array<{ ID: number; Text: string | null }>>,
  name: string,
): Map<number, string> {
  const result = new Map<number, string>();
  for (const suffix of ["", "_dlc01", "_dlc02"]) {
    for (const [id, text] of entriesById(wrappers.get(`${name}${suffix}.fmg`) ?? [])) {
      result.set(id, text);
    }
  }
  return result;
}

function entriesById(
  entries: Array<{ ID: number; Text: string | null }>,
): Map<number, string> {
  return new Map(
    entries.flatMap(({ ID, Text }) => {
      const text = normalizeText(Text);
      return text ? [[ID, text] as const] : [];
    }),
  );
}

function normalizeText(value: string | null): string | null {
  if (!value || value === "[ERROR]") return null;
  const normalized = value.replace(/\r\n/g, "\n").trim();
  return normalized.length > 0 ? normalized : null;
}
