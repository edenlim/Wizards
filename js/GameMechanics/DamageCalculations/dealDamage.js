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

