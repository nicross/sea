app.autosave = (() => {
  let active = false,
    timeout

  function save() {
    app.storage.setGame(
      engine.state.export()
    )

    app.storage.setStats(
      content.system.stats.export()
    )

    // TODO: Save treasure
  }

  return {
    disable: function () {
      active = false

      if (timeout) {
        timeout = clearTimeout(timeout)
      }

      return this
    },
    enable: function () {
      if (active) {
        return this
      }

      active = true
      timeout = setTimeout(save, app.const.autosaveInterval)

      return this
    },
    trigger: function () {
      if (active) {
        timeout = clearTimeout(timeout)
      }

      save()

      if (active) {
        timeout = setTimeout(save, app.const.autosaveInterval)
      }

      return this
    },
  }
})()
