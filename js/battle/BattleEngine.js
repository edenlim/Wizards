import { createDefaultStatuses } from "../statuses/index.js";
import { BattleRound, prepareBattleRound } from "./round.js";
import { calculateClash } from "./damage.js";
import { createDefaultEffects } from "../effects/defaultEffects.js";
import { executeEffectPhase } from "../effects/EffectRegistry.js";
import { regenerateMana, consumeSpellMana, getBattleWinner } from "./wizard.js";
import { tickStatuses } from "../statuses/StatusRegistry.js";
import { logDamageCalculation } from "./debug.js";

export { createWizard } from "./wizard.js";

export class BattleEngine {
  constructor({ effects, statuses = createDefaultStatuses(), factorN = 2 } = {}) {
    this.statuses = statuses;
    this.effects = effects ?? createDefaultEffects({ statuses });
    this.factorN = factorN;
    this.hooks = Object.fromEntries(
      ["roundStart", "beforeClash", "afterClash", "roundEnd"]
        .map(stage => [stage, []])
    );
  }

  use(stage, modifier) {
    if (!Object.hasOwn(this.hooks, stage)) throw new Error(`Unknown stage: ${stage}`);
    if (typeof modifier !== "function") throw new Error("A modifier must be a function.");
    this.hooks[stage].push(modifier);
    return this;
  }

  runModifiers(stage, battle_round) {
    for (const modifier of this.hooks[stage]) modifier(battle_round);
  }

  // wizardA/spellA always belong to the left; wizardB/spellB to the right.
  resolve(wizardA, wizardB, spellA, spellB) {
    const battle_round = new BattleRound({ wizardA, wizardB, spellA, spellB, factorN: this.factorN });
    prepareBattleRound(battle_round, this.effects, this.statuses);
    this.startRound(battle_round);

    const both_wizards_alive = wizardA.health > 0 && wizardB.health > 0;
    if (both_wizards_alive) {
      this.resolveClash(battle_round);
    }

    this.finishRound(battle_round);
    return battle_round;
  }

  startRound(battle_round) {
    for (const wizard of [battle_round.wizardA, battle_round.wizardB]) {
      regenerateMana(wizard);
      tickStatuses(wizard, battle_round, this.statuses);
    }
    this.runModifiers("roundStart", battle_round);
    battle_round.spellsCast = false;
  }

  resolveClash(battle_round) {
    for (const action of battle_round.actions) {
      if (action.canCast) {
        consumeSpellMana(action);
        action.didCast = true;
      } else {
        const reason = action.blockedBy.join(", ") || "a casting restriction";
        battle_round.log.push(`${action.caster.name} cannot cast because of ${reason}.`);
      }
    }

    // Complete each phase for both sides before moving to the next phase.
    executeEffectPhase(battle_round, this.effects, "healing");
    executeEffectPhase(battle_round, this.effects, "barrier");
    this.calculateRoundDamage(battle_round);
    executeEffectPhase(battle_round, this.effects, "damage");
    executeEffectPhase(battle_round, this.effects, "afterDamage");
  }

  calculateRoundDamage(battle_round) {
    for (const action of battle_round.actions) {
      this.statuses.runActionHook("onBeforeClash", action, battle_round);
    }
    this.runModifiers("beforeClash", battle_round);

    // A skipped action has no elemental spell to clash with. Neutralize it
    // after modifiers so equipment cannot accidentally give it attack power.
    for (const action of battle_round.actions) {
      if (!action.canCast) {
        action.power = 0;
        action.element = "Kinetic";
      }
    }

    const [actionA, actionB] = battle_round.actions;
    battle_round.finalDamage = calculateClash(actionA, actionB, battle_round.factorN);
    this.runModifiers("afterClash", battle_round);

    if (!Number.isFinite(battle_round.finalDamage)) {
      throw new Error("Invalid final damage.");
    }

    const remaining_damage = Math.abs(battle_round.finalDamage);
    battle_round.log.push(
      `${actionA.didCast ? actionA.spell.name : "No cast"} vs ${actionB.didCast ? actionB.spell.name : "No cast"}: ${remaining_damage} remaining damage.`
    );
    battle_round.spellsCast = battle_round.actions.some(action => action.didCast);
    if (actionA.didCast && actionB.didCast) {
      logDamageCalculation(actionA, actionB, battle_round.factorN, battle_round.finalDamage);
    }
  }

  finishRound(battle_round) {
    for (const action of battle_round.actions) {
      this.statuses.runActionHook("onRoundEnd", action, battle_round);
    }
    this.runModifiers("roundEnd", battle_round);
    battle_round.winner = getBattleWinner(battle_round.wizardA, battle_round.wizardB);
  }
}
