app.state.screen = engine.utility.machine.create({
  state: 'none',
  transition: {
    audio: {
      back: function () {
        this.change('settings')
      },
    },
    controls: {
      back: function () {
        this.change('settings')
      },
    },
    fastTravel: {
      back: function () {
        this.change('gameMenu')
      },
      floor: function () {
        // XXX: Hack for this.change('game')
        // TODO: Improve app.state.game
        this.dispatch('back')

        window.requestAnimationFrame(() => {
          this.dispatch('resume')
        })
      },
      origin: function () {
        // XXX: Hack for this.change('game')
        // TODO: Improve app.state.game
        this.dispatch('back')

        window.requestAnimationFrame(() => {
          this.dispatch('resume')
        })
      },
      surface: function () {
        // XXX: Hack for this.change('game')
        // TODO: Improve app.state.game
        this.dispatch('back')

        window.requestAnimationFrame(() => {
          this.dispatch('resume')
        })
      },
    },
    gallery: {
      back: function () {
        this.change('misc')
      },
    },
    game: {
      pause: function () {
        this.change('gameMenu')
      },
    },
    gameplay: {
      back: function () {
        this.change('settings')
      },
    },
    gameMenu: {
      fastTravel: function () {
        this.change('fastTravel')
      },
      mainMenu: function () {
        this.change('mainMenu')
      },
      misc: function () {
        this.change('misc')
      },
      quit: () => {
        ElectronApi.quit()
      },
      resume: function () {
        this.change('game')
      },
      status: function () {
        this.change('status')
      },
    },
    graphics: {
      back: function () {
        this.change('settings')
      },
    },
    mainMenu: {
      continue: function () {
        this.change('game')
      },
      misc: function () {
        this.change('misc')
      },
      newGame: function () {
        this.change('newGame')
      },
      quit: () => {
        ElectronApi.quit()
      },
    },
    misc: {
      back: function () {
        if (app.state.game.is('none')) {
          this.change('mainMenu')
        } else {
          this.change('gameMenu')
        }
      },
      gallery: function () {
        this.change('gallery')
      },
      settings: function () {
        this.change('settings')
      },
      stats: function () {
        this.change('stats')
      },
    },
    newGame: {
      back: function () {
        this.change('mainMenu')
      },
      new: function () {
        this.change('game')
      },
    },
    none: {
      activate: function () {
        this.change('splash')
      },
    },
    settings: {
      audio: function () {
        this.change('audio')
      },
      back: function () {
        this.change('misc')
      },
      controls: function () {
        this.change('controls')
      },
      gameplay: function () {
        this.change('gameplay')
      },
      graphics: function () {
        this.change('graphics')
      },
    },
    stats: {
      back: function () {
        this.change('misc')
      },
    },
    status: {
      back: function () {
        this.change('gameMenu')
      },
    },
    splash: {
      start: function () {
        this.change('mainMenu')
      },
    },
  },
})

engine.ready(() => {
  [...document.querySelectorAll('.a-app--screen')].forEach((element) => {
    element.setAttribute('aria-hidden', 'true')
    element.setAttribute('role', 'persentation')
  })

  app.state.screen.dispatch('activate')
})

app.state.screen.on('exit', (e) => {
  const active = document.querySelector('.a-app--screen-active')
  const inactive = document.querySelector('.a-app--screen-inactive')

  if (active) {
    active.classList.remove('a-app--screen-active')
    active.classList.add('a-app--screen-inactive')
    active.setAttribute('aria-hidden', 'true')
    active.setAttribute('role', 'persentation')
  }

  if (inactive) {
    inactive.classList.remove('a-app--screen-inactive')
    inactive.hidden = true
  }
})

app.state.screen.on('enter', (e) => {
  const selectors = {
    audio: '.a-app--audio',
    controls: '.a-app--controls',
    fastTravel: '.a-app--fastTravel',
    gallery: '.a-app--gallery',
    game: '.a-app--game',
    gameMenu: '.a-app--gameMenu',
    gameplay: '.a-app--gameplay',
    graphics: '.a-app--graphics',
    mainMenu: '.a-app--mainMenu',
    misc: '.a-app--misc',
    newGame: '.a-app--newGame',
    settings: '.a-app--settings',
    splash: '.a-app--splash',
    stats: '.a-app--stats',
    status: '.a-app--status',
  }

  const selector = selectors[e.currentState]
  const element = document.querySelector(selector)

  element.removeAttribute('aria-hidden')
  element.removeAttribute('role')
  element.removeAttribute('hidden')

  window.requestAnimationFrame(() => {
    element.classList.add('a-app--screen-active')
  })
})

// Fast travel actions
app.state.screen.on('before-fastTravel-floor', () => {
  const position = engine.position.getVector()

  const floor = content.terrain.floor.value(position.x, position.y),
    velocity = content.const.underwaterTurboMaxVelocity

  const next = engine.utility.vector3d.create({
    ...position,
    z: floor + velocity,
  })

  const distance = next.distance(position),
    travelTime = distance / velocity

  content.time.incrementOffset(travelTime)
  engine.position.setVector(next)

  content.movement.reset().import()
  app.canvas.crossfade()

  engine.position.setVelocity(
    next.subtract(position).normalize().scale(velocity)
  )

  app.stats.fastTravels.increment()
})

app.state.screen.on('before-fastTravel-origin', () => {
  const position = engine.position.getVector()

  const travelTime = (engine.utility.distance({...position, z: 0}) / content.const.surfaceTurboMaxVelocity)
    + (position.z / content.const.underwaterTurboMaxVelocity)

  const next = engine.utility.vector3d.create({
    z: -engine.const.zero,
  })

  engine.position.setVector(next)
  content.time.incrementOffset(travelTime)

  content.movement.reset().import()
  app.canvas.crossfade()

  app.stats.fastTravels.increment()
})

app.state.screen.on('before-fastTravel-surface', () => {
  const position = engine.position.getVector(),
    velocity = content.const.underwaterTurboMaxVelocity

  const distance = Math.abs(position.z),
    travelTime = distance / velocity

  content.time.incrementOffset(travelTime)

  const next = engine.utility.vector3d.create({
    ...position,
    z: content.surface.value(position.x, position.y) - (velocity / 6),
  })

  engine.position.setVector(next)

  content.movement.reset().import()
  app.canvas.crossfade()

  engine.position.setVelocity(
    next.subtract(position).normalize().scale(velocity / 2)
  )

  app.stats.fastTravels.increment()
})
