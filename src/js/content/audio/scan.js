content.audio.scan = (() => {
  const bus = content.audio.mixer.bus.misc.createBypass(),
    context = engine.audio.context(),
    rootFrequency = content.utility.rationalFrequency.fromMidi(69)

  const lowpass2d = context.createBiquadFilter(),
    notch2d = context.createBiquadFilter()

  bus.gain.value = engine.utility.fromDb(-6)

  lowpass2d.frequency.value = rootFrequency

  notch2d.frequency.value = rootFrequency
  notch2d.Q.value = 50
  notch2d.type = 'notch'

  lowpass2d.connect(notch2d)
  notch2d.connect(bus)

  function honk(event) {
    const synth = engine.audio.synth.createFm({
      carrierFrequency: rootFrequency,
      modDepth: rootFrequency * 2.5,
      modFrequency: rootFrequency * 2,
      modType: 'square',
    }).filtered({
      frequency: rootFrequency * (event.isForward ? 8 : 3),
    }).connect(bus)

    content.audio.reverb.from(synth.output)

    const now = engine.audio.time()

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.exponentialRampToValueAtTime(1/2, now + 1/32)
    synth.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, now + 0.5)

    synth.stop(now + 0.5)
  }

  function render2d({
    scan2d: streams = [],
  } = {}) {
    render2dStream(streams[0], 1)
    render2dStream(streams[1], 2/3)
    render2dStream(streams[2], 1/3)
    render2dStream(streams[3], 0)
    render2dStream(streams[4], -1/3)
    render2dStream(streams[5], -2/3)
    render2dStream(streams[6], -1)
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
      synth.param.gain.linearRampToValueAtTime(gain / 7, next)
    }

    synth.stop(when + duration)
  }

  function render3d(event) {
    const now = engine.audio.time(),
      results = [...event.scan3d]

    // First result
    const first = results.shift()

    if (first && first.isSolid) {
      render3dGrain({
        result: first,
        type: 'sawtooth',
        when: now + engine.utility.lerp(0, content.const.scanCooldown, first.distanceRatio),
      })
    }

    // Random directions, throttled
    const throttleTime = content.const.scanCooldown / results.length
    let nextWhen = now

    results.sort((a, b) => a.distanceRatio - b.distanceRatio)

    for (const result of results) {
      if (!result.isSolid && !result.isWormEntrance) {
        continue
      }

      const when = now + engine.utility.lerp(0, content.const.scanCooldown, result.distanceRatio)

      if (when <= nextWhen && !result.isWormEntrance) {
        continue
      }

      render3dGrain({
        result,
        type: result.isWormEntrance ? 'triangle' : (result.isWorm ? 'square' : 'sine'),
        when,
      })

      if (!result.isWormEntrance) {
        nextWhen = when + throttleTime
      }
    }
  }

  function render3dGrain({
    result,
    type = 'sine',
    when = 0,
  } = {}) {
    const {
      detune,
      frequency,
    } = to3dNote(result.relativeZ)

    const colors = {
      sawtooth: 8,
      sine: 1,
      square: 1,
      triangle: 2,
    }

    const relative = engine.utility.vector3d.create(result)
      .subtract(engine.position.getVector())
      .rotateQuaternion(engine.position.getQuaternion().conjugate())

    const shadow = Math.max(0, Math.cos(Math.atan2(relative.y, -relative.x)))

    // Create synth
    const synth = engine.audio.synth.createSimple({
      detune,
      frequency,
      type,
      when,
    }).filtered({
      detune,
      frequency: frequency * colors[type] * engine.utility.lerp(1, 0.5, shadow),
    }).chainAssign('panner', context.createStereoPanner()).connect(bus)

    synth.panner.pan.value = Math.sin(Math.atan2(-relative.y, relative.x))

    // Automate
    const duration = result.isWormEntrance
      ? engine.utility.scale(result.wormPoint.radius, 0, content.scan.scan3d.maxDistance(), 0, content.const.scanCooldown)
      : 1/16

    const gain = (1 - result.distanceRatio) ** 4 || engine.const.zeroGain

    synth.param.gain.setValueAtTime(engine.const.zeroGain, when)
    synth.param.gain.exponentialRampToValueAtTime(gain, when + duration/4)
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
    complete: function (e) {
      render2d(e)
      render3d(e)
      return this
    },
    trigger: function (e) {
      honk(e)
      return this
    },
  }
})()

engine.ready(() => {
  content.scan.on('complete', (e) => content.audio.scan.complete(e))
  content.scan.on('trigger', (e) => content.audio.scan.trigger(e))
})
