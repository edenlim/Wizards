export function createWizard(name, options = {}) {
  return {
    name, maxHealth: 100, health: 100, maxMana: 100, mana: 100,
    manaRegen: 10, barrier: 0, activeStatuses: [], ...options,
  };
}

export function getRoundMana(wizard) {
  return Math.min(wizard.maxMana, wizard.mana + wizard.manaRegen);
}

export function canAffordSpell(wizard, spell) {
  const mana_cost = spell.manaCost ?? 0;
  return Number.isFinite(mana_cost) && mana_cost >= 0 && mana_cost <= getRoundMana(wizard);
}

export function regenerateMana(wizard) {
  wizard.mana = getRoundMana(wizard);
}

export function consumeSpellMana(action) {
  action.caster.mana -= action.spell.manaCost ?? 0;
}

export function getBattleWinner(wizardA, wizardB) {
  if (wizardA.health <= 0 && wizardB.health <= 0) return "Draw";
  if (wizardA.health <= 0) return wizardB.name;
  if (wizardB.health <= 0) return wizardA.name;
  return null;
}
