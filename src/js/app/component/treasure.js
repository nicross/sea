'use strict'

app.component.treasure = {}

app.component.treasure.create = function (...args) {
  return Object.create(this.prototype).construct(...args)
}

app.component.treasure.prototype = {
  attach: function (element) {
    element.appendChild(this.rootElement)
    return this
  },
  construct: function (treasure = {}) {
    this.rootElement = document.createElement('tr')
    this.rootElement.className = 'c-treasure'
    this.rootElement.tabIndex = 0

    const title = document.createElement('th')
    title.innerHTML = treasure.name
    title.scope = 'row'
    this.rootElement.appendChild(title)

    const value = document.createElement('td')
    value.innerHTML = `${app.utility.format.number(app.utility.treasure.computeValue(treasure))} <abbr aria-label="gold">g</abbr>`
    this.rootElement.appendChild(value)

    return this
  },
}
