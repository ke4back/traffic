import {
  SAFE_GAP,
  VEHICLE_LENGTH,
  VEHICLE_REPAIR_TICKS,
  VEHICLE_WIDTH,
} from '../utils/constants'
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
    waitingTime = 0,
    route,
    color,
  }) {
    this.id = id
    this.x = x
    this.y = y
    this.speed = speed
    this.maxSpeed = maxSpeed
    this.direction = direction
    this.currentRoad = currentRoad
    this.waitingTime = waitingTime
    this.route = route
    this.color = color
    this.travelTime = 0
    this.progress = 0
    this.routeIndex = 0
    this.length = VEHICLE_LENGTH
    this.width = VEHICLE_WIDTH
    this.safeGap = SAFE_GAP + randomRange(0, 10)
    this.isBroken = false
    this.repairTicksRemaining = 0
  }

  // Moves the vehicle forward along the current road according to its speed.
  move(deltaTime, maxProgress = 1.15) {
    const distance = this.speed * deltaTime
    const progressStep = this.currentRoad.length > 0 ? distance / this.currentRoad.length : 0
    const desiredProgress = this.progress + progressStep
    const nextProgress = clamp(Math.min(desiredProgress, maxProgress), 0, 1.15)

    if (nextProgress <= this.progress + 0.0001 && this.speed > 0.2) {
      this.speed = 0
    }

    this.progress = nextProgress

    const point = this.currentRoad.getPointAt(this.progress)
    this.x = point.x
    this.y = point.y
  }

  // Fully stops the vehicle when the light or another car blocks the path.
  stop() {
    this.speed = 0
  }

  // Instantly switches between a full-speed state and a complete stop.
  accelerate(targetSpeed) {
    this.speed = targetSpeed
  }

  // Starts a repair pause that leaves the car blocking its current lane.
  breakDown() {
    this.isBroken = true
    this.repairTicksRemaining = VEHICLE_REPAIR_TICKS
    this.stop()
  }

  // Evaluates signals, spacing, and speed limits before advancing along the road.
  update(deltaTime, context) {
    const { vehicleAhead, lightState, canExitRoad, breakdownChance = 0 } = context
    this.travelTime += deltaTime

    if (this.isBroken) {
      this.repairTicksRemaining = Math.max(0, this.repairTicksRemaining - 1)
      this.waitingTime += deltaTime
      this.stop()

      if (this.repairTicksRemaining === 0) {
        this.isBroken = false
      }

      return
    }

    const speedLimit = Math.min(this.maxSpeed, this.currentRoad.speedLimit)
    let targetSpeed = speedLimit
    let maxProgress = 1.15
    const stopProgress = this.currentRoad.getStopProgress(this)
    const distanceToStopLine = Math.max(
      0,
      (stopProgress - this.progress) * this.currentRoad.length,
    )
    const shouldStopAtLine = distanceToStopLine <= this.safeGap

    if (lightState && lightState !== 'green') {
      if (shouldStopAtLine) {
        targetSpeed = 0
        maxProgress = Math.min(maxProgress, stopProgress)
      }
    }

    if (vehicleAhead) {
      const gap = Math.max(
        0,
        (vehicleAhead.progress - this.progress) * this.currentRoad.length -
          vehicleAhead.length,
      )

      const maxSafeProgress = this.currentRoad.getMaxSafeProgress(
        this,
        1.15,
        this.safeGap,
      )

      maxProgress = Math.min(maxProgress, maxSafeProgress)

      if (gap <= this.safeGap) {
        targetSpeed = 0
      }
    }

    if (!canExitRoad) {
      if (shouldStopAtLine) {
        targetSpeed = 0
        maxProgress = Math.min(maxProgress, stopProgress)
      }
    }

    if (this.speed > 0.08 && breakdownChance > 0 && Math.random() < breakdownChance) {
      this.breakDown()
      this.waitingTime += deltaTime
      return
    }

    this.accelerate(targetSpeed)

    if (this.speed <= 0.08) {
      this.stop()
      this.waitingTime += deltaTime
    }

    this.move(deltaTime, maxProgress)
  }

  // Draws a simple rotated car body aligned with the road direction.
  draw(ctx) {
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(Math.atan2(this.direction.y, this.direction.x))

    ctx.fillStyle = this.color
    ctx.fillRect(-this.length / 2, -this.width / 2, this.length, this.width)

    if (this.isBroken) {
      ctx.fillStyle = '#c92a2a'
      ctx.fillRect(-4, -this.width / 2 - 5, 8, 4)
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.72)'
    ctx.fillRect(-this.length / 4, -this.width / 2 + 2, this.length / 2, this.width - 4)

    ctx.fillStyle = '#20262e'
    ctx.fillRect(-this.length / 2 + 2, -this.width / 2 - 1, 4, this.width + 2)
    ctx.fillRect(this.length / 2 - 6, -this.width / 2 - 1, 4, this.width + 2)
    ctx.restore()
  }
}

export default Vehicle
