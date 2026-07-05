import Road from './Road'
import Vehicle from './Vehicle'
import TrafficLight from './TrafficLight'
import Intersection from './Intersection'
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DEFAULT_CONTROLS,
  TRAFFIC_LIGHT_STATES,
  VEHICLE_COLORS,
  YELLOW_TIME,
  getMapDefinition,
} from '../utils/constants'
import { clamp, deepMerge, pickRandom, pickWeightedRandom, randomRange } from '../utils/helpers'

const INTERSECTION_COOLDOWN_TICKS = 32
const INITIAL_STATISTICS = {
  activeVehicles: 0,
  averageSpeed: 0,
  averageWaitingTime: 0,
  jamVehicles: 0,
  averageTripTime: 0,
  completedRoutes: 0,
}

class Simulation {
  constructor(controls = DEFAULT_CONTROLS) {
    this.width = CANVAS_WIDTH
    this.height = CANVAS_HEIGHT
    this.roads = []
    this.vehicles = []
    this.trafficLights = []
    this.intersections = []
    this.statistics = { ...INITIAL_STATISTICS }
    this.running = false
    this.vehicleCounter = 0
    this.completedTrips = []
    this.spawnAccumulator = 0
    this.intersectionCooldownTicks = 0
    this.controls = deepMerge(DEFAULT_CONTROLS, controls)
    this.mapDefinition = getMapDefinition(this.controls.mapId)
    this.buildMap()
    this.applyControls(this.controls)
  }

  buildMap() {
    this.mapDefinition = getMapDefinition(this.controls.mapId)
    this.roads = this.mapDefinition.roads.map((definition) => new Road(definition))
    this.trafficLights = this.mapDefinition.lights.map((definition) => {
      const timings = this.controls.lightTimings[definition.id]

      return new TrafficLight({
        ...definition,
        greenTime: timings.greenTime,
        yellowTime: YELLOW_TIME,
        redTime: timings.redTime,
      })
    })
    this.intersections = this.mapDefinition.intersections.map(
      (bounds) => new Intersection(bounds),
    )
  }

  applyControls(controls) {
    this.controls = deepMerge(this.controls, controls)
    this.mapDefinition = getMapDefinition(this.controls.mapId)

    this.trafficLights.forEach((light) => {
      const timings = this.controls.lightTimings[light.id]
      if (timings) {
        light.setDurations(timings.greenTime, YELLOW_TIME, timings.redTime)
      }
    })
  }

  start() {
    this.running = true
  }

  stop() {
    this.running = false
  }

  reset(nextControls = this.controls) {
    this.running = false
    this.vehicleCounter = 0
    this.spawnAccumulator = 0
    this.vehicles = []
    this.completedTrips = []
    this.intersectionCooldownTicks = 0
    this.statistics = { ...INITIAL_STATISTICS }
    this.controls = deepMerge(DEFAULT_CONTROLS, nextControls)
    this.buildMap()
    this.applyControls(this.controls)
  }

  update(deltaTime) {
    if (!this.running) {
      return
    }

    const scaledDelta = deltaTime * this.controls.speedMultiplier

    this.spawnAccumulator += scaledDelta

    this.updateTrafficLights(scaledDelta)
    this.maybeSpawnVehicles()
    this.updateVehicles(scaledDelta)
    this.calculateStatistics()
  }

  maybeSpawnVehicles() {
    const targetCount = this.controls.vehicleTarget
    const fillRatio = targetCount / 100
    const spawnInterval = clamp(0.7 - fillRatio * 0.45, 0.08, 0.7)

    while (this.spawnAccumulator >= spawnInterval && this.vehicles.length < targetCount) {
      this.spawnAccumulator -= spawnInterval

      if (!this.spawnVehicle()) {
        break
      }
    }
  }

