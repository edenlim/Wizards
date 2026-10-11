import { renderSpellCard } from "./renderSpellCard.js";
import { renderWizardStats } from "./renderWizardStats.js";
import { SpellMenu } from "./SpellMenu.js";
import { getEffectAmount, getMeditationGain } from "./spellDetails.js";

export class BattleView {
  constructor(root) {
    this.root = root;
    this.spell_menu = new SpellMenu(root);
    this.cast_button = root.querySelector("#cast");
    this.meditate_button = root.querySelector("#meditate");
    this.meditation_preview = root.querySelector("#meditation_preview");
    this.restart_button = root.querySelector("#restart");
    this.battle_log = root.querySelector("#battle_log");
  }

  populateSpells(spell_catalog) {
    this.meditation_spell = spell_catalog.find(spell => spell.id === "recharge");
    this.spell_menu.populate(spell_catalog);
  }

  bindActions({ onCast, onRestart }) {
    const unbind_menu = this.spell_menu.bind(onCast);
    const event_controller = new AbortController();
    const options = { signal: event_controller.signal };
    this.meditate_button.addEventListener("click", () => {
      this.spell_menu.setOpen(false);
      onCast(this.meditation_spell.id);
    }, options);
    for (const event_name of ["pointerenter", "focus"]) {
      this.meditate_button.addEventListener(event_name, () => { this.meditation_preview.hidden = false; }, options);
    }
    for (const event_name of ["pointerleave", "blur"]) {
      this.meditate_button.addEventListener(event_name, () => { this.meditation_preview.hidden = true; }, options);
    }
    this.restart_button.addEventListener("click", () => {
      this.spell_menu.setOpen(false);
      this.meditation_preview.hidden = true;
      onRestart();
    }, options);
    return () => { unbind_menu(); event_controller.abort(); };
  }

  render(battle_controller) {
    const { wizardA, wizardB, lastCast, message } = battle_controller;
    const duel_over = wizardA.health <= 0 || wizardB.health <= 0;
    this.root.querySelector(".battle-container").classList.toggle("has-cast", Boolean(lastCast));
    renderSpellCard(this.root.querySelector("#player-hand"), lastCast?.[0], wizardA.name);
    renderSpellCard(this.root.querySelector("#opponent-hand"), lastCast?.[1], wizardB.name);
    renderWizardStats(this.root.querySelector("#stats"), wizardA, wizardB);
    this.cast_button.disabled = duel_over;
    this.meditate_button.disabled = duel_over || !this.meditation_spell;
    this.spell_menu.updateAvailability(wizardA, duel_over);
    if (this.meditation_spell) {
      const bonus = getEffectAmount(this.meditation_spell, "RESTORE_MANA");
      this.meditation_preview.textContent = `Meditate: skip casting an attack and restore ${bonus} mana, plus ${wizardA.manaRegen} round regeneration. You will gain ${getMeditationGain(wizardA, this.meditation_spell)} mana (capped at ${wizardA.maxMana}). Your rival still acts; statuses still tick.`;
    }
    this.battle_log.textContent = message;
  }
}
