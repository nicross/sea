# ROADMAP
This document outlines upcoming changes for post-jam releases leading up to the full Steam release.

## Planned versions
See [the latest roadmap update](https://shiftbacktick.io/sea/devlogs/2021/06/21/roadmap-update.html) to learn more.

### v1.5.x
- Vehicle UI audio slider
- Move treasure melody to music bus
- Manual improvements

#### Known issues
- Treasure spawn audio crashes, less frequent after 75bb93b
- HUD fades get stuck at >0% opacity
- Tracers performance degredation
- Surface culling overly conservative when looking up near tidal waves

### v1.6.0: Life update
TBD

### v1.7.0: Redacted update
TBD

### v2.0.0: Gold update
TBD

## Wishlist
### Audio
- Dynamic range presets
- Miscellaneous submixes with volume sliders for collisions, engine, scanner, treasure

### Economy
- Depth-based probabilities and ranges to treasures (e.g. human junk versus dinosaur bones)
- Better loot tables farther away from and at end of caves
- Break down treasure into components
- Sell treasure for gold
- Crafting menu with inventory, materials, and upgrades screens
- Upgrades
  - Upgrade tracks have multiple levels with increasing bonuses
  - Levels increase in material and gold rarity and costs
  - Upgrades can have prerequisits
  - Tracks
    - Jump Jets (press ascend on surface / descend in air)
      - Vectors (control jet direction)
      - Intakes (more fuel / faster recharge)
    - Temporal Drives (press and hold button to slow time by that amount, increased levels )
    - Attractors (passive treasure magnetism)
    - RCS Thrusters (turn / stop mid-air)
    - Stabilizers (press descend on floor to switch to a driving movement model)
    - Engines (increase underwater acceleration / speed)

### Graphics
- Scan animations
- Godrays by day
- Shooting stars by night
- Exploration node radius animations
- Full WebGL refactor

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

### Simulation
- Life
  - Dolphins that can be befriended
  - Fish that can be chased
  - Gulls that fly overhead
  - Whales that sing
- Moon phases that affect the darkness of night
- Surface weather patterns
  - Clouds
  - Weather patterns (rain, storm)
  - Light levels affected by clouds

### User interface
- Improve screen transitions
- Improve treasure gallery / crafting and materials screens

### World generation
- Biomes
  - Scanned points can be different props determined by noise fields
  - Props have different textures, durations, and behaviors
  - Specifics TBD

### Miscellaneous
- Photograph mode, or pseudo-bookmarks

### Technical debt
- Refactor app state management (e.g. how audio fades, scenes load) for clarity
- Refactor controls handling to be more reusable across screens
- Refactor fast travel as content system rather than an app save/load to reduce state resets
- Refactor app settings to be more maintainable, e.g. separate files for each setting
- Refactor haptic feedback to handle overlapping events
- Create app achievements/unlocks system to better track some hidden UI elements
