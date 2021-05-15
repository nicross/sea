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

  function saveLoop() {
    save()
    scheduleSaveLoop()
  }

  function scheduleSaveLoop() {
    timeout = setTimeout(saveLoop, app.const.autosaveInterval)
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
      scheduleSaveLoop()

      return this
    },
    trigger: function () {
      if (active) {
        timeout = clearTimeout(timeout)
      }

      save()

      if (active) {
        scheduleSaveLoop()
      }

      return this
    },
  }
})()

content.treasure.on('collect', (treasure) => {
  const treasures = app.storage.getTreasures()

  treasures.push(treasure)
  app.storage.setTreasures(treasures)

  app.autosave.trigger()
})
