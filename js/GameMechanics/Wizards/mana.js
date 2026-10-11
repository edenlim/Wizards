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
