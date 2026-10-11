# Wizard code and battle pipeline

This guide describes the current implementation and where to add content.

## Folder structure

```text
js/
  main.js                      Starts the app
  app/
    init.js                    Wires the app and navigation events
    SceneManager.js            Loads, caches, mounts, and cleans up scenes
  battle/
    BattleController.js        Owns duel state and rival spell selection
    BattleEngine.js            Runs the round and passive modifiers
    round.js                   Round/action data and action preparation
    wizard.js                  Wizard creation, mana, and victory rules
    damage.js                  Elements, clash formulas, and damage application
    debug.js                   Detailed console calculation output
  effects/
    EffectRegistry.js          Effect registration and phase execution
    defaultEffects.js          Built-in effect handlers and registrations
  statuses/
    index.js                   Registers available status definitions
    StatusRegistry.js          Application, hooks, ticks, expiry, casting restrictions
    definitions/
      index.js                 Collects definition exports
      burn.js                  Independent Burn instances
      frozen.js                Your Frozen definition
  spells/
    spells.js                  Spell factories and spell catalog
  ui/
    BattleView.js              Controls, stats, cast cards, and controller binding
    SpellMenu.js               Element filters, hover/focus previews, selection
    spellDetails.js            Shared detail rendering and meditation preview
```

Combat does not manipulate HTML. The view does not calculate combat results.
Small related helpers share a module; each status still gets its own definition.

## Naming and data

`wizardA` is always left/player; `wizardB` is always right/rival.
`spellA` and `actions[0]` belong to wizardA; `spellB` and `actions[1]` belong to wizardB.
Positive `finalDamage` hits wizardB; negative damage hits wizardA. A win never swaps them.

A spell is reusable data. An action is a spell's instance for one round. Modifiers
change an action's `power` or `element`, not the shared spell definition.

`battle_round` holds both wizards, spells, actions, factor, result, and shared log.
An action holds `caster`, `target`, `spell`, `power`, `element`, `canCast`, `didCast`,
`blockedBy`, `damage`, and `healthDamageDealt`.

## How an action enters the pipeline

`main.js` calls `app/init.js`. Initialization creates a controller and scene manager.
The scene manager loads `html/battle_scene.html` and calls `mountBattle` in
`ui/BattleView.js`. The spell menu passes a selected ID to `BattleController.cast`.
The controller finds spellA, chooses an affordable rival spellB, and calls
`BattleEngine.resolve`. Afterwards it stores the actual cast cards and log for the view.
Meditation uses the catalog's `recharge` action. Its display name is Meditate.

## Detailed round order

### 1. Create and prepare the round

**Files:** `battle/round.js`, `battle/damage.js`, `battle/wizard.js`, `statuses/StatusRegistry.js`.

Create a fresh `BattleRound` and two fresh actions. Reject an ended duel, invalid
factor, element, or power. Check registered statuses and run `onValidateAction`
before status ticking. This lets Frozen mark an action before a one-turn status expires.
Check affordability only for actions that can cast. Validate registered spell effects
and status names even for prevented actions.

Preparation calls the clash calculator to validate inputs, but does not apply its
result. Final damage is calculated later. Normal resource mutation starts only
after preparation succeeds. Custom validation callbacks should not mutate wizard
resources; they can annotate the round's actions.

### 2. Start the round

**Files:** `battle/BattleEngine.js`, `battle/wizard.js`, `statuses/StatusRegistry.js`.

For wizardA then wizardB, regenerate mana up to its maximum and tick existing statuses.
Each status receives `onTick`, loses one duration, receives `onExpire` if it expires,
and is removed when its remaining duration is zero or less.

Run engine `roundStart` modifiers. If either wizard is now dead, skip spell casting
and proceed to round end. Existing status damage happens before spell healing.

### 3. Pay for spells that can cast

**Files:** `battle/BattleEngine.js`, `battle/wizard.js`.

A casting action pays its mana cost once and sets `didCast`. A prevented action
pays nothing; the log names its `blockedBy` statuses. Losing a clash does not refund mana.

### 4. Heal and restore mana for both wizards

**Files:** `effects/EffectRegistry.js`, `effects/defaultEffects.js`.

Run the `healing` phase for both actions. `HEAL_SELF` and `RESTORE_MANA` live here.
Their values cap at wizard maxima. A self effect uses `target: "self"` and can
resolve even if the spell later loses. Prevented actions apply no effects.

### 5. Raise barriers for both wizards

**Files:** the same effect modules.

Run `barrier` for both actions. `BARRIER_SELF` adds to the current barrier.
Both sides complete healing and barriers before clash calculation begins.
A mixed-effect spell follows these phases regardless of its effects array order.
Within the same phase, wizardA precedes wizardB and array order is retained.

### 6. Calculate clash damage

**Files:** `battle/BattleEngine.js`, `battle/damage.js`, `battle/debug.js`.

Run status `onBeforeClash` callbacks, then engine `beforeClash` modifiers.
Neutralize prevented actions to zero power and Kinetic element, so no elemental
advantage applies against a spell that was never cast. Calculate signed damage,
run engine `afterClash` modifiers, check that the result is finite, and log it.

Identical elements and Kinetic matchups use left power minus right power.
For generating relationships:

