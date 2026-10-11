import { EffectRegistry } from "./EffectRegistry.js";
import { dealDamage } from "../DamageCalculations/dealDamage.js";

function applyDirectDamage(effect, battle_round) {
  // Use only the remaining clash damage, never the original spell power.
  battle_round.healthDamageDealt = dealDamage(
    battle_round.target,
    battle_round.damage,
    battle_round.log,
    battle_round.spell.name,
    effect.bypassBarrier
  );
}

function restoreMana(effect, battle_round) {
  const caster = battle_round.caster;
  caster.mana = Math.min(caster.maxMana, caster.mana + effect.amount);
}

function healCaster(effect, battle_round) {
  const caster = battle_round.caster;
  caster.health = Math.min(caster.maxHealth, caster.health + effect.amount);
}

function raiseBarrier(effect, battle_round) {
  battle_round.caster.barrier += effect.amount;
}

function applyStatus(effect, battle_round) {
  const target = battle_round.target;
  if (battle_round.healthDamageDealt === 0) {
    battle_round.log.push(`${target.name}'s barrier blocked ${effect.status}!`);
    return;
  }

  target.activeStatuses.push({ ...effect });
  battle_round.log.push(`${target.name} gains ${effect.status} for ${effect.duration} rounds.`);
}

export function createDefaultEffects() {
  const effect_registry = new EffectRegistry();
  effect_registry.register("HEAL_SELF", healCaster, { phase: "healing" });
  effect_registry.register("RESTORE_MANA", restoreMana, { phase: "healing" });
  effect_registry.register("BARRIER_SELF", raiseBarrier, { phase: "barrier" });
  effect_registry.register("DAMAGE_DIRECT", applyDirectDamage, { phase: "damage" });
  effect_registry.register("APPLY_STATUS", applyStatus, { phase: "afterDamage" });
  return effect_registry;
}
