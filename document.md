# Wizard: architecture and battle pipeline

This document describes the current implementation. It also explains how to extend it without changing existing spells or the central round engine.

## 1. Core conventions

- `wizardA` is always the left wizard, the player in the demo.
- `wizardB` is always the right wizard, the rival in the demo.
- `spellA` and `actions[0]` belong to wizardA; `spellB` and `actions[1]` belong to wizardB.
- A positive `finalDamage` hits wizardB. A negative value hits wizardA. Zero means a tie.
- Winning does not swap the wizards' identities.
- Use `battle_round` for round data and descriptive variable names.

A **spell** is reusable data: name, element, power, mana cost, description, and an effects array. An **action** is the spell's instance within a particular round: caster, target, spell, current power, and current element. Modifiers should change action fields rather than the reusable spell definition.

An **effect** is an immediate operation, such as healing or raising a barrier. A **status** is stored on a wizard and persists across rounds, such as BURN. An effect can apply a status.

## 2. From the menu to the engine

| File | Responsibility |
| --- | --- |
| `js/main.js` | Starts the application and displays startup errors. |
| `js/init.js` | Wires together the controller, scene manager, and UI. This is the place to supply a customized engine. |
| `js/scene.js` | Fetches and caches scene HTML, mounts scenes, and cleans up old listeners. |
| `js/eventlistener_handler.js` | Binds the scene-switch button and returns listener cleanup. |
| `js/UI/SpellMenu.js` | Lists spells, filters elements, previews hovered/focused spells, and passes the selected spell ID to the view's callback. |
| `js/UI/BattleView.js` | Connects menu, meditation, and restart controls to callbacks; renders the current duel. |
| `js/battle.js` | Connects the view callbacks to the controller. Catches action errors and displays their messages. |
| `js/Controllers/BattleController.js` | Owns the two wizards, calls the engine, stores the last cast spells and log, and resets the duel. |
| `js/Controllers/selectOpponentSpell.js` | Chooses an affordable rival spell; can be replaced with another strategy. |

Selecting a spell calls `BattleController.cast(spell_id)`. The controller finds spellA, selects spellB, and calls `BattleEngine.resolve(wizardA, wizardB, spellA, spellB)`. The engine changes the wizard resources and returns a `battle_round`. The controller stores the result, and the view displays it.

The UI does not calculate damage. The engine does not manipulate HTML.

## 3. Detailed round pipeline

The main sequence is in `js/GameMechanics/BattleEngine.js`.

### Step 1: create and validate the round

**Files:**

- `DamageCalculations/BattleRound.js`
- `validateBattleRound.js`
- `DamageCalculations/calculateClash.js`
- `Wizards/mana.js`
- `Effects/EffectRegistry.js`

`BattleRound` creates two actions and initializes `finalDamage` to zero and the log to an empty array. Each action references its caster, target, and spell, and copies the spell's power and element.

Validation checks that both wizards are alive, the elemental factor is valid, spell powers and elements are valid, mana costs can be afforded, and every effect type is registered. Affordability includes the mana regeneration about to occur.

Validation calls the clash calculator to validate its inputs, but does not apply that result. The actual round damage is calculated later, after healing and barriers. Invalid actions fail before normal resource changes.

### Step 2: start the round

**Method:** `BattleEngine.startRound(battle_round)`

**Files:** `Wizards/mana.js`, `Statuses/tickStatuses.js`, `DamageCalculations/dealDamage.js`, and `DamageCalculations/DamagePipeline.js`.

For wizardA, then wizardB:

1. Restore normal round mana, capped at maximum mana.
2. Tick each existing status.
3. Reduce each status duration by one and remove expired statuses.

Currently, a status with positive `tickDamage` damages health directly and bypasses barriers. Its status name is passed as the damage source, so the log can say `from BURN`.

Then the engine runs registered `roundStart` modifiers. If either wizard is dead afterwards, both spells are skipped. `roundEnd` modifiers and victory resolution still run.

**Timing distinction:** existing status damage happens before spell healing. The shared healing-before-damage rule applies to spells cast this round, not to the existing status tick.

### Step 3: pay both spell costs

**Method:** `BattleEngine.resolveClash(battle_round)`

**File:** `Wizards/mana.js`.

Both actions consume their mana costs. A losing spell still costs mana. A spell containing several effects pays its spell cost once, not once per effect.

### Step 4: resolve healing for both wizards

**Files:** `Spells/executeSpellEffects.js`, `Effects/EffectRegistry.js`, and `Effects/defaultEffects.js`.

The engine executes the `healing` phase for wizardA and then wizardB. Built-in `HEAL_SELF` and `RESTORE_MANA` belong to this phase. Healing is capped at maximum health; restored mana is capped at maximum mana.

Self effects require `target: "self"` in spell data and resolve even if the spell later loses the clash. No final clash damage has been calculated yet.

### Step 5: raise barriers for both wizards

