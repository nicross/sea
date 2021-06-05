app.updates.register('1.4.2', () => {
  updateSettings()
  function updateSettings() {
    const settings = app.storage.getSettings()

    if (!settings) {
      return
    }

    // Rename motion blur to tracers
    if ('graphicsMotionBlur' in settings) {
      settings.graphicsTracers = settings.graphicsMotionBlur
      delete settings.graphicsMotionBlur
    }

    app.storage.setSettings(settings)
  }
})
