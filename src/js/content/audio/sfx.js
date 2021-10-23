content.audio.sfx = (() => {
  const bus = content.audio.mixer.bus.misc.createBus()

  bus.gain.value = engine.utility.fromDb(-9)

  return {
    bus: () => bus,
  }
})()

engine.ready(() => {
  content.pois.on('discover', () => content.audio.sfx.discoverPoi())
  content.treasure.on('collect', () => content.audio.sfx.collectTreasure())
})

content.audio.sfx.collectTreasure = function () {
  const now = engine.audio.time()

  this.note({
    gain: 1/8,
    note: 57,
    when: now,
    off: now + 0.0625,
  })

  this.note({
    gain: 1/8,
    note: 60,
    when: now + 0.0625,
    off: now + 2.0625,
  })

  this.note({
    gain: 1/8,
    note: 64,
    when: now + 0.125,
    off: now + 0.1875,
  })

  this.note({
    gain: 1/8,
    note: 67,
    when: now + 0.1875,
    off: now + 2.1875,
  })

  this.note({
    gain: 1/8,
    note: 72,
    when: now + 0.25,
    off: now + 2.25,
  })
}

content.audio.sfx.discoverPoi = () => {
  // TODO
}

content.audio.sfx.note = ({
  gain,
  note,
  off,
  when,
}) => {
  const frequency = content.utility.rationalFrequency.fromMidi(note)

  const synth = engine.audio.synth.createSimple({
    frequency,
    type: 'square',
    when,
  }).filtered({
    frequency: frequency * 4,
  }).connect(content.audio.sfx.bus())

  synth.param.gain.setValueAtTime(engine.const.zeroGain, when)
  synth.param.gain.exponentialRampToValueAtTime(gain, when + 1/32)

  const endGain = engine.utility.lerpExp(gain, engine.const.zeroGain, (off - when) / 2)

  synth.param.gain.linearRampToValueAtTime(endGain, off)
  synth.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, off + 1/8)

  synth.stop(off + 1/8)

  return synth
}