**Files:** the same phase executor, registry, and built-in handlers.

The engine executes the `barrier` phase for both sides. `BARRIER_SELF` adds its amount to the caster's current barrier. Both barriers exist before any spell damage is applied.

A spell can contain healing, barrier creation, and damage. Their phases determine execution order even if its array lists damage first.

### Step 6: calculate and modify clash damage

**Method:** `BattleEngine.calculateRoundDamage(battle_round)`

**Files:**

- `DamageCalculations/DamagePipeline.js`: executes registered modifiers in order.
- `DamageCalculations/calculateClash.js`: applies elemental formulas.
- `Elements/relationships.js`: defines valid elements and elemental cycles.
- `DamageCalculations/logDamageCalculation.js`: writes detailed calculation diagnostics to the console.

The engine runs `beforeClash` modifiers, calculates the signed clash result, and runs `afterClash` modifiers. The final value must be finite. It records the clash summary and marks the spells as cast.

For identical elements or a Kinetic matchup, damage is `actionA.power - actionB.power`.

For a generating relationship, using weaker and stronger spell powers:

```text
 damage_difference = weaker_element / elemental_factor - stronger_element
 if positive: multiply by elemental_factor
 otherwise: keep damage_difference
```

For an overcoming relationship:

```text
 damage_difference = weaker_element - elemental_factor * stronger_element
 if negative: divide by elemental_factor
 otherwise: keep damage_difference
```

The calculator adjusts the sign according to which action is weaker or stronger, while preserving the left/right convention. Fractional damage is retained.

### Step 7: apply final spell damage

**Files:** `Spells/executeSpellEffects.js`, `Effects/defaultEffects.js`, and `DamageCalculations/dealDamage.js`.

The `damage` phase uses the positive magnitude appropriate to each action. Only the winning action can execute opponent-targeted effects. A tie applies no offensive effects.

`DAMAGE_DIRECT` uses remaining clash damage, not its effect's `amount` or the original base power. `dealDamage` absorbs damage into the target's barrier first, then reduces health by the overflow. Health cannot fall below zero. An effect can explicitly bypass the barrier.

The spell name is passed as the source for logging. The returned health damage is stored as `healthDamageDealt` in that action's effect context.

Use one `DAMAGE_DIRECT` entry per spell: repeating it would apply the same remaining clash damage repeatedly.

### Step 8: apply new statuses and remaining effects

**Files:** `Spells/executeSpellEffects.js` and `Effects/defaultEffects.js`.

The `afterDamage` phase runs after both actions' damage phase. This is also the default phase for custom registrations that omit a phase.

The built-in `APPLY_STATUS` requires both a won clash and health damage greater than zero. A fully absorbing barrier blocks the status. If damage penetrates the barrier, the status is copied into the target's `activeStatuses` array.

New statuses start ticking next round. Repeated statuses currently stack as independent entries; there is no refresh, merge, or exclusive-status rule.

### Step 9: finish the round

**Method:** `BattleEngine.finishRound(battle_round)`

**Files:** `DamageCalculations/DamagePipeline.js` and `Wizards/getBattleWinner.js`.

Run `roundEnd` modifiers, then check both health values. If both are zero, the result is a draw; otherwise the surviving wizard wins. The engine returns the round for the controller and UI to display.

## 4. Effect contexts and ordering

`Spells/executeSpellEffects.js` filters effects by their registered phase. It retains an effect context on each action so a later status handler can inspect health damage dealt by an earlier damage handler.

An effect resolver receives `(effect, battle_round)`. In this callback, `battle_round` contains round data plus action-specific fields:

| Field | Meaning |
| --- | --- |
| `caster` | Wizard performing this action. |
| `target` | Opposing wizard. |
| `spell` | This action's spell definition. |
| `damage` | Nonnegative remaining damage for this action. |
| `healthDamageDealt` | Health damage recorded by the direct-damage handler. |
| `phase` | Current effect phase. |
| `log` | Shared round log array. |
| `wizardA`, `wizardB`, `actions` | References to the participants and round actions. |

The effect context is a shallow copy, not the original `BattleRound` object. Updating `caster.health`, `target.barrier`, or appending to `log` changes shared objects. Reassigning a copied scalar such as `finalDamage` does not change the engine's original round value. Use engine hooks for changes to clash power, elements, factor, or final damage.

Within each phase, wizardA resolves before wizardB, and effects retain their array order. The phase structure eliminates the former left/right advantage for ordinary self healing and barrier creation. More complex cross-target effects still need their own explicit timing rules.

## 5. Example: one spell heals, shields, and attacks

Suppose wizardB has 50 health and casts a spell that heals 30, adds 20 barrier, and has 10 Kinetic power. WizardA casts a 40-power Kinetic attack.

1. WizardB heals from 50 to 80.
2. WizardB gains 20 barrier.
3. The clash leaves `40 - 10 = 30` damage toward wizardB.
4. The barrier absorbs 20 and breaks.
5. The remaining 10 reduces wizardB's health from 80 to 70.

