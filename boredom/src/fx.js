/* Short per-click glitch burst */
export function shortGlitch(el, ms=240){
  el.classList.add('glitch');
  setTimeout(()=>el.classList.remove('glitch'), ms);
}

/* Perma glitch (at 60% opacity) */
export function permaOn(el){
  el.classList.add('perma-glitch');
  el.style.opacity = '0.6';
}
export function permaOff(el){
  el.classList.remove('perma-glitch');
  el.style.opacity = '';
}

/* Player final glitch-out removal */
export function glitchOutRemove(p, game, after){
  game.classList.add('shake');
  setTimeout(()=>game.classList.remove('shake'), 360);

  p.el.classList.add('glitch-out');
  p.el.addEventListener('animationend', ()=>{
    if (game.contains(p.el)) p.el.remove();
    p.removed = true;
    after && after();
  }, { once:true });
}

/* World glitch toggles */
export function worldGlitchOn(game){
  game.classList.add('world-glitch','world-glitch-shake','world-scanlines');
}
export function worldGlitchOff(game){
  game.classList.remove('world-glitch','world-glitch-shake','world-scanlines','shake');
}

/* --- Light burst with Promise and cancel support --- */
let burstResolver = null;

export function playLightBurst(){
  const b = document.getElementById('lightBurst');
  return new Promise(resolve=>{
    burstResolver = () => { burstResolver = null; resolve(); };

    // restart animation
    b.classList.remove('burst-play'); void b.offsetWidth; // reflow
    const onEnd = () => {
      b.removeEventListener('animationend', onEnd);
      if (burstResolver) { const r = burstResolver; burstResolver = null; r(); }
    };
    b.addEventListener('animationend', onEnd, { once:true });
    b.classList.add('burst-play');
  });
}

export function cancelLightBurst(){
  const b = document.getElementById('lightBurst');
  b.classList.remove('burst-play');
  b.style.opacity = '0';
  if (burstResolver) { const r = burstResolver; burstResolver = null; r(); }
}

/** Stop all world effects immediately (glitch + burst). */
export function stopWorldEffects(game){
  worldGlitchOff(game);
  cancelLightBurst();
}

/* ========================= */
/* Doorway-specific effects  */
/* ========================= */

/** Start monochrome flicker + subtle vibration for the doorway. */
export function doorwayGlitchOn(el){
  if (!el) return null;
  // vibrate + monochrome flicker
  const anim = el.animate([
    { transform:'translate(0,0)', filter:'contrast(160%) brightness(120%)', background:'#ffffff', boxShadow:'0 0 18px rgba(255,255,255,0.9)' },
    { transform:'translate(-1px,1px)', filter:'contrast(220%) brightness(80%)', background:'#eaeaea', boxShadow:'0 0 8px rgba(255,255,255,0.6)' },
    { transform:'translate(1px,-1px)', filter:'contrast(180%) brightness(140%)', background:'#f8f8f8', boxShadow:'0 0 16px rgba(255,255,255,0.85)' },
    { transform:'translate(0,0)', filter:'contrast(160%) brightness(120%)', background:'#ffffff', boxShadow:'0 0 18px rgba(255,255,255,0.9)' }
  ], { duration:320, iterations:Infinity, easing:'steps(2,end)' });
  el._doorwayAnim = anim;
  return anim;
}

export function doorwayGlitchOff(el){
  if (el?._doorwayAnim){ try{ el._doorwayAnim.cancel(); }catch{} el._doorwayAnim=null; }
  if (el){
    el.style.transform = '';
    el.style.filter = '';
    el.style.background = '#ffffff';
    el.style.boxShadow = '0 0 14px rgba(255,255,255,0.85)';
  }
}

/** Absorb a player into doorway: clone -> animate to doorway center -> remove. */
export function absorbPlayerIntoDoorway(p, doorwayEl, game, onDone){
  if (!p || !doorwayEl) return;
  p.removed = true;
  if (game.contains(p.el)) p.el.style.visibility='hidden';

  const clone = p.el.cloneNode(false);
  clone.className = 'player';
  clone.style.left = p.x + 'px';
  clone.style.top  = p.y + 'px';
  clone.style.opacity = '1';
  clone.style.visibility = 'visible';
  clone.style.background = window.getComputedStyle(p.el).backgroundColor || (p.color || 'white');
  game.appendChild(clone);

  const dx = parseFloat(doorwayEl.style.left)||0;
  const dy = parseFloat(doorwayEl.style.top)||0;
  const dw = parseFloat(doorwayEl.style.width)||80;
  const dh = parseFloat(doorwayEl.style.height)||140;
  const targetX = dx + dw/2 - 25;
  const targetY = dy + dh/2 - 25;

  // slight player-specific vibration on absorb
  clone.animate([
    { transform:'translate(0,0) scale(1)' },
    { transform:'translate(1px,-1px) scale(1.02)' },
    { transform:'translate(-1px,1px) scale(0.98)' },
    { transform:'translate(0,0) scale(1)' }
  ], { duration:160, iterations:2, easing:'steps(2,end)' });

  clone.animate([
    { transform:'translate(0,0) scale(1)', opacity:1, filter:'none' },
    { transform:`translate(${targetX - p.x}px, ${targetY - p.y}px) scale(0.25)`, opacity:0, filter:'grayscale(100%) contrast(200%)' }
  ], { duration:720, easing:'cubic-bezier(.2,.8,.2,1)', fill:'forwards' }).onfinish = ()=>{
    clone.remove();
    if (game.contains(p.el)) p.el.remove();
    onDone && onDone();
  };
}
