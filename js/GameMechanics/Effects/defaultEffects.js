import { EffectRegistry } from "./EffectRegistry.js";
import { dealDamage } from "../DamageCalculations/dealDamage.js";

export function createDefaultEffects() {
  return new EffectRegistry()
    .register("DAMAGE_DIRECT", (effect, battle_round) => {
      // A clash tie is exactly zero damage. Never fall back to base power.
      dealDamage(battle_round.target, battle_round.damage, battle_round.log, battle_round.spell.name, effect.bypassBarrier);
    })
    .register("RESTORE_MANA", (effect, battle_round) => {
      battle_round.caster.mana = Math.min(
        battle_round.caster.maxMana, battle_round.caster.mana + effect.amount
      );
    })
    .register("HEAL_SELF", (effect, battle_round) => {
      battle_round.caster.health = Math.min(battle_round.caster.maxHealth, battle_round.caster.health + effect.amount);
    })
    .register("BARRIER_SELF", (effect, battle_round) => { battle_round.caster.barrier += effect.amount; })
    .register("APPLY_STATUS", (effect, battle_round) => {
      battle_round.target.activeStatuses.push({ ...effect });
      battle_round.log.push(`${battle_round.target.name} gains ${effect.status} for ${effect.duration} rounds.`);
    });
}

