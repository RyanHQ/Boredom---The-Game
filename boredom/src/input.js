export const keys = {};
export function initInput(){
  document.addEventListener('keydown', e=>keys[e.key]=true);
  document.addEventListener('keyup',   e=>keys[e.key]=false);
}
