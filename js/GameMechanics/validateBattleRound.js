import { calculateClash } from "./DamageCalculations/calculateClash.js";
import { canAffordSpell } from "./Wizards/mana.js";

export function validateBattleRound(battle_round, effect_registry) {
  if (battle_round.wizardA.health <= 0 || battle_round.wizardB.health <= 0) {
    throw new Error("The duel is already over.");
  }
  calculateClash(...battle_round.actions, battle_round.factorN);
  for (const action of battle_round.actions) {
    if (!canAffordSpell(action.caster, action.spell)) {
      throw new Error(`${action.caster.name} cannot afford ${action.spell.name}.`);
    }
    for (const effect of action.spell.effects ?? []) {
      if (!effect_registry.has(effect.type)) throw new Error(`Unknown effect: ${effect.type}`);
    }
  }
}
