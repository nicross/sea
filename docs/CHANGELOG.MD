# S.E.A. changelog
## v1.5.0
- Exploration node audio rework
- Floor generation rework
- Increased draw distance
- Improved fast travel transitions
- Noise refactor (surface and floor)
- Performance improvements
- Scanning enhancements
- Save versioning
- Separate draw distance sliders

## v1.4.5
- Updated syngen to the latest version
- Fixed black screens when resizing window while paused

## v1.4.4
- Added adjustable backlight to Dark Mode
- Added backlight strength slider to Graphics screen
- Added UI theme color cycling based on in-game solar time
- Fixed star projection

<details>
  <summary>Spoiler Warning</summary>
  <ul>
    <li>Added relative height cues to treasures</li>
  </ul>
</details>

## v1.4.3
<details>
  <summary>Spoiler Warning</summary>
  <ul>
    <li>Fixed sun and moon fading to black while descending underwater</li>
    <li>Fixed treasure hints not disabling when toggled off</li>
    <li>Forced graphics to update when treasure hints are toggled</li>
    <li>Improved handling of audio crashes</li>
    <li>Tentatively reduced frequency of treasure cue-related crashes</li>
  </ul>
</details>

## v1.4.2
- Audio
  - Reduced default compass volume by half
  - Reworked engine cues to be more responsive to input
- Graphics
  - Adjusted splash screens to show off new star effects
  - Draw nodes consistently across draw distances
  - Fixed drawing on resize when graphics disabled
  - Increased default draw distance to maximum value
  - Increased film grain refresh rate
  - Prevented periodic GPU crashes when tracers enabled
  - Rendered tracers for sun, moon, and stars
- Movement
  - Allowed strafing on surface
  - Improved mouse turning and sensitivity values
  - Prevented haptics while game is paused
- User interface
  - Added confirmation screen before starting a new game
  - Renamed motion blur setting to tracers
- Miscellaneous
  - Updated documentation to reflect changes
  - Updated desktop builds to Electron 13 (Chromium 91)

<details>
  <summary>Spoiler Warning</summary>
  <ul>
    <li>Graphics
      <ul>
        <li>Adjusted exploration node coloring</li>
        <li>Improved background color depth transitions</li>
        <li>Limited maximum number of exploration nodes drawn</li>
      </ul>
    </li>
    <li>Movement
      <ul>
        <li>Allowed surfacing regardless of vertical velocity</li>
        <li>Doubled normal underwater speed</li>
        <li>Improved underwater collision detection memory usage</li>
        <li>Remembered collisions as exploration nodes</li>
      </ul>
    </li>
    <li>Scanning
      <ul>
        <li>Added binaural processing to scan results</li>
        <li>Attenuated reverb while scanning</li>
        <li>Improved load times for games with many scans</li>
        <li>Reworked scan results cue for directional clarity</li>
        <li>Voxelized scan collisions</li>
      </ul>
    </li>
    <li>Simulation
      <ul>
        <li>Simulated speed of sound of current medium</li>
      </ul>
    </li>
    <li>Treasure
      <ul>
        <li>Added musical instruments as possible junk</li>
        <li>Expanded munitions with new adjectives and nouns</li>
      </ul>
    </li>
  </ul>
</details>

## v1.4.1
- Audio
  - Added binaural processing to splash cue
  - Reworked splash cue for movement changes
- Graphics
  - Added toggle for Dark Mode on Graphics screen
  - Added random radii to stars
  - Adjusted range of motion blur strengths
  - Fixed celestial glows disappearing when crossing top of screen
  - Increased contrast of nighttime sky
  - Made stars visible for longer
- Movement
  - Improved handling on slopes
- User interface
  - Added access hotkeys for altitude and velocity
  - Added status screen rows for altitude and velocity
  - Improved verbosity of access hotkey alerts
  - Rearranged heading and coordinates on Status screen
- Miscellaneous
  - Fixed some things caching between new games
  - Prevented statistics collecting while on title screen
  - Tweaked haptic strengths to be stronger overall
  - Miscellaneous coding chores to support future updates
  - Updated documentation to reflect changes

<details>
  <summary>Spoiler Warning</summary>
  <ul>
    <li>Audio
      <ul>
        <li>Added more triads to underwater soundtrack</li>
        <li>Fixed a memory leak within underwater soundtrack</li>
      </ul>
    </li>
    <li>Graphics
      <ul>
        <li>Added effect to stars when crossing surface</li>
      </ul>
    </li>
    <li>Movement
      <ul>
        <li>Improved surface transitions</li>
        <li>Prevented getting stuck in terrain</li>
        <li>Voxelized terrain collisions</li>
      </ul>
    </li>
  </ul>
