export const physics = {
  playerSize: 50,
  gravity: 2600,     // px/s^2
  moveSpeed: 260,    // px/s
  jumpForce: 820,    // px/s
  floorHeight: 100,
  maxDt: 0.033       // ~30 FPS cap for stability
};

export const erase = {
  clicksToErase: 5,
  permaGlitchAt: 4,
  minOpacity: 0.6,
  step: 0.1,
  shortGlitchMs: 240
};

export const ui = {
  dialogueDelayMs: 15000,
  dialogueTypeMs: 80
};

export const borders = { clampToViewport: true };
export const flags = { debug: false };
