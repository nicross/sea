content.system.audio = {
  import: function () {
    engine.audio.mixer.master.param.lowpass.frequency.value = engine.const.minFrequency
    engine.audio.ramp.exponential(engine.audio.mixer.master.param.lowpass.frequency, engine.const.maxFrequency, 2)
    return this
  },
  surface: {},
  underwater: {},
}

engine.state.on('import', () => content.system.audio.import())
