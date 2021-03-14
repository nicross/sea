'use strict'

app.component.slider = {}

app.component.slider.hydrate = function (...args) {
  return Object.create(this.prototype).construct(...args)
}

app.component.slider.prototype = {
  construct: function (root, initialValue) {
    this.inputElement = root.querySelector('.c-slider--input input')
    this.rootElement = root
    this.valueElement = root.querySelector('.c-slider--value')

    this.inputElement.addEventListener('input', this.onInput.bind(this))
    this.inputElement.addEventListener('keydown', this.onKeydown.bind(this))

    this.setValueAsFloat(initialValue)
    this.setAriaLive(true)

    engine.utility.pubsub.decorate(this)

    return this
  },
  decorateValue: function (value) {
    if (!this.isSigned() || value <= 0) {
      return value
    }

    return `+${value}`
  },
  decrement: function () {
    return this.setValue(this.getValue() - this.getStep())
  },
  getMax: function () {
    return Number(this.inputElement.max)
  },
  getMin: function () {
    return Number(this.inputElement.min)
  },
  getStep: function () {
    return Number(this.inputElement.step)
  },
  getValue: function () {
    return Number(this.inputElement.value)
  },
  getValueAsFloat: function () {
    return engine.utility.scale(this.getValue(), this.getMin(), this.getMax(), 0, 1)
  },
  increment: function () {
    return this.setValue(this.getValue() + this.getStep())
  },
  isSigned: function () {
    return this.getMin() < 0
  },
  onInput: function () {
    this.valueElement.innerHTML = this.decorateValue(this.getValue())

    if (this.emit) {
      this.emit('change')
    }

    return this
  },
  onKeydown: function (e) {
    if (e.code == 'Tab') {
      return
    }

    e.preventDefault()
  },
  setAriaLive: function (state) {
    if (state) {
      this.valueElement.setAttribute('aria-live', 'polite')
    } else {
      this.valueElement.removeAttribute('aria-live')
    }

    return this
  },
  setValue: function (value) {
    value = engine.utility.clamp(value, this.getMin(), this.getMax())

    this.inputElement.value = value
    this.valueElement.innerHTML = this.decorateValue(value)

    if (this.emit) {
      this.emit('change')
    }

    return this
  },
  setValueAsFloat: function (value) {
    return this.setValue(engine.utility.scale(value, 0, 1, this.getMin(), this.getMax()))
  },
}
