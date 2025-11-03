# Manual Test Checklist — Boredom v0.3.x

Run from a local server. Do all steps on Level 1 unless stated.

## Core Controls
- [ ] P1 moves with A/D, jumps W
- [ ] P2 moves with ←/→, jumps ↑
- [ ] Clamp: neither player leaves screen bounds

## Platforms (drag & collide)
- [ ] Drag a square under a falling player — they land during drag (no pass-through)
- [ ] Drop multiple shapes; collision remains stable
- [ ] Eraser removes a placed platform (floor unaffected)

## Dialogue & Reset
- [ ] Main (green) dialogue appears ~15s after load on L1
- [ ] Press **Reset** during typing → dialogue stops immediately
- [ ] After reset, dialogue timer restarts (appears again ~15s)

## Erase Flow
- [ ] Each click shows a brief glitch and reduces opacity by 10%
- [ ] On 4th click: player stays at 60% with constant glitch
- [ ] On 5th click: glitch-out animation; player is removed
- [ ] Only when **both** are erased → world glitch + light burst → auto reset

## Doorway (Level 1)
- [ ] Doorway spawns after main dialogue sequence
- [ ] Enter door: doorway does grayscale/vibration glitch; player absorbs
- [ ] Only when **both** players absorbed → Level 2 loads

## Level 2
- [ ] Players spawn white & glowing → fade to colors
- [ ] “LEVEL 2” title shows and fades after a few seconds
- [ ] No Level 1 dialogue or doorway on Level 2

## HUD / Hotkeys / Dev
- [ ] **F1** toggles HUD (FPS, dt, coords, platforms)
- [ ] **E** toggles eraser
- [ ] **R** resets current level
- [ ] Dev Mode: click “Boredom: Pre-Alpha” 5× → “Level” button appears
- [ ] Level picker switches between L1/L2; picker closes after choosing

## Regression Guards
- [ ] After several resets + auto-resets, players never start with residual opacity or glitch classes
- [ ] Guides follow player heads after any reset
