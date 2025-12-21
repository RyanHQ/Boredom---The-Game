

````markdown
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

**Option A (VS Code)**
1. Install the “Live Server” extension  
2. Right-click `index.html` → **Open with Live Server**

**Option B (Python 3)**
```bash
python -m http.server 8000
# then open http://localhost:8000
````

---

## Project Structure 

```
index.html
styles/
  main.css
src/
  main.js           # boot + game loop
  config.js         # tunable constants (physics, UI, etc.)
  state.js          # shared runtime state
  fx.js             # effects (glitch, burst, doorway)
  input.js          # keyboard handling
  LevelManager.js   # loads JSON levels, builds DOM
  entities/         # Player, future entities
  systems/          # Movement, Collision, Clamp, Erase
  ui/               # dialogue (center box), HUD
  data/             # dialogue lines (spoiler-light)
  levels/           # level1.json, level2.json (data-driven)
tests/
  manual.md         # quick checklist to sanity-test changes
docs/
  LEVEL_SCHEMA.md   # how level JSON is parsed (tokens, fields)
```

* Data-driven **levels** (JSON)
* Frame-rate independent **physics** (dt-based)
* Modular **systems** (easy to tune/swap)

---

## Debug / Dev Aids

* **HUD:** press **F1** to toggle (FPS, dt, positions, platforms)
* **Hotkeys:**

  * **R** = reset current level
  * **E** = toggle eraser
  * **[ / ]** = cycle levels *(dev mode only)*

> Hidden dev mode exists for local testing.

---

## Testing

* Manual checklist: **[tests/manual.md](tests/manual.md)**
* Level schema: **[docs/LEVEL_SCHEMA.md](docs/LEVEL_SCHEMA.md)**

---

## Versioning

Tagged snapshots mark stable points. Example flow:

1. Commit your changes to `main`.
2. **Releases → Draft a new release**

   * Tag: `v0.3.1-pre1` (or similar)
   * Target: `main`
   * Publish

Changelog: **[CHANGELOG.md](CHANGELOG.md)**

---

## Troubleshooting

* **White page / nothing moves** → You’re likely opening files directly. Run a local server.
* **404 on modules/JSON** → Check relative paths (e.g., `./src/ui/dialogue.js`, `./src/levels/level1.json`).
* **Laggy movement** → Keep the tab focused; browsers throttle background tabs.
* **Reset during dialogue/FX** → Reset cancels active sequences and restarts timers by design.

---

## Contributing

Bug reports and PRs welcome. Keep issue titles specific (e.g.,
“Dialogue box doesn’t cancel on reset while level auto-resets”).

* Bug template included (opens when creating a new issue)
* PR template with checklist (run the manual tests before merging)

---

## License

**Boredom Evaluation License 1.0 (LicenseRef-Boredom-Eval)**
Use is limited to **local, non-commercial testing and bug reports**.
**Not permitted:** redistribution, derivatives, public hosting, commercial use, or ML training.

For other permissions, contact the author.

---

## Credits

Developed by **Crype** · UiTM
© 2025

```
```
