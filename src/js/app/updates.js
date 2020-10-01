app.updates = (() => {
  const registry = []

  engine.ready(() => {
    const appVersion = app.version(),
      storageVersion = app.storage.getVersion()

    const appSemver = app.utility.semver.parse(appVersion),
      storageSemver = app.utility.semver.parse(storageVersion)

    if (storageVersion == '0.0.0') {
      return app.storage.setVersion(appVersion)
    }

    if (app.utility.semver.isEqual(appSemver, storageSemver)) {
      return
    }

    const updates = registry.sort((a, b) => app.utility.semver.compare(a.semver, b.semver))

    for (const update of updates) {
      if (app.utility.semver.isLater(update.semver, storageSemver)) {
        update.fn()
      }
    }

    app.storage.setVersion(appVersion)
  })

  return {
    register: function (semver, fn) {
      registry.push({
        fn,
        semver: app.utility.semver.parse(semver),
      })

      return this
    },
  }
})()
