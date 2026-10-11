export function dealDamage(target, amount, log, source, bypassBarrier = false) {
  if (typeof source !== "string" || !source.trim()) throw new Error("Damage source must be a spell or debuff name.");
  if (!Number.isFinite(amount) || amount < 0) throw new Error("Invalid damage.");
  const absorbed = bypassBarrier ? 0 : Math.min(target.barrier, amount);
  target.barrier -= absorbed;
  const healthDamage = Math.min(target.health, amount - absorbed);
  target.health -= healthDamage;
  if (absorbed > 0 && healthDamage > 0) {
    log.push(`${target.name}: barrier absorbs ${absorbed}; loses ${healthDamage} health from ${source}.`);
  }
  else if (absorbed > 0) {
    log.push(`${target.name}: barrier absorbs ${absorbed} from ${source}; no health lost.`);
  }
  else if (healthDamage > 0) {
    log.push(`${target.name}: loses ${healthDamage} health from ${source}.`);
  } else {
    log.push(`${target.name}: no damage taken from ${source}.`);
  }
}

