import { getRoundMana } from "../GameMechanics/Wizards/mana.js";

export function getEffectAmount(spell, effect_type) {
  return (spell.effects ?? []).filter(effect => effect.type === effect_type)
    .reduce((total, effect) => total + (effect.amount ?? 0), 0);
}

export function getMeditationGain(wizard, meditation_spell) {
  return Math.min(wizard.maxMana,
    getRoundMana(wizard) + getEffectAmount(meditation_spell, "RESTORE_MANA")) - wizard.mana;
}

export function renderSpellDetails(container, spell, { showAllValues = false, owner } = {}) {
  container.replaceChildren();
  container.hidden = !spell;
  if (!spell) return;
  const appendText = (tag, text) => {
    const element = container.ownerDocument.createElement(tag);
    element.textContent = text;
    container.append(element);
  };
  if (owner) appendText("small", `${owner} cast`);
  appendText("h3", spell.name);
  appendText("p", `Element: ${spell.element}`);
  const base_values = [
    ["Base Damage", spell.basePower ?? 0],
    ["Base Healing", getEffectAmount(spell, "HEAL_SELF")],
    ["Base Barrier", getEffectAmount(spell, "BARRIER_SELF")],
  ];
  for (const [label, amount] of base_values) {
    if (showAllValues || amount > 0) appendText("p", `${label}: ${amount}`);
  }
  appendText("p", `Mana Cost: ${spell.manaCost ?? 0}`);
  appendText("p", spell.description ?? "No description available.");
  const effect_names = {
    DAMAGE_DIRECT: "Deal surviving clash damage",
    HEAL_SELF: "Heal yourself",
    BARRIER_SELF: "Conjure a barrier",
    RESTORE_MANA: "Restore mana",
    APPLY_STATUS: "Apply a status",
  };
  const parameter_names = {
    amount: "Amount", target: "Target", status: "Status",
    duration: "Rounds", tickDamage: "Damage per round", bypassBarrier: "Bypasses barrier",
  };
  for (const effect of spell.effects ?? []) {
    const parameters = Object.entries(effect).filter(([key]) => key !== "type")
      .map(([key, value]) => {
        const label = parameter_names[key] ?? key.replace(/([a-z])([A-Z])/g, "$1 $2").replaceAll("_", " ");
        return `${label}: ${typeof value === "object" ? JSON.stringify(value) : value}`;
      }).join(", ");
    const name = effect_names[effect.type] ?? effect.type.replaceAll("_", " ").toLowerCase();
    appendText("p", `Effect: ${name}${parameters ? ` (${parameters})` : ""}`);
  }
}
