app.screen.game.canvas.hud.compass = (() => {
  const tree = engine.utility.bitree.create({
    dimension: 'angle',
  })

  generateTree()
  app.screen.game.canvas.hud.on('draw', draw)

  function draw({canvas, context}) {
    const {yaw} = engine.position.getEuler()

    const fov = app.settings.computed.graphicsFov,
      halfFov = fov / 2,
      maxAngle = yaw + halfFov,
      minAngle = yaw - halfFov,
      points = tree.retrieve(minAngle, fov),
      rem = app.utility.css.rem(),
      width = canvas.width,
      y = 2 * rem

    for (const point of points) {
      const alpha = point.angle < yaw
        ? engine.utility.scale(point.angle, minAngle, yaw, 0, 1)
        : engine.utility.scale(point.angle, yaw, maxAngle, 1, 0)

      const x = engine.utility.scale(point.angle, minAngle, maxAngle, 0, width)

      context.fillStyle = `rgba(0, 0, 0, ${alpha})`
      context.font = `${2 * rem}px SuperSubmarine`
      context.strokeStyle = `rgba(255, 255, 255, ${alpha})`
      context.textAlign = 'center'

      context.fillText(point.label, x, y)
      context.strokeText(point.label, x, y)
    }
  }

  function generateTree() {
    const points = [
      {
        angle: 0,
        label: 'E',
      },
      {
        angle: 1/8 * Math.PI,
        label: 'ENE',
      },
      {
        angle: 2/8 * Math.PI,
        label: 'NE',
      },
      {
        angle: 3/8 * Math.PI,
        label: 'NNE',
      },
      {
        angle: 4/8 * Math.PI,
        label: 'N',
      },
      {
        angle: 5/8 * Math.PI,
        label: 'NNW',
      },
      {
        angle: 6/8 * Math.PI,
        label: 'NW',
      },
      {
        angle: 7/8 * Math.PI,
        label: 'WNW',
      },
      {
        angle: Math.PI,
        label: 'W',
      },
      {
        angle: 9/8 * Math.PI,
        label: 'WSW',
      },
      {
        angle: 10/8 * Math.PI,
        label: 'SW',
      },
      {
        angle: 11/8 * Math.PI,
        label: 'SSW',
      },
      {
        angle: 12/8 * Math.PI,
        label: 'S',
      },
      {
        angle: 13/8 * Math.PI,
        label: 'SSE',
      },
      {
        angle: 14/8 * Math.PI,
        label: 'SE',
      },
      {
        angle: 15/8 * Math.PI,
        label: 'ESE',
      },
    ]

    for (let rotation = -1; rotation < 2; rotation += 1) {
      for (const point of points) {
        tree.insert({
          ...point,
          angle: point.angle + (rotation * Math.PI * 2),
        })
      }
    }
  }

  return {}
})()
