# ROADMAP
This document outlines upcoming changes for post-jam releases.

## v1.1.0
- Add new game sound (jet flying away)
- Underwater raphics
  - Draw compass along top of screen
  - Draw circles around treasures (radius of treasure)
  - Draw arrows pointing to offscreen treasures
  - Settings toggle for treasure hints
  - Slider for adjusting HUD opacity
    - Optimization: At 0% opacity, skip drawing HUD
  - Fade out HUD after N seconds of inactivity
- Revisit surface for QA

## v1.2.0
- Aquatic life (gulls, whales, schools of fish)
- Cave entrance cues (breadcrumbs spawned when reverb change detected)
- Surface graphics
  - Procedural skybox
  - Water visualizer that responds to light level, weather, time of day
- Solid material generation
  - Scanned points can be different types of materials
  - Materials have their own sonic and visual properties, e.g. albedo (max opacity)
- Surface weather patterns (sun, rain, storms)
- Time of day
  - Sync surface glitter to time of day
  - Sync tides to time of day (max surface height)
