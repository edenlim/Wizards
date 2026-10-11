export const generating = { Metal: "Water", Water: "Wood", Wood: "Fire", Fire: "Earth", Earth: "Metal" };
export const overcoming = { Metal: "Wood", Wood: "Earth", Earth: "Water", Water: "Fire", Fire: "Metal" };
export const elements = ["Metal", "Wood", "Water", "Fire", "Earth", "Kinetic"];

// wizardA/actionA is left; wizardB/actionB is right.
// Positive damage hits wizardB (right); negative damage hits wizardA (left). Apply the README's
// piecewise formulas to powers, rather than multiplying their difference.
export function calculateClash(actionA, actionB, elemental_factor = 2) {
  if (!Number.isFinite(elemental_factor) || elemental_factor < 1) throw new Error("Invalid elemental factor.");
  for (const action of [actionA, actionB]) {
    if (!elements.includes(action.element) || !Number.isFinite(action.power) || action.power < 0)
      throw new Error("Invalid spell element or power.");
  }
  // weaker_element and stronger_element are the respective spell powers.
  const generative = (weaker_element, stronger_element) => {
    const damage_difference = weaker_element / elemental_factor - stronger_element;
    return damage_difference > 0 ? damage_difference * elemental_factor : damage_difference;
  };
  const overcome = (weaker_element, stronger_element) => {
    const damage_difference = weaker_element - elemental_factor * stronger_element;
    return damage_difference < 0 ? damage_difference / elemental_factor : damage_difference;
  };
  if (generating[actionA.element] === actionB.element) return generative(actionA.power, actionB.power);
  if (generating[actionB.element] === actionA.element) return -generative(actionB.power, actionA.power);
  if (overcoming[actionA.element] === actionB.element) return -overcome(actionB.power, actionA.power);
  if (overcoming[actionB.element] === actionA.element) return overcome(actionA.power, actionB.power);
  return actionA.power - actionB.power;
}

export function dealDamage(target, amount, log, source, bypassBarrier = false) {
  if (typeof source !== "string" || !source.trim()) throw new Error("Damage source must be a spell or debuff name.");
  if (!Number.isFinite(amount) || amount < 0) throw new Error("Invalid damage.");
  const name = target.name.toLowerCase() === "you" ? "Your" : target.name;
  const name_apostrophe = target.name.toLowerCase() === "you" ? "Your" : target.name + "'s";
  const absorbed = bypassBarrier ? 0 : Math.min(target.barrier, amount);
  target.barrier -= absorbed;
  const healthDamage = Math.min(target.health, amount - absorbed);
  target.health -= healthDamage;
  if (absorbed > 0 && healthDamage > 0) {
    log.push(`${name_apostrophe} barrier absorbs ${absorbed} and breaks!`);
    log.push(`${target.name} loses ${healthDamage} health from ${source}.`)

  }
  else if (absorbed > 0) {
    log.push(`${name_apostrophe} barrier absorbs ${absorbed} from ${source}; no health lost.`);
    log.push(`${name_apostrophe} barrier has ${target.barrier} barrier left.`)
    if(target.barrier<=0){
      log.push(`${name_apostrophe} barrier shatters and disappears!`);
      target.barrier = 0;
    }
  }
  else if (healthDamage > 0) {
    log.push(`${name} loses ${healthDamage} health from ${source}.`);
  } else {
    log.push(`${name} took no damage from ${source}.`);
  }
  return healthDamage;
}
