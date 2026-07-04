import Road from './Road'
import Vehicle from './Vehicle'
import TrafficLight from './TrafficLight'
import Intersection from './Intersection'
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DEFAULT_CONTROLS,
  INTERSECTION_BOUNDS,
  LIGHT_DEFINITIONS,
  ROAD_DEFINITIONS,
  ROUTE_OPTIONS,
  TRAFFIC_LIGHT_STATES,
  VEHICLE_COLORS,
  YELLOW_TIME,
} from '../utils/constants'
import { clamp, deepMerge, pickRandom, pickWeightedRandom, randomRange } from '../utils/helpers'

const INTERSECTION_COOLDOWN_TICKS = 32

class Simulation {
  constructor(controls = DEFAULT_CONTROLS) {
    this.width = CANVAS_WIDTH
    this.height = CANVAS_HEIGHT
    this.roads = []
    this.vehicles = []
    this.trafficLights = []
    this.intersections = []
    this.statistics = {
      activeVehicles: 0,
      averageSpeed: 0,
      averageWaitingTime: 0,
      jamVehicles: 0,
      averageTripTime: 0,
      completedRoutes: 0,
    }
    this.running = false
    this.vehicleCounter = 0
    this.completedTrips = []
    this.spawnAccumulator = 0
    this.intersectionCooldownTicks = 0
    this.controls = deepMerge(DEFAULT_CONTROLS, controls)
    this.buildMap()
    this.applyControls(this.controls)
  }

  // Creates the road network, central intersection, and traffic lights.
  buildMap() {
    this.roads = ROAD_DEFINITIONS.map((definition) => new Road(definition))
    this.trafficLights = LIGHT_DEFINITIONS.map((definition) => {
      const timings = this.controls.lightTimings[definition.id]

      return new TrafficLight({
        ...definition,
        greenTime: timings.greenTime,
        yellowTime: YELLOW_TIME,
        redTime: timings.redTime,
      })
    })
    this.intersections = [new Intersection(INTERSECTION_BOUNDS)]
  }

  // Applies UI controls to the model without recreating the entire simulation.
  applyControls(controls) {
    this.controls = deepMerge(this.controls, controls)

    this.trafficLights.forEach((light) => {
      const timings = this.controls.lightTimings[light.id]
      light.setDurations(timings.greenTime, YELLOW_TIME, timings.redTime)
    })
  }

  // Starts advancing simulation time and enabling vehicle updates.
  start() {
    this.running = true
  }

  // Stops the simulation loop while keeping the current scene state visible.
  stop() {
    this.running = false
  }

  // Rebuilds the world state and clears accumulated vehicles and statistics.
  reset(nextControls = this.controls) {
    this.running = false
    this.vehicleCounter = 0
    this.spawnAccumulator = 0
    this.vehicles = []
    this.completedTrips = []
    this.intersectionCooldownTicks = 0
    this.statistics = {
      activeVehicles: 0,
      averageSpeed: 0,
      averageWaitingTime: 0,
      jamVehicles: 0,
      averageTripTime: 0,
      completedRoutes: 0,
    }
    this.controls = deepMerge(DEFAULT_CONTROLS, nextControls)
    this.buildMap()
    this.applyControls(this.controls)
  }

  // Advances lights, spawns vehicles, updates cars, and refreshes statistics.
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

  // Spawns new vehicles until the active count approaches the configured target.
  maybeSpawnVehicles() {
    const targetCount = this.controls.vehicleTarget
    const fillRatio = targetCount / 50
    const spawnInterval = clamp(0.7 - fillRatio * 0.45, 0.08, 0.7)

    while (
      this.spawnAccumulator >= spawnInterval &&
      this.vehicles.length < targetCount
    ) {
      this.spawnAccumulator -= spawnInterval

      if (!this.spawnVehicle()) {
        break
      }
    }
  }

  // Creates a vehicle on a weighted random entry road when there is enough free space to enter.
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

      const leadVehicle = this.getVehicleNearRoadStart(road, 48)

      if (leadVehicle) {
        continue
      }

      const destination = pickRandom(ROUTE_OPTIONS[road.id] ?? [])

