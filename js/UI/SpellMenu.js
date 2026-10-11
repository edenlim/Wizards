import { elements } from "../GameMechanics/Elements/relationships.js";
import { canAffordSpell } from "../GameMechanics/Wizards/mana.js";
import { renderSpellDetails } from "./spellDetails.js";

export class SpellMenu {
  constructor(root) {
    this.root = root;
    this.panel = root.querySelector("#grimmore");
    this.open_button = root.querySelector("#cast");
    this.close_button = root.querySelector("#close-spells");
    this.spell_list = root.querySelector("#list_of_spells");
    this.element_filters = root.querySelector("#grimmore_elements");
    this.preview = root.querySelector("#spell_preview");
    this.selected_element = "All";
    this.preview_spell = null;
  }

  populate(spell_catalog) {
    this.spells = spell_catalog.filter(spell => spell.id !== "recharge");
    this.element_filters.replaceChildren();
    for (const element of ["All", ...elements]) {
      const button = this.root.ownerDocument.createElement("button");
      button.type = "button";
      button.textContent = element;
      button.dataset.element = element;
      button.setAttribute("aria-pressed", String(element === this.selected_element));
      this.element_filters.append(button);
    }
    this.renderList();
  }

  renderList() {
    this.spell_list.replaceChildren();
    const visible_spells = this.spells.filter(spell => this.selected_element === "All" || spell.element === this.selected_element);
    for (const spell of visible_spells) {
      const button = this.root.ownerDocument.createElement("button");
      button.type = "button";
      button.dataset.spellId = spell.id;
      button.textContent = `${spell.name} · ${spell.manaCost ?? 0} mana`;
      this.spell_list.append(button);
    }
    if (!visible_spells.length) this.spell_list.textContent = "No spells for this element.";
    this.previewSpell(visible_spells[0]);
    if (this.wizardA) this.updateAvailability(this.wizardA, this.duel_over);
  }

  previewSpell(spell) {
    this.preview_spell = spell;
    renderSpellDetails(this.preview, spell, { showAllValues: true });
  }

  setOpen(is_open) {
    this.panel.hidden = !is_open;
    this.open_button.setAttribute("aria-expanded", String(is_open));
    if (is_open) this.spell_list.querySelector("button")?.focus();
  }

  updateAvailability(wizardA, duel_over) {
    this.wizardA = wizardA;
    this.duel_over = duel_over;
    for (const button of this.spell_list.querySelectorAll("button")) {
      const spell = this.spells.find(spell => spell.id === button.dataset.spellId);
      const available = !duel_over && canAffordSpell(wizardA, spell);
      // Keep unavailable spells focusable so their details can still be inspected.
      button.setAttribute("aria-disabled", String(!available));
      button.title = available ? "Cast this spell" : "Unavailable: insufficient mana or duel ended";
    }
    if (duel_over) this.setOpen(false);
  }

  bind(onCast) {
    const event_controller = new AbortController();
    const options = { signal: event_controller.signal };
    this.open_button.addEventListener("click", () => this.setOpen(this.panel.hidden), options);
    this.close_button.addEventListener("click", () => {
      this.setOpen(false); this.open_button.focus();
    }, options);
    this.panel.addEventListener("keydown", event => {
      if (event.key === "Escape") { this.setOpen(false); this.open_button.focus(); }
    }, options);
    const previewListener = event => {
      const button = event.target.closest("button[data-spell-id]");
      if (button) this.previewSpell(this.spells.find(spell => spell.id === button.dataset.spellId));
    };
    this.spell_list.addEventListener("pointerover", previewListener, options);
    this.spell_list.addEventListener("focusin", previewListener, options);
    this.spell_list.addEventListener("click", event => {
      const button = event.target.closest("button[data-spell-id]");
      if (!button || button.getAttribute("aria-disabled") === "true") return;
      onCast(button.dataset.spellId);
      this.setOpen(false);
      if (!this.open_button.disabled) this.open_button.focus();
    }, options);
    this.element_filters.addEventListener("click", event => {
      const button = event.target.closest("button[data-element]");
      if (!button) return;
      this.selected_element = button.dataset.element;
      for (const filter of this.element_filters.querySelectorAll("button")) {
        filter.setAttribute("aria-pressed", String(filter === button));
      }
      this.renderList();
    }, options);
    return () => event_controller.abort();
  }
}
