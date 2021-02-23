# S.E.A. changelog

## v1.3.0
- Audio
  - Decreased engine volume slightly
- Graphics
  - Added a pleasant day/night cycle
- Movement
  - Applied engine thrust when skipping
  - Increased friction with surface
  - Reduced angular deceleration in air for bigger spins
  - Reduced deceleration in air for bigger jumps
- Simulation
  - Added solar time to Status screen
  - Press <kbd>Alt</kbd>+<kbd>4</kbd> or <kbd>H</kbd> to access solar time

<details markdown="1">
  <summary>Spoiler Warning</summary>
  <ul>
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
        <li>Reduced treasure notification duration</li>
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
