app.utility.semver = {}

app.utility.semver.compare = (a, b) => {
  if (a.major != b.major) {
    return a.major - b.major
  }

  if (a.minor != b.minor) {
    return a.minor - b.minor
  }

  if (a.patch != b.patch) {
    return a.patch - b.patch
  }

  return a.label.localeCompare(b.label)
}

app.utility.semver.isEarlier = function (a, b) {
  return this.compare(a, b) < 0
}

app.utility.semver.isEqual = function (a, b) {
  return this.compare(a, b) == 0
}

app.utility.semver.isLater = function (a, b) {
  return this.compare(a, b) > 0
}

app.utility.semver.parse = (semver = '') => {
  const [version = '0.0.0', label = ''] = semver.split('-')
  const [major = 0, minor = 0, patch = 0] = version.split('.').map(Number)

  return {
    label,
    major,
    minor,
    patch,
  }
}