</details>

## v1.4.0
- Audio
  - Added slider for environmental sound volume
  - Added slider for miscellaneous sound volume
  - Added slider for volume while game is paused
  - Added music to splash screen and main menu
  - Reduced default object limit to 15
  - Remixed various levels for clarity
- Documentation
  - Added photosensitivity warning and graphical description
  - Added performance troubleshooting tips
  - Updated documentation to reflect latest changes
- Graphics
  - Added subtle shimmer to surface
  - Improved surface render performance
  - Increased default field of view to 75 degrees
  - Reddened light levels around dusk and dawn
- Haptic feedback
  - Added haptic feedback for supported browsers and devices
  - Added slider for vibration to Controls screen
- Movement
  - Applied pitch to thrust relative to wave slope
  - Fixed occasionally getting stuck beneath surface
- Simulation
  - Added localized turbulence to waves
  - Increased distance between tidal waves
  - Reworked surface generation
- User interface
  - Added hotkeys <kbd>1</kbd> through <kbd>0</kbd> to focus and click menu items
  - Added randomized scenes to splash screen and menus
  - Fixed tab key not working when sliders were focused
  - Moved solar time to top of Status screen
  - Overhauled menu styles to be legible over scenes
  - Rendered audio while paused
  - Updated access hotkeys to reflect new Status screen order

<details>
  <summary>Spoiler Warning</summary>
  <ul>
    <li>Audio
      <ul>
        <li>Fixed underwater momentum between surface and sea level</li>
      </ul>
    </li>
  </ul>
</details>

## v1.3.0
- Audio
  - Added persistent audio cues for sun and moon
  - Added volume slider for compass cues
  - Aligned soundtrack texture with time of day
  - Prevented phase cancellation between waves
  - Reduced maximum object limit to 25
  - Reduced wave volume when catching air
- Graphics
  - Added sun, moon, and stars that rise and set
  - Aligned light colors with time of day
  - Applied motion blur setting to surface
  - Made closer objects appear slightly larger
  - Tamed the film grain effect
- Movement
  - Applied engine thrust and turning when skipping
  - Increased friction with surface
  - Increased maximum normal velocity
  - Reduced drag in air for bigger jumps and spins
- Simulation
  - Added tidal waves that are strongest at noon and midnight
  - Aligned surface turbulence to time of day
- User interface
  - Added scrollbars to settings screens with several fields
  - Added solar time to Status screen
  - Press <kbd>Alt</kbd>+<kbd>4</kbd> or <kbd>T</kbd> to access solar time with a screen reader
  - Reduced screen transition times
- Miscellaneous
  - Updated desktop builds to Electron 12 (Chromium 89)

<details>
  <summary>Spoiler Warning</summary>
  <ul>
    <li>Audio
      <ul>
        <li>Improved transitions between the midnight zone</li>
      </ul>
    </li>
    <li>Movement
      <ul>
        <li>Allowed strafe controls in air for applying thrust on skip</li>
        <li>Reduced angular deceleration slightly underwater</li>
        <li>Removed requirement of holding ascend to surface</li>
      </ul>
    </li>
    <li>Simulation
      <ul>
        <li>Fast-forward solar time on Fast Travel</li>
      </ul>
    </li>
    <li>Miscellaneous
      <ul>
        <li>Fix ability to use scanner between sea level and surface</li>
        <li>Reduced treasure notification duration from 10 to 3 seconds</li>
        <li>Unlock fast travel to floor after first successful scan</li>
        <li>Unlock gameplay settings after first treasure found</li>
      </ul>
    </li>
  </ul>
</details>

## v1.2.3
- Added Gamepad Deadzone slider to Controls screen
- Fixed <kbd>Alt</kbd>+<kbd>Tab</kbd> locking in-game controls (introduced in v1.2.0)
- Fixed compass headings on Status screen using counter-clockwise angles
- Improved surface gluing for better traction at high velocities
- Slightly increased contrast of surface

<details>
  <summary>Spoiler Warning</summary>
  <ul>
    <li>Allowed toggling turbo while using scanner</li>
    <li>Always spawn above surface when fast traveling to it</li>
    <li>Fixed autosaving between collecting treasures</li>
    <li>Improved rare audio crash recovery when treasure is spawned</li>
    <li>Prevent spawning inside floor when fast traveling to it</li>
  </ul>
</details>

## v1.2.2
- Fixed falling from sky on new game (broken in v1.2.1)
- Performance optimizations
  - Increased throttling of collision sounds
  - Managed memory of ephemeral noise generators (e.g. surface and wind)
  - Switched to a simpler noise algorithm for a certain visual cue

