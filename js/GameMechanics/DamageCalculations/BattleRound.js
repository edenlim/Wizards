export class BattleRound {
  constructor({ wizardA, wizardB, spellA, spellB, factorN = 2 }) {
    if (!Number.isFinite(factorN) || factorN < 1) throw new Error("Element factor must be at least 1.");
    Object.assign(this, { wizardA, wizardB, spellA, spellB, factorN });
    // Fixed order: actions[0] belongs to wizardA (left), actions[1] to wizardB (right).
    this.actions = [spellA, spellB].map((spell, index) => ({
      caster: index === 0 ? wizardA : wizardB,
      target: index === 0 ? wizardB : wizardA,
      spell, power: spell.basePower, element: spell.element,
    }));
    this.finalDamage = 0;
    this.log = [];
  }
}
