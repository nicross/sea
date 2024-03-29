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
      select: function () {
        this.change('game')
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
      back: function () {
        this.change('splash')
      },
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
    peripherySynthetic: {
      acknowledge: function () {
        app.settings.setAcknowledgePeripherySynthetic(true)
        app.settings.save()

        this.change('mainMenu')
      },
      dismiss: function () {
        this.change('mainMenu')
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
    splash: {
      start: function () {
        this.change(app.settings.computed.acknowledgePeripherySynthetic ? 'mainMenu' : 'peripherySynthetic')
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
  },
})

app.ready(() => {
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
    peripherySynthetic: '.a-app--peripherySynthetic',
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
