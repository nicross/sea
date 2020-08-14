# S.E.A
An atmospheric audio watercraft simulator submitted to [No Video Jam](https://itch.io/jam/no-video-jam).

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
