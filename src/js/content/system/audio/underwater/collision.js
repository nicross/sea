content.system.audio.underwater.collision = (() => {
  const bus = content.system.audio.mixer.bus.misc.createBus(),
    throttleRate = 1000/20

  let throttle = 0

  bus.gain.value = engine.utility.fromDb(-6)

  function trigger({
    normalized = {},
    ratio = 0,
  } = {}) {
    const synth = engine.audio.synth.createBuffer({
      buffer: engine.audio.buffer.noise.white(),
    }).filtered({
      frequency: engine.utility.lerpExp(300, 2000, ratio, 2),
    })

    content.system.audio.reverb.from(synth.output)

    const binaural = engine.audio.binaural.create()
      .from(synth.output)
      .to(bus)
      .update(normalized)

    const duration = engine.utility.lerp(1/4, 1, ratio)
    const now = engine.audio.time()

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.exponentialRampToValueAtTime(1, now + 1/32)
    synth.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, now + duration)

    synth.stop(now + duration)
    setTimeout(() => binaural.destroy(), duration * 1000)
  }

  return {
    trigger: function (e) {
      const now = performance.now()

      if (now > throttle + throttleRate) {
        trigger(e)
        throttle = now
      }

      return this
    },
  }
})()

engine.ready(() => {
  content.system.movement.on('underwater-collision', (e) => content.system.audio.underwater.collision.trigger(e))
})
