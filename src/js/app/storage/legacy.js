app.storage.legacy = (() => {
  const isSupported = 'localStorage' in window

  const api = isSupported
    ? window.localStorage
    : {
        data: {},
        getItem: (key) => this.data[key],
        removeItem: (key) => delete this.data[key],
        setItem: (key) => this.data[key] = value,
      }

  const keys = {
    game: 'sea_game',
    settings: 'sea_settings',
    stats: 'sea_stats',
    treasures: 'sea_treasures',
  }

  const versionKey = 'sea_version'

  function get(key) {
    try {
      const value = api.getItem(key)

      return key == versionKey
        ? value
        : JSON.parse(value)
    } catch (e) {}
  }

  return {
    data: () => {
      const data = {}

      for (const [key, value] of Object.entries(keys)) {
        data[key] = get(value)
      }

      return data
    },
    version: () => get(versionKey),
  }
})()
