app.updates = (() => {
  const registry = []

  app.ready(() => {
    const appVersion = app.version().replace('-debug', ''),
      storageVersions = app.storage.getVersions()

    // First time player
    if (!storageVersions.length) {
      return app.storage.setVersion(appVersion)
    }

    // No update required
    if (storageVersions.includes(appVersion)) {
      return app.storage.setVersion(appVersion)
    }

    // Determine closest earlier version
    let storageVersion

    for (const version of storageVersions) {
      if (!storageVersion || app.utility.semver.isEarlier(version, storageVersion)) {
        storageVersion = version
      }
    }

    // Upgrade storage
    app.storage.clone(storageVersion, appVersion)
      .setVersion(appVersion)

    // Apply updates
    registry.sort((a, b) => app.utility.semver.compare(a.semver, b.semver))

    for (const update of registry) {
      if (app.utility.semver.isLater(update.semver, storageVersion)) {
        update.fn()
      }
    }
  })

  return {
    register: function (semver, fn) {
      registry.push({
        fn,
        semver: app.utility.semver.parse(semver),
      })

      return this
    },
    rescaleSetting: function (value, min, max, step) {
      value = engine.utility.lerp(min, max, value)
      value = Math.round(value / step) * step
      value = engine.utility.scale(value, min, max, 0, 1)

      return value
    }
  }
})()
