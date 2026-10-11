# Adding your own statuses

Burn is implemented. Your Frozen definition is registered and calls the shared casting restriction. Poison, Rooted, Petrified, and Bleeding are not implemented.

## Files

| File | Purpose |
| --- | --- |
| `StatusRegistry.js` | Registration, application, lifecycle hooks, ticking, expiry, and the shared `preventCasting` helper. |
| `definitions/burn.js` | Independent Burn instances and damage ticks. |
| `definitions/frozen.js` | Your Frozen application and casting restriction. |
| `definitions/index.js` | Collects status definition exports. |
| `index.js` | Registers the available definitions. |

Create a separate module in `definitions/` for each new status. Export it through `definitions/index.js`, import it in `index.js`, and register it by name. Then use that exact name in a spell's `APPLY_STATUS` effect. Unknown names fail before the round changes resources.

You can also supply a registry to `new BattleEngine({ statuses: your_registry })`, or register on `engine.statuses` before resolving rounds. The default effects are connected to the engine's registry automatically. If you supply a custom effect registry, build it with `createDefaultEffects({ statuses: your_registry })` so both use the same registry.

## Callback contract

| Callback | Arguments | Timing |
| --- | --- | --- |
| `onApply` (required) | `{ wizard, incoming_status, existing_statuses, battle_round }` | After a won clash and health damage, or when the status effect explicitly bypasses barriers. |
| `onTick` | `{ wizard, active_status, battle_round }` | Round start, before duration decreases. |
| `onExpire` | `{ wizard, active_status, battle_round }` | After duration decreases to zero or below, before removal. |
| `onValidateAction` | `{ wizard, active_status, action, battle_round }` | Before resource changes and before statuses tick. |
| `onBeforeClash` | Same action arguments | After healing and barriers, before engine `beforeClash` modifiers. |
| `onRoundEnd` | Same action arguments | Before engine `roundEnd` modifiers and victory resolution. |

`wizard` is the affected wizard. `existing_statuses` contains all their active entries with the incoming status name. You decide whether to append, update an existing entry, or ignore the application. The architecture does not automatically create an entry: `onApply` owns that decision.

`onTick` owns behavior only. Set `has_duration` on the status definition: `true` for Burn and Frozen, `false` for permanent Poison. The ticker reads this shared rule directly from the registry; active instances only store instance values such as remaining duration and tick damage. Omitted `has_duration` defaults to `true`. For timed statuses, the ticker decreases duration and removes expired instances. Permanent statuses keep ticking until explicitly removed. New entries created after damage start ticking next round. Hooks run once per active instance.

## Your implementation tasks

- **Poison:** its `onApply` keeps one instance and accumulates tick damage. Its `onTick` deals damage, and `has_duration: false` keeps it active until explicitly removed. No duration is required in spell data.
- **Bleeding:** implement your duration-accumulation rule in its `onApply`, and tick behavior in `onTick`.
- **Frozen:** decide its reapplication rule in `onApply`, then choose the behavior callback appropriate to what Frozen actually does.

For Frozen, `onValidateAction` sees a one-turn status before it expires. Throwing there rejects the entire round without consuming resources; it does not automatically skip the affected wizard's turn. To prevent casting without rejecting the round, call the shared `preventCasting` helper. The engine now honors the resulting action flag.

A status that expires during round-start ticking will not receive `onBeforeClash` that round. If Frozen should affect that round's clash, record round-specific information in `onValidateAction` or design a different expiry schedule. The hook is available; the gameplay decision is yours.

The spell menu does not automatically disable spells based on custom status rules. If you add action restrictions, add matching menu feedback separately.

The generic `APPLY_STATUS` effect currently targets the opponent and requires health damage. A self buff or status that applies without damage needs a separately registered application effect with its own eligibility policy; it can call `applyStatus` to reuse this architecture.

Tests for the registry and lifecycle are in `tests/status-registry.test.js`. Add your own behavior tests as you implement each status.

## Connect a casting restriction

In `definitions/frozen.js`, import:

```js
import { preventCasting } from "../StatusRegistry.js";
```

Inside your existing `onValidateAction` callback, call:

```js
preventCasting({ action, active_status });
```

You can use the same call in separate Rooted and Petrified definitions. The helper
records the status name in `action.blockedBy` and sets `action.canCast` to false.
It does not choose which statuses prevent casting or implement their secondary
behaviors. Each status retains its own callbacks for future differences.

The marker survives status expiry because it belongs to the round action.
The engine skips the spell's affordability check and mana payment, all its effects,
and neutralizes its clash contribution to zero Kinetic power. The opposing spell
therefore deals its normal power without an advantage against an absent element.
Normal round mana regeneration and existing status ticks still occur. Each next
round creates a fresh action; the status must block it again if still active.
`didCast` records whether the spell actually cast, and the controller hides cards
for spells that did not cast. Structural spell/effect validation still applies.

Call this helper during `onValidateAction`, before spell costs and effects run.
Calling it after healing or damage starts cannot undo effects already applied.

Effect resolvers use `(effect, battle_round, action)`. Status callbacks retain their named-object arguments. See `document.md` for the complete reorganized file map.
