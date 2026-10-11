import test from 'node:test';
import assert from 'node:assert/strict';
import { BattleController } from '../js/Controllers/BattleController.js';
import { BattleEngine } from '../js/GameMechanics/BattleEngine.js';
import { createWizard } from '../js/GameMechanics/Wizards/createWizard.js';
import { spells } from '../js/GameMechanics/Spells/spells.js';
import { SceneManager } from '../js/scene.js';
import { renderSpellCard } from '../js/UI/renderSpellCard.js';

const recharge = spells.find(spell => spell.id === 'recharge');
test('the complete spell catalog works with a standalone engine', () => {
  for (const spell of spells) {
    const wizardA = createWizard('Left');
    const wizardB = createWizard('Right');
    assert.doesNotThrow(() => new BattleEngine().resolve(wizardA, wizardB, spell, recharge));
  }
  const wizardA = createWizard('Left', { mana: 10 });
  new BattleEngine().resolve(wizardA, createWizard('Right'), recharge, recharge);
  assert.equal(wizardA.mana, 50);
});

test('controllers isolate duels, retain left/right cast identities, and reset state', () => {
  const controller = new BattleController({ opponent_selector: () => recharge });
  const independent_controller = new BattleController();
  controller.cast('fireball');
  assert.equal(controller.wizardA.name, 'You');
  assert.equal(controller.wizardB.name, 'Rival');
  assert.equal(controller.lastCast[0].id, 'fireball');
  assert.equal(controller.lastCast[1].id, 'recharge');
  assert.equal(independent_controller.wizardB.health, 100);
  assert.equal(independent_controller.lastCast, null);
  controller.restart();
  assert.equal(controller.wizardB.health, 100);
  assert.equal(controller.lastCast, null);
  assert.throws(() => controller.cast('missing'), /Unknown spell/);
});

test('scene switching caches HTML and cleans up mounts', async () => {
  let fetch_count = 0;
  let cleanup_count = 0;
  const root = { innerHTML: '' };
  const scene_manager = new SceneManager({ root,
    scenes: {
      battle: { path: 'battle', mount: () => () => { cleanup_count += 1; } },
      map: { path: 'map' },
    },
    fetch_html: async path => {
      fetch_count += 1;
      return { ok: true, text: async () => path };
    },
  });
  await scene_manager.loadScene('battle');
  await scene_manager.switchScene();
  assert.equal(cleanup_count, 1);
  await scene_manager.switchScene();
  assert.equal(root.innerHTML, 'battle');
  assert.equal(fetch_count, 2);
  scene_manager.dispose();
  assert.equal(cleanup_count, 2);
});

test('a slow scene fetch cannot overwrite a newer scene', async () => {
  let complete_battle_fetch;
  const root = { innerHTML: '' };
  const scene_manager = new SceneManager({ root,
    scenes: { battle: { path: 'battle' }, map: { path: 'map' } },
    fetch_html: path => path === 'battle'
      ? new Promise(resolve => { complete_battle_fetch = resolve; })
      : Promise.resolve({ ok: true, text: async () => 'map' }),
  });
  const pending_battle = scene_manager.loadScene('battle');
  await scene_manager.loadScene('map');
  complete_battle_fetch({ ok: true, text: async () => 'battle' });
  await pending_battle;
  assert.equal(scene_manager.currentScene, 'map');
  assert.equal(root.innerHTML, 'map');
});

test('spell cards render applicable base values and hide when no spell is cast', () => {
  const container = {
    children: [],
    ownerDocument: { createElement: tag => ({ tag, textContent: '' }) },
    replaceChildren() { this.children = []; },
    append(element) { this.children.push(element); },
  };
  const heal = spells.find(spell => spell.id === 'heal');
  renderSpellCard(container, heal, 'You');
  assert.equal(container.hidden, false);
  const text = container.children.map(element => element.textContent).join('\n');
  assert.match(text, /Mend/);
  assert.match(text, /Element: Wood/);
  assert.match(text, /Base Healing: 30/);
  assert.doesNotMatch(text, /Base Damage|Base Barrier/);
  assert.match(text, /Restore 30 health/);
  renderSpellCard(container, null, 'You');
  assert.equal(container.hidden, true);
  assert.equal(container.children.length, 0);
});

test('meditation previews match actual mana gained, including the mana cap', async () => {
  const { getMeditationGain } = await import('../js/UI/spellDetails.js');
  for (const mana of [0, 30, 85, 100]) {
    const wizardA = createWizard('Left', { mana });
    const expected_gain = getMeditationGain(wizardA, recharge);
    new BattleEngine().resolve(wizardA, createWizard('Right'), recharge, recharge);
    assert.equal(wizardA.mana - mana, expected_gain);
  }
});

test('damage logs identify spells and debuffs while keeping barrier behavior', async () => {
  const { dealDamage } = await import('../js/GameMechanics/DamageCalculations/dealDamage.js');
  const log = [];
  const target = createWizard('Right', { barrier: 10 });
  dealDamage(target, 5, log, 'Ice Shard');
  assert.ok(log.some(message => /barrier absorbs 5 from Ice Shard/.test(message)));
  dealDamage(target, 10, log, 'Fireball');
  assert.match(log.at(-1), /loses 5 health from Fireball/);
  dealDamage(target, 0, log, 'Force Bolt');
  assert.match(log.at(-1), /took no damage from Force Bolt/);
  assert.throws(() => dealDamage(target, 5, log, true), /Damage source/);

  const wizardA = createWizard('Left');
  const wizardB = createWizard('Right', { barrier: 20 });
  const engine = new BattleEngine();
  const fireball = spells.find(spell => spell.id === 'fireball');
  const spell_round = engine.resolve(wizardA, wizardB, fireball, recharge);
  assert.ok(spell_round.log.some(message => message.includes('from Fireball')));
  const status_round = engine.resolve(wizardA, wizardB, recharge, recharge);
  assert.ok(status_round.log.some(message => message.includes('from BURN')));
  assert.equal(wizardB.health, 85);
  assert.equal(wizardB.barrier, 0);
});
