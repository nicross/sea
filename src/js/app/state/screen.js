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
        this.change('game')
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
  const floor = content.terrain.floor.value(position.x, position.y) + 5

  const distance = Math.abs(position.z - floor),
    travelTime = distance / content.const.underwaterTurboMaxVelocity

  content.time.incrementOffset(travelTime)

  engine.position.setVector({
    ...position,
    z: floor,
  })

  // Force hard reset
  engine.state.import({
    ...engine.state.export(),
  })

  app.stats.fastTravels.increment()
})

app.state.screen.on('before-fastTravel-origin', () => {
  const position = engine.position.getVector()
  const distance = position.distance()

  const velocity = position.z > 0
    ? content.const.surfaceTurboMaxVelocity
    : content.const.underwaterTurboMaxVelocity

  const travelTime = distance / velocity
  content.time.incrementOffset(travelTime)

  const surface = content.surface.value(0, 0) + engine.const.zero

  engine.position.setVector({
    x: 0,
    y: 0,
    z: surface,
  })

  // Force hard reset
  engine.state.import({
    ...engine.state.export(),
  })

  app.stats.fastTravels.increment()
})

app.state.screen.on('before-fastTravel-surface', () => {
  const position = engine.position.getVector()

  const distance = Math.abs(position.z),
    travelTime = distance / content.const.underwaterTurboMaxVelocity

  content.time.incrementOffset(travelTime)

  const surface = content.surface.value(0, 0) + engine.const.zero

  engine.position.setVector({
    ...position,
    z: surface,
  })

  // Force hard reset
  engine.state.import({
    ...engine.state.export(),
  })

  app.stats.fastTravels.increment()
})
