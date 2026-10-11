import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateClash, elements } from '../js/GameMechanics/DamageCalculations/DamagePipeline.js';
import { BattleEngine, createWizard } from '../js/GameMechanics/BattleEngine.js';
const action = (element, power) => ({ element, power });
const spell = (element, basePower, effects = [{ type: 'DAMAGE_DIRECT' }]) => ({ name: element, element, basePower, manaCost: 10, effects });
test('README piecewise formulas on both sides of each threshold', () => {
  assert.equal(calculateClash(action('Metal', 60), action('Water', 20)), 20);
  assert.equal(calculateClash(action('Metal', 20), action('Water', 20)), -10);
  assert.equal(calculateClash(action('Wood', 60), action('Metal', 20)), 20);
  assert.equal(calculateClash(action('Wood', 20), action('Metal', 20)), -10);
  assert.equal(calculateClash(action('Fire', 30), action('Fire', 20)), 10);
  assert.equal(calculateClash(action('Kinetic', 30), action('Water', 20)), 10);
});
test('every element matchup is symmetric and equal thresholds tie', () => {
  for (const elementA of elements) for (const elementB of elements) for (const power of [0, 10, 40, 80]) {
    assert.ok(calculateClash(action(elementA, power), action(elementB, 20)) === -calculateClash(action(elementB, 20), action(elementA, power)));
  }
  assert.equal(calculateClash(action('Metal', 40), action('Water', 20)), 0);
});
test('tie deals no damage or offensive status; mana is consumed', () => {
  const wizardA = createWizard('A'), wizardB = createWizard('B');
  new BattleEngine().resolve(wizardA, wizardB, spell('Fire', 30, [{ type: 'DAMAGE_DIRECT', amount: 30 }, { type: 'APPLY_STATUS', status: 'BURN', duration: 3, tickDamage: 5 }]), spell('Fire', 30));
  assert.equal(wizardA.health, 100); assert.equal(wizardB.health, 100);
  assert.equal(wizardB.activeStatuses.length, 0); assert.equal(wizardA.mana, 90);
});
test('barrier absorbs first; overflow reaches health in either orientation', () => {
  for (const reverse of [false, true]) {
    const wizardA = createWizard('A'), wizardB = createWizard('B', { barrier: 5 });
    const engine = new BattleEngine();
    if (reverse) engine.resolve(wizardB, wizardA, spell('Kinetic', 10), spell('Kinetic', 30));
    else engine.resolve(wizardA, wizardB, spell('Kinetic', 30), spell('Kinetic', 10));
    assert.equal(wizardB.barrier, 0); assert.equal(wizardB.health, 85);
  }
});
test('new effects and passive hooks work without changing engine', () => {
  const engine = new BattleEngine();
  engine.effects.register('MANA_GIFT', (effect, { caster }) => { caster.mana += effect.amount; });
  engine.use('beforeClash', battle_round => { battle_round.actions[0].power *= 2; });
  const wizardA = createWizard('A', { mana: 30 }), wizardB = createWizard('B');
  engine.resolve(wizardA, wizardB, spell('Kinetic', 20, [{ type: 'DAMAGE_DIRECT' }, { type: 'MANA_GIFT', target: 'self', amount: 5 }]), spell('Kinetic', 20));
  assert.equal(wizardB.health, 80); assert.equal(wizardA.mana, 35);
});
test('burn starts next round, bypasses barrier, expires; health is clamped', () => {
  const engine = new BattleEngine();
  const wizardA = createWizard('A'), wizardB = createWizard('B', { barrier: 100 });
  engine.resolve(wizardA, wizardB, spell('Fire', 30, [{ type: 'DAMAGE_DIRECT' }, { type: 'APPLY_STATUS', status: 'BURN', duration: 2, tickDamage: 5 }]), spell('Kinetic', 0));
  assert.equal(wizardB.health, 100);
  for (let round_number = 0; round_number < 2; round_number++) engine.resolve(wizardA, wizardB, spell('Kinetic', 0), spell('Kinetic', 0));
  assert.equal(wizardB.health, 90); assert.equal(wizardB.activeStatuses.length, 0);
  engine.resolve(wizardA, wizardB, spell('Kinetic', 1000), spell('Kinetic', 0));
  assert.equal(wizardB.health, 0);
});
test('invalid actions fail before either wizard is changed', () => {
  const wizardA = createWizard('A'), wizardB = createWizard('B', { mana: 0, manaRegen: 0 });
  const before = JSON.stringify([wizardA, wizardB]);
  assert.throws(() => new BattleEngine().resolve(wizardA, wizardB, spell('Fire', 30), spell('Water', 20)), /cannot afford/);
  assert.equal(JSON.stringify([wizardA, wizardB]), before);
});
