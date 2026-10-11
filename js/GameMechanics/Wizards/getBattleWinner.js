export function getBattleWinner(wizardA, wizardB) {
  if (wizardA.health <= 0 && wizardB.health <= 0) return "Draw";
  if (wizardA.health <= 0) return wizardB.name;
  if (wizardB.health <= 0) return wizardA.name;
  return null;
}
