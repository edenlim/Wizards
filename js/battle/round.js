import { calculateClash } from "./damage.js";
import { canAffordSpell } from "./wizard.js";

export class BattleRound {
  constructor({ wizardA, wizardB, spellA, spellB, factorN = 2 }) {
    if (!Number.isFinite(factorN) || factorN < 1) throw new Error("Element factor must be at least 1.");
    Object.assign(this, { wizardA, wizardB, spellA, spellB, factorN });
    // Fixed order: actions[0] belongs to wizardA (left), actions[1] to wizardB (right).
    this.actions = [spellA, spellB].map((spell, index) => ({
      caster: index === 0 ? wizardA : wizardB,
      target: index === 0 ? wizardB : wizardA,
      spell, power: spell.basePower, element: spell.element,
      canCast: true, didCast: false, blockedBy: [],
      damage: 0, healthDamageDealt: 0,
    }));
    this.finalDamage = 0;
    this.log = [];
  }
}

// Preparation runs restriction hooks before checking the selected spell cost.
export function prepareBattleRound(battle_round, effect_registry, status_registry) {
  if (battle_round.wizardA.health <= 0 || battle_round.wizardB.health <= 0) {
    throw new Error("The duel is already over.");
  }
  calculateClash(...battle_round.actions, battle_round.factorN);
  for (const action of battle_round.actions) {
    if (status_registry) {
      for (const active_status of action.caster.activeStatuses) {
        status_registry.get(active_status.status);
      }
      status_registry.runActionHook("onValidateAction", action, battle_round);
    }
    if (action.canCast && !canAffordSpell(action.caster, action.spell)) {
      throw new Error(`${action.caster.name} cannot afford ${action.spell.name}.`);
    }
    for (const effect of action.spell.effects ?? []) {
      if (!effect_registry.has(effect.type)) throw new Error(`Unknown effect: ${effect.type}`);
      if (effect.type === "APPLY_STATUS" && status_registry) {
        status_registry.get(effect.status);
      }
    }
  }
}
