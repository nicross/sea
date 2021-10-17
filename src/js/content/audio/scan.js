content.audio.scan = (() => {
  const bus = content.audio.mixer.bus.misc.createBypass(),
    context = engine.audio.context(),
    rootFrequency = engine.utility.midiToFrequency(69)

  const lowpass2d = context.createBiquadFilter(),
    notch2d = context.createBiquadFilter()

  bus.gain.value = engine.utility.fromDb(-3)

  lowpass2d.frequency.value = rootFrequency

  notch2d.frequency.value = rootFrequency
  notch2d.Q.value = 50
  notch2d.type = 'notch'

  lowpass2d.connect(notch2d)
  notch2d.connect(bus)

  function honk() {
    const root = rootFrequency

    const synth = engine.audio.synth.createFm({
      carrierFrequency: root,
      modDepth: root / 2,
      modFrequency: root * 2,
      modType: 'square',
    }).connect(bus)

    content.audio.reverb.from(synth.output)

    const now = engine.audio.time()

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.exponentialRampToValueAtTime(1/2, now + 1/32)
    synth.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, now + 0.5)

    synth.stop(now + 0.5)
  }

  function render2d(results) {
    render2dStream(results[0], 1)
    render2dStream(results[1], 2/3)
    render2dStream(results[2], 1/3)
    render2dStream(results[3], 0)
    render2dStream(results[4], -1/3)
    render2dStream(results[5], -2/3)
    render2dStream(results[6], -1)
  }

  function render2dStream(stream, pan) {
    const duration = content.const.scanCooldown,
      isSurface = engine.position.getVector().z > content.const.lightZone/2,
      panner = context.createStereoPanner(),
      when = engine.audio.time()

    panner.pan.value = pan
    panner.connect(lowpass2d)

    const synth = engine.audio.synth.createSimple({
      frequency: rootFrequency,
      when,
    }).connect(panner)

    const count = stream.length

    for (let i = 0; i < count; i += 1) {
      const gain = i == 0
        ? 0
        : (1 - (i / (count - 1))) ** 2

      const next = when + ((i + 1) * (duration / count))

      const {
        detune,
        frequency,
      } = to2dNote(stream[i].relativeZ, isSurface)

      synth.param.detune.linearRampToValueAtTime(detune, next)
      synth.param.frequency.exponentialRampToValueAtTime(frequency, next)
      synth.param.gain.linearRampToValueAtTime(gain / (7 * 2), next)
    }

    synth.stop(when + duration)
  }

  function render3d(results) {
    const now = engine.audio.time(),
      rendered = engine.utility.octree.create()

    // First result
    const first = results.shift()

    if (first && first.isSolid) {
      render3dGrain({
        result: first,
        type: 'sawtooth',
        when: now,
      })

      rendered.insert(first)
    }

    // Random directions
    for (const result of results) {
      if (!result.isSolid || rendered.find(result, 2)) {
        continue
      }

      render3dGrain({
        result,
        type: result.isWorm ? 'triangle' : 'sine',
        when: now,
      })

      rendered.insert(result)
    }
  }

  function render3dGrain({
    result,
    type = 'sine',
    when = 0,
  } = {}) {
    // Adjust arrival time via distance
    when += engine.utility.lerp(0, content.const.scanCooldown, result.distanceRatio)

    const {
      detune,
      frequency,
    } = to3dNote(result.relativeZ)

    // Create synth
    const synth = engine.audio.synth.createSimple({
      detune,
      frequency,
      type,
      when,
    }).filtered({
      detune,
      frequency: frequency * (type == 'sawtooth' ? 8 : 2),
    })

    // Position synth in space
    const relative = engine.utility.vector3d.create(result)
      .subtract(engine.position.getVector())
      .rotateQuaternion(engine.position.getQuaternion().conjugate())

    const distance = relative.distance()

    const compensation = distance > 1
      ? 1 / Math.sqrt(distance)
      : 1

    const duration = 1/32

    engine.audio.binaural.create({
      ...relative.scale(compensation),
    }).from(synth).to(bus)

    // Automate
    synth.param.gain.setValueAtTime(engine.const.zeroGain, when)
    synth.param.gain.exponentialRampToValueAtTime(1, when + duration/4)
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, when + duration)

    synth.stop(when + duration)
  }

  function to2dNote(z = 0, isSurface = false) {
    const scale = isSurface
      ? content.surface.max() * 2
      : content.scan.scan2d.maxDistance()

    return {
      detune: engine.utility.scale(z, -scale, scale, -2400, 2400),
      frequency: rootFrequency,
    }
  }

  function to3dNote(z = 0) {
    const scale = content.scan.scan3d.maxDistance()

    return {
      detune: engine.utility.scale(z, -scale, scale, -2400, 2400),
      frequency: rootFrequency,
    }
  }

  return {
    complete: function (results) {
      render2d(results.scan2d)
      render3d(results.scan3d)
      return this
    },
    trigger: function () {
      honk()
      return this
    },
  }
})()

engine.ready(() => {
  content.scan.on('complete', (results) => content.audio.scan.complete(results))
  content.scan.on('trigger', (e) => content.audio.scan.trigger(e))
})
