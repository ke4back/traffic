import { SAFE_GAP, VEHICLE_LENGTH, VEHICLE_WIDTH } from '../utils/constants'
import { clamp, randomRange } from '../utils/helpers'

class Vehicle {
  constructor({
    id,
    x,
    y,
    speed = 0,
    maxSpeed,
    direction,
    currentRoad,
    destination,
    waitingTime = 0,
    route,
    color,
    spawnedAt = 0,
  }) {
    this.id = id
    this.x = x
    this.y = y
    this.speed = speed
    this.maxSpeed = maxSpeed
    this.direction = direction
    this.currentRoad = currentRoad
    this.destination = destination
    this.waitingTime = waitingTime
    this.route = route
    this.color = color
    this.spawnedAt = spawnedAt
    this.travelTime = 0
    this.progress = 0
    this.routeIndex = 0
    this.length = VEHICLE_LENGTH
    this.width = VEHICLE_WIDTH
    this.finished = false
    this.safeGap = SAFE_GAP + randomRange(0, 10)
  }

  // Moves the vehicle forward along the current road according to its speed.
  move(deltaTime) {
    const distance = this.speed * deltaTime
    const progressStep = this.currentRoad.length > 0 ? distance / this.currentRoad.length : 0

    this.progress = clamp(this.progress + progressStep, 0, 1.15)

    const point = this.currentRoad.getPointAt(this.progress)
    this.x = point.x
    this.y = point.y
  }

  // Fully stops the vehicle when the light or another car blocks the path.
  stop() {
    this.speed = 0
  }

  // Smoothly adjusts speed toward the current target instead of snapping instantly.
  accelerate(deltaTime, targetSpeed) {
    const acceleration = 42
    const braking = 68

    if (targetSpeed > this.speed) {
      this.speed = Math.min(this.speed + acceleration * deltaTime, targetSpeed)
      return
    }

    this.speed = Math.max(this.speed - braking * deltaTime, targetSpeed)
  }

  // Evaluates signals, spacing, and speed limits before advancing along the road.
  update(deltaTime, context) {
    const { vehicleAhead, lightState } = context
    const speedLimit = Math.min(this.maxSpeed, this.currentRoad.speedLimit)
    let targetSpeed = speedLimit
    const stopProgress = this.currentRoad.getStopProgress()
    const distanceToStopLine = Math.max(
      0,
      (stopProgress - this.progress) * this.currentRoad.length,
    )

    this.travelTime += deltaTime

    if (lightState && lightState !== 'green') {
      if (distanceToStopLine <= this.safeGap) {
        targetSpeed = 0
      } else if (distanceToStopLine <= this.safeGap * 3) {
        targetSpeed = Math.min(targetSpeed, (distanceToStopLine / (this.safeGap * 3)) * speedLimit)
      }
    }

    if (vehicleAhead) {
      const gap = Math.max(
        0,
        (vehicleAhead.progress - this.progress) * this.currentRoad.length - vehicleAhead.length,
      )

      if (gap <= this.safeGap * 0.65) {
        targetSpeed = 0
      } else if (gap <= this.safeGap * 2.8) {
        targetSpeed = Math.min(targetSpeed, (gap / (this.safeGap * 2.8)) * speedLimit)
      }
    }

    this.accelerate(deltaTime, targetSpeed)

    if (this.speed <= 0.08) {
      this.stop()
      this.waitingTime += deltaTime
    }

    this.move(deltaTime)
  }

  // Draws a simple rotated car body aligned with the road direction.
  draw(ctx) {
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(Math.atan2(this.direction.y, this.direction.x))

    ctx.fillStyle = this.color
    ctx.fillRect(-this.length / 2, -this.width / 2, this.length, this.width)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.72)'
    ctx.fillRect(-this.length / 4, -this.width / 2 + 2, this.length / 2, this.width - 4)

    ctx.fillStyle = '#20262e'
    ctx.fillRect(-this.length / 2 + 2, -this.width / 2 - 1, 4, this.width + 2)
    ctx.fillRect(this.length / 2 - 6, -this.width / 2 - 1, 4, this.width + 2)
    ctx.restore()
  }
}

export default Vehicle
