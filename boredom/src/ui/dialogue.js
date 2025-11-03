/*!
 * Boredom — Copyright (c) 2025 Crype
 * Licensed under Boredom Evaluation License 1.0 (LicenseRef-Boredom-Eval).
 * Allowed: local non-commercial testing and bug reporting only.
 * Forbidden: redistribution, derivatives, public hosting, commercial use, ML training.
 */


import { mainDialogues, playerLines } from '../data/dialogues.js';
import { ui } from '../config.js';

/*
  Hardened dialogue system
  - Idempotent start (won’t double-run)
  - All timers cancelable via a monotonic runId
  - Safe player glitch toggles (null/DOM checks)
  - Resilient event dispatch for older browsers
  - Extra helpers: isMainDialogueActive(), getMainDialogueStatus()
*/

let mainIdx = 0;
let started = false;

// Killable handles (kept for dev tools visibility)
let typingId = null;   // setInterval for typewriter
let delayId  = null;   // setTimeout before first dialogue
let holdId   = null;   // setTimeout holding a finished line on screen

// Monotonic run id so stale timeouts/intervals no-op after reset
let runId = 0;

// ---------- Internal utilities ----------

function safeGetBox() {
  return document.getElementById('dialogue');
}

function clearAllTimers() {
  if (delayId) { clearTimeout(delayId); delayId = null; }
  if (typingId){ clearInterval(typingId); typingId = null; }
  if (holdId)  { clearTimeout(holdId);   holdId = null; }
}

function setPlayersGlitch(players, on) {
  if (!players || !Array.isArray(players)) return;
  for (const p of players) {
    const el = p && p.el;
    if (!el || !el.classList) continue;
    if (on) el.classList.add('glitch');
    else    el.classList.remove('glitch');
  }
}

function dispatchDialogueComplete() {
  try {
    window.dispatchEvent(new CustomEvent('boredom:dialogue-complete'));
  } catch {
    // Older engines: fall back to simple Event (no detail)
    window.dispatchEvent(new Event('boredom:dialogue-complete'));
  }
}

// ---------- Public API ----------

/** Start the center green dialogue sequence (idempotent). */
export function startMainDialogue(players) {
  if (started) return;                 // already running
  started = true;

  const myRun = ++runId;               // capture run id for this start
  const box = safeGetBox();
  if (!box) {                          // if DOM missing, fail safe
    console.warn('[dialogue] #dialogue element not found.');
    return;
  }

  // Delay before first line
  delayId = setTimeout(() => {
    if (myRun !== runId) return;       // canceled in the meantime
    runNext(players, myRun, box);
  }, ui.dialogueDelayMs);
}

/** Hard stop any running dialogue + visual state. Safe to call anytime. */
export function resetMainDialogue(players = []) {
  // Cancel everything currently scheduled
  ++runId; // invalidate any in-flight callbacks
  clearAllTimers();

  // Hide & clear box
  const box = safeGetBox();
  if (box) { box.style.display = 'none'; box.textContent = ''; }

  // Remove any player glitch state
  setPlayersGlitch(players, false);

  // Reset counters/state
  mainIdx = 0;
  started = false;
}

/** Small speech box for player lines (anger/fear). */
export function speakLine(player){
  const lines = (player.color === 'red') ? playerLines.red : playerLines.blue;
  const idx   = Math.min(Math.max(player.clicks - 1, 0), lines.length - 1);
  const text  = lines[idx];

  // Guard for DOM presence
  const root = document.getElementById('game');
  if (!root) return;

  if (player.dialogue) player.dialogue.remove();
  const diag = document.createElement('div');
  diag.className = 'player-dialogue';
  diag.style.setProperty('--c', player.color);
  diag.innerText = text;
  root.appendChild(diag);
  player.dialogue = diag;

  setTimeout(()=>{
    if (diag) diag.remove();
    player.dialogue = null;
  }, 1800);
}

/** Read-only helpers (optional for other systems) */
export function isMainDialogueActive(){ return started; }
export function getMainDialogueStatus(){
  return { started, mainIdx, hasMore: mainIdx < mainDialogues.length };
}

// ---------- Internal runner ----------

function runNext(players, myRun, box) {
  if (myRun !== runId) return;             // canceled after reset

  if (mainIdx >= mainDialogues.length) {
    setPlayersGlitch(players, false);
    dispatchDialogueComplete();
    return;
  }

  // Prepare this line
  const text = mainDialogues[mainIdx] ?? '';
  box.style.display = 'block';
  box.textContent = '';

  // Players glitch while typing
  setPlayersGlitch(players, true);

  // Typewriter
  let i = 0;
  typingId = setInterval(() => {
    if (myRun !== runId) { clearInterval(typingId); typingId = null; return; }

    if (i < text.length) {
      box.textContent += text[i++];
    } else {
      clearInterval(typingId); typingId = null;

      // Hold the fully-typed line for ~4s
      holdId = setTimeout(() => {
        if (myRun !== runId) return;       // canceled after reset
        box.style.display = 'none';
        setPlayersGlitch(players, false);
        mainIdx += 1;

        // Immediately continue to the next line (no extra delay)
        runNext(players, myRun, box);
      }, 4000);
    }
  }, ui.dialogueTypeMs);
}

