export function renderWizardStats(container, wizard) {
   const statuses = wizard.activeStatuses
      .map(status => `${status.status} (${status.duration})`).join(", ") || "None";
   container.textContent = `${wizard.name}:\nHP: ${wizard.health}/${wizard.maxHealth}\nMana: ${wizard.mana}/${wizard.maxMana}\nBarrier: ${wizard.barrier}\nStatuses: ${statuses}`;
}
