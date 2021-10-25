app.settings = (() => {
  const settings = {
    compassVolume: {
      compute: (rawValue) => engine.utility.fromDb(engine.utility.lerpLog(engine.const.zeroDb, -18, rawValue, 130000000)),
      default: 0.5,
      update: (computedValue) => {
        content.audio.compass.setGain(computedValue)
      },
    },
    drawDistanceDynamic: {
      compute: (rawValue) => Math.round(engine.utility.lerp(10, 75, rawValue)),
      default: engine.utility.scale(50, 10, 75, 0, 1),
      update: () => {
        app.canvas.forceResize()
      },
    },
    drawDistanceStatic: {
      compute: (rawValue) => Math.round(engine.utility.lerp(50, 1000, rawValue)),
      default: engine.utility.scale(100, 50, 1000, 0, 1),
      update: () => {
        app.canvas.forceResize()
      },
    },
    environmentVolume: {
      compute: (rawValue) => engine.utility.fromDb(engine.utility.lerpLog(engine.const.zeroDb, 0, rawValue, 4294000000)),
      default: 1,
      update: (computedValue) => {
        content.audio.mixer.bus.environment.setGain(computedValue)
      },
    },
    gamepadDeadzone: {
      compute: (rawValue) => engine.utility.lerp(0, 0.3, rawValue),
      default: 0.5,
      update: (computedValue) => {
        engine.input.gamepad.setDeadzone(computedValue)
      },
    },
    gamepadVibration: {
      default: 1,
    },
    graphicsBacklightStrength: {
      compute: (rawValue) => Number(rawValue),
      default: 0.5,
      update: () => {
        app.canvas.forceUpdate()
      },
    },
    graphicsDarkModeOn: {
      compute: (rawValue) => Boolean(rawValue),
      default: false,
      update: () => {
        if (engine.loop.isPaused()) {
          app.canvas.forceUpdate()
        }
      },
    },
    graphicsFov: {
      compute: (rawValue) => engine.utility.lerp(Math.PI/3, Math.PI * 2/3, rawValue),
      default: 0.25,
      update: () => {
        app.canvas.forceResize()
      },
    },
    graphicsHudCompassOn: {
      compute: (rawValue) => Boolean(rawValue),
      default: true,
      update: () => {
        if (engine.loop.isPaused()) {
          app.canvas.forceUpdate()
        }
      },
    },
    graphicsHudCoordinatesOn: {
      compute: (rawValue) => Boolean(rawValue),
      default: true,
      update: () => {
        if (engine.loop.isPaused()) {
          app.canvas.forceUpdate()
        }
      },
    },
    graphicsHudOpacity: {
      default: 1,
      update: () => {
        if (engine.loop.isPaused()) {
          app.canvas.forceUpdate()
        }
      },
    },
    graphicsHudPitchOn: {
      compute: (rawValue) => Boolean(rawValue),
      default: true,
      update: () => {
        if (engine.loop.isPaused()) {
          app.canvas.forceUpdate()
        }
      },
    },
    graphicsHudTreasureOn: {
      compute: (rawValue) => Boolean(rawValue),
      default: true,
      update: () => {
        if (engine.loop.isPaused()) {
          app.canvas.forceUpdate()
        }
      },
    },
    graphicsStaticObjectLimit: {
      compute: (rawValue) => Math.round(engine.utility.lerp(250, 2500, rawValue)),
      default: engine.utility.scale(1000, 250, 2500, 0, 1),
      update: () => {
        if (engine.loop.isPaused()) {
          app.canvas.forceUpdate()
        }
      },
    },
    graphicsTracers: {
      compute: (rawValue) => engine.utility.lerpExp(0, 9/10, rawValue, 0.848),
      default: 0,
      update: () => {
        if (engine.loop.isPaused()) {
          app.canvas.forceUpdate()
        }
      },
    },
    graphicsOn: {
      compute: (rawValue) => Boolean(rawValue),
      default: true,
      update: () => {
        app.canvas.forceUpdate()
      },
    },
    invertLookY: {
      compute: (rawValue) => Boolean(rawValue),
      default: false,
    },
    mainVolume: {
      compute: (rawValue) => engine.utility.fromDb(engine.utility.lerpLog(engine.const.zeroDb, 0, rawValue, 66666)),
      default: 1,
      update: () => {
        if (app.state.screen.is('game')) {
          return
        }

        if (app.state.screen.is('splash')) {
          return
        }

        const gain = computed.mainVolume * computed.pausedVolume
        engine.audio.ramp.linear(engine.audio.mixer.master.param.gain, gain, 1/8)
      },
    },
    miscVolume: {
      compute: (rawValue) => engine.utility.fromDb(engine.utility.lerpLog(engine.const.zeroDb, 0, rawValue, 4294000000)),
      default: 1,
      update: (computedValue) => {
        content.audio.mixer.bus.misc.setGain(computedValue)
      },
    },
    mouseSensitivity: {
      compute: (rawValue) => engine.utility.lerp(1, 32, rawValue),
      default: 0.5,
    },
    musicVolume: {
      compute: (rawValue) => engine.utility.fromDb(engine.utility.lerpLog(engine.const.zeroDb, 0, rawValue, 4294000000)),
      default: 1,
      update: (computedValue) => {
        content.audio.mixer.bus.music.setGain(computedValue)
      },
    },
    notifyPoi: {
      compute: (rawValue) => Boolean(rawValue),
      default: true,
    },
    notifyTreasure: {
      compute: (rawValue) => Boolean(rawValue),
      default: true,
    },
    pausedVolume: {
      compute: (rawValue) => engine.utility.fromDb(engine.utility.lerpLog(engine.const.zeroDb, 0, rawValue, 66666)),
      default: 0.5,
      update: () => {
        if (app.state.screen.is('game')) {
          return
        }

        if (app.state.screen.is('splash')) {
          return
        }

        const gain = computed.mainVolume * computed.pausedVolume
        engine.audio.ramp.linear(engine.audio.mixer.master.param.gain, gain, 1/8)
      },
    },
    reverbOn: {
      compute: (rawValue) => Boolean(rawValue),
      default: true,
      update: (computedValue) => {
        engine.audio.mixer.auxiliary.reverb.setActive(computedValue)
      },
    },
    streamerLimit: {
      compute: (rawValue) => Math.round(engine.utility.lerp(5, 15, rawValue)),
      default: 0.5,
      update: (computedValue) => {
        engine.streamer.setLimit(computedValue)
      },
    },
    streamerRadius: {
      compute: (rawValue) => Math.round(engine.utility.lerp(10, 100, rawValue)),
      default: 1,
      update: (computedValue) => {
        engine.streamer.setRadius(computedValue)
      },
    },
    toggleTurbo: {
      compute: (rawValue) => Boolean(rawValue),
      default: true,
    },
  }

  const computed = {},
    helpers = {},
    raw = {}

  for (const [key, value] of Object.entries(settings)) {
    const name = `set${capitalize(key)}`

    helpers[name] = function (value) {
      update(key, value)
      return this
    }

    // Fix undefined values when importing settings that depend on eachother
    computed[key] = value.compute
      ? value.compute(value.default)
      : value.default
  }

  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1)
  }

  function compute(key, value) {
    const computer = settings[key].compute

    if (!computer) {
      return value
    }

    return computer(value)
  }

  function defaults() {
    const defaults = {}

    for (const [key, setting] of Object.entries(settings)) {
      defaults[key] = setting.default
    }

    return defaults
  }

  function update(key, value) {
    if (!settings[key]) {
      return
    }

    const computedValue = compute(key, value)

    computed[key] = computedValue
    raw[key] = value

    if (settings[key].update) {
      settings[key].update(computedValue)
    }
  }

  return {
    computed,
    import: function (data = {}) {
      const values = {
        ...defaults(),
        ...data,
      }

      for (const [key, value] of Object.entries(values)) {
        update(key, value)
      }

      return this
    },
    raw,
    save: function () {
      app.storage.setSettings(raw)
      return this
    },
    ...helpers,
  }
})()

app.ready(() => app.settings.import(
  app.storage.getSettings()
))
