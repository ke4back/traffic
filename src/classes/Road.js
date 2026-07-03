import { ROAD_WIDTH, STOP_MARGIN } from '../utils/constants'
import { distanceBetween, normalizeVector } from '../utils/helpers'

class Road {
  constructor({
    id,
    startPoint,
    endPoint,
    lanes,
    speedLimit,
    controlledBy = null,
    entry = false,
    exit = false,
    axis = 'vertical',
  }) {
    this.id = id
    this.startPoint = startPoint
    this.endPoint = endPoint
    this.lanes = lanes
    this.speedLimit = speedLimit
    this.vehicles = []
    this.controlledBy = controlledBy
    this.entry = entry
    this.exit = exit
    this.axis = axis
    this.length = distanceBetween(startPoint, endPoint)
    this.directionVector = normalizeVector({
      x: endPoint.x - startPoint.x,
      y: endPoint.y - startPoint.y,
    })
  }

  // Adds a vehicle to this road and keeps traffic sorted by distance along the segment.
  addVehicle(vehicle) {
    if (!this.vehicles.includes(vehicle)) {
      this.vehicles.push(vehicle)
      this.updateTraffic()
    }
  }

  // Removes a vehicle from this road after it advances or completes the route.
  removeVehicle(vehicle) {
    this.vehicles = this.vehicles.filter(({ id }) => id !== vehicle.id)
  }

  // Sorts vehicles so followers can query the car ahead on the same segment.
  updateTraffic() {
    this.vehicles.sort((vehicleA, vehicleB) => vehicleB.progress - vehicleA.progress)
  }

  // Returns the next vehicle ahead of the provided one on the same road.
  getVehicleAhead(vehicle) {
    this.updateTraffic()
    const index = this.vehicles.findIndex(({ id }) => id === vehicle.id)

    if (index <= 0) {
      return null
    }

    return this.vehicles[index - 1]
  }

  // Returns the progress value where vehicles should stop for a red light.
  getStopProgress() {
    return Math.max(0, (this.length - STOP_MARGIN) / this.length)
  }

  // Converts a normalized progress value to a world position on the road.
  getPointAt(progress) {
    const clampedProgress = Math.min(Math.max(progress, 0), 1)

    return {
      x: this.startPoint.x + (this.endPoint.x - this.startPoint.x) * clampedProgress,
      y: this.startPoint.y + (this.endPoint.y - this.startPoint.y) * clampedProgress,
    }
  }

  // Draws the road segment, asphalt, and dashed lane markings.
  draw(ctx) {
    ctx.save()
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#515a64'
    ctx.lineWidth = ROAD_WIDTH

    ctx.beginPath()
    ctx.moveTo(this.startPoint.x, this.startPoint.y)
    ctx.lineTo(this.endPoint.x, this.endPoint.y)
    ctx.stroke()

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)'
    ctx.lineWidth = 2
    ctx.setLineDash([12, 14])

    ctx.beginPath()
    ctx.moveTo(this.startPoint.x, this.startPoint.y)
    ctx.lineTo(this.endPoint.x, this.endPoint.y)
    ctx.stroke()

    ctx.setLineDash([])
    ctx.restore()
  }
}

export default Road
