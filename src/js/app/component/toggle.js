'use strict'

app.component.toggle = {}

app.component.toggle.hydrate = function (...args) {
  return Object.create(this.prototype).construct(...args)
}

app.component.toggle.prototype = {
  construct: function (root, initialValue) {
    this.buttonElement = root.querySelector('.c-toggle--button')
    this.rootElement = root

    this.buttonElement.addEventListener('click', this.onClick.bind(this))

    this.setValue(initialValue)

    engine.utility.pubsub.decorate(this)

    return this
  },
  getValue: function () {
    return this.buttonElement.getAttribute('aria-checked') == 'true'
  },
  onClick: function () {
    this.setValue(!this.getValue())

    if (this.emit) {
      this.emit('change')
    }

    return this
  },
  setValue: function (value) {
    this.buttonElement.setAttribute('aria-checked', value ? 'true' : 'false')

    if (this.emit) {
      this.emit('change')
    }

    return this
  },
}
