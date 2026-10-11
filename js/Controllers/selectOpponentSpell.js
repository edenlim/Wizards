import { canAffordSpell } from "../GameMechanics/Wizards/mana.js";

export function selectOpponentSpell(wizardB, spell_catalog, random = Math.random) {
  const affordable_spells = spell_catalog.filter(spell => canAffordSpell(wizardB, spell));
  if (!affordable_spells.length) throw new Error("The rival has no affordable spells.");
  return affordable_spells[Math.floor(random() * affordable_spells.length)];
}
