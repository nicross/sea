'use strict'

const app = engine.utility.pubsub.decorate({
  activate: function () {
    document.querySelector('.a-app').classList.add('a-app-active')
    this.pubsub.emit('activate')
    return this
  },
  component: {},
  isElectron: () => typeof ElectronApi != 'undefined',
  quit: function () {
    if (this.isElectron()) {
      ElectronApi.quit()
    }

    return this
  },
  screen: {},
  state: {},
  version: () => '0.0.0', // XXX: Replaced via Gulpfile.js
})
