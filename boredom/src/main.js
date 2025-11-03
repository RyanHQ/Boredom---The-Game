import { physics } from './config.js';
import { initInput, keys } from './input.js';
import { LevelManager } from './LevelManager.js';
import { Player } from './entities/Player.js';
import { MovementSystem } from './systems/MovementSystem.js';
import { CollisionSystem, CollidePlayers } from './systems/CollisionSystem.js';
import { ClampSystem } from './systems/ClampSystem.js';
import { EraseSystem } from './systems/EraseSystem.js';
import { startMainDialogue, resetMainDialogue } from './ui/dialogue.js';
import {
  worldGlitchOn, worldGlitchOff, playLightBurst, stopWorldEffects,
  doorwayGlitchOn, doorwayGlitchOff, absorbPlayerIntoDoorway
} from './fx.js';
import { state } from './state.js';

const game    = document.getElementById('game');
const floorEl = document.getElementById('floor');
const p1Guide = document.getElementById('player1Guide');
const p2Guide = document.getElementById('player2Guide');
const paletteGuide = document.getElementById('paletteGuide');
const footerLeft = document.getElementById('footerLeft');

/* Bump footer version */
if (footerLeft) footerLeft.textContent = 'Boredom: Pre-Alpha 0.3';

initInput();

/* ---------------- Core state ---------------- */
let eraserMode = false;
let endSequenceActive = false;
let endSeqId = 0;
let currentLevel = 1;

// doorway (level 1)
let doorwayEl = null;
let absorbed = { p1:false, p2:false };

/* -------------- Developer mode (hidden) -------------- */
let devClickCount = 0;
let devMode = false;
let devBannerEl = null;
let devLevelBtn = null;
let levelPickerEl = null;

/* -------------- One-time UI binding guard -------------- */
let uiBound = false;
let onGameClickHandler = null;   // keep refs to avoid duplicates
let onResizeHandler = null;

const LM = new LevelManager(game);
await loadLevel(1);

/* ---------------- Level loading ---------------- */
async function loadLevel(index){
  currentLevel = index;
  await LM.load(`./src/levels/level${index}.json`);
  setupLevel(LM.current);
}

/* Make sure player element exists (it may be removed on erase/absorb) */
function ensurePlayerEl(id, color){
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('div');
    el.id = id;
    el.className = 'player';
    el.style.background = color;
    game.appendChild(el);
  }
  return el;
}

/* Hard reset of a player's DOM visual state */
function resetPlayerVisual(el, color){
  el.classList.remove('perma-glitch','glitch-out','glitch','pulse');
  el.style.opacity = '';
  el.style.visibility = 'visible';
  el.style.boxShadow = '';
  el.style.filter = '';
  el.style.transform = '';
  el.style.background = color; // ensure visible color is applied
}

function setupLevel(level){
  // clear & rebuild level geometry
  LM.clearDynamicPlatforms();
  LM.buildDOMFromLevel(level);

  // ensure player nodes exist and reset visuals every time
  const p1El = ensurePlayerEl('player1', level.spawn.player1.color);
  const p2El = ensurePlayerEl('player2', level.spawn.player2.color);
  resetPlayerVisual(p1El, level.spawn.player1.color);
  resetPlayerVisual(p2El, level.spawn.player2.color);

  // fresh Player models (fully reset gameplay flags)
  const p1 = new Player({ id:'player1', el:p1El, color: level.spawn.player1.color, x: level.spawn.player1.x, y: level.spawn.player1.y });
  const p2 = new Player({ id:'player2', el:p2El, color: level.spawn.player2.color, x: level.spawn.player2.x, y: level.spawn.player2.y });
  // make sure runtime flags are pristine
  [p1,p2].forEach(p=>{
    p.clicks = 0;
    p.erased = false;
    p.removed = false;
    p.onGround = false;
    p.vy = 0;
  });
  state.players = [p1, p2];

  // platforms list (floor + dynamics)
  state.platforms = [floorEl, ...Array.from(document.querySelectorAll('#game .platform'))];

  // bind UI once
  bindUIOnce();

  // per-level hooks
  if (currentLevel === 1) {
    window.addEventListener('boredom:dialogue-complete', onDialogueCompleteOnce, { once:true });
    startMainDialogue(state.players);
  } else {
    resetMainDialogue(state.players);
    removeDoorway();
    spawnColorEffect(state.players);    // white → color on L2 start
    showLevelBanner('LEVEL 2');
  }

  // layout & resize
  updateFloorAndBounds();
  if (onResizeHandler) window.removeEventListener('resize', onResizeHandler);
  onResizeHandler = ()=>{
    updateFloorAndBounds();
    state.players.forEach(p=>ClampSystem(p, game));
    if (doorwayEl && currentLevel === 1) positionDoorway();
  };
  window.addEventListener('resize', onResizeHandler);

  // guide fades
  setTimeout(()=>{ p1Guide.classList.add('fade-out'); p2Guide.classList.add('fade-out');
    setTimeout(()=>{ p1Guide.style.display='none'; p2Guide.style.display='none'; }, 1000);
  }, 5000);
  setTimeout(()=>{ paletteGuide.classList.add('fade-out'); setTimeout(()=>{ paletteGuide.style.display='none'; }, 1000); }, 7000);

  // keep dev UI if enabled
  if (devMode) ensureDevUI();

  // ensure starting mode sane
  eraserMode = false;
}

