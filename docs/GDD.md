# S.E.A.
Atmospheric audio watercraft simulator

Stands for:
- Submersible Exploration Apparatus
- Submerge. Explore. Acquire.

## Goals
S.E.A. is a game within a game:
- A shallow motorboat experience with responsive controls and relaxing sounds
- An immersive underwater exploration experience with maze-like caves filled with treasure

## Controls
### Keyboard
- W/S to move forward or backward
- A/D to strafe
- Q/E to turn
- Shift to boost
- Space to ascend
- Ctrl to descend
- Space to scan
- ESC for menu
### Controller
- Primary stick to move
- Press either stick to boost
- Secondary stick to turn
- LB to descend
- RB to ascend
- A to scan
- Start/B for menu

## Menus
- Splash screen
- Main menu
  - Continue
  - New Game
  - Miscellaneous
  - Quit to Desktop
- Game menu
  - Return to Game
  - Status (hidden until underwayer discovered)
  - Miscellaneous
  - Exit to Main Menu
  - Quit to Desktop
- Status
  - Current Depth
  - Coordinates
  - Distance
- Miscellaneous
  - Gallery (hidden until treasure collected)
  - Statistics
  - Settings
  - Back
- Gallery
  - List of treasures (reverse chronological order)
  - Back
- Statistics
  - Time played
  - Distance traveled
  - Maximum depth (hidden until underwater discovered)
  - Maximum distance
  - Treasures collected (hidden until treasure collected)
- Settings
  - Dynamic Range
  - Master volume
  - Music volume
  - Back

## Zones
The game is divided into three zones:
- Surface
- Midwater
- Caves

### Surface
The surface zone is the sea level at which players start.
It extends infinitely in all directions without borders or obstacles.
It's characterized by evolving waves that produce different sounds.

Mechanics:
- The controls perform like a motorboat
- Players can catch air if at speed on the crest of a wave
- The surface is represented by 3D perlin noise (with Z-value being time)
- This controls the atmospheric sounds as well as friction while moving

### Midwater
The midwater zone is the transition between the surface and the caves.
It's first entered when the player experiments with the depth controls.
It's characterized by zero obstacles and a gradient of the surface sounds slowly disappearing.
Players will need to descend for an appreciable amount of time before they hit the floor and can discover cave openings.

Mechanics:
- Speed of sound switches to 1480 m/s
- Controls change such that strafing and scanning are allowed.
- Surface sounds get muffled with a filter, eventually to total silence
- The floor is represented by a 2D perlin height map with several octaves
- Players eventually hit the bottom and naturally search for openings
- Openings are the intersection of the floor with the cave generator
- Very rarely treasure is spawned directly on the floor (possibly the first time they encounter it)

### Caves
The caves zone is filled with maze-like tunnels that need to be scanned to navigate.
Deep within them are collectible artifacts that get added to the gallery.

Mechanics:
- The caves are represented by two 3D perlin noise fields
- The first field provides the value
- The second field provides the range
- When the value is within the range, the player can pass through that (x,y,z) point
- This yields different sizes and networks of spaces

## Other Mechanics
### Scanning
Scanning is a process of using multiple SONAR blasts to reconstruct physical space with audio cues.
It's most helpful when exploring caves.
If treasure is nearby, a scan will cause it to emit a persistent sound until it is collected.

Mechanics:
- When sonar is pulsed it emits ten tones that return back at specific delays
- Each tone is essentially a ray that calculates the distance to the closest wall at that depth

### Treasure
Occasionally players will encounter treasures that can be collected and added to a gallery.
The treasures are procedurally generated and persist in the gallery after new games are started.

Treasure characteristics:
- Name
- Weight
- Worth
- When
- Depth

Mechanics:
- Treasure is spawned uniformly in 3D chunks, some chunks having many and others having none
- Treasure is found while scanning and must be collided with to collect
- Treasure attributes are generated on collection

## Sound design
The sound design is the combination of a few layers:
- Movement sounds
- Surface sounds
- Scanning
- Treasure
- Soundtrack

### Movement sounds
Winding engine sounds are produced whenever the player moves.
At the surface level they are present and complimented with an air intake sound.
Below the surface they are filtered out and more of a pleasant hum.

At the surface, players will occasionally crash into waves.
Various white noise generators are triggered as needed to simulate this.

Below the surface, players may collide with the floor or cave walls.
These are subtle bumping sounds positioned in binaural space.

### Surface sounds
The surface sounds are comprised of two layers.
A pink noise texture represents the peaks of nearby waves.
A subtle glittery texture provides a calming sunny backdrop.

### Scanning
The scanner cuts 3D space into several cones radiating outward from the player.
They are positioned binaurally and use a variety of frequencies to build the space.
Each tone is delayed based on a ray cast from the player, with closer sounds happening sooner.

### Treasure
Treasure is represented like a glowing object.
It's full of frequency content and almost musical.
These are the only props used in the game.
They have a z-index that affects the gain calculations.

### Soundtrack
Once below the ocean floor, the ambient soundscape begins to fade in.
It produces ethereal drones that slowly evolve over time based on the player position in 3D space.
It's achieved with a couple oscillators positioned binaurally.
For performance, the soundtrack is never running when the surface sounds are active, and vice versa.
