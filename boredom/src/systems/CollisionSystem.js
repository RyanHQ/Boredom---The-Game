// World/platform collisions
export function CollisionSystem(p, platforms){
  p.onGround = false;
  const s = p.size;

  for (const el of platforms){
    const x = parseFloat(el.style.left)||0;
    const y = parseFloat(el.style.top)||0;
    const w = parseFloat(el.style.width)||el.offsetWidth||0;
    const h = parseFloat(el.style.height)||el.offsetHeight||0;

    const ox=(p.x+s/2)-(x+w/2);
    const oy=(p.y+s/2)-(y+h/2);
    const hw=(s+w)/2, hh=(s+h)/2;

    if (Math.abs(ox)<hw && Math.abs(oy)<hh){
      const dx=hw-Math.abs(ox), dy=hh-Math.abs(oy);
      if (dx<dy){
        p.x += (ox>0?dx:-dx);
      }else{
        p.y += (oy>0?dy:-dy);
        if (oy<0){ p.vy=0; p.onGround=true; }
        else if (p.vy<0){ p.vy=0; }
      }
    }
  }
}

// Player–player collision
export function CollidePlayers(a, b){
  const s = a.size;
  const ox=(a.x+s/2)-(b.x+s/2);
  const oy=(a.y+s/2)-(b.y+s/2);
  const hw=(s+s)/2, hh=(s+s)/2;

  if (Math.abs(ox)<hw && Math.abs(oy)<hh){
    const dx=hw-Math.abs(ox), dy=hh-Math.abs(oy);
    if (dx<dy){
      const push=(ox>0?dx:-dx)/2; a.x+=push; b.x-=push;
    }else{
      const push=(oy>0?dy:-dy)/2; a.y+=push; b.y-=push;
      if (oy<0){ a.vy=0; a.onGround=true; } // a on top
      if (oy>0){ b.vy=0; b.onGround=true; } // b on top
    }
  }
}
