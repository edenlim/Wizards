import { BattleRound } from "./DamageCalculations/BattleRound.js";
import { DamagePipeline } from "./DamageCalculations/DamagePipeline.js";
import { calculateClash } from "./DamageCalculations/calculateClash.js";
import { createDefaultEffects } from "./Effects/defaultEffects.js";
import { executeEffectPhase } from "./Spells/executeSpellEffects.js";
import { regenerateMana, consumeSpellMana } from "./Wizards/mana.js";
import { tickStatuses } from "./Statuses/tickStatuses.js";
import { validateBattleRound } from "./validateBattleRound.js";
import { getBattleWinner } from "./Wizards/getBattleWinner.js";
import { logDamageCalculation } from "./DamageCalculations/logDamageCalculation.js";

export { createWizard } from "./Wizards/createWizard.js";

export class BattleEngine {
  constructor({ effects = createDefaultEffects(), factorN = 2 } = {}) {
    this.effects = effects;
    this.factorN = factorN;
    this.hooks = Object.fromEntries(
      ["roundStart", "beforeClash", "afterClash", "roundEnd"]
        .map(stage => [stage, new DamagePipeline()])
    );
  }

  use(stage, modifier) {
    if (!Object.hasOwn(this.hooks, stage)) throw new Error(`Unknown stage: ${stage}`);
    this.hooks[stage].use(modifier);
    return this;
  }

  // wizardA/spellA always belong to the left; wizardB/spellB to the right.
  resolve(wizardA, wizardB, spellA, spellB) {
    const battle_round = new BattleRound({ wizardA, wizardB, spellA, spellB, factorN: this.factorN });
    validateBattleRound(battle_round, this.effects);
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
      tickStatuses(wizard, battle_round);
    }
    this.hooks.roundStart.calculate(battle_round);
    battle_round.spellsCast = false;
  }

  resolveClash(battle_round) {
    for (const action of battle_round.actions) {
      consumeSpellMana(action);
    }

    // Complete each phase for both sides before moving to the next phase.
    executeEffectPhase(battle_round, this.effects, "healing");
    executeEffectPhase(battle_round, this.effects, "barrier");
    this.calculateRoundDamage(battle_round);
    executeEffectPhase(battle_round, this.effects, "damage");
    executeEffectPhase(battle_round, this.effects, "afterDamage");
  }

  calculateRoundDamage(battle_round) {
    this.hooks.beforeClash.calculate(battle_round);

    const [actionA, actionB] = battle_round.actions;
    battle_round.finalDamage = calculateClash(actionA, actionB, battle_round.factorN);
    this.hooks.afterClash.calculate(battle_round);

    if (!Number.isFinite(battle_round.finalDamage)) {
      throw new Error("Invalid final damage.");
    }

    const remaining_damage = Math.abs(battle_round.finalDamage);
    battle_round.log.push(
      `${battle_round.spellA.name} vs ${battle_round.spellB.name}: ${remaining_damage} remaining damage.`
    );
    battle_round.spellsCast = true;
    logDamageCalculation(actionA, actionB, battle_round.factorN, battle_round.finalDamage);
  }

  finishRound(battle_round) {
    this.hooks.roundEnd.calculate(battle_round);
    battle_round.winner = getBattleWinner(battle_round.wizardA, battle_round.wizardB);
  }
}
