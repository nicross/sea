app.storage.api = (() => {
  const dbName = 'shiftbacktick_sea',
    dbStoreName = 'versions',
    dbStoreProxyKey = 'version',
    dbStoreProxyValue = 'data',
    dbVersion = 1,
    isSupported = 'indexedDB' in window,
    ready = open()

  let db,
    proxy = {}

  function get(key) {
    return proxy[key]
  }

  function keys() {
    return [...Object.keys(proxy)]
  }

  function open() {
    return new Promise((resolve, reject) => {
      if (!isSupported) {
        return resolve()
      }

      const request = indexedDB.open(dbName, dbVersion)

      request.onerror = reject

      request.onsuccess = async () => {
        db = request.result
        await populate()
        resolve()
      }

      request.onupgradeneeded = () => {
        request.result.createObjectStore(dbStoreName, {keyPath: dbStoreProxyKey})
      }
    })
  }

  function populate() {
    if (!isSupported) {
      return
    }

    return new Promise((resolve, reject) => {
      const request = db.transaction([dbStoreName]).objectStore(dbStoreName).getAll()

      request.onerror = reject

      request.onsuccess = () => {
        const results = request.result

        for (const result of results) {
          const key = result[dbStoreProxyKey],
            value = result[dbStoreProxyValue]

          proxy[key] = value
        }

        resolve()
      }
    })
  }

  function set(key, value) {
    proxy[key] = value

    if (!isSupported) {
      return
    }

    const item = {}
    item[dbStoreProxyKey] = key
    item[dbStoreProxyValue] = value

    db.transaction([dbStoreName], 'readwrite').objectStore(dbStoreName).put(item)
  }

  return {
    get: (key) => {
      return get(key)
    },
    keys: () => keys(),
    ready: () => ready,
    set: (key, value) => {
      set(key, value)
      return this
    },
  }
})()
