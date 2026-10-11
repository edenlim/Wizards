export function executeSpellEffects(action, battle_round, registry, damage) {
  for (const effect of action.spell.effects ?? []) {
    // Offensive effects require a won clash; self effects always resolve.
    if ((effect.target ?? "opponent") === "opponent" && damage <= 0) continue;
    registry.execute(effect, { ...battle_round, ...action, damage });
  }
}
