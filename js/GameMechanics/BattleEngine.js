import { BattleRound } from "./DamageCalculations/BattleRound.js";
import { DamagePipeline } from "./DamageCalculations/DamagePipeline.js";
import { calculateClash } from "./DamageCalculations/calculateClash.js";
import { createDefaultEffects } from "./Effects/defaultEffects.js";
import { executeSpellEffects } from "./Spells/executeSpellEffects.js";
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
    for (const wizard of [wizardA, wizardB]) {
      regenerateMana(wizard);
      tickStatuses(wizard, battle_round);
    }
    this.hooks.roundStart.calculate(battle_round);
    battle_round.spellsCast = false;
    if (wizardA.health > 0 && wizardB.health > 0) this.resolveClash(battle_round);
    this.hooks.roundEnd.calculate(battle_round);
    battle_round.winner = getBattleWinner(wizardA, wizardB);
    return battle_round;
  }

  resolveClash(battle_round) {
    battle_round.actions.forEach(consumeSpellMana);
    this.hooks.beforeClash.calculate(battle_round);
    battle_round.finalDamage = calculateClash(...battle_round.actions, battle_round.factorN);
    this.hooks.afterClash.calculate(battle_round);
    if (!Number.isFinite(battle_round.finalDamage)) throw new Error("Invalid final damage.");
    battle_round.log.push(
      `${battle_round.spellA.name} vs ${battle_round.spellB.name}: ${Math.abs(battle_round.finalDamage)} remaining damage.`
    );
    battle_round.spellsCast = true;
    const [actionA, actionB] = battle_round.actions;
    logDamageCalculation(actionA, actionB, battle_round.factorN, battle_round.finalDamage);
    executeSpellEffects(actionA, battle_round, this.effects, Math.max(0, battle_round.finalDamage));
    executeSpellEffects(actionB, battle_round, this.effects, Math.max(0, -battle_round.finalDamage));
  }
}
