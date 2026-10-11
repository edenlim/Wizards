import { renderSpellCard, getEffectAmount, getMeditationGain } from "./spellDetails.js";
import { SpellMenu } from "./SpellMenu.js";
import { mountBattleAnimation } from "./BattleAnimation.js";

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
    renderWizardStats(this.root.querySelector("#your_stats"), wizardA, battle_controller.engine.statuses);
    renderWizardStats(this.root.querySelector("#enemy_stats"), wizardB, battle_controller.engine.statuses);
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

export function renderWizardStats(container, wizard, status_registry) {
  const document_root = container.ownerDocument;
  container.replaceChildren();

  const heading = document_root.createElement("h3");
  heading.textContent = wizard.name;
  container.append(heading);

  const stats_list = document_root.createElement("ul");
  const appendItem = (list, text) => {
    const item = document_root.createElement("li");
    item.textContent = text;
    list.append(item);
    return item;
  };
  appendItem(stats_list, `HP: ${wizard.health}/${wizard.maxHealth}`);
  appendItem(stats_list, `Mana: ${wizard.mana}/${wizard.maxMana}`);
  appendItem(stats_list, `Barrier: ${wizard.barrier}`);

  const status_item = appendItem(stats_list, "Statuses: ");
  if (wizard.activeStatuses.length === 0) {
    status_item.textContent += "None";
  } else {
    const status_list = document_root.createElement("ul");
    for (const status of wizard.activeStatuses) {
      const definition = status_registry.get(status.status);
      const duration_text = (definition.has_duration ?? true)
        ? `TURNS: ${status.duration}` : "Until removed";
      appendItem(status_list, `${status.status} (${duration_text}, TICK: ${status.tickDamage ?? 0})`);
    }
    status_item.append(status_list);
  }
  container.append(stats_list);
}

// Scene adapter: connect UI events to a supplied controller, then return cleanup.
export function mountBattle(root, battle_controller) {
  const battle_animation = mountBattleAnimation(root);
  const battle_view = new BattleView(root);
  battle_view.populateSpells(battle_controller.spells);
  const unbind_actions = battle_view.bindActions({
    onCast(spell_id) {
      try {
        const battle_round = battle_controller.cast(spell_id);
        void battle_animation.play(battle_round);
      }
      catch (error) { battle_controller.message = error.message; }
      battle_view.render(battle_controller);
    },
    onRestart() {
      battle_animation.reset();
      battle_controller.restart();
      battle_view.render(battle_controller);
    },
  });
  battle_view.render(battle_controller);
  return () => { unbind_actions(); battle_animation.dispose(); };
}