```text
remaining = weaker_element / elemental_factor - stronger_element
if remaining > 0: remaining *= elemental_factor
```

For overcoming relationships:

```text
remaining = weaker_element - elemental_factor * stronger_element
if remaining < 0: remaining /= elemental_factor
```

The calculator assigns the sign according to left/right orientation. Factor defaults
to 2, must be at least 1, and fractional damage is retained.

### 7. Apply final damage

**Files:** `effects/EffectRegistry.js`, `effects/defaultEffects.js`, `battle/damage.js`.

The executor sets each action's nonnegative `damage` from the signed result.
Opponent-targeted effects require a won clash. Ties apply no offensive effects.
`DAMAGE_DIRECT` applies remaining clash damage, not original power or `effect.amount`.
Barrier absorbs first, overflow damages health, and health cannot fall below zero.
Its `bypassBarrier` flag skips absorption. The spell name appears in damage logs.
Actual health damage is stored on `action.healthDamageDealt` for later effects.
Use one `DAMAGE_DIRECT` entry per spell; repeating it repeats the remaining damage.

### 8. Apply new statuses and remaining effects

**Files:** `effects/defaultEffects.js`, `statuses/StatusRegistry.js`.

Run `afterDamage`, the default phase for custom effects. `APPLY_STATUS` requires
a won clash and health damage unless that effect has `bypassBarrier: true`.
Status bypass is independent of direct damage bypass. A status that bypasses
barriers still cannot apply after a tie or loss.

The registered definition receives the incoming entry and matching existing entries.
Its `onApply` decides whether to append, merge, extend, or ignore. New entries tick
next round. Burn creates separate instances with independent durations.

### 9. Finish the round

**Files:** `battle/BattleEngine.js`, `statuses/StatusRegistry.js`, `battle/wizard.js`.

Run status `onRoundEnd`, then engine `roundEnd` modifiers. Resolve victory or draw.
Return the round. The controller shows only spells whose actions actually cast.

## Effect handler contract

Effect handlers now receive **`(effect, battle_round, action)`**. These are the
original round and original action; there is no flattened copy or effect context.

- Use `effect.amount`, `effect.duration`, etc. for configured effect values.
- Use `action.caster`, `action.target`, and `action.spell` for participants and source.
- Use `action.damage` and `action.healthDamageDealt` for this action's results.
- Use `battle_round.log` and `battle_round.actions` for round-wide information.

This replaces the previous two-argument API where action fields were copied onto
a round-like context. Any external custom handlers must adopt the third argument.

## Where to add custom content

| Addition | Location |
| --- | --- |
| New spell | `js/spells/spells.js`: append its definition to `spells`. |
| New immediate effect | Write a handler and register it in `effects/defaultEffects.js` or on `engine.effects` during setup. |
| New status | Create `statuses/definitions/yourStatus.js`; export through `definitions/index.js`; register in `statuses/index.js`. |
| Shared casting restriction | Import `preventCasting` from `statuses/StatusRegistry.js`. |
| Passive/equipment bonus | Register `engine.use(stage, modifier)` in app setup. |
| Starting wizard resources | `battle/wizard.js`, or a controller `wizard_factory`. |
| Enemy strategy | `selectOpponentSpell` in `battle/BattleController.js`, or a supplied `opponent_selector`. |
| UI descriptions | `ui/spellDetails.js`; spell descriptions belong in spell data. |
| Animation | Add UI modules and consume combat results; keep rule calculations in `battle`. |

### Custom effects

Register with `engine.effects.register(type, handler, { phase })`.
Supported phases are `healing`, `barrier`, `damage`, and `afterDamage`.
For example:

```js
engine.effects.register("GREATER_HEAL", (effect, battle_round, action) => {
  const caster = action.caster;
  caster.health = Math.min(caster.maxHealth, caster.health + effect.amount);
}, { phase: "healing" });
```

A spell can include `{ type: "GREATER_HEAL", target: "self", amount: 40 }`.
Pass the configured engine into `new BattleController({ engine })` in `app/init.js`.
Custom effects remain trusted code; keep values valid and within resource limits.

### Custom statuses

Read `js/statuses/README.md` for callback arguments. `onApply` owns stacking rules:
Poison can merge damage without duration changes; Bleeding can extend duration
without damage changes. Those behaviors are still yours to implement.

To share casting prevention, import `preventCasting` from `../StatusRegistry.js`
in a definition and call it from `onValidateAction` with `{ action, active_status }`.
Frozen, Rooted, and Petrified can each do this while retaining separate callbacks.
A blocked action stays blocked for that round even after the status expires.
Next round starts with fresh flags. This prevents every spell effect, including
healing, barriers, and meditation, but does not prevent normal mana regeneration.

### Passive modifiers

Hooks are `roundStart`, `beforeClash`, `afterClash`, and `roundEnd`.
They run in registration order and mutate the supplied `battle_round`.
Returned replacement objects are not used. No separate DamagePipeline class remains.

## Checks

Run `npm test`. Tests cover elemental formulas, ties, healing/barrier phases,
status application and expiry, casting restrictions, controllers, scene navigation,
card details, and effect reference identity. New behavior should test both sides
where position might affect its result.
