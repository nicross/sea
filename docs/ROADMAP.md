# ROADMAP
This document outlines upcoming changes for post-jam releases.

## Planned versions
## v1.3.0 - Night update
- Compass cue volume slider
- Correlate more things to day/night cycle
  - Tides
    - cycling multiplier for wave height
    - mixes in tidal waves (low frequency, high amplitude, narrow peaks)
- Reveal certain menu things when no treasure collected but one is spawned

## v1.4.0 - Life update
- Aquatic life
  - Dolphins
  - Gulls
  - Whales
- Basic biome generation
  - Aleotoric
  - Drone
  - Pebble (scanner-like)
  - Tremolo
- Underwater music enhancements
  - More colors
  - More oscillators
  - More triads

## Known issues
- Improve collision detection to prevent getting stuck in terrain
- Improve mouse look, perhaps independent from craft physics
- Treasure causes unstable BiquadFilterNode (audio recovers after approximately 4 seconds)

## Wishlist
### Audio
- Dynamic range presets
- Game paused volume slider
- Haptic feedback on certain cues (e.g. collisions with surface and terrain)

### Graphics
- Procedural night skybox
- Respect motion blur setting on surface

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

### World generation
- Biomes
  - Scanned points can be different props determined by noise fields
  - Represented graphically with a range of saturation levels (i.e. albedo)
  - Different musical colors, patterns (aleotoric, step melody), or behaviors entirely

### Miscellaneous
- Photograph mode, or pseudo-bookmarks
