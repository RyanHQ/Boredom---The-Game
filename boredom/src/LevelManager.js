import { physics } from './config.js';

export class LevelManager {
  constructor(gameRoot){ this.root = gameRoot; this.current = null; }
  async load(jsonUrl){ const res = await fetch(jsonUrl); const data = await res.json(); this.current = data; return data; }

  resolveValue(v, root){
    if (typeof v === 'number') return v;
    if (typeof v === 'string'){
      if (v.endsWith('vw')) return root.clientWidth * (parseFloat(v)/100);
      if (v.startsWith('bottom-')){ const off = parseFloat(v.split('-')[1] || 0); return root.clientHeight - off; }
    }
    return v;
  }

  buildDOMFromLevel(level){
    const game = this.root;
    const floor = document.getElementById('floor');
    const fSpec = level.platforms.find(p=>p.id==='floor');
    const fy = this.resolveValue(fSpec?.y ?? (game.clientHeight - physics.floorHeight), game);
    floor.style.left = '0px';
    floor.style.top  = fy + 'px';
    floor.style.width  = game.clientWidth + 'px';
    floor.style.height = (fSpec?.h ?? physics.floorHeight) + 'px';
  }

  clearDynamicPlatforms(){
    document.querySelectorAll('#game .platform').forEach(el=>{ if(el.id!=='floor') el.remove(); });
  }
}
