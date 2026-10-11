import { canAffordSpell } from "../battle/wizard.js";

// Optional testing add-on. Removing its mount call restores normal rival selection.
export function mountOpponentSpellControl(root, battle_controller) {
  const document_root = root.ownerDocument;
  const original_selector = battle_controller.opponent_selector;
  const control = document_root.createElement("div");
  const label = document_root.createElement("label");
  label.textContent = "Enemy spell: ";
  const dropdown = document_root.createElement("select");
  const random_option = document_root.createElement("option");
  random_option.value = "";
  random_option.textContent = "Random";
  dropdown.append(random_option);
  for (const spell of battle_controller.spells) {
    const option = document_root.createElement("option");
    option.value = spell.id;
    option.textContent = `${spell.name} (${spell.manaCost} mana)`;
    dropdown.append(option);
  }
  label.append(dropdown);
  const explanation = document_root.createElement("p");
  explanation.textContent = "Testing control: repeat the selected spell. If mana is insufficient, the enemy meditates. Casting restrictions still apply.";
  control.append(label, explanation);
  root.querySelector(".battle-actions").after(control);

  battle_controller.opponent_selector = (wizardB, spell_catalog) => {
    if (!dropdown.value) return original_selector(wizardB, spell_catalog);
    const selected_spell = spell_catalog.find(spell => spell.id === dropdown.value);
    if (selected_spell && canAffordSpell(wizardB, selected_spell)) return selected_spell;
    const meditation_spell = spell_catalog.find(spell => spell.id === "recharge");
    return meditation_spell && canAffordSpell(wizardB, meditation_spell)
      ? meditation_spell : original_selector(wizardB, spell_catalog);
  };

  return () => {
    battle_controller.opponent_selector = original_selector;
    control.remove();
  };
}