  spawnVehicle() {
    const entryRoads = this.roads.filter((road) => road.entry)
    const attemptedRoadIds = new Set()

    while (attemptedRoadIds.size < entryRoads.length) {
      const road = pickWeightedRandom(
        entryRoads.filter((entryRoad) => !attemptedRoadIds.has(entryRoad.id)),
        (entryRoad) => this.controls.trafficRates[entryRoad.id] ?? 1,
      )

      if (!road) {
        return false
      }

      attemptedRoadIds.add(road.id)

      if (this.getVehicleNearRoadStart(road, 48)) {
        continue
      }

      const routeTail = pickRandom(this.mapDefinition.routeOptions[road.id] ?? [])

      if (!routeTail?.length) {
        continue
      }

      const vehicle = new Vehicle({
        id: `vehicle_${this.vehicleCounter + 1}`,
        x: road.startPoint.x,
        y: road.startPoint.y,
        speed: randomRange(22, 36),
        maxSpeed: randomRange(100, 142),
        direction: road.directionVector,
        currentRoad: road,
        waitingTime: 0,
        route: [road.id, ...routeTail],
        color: pickRandom(VEHICLE_COLORS) ?? '#495057',
      })

      this.vehicleCounter += 1
      road.addVehicle(vehicle)
      this.vehicles.push(vehicle)
      return true
    }

    return false
  }

  calculateStatistics() {
    const activeVehicles = this.vehicles.length
    const completedRoutes = this.completedTrips.length
    const averageSpeed =
      activeVehicles > 0
        ? this.vehicles.reduce((sum, vehicle) => sum + vehicle.speed, 0) / activeVehicles
        : 0
    const averageWaitingTime =
      activeVehicles > 0
        ? this.vehicles.reduce((sum, vehicle) => sum + vehicle.waitingTime, 0) / activeVehicles
        : 0
    const jamVehicles = this.vehicles.filter(
      (vehicle) => vehicle.speed < 6 && vehicle.waitingTime > 2,
    ).length
    const averageTripTime =
      completedRoutes > 0
        ? this.completedTrips.reduce((sum, tripTime) => sum + tripTime, 0) / completedRoutes
        : 0

    this.statistics = {
      activeVehicles,
      averageSpeed,
      averageWaitingTime,
      jamVehicles,
      averageTripTime,
      completedRoutes,
    }

    return { ...this.statistics }
  }

  updateTrafficLights(deltaTime) {
    this.trafficLights.forEach((light) => light.update(deltaTime))
  }

  updateVehicles(deltaTime) {
    this.intersectionCooldownTicks = Math.max(0, this.intersectionCooldownTicks - 1)

    this.roads.forEach((road) => road.updateTraffic())

    const vehiclesSnapshot = [...this.vehicles].sort((vehicleA, vehicleB) => {
      if (vehicleA.currentRoad.id === vehicleB.currentRoad.id) {
        return vehicleB.progress - vehicleA.progress
      }

      return vehicleA.currentRoad.id.localeCompare(vehicleB.currentRoad.id)
    })

    vehiclesSnapshot.forEach((vehicle) => {
      const { currentRoad: road } = vehicle
      const vehicleAhead = road.getVehicleAhead(vehicle)
      const light = road.controlledBy ? this.getTrafficLightById(road.controlledBy) : null
      const lightState = light ? light.state : TRAFFIC_LIGHT_STATES.GREEN
      const canExitRoad = this.canVehicleEnterNextRoad(vehicle)

      vehicle.update(deltaTime, {
        lightState,
        vehicleAhead,
        canExitRoad,
        breakdownChance: this.controls.breakdownChance,
      })

      if (this.shouldAdvanceVehicle(vehicle, lightState, canExitRoad)) {
        this.advanceVehicle(vehicle)
      }
    })
  }

  shouldAdvanceVehicle(vehicle, lightState, canExitRoad) {
    if (vehicle.progress >= 1) {
      return true
    }

    if (!canExitRoad || !vehicle.currentRoad.controlledBy) {
      return false
    }

    if (this.intersectionCooldownTicks > 0) {
      return false
    }

    if (lightState !== TRAFFIC_LIGHT_STATES.GREEN) {
      return false
    }

    const stopProgress = vehicle.currentRoad.getStopProgress(vehicle)
    return vehicle.progress >= stopProgress - 0.0001
  }

