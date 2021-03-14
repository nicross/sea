content.system.audio.sfx = (() => {
  const bus = content.system.audio.mixer.bus.misc.createBus()

  bus.gain.value = engine.utility.fromDb(-6)

  return {
    bus: () => bus,
  }
})()

engine.ready(() => {
  content.system.treasure.on('collect', () => content.system.audio.sfx.collectTreasure())
})

content.system.audio.sfx.collectTreasure = () => {
  const createNote = ({
    frequency,
    gain,
    off,
    when,
  }) => {
    const synth = engine.audio.synth.createSimple({
      frequency,
      type: 'square',
      when,
    }).filtered({
      frequency: frequency * 4,
    }).connect(content.system.audio.sfx.bus())

    synth.param.gain.setValueAtTime(engine.const.zeroGain, when)
    synth.param.gain.exponentialRampToValueAtTime(gain, when + 1/32)

    const endGain = engine.utility.lerpExp(gain, engine.const.zeroGain, (off - when) / 2)

    synth.param.gain.linearRampToValueAtTime(endGain, off)
    synth.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, off + 1/8)

    synth.stop(off + 1/16)
  }

  const now = engine.audio.time()

  createNote({
    frequency: engine.utility.midiToFrequency(57),
    gain: 1/8,
    when: now,
    off: now + 0.0625,
  })

  createNote({
    frequency: engine.utility.midiToFrequency(60),
    gain: 1/8,
    when: now + 0.0625,
    off: now + 2.0625,
  })

  createNote({
    frequency: engine.utility.midiToFrequency(64),
    gain: 1/8,
    when: now + 0.125,
    off: now + 0.1875,
  })

  createNote({
    frequency: engine.utility.midiToFrequency(67),
    gain: 1/8,
    when: now + 0.1875,
    off: now + 2.1875,
  })

  createNote({
    frequency: engine.utility.midiToFrequency(72),
    gain: 1/8,
    when: now + 0.25,
    off: now + 2.25,
  })
}