The result is the same if the defensive spell is on the left instead. Existing status ticks, if any, occur before this example's spell phases.

## 6. Where to add custom content

### Quick file guide

| Addition | File or extension point |
| --- | --- |
| Spell using existing effects | Add its definition to `js/GameMechanics/Spells/spells.js`, using factories from `createSpell.js`. |
| New immediate effect | Create a handler in a new file under `js/GameMechanics/Effects/`, then register it on the engine during setup. |
| Built-in effect available to every default engine | Register it in `js/GameMechanics/Effects/defaultEffects.js`. |
| Basic damage-over-time status | Add `APPLY_STATUS` data to a spell; the current status ticker already supports it. |
| New status behavior such as freeze or regeneration | Add a behavior module under `js/GameMechanics/Statuses/` and wire it into status ticking or engine hooks. There is currently no status registry. |
| Equipment or passive bonus | Register a modifier with `engine.use(...)` during setup. |
| Wizard starting resources | `js/GameMechanics/Wizards/createWizard.js`, or supply a custom `wizard_factory` to the controller. |
| Rival decision strategy | Supply `opponent_selector` to the controller; the default is `selectOpponentSpell.js`. |
| Effect display names or preview formatting | `js/UI/spellDetails.js`. |
| Animation or sprite display | Add UI modules; keep combat rules inside `GameMechanics`. |

### Add a mixed-effect spell

In `Spells/spells.js`, append a definition to the exported `spells` array:

```js
createSpell({
  id: "renewing_flame",
  name: "Renewing Flame",
  element: "Fire",
  basePower: 25,
  manaCost: 30,
  description: "Restore 15 health, conjure 10 barrier, and clash with fire.",
  effects: [
    { type: "HEAL_SELF", target: "self", amount: 15 },
    { type: "BARRIER_SELF", target: "self", amount: 10 },
    { type: "DAMAGE_DIRECT" },
  ],
})
```

No engine changes are required. The menu reads the catalog and previews these effects.

### Register a custom effect

Create `js/GameMechanics/Effects/greaterHeal.js`:

```js
export function greaterHeal(effect, battle_round) {
  const caster = battle_round.caster;
  caster.health = Math.min(caster.maxHealth, caster.health + effect.amount);
}
```

In `js/init.js`, import this handler and `BattleEngine`. Replace the default controller construction with:

```js
const engine = new BattleEngine();
engine.effects.register("GREATER_HEAL", greaterHeal, { phase: "healing" });
const battle_controller = new BattleController({ engine });
```

A spell can now include `{ type: "GREATER_HEAL", target: "self", amount: 40 }`.

Choose `healing`, `barrier`, `damage`, or `afterDamage` when registering. Unknown phases, duplicate registrations, and unknown effect types throw errors. Custom handlers are trusted code: validate their data and preserve resource limits. For mana-preview accuracy, custom restoration effects also need matching display support in `UI/spellDetails.js`.

### Add a basic debuff

For poison that works like the existing burn, use:

```js
{ type: "APPLY_STATUS", status: "POISON", duration: 3, tickDamage: 4 }
```

Combine it with `DAMAGE_DIRECT` in the spell. The existing application handler and status ticker already support this: it must penetrate health to apply, damages health directly each subsequent round, uses POISON as its damage source, and expires after three ticks.

A name alone does not implement behavior. For example, `{ status: "FROZEN", tickDamage: 0 }` only stores a status and counts down its duration. It does not stop casting.

For regeneration, cleansing, power reduction, or freeze, create a dedicated behavior module and connect it deliberately. Use `beforeClash` for power modifiers. Changes to action eligibility may also require updating `validateBattleRound.js`, since validation occurs before `roundStart`. A future status registry could make these behaviors pluggable; one is not implemented today.

### Add a passive modifier

Register modifiers on the engine before passing it to the controller:

```js
engine.use("beforeClash", battle_round => {
  for (const action of battle_round.actions) {
    if (action.caster.equipment?.boostElement === action.element) {
      action.power *= 1.15;
    }
  }
});
```

Hooks run in registration order. Available hooks are:

- `roundStart`: after existing status ticks, before spell casting.
- `beforeClash`: after healing and barriers, before clash calculation.
- `afterClash`: after calculation, before final damage application.
- `roundEnd`: before victory resolution.

Mutate the supplied `battle_round` and its referenced actions. Although `DamagePipeline.calculate` can return a replacement context, the engine currently uses mutation and does not adopt returned replacements.

### Verify new behavior

Run `npm test`. Add meaningful cases under `tests/` for phase order, both left/right orientations, ties, barrier absorption, and status expiry as applicable. Existing phase tests are in `tests/effect-phases.test.js`; combat tests are in `tests/battle.test.js`; module integration tests are in `tests/modules.test.js`.
