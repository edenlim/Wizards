export function createWizard(name, options = {}) {
  return {
    name, maxHealth: 100, health: 100, maxMana: 100, mana: 100,
    manaRegen: 10, barrier: 0, activeStatuses: [], ...options,
  };
}
