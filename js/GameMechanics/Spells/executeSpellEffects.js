export function executeSpellEffects(action, battle_round, registry, damage, phase) {
  // Retain per-action results across phases, including health damage for debuffs.
  if (!action.effectContext) {
    action.effectContext = {
      ...battle_round,
      ...action,
      damage,
      healthDamageDealt: 0,
    };
  }
  const effect_battle_round = action.effectContext;
  effect_battle_round.damage = damage;
  effect_battle_round.finalDamage = battle_round.finalDamage;
  effect_battle_round.phase = phase;
  for (const effect of action.spell.effects ?? []) {
    const belongs_to_phase = !phase || registry.getPhase(effect.type) === phase;
    if (!belongs_to_phase) continue;
    // Self effects still resolve when the spell loses; opponent effects need a win.
    const targets_opponent = (effect.target ?? "opponent") === "opponent";
    const clash_won = damage > 0;
    if (targets_opponent && !clash_won) continue;
    registry.execute(effect, effect_battle_round);
  }
}

export function executeEffectPhase(battle_round, registry, phase) {
  const [actionA, actionB] = battle_round.actions;
  const damage_to_wizardB = Math.max(0, battle_round.finalDamage);
  const damage_to_wizardA = Math.max(0, -battle_round.finalDamage);
  executeSpellEffects(actionA, battle_round, registry, damage_to_wizardB, phase);
  executeSpellEffects(actionB, battle_round, registry, damage_to_wizardA, phase);
}
