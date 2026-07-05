class Intersection {
  constructor(bounds) {
    this.bounds = bounds
  }

  // Draws the central crossing zone and lane markings for the junction.
  draw(ctx) {
    const { left, top, right, bottom } = this.bounds
    const width = right - left
    const height = bottom - top

    ctx.save()
    ctx.fillStyle = '#454d57'
    ctx.fillRect(left, top, width, height)

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 3
    ctx.setLineDash([8, 10])

    ctx.beginPath()
    ctx.moveTo(left, (top + bottom) / 2)
    ctx.lineTo(right, (top + bottom) / 2)
    ctx.moveTo((left + right) / 2, top)
    ctx.lineTo((left + right) / 2, bottom)
    ctx.stroke()

    ctx.restore()
  }
}

export default Intersection
