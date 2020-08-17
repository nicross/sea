content.system.audio.engine = (() => {
  const bus = engine.audio.mixer.createBus(),
    context = engine.audio.context()

  const turnStrength = 1/16

  let synth

  function calculatePoints(controls) {
    const points = content.system.movement.isUnderwater()
      ? calculateUnderwaterPoints(controls)
      : calculateSurfacePoints(controls)

    const sum = points.reduce((sum, point) => ({
      x: sum.x + point.x,
      y: sum.y + point.y,
    }), {x: 0, y: 0})

    const angle = Math.atan2(sum.y, sum.x),
      x = Math.cos(angle),
      y = Math.sin(angle)

    const radius = engine.utility.clamp(engine.utility.distanceOrigin(sum.x, sum.y), 0, 1)

    return {
      angle,
      radius,
      x,
      y,
    }
  }

  function calculateSurfacePoints(controls) {
    const movement = engine.movement.get(),
      points = []

    if (controls.rotate) {
      points.push({
        x: controls.rotate * turnStrength,
        y: Math.abs(controls.rotate * turnStrength),
      })
    }

    if (controls.y) {
      points.push({
        x: 0,
        y: controls.y * (movement.velocity / content.const.surfaceTurboMaxVelocity),
      })
    }

    return points
  }

  function calculateUnderwaterPoints(controls) {
    const movement = engine.movement.get(),
      points = []

    if (controls.rotate) {
      points.push({
        x: controls.rotate * turnStrength,
        y: Math.abs(controls.rotate * turnStrength),
      })
    }

    if (controls.y) {
      points.push({
        x: 0,
        y: controls.y * (movement.velocity / content.const.underwaterTurboMaxVelocity),
      })
    }

    if (controls.x) {
      points.push({
        x: controls.x * (movement.velocity / content.const.underwaterTurboMaxVelocity),
        y: 0,
      })
    }

    if (controls.z) {
      points.push({
        x: 0,
        y: controls.z * (content.system.movement.zVelocity() / content.const.underwaterTurboMaxVelocity),
      })
    }

    return points
  }

  function createSynth() {
    synth = engine.audio.synth.createMod().filtered().connect(bus)
  }

  function destroySynth() {
    const release = 1/16
    engine.audio.ramp.linear(synth.param.gain, engine.const.zeroGain, release)
    synth.stop(engine.audio.time(release))
    synth = null
  }

  function shouldHaveSynth(controls) {
    return content.system.movement.isSurface()
      ? controls.rotate || controls.y
      : controls.rotate || controls.x || controls.y || controls.z
  }

  function updateSynth(controls) {
    
  }

  return {
    import: function ({z}) {
      if (z >= 0) {
        this.onSurface()
      } else {
        this.onUnderwater()
      }

      return this
    },
    onNormal: function () {
      // TODO: Decrease an octave
    },
    onSurface: function () {
      // TODO: Mix out underwater filter
    },
    onTurbo: function () {
      // TODO: Increase an octave
    },
    onUnderwater: function () {
      // TODO: Mix in underwater filter
    },
    reset: function () {
      if (synth) {
        destroySynth()
      }
      return this
    },
    update: function (controls = {}) {
      if (shouldHaveSynth(controls)) {
        if (!synth) {
          createSynth()
        }
        updateSynth(controls)
      } else if (synth) {
        destroySynth()
      }

      return this
    },
  }
})()

engine.state.on('import', (state) => content.system.audio.engine.import(state))
engine.state.on('reset', () => content.system.audio.engine.reset())

// HACK: Essentially app.once('activate')
engine.loop.once('frame', () => {
  content.system.movement.on('transition-normal', () => content.system.audio.engine.onNormal())
  content.system.movement.on('transition-surface', () => content.system.audio.engine.onSurface())
  content.system.movement.on('transition-turbo', () => content.system.audio.engine.onTurbo())
  content.system.movement.on('transition-underwater', () => content.system.audio.engine.onUnderwater())
})
