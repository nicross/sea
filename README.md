# S.E.A.
An atmospheric audio watercraft simulator submitted to [No Video Jam](https://itch.io/jam/no-video-jam).

## How to Play
You lie prone in your S.E.A., an experimental military watercraft that's fully enclosed.
Moments before, you were dropped off in the middle of the Pacific.
There's no land for days.
It's just you and the sounds of the open sea.
Your mission is to test its capabilities.

The ocean is endless.
Listen and relax.
Surf the waves.
Experiment.

<details>
  <summary>Light Spoiler Warning</summary>
  <p>The console suggests that S.E.A. is an acronym for Submersible Exploration Apparatus.</p>
</details>

<details>
  <summary>Heavy Spoiler Warning</summary>
  <p>The military has intelligence that a vast network of caves exists beneath the ocean floor. They suspect that valuable treasures, some not of this world, lay dormant inside. Perhaps your objective is to submerge, explore, and acquire these artifacts.</p>
</details>

### Keyboard controls
<table>
  <thead>
    <tr>
      <th>Action</th>
      <th>Key 1</th>
      <th>Key 2</th>
      <th>Key 3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>Forward</th>
      <td>W</td>
      <td>Up Arrow</td>
      <td>Numpad 8</td>
    </tr>
    <tr>
      <th>Reverse</th>
      <td>S</td>
      <td>Down Arrow</td>
      <td>Numpad 5</td>
    </tr>
    <tr>
      <th>Turn Left</th>
      <td>Q</td>
      <td>Left Arrow</td>
      <td>Numpad 7</td>
    </tr>
    <tr>
      <th>Turn Right</th>
      <td>E</td>
      <td>Right Arrow</td>
      <td>Numpad 9</td>
    </tr>
    <tr>
      <th>Turbo</th>
      <td>X</td>
      <td>Left Shift</td>
      <td>Right Shift</td>
    </tr>
    <tr>
      <th>Confirm</th>
      <td>Enter</td>
      <td>Space</td>
      <td></td>
    </tr>
    <tr>
      <th>Back</th>
      <td>Escape</td>
      <td>Backspace</td>
      <td></td>
    </tr>
  </tbody>
</table>

<details>
  <summary>Light Spoiler Warning</summary>
  <p>The briefing suggested that the S.E.A. has undocumented capabilities. Try to experiment with its controls.</p>
</details>

<details>
  <summary>Heavy Spoiler Warning</summary>
  <p>A radio transmission instructs you that the S.E.A. has additional controls for navigating below the surface:</p>
  <table>
    <thead>
      <tr>
        <th>Action</th>
        <th>Key 1</th>
        <th>Key 2</th>
        <th>Key 3</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th>Strafe Left</th>
        <td>A</td>
        <td>Numpad 4</td>
        <td></td>
      </tr>
      <tr>
        <th>Strafe Right</th>
        <td>D</td>
        <td>Numpad 6</td>
        <td></td>
      </tr>
      <tr>
        <th>Scan Area</th>
        <td>F</td>
        <td>Left Alt</td>
        <td>Right Alt</td>
      </tr>
      <tr>
        <th>Ascend</th>
        <td>Z</td>
        <td>Space</td>
        <td></td>
      </tr>
      <tr>
        <th>Descend</th>
        <td>C</td>
        <td>Left Control</td>
        <td>Right Control</td>
      </tr>
    </tbody>
  </table>
</details>

### Gamepad controls
<table>
  <thead>
    <tr>
      <th>Action</th>
      <th>Button 1</th>
      <th>Button 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>Forward</th>
      <td>Right Stick</td>
      <td>Right Trigger</td>
    </tr>
    <tr>
      <th>Reverse</th>
      <td>Right Stick</td>
      <td>Left Trigger</td>
    </tr>
    <tr>
      <th>Turning</th>
      <td>Left Stick</td>
      <td></td>
    </tr>
    <tr>
      <th>Turbo</th>
      <td>Press Any Stick</td>
      <td></td>
    </tr>
    <tr>
      <th>Confirm</th>
      <td>A</td>
      <td></td>
    </tr>
    <tr>
      <th>Back</th>
      <td>B</td>
      <td></td>
    </tr>
  </tbody>
</table>

<details>
  <summary>Light Spoiler Warning</summary>
  <p>The briefing suggested that the S.E.A. has undocumented capabilities. Try to experiment with its controls.</p>
</details>

<details>
  <summary>Heavy Spoiler Warning</summary>
  <p>A radio transmission instructs you that the S.E.A. has additional controls for navigating below the surface:</p>
  <table>
    <thead>
      <tr>
        <th>Action</th>
        <th>Button</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th>Strafing</th>
        <td>Right Stick</td>
      </tr>
      <tr>
        <th>Scan Area</th>
        <td>A</td>
      </tr>
      <tr>
        <th>Ascend</th>
        <td>Right Bumper</td>
      </tr>
      <tr>
        <th>Descend</th>
        <td>Left Bumper</td>
      </tr>
    </tbody>
  </table>
</details>

## Development
To get started, please  use [npm](https://nodejs.org) to install the required dependencies:
```sh
npm install
```

### Common tasks
Common tasks have been automated with [Gulp](https://gulpjs.com):

#### Build once
```sh
gulp build
```

#### Build continuously
```sh
gulp watch
```

#### Create distributables
```sh
gulp dist
```

#### Open in Electron
```sh
gulp electron
```

#### Build and open in Electron
```sh
gulp electron-build
```

#### Command line flags
| Flag | Description |
| - | - |
| `--debug` | Suppresses minification. |

## Credits
The font Fira Mono was created by Mozilla.
The font Roboto was created by Google.
The font Super Submarine was created by Iconian Fonts.
These fonts are free for noncommercial use and not covered by the license of this project.