  canVehicleEnterNextRoad(vehicle) {
    if (vehicle.routeIndex >= vehicle.route.length - 1) {
      return true
    }

    const nextRoad = this.getRoadById(vehicle.route[vehicle.routeIndex + 1])

    if (!nextRoad) {
      return true
    }

    const roadStartVehicle = this.getVehicleNearRoadStart(nextRoad, 52)
    return !roadStartVehicle
  }

  getVehicleNearRoadStart(road, clearanceDistance) {
    return (
      road.vehicles.find(
        (candidate) => candidate.progress * road.length <= clearanceDistance,
      ) ?? null
    )
  }

  advanceVehicle(vehicle) {
    const currentRoad = vehicle.currentRoad
    const stopProgress = currentRoad.getStopProgress(vehicle)

    if (!this.canVehicleEnterNextRoad(vehicle)) {
      vehicle.progress = Math.min(vehicle.progress, stopProgress)
      const point = currentRoad.getPointAt(vehicle.progress)
      vehicle.x = point.x
      vehicle.y = point.y
      vehicle.stop()
      return
    }

    currentRoad.removeVehicle(vehicle)

    if (vehicle.routeIndex < vehicle.route.length - 1) {
      vehicle.routeIndex += 1
      const nextRoadId = vehicle.route[vehicle.routeIndex]
      const nextRoad = this.getRoadById(nextRoadId)

      if (!nextRoad) {
        this.finishVehicle(vehicle)
        return
      }

      vehicle.currentRoad = nextRoad
      vehicle.direction = nextRoad.directionVector
      vehicle.progress = 0
      vehicle.x = nextRoad.startPoint.x
      vehicle.y = nextRoad.startPoint.y
      this.intersectionCooldownTicks = INTERSECTION_COOLDOWN_TICKS
      nextRoad.addVehicle(vehicle)
      return
    }

    this.finishVehicle(vehicle)
  }

  finishVehicle(vehicle) {
    this.completedTrips.push(vehicle.travelTime)
    this.vehicles = this.vehicles.filter(({ id }) => id !== vehicle.id)
  }

  getRoadById(id) {
    return this.roads.find((road) => road.id === id) ?? null
  }

  getTrafficLightById(id) {
    return this.trafficLights.find((light) => light.id === id) ?? null
  }

  getTrafficLightAtPoint(x, y) {
    return this.trafficLights.find((light) => light.containsPoint(x, y)) ?? null
  }

  draw(ctx) {
    ctx.clearRect(0, 0, this.width, this.height)

    this.drawBackground(ctx)
    this.roads.forEach((road) => road.draw(ctx))
    this.intersections.forEach((intersection) => intersection.draw(ctx))
    this.drawRoadLabels(ctx)
    this.trafficLights.forEach((light) => light.draw(ctx))
    this.vehicles.forEach((vehicle) => vehicle.draw(ctx))
  }

  drawBackground(ctx) {
    ctx.save()
    ctx.fillStyle = '#d8ead0'
    ctx.fillRect(0, 0, this.width, this.height)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.24)'
    for (let y = 18; y < this.height; y += 78) {
      for (let x = 18; x < this.width; x += 78) {
        ctx.fillRect(x, y, 28, 12)
      }
    }

    ctx.restore()
  }

  drawRoadLabels(ctx) {
    ctx.save()
    ctx.fillStyle = 'rgba(18, 33, 46, 0.84)'
    ctx.font = '600 18px Trebuchet MS'

    this.mapDefinition.trafficRateMeta.forEach(({ id, label, x, y }) => {
      ctx.fillText(`${label} x${(this.controls.trafficRates[id] ?? 0).toFixed(1)}`, x, y)
    })

    ctx.restore()
  }
}

export default Simulation
