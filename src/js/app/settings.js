'use strict'

app.settings = (() => {
  const settings = {
    masterVolume: {
      compute: (rawValue) => engine.utility.fromDb(engine.utility.lerpLog(engine.const.zeroDb, 0, rawValue, 250)),
      default: 1,
      update: (computedValue) => {
        if (app.state.game.is('none')) {
          return
        }

        engine.audio.ramp.linear(engine.audio.mixer.master.param.gain, computedValue, 1/8)
      },
    },
    musicVolume: {
      compute: (rawValue) => engine.utility.fromDb(engine.utility.lerpLog(engine.const.zeroDb, 0, rawValue, 250)),
      default: 1,
      update: (computedValue) => {
        // TODO: Set music volume
      },
    },
    toggleBoost: {
      compute: (rawValue) => Boolean(rawValue),
      default: 0,
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

app.once('activate', () => app.settings.import(
  app.storage.getSettings()
))
