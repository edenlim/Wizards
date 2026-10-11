import { BattleEngine } from "../GameMechanics/BattleEngine.js";
import { createWizard } from "../GameMechanics/Wizards/createWizard.js";
import { spells } from "../GameMechanics/Spells/spells.js";
import { selectOpponentSpell } from "./selectOpponentSpell.js";

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
    this.lastCast = battle_round.spellsCast ? [spellA, spellB] : null;
    this.message = battle_round.log.join("\n") +
      (battle_round.winner ? `\nDuel ended: ${battle_round.winner}.` : "");
    return battle_round;
  }
}
