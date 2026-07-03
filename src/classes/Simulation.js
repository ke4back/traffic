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
import { clamp, pickRandom, randomRange } from '../utils/helpers'

class Simulation {
  constructor(controls = DEFAULT_CONTROLS) {
    this.width = CANVAS_WIDTH
    this.height = CANVAS_HEIGHT
    this.roads = []
    this.vehicles = []
    this.trafficLights = []
    this.intersections = []
    this.time = 0
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
    this.controls = { ...DEFAULT_CONTROLS, ...controls }
    this.buildMap()
    this.applyControls(this.controls)
  }

  // Creates the road network, central intersection, and synchronized traffic lights.
  buildMap() {
    this.roads = ROAD_DEFINITIONS.map((definition) => new Road(definition))
    this.trafficLights = LIGHT_DEFINITIONS.map(
      (definition) =>
        new TrafficLight({
          ...definition,
          greenTime: this.controls.greenTime,
          yellowTime: YELLOW_TIME,
          redTime: this.controls.redTime,
        }),
    )
    this.intersections = [new Intersection('central_crossing', INTERSECTION_BOUNDS)]
  }

  // Applies UI controls to the model without recreating the entire simulation.
  applyControls(controls) {
    this.controls = {
      ...this.controls,
      ...controls,
    }

    const verticalRed = this.controls.redTime + YELLOW_TIME
    const horizontalRed = this.controls.greenTime + YELLOW_TIME

    this.trafficLights.forEach((light) => {
      if (light.axis === 'vertical') {
        light.setDurations(this.controls.greenTime, YELLOW_TIME, verticalRed)
      } else {
        light.setDurations(this.controls.redTime, YELLOW_TIME, horizontalRed)
      }
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
    this.time = 0
    this.vehicleCounter = 0
    this.spawnAccumulator = 0
    this.vehicles = []
    this.completedTrips = []
    this.statistics = {
      activeVehicles: 0,
      averageSpeed: 0,
      averageWaitingTime: 0,
      jamVehicles: 0,
      averageTripTime: 0,
      completedRoutes: 0,
    }
    this.controls = { ...DEFAULT_CONTROLS, ...nextControls }
    this.buildMap()
    this.applyControls(this.controls)
  }

  // Advances lights, spawns vehicles, updates cars, and refreshes statistics.
  update(deltaTime) {
    if (!this.running) {
      return
    }

    const scaledDelta = deltaTime * this.controls.speedMultiplier

    this.time += scaledDelta
    this.spawnAccumulator += scaledDelta

    this.updateTrafficLights(scaledDelta)
    this.maybeSpawnVehicles()
    this.updateVehicles(scaledDelta)
    this.calculateStatistics()
  }

  // Spawns new vehicles until the active count approaches the configured target.
  maybeSpawnVehicles() {
    const targetCount = this.controls.vehicleTarget
    const fillRatio = targetCount / 300
    const spawnInterval = clamp(1.5 - fillRatio * 1.15, 0.22, 1.5)

    while (this.spawnAccumulator >= spawnInterval && this.vehicles.length < targetCount) {
      this.spawnAccumulator -= spawnInterval

      if (!this.spawnVehicle()) {
        break
      }
    }
  }

  // Creates a vehicle on a random entry road when there is enough free space to enter.
  spawnVehicle() {
    const entryRoads = this.roads.filter((road) => road.entry)
    const road = pickRandom(entryRoads)

    if (!road) {
      return false
    }

    const leadVehicle = road.vehicles.find((vehicle) => vehicle.progress <= 0.12)

    if (leadVehicle) {
      return false
    }

    const destination = pickRandom(ROUTE_OPTIONS[road.id] ?? [])

    if (!destination) {
      return false
    }

    const vehicle = new Vehicle({
      id: `vehicle_${this.vehicleCounter + 1}`,
      x: road.startPoint.x,
      y: road.startPoint.y,
      speed: randomRange(24, 42),
      maxSpeed: randomRange(108, 152),
      direction: road.directionVector,
      currentRoad: road,
      destination,
      waitingTime: 0,
      route: [road.id, destination],
      color: pickRandom(VEHICLE_COLORS) ?? '#495057',
      spawnedAt: this.time,
    })

    this.vehicleCounter += 1
    road.addVehicle(vehicle)
    this.vehicles.push(vehicle)
    return true
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

  // Updates every light while preserving the vertical-vs-horizontal phase relationship.
  updateTrafficLights(deltaTime) {
    this.trafficLights.forEach((light) => light.update(deltaTime))
  }

  // Advances all active vehicles and transfers them between route segments when needed.
  updateVehicles(deltaTime) {
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

      vehicle.update(deltaTime, {
        lightState,
        vehicleAhead,
      })

      if (vehicle.progress >= 1) {
        this.advanceVehicle(vehicle)
      }
    })
  }

  // Moves a vehicle to the next road in its route or marks the trip as complete.
  advanceVehicle(vehicle) {
    const currentRoad = vehicle.currentRoad
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
      nextRoad.addVehicle(vehicle)
      return
    }

    this.finishVehicle(vehicle)
  }

  // Removes a completed vehicle from the world and records its trip duration.
  finishVehicle(vehicle) {
    vehicle.finished = true
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

  // Draws decorative city blocks and green zones around the transport network.
  drawBackground(ctx) {
    ctx.save()
    ctx.fillStyle = '#d9ead3'
    ctx.fillRect(0, 0, this.width, this.height)

    const blocks = [
      { x: 70, y: 60, width: 250, height: 170, color: '#cdb4db' },
      { x: 640, y: 70, width: 230, height: 160, color: '#ffd6a5' },
      { x: 80, y: 500, width: 260, height: 150, color: '#bde0fe' },
      { x: 630, y: 500, width: 250, height: 150, color: '#caffbf' },
    ]

    blocks.forEach(({ x, y, width, height, color }) => {
      ctx.fillStyle = color
      ctx.fillRect(x, y, width, height)
      ctx.strokeStyle = 'rgba(23, 38, 51, 0.08)'
      ctx.strokeRect(x, y, width, height)
    })

    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
    for (let y = 20; y < this.height; y += 70) {
      for (let x = 20; x < this.width; x += 70) {
        ctx.fillRect(x, y, 26, 10)
      }
    }

    ctx.restore()
  }

  // Writes small labels to help users read the direction of each entry corridor.
  drawRoadLabels(ctx) {
    ctx.save()
    ctx.fillStyle = 'rgba(18, 33, 46, 0.8)'
    ctx.font = '600 14px Trebuchet MS'

    ctx.fillText('Северный поток', 388, 58)
    ctx.fillText('Южный поток', 392, 676)
    ctx.fillText('Западный поток', 42, 420)
    ctx.fillText('Восточный поток', 796, 302)
    ctx.restore()
  }
}

export default Simulation
