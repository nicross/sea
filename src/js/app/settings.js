app.settings = (() => {
  const settings = {
    compassVolume: {
      compute: (rawValue) => engine.utility.fromDb(engine.utility.lerpLog(engine.const.zeroDb, -12, rawValue, 268400000)), // -9 => 23155
      default: 0.5,
    },
    drawDistance: {
      compute: (rawValue) => Math.round(engine.utility.lerp(100, 1000, rawValue)),
      default: engine.utility.scale(500, 50, 1000, 0, 1),
    },
    gamepadDeadzone: {
      compute: (rawValue) => engine.utility.lerp(0, 0.3, rawValue),
      default: 0.5,
      update: (computedValue) => {
        engine.input.gamepad.setDeadzone(computedValue)
      },
    },
    graphicsFov: {
      compute: (rawValue) => engine.utility.lerp(Math.PI/3, Math.PI * 2/3, rawValue),
      default: 0,
    },
    graphicsHudOpacity: {
      default: 1,
    },
    graphicsMotionBlur: {
      compute: (rawValue) => 1 - engine.utility.lerpExp(1, 1/32, rawValue, 1/2),
      default: 0,
    },
    graphicsOn: {
      compute: (rawValue) => Boolean(rawValue),
      default: true,
    },
    mainVolume: {
      compute: (rawValue) => engine.utility.fromDb(engine.utility.lerpLog(engine.const.zeroDb, 0, rawValue, 66666)),
      default: 1,
    },
    mouseSensitivity: {
      compute: (rawValue) => engine.utility.lerp(10, 100, rawValue),
      default: 0.5,
    },
    musicVolume: {
      compute: (rawValue) => engine.utility.fromDb(engine.utility.lerpLog(engine.const.zeroDb, 0, rawValue, 4294000000)),
      default: 1,
      update: (computedValue) => {
        content.system.audio.music.setGain(computedValue)
      },
    },
    notifyTreasure: {
      compute: (rawValue) => Boolean(rawValue),
      default: true,
    },
    reverbOn: {
      compute: (rawValue) => Boolean(rawValue),
      default: true,
      update: (computedValue) => {
        engine.audio.mixer.auxiliary.reverb.setActive(computedValue)
      },
    },
    streamerLimit: {
      compute: (rawValue) => Math.round(engine.utility.lerp(5, 25, rawValue)),
      default: 1,
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
    treasureHints: {
      compute: (rawValue) => Boolean(rawValue),
      default: true,
    },
  }

  const computed = {},
    helpers = {},
    raw = {}

  for (const [key] of Object.entries(settings)) {
    const name = `set${capitalize(key)}`

    helpers[name] = function (value) {
      update(key, value)
      return this
    }
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

engine.ready(() => app.settings.import(
  app.storage.getSettings()
))
