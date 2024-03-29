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
    duration: 1/16,
    gain: 1/8,
    note: 57,
    when: now,
  })

  this.note({
    duration: 2,
    gain: 1/8,
    note: 60,
    when: now + 1/16,
  })

  this.note({
    duration: 1/16,
    gain: 1/8,
    note: 64,
    when: now + 2/16,
  })

  this.note({
    duration: 2,
    gain: 1/8,
    note: 67,
    when: now + 3/16,
  })

  this.note({
    duration: 2,
    gain: 1/8,
    note: 72,
    when: now + 4/16,
  })
}

content.audio.sfx.discoverPoi = function () {
  const now = engine.audio.time()

  this.note({
    duration: 2,
    gain: 1/8,
    note: 64,
    when: now,
  })

  this.note({
    duration: 1/16,
    gain: 1/8,
    note: 57,
    when: now + 1/16,
  })

  this.note({
    duration: 2,
    gain: 1/8,
    note: 60,
    when: now + 2/16,
  })

  this.note({
    duration: 1/16,
    gain: 1/8,
    note: 62,
    when: now + 3/16,
  })

  this.note({
    duration: 2,
    gain: 1/8,
    note: 69,
    when: now + 4/16,
  })

  this.note({
    duration: 2,
    gain: 1/8,
    note: 67,
    when: now + 5/16,
  })
}

content.audio.sfx.note = function ({
  attack = 1/32,
  color = 4,
  duration,
  gain = engine.const.zeroGain,
  note = 69,
  off,
  release = 1/8,
  sustain,
  when = engine.audio.time(),
}) {
  const frequency = content.utility.rationalFrequency.fromMidi(note)

  const synth = engine.audio.synth.createSimple({
    frequency,
    type: 'square',
    when,
  }).filtered({
    frequency: frequency * color,
  }).connect(this.bus())

  if (duration) {
    off = when + duration
  } else if (off) {
    duration = off - when
  }

  if (!sustain) {
    sustain = engine.utility.lerpExp(gain, engine.const.zeroGain, (off - when - attack) / duration)
  }

  synth.param.gain.setValueAtTime(engine.const.zeroGain, when)
  synth.param.gain.exponentialRampToValueAtTime(gain, when + attack)
  synth.param.gain.linearRampToValueAtTime(sustain, off)
  synth.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, off + release)

  synth.stop(off + release)

  return synth
}
