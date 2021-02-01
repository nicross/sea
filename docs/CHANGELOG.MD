# S.E.A. changelog

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
        <li>Fixed diving losing velocity from air</li>
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
