import { BattleEngine } from "./BattleEngine.js";
import { createWizard, canAffordSpell } from "./wizard.js";
import { spells } from "../spells/spells.js";

// No DOM dependencies. Each controller owns one duel; wizardA is always left.
export class BattleController {
  constructor({ engine = new BattleEngine(), spell_catalog = spells,
    opponent_selector = selectOpponentSpell, wizard_factory = createWizard } = {}) {
    this.engine = engine;
    this.spells = spell_catalog;
    this.opponent_selector = opponent_selector;
    this.wizard_factory = wizard_factory;
    this.restart("The duel begins! Choose your spell!");
  }

  restart(message = "A new duel begins.") {
    this.wizardA = this.wizard_factory("You");
    this.wizardB = this.wizard_factory("Rival");
    this.lastCast = null;
    this.message = message;
  }

  cast(spell_id) {
    const spellA = this.spells.find(spell => spell.id === spell_id);
    if (!spellA) throw new Error(`Unknown spell: ${spell_id}`);
    const spellB = this.opponent_selector(this.wizardB, this.spells);
    const battle_round = this.engine.resolve(this.wizardA, this.wizardB, spellA, spellB);
    this.lastCast = battle_round.spellsCast
      ? battle_round.actions.map(action => action.didCast ? action.spell : null)
      : null;
    this.message = battle_round.log.join("\n") +
      (battle_round.winner ? `\nDuel ended: ${battle_round.winner}.` : "");
    return battle_round;
  }
}

export function selectOpponentSpell(wizardB, spell_catalog, random = Math.random) {
  const affordable_spells = spell_catalog.filter(spell => canAffordSpell(wizardB, spell));
  if (!affordable_spells.length) throw new Error("The rival has no affordable spells.");
  return affordable_spells[Math.floor(random() * affordable_spells.length)];
}
