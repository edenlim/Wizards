import { dealDamage } from "../DamageCalculations/dealDamage.js";

export function tickStatuses(wizard, battle_round) {
  for (const status of wizard.activeStatuses) {
    if (status.tickDamage > 0) dealDamage(wizard, status.tickDamage, battle_round.log, status.status, true);
    status.duration -= 1;
  }
  wizard.activeStatuses = wizard.activeStatuses.filter(status => status.duration > 0);
}
