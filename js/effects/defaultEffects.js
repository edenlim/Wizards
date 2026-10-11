import { applyStatus } from "../statuses/StatusRegistry.js";
import { createDefaultStatuses } from "../statuses/index.js";
import { EffectRegistry } from "./EffectRegistry.js";
import { dealDamage } from "../battle/damage.js";

function applyDirectDamage(effect, battle_round, action) {
  // Use only the remaining clash damage, never the original spell power.
  action.healthDamageDealt = dealDamage(
    action.target,
    action.damage,
    battle_round.log,
    action.spell.name,
    effect.bypassBarrier
  );
}

function restoreMana(effect, battle_round, action) {
  const caster = action.caster;
  caster.mana = Math.min(caster.maxMana, caster.mana + effect.amount);
}

function healCaster(effect, battle_round, action) {
  const caster = action.caster;
  caster.health = Math.min(caster.maxHealth, caster.health + effect.amount);
}

function raiseBarrier(effect, battle_round, action) {
  action.caster.barrier += effect.amount;
}

function applyStatusEffect(effect, battle_round, action, status_registry) {
  const target = action.target;
  if (!effect.bypassBarrier && action.healthDamageDealt === 0) {
    battle_round.log.push(`${target.name}'s barrier blocked ${effect.status}!`);
    return;
  }
  applyStatus(target, effect, battle_round, status_registry);
}

export function createDefaultEffects({ statuses = createDefaultStatuses() } = {}) {
  const effect_registry = new EffectRegistry();
  effect_registry.register("HEAL_SELF", healCaster, { phase: "healing" });
  effect_registry.register("RESTORE_MANA", restoreMana, { phase: "healing" });
  effect_registry.register("BARRIER_SELF", raiseBarrier, { phase: "barrier" });
  effect_registry.register("DAMAGE_DIRECT", applyDirectDamage, { phase: "damage" });
  effect_registry.register("APPLY_STATUS", (effect, battle_round, action) => {
    applyStatusEffect(effect, battle_round, action, statuses);
  }, { phase: "afterDamage" });
  return effect_registry;
}
