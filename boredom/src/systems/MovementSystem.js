import { physics } from '../config.js';

export function MovementSystem(p, keys, dt){
  if(p.removed) return;

  const left  = (p.id==='player1') ? keys.a : keys.ArrowLeft;
  const right = (p.id==='player1') ? keys.d : keys.ArrowRight;
  const jump  = (p.id==='player1') ? keys.w : keys.ArrowUp;

  if(left)  p.x -= physics.moveSpeed * dt;
  if(right) p.x += physics.moveSpeed * dt;
  if(jump && p.onGround){ p.vy = -physics.jumpForce; p.onGround=false; }

  p.vy += physics.gravity * dt;
  p.y  += p.vy * dt;
}
