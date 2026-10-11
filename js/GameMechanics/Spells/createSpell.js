export function createSpell({ id, name, element, basePower = 0, manaCost = 0, description, effects = [] }) {
  return { id, name, element, basePower, manaCost, description, effects };
}

export function createDamageSpell(id, name, element, basePower, manaCost, description) {
  return createSpell({ id, name, element, basePower, manaCost, description,
    effects: [{ type: "DAMAGE_DIRECT" }],
  });
}
