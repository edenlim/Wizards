import { renderSpellDetails } from "./spellDetails.js";

export function renderSpellCard(container, spell, owner) {
  renderSpellDetails(container, spell, { owner });
}
