const status_hooks = ["onApply", "onTick", "onExpire", "onValidateAction", "onBeforeClash", "onRoundEnd"];

export class StatusRegistry {
    constructor() {
        this.definitions = new Map();
    }

    register(status_name, definition) {
        if (this.has(status_name)) throw new Error(`Status already registered: ${status_name}`);
        if (!definition || typeof definition.onApply !== "function") {
            throw new Error(`Status ${status_name} requires an onApply handler.`);
        }
        for (const hook of status_hooks) {
            if (definition[hook] !== undefined && typeof definition[hook] !== "function") {
                throw new Error(`Status hook ${hook} must be a function.`);
            }
        }
        this.definitions.set(status_name, { ...definition });
        return this;
    }

    has(status_name) {
        return this.definitions.has(status_name);
    }

    get(status_name) {
        const definition = this.definitions.get(status_name);
        if (!definition) throw new Error(`Unknown status: ${status_name}`);
        return definition;
    }

    runActionHook(hook, action, battle_round) {
        for (const active_status of [...action.caster.activeStatuses]) {
            const handler = this.get(active_status.status)[hook];
            if (handler) handler({ wizard: action.caster, active_status, action, battle_round });
        }
    }
}

export function applyStatus(wizard, effect, battle_round, status_registry) {
    const definition = status_registry.get(effect.status);
    const incoming_status = { ...effect };
    const existing_statuses = wizard.activeStatuses.filter(
        active_status => active_status.status === incoming_status.status
    );

    // The registered handler decides whether to append, merge, or ignore.
    definition.onApply({ wizard, incoming_status, existing_statuses, battle_round });
}

export function tickStatuses(wizard, battle_round, status_registry) {
    for (const active_status of [...wizard.activeStatuses]) {
        const definition = status_registry.get(active_status.status);
        if (definition.onTick) {
            definition.onTick({ wizard, active_status, battle_round });
        }
        if (definition.has_duration ?? true) {
            active_status.duration -= 1;
            if (active_status.duration <= 0 && definition.onExpire) {
                definition.onExpire({ wizard, active_status, battle_round });
            }
        }
    }
    wizard.activeStatuses = wizard.activeStatuses.filter(active_status => {
        const definition = status_registry.get(active_status.status);
        return !(definition.has_duration ?? true) || active_status.duration > 0;
    });
}

// Shared action restriction; individual statuses decide when to invoke it.
export function preventCasting({ action, active_status }) {
    action.canCast = false;
    if (!action.blockedBy.includes(active_status.status)) {
        action.blockedBy.push(active_status.status);
    }
}
