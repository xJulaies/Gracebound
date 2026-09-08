const MAX_CHARACTER_LEVEL = 713;

export function calculateRuneCosts(startingLevel: number, characterLevel: number) {
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

function calculateNextLevelRuneCost(currentLevel: number) {
  const growth = Math.max(0, (currentLevel - 11) * 0.02);
  return Math.floor((growth + 0.1) * (currentLevel + 81) ** 2 + 1);
}
