export const element_colors = {
  Fire: '#ff4b35', Water: '#40a7ff', Wood: '#54ce62',
  Earth: '#a57448', Metal: '#ffe050', Kinetic: '#a5a8b0',
};

// Presentation only: consumes resolved actions without changing battle rules.
export function mountBattleAnimation(root) {
  const arena = root.querySelector('.battle-arena');
  const document_root = root.ownerDocument;
  const layer = document_root.createElement('div');
  layer.className = 'battle-animation-layer';
  layer.setAttribute('aria-hidden', 'true');
  const sprites = ['a', 'b'].map(side => {
    const sprite = document_root.createElement('img');
    sprite.src = `./assets/wizard${side}.svg`;
    sprite.alt = '';
    sprite.className = `arena-wizard wizard-${side}`;
    layer.append(sprite);
    return sprite;
  });
  arena.append(layer);
  arena.setAttribute('aria-label', 'Two wizards facing each other in the tournament arena');
  const animations = new Set();
  const particles = new Set();
  let generation = 0;

  function reset() {
    generation += 1;
    for (const animation of animations) animation.cancel();
    animations.clear();
    for (const particle of particles) particle.remove();
    particles.clear();
    for (const sprite of sprites) {
      sprite.style.opacity = '';
      sprite.style.transform = '';
    }
  }

  async function animate(element, frames, options) {
    const animation = element.animate(frames, options);
    animations.add(animation);
    try { await animation.finished; } catch { /* Reset cancels the current sequence. */ }
    finally { animations.delete(animation); }
  }

  function createParticle(class_name, color) {
    const particle = document_root.createElement('div');
    particle.className = class_name;
    particle.style.backgroundColor = color;
    layer.append(particle);
    particles.add(particle);
    return particle;
  }

  async function cast(action, side, current_generation) {
    await animate(sprites[side], [
      { transform: 'translateY(0)' }, { transform: 'translateY(-12px)' },
      { transform: 'translateY(0)' },
    ], { duration: 220, easing: 'ease-out' });
    if (generation !== current_generation) return;
    // Support spells get the casting bounce; future buff/meditation visuals go here.
    if (!action.spell.effects.some(effect => effect.type === 'DAMAGE_DIRECT')) return;
    const bolt = createParticle(`arena-bolt bolt-${side}`, element_colors[action.spell.element]);
    await animate(bolt, [
      { left: side === 0 ? '23%' : '77%', opacity: 1 },
      { left: '50%', opacity: 1 },
    ], { duration: 360, easing: 'linear', fill: 'forwards' });
    bolt.remove();
    particles.delete(bolt);
  }

  async function play(battle_round) {
    reset();
    const defeated_sides = battle_round.actions
      .map((action, side) => action.caster.health <= 0 ? side : null)
      .filter(side => side !== null);
    if (root.ownerDocument.defaultView.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      for (const side of defeated_sides) sprites[side].style.opacity = '0';
      return;
    }
    const current_generation = generation;
    const attacks = battle_round.actions.filter(action => action.didCast &&
      action.spell.effects.some(effect => effect.type === 'DAMAGE_DIRECT'));
    await Promise.all(battle_round.actions.map((action, side) =>
      action.didCast ? cast(action, side, current_generation) : undefined));
    if (generation !== current_generation) return;
    if (attacks.length) {
    const color = attacks.length === 1 ? element_colors[attacks[0].spell.element] : '#fff2bd';
    const explosion = createParticle('arena-explosion', color);
    await animate(explosion, [
      { transform: 'translate(-50%, -50%) scale(.2)', opacity: 1 },
      { transform: 'translate(-50%, -50%) scale(1.2)', opacity: 1, offset: .45 },
      { transform: 'translate(-50%, -50%) scale(1.5)', opacity: 0 },
    ], { duration: 280, easing: 'ease-out' });
    explosion.remove();
    particles.delete(explosion);
    }
    if (generation !== current_generation) return;
    await Promise.all(defeated_sides.map(async side => {
      const sprite = sprites[side];
      await animate(sprite, [
        { transform: 'translateY(0)', opacity: 1 },
        { transform: 'translateY(48px)', opacity: 0 },
      ], { duration: 650, easing: 'ease-in', fill: 'forwards' });
      if (generation !== current_generation) return;
      sprite.style.opacity = '0';
      sprite.style.transform = 'translateY(48px)';
    }));
  }

  return { play, reset, dispose() { reset(); layer.remove(); } };
}
