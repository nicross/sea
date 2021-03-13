app.canvas.hud.compass = (() => {
  const tree = engine.utility.bitree.create({
    dimension: 'angle',
  })

  generateTree()
  app.canvas.hud.on('draw', draw)

  function draw({canvas, context}) {
    const {yaw} = engine.position.getEuler()
    const {z} = engine.position.getVector()

    const fov = app.settings.computed.graphicsFov,
      halfFov = fov / 2,
      maxAngle = yaw + halfFov,
      minAngle = yaw - halfFov,
      points = tree.retrieve(minAngle, fov),
      protection = engine.utility.clamp(engine.utility.scale(z, 0, content.const.lightZone, 0.125, 1)),
      rem = app.utility.css.rem(),
      width = canvas.width,
      y = rem

    for (const point of points) {
      const alpha = point.angle < yaw
        ? engine.utility.scale(point.angle, minAngle, yaw, 0, 1)
        : engine.utility.scale(point.angle, yaw, maxAngle, 1, 0)

      const x = engine.utility.scale(point.angle, minAngle, maxAngle, width, 0)

      point.draw({
        alpha,
        context,
        point,
        protection,
        rem,
        x,
        y,
      })
    }
  }

  function drawLine({
    alpha,
    context,
    rem,
    x,
    y,
  }) {
    const height = rem
    let halfHeight = height / 2

    y += rem / 2

    context.lineWidth = 1
    context.strokeStyle = `rgba(255, 255, 255, ${alpha})`

    // Avoid anti-aliasing
    x = Math.round(x) + 0.5
    y = Math.round(y) + 0.5
    halfHeight = Math.round(halfHeight)

    context.beginPath()
    context.moveTo(x, y - halfHeight)
    context.lineTo(x, y + halfHeight)
    context.stroke()
  }

  function drawLineSmall({
    alpha,
    context,
    rem,
    x,
    y,
  }) {
    const height = rem / 2
    const halfHeight = height / 2

    y += rem / 2

    context.strokeStyle = `rgba(255, 255, 255, ${alpha})`

    context.beginPath()
    context.moveTo(x, y - halfHeight)
    context.lineTo(x, y + halfHeight)
    context.stroke()
  }

  function drawText({
    alpha,
    context,
    point,
    protection,
    rem,
    x,
    y,
  }) {
    const height = 2 * rem
    const halfHeight = height / 2

    context.fillStyle = `rgba(0, 0, 0, ${alpha * protection})`
    context.font = `${height}px/${height}px SuperSubmarine`
    context.strokeStyle = `rgba(255, 255, 255, ${alpha})`
    context.textAlign = 'center'

    context.fillText(point.label, x, y + halfHeight)
    context.strokeText(point.label, x, y + halfHeight)
  }

  function drawTextPrimary({
    alpha,
    context,
    point,
    protection,
    rem,
    x,
    y,
  }) {
    const height = 2 * rem
    const halfHeight = height / 2

    context.fillStyle = `rgba(255, 255, 255, ${alpha})`
    context.font = `${height}px/${height}px SuperSubmarine`
    context.strokeStyle = `rgba(0, 0, 0, ${alpha * protection})`
    context.textAlign = 'center'

    context.strokeText(point.label, x, y + halfHeight)
    context.fillText(point.label, x, y + halfHeight)
  }

  function drawTextSmall({
    alpha,
    context,
    point,
    protection,
    rem,
    x,
    y,
  }) {
    const height = rem * 1.5
    const halfHeight = height / 2

    y += rem / 6

    context.fillStyle = `rgba(0, 0, 0, ${alpha * protection})`
    context.font = `${height}px/${height}px SuperSubmarine`
    context.strokeStyle = `rgba(255, 255, 255, ${alpha})`
    context.textAlign = 'center'

    context.fillText(point.label, x, y + halfHeight)
    context.strokeText(point.label, x, y + halfHeight)
  }

  function generateTree() {
    const points = [
      {
        angle: 0,
        draw: drawText,
        label: 'E',
      },
      {
        angle: 1/16 * Math.PI,
        draw: drawLineSmall,
      },
      {
        angle: 2/16 * Math.PI,
        draw: drawLine,
        label: 'ENE',
      },
      {
        angle: 3/16 * Math.PI,
        draw: drawLineSmall,
      },
      {
        angle: 4/16 * Math.PI,
        draw: drawTextSmall,
        label: 'NE',
      },
      {
        angle: 5/16 * Math.PI,
        draw: drawLineSmall,
      },
      {
        angle: 6/16 * Math.PI,
        draw: drawLine,
        label: 'NNE',
      },
      {
        angle: 7/16 * Math.PI,
        draw: drawLineSmall,
      },
      {
        angle: 8/16 * Math.PI,
        draw: drawTextPrimary,
        label: 'N',
      },
      {
        angle: 9/16 * Math.PI,
        draw: drawLineSmall,
      },
      {
        angle: 10/16 * Math.PI,
        draw: drawLine,
        label: 'NNW',
      },
      {
        angle: 11/16 * Math.PI,
        draw: drawLineSmall,
      },
      {
        angle: 12/16 * Math.PI,
        draw: drawTextSmall,
        label: 'NW',
      },
      {
        angle: 13/16 * Math.PI,
        draw: drawLineSmall,
      },
      {
        angle: 14/16 * Math.PI,
        draw: drawLine,
        label: 'WNW',
      },
      {
        angle: 15/16 * Math.PI,
        draw: drawLineSmall,
      },
      {
        angle: Math.PI,
        draw: drawText,
        label: 'W',
      },
      {
        angle: 17/16 * Math.PI,
        draw: drawLineSmall,
      },
      {
        angle: 18/16 * Math.PI,
        draw: drawLine,
        label: 'WSW',
      },
      {
        angle: 19/16 * Math.PI,
        draw: drawLineSmall,
      },
      {
        angle: 20/16 * Math.PI,
        draw: drawTextSmall,
        label: 'SW',
      },
      {
        angle: 21/16 * Math.PI,
        draw: drawLineSmall,
      },
      {
        angle: 22/16 * Math.PI,
        draw: drawLine,
        label: 'SSW',
      },
      {
        angle: 23/16 * Math.PI,
        draw: drawLineSmall,
      },
      {
        angle: 24/16 * Math.PI,
        draw: drawText,
        label: 'S',
      },
      {
        angle: 25/16 * Math.PI,
        draw: drawLineSmall,
      },
      {
        angle: 26/16 * Math.PI,
        draw: drawLine,
        label: 'SSE',
      },
      {
        angle: 27/16 * Math.PI,
        draw: drawLineSmall,
      },
      {
        angle: 28/16 * Math.PI,
        draw: drawTextSmall,
        label: 'SE',
      },
      {
        angle: 29/16 * Math.PI,
        draw: drawLineSmall,
      },
      {
        angle: 30/16 * Math.PI,
        draw: drawLine,
        label: 'ESE',
      },
      {
        angle: 31/16 * Math.PI,
        draw: drawLineSmall,
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
