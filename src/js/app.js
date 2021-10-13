const app = {
  activate: function () {
    document.querySelector('.a-app').classList.add('a-app-active')
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
  ready: async (callback) => {
    await engine.ready()

    const ready = Promise.all([
      app.storage.ready(),
    ])

    return typeof callback == 'function'
      ? ready.then(callback)
      : ready
  },
  screen: {},
  state: {},
  utility: {},
  version: () => '0.0.0', // XXX: Replaced via Gulpfile.js
}