/* -------------- Bind UI only once -------------- */
function bindUIOnce(){
  if (uiBound) return;
  uiBound = true;

  const palette=document.getElementById('palette');
  const eraserBtn=document.getElementById('eraserBtn');
  const resetBtn=document.getElementById('resetBtn');

  // palette drag (collides while dragging)
  palette.querySelectorAll('.shape').forEach(shape=>{
    shape.addEventListener('mousedown', e=>{
      if(eraserMode) return;

      const w=parseInt(shape.dataset.width,10), h=parseInt(shape.dataset.height,10);
      const el=document.createElement('div'); el.className='platform'; el.style.width=w+'px'; el.style.height=h+'px'; game.appendChild(el);

      state.platforms.push(el);
      const offX=w/2, offY=h/2;

      const move=(ev)=>{
        const r=game.getBoundingClientRect();
        const x=ev.clientX-r.left-offX, y=ev.clientY-r.top-offY;
        el.style.left=x+'px'; el.style.top=y+'px';
      };
      const up=()=>{
        document.removeEventListener('mousemove',move);
        document.removeEventListener('mouseup',up);
      };
      document.addEventListener('mousemove',move);
      document.addEventListener('mouseup',up);
    });
  });

  eraserBtn.addEventListener('click', ()=>{
    eraserMode=!eraserMode;
    eraserBtn.classList.toggle('eraser-active',eraserMode);
  });

  resetBtn.addEventListener('click', async ()=>{
    // stop any ongoing sequences
    endSeqId++; endSequenceActive=false;
    stopWorldEffects(game);
    resetMainDialogue(state.players);
    removeDoorway();
    await resetLevel(); // reload current level
  });

  // global game click for erasing & platform removal — attach ONCE
  onGameClickHandler = (e)=>{
    if(!eraserMode) return;
    const t=e.target;

    // remove dynamic platforms (keep floor)
    if(t.classList.contains('platform') && t!==floorEl){
      const i=state.platforms.indexOf(t);
      if(i!==-1) state.platforms.splice(i,1);
      t.remove();
    }

    // 5-click erase system
    for(const p of state.players){
      if(t===p.el) EraseSystem(p, t, game, bothRemovedCheck);
    }
  };
  game.addEventListener('click', onGameClickHandler);

  // hidden dev mode trigger
  if (footerLeft) {
    footerLeft.addEventListener('click', ()=>{
      if (devMode) return;
      devClickCount++;
      if (devClickCount >= 5) {
        devMode = true;
        ensureDevUI();
      }
    });
  }
}

/* ---------------- End sequence (both erased) ---------------- */
function bothRemovedCheck(){
  if(state.players.every(p=>p.removed)){
    if (endSequenceActive) return true;
    endSequenceActive = true;

    resetMainDialogue(state.players);
    removeDoorway();

    worldGlitchOn(game);
    const myId = ++endSeqId;

    playLightBurst().then(async ()=>{
      if (myId !== endSeqId) return;
      worldGlitchOff(game);
      endSequenceActive = false;
      await resetLevel();                 // reset CURRENT level
    });

    return true;
  }
  return false;
}

/* ---------------- Doorway (Level 1 only) ---------------- */
function onDialogueCompleteOnce(){
  if (currentLevel !== 1) return;
  spawnDoorway();
}

