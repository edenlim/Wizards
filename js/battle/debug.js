import { generating, overcoming } from "./damage.js";

/**
 * Detailed step-by-step console logging for spell clash damage calculations.
 */
export function logDamageCalculation(actionA, actionB, factorN, finalDamage) {
  const spellA = actionA.spell;
  const spellB = actionB.spell;
  const casterA = actionA.caster?.name || "Player";
  const casterB = actionB.caster?.name || "Rival";

  console.group(`⚔️ [CLASH CALCULATION] ${casterA}'s "${spellA.name}" vs ${casterB}'s "${spellB.name}"`);

  // 1. Spells & Descriptions
  console.log("%c1. Spells & Base Powers:", "font-weight: bold; color: #4dabf7;");
  console.log(`  • ${casterA}: ${spellA.name} [Element: ${actionA.element}, Power: ${actionA.power}]`);
  console.log(`    "${spellA.description || "No description available."}"`);
  console.log(`  • ${casterB}: ${spellB.name} [Element: ${actionB.element}, Power: ${actionB.power}]`);
  console.log(`    "${spellB.description || "No description available."}"`);

  // 2. Elemental Relationship & 3. Matchup Analysis
  console.log("%c2. Elemental Relationship:", "font-weight: bold; color: #4dabf7;");
  let relationshipType = "None";
  let relationshipDesc = "";
  let favoredSpell = null;
  let unfavoredSpell = null;
  let formulaType = "";
  let formulaDetail = "";

  if (generating[actionA.element] === actionB.element) {
    // A generates B -> B is stronger element (S), A is weaker element (W)
    relationshipType = "Generative (Weaker -> Stronger)";
    relationshipDesc = `${actionA.element} generates ${actionB.element}. (${spellA.name} feeds into ${spellB.name})`;
    favoredSpell = { name: spellB.name, element: actionB.element, caster: casterB, role: "Stronger element (S)", power: actionB.power };
    unfavoredSpell = { name: spellA.name, element: actionA.element, caster: casterA, role: "Weaker element (W)", power: actionA.power };

    const W = actionA.power;
    const S = actionB.power;
    const rawDiff = (W / factorN) - S;
    formulaType = `Generative: diff = (W / N) - S; if (diff > 0) damage = diff * N; else damage = diff`;
    formulaDetail = `  • W (${unfavoredSpell.name}) = ${W}, S (${favoredSpell.name}) = ${S}, Factor N = ${factorN}
  • Step 1: (W / N) - S = (${W} / ${factorN}) - ${S} = ${W / factorN} - ${S} = ${rawDiff}
  • Step 2: ${rawDiff > 0 ? `diff > 0 (Weaker element overpowered the stronger element!): Damage = ${rawDiff} * ${factorN} = ${rawDiff * factorN}` : `diff <= 0 (Stronger element prevails): Damage = |${rawDiff}| = ${Math.abs(rawDiff)}`}`;
  } else if (generating[actionB.element] === actionA.element) {
    // B generates A -> A is stronger element (S), B is weaker element (W)
    relationshipType = "Generative (Weaker -> Stronger)";
    relationshipDesc = `${actionB.element} generates ${actionA.element}. (${spellB.name} feeds into ${spellA.name})`;
    favoredSpell = { name: spellA.name, element: actionA.element, caster: casterA, role: "Stronger element (S)", power: actionA.power };
    unfavoredSpell = { name: spellB.name, element: actionB.element, caster: casterB, role: "Weaker element (W)", power: actionB.power };

    const W = actionB.power;
    const S = actionA.power;
    const rawDiff = (W / factorN) - S;
    formulaType = `Generative: diff = (W / N) - S; if (diff > 0) damage = diff * N; else damage = diff`;
    formulaDetail = `  • W (${unfavoredSpell.name}) = ${W}, S (${favoredSpell.name}) = ${S}, Factor N = ${factorN}
  • Step 1: (W / N) - S = (${W} / ${factorN}) - ${S} = ${W / factorN} - ${S} = ${rawDiff}
  • Step 2: ${rawDiff > 0 ? `diff > 0 (Weaker element overpowered the stronger element!): Damage = ${rawDiff} * ${factorN} = ${rawDiff * factorN}` : `diff <= 0 (Stronger element prevails): Damage = |${rawDiff}| = ${Math.abs(rawDiff)}`}`;
  } else if (overcoming[actionA.element] === actionB.element) {
    // A overcomes B -> A is stronger element (S), B is weaker element (W)
    relationshipType = "Overcoming (Stronger -> Weaker)";
    relationshipDesc = `${actionA.element} overcomes ${actionB.element}. (${spellA.name} directly counters ${spellB.name})`;
    favoredSpell = { name: spellA.name, element: actionA.element, caster: casterA, role: "Stronger element (S)", power: actionA.power };
    unfavoredSpell = { name: spellB.name, element: actionB.element, caster: casterB, role: "Weaker element (W)", power: actionB.power };

    const W = actionB.power;
    const S = actionA.power;
    const rawDiff = W - (factorN * S);
    formulaType = `Overcoming: diff = W - (N * S); if (diff < 0) damage = diff / N; else damage = diff`;
    formulaDetail = `  • W (${unfavoredSpell.name}) = ${W}, S (${favoredSpell.name}) = ${S}, Factor N = ${factorN}
  • Step 1: W - (N * S) = ${W} - (${factorN} * ${S}) = ${W} - ${factorN * S} = ${rawDiff}
  • Step 2: ${rawDiff < 0 ? `diff < 0 (Stronger element prevails): Damage = |${rawDiff}| / ${factorN} = ${Math.abs(rawDiff) / factorN}` : `diff >= 0 (Weaker element breaks through!): Damage = ${rawDiff}`}`;
  } else if (overcoming[actionB.element] === actionA.element) {
    // B overcomes A -> B is stronger element (S), A is weaker element (W)
    relationshipType = "Overcoming (Stronger -> Weaker)";
    relationshipDesc = `${actionB.element} overcomes ${actionA.element}. (${spellB.name} directly counters ${spellA.name})`;
    favoredSpell = { name: spellB.name, element: actionB.element, caster: casterB, role: "Stronger element (S)", power: actionB.power };
    unfavoredSpell = { name: spellA.name, element: actionA.element, caster: casterA, role: "Weaker element (W)", power: actionA.power };

    const W = actionA.power;
    const S = actionB.power;
    const rawDiff = W - (factorN * S);
    formulaType = `Overcoming: diff = W - (N * S); if (diff < 0) damage = diff / N; else damage = diff`;
    formulaDetail = `  • W (${unfavoredSpell.name}) = ${W}, S (${favoredSpell.name}) = ${S}, Factor N = ${factorN}
  • Step 1: W - (N * S) = ${W} - (${factorN} * ${S}) = ${W} - ${factorN * S} = ${rawDiff}
  • Step 2: ${rawDiff < 0 ? `diff < 0 (Stronger element prevails): Damage = |${rawDiff}| / ${factorN} = ${Math.abs(rawDiff) / factorN}` : `diff >= 0 (Weaker element breaks through!): Damage = ${rawDiff}`}`;
  } else {
    relationshipType = "None (Neutral)";
    relationshipDesc = `Neither element counters or generates the other.`;
    formulaType = `Neutral: damage = Power A - Power B`;
    formulaDetail = `  • Power A (${spellA.name}) = ${actionA.power}, Power B (${spellB.name}) = ${actionB.power}
  • Calculation: ${actionA.power} - ${actionB.power} = ${actionA.power - actionB.power}`;
  }

  console.log(`  • Type: ${relationshipType}`);
  console.log(`  • Description: ${relationshipDesc}`);

  console.log("%c3. Matchup Advantage:", "font-weight: bold; color: #4dabf7;");
  if (favoredSpell) {
    console.log(`  • Winning Matchup: ${favoredSpell.caster}'s "${favoredSpell.name}" (${favoredSpell.element}) holds the advantage [${favoredSpell.role}].`);
    console.log(`  • Losing Matchup: ${unfavoredSpell.caster}'s "${unfavoredSpell.name}" (${unfavoredSpell.element}) is at an elemental disadvantage [${unfavoredSpell.role}].`);
  } else {
    console.log(`  • Advantage: Neutral clash (equal standing).`);
  }

  console.log("%c4. Damage Formula & Arithmetic:", "font-weight: bold; color: #4dabf7;");
  console.log(`  • Applied Formula: ${formulaType}`);
  console.log(formulaDetail);

  console.log("%c5. Resulting Damage & Outcome:", "font-weight: bold; color: #51cf66;");
  const absDamage = Math.abs(finalDamage);
  if (finalDamage > 0) {
    console.log(`  • Clash Winner: ${casterA}'s "${spellA.name}"`);
    console.log(`  • Resulting Damage: ${absDamage}`);
    console.log(`  • Damage Recipient: ${casterB} takes ${absDamage} damage!`);
  } else if (finalDamage < 0) {
    console.log(`  • Clash Winner: ${casterB}'s "${spellB.name}"`);
    console.log(`  • Resulting Damage: ${absDamage}`);
    console.log(`  • Damage Recipient: ${casterA} takes ${absDamage} damage!`);
  } else {
    console.log(`  • Clash Winner: Tie! Both spells canceled each other out completely.`);
    console.log(`  • Resulting Damage: 0`);
    console.log(`  • Damage Recipient: Neither wizard takes damage.`);
  }

  console.groupEnd();
}
