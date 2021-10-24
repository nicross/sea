'use strict'

app.component.destination = {}

app.component.destination.create = function (...args) {
  return Object.create(this.prototype).construct(...args)
}

app.component.destination.prototype = {
  attach: function (element) {
    element.appendChild(this.rootElement)
    return this
  },
  beforeUpdate: () => {},
  construct: function (data = {}, options = {}) {
    engine.utility.pubsub.decorate(this)

    this.data = data

    if (options.beforeUpdate) {
      this.beforeUpdate = options.beforeUpdate
    }

    this.rootElement = document.createElement('tr')
    this.rootElement.className = 'c-destination a-destinations--destination'
    this.rootElement.setAttribute('role', 'button')
    this.rootElement.tabIndex = 0
    this.rootElement.addEventListener('click', (e) => this.onClick(e))

    const title = document.createElement('th')
    title.innerHTML = data.name
    title.scope = 'row'
    this.rootElement.appendChild(title)

    const distance = document.createElement('td')
    distance.innerHTML = '<span class="c-destination--distance"></span> <abbr aria-label="meters">m</abbr>'
    this.rootElement.appendChild(distance)

    this.update()

    return this
  },
  destroy: function () {
    this.rootElement.remove()
    this.off()
    return this
  },
  onClick: function (e) {
    e.preventDefault()
    e.stopPropagation()

    this.emit('click')

    return this
  },
  setHidden: function (value) {
    this.rootElement.hidden = value
    return this
  },
  update: function () {
    this.beforeUpdate()

    const distance = engine.position.getVector().distance(this.data)
    this.rootElement.querySelector('.c-destination--distance').innerHTML = app.utility.format.number(distance)

    return this
  },
}