function spawnDoorway(){
  removeDoorway(); // safety

  doorwayEl = document.createElement('div');
  doorwayEl.id = 'doorway';
  doorwayEl.style.position = 'absolute';
  doorwayEl.style.width = '80px';
  doorwayEl.style.height = '140px';
  doorwayEl.style.background = '#ffffff';
  doorwayEl.style.border = '1px solid rgba(255,255,255,0.7)';
  doorwayEl.style.boxShadow = '0 0 20px rgba(255,255,255,0.95), 0 0 40px rgba(255,255,255,0.35)';
  doorwayEl.style.borderRadius = '6px';
  doorwayEl.style.pointerEvents = 'none';
  doorwayEl.style.zIndex = '40';
  game.appendChild(doorwayEl);

  positionDoorway();
  absorbed = { p1:false, p2:false };
}

function positionDoorway(){
  if (!doorwayEl) return;
  const inset = 80;
  const w = parseFloat(doorwayEl.style.width)||80;
  doorwayEl.style.left = (game.clientWidth - inset - w) + 'px';
  doorwayEl.style.top  = (inset) + 'px';
}

function removeDoorway(){
  if (doorwayEl){
    if (doorwayEl._doorwayAnim) { try{ doorwayEl._doorwayAnim.cancel(); }catch{} doorwayEl._doorwayAnim = null; }
    doorwayEl.style.transform=''; doorwayEl.style.filter='';
    if (game.contains(doorwayEl)) doorwayEl.remove();
    doorwayEl = null;
  }
  absorbed = { p1:false, p2:false };
}

function handleDoorwayAbsorb(){
  if (currentLevel !== 1 || !doorwayEl) return;

  const dx = parseFloat(doorwayEl.style.left)||0;
  const dy = parseFloat(doorwayEl.style.top)||0;
  const dw = parseFloat(doorwayEl.style.width)||80;
  const dh = parseFloat(doorwayEl.style.height)||140;

  const [p1, p2] = state.players;

  for (const p of [p1, p2]){
    if (!p || p.removed) continue;
    const s = p.size;
    const overlap = !(p.x + s < dx || p.x > dx + dw || p.y + s < dy || p.y > dy + dh);
    if (overlap){
      if (!doorwayEl._doorwayAnim) doorwayEl._doorwayAnim = doorwayGlitchOn(doorwayEl);
      try {
        doorwayEl.animate([
          { filter:'contrast(180%) brightness(130%)' },
          { filter:'contrast(260%) brightness(160%)' },
          { filter:'contrast(180%) brightness(130%)' }
        ], { duration:240, easing:'steps(2,end)' });
      } catch {}

      if (p.id === 'player1' && !absorbed.p1){
        absorbed.p1 = true;
        absorbPlayerIntoDoorway(p, doorwayEl, game, checkBothAbsorbed);
      } else if (p.id === 'player2' && !absorbed.p2){
        absorbed.p2 = true;
        absorbPlayerIntoDoorway(p, doorwayEl, game, checkBothAbsorbed);
      }
    }
  }
}

function checkBothAbsorbed(){
  if (absorbed.p1 && absorbed.p2){
    advanceToLevel(2);
  }
}

async function advanceToLevel(index){
  removeDoorway();
  await loadLevel(index);
  spawnColorEffect(state.players);
}

/* ---------------- Spawn FX (white glow -> color) ---------------- */
function spawnColorEffect(players){
  players.forEach(p=>{
    p.el.style.background = '#ffffff';
    p.el.style.boxShadow = '0 0 20px rgba(255,255,255,0.9)';
  });
  setTimeout(()=>{
    players.forEach(p=>{
      p.el.style.background = p.color || p.el.style.background;
      p.el.style.boxShadow = '';
      p.el.animate([
        { filter:'brightness(130%)' },
        { filter:'brightness(100%)' }
      ], { duration:300, easing:'ease-out' });
    });
  }, 800);
}

/* ---------------- Level 2 Title Banner ---------------- */
function showLevelBanner(text){
  const old = document.getElementById('levelTitle');
  if (old) old.remove();

  const el = document.createElement('div');
  el.id = 'levelTitle';
  el.className = 'level-title level-glitch';
  el.textContent = text;
  game.appendChild(el);

  setTimeout(()=>{
    el.classList.add('level-fade');
    setTimeout(()=>{ el.remove(); }, 1000);
  }, 4000);
}

/* ---------------- Reset helpers ---------------- */
async function resetLevel(){
  await loadLevel(currentLevel);
}

function updateFloorAndBounds(){
  floorEl.style.left='0px';
  floorEl.style.top=(game.clientHeight-physics.floorHeight)+'px';
  floorEl.style.width=game.clientWidth+'px';
  floorEl.style.height=physics.floorHeight+'px';
}

