import { borders } from '../config.js';

export function ClampSystem(p, game){
  if(!borders.clampToViewport || p.removed) return;
  const maxX = game.clientWidth  - p.size;
  const maxY = game.clientHeight - p.size;

  if(p.x < 0) p.x = 0;
  if(p.x > maxX) p.x = maxX;
  if(p.y < 0){ p.y = 0; if(p.vy < 0) p.vy = 0; }
  if(p.y > maxY){ p.y = maxY; if(p.vy > 0) p.vy = 0; }
}
