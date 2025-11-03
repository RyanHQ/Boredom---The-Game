import { physics } from '../config.js';

export class Player{
  constructor({ id, el, color, x, y }){
    this.id=id; this.el=el; this.color=color;
    this.x=x; this.y=y; this.size=physics.playerSize;
    this.vy=0; this.onGround=false;
    this.clicks=0; this.erased=false; this.removed=false;
    this.dialogue=null;
  }
}
