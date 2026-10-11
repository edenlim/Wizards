export function renderWizardStats(container, wizardA, wizardB) {
  container.textContent = [wizardA, wizardB].map(wizard => {
    const statuses = wizard.activeStatuses
      .map(status => `${status.status} (${status.duration})`).join(", ") || "No statuses";
    return `${wizard.name}: HP ${wizard.health}/${wizard.maxHealth} · Mana ${wizard.mana}/${wizard.maxMana} · Barrier ${wizard.barrier} · ${statuses}`;
  }).join("\n");
}
