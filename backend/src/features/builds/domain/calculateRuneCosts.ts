const MAX_CHARACTER_LEVEL = 713;

export interface RuneCosts {
  nextLevelRuneCost: number | null;
  totalRuneCost: number;
}

export function calculateRuneCosts(
  startingLevel: number,
  characterLevel: number,
): RuneCosts {
  validateLevel(startingLevel, "Starting level");
  validateLevel(characterLevel, "Character level");
  if (characterLevel < startingLevel) {
    throw new Error("Character level cannot be below the starting level");
  }

  let totalRuneCost = 0;
  for (let level = startingLevel; level < characterLevel; level += 1) {
    totalRuneCost += calculateNextLevelRuneCost(level);
  }

  return {
    nextLevelRuneCost: characterLevel === MAX_CHARACTER_LEVEL
      ? null
      : calculateNextLevelRuneCost(characterLevel),
    totalRuneCost,
  };
}

export function calculateNextLevelRuneCost(currentLevel: number) {
  validateLevel(currentLevel, "Current level");
  if (currentLevel === MAX_CHARACTER_LEVEL) {
    throw new Error("Maximum character level has no next level");
  }

  const growth = Math.max(0, (currentLevel - 11) * 0.02);
  return Math.floor((growth + 0.1) * (currentLevel + 81) ** 2 + 1);
}

function validateLevel(level: number, label: string) {
  if (!Number.isInteger(level) || level < 1 || level > MAX_CHARACTER_LEVEL) {
    throw new Error(`${label} must be an integer between 1 and ${MAX_CHARACTER_LEVEL}`);
  }
}
