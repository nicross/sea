content.prop.base = engine.prop.base.invent((prototype) => ({
  construct: function ({
    destination,
  } = {}) {
    this.destination = destination
    return prototype.construct.apply(this, arguments)
  },
  fadeInDuration: 1/8,
  fadeOutDuration: 1/8,
  // TODO: Port removed periodic logic
  rebuildBinaural: function () {
    this.binaural.destroy()

    this.binaural = engine.audio.binaural.create()
    this.binaural.from(this.output)
    this.binaural.to(this.destination)

    this.recalculate()

    return this
  },
  reverb: false,
}))