## v1.2.1
- Performance optimizations
  - Clear all noise fields on game state changes
  - Only cache surface height when it's nearby
  - Only draw surface when it's visible

## v1.2.0
- Added access hotkeys while in-game
  - Documented access hotkeys in manual
  - Press <kbd>Alt</kbd>+<kbd>1</kbd> or <kbd>C</kbd> to access current coordinates
  - Press <kbd>Alt</kbd>+<kbd>2</kbd> or <kbd>H</kbd> to access current heading
  - Press <kbd>Alt</kbd>+<kbd>X</kbd> to access x-coordinate (East-West)
  - Press <kbd>Alt</kbd>+<kbd>Y</kbd> to access y-coordinate (North-South)
- Added performance settings
  - Added Draw Distance slider to Graphics screen
  - Added Enable Reverb toggle to Audio screen
  - Added Object Limit slider to Audio screen
  - Added Render Distance slider to Audio screen
  - Set defaults to match maximum quality values from previous versions
- Graphical enhancements
  - Added a calming blue sky
  - Added ocean waves
- Miscellaneous
  - Changed default Field of View to 60 degrees (from 90)
  - Fall from sky when starting a new game
  - Fixed compass headings offset by -90 degrees on Status screen
  - Fixed engine filtering while catching air
  - Fixed errors in controls section of manual
  - Improved consistency of toggle labels
  - Moved Resume Game after Miscellaneous within in-game menu

<details>
  <summary>Spoiler Warning</summary>
  <ul>
    <li>Added hidden access hotkeys while in-game
      <ul>
        <li>Press <kbd>Alt</kbd>+<kbd>3</kbd> or <kbd>Z</kbd> to access current depth</li>
      </ul>
    </li>
    <li>Graphical enhancements
      <ul>
        <li>Added underwater light zones</li>
      </ul>
    </li>
    <li>Improved HUD
      <ul>
        <li>Fixed glitch affecting compass line widths</li>
        <li>Improved compass anti-aliasing</li>
        <li>Improved treasure hint opacity easing</li>
      </ul>
    </li>
    <li>Miscellaneous
      <ul>
        <li>Fixed losing velocity when diving from air</li>
        <li>Improved surface divide and buoyancy</li>
        <li>Tentative fix for audio drops caused by unstable BiquadFilterNodes in treasure audio cues</li>
      </ul>
    </li>
  </ul>
</details>

## v1.1.0
- Upgraded to latest version of [syngen](https://github.com/nicross/syngen)
  - Implemented new movement model
  - Some sounds and physics may behave differently
- Added graphical heads-up-display
  - Added compass
  - Fade opacity when idle
- Improved sound design
  - Added panning to compass cues
- Split settings into multiple screens
  - Added Audio Mixer screen with existing settings
  - Added Controls screen with existing settings
  - Added Graphics screen
    - Added toggle for enabling graphics (on by default)
    - Added sliders for Field of View, HUD Opacity, and Motion Blur
- Updated desktop builds to Electron v11.1.1 (Chromium 87)

<details>
  <summary>Spoiler Warning</summary>
  <ul>
    <li>Added underwater graphics
      <ul>
        <li>Added depth meter</li>
        <li>Added scanned points</li>
        <li>Added treasure hints</li>
      </ul>
    </li>
    <li>Added Fast Travel screen
      <ul>
        <li>Added fast travel to floor</li>
        <li>Added fast travel to origin</li>
        <li>Added fast travel to surface</li>
      </ul>
    </li>
    <li>Added Gameplay settings screen
      <ul>
        <li>Added toggle for Treasure Hints (on by default)</li>
        <li>Added toggle for Treasure Notifications (on by default)</li>
      </ul>
    </li>
    <li>Added new statistics
      <ul>
        <li>Fast travels</li>
        <li>Scans</li>
        <li>Scan results</li>
        <li>Time idle</li>
        <li>Time in air</li>
        <li>Time in caves</li>
        <li>Time on surface</li>
        <li>Time underwater</li>
      </ul>
    </li>
    <li>Improved treasure
      <ul>
        <li>Added more adjectives</li>
        <li>Added more nouns</li>
        <li>Added more surnames</li>
        <li>Added treasure collection notifications</li>
        <li>Guaranteed treasure spawns on first successful scan</li>
        <li>Unlock fast travel to floor after first pickup</li>
      </ul>
    </li>
    <li>Miscellaneous
      <ul>
        <li>Implemented new collision model</li>
      </ul>
    </li>
  </ul>
</details>
