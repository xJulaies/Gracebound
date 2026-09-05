import type { SpellSchool } from "../../../features/spells/domain/spell.types";

const schoolsByMagicId = new Map<number, SpellSchool[]>();

assign("glintstone", [
  4000, 4001, 4010, 4020, 4021, 4030, 4040, 4050, 4060, 4070, 4080,
  4090, 4100, 4110, 4120, 4130, 4140, 4460, 4470, 4630,
]);
assign("primeval-current", [4200, 4210, 4220]);
assign("carian", [
  4300, 4301, 4302, 4370, 4380, 4381, 4390, 4430, 4431, 4440, 4450,
  4480, 4640,
]);
assign("full-moon", [4360, 4361]);
assign("cold", [4361, 4400, 4410, 4420, 4431, 4490]);
assign("crystal", [4500, 4510, 4520]);
assign("night", [4600, 4610, 4620, 4650, 4660, 4670, 6500]);
assign("gravity", [4700, 4701, 4710, 4720, 4721]);
assign("magma", [4800, 4810, 4820, 4830]);
assign("thorn", [4900, 4910]);
assign("death", [5000, 5001, 5010, 5020, 5030]);
assign("claymen", [5100, 5110]);

assign("fire-monks", [6000, 6001, 6010, 6020, 6030, 6040, 6050, 6060, 6220, 7900]);
assign("giants-flame", [6100, 6110, 6120]);
assign("godskin-apostle", [6210, 6230, 6240, 6250, 6260, 6270]);
assign("blood-oath", [6300, 6310, 6320, 7210]);
assign("two-fingers", [
  6400, 6420, 6421, 6422, 6423, 6440, 6441, 6450, 6460, 6470, 6480,
  6510, 6520, 6530,
]);
assign("erdtree", [6330, 6340, 6410, 6424, 6430, 6431, 6490, 6600, 6720, 7530, 7903]);
assign("golden-order", [6700, 6701, 6710, 6730, 6740, 6750, 6760, 6770, 6780]);
assign("bestial", [6800, 6810, 6820, 6830, 6840, 6850]);
assign("dragon-cult", [5040, 6900, 6910, 6920, 6921, 6930, 6940, 6941, 6950, 6960, 6970, 6971]);
assign("dragon-communion", [7000, 7001, 7010, 7011, 7020, 7021, 7030, 7031, 7040, 7041, 7050, 7060, 7080, 7090]);
assign("servants-of-rot", [7200, 7220, 7230, 7240]);
assign("frenzied-flame", [7300, 7310, 7311, 7320, 7330]);
assign("crucible", [7500, 7510, 7520]);

export function findSpellSchools(sourceMagicId: number): SpellSchool[] {
  return schoolsByMagicId.get(sourceMagicId) ?? [];
}

export function getClassifiedSpellCount(): number {
  return schoolsByMagicId.size;
}

function assign(school: SpellSchool, magicIds: number[]): void {
  for (const magicId of magicIds) {
    const schools = schoolsByMagicId.get(magicId) ?? [];
    if (schools.includes(school)) {
      throw new Error(`Duplicate ${school} classification for Magic ${magicId}`);
    }
    schoolsByMagicId.set(magicId, [...schools, school]);
  }
}
