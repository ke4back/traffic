import { INTERSECTION_BOUNDS } from '../utils/constants'

class Intersection {
  constructor(id, bounds = INTERSECTION_BOUNDS) {
    this.id = id
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

    ctx.setLineDash([])
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'

    for (let i = 0; i < 6; i += 1) {
      ctx.fillRect(left - 24, top + 8 + i * 16, 18, 8)
      ctx.fillRect(right + 6, top + 8 + i * 16, 18, 8)
      ctx.fillRect(left + 8 + i * 16, top - 24, 8, 18)
      ctx.fillRect(left + 8 + i * 16, bottom + 6, 8, 18)
    }

    ctx.restore()
  }
}

export default Intersection
