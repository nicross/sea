# ROADMAP
This document outlines upcoming changes for post-jam releases.

## Planned versions
## v1.4.0 - Festival update
- Documentation
  - Graphical description of surface
  - Performance notes
  - Photosensitivity warning
  - Reword sections based on current marketing

## v1.5.0 - Life update
- Aquatic life
  - Dolphins
  - Gulls
  - Whales
- Basic biome generation
  - Aleotoric
  - Caves (indicate worm caves)
  - Drone
  - Pebble (scanner-like)
  - Tremolo
- Perlin worm caves
- Underwater music enhancements
  - More colors
  - More oscillators
  - More triads

## v1.6.0 - Redacted update
- ???

## v2.0.0 - Gold update
- ???

## Known issues
- Improve collision detection to prevent getting stuck in terrain
- Improve mouse look, perhaps independent from craft physics
- Treasure causes unstable BiquadFilterNode (audio recovers after approximately 4 seconds)

## Wishlist
### Audio
- Dynamic range presets
- Haptic feedback on certain cues (e.g. collisions with surface and terrain)
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

<details>
  <summary>Ultimate Spoiler Warning</summary>
  <ul>
    <li>Aliens wanted to peacefully immigrate to Earth.</li>
    <li>Alien leaders established a secret base on Earth.</li>
    <li>Convert UXO archetype to munitions, add Resistance side (more prevalent at lower depths) and more nouns.</li>
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
- Settings for fixed time of day or dynamic with speeds

### User interface
- Improve screen transitions
- Improve treasure gallery

### World generation
- Biomes
  - Scanned points can be different props determined by noise fields
  - Represented graphically with a range of saturation levels (i.e. albedo)
  - Different musical colors, patterns (aleotoric, step melody), or behaviors entirely
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
- Performance optimizations
- Refactor app state management (e.g. how audio fades, scenes load) for clarity
- Refactor controls handling to be more reusable across screens
- Refactor fast travel as content system
- Rename content.system.* as content.*
