app.autosave = (() => {
  let active = false,
    timeout

  function save() {
    app.storage.setGame(
      engine.state.export()
    )

    app.storage.setStats(
      app.stats.export()
    )
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

content.system.treasure.on('collect', (treasure) => {
  const treasures = app.storage.getTreasures()

  treasures.push(treasure)
  app.storage.setTreasures(treasures)

  app.autosave.trigger()
})