      if (!destination) {
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
        route: [road.id, destination],
        color: pickRandom(VEHICLE_COLORS) ?? '#495057',
      })

      this.vehicleCounter += 1
      road.addVehicle(vehicle)
      this.vehicles.push(vehicle)
      return true
    }

    return false
  }

  // Computes up-to-date aggregate metrics for the statistics panel.
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

  // Updates every light independently according to its own configuration.
  updateTrafficLights(deltaTime) {
    this.trafficLights.forEach((light) => light.update(deltaTime))
  }

  // Advances all active vehicles and transfers them between route segments when needed.
  updateVehicles(deltaTime) {
    if (this.intersectionCooldownTicks > 0) {
      this.intersectionCooldownTicks -= 1
    }

    this.roads.forEach((road) => road.updateTraffic())

    const vehiclesSnapshot = [...this.vehicles].sort((vehicleA, vehicleB) => {
      if (vehicleA.currentRoad.id === vehicleB.currentRoad.id) {
        return vehicleB.progress - vehicleA.progress
      }

      return vehicleA.currentRoad.id.localeCompare(vehicleB.currentRoad.id)
    })

    vehiclesSnapshot.forEach((vehicle) => {
      const road = vehicle.currentRoad
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

  // Transfers queued vehicles from the stop line as soon as the light allows it.
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

  // Returns whether the next route segment has enough room to accept this vehicle.
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

  // Checks whether a road entry zone is occupied using a fixed world distance.
  getVehicleNearRoadStart(road, clearanceDistance) {
    return (
      road.vehicles.find(
        (candidate) => candidate.progress * road.length <= clearanceDistance,
      ) ?? null
    )
  }

  // Moves a vehicle to the next road in its route or marks the trip as complete.
  advanceVehicle(vehicle) {
    const currentRoad = vehicle.currentRoad

    if (!this.canVehicleEnterNextRoad(vehicle)) {
      vehicle.progress = Math.min(
        vehicle.progress,
        currentRoad.getStopProgress(vehicle),
      )
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

  // Removes a completed vehicle from the world and records its trip duration.
  finishVehicle(vehicle) {
    this.completedTrips.push(vehicle.travelTime)
    this.vehicles = this.vehicles.filter(({ id }) => id !== vehicle.id)
  }

  // Returns the road instance that matches the provided identifier.
  getRoadById(id) {
    return this.roads.find((road) => road.id === id) ?? null
  }

  // Returns the traffic light instance that matches the provided identifier.
  getTrafficLightById(id) {
    return this.trafficLights.find((light) => light.id === id) ?? null
  }

  // Draws the full city scene including roads, lights, and active vehicles.
  draw(ctx) {
    ctx.clearRect(0, 0, this.width, this.height)

    this.drawBackground(ctx)
    this.roads.forEach((road) => road.draw(ctx))
    this.intersections.forEach((intersection) => intersection.draw(ctx))
    this.drawRoadLabels(ctx)
    this.trafficLights.forEach((light) => light.draw(ctx))
    this.vehicles.forEach((vehicle) => vehicle.draw(ctx))
  }

  // Draws a simple green background with a light repeating tile pattern.
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

  // Writes direction labels and live flow intensities onto the map.
  drawRoadLabels(ctx) {
    const labelConfig = [
      {
        text: `Северный поток x${this.controls.trafficRates.north_in.toFixed(1)}`,
        x: 450,
        y: 70,
      },
      {
        text: `Южный поток x${this.controls.trafficRates.south_in.toFixed(1)}`,
        x: 500,
        y: 930,
      },
      {
        text: `Западный поток x${this.controls.trafficRates.west_in.toFixed(1)}`,
        x: 52,
        y: 400,
      },
      {
        text: `Восточный поток x${this.controls.trafficRates.east_in.toFixed(1)}`,
        x: 1300,
        y: 400,
      },
    ]

    ctx.save()
    ctx.fillStyle = 'rgba(18, 33, 46, 0.84)'
    ctx.font = '600 18px Trebuchet MS'

    labelConfig.forEach(({ text, x, y }) => {
      ctx.fillText(text, x, y)
    })

    ctx.restore()
  }
}

export default Simulation
