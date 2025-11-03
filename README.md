# Boredom (Pre-Alpha 0.3)

A tiny two-player sandbox prototype. Drag platforms, jump around, and… experiment.  
Built with vanilla JS (ES modules), HTML, and CSS.

> ⚠️ Pre-Alpha: systems are in flux; this is a playground, not a finished game.

---

## How to Play (No Spoilers)

- **Player 1:** `W` `A` `D` (move/jump)
- **Player 2:** Arrow Keys (move/jump)
- **Palette:** drag blocks into the world to build platforms
- **Eraser:** toggle, then click things to remove them
- **Reset:** reloads the current level

Some interactions are **discoverable**. If something feels weird… try it again. 🙂

---

## Run Locally

Because this uses ES modules and fetches JSON levels, run it with a static server:

**Option A (VS Code):**
1. Install the “Live Server” extension
2. Right-click `index.html` → **Open with Live Server**

**Option B (Python 3):**
```bash
Project Structure

index.html
styles/
  main.css
src/
  main.js           # boot + game loop
  config.js         # tunable constants
  state.js          # shared runtime state
  fx.js             # effects (glitch, burst, etc.)
  input.js          # keyboard handling
  LevelManager.js   # loads JSON levels, builds DOM
  entities/         # Player, future entities
  systems/          # Movement, Collision, Clamp, Erase
  ui/               # dialogue (center box), HUD bits
  data/             # dialogue lines
  levels/           # level1.json, level2.json

Data-driven levels (JSON)

Frame-rate independent physics (dt-based)

Modular systems (easy to swap/tune)

Features (kept vague to avoid spoilers)

Local two-player platforming

Drag-and-drop building blocks

An eraser with escalating feedback

Ambient UI dialogue that reacts to play

Small visual effects that ramp up under certain conditions

Versioning

This repo uses tags for stable points.

Current: Pre-Alpha 0.3

Create your own savepoints: v0.3.1, v0.3.2, …

If you’re experimenting, branch first, then PR or merge back when stable.

Troubleshooting

White page / nothing moves: you’re likely opening files directly. Run a local server.

404 on modules/JSON: check relative paths (e.g., ./src/ui/dialogue.js, ./src/levels/level1.json).

Laggy movement: keep the tab focused; dt is capped but background tabs throttle timers.

Contributing

Bug reports and PRs welcome. Please keep issue titles specific (e.g.,
“Dialogue box doesn’t cancel on reset while level auto-resets”).

Note: Some interactions are intentionally undisclosed here. Use spoiler tags in issues if needed.

Credits

Developed by Crype · UiTM
Copyright © 2025
python -m http.server 8000
# then open http://localhost:8000
