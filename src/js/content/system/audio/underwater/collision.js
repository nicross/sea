content.system.audio.underwater.collision = (() => {
  const bus = content.system.audio.createBus(),
    throttleRate = 1000/60

  let throttle = 0

  // XXX: Compensate for engine.const.distancePower = 1 (was 0 at 2)
  bus.gain.value = engine.utility.fromDb(-3)

  function trigger({
    angle = 0,
    velocity = 0,
  } = {}) {
    const synth = engine.audio.synth.createBuffer({
      buffer: engine.audio.buffer.noise.white(),
    }).filtered({
      frequency: engine.utility.lerpExp(300, 2000, velocity, 2),
    })

    content.system.audio.reverb.from(synth.output)

    const binaural = engine.audio.binaural.create()
      .from(synth.output)
      .to(bus)
      .update({
        x: Math.cos(angle),
        y: Math.sin(angle),
      })

    const duration = engine.utility.lerp(1/4, 1, velocity)
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


// HACK: Essentially app.once('activate')
engine.loop.once('frame', () => {
  content.system.movement.on('underwater-collision', (e) => content.system.audio.underwater.collision.trigger(e))
})
