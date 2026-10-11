# Wizard
Wizard is a Simultaneous-action selection (Scissors, paper, stone) Rogue Like game where two dueling wizard has to choose a spell at the same time.

## Mechanics
### Damage
Each spell has set base damage. During the collision, the two spells will cancel out each other's damage.

```js
function damage(spell1_damage, spell2_damage){
    return spell1_damage - spell2_damage;
}

If damage is >0, player 2 takes damage.
If damage is 0, both players take no damage.
If damage is <0, player 1 takes damage.

```
### Elements
There are 6 Elements, following the chinese 五行:
- Metal
- Wood
- Water
- Fire
- Earth
- Kinetic/Null

#### Relationship
According to the chinese Elemental system, there are two kind of relationship between elements:
- Generating
- Overcoming

> If we do not use an if/else control flow, then generative formular will always do n times more damage than overcoming formular.

$$
G(W,S,N) = (\frac{W}{N} - S)\cdot N \\
$$
$$
O(W,S,N) = \frac{W - N\cdot S}{N} = (\frac{W}{N}-S) \\
$$

$$
\therefore G(W,S,N) = N \cdot O(W,S,N)
$$

##### **Generating**
The generating cycle is as following: (Weaker Element -> Stronger Element)
Metal -> Water -> Wood -> Fire -> Earth -> Metal
- Metal condensate and generate water
- Water nuture and generate wood
- Wood fuels and generate fire
- Fire incinerates and generates ashes and earth
- Earth purifies and generates metal

In the generating clash, formular for damage dealt is as follows:
```js
// W = the weaker element, S = the stronger element
// n = Variable factor increased by stats
let n;
function damage_generative(weaker_element,stronger_element){
    var damage = weaker_element/n - stronger_element;
    if (damage > 0){
        damage *= n;
    }
    return damage; 
}
```

> Assuming n = 2; Then it takes 2 points of damage for the weaker element to cancel 1 point of damage in generative relationship.

##### **Overcoming**
The overcoming cycle is as following: (Stronger Element -> Weaker Element)
Metal -> Wood -> Earth -> Water -> Fire -> Metal
- Metal reshapes and overcome wood
- Wood breaks and overcome earth
- Earth muddies and overcome water
- Water extinguish and overcome fire
- Fire melts and overcome metal


In the overcomming clash, formular for damage dealt is as follows:
```js
// W = the weaker element, S = the stronger element
// n = Variable factor increased by stats
let n;
function damage_overcoming(weaker_element,stronger_element){
    var damage = weaker_element - n*stronger_element;
    if (damage < 0){
        damage /= n;
    }
    return damage; 
}
```

> Assuming n = 2; Then it takes 1 points of damage for the stronger element to cancel 2 points of damage in overcoming relationship.


### Battle Resource
#### Health
In each battle, the main resource is health. The first wizard to reach 0 hp is defeated.

#### Mana
Mana regenerates each round (By certain percentage). Each spell cast requires mana. This makes it such that the wizard has to manage the mana resource carefully. A turn can be spent to recharge Mana instead of casting a spell.

#### Barrier
A wizard starts of without a barrier in the tournament. If a barrier is conjured, the barrier will take damage (priority) before the wizard's health. If the barrier is broken, whatever amount of kinetic damage the spell has left will be dealt to the wizard
- Attack has to win the clash to deal damage to the barrier
- Any leftover damage will be used to damage barrier
- Any leftover damage will be used to damage the wizard

