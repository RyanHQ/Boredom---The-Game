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
python -m http.server 8000
# then open http://localhost:8000
