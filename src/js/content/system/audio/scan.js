content.system.audio.scan = (() => {
  const bus = engine.audio.mixer.createBus(),
    context = engine.audio.context()

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

  function honk() {
    const root = frequencies[69]

    const synth = engine.audio.synth.createFm({
      carrierFrequency: root,
      modDepth: root / 2,
      modFrequency: root * 2,
      modType: 'square',
    }).connect(bus)

    content.system.reverb.from(synth.output)

    const now = engine.audio.time()

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.exponentialRampToValueAtTime(1, now + 1/32)
    synth.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, now + 0.5)

    synth.stop(now + 0.5)
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
    const gain = (1 - delay) ** 4,
      panner = context.createStereoPanner(),
      when = engine.audio.time(0.25 + (delay * 2))

    const synth = engine.audio.synth.createSimple({
      frequency: frequencies[note],
      when,
    }).connect(panner)

    panner.pan.value = pan
    panner.connect(bus)

    synth.param.gain.setValueAtTime(engine.const.zeroGain, when)
    synth.param.gain.exponentialRampToValueAtTime(gain, when + 1/32)
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