#### Potion/Scrolls
An immediate use resource that can be used to instantly use one of the [effects](#effects).

### Out of Battle Resources
#### Equipment (Staves, Wands, Focuses)
Equipments can be used to give passive [effects](#effects) to the wizards. 

#### Spelltome
A grimmore containing the list of spells you can use in a battle. The more pages in the tome, the more options you have.

##### Binders
Your Grimmore's binder cannot store more than a certain amount of pages. To increase the variety of spells you can learn, you need to increase your capacity at the Bookbinder.

##### Spellpages
When winning a battle, you can rip apart one page (of your choosing) of your opponents tome and add to your spellpage.
- Repeated pages will be consumed to upgrade your existing spell
- New pages will unlock new spells.

You can also buy spell pages at a shop, but they are expensive.

##### Density
Spelltome can also evolve based on the density of your spell pages. If you have 100% spells of one element in your tome, it will evolve into that element's tome. This will give you a passive effect that increases your spell damage in that element.
- This allows user to spec into 1 or 2 elements
- Or be a generalist.

> Maybe the game will generate enemies based on your tome to counter you?
> Or create enemies with the same element as you to support monospells, like in hades.

#### Gold
Gold can be used to spend on one of the following:
- Gym: + Max Health (permanent)
- Library: + Max Mana (permanent)
- Spa: + Max Mana Regeneration (Permanent)
- Shop:
    - Artificer: Change Staff's passive effect
    - Alchemist: Buy Potions
    - Bookbinder: Expand Spelltome
    - Scribe: Buy spell pages
    - Oreinomancer: Delete Spell page

### Effects
Ideas of effects:
- Increased Health/Mana
- Passive Health/Mana regeneration at start of turn
- Increased base damage to all/one element
    - Buffing one element should be more than all element (Specialization vs Generalization)
- Increased elemental factor in (Generative/Overcoming) relationship if you are the stronger/weaker element.
- Increased the final kinetic damage you deal
- Decrease the final kinetic damage you take
- Casts an extra spell for free
    - i.e: Staff of Waterbolt will cast another water bolt on top of the spell you casted.
    - Could have a multiplier if you cast the exact same spell
- Chance of Barrier to reconjure again after breaking but at 50% of its original value.
- Convert the type of elemental spell casted to another type
- Convert the type of element your enemy spell casted to another type
- Null elements
- Cursed equipment to drain health/mana, but provide one of the buff above at an insane value

## Playstyle
Each element can do everything, but they are shows significant proficiencies in certain playstyles.
- Damage
    - Burst Damage
    - Damage Over Time
    - Ramped Damage
    - Barrier Damage
    - Bypass Barrier Damage
        - DoT / DPS
- Healing (Health/Mana)
    - Burst Healing
    - Healing Over Time
    - Leech
- Barrier
    - High Health Barrier
    - Regenerating Barrier
    - Recoil Barrier
    - Barrier Absorption
- Buff
    - Increased Damage dealt
    - Decreased Damage taken
    - Cleanse your Debuffs
- Debuff
    - Decreased Damage dealt
    - Increased Damage taken
    - Remove Enemy Buffs



### Fire
Fire element focus on Damage (Barrier bypassing, DoT, Stacking/Ramp up):


### Water
Water element focus on Mana Leech/Tanking/Healing (Burst Heals):
- High regeneration
- High barrier

### Wood
Wood element focus on Health Leech/Mana Sustain/Healing/Buff/DoT:
- Low base damage
- High regeneration
- High barrier

### Earth
Earth element focus on Debuff/Tanking/Barrier:
- Low base damage
- High barrier
- High health regeneration

### Metal
Metal element focus on Damage/Barrier Break/Barrier:
- High base damage
- High barrier
## Running the MVP

Requires Node.js for tests and Python 3 for the local web server. No packages need installing.

```sh
npm start
# Open http://localhost:8000
npm test
```

Open **Spells**, hover or keyboard-focus a spell to preview its full details, then click it to resolve a round. Filter the list by element, or use **Back** / Escape to close the menu. **Meditate** skips attacking and restores mana; hover or focus it to see the capped gain. The rival selects an affordable spell independently.
Restart starts a fresh duel; switching scenes preserves the combatants.

### Architecture and extension points

- `js/init.js` wires application dependencies together. `main.js` starts the app.
- `js/scene.js` manages scene fetching, caching, mounting, and cleanup. It receives scene definitions instead of importing battle logic.
- `js/Controllers/BattleController.js` owns one duel's state and actions without depending on the DOM. `selectOpponentSpell.js` provides the replaceable rival strategy.
- `js/battle.js` connects a controller to `js/UI/BattleView.js`. Separate renderers handle spell cards and wizard stats.
- `js/GameMechanics/BattleEngine.js` coordinates the round lifecycle, validation, hooks, and effect execution.
- `DamageCalculations/BattleRound.js` holds the round context. `DamagePipeline.js` runs hooks; `calculateClash.js` computes elemental clashes; `dealDamage.js` applies barrier absorption and health damage.
- `Elements/relationships.js` contains the elemental cycles.
- `Wizards/` contains wizard creation, mana rules, and victory resolution. `Statuses/tickStatuses.js` handles status ticking and expiry.
- `Effects/EffectRegistry.js` handles registration and dispatch. `defaultEffects.js` installs built-in effects, including mana recharge.
- `Spells/createSpell.js` supplies spell factories, `spells.js` defines the catalog, and `executeSpellEffects.js` executes composed effects.
- `Spells/effect.js` preserves earlier public exports; `BattleEngine.js` still re-exports `createWizard`, and `DamagePipeline.js` still re-exports clash calculation and elements.

Add a spell by composing registered effects in `spells`. Its `basePower` controls
clash strength; `DAMAGE_DIRECT` applies the surviving clash damage once. Use only
one `DAMAGE_DIRECT` entry per spell. `amount` is not a second source of clash damage.

Register a new effect at application setup, without changing the engine or existing spells
(`RESTORE_MANA` is already built in; this example adds a different effect):

```js
engine.effects.register("MANA_GIFT", (effect, { caster }) => {
  caster.mana = Math.min(caster.maxMana, caster.mana + effect.amount);
});
// A spell can now include:
// { type: "MANA_GIFT", target: "self", amount: 30 }
```

Add passive effects from equipment, tome bonuses, or statuses through hooks:

```js
engine.use("beforeClash", battle_round => {
  for (const action of battle_round.actions) {
    if (action.caster.equipment?.boostElement === action.element) {
      action.power *= 1.15;
    }
  }
});
```

Hooks run in registration order: `roundStart`, `beforeClash`, `afterClash`,
`roundEnd`. Modifiers mutate the round context and may return it. Change action
`power` or `element` before the clash, `factorN` for elemental interaction, and
signed `finalDamage` after the clash (positive hits B, negative hits A). Treat
spell definitions as immutable; change action fields instead. Effects receive
a `battle_round` context containing round fields plus
`{ caster, target, spell, power, element, damage }`. Unknown effects fail
explicitly. Register plugins before resolving rounds.

### MVP timing and scope

Both actions are validated first. Mana regenerates by a flat 10 at round start
(the README's eventual percentage regeneration is not implemented). Existing
statuses tick next, then spells consume mana and clash. A lethal status tick ends
the duel before either spell casts. Offensive effects require a won clash;
self effects resolve even when their spell loses. Spell effects resolve in shared phases:
all healing and mana restoration, then all barriers, then clash calculation and
damage, then remaining effects such as new debuffs. Each phase processes both
wizards before advancing. Array order only orders effects within the same phase.
A newly conjured barrier absorbs incoming spell damage this round. New debuffs
require health damage to penetrate the barrier. New burn statuses
begin ticking next round, bypass barriers, and expire after their listed duration.
Repeated statuses stack independently. Fractional damage is preserved.

Kinetic and identical elements use direct subtraction. Element factor defaults
to 2 and must be at least 1. Health cannot fall below zero. Healing caps at maximum
health. The demo includes all six elements, healing, barriers, burn, and recharge.
Ice Shard currently has no freeze effect because freeze behavior is not defined.

This is a combat foundation. Tournament progression, shops, equipment inventory,
extra spell collisions, percentage mana regeneration, and richer status rules
remain future work. Custom plugins are trusted code and must keep values valid.

### Naming and left/right convention

`wizardA` is always the left participant (the player in the demo), and `wizardB`
is always the right participant (the rival). `spellA`/`actions[0]` belong to
wizardA; `spellB`/`actions[1]` belong to wizardB. Positive `finalDamage` hits the
right wizard; negative `finalDamage` hits the left wizard. Winning a clash never
swaps their identities. Use `battle_round` for round contexts and descriptive
names for callback variables. The elemental formula arguments `weaker_element`
and `stronger_element` represent those elements' spell powers.

### Wiring a custom duel

```js
import { BattleEngine } from "./js/GameMechanics/BattleEngine.js";
import { BattleController } from "./js/Controllers/BattleController.js";

const engine = new BattleEngine();
// Register custom effects and passive hooks here.
const battle_controller = new BattleController({ engine });
battle_controller.cast("fireball");
```

`BattleController` also accepts `spell_catalog`, `opponent_selector`, and
`wizard_factory` dependencies. A new controller creates an independent duel.
`mountBattle(root, battle_controller)` binds its view and returns listener cleanup.
`SceneManager` accepts a scene dictionary and a `fetch_html` dependency; each scene
may provide a `mount` function that returns cleanup. `initApp` returns the controller,
scene manager, and a `dispose` function for the application lifetime.

The spell menu lives in `js/UI/SpellMenu.js`. Shared card and preview details live in
`js/UI/spellDetails.js`; previews always show damage, healing, and barrier, including zero values.

### Effect execution phases

Register an effect with `register(type, resolver, { phase })`. Supported phases
are `healing`, `barrier`, `damage`, and `afterDamage`. The default is `afterDamage`
for compatibility with custom effects. Built-in healing and mana restoration use
`healing`; barrier creation uses `barrier`; direct damage uses `damage`; new
statuses use `afterDamage`. A spell can compose any combination, regardless of
its effects array order. Self effects must specify `target: "self"`.

```js
engine.effects.register("GREATER_HEAL", (effect, battle_round) => {
  battle_round.caster.health = Math.min(
    battle_round.caster.maxHealth,
    battle_round.caster.health + effect.amount
  );
}, { phase: "healing" });
```

`beforeClash` hooks now run after healing and barrier creation. `afterClash`
hooks run after calculating the clash and before applying its damage. Per-action
effect contexts persist between phases, so a status effect can inspect
`healthDamageDealt`. Existing statuses still tick at round start.