/* ---------------- Guides follow players ---------------- */
function updateGuides(){
  const size=physics.playerSize;
  const [p1,p2]=state.players;
  if(p1 && !p1.removed){
    p1Guide.style.left=(p1.x+size/2)+'px';
    p1Guide.style.top=(p1.y-10)+'px';
    p1Guide.style.transform='translate(-50%,-100%)';
  }
  if(p2 && !p2.removed){
    p2Guide.style.left=(p2.x+size/2)+'px';
    p2Guide.style.top=(p2.y-10)+'px';
    p2Guide.style.transform='translate(-50%,-100%)';
  }
}

/* ---------------- Hidden Developer Mode ---------------- */
if (footerLeft) {
  footerLeft.addEventListener('click', ()=>{
    if (devMode) return;
    devClickCount++;
    if (devClickCount >= 5) {
      devMode = true;
      ensureDevUI();
    }
  });
}

function ensureDevUI(){
  if (!devBannerEl){
    devBannerEl = document.createElement('div');
    devBannerEl.textContent = "You're on developer mode.";
    Object.assign(devBannerEl.style, {
      position:'absolute', bottom:'26px', left:'10px',
      color:'#fff', fontSize:'13px', opacity:'0.8', zIndex:'90'
    });
    game.appendChild(devBannerEl);
  }
  if (!devLevelBtn){
    devLevelBtn = document.createElement('button');
    devLevelBtn.textContent = 'Level';
    Object.assign(devLevelBtn.style, {
      position:'absolute', bottom:'8px', left:'50%', transform:'translateX(-50%)',
      background:'#2e7d32', color:'#fff', border:'none',
      padding:'6px 12px', borderRadius:'6px', fontSize:'14px',
      boxShadow:'0 2px 6px rgba(0,0,0,0.3)', zIndex:'95', cursor:'pointer'
    });
    devLevelBtn.onclick = openLevelPicker;
    game.appendChild(devLevelBtn);
  }
}

function openLevelPicker(){
  if (levelPickerEl){ levelPickerEl.remove(); levelPickerEl=null; }
  levelPickerEl = document.createElement('div');
  Object.assign(levelPickerEl.style, {
    position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)',
    background:'rgba(0,0,0,0.85)', color:'#fff',
    padding:'16px', border:'1px solid #4caf50', borderRadius:'10px',
    zIndex:'100', display:'grid', gap:'10px', minWidth:'260px',
    boxShadow:'0 8px 24px rgba(0,0,0,0.6)', textAlign:'center'
  });

  const title = document.createElement('div');
  title.textContent = 'Pick Level';
  title.style.fontWeight = '700';
  title.style.marginBottom = '6px';
  levelPickerEl.appendChild(title);

  const btn1 = document.createElement('button');
  btn1.textContent = 'Level 1 (Story)';
  Object.assign(btn1.style, commonPickBtnStyle());
  btn1.onclick = async ()=>{
    levelPickerEl.remove(); levelPickerEl=null;
    await loadLevel(1);
  };

  const btn2 = document.createElement('button');
  btn2.textContent = 'Level 2 (Empty Test)';
  Object.assign(btn2.style, commonPickBtnStyle());
  btn2.onclick = async ()=>{
    levelPickerEl.remove(); levelPickerEl=null;
    await loadLevel(2);
  };

  levelPickerEl.appendChild(btn1);
  levelPickerEl.appendChild(btn2);
  game.appendChild(levelPickerEl);
}

function commonPickBtnStyle(){
  return {
    background:'#1b5e20', color:'#fff', border:'none', borderRadius:'6px',
    padding:'8px 12px', cursor:'pointer', fontSize:'14px',
    boxShadow:'0 2px 6px rgba(0,0,0,0.35)'
  };
}

/* ---------------- Game Loop ---------------- */
let last=performance.now();
function loop(now){
  const dt=Math.min(physics.maxDt,(now-last)/1000); last=now;

  for(const p of state.players){
    MovementSystem(p, keys, dt);
    CollisionSystem(p, state.platforms);
    ClampSystem(p, game);
  }

  if(state.players.length===2){
    CollidePlayers(state.players[0], state.players[1]);
  }

  for(const p of state.players){
    if(!p.removed){
      p.el.style.left = p.x + 'px';
      p.el.style.top  = p.y + 'px';
    }
    if (p.dialogue) {
      const size = physics.playerSize;
      p.dialogue.style.left = (p.x + size/2) + 'px';
      p.dialogue.style.top  = (p.y - 16) + 'px';
      p.dialogue.style.transform = 'translate(-50%, -100%)';
    }
  }

  handleDoorwayAbsorb(); // level 1 only

  updateGuides();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
