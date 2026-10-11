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

JavaScript is grouped into `app`, `battle`, `effects`, `statuses`, `spells`, and `ui`.
See [document.md](document.md) for the complete file map and round pipeline, and
[js/statuses/README.md](js/statuses/README.md) for status callbacks.

Add spell definitions in `js/spells/spells.js`, effects in
`js/effects/defaultEffects.js`, and separate status definitions in
`js/statuses/definitions/`. Register statuses in `js/statuses/index.js`.
Effect callbacks receive `(effect, battle_round, action)`: round data and action
results are explicit references rather than a copied context.

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
require health damage unless the status effect bypasses barriers. New burn statuses
begin ticking next round, bypass barriers, and expire after their listed duration.
Repeated Burn instances stack independently; each status defines its own application rule. Fractional damage is preserved.

Kinetic and identical elements use direct subtraction. Element factor defaults
to 2 and must be at least 1. Health cannot fall below zero. Healing caps at maximum
health. The demo includes all six elements, healing, barriers, burn, and recharge.
Ice Shard has no freeze effect. Snap Freeze is defined separately but is not currently included in the menu catalog.

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

See [document.md](document.md) for custom engines, effect phases, and casting restrictions.
