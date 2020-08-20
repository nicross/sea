content.system.audio.scan = (() => {
  const bus = engine.audio.mixer.createBus(),
    context = engine.audio.context(),
    reverb = engine.audio.send.reverb.create()

  const frequencies = {}
  ;[
    // A3
    45, // below
    48,
    50,
    52,
    55,
    // A4
    57,
    60, // behind
    62, // backward/left/right
    64, // left/right
    67, // forward left/right
    // A5
    69, // ahead
    72,
    74,
    76,
    79,
    // A6
    81,
    84,
    86,
    88,
    91,
    // A7
    93, // above
  ].forEach((note) => {
    frequencies[note] = engine.utility.midiToFrequency(note)
  })

  bus.gain.value = engine.utility.fromDb(-6)
  reverb.update({x: 0, y: 0})

  function honk() {
    const root = frequencies[69]

    const synth = engine.audio.synth.createFm({
      carrierFrequency: root,
      modDepth: root / 2,
      modFrequency: root,
      modtype: 'sawtooth',
    }).connect(bus)

    reverb.from(synth.output)

    const now = engine.audio.time()

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.exponentialRampToValueAtTime(1, now + 1/32)
    synth.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, now + 0.5)
    synth.param.gain.setValueAtTime(engine.const.zeroGain, now + 2)
    synth.param.gain.exponentialRampToValueAtTime(1/8, now + 2.5 - engine.const.zeroTime)
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + 2.5)

    synth.param.detune.setValueAtTime(-1200, now + 2)
    synth.param.detune.linearRampToValueAtTime(0, now + 2.5)

    synth.stop(now + 3 + engine.const.zeroTime)
  }

  function render(scan) {
    renderGroup(scan.aheadL, -0.5)
    renderGroup(scan.aheadR, 0.5)
    renderGroup(scan.behindL, -0.5)
    renderGroup(scan.behindR, 0.5)
    renderGroup(scan.center, 0)
    renderGroup(scan.sideL, -1)
    renderGroup(scan.sideR, 1)
  }

  function renderGrain({
    delay = 0,
    note = 0,
    pan = 0,
  } = {}) {
    const panner = context.createStereoPanner(),
      when = engine.audio.time(0.5 + (delay * 2))

    const synth = engine.audio.synth.createSimple({
      frequency: frequencies[note],
      when,
    }).connect(panner)

    panner.pan.value = pan
    panner.connect(bus)

    synth.param.gain.setValueAtTime(engine.const.zeroGain, when)
    synth.param.gain.exponentialRampToValueAtTime(1, when + 1/32)
    synth.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, when + 0.5)

    synth.stop(when + 0.5)
  }

  function renderGroup(group = {}, pan) {
    for (const [note, delay] of Object.entries(group)) {
      if (note == -1) {
        continue
      }

      renderGrain({
        delay,
        note,
        pan,
      })
    }
  }

  return {
    trigger: function (scan) {
      honk()
      render(scan)
      return this
    },
  }
})()
