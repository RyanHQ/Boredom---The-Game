# Level Schema (short)



Levels are JSON files at `src/levels/levelN.json`.

```json
{
  "name": "Alpha Training",
  "spawn": {
    "player1": { "x": 200, "y": 0, "color": "red" },
    "player2": { "x": 600, "y": 0, "color": "blue" }
  },
  "platforms": [
    { "id": "floor", "x": 0, "y": "bottom-100", "w": "100vw", "h": 100 },
    { "x": 300, "y": 420, "w": 120, "h": 20 },
    { "x": 520, "y": 300, "w": 80,  "h": 20 }
  ],
  "guides": {
    "p1": "W/A/D: Move & Jump",
    "p2": "Arrow keys: Move & Jump",
    "palette": "Drag shapes to place platforms. Click eraser to remove. Reset to restart."
  }
}

## Parser rules (LevelManager)

- Strings ending with `vw` → `game.clientWidth * (value/100)`
- `bottom-N` → `game.clientHeight - N`
- Unknown fields are ignored (forward compatible)
