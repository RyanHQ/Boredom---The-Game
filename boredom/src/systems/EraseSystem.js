import { erase } from '../config.js';
import { shortGlitch, permaOn, permaOff, glitchOutRemove } from '../fx.js';
import { speakLine } from '../ui/dialogue.js';

export function EraseSystem(p, clickedEl, game, onBothRemoved){
  if(clickedEl!==p.el || p.erased || p.removed) return;

  p.clicks = Math.min(erase.clicksToErase, p.clicks+1);
  const clicks = p.clicks;
  const final  = clicks === erase.clicksToErase;
  const opacity = (clicks >= erase.permaGlitchAt) ? erase.minOpacity : (1 - erase.step * clicks);

  if(!final){
    speakLine(p);                           // anger/fear lines
    shortGlitch(p.el, erase.shortGlitchMs); // small burst each click
    p.el.style.opacity = String(opacity);
  }

  if(clicks === erase.permaGlitchAt) permaOn(p.el); // 60% + constant glitch

  if(final){
    p.erased = true;
    // remove any active speech bubble immediately so it doesn't linger
    if (p.dialogue) { p.dialogue.remove(); p.dialogue = null; }
    permaOff(p.el);
    glitchOutRemove(p, game, ()=>{ onBothRemoved && onBothRemoved(); });
  }
}
