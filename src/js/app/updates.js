app.updates = (() => {
  const registry = []

  engine.ready(() => {
    const appVersion = app.version(),
      storageVersions = app.storage.getVersions().sort(sortBySemver)

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
    registry.sort(sortBySemver)

    for (const update of registry) {
      if (app.utility.semver.isLater(update.semver, storageVersion)) {
        update.fn()
      }
    }
  })

  function sortBySemver(a, b) {
    return app.utility.semver.compare(a.semver, b.semver)
  }

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
