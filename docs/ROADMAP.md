# ROADMAP
This document outlines upcoming changes for post-jam releases.

## Planned versions
See [the latest roadmap update](https://shiftbacktick.io/sea/devlogs/2021/06/21/roadmap-update.html) to learn more.

## v1.5.0
- Surface geometry improvements
- Cave geometry rewrite
- Floor geometry rewrite
- Floor proximity / cave enterance cues
- Treasure occlusion
- Investigate getting stuck at surface when jumping at lower velocities

## Known issues

## Wishlist
### Audio
- Dynamic range presets
- Miscellaneous submixes with volume sliders for collisions, engine, scanner, treasure

### Graphics
- Godrays
- Shooting stars

### Plot
- Abandoned alien labs
  - Spawned more frequently at lower depths
  - Octahedrons generated in deep caves
  - Scanned points are computer sounds
  - High frequency of treasure
  - Unique loot table, specific alien technologies, terraforming devices and rare weapons
- Collectible data logs, letters and reports
  - New Logs screen
  - Logs represent key moments in the lore through creative writing pieces
  - Nonlinear: unlocked chronologically and chosen randomly from a weighted pool
  - Resets progress with each new game
- Crashed alien spaceships
  - Spawned more frequently at higher depths
  - Ovoid or disc, different classes, up to kilometers in scale
  - Carve out tunnels from center to ocean floor
  - Entrance on underside (not guaranteed to be accessible)
  - Perfectly geometric corridors inside
  - Unique loot table, specific alien artifacts
- New game sound (jet flying away)
  - Procedural jets over time
- Unlockable alien technologies
  - Ability to freeze time
  - Jump jets

<details>
  <summary>Ultimate Spoiler Warning</summary>
  <ul>
    <li>Aliens wanted to peacefully immigrate to Earth.</li>
    <li>Alien leaders established a secret base on Earth.</li>
  </ul>
</details>

### Quality of Life
- Cave entrance cues (breadcrumbs spawned when reverb change detected)

### Simulation
- Add depth-based probabilities and ranges to treasures (e.g. human junk versus dinosaur bones)
- Light levels influenced by cloud cover
- Moon phases
- Surface weather patterns
  - Clouds
  - Weather patterns (rain, storm)

### Treasure
- Rework gallery interfaces
- Consider whether treasures should be broken into raw materials that have uses beyond score

### User interface
- Improve screen transitions
- Improve treasure gallery

### World generation
- Biomes
  - Scanned points can be different props determined by noise fields
  - Represented graphically with a range of saturation levels (i.e. albedo)
  - Different musical colors, patterns (aleotoric, step melody), or behaviors entirely
  - Polyrhythm biome
    - Each prop can be of three rhythmic layers selected by a 3d noise field
    - Each prop subscirbes to a timer which emits a regular pulse
    - Each prop has a percussive sound that fires a number of times each pulse
    - Props are grouped into one of three pulse rates
      - 1 or 2 times per pulse (determined by a 3d noise field)
      - 3 times per pulse
      - 5 or 7 times per pulse (determined by a 3d noise field)
    - Notes selected from noise fields representing melodic ostinatos
- Cavern generation
  - Perlin worms carve tunnels out from the terrain
    - Octree stores points with data like radius
    - Points are generated at 1/Nm intervals
    - Start at floor and travel for random distance
  - Collision detection: is within Nm cube of closest point
  - Guaranteed treasures

### Miscellaneous
- Photograph mode, or pseudo-bookmarks

### Chores
- Refactor app state management (e.g. how audio fades, scenes load) for clarity
- Refactor controls handling to be more reusable across screens
- Refactor fast travel as content system rather than an app save/load
- Refactor app settings to be more maintainable
- Create app achievements/unlocks system to better track some hidden UI elements
