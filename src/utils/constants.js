export const CANVAS_WIDTH = 1500
export const CANVAS_HEIGHT = 980
export const ROAD_WIDTH = 64
export const VEHICLE_LENGTH = 24
export const VEHICLE_WIDTH = 13
export const SAFE_GAP = 17
export const STOP_MARGIN = 34
export const YELLOW_TIME = 2
export const SPEED_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
export const VEHICLE_REPAIR_TICKS = 256

export const TRAFFIC_LIGHT_STATES = {
  RED: 'red',
  YELLOW: 'yellow',
  GREEN: 'green',
}

export const VEHICLE_COLORS = [
  '#ea5a47',
  '#5c7cfa',
  '#2f9e62',
  '#f59f00',
  '#7b61ff',
  '#0ca678',
  '#d6336c',
  '#495057',
  '#00b4d8',
  '#9c6644',
]

const createIntersectionPoints = (bounds) => ({
  northIn: { x: bounds.left + 46, y: bounds.top },
  northOut: { x: bounds.right - 46, y: bounds.top },
  southIn: { x: bounds.right - 46, y: bounds.bottom },
  southOut: { x: bounds.left + 46, y: bounds.bottom },
  westIn: { x: bounds.left, y: bounds.bottom - 46 },
  westOut: { x: bounds.left, y: bounds.top + 46 },
  eastIn: { x: bounds.right, y: bounds.top + 46 },
  eastOut: { x: bounds.right, y: bounds.bottom - 46 },
})

const createNode = ({ prefix, title, bounds }) => {
  const points = createIntersectionPoints(bounds)

  const roads = [
    {
      id: `${prefix}_north_in`,
      startPoint: { x: points.northIn.x, y: 0 },
      endPoint: points.northIn,
      speedLimit: 126,
      controlledBy: `${prefix}_north_light`,
      entry: true,
      exit: false,
    },
    {
      id: `${prefix}_north_out`,
      startPoint: points.northOut,
      endPoint: { x: points.northOut.x, y: 0 },
      speedLimit: 150,
      entry: false,
      exit: true,
    },
    {
      id: `${prefix}_south_in`,
      startPoint: { x: points.southIn.x, y: CANVAS_HEIGHT },
      endPoint: points.southIn,
      speedLimit: 118,
      controlledBy: `${prefix}_south_light`,
      entry: true,
      exit: false,
    },
    {
      id: `${prefix}_south_out`,
      startPoint: points.southOut,
      endPoint: { x: points.southOut.x, y: CANVAS_HEIGHT },
      speedLimit: 150,
      entry: false,
      exit: true,
    },
    {
      id: `${prefix}_west_in`,
      startPoint: { x: 0, y: points.westIn.y },
      endPoint: points.westIn,
      speedLimit: 112,
      controlledBy: `${prefix}_west_light`,
      entry: true,
      exit: false,
    },
    {
      id: `${prefix}_west_out`,
      startPoint: points.westOut,
      endPoint: { x: 0, y: points.westOut.y },
      speedLimit: 144,
      entry: false,
      exit: true,
    },
    {
      id: `${prefix}_east_in`,
      startPoint: { x: CANVAS_WIDTH, y: points.eastIn.y },
      endPoint: points.eastIn,
      speedLimit: 116,
      controlledBy: `${prefix}_east_light`,
      entry: true,
      exit: false,
    },
    {
      id: `${prefix}_east_out`,
      startPoint: points.eastOut,
      endPoint: { x: CANVAS_WIDTH, y: points.eastOut.y },
      speedLimit: 144,
      entry: false,
      exit: true,
    },
  ]

  const lights = [
    {
      id: `${prefix}_north_light`,
      x: points.northIn.x + 20,
      y: bounds.top - 20,
      label: `${title}: север`,
      initialState: TRAFFIC_LIGHT_STATES.GREEN,
    },
    {
      id: `${prefix}_south_light`,
      x: points.southIn.x - 20,
      y: bounds.bottom + 20,
      label: `${title}: юг`,
      initialState: TRAFFIC_LIGHT_STATES.RED,
    },
    {
      id: `${prefix}_west_light`,
      x: bounds.left - 20,
      y: points.westIn.y - 24,
      label: `${title}: запад`,
      initialState: TRAFFIC_LIGHT_STATES.RED,
    },
    {
      id: `${prefix}_east_light`,
      x: bounds.right + 20,
      y: points.eastIn.y + 24,
      label: `${title}: восток`,
      initialState: TRAFFIC_LIGHT_STATES.GREEN,
    },
  ]

  const trafficRateMeta = [
    {
      id: `${prefix}_north_in`,
      label: `${title}: с севера`,
      x: bounds.left + 168,
      y: Math.max(50, bounds.top - 150),
    },
    {
      id: `${prefix}_south_in`,
      label: `${title}: с юга`,
      x: bounds.left + 188,
      y: Math.min(930, bounds.bottom + 170),
    },
    {
      id: `${prefix}_west_in`,
      label: `${title}: с запада`,
      x: Math.max(40, bounds.left - 260),
      y: bounds.top - 14,
    },
    {
      id: `${prefix}_east_in`,
      label: `${title}: с востока`,
      x: Math.min(1240, bounds.right + 40),
      y: bounds.top - 14,
    },
  ]

  const routeOptions = {
    [`${prefix}_north_in`]: [
      [`${prefix}_south_out`],
      [`${prefix}_east_out`],
      [`${prefix}_west_out`],
    ],
    [`${prefix}_south_in`]: [
      [`${prefix}_north_out`],
      [`${prefix}_east_out`],
      [`${prefix}_west_out`],
    ],
    [`${prefix}_west_in`]: [
      [`${prefix}_east_out`],
      [`${prefix}_north_out`],
      [`${prefix}_south_out`],
    ],
    [`${prefix}_east_in`]: [
      [`${prefix}_west_out`],
      [`${prefix}_north_out`],
      [`${prefix}_south_out`],
    ],
  }

  return {
    bounds,
    points,
    roads,
    lights,
    trafficRateMeta,
    routeOptions,
  }
}

const createConnectionRoad = ({
  id,
  startPoint,
  endPoint,
  controlledBy,
  speedLimit = 136,
}) => ({
  id,
  startPoint,
  endPoint,
  speedLimit,
  controlledBy,
  entry: false,
  exit: false,
})

const extendRoutes = (routeOptions, additions) =>
  Object.entries(additions).reduce((next, [roadId, routes]) => {
    next[roadId] = [...(next[roadId] ?? []), ...routes]
    return next
  }, { ...routeOptions })

const replaceRoutes = (routeOptions, replacements) => ({
  ...routeOptions,
  ...replacements,
})

const filterNodeRoads = (node, blockedRoadIds) =>
  node.roads.filter((road) => !blockedRoadIds.includes(road.id))

const filterTrafficMeta = (node, blockedMetaIds) =>
  node.trafficRateMeta.filter((meta) => !blockedMetaIds.includes(meta.id))

const createSingleMap = () => {
  const node = createNode({
    prefix: 'single',
    title: 'Центр',
    bounds: { left: 670, right: 830, top: 410, bottom: 570 },
  })

  return {
    id: 'single_cross',
    name: 'Один перекрёсток',
    intersections: [node.bounds],
    roads: node.roads,
    lights: node.lights,
    trafficRateMeta: node.trafficRateMeta,
    routeOptions: node.routeOptions,
  }
}

const createDoubleMap = () => {
  const nodeA = createNode({
    prefix: 'downtown_a',
    title: 'Узел A',
    bounds: { left: 250, right: 410, top: 410, bottom: 570 },
  })
  const nodeB = createNode({
    prefix: 'downtown_b',
    title: 'Узел B',
    bounds: { left: 960, right: 1120, top: 410, bottom: 570 },
  })

  const blockedRoadIds = [
    'downtown_a_east_in',
    'downtown_a_east_out',
    'downtown_b_west_in',
    'downtown_b_west_out',
  ]

  const roads = [
    ...filterNodeRoads(nodeA, blockedRoadIds),
    ...filterNodeRoads(nodeB, blockedRoadIds),
    createConnectionRoad({
      id: 'downtown_a_to_b',
      startPoint: nodeA.points.eastOut,
      endPoint: nodeB.points.westIn,
      controlledBy: 'downtown_b_west_light',
    }),
    createConnectionRoad({
      id: 'downtown_b_to_a',
      startPoint: nodeB.points.westOut,
      endPoint: nodeA.points.eastIn,
      controlledBy: 'downtown_a_east_light',
    }),
  ]

  const routeOptions = replaceRoutes(extendRoutes(
    { ...nodeA.routeOptions, ...nodeB.routeOptions },
    {
      downtown_a_north_in: [
        ['downtown_a_to_b', 'downtown_b_north_out'],
        ['downtown_a_to_b', 'downtown_b_south_out'],
      ],
      downtown_a_south_in: [
        ['downtown_a_to_b', 'downtown_b_north_out'],
        ['downtown_a_to_b', 'downtown_b_south_out'],
      ],
      downtown_a_west_in: [['downtown_a_to_b', 'downtown_b_east_out']],
      downtown_a_east_in: [
        ['downtown_a_to_b', 'downtown_b_north_out'],
        ['downtown_a_to_b', 'downtown_b_south_out'],
      ],
      downtown_b_north_in: [
        ['downtown_b_to_a', 'downtown_a_north_out'],
        ['downtown_b_to_a', 'downtown_a_south_out'],
      ],
      downtown_b_south_in: [
        ['downtown_b_to_a', 'downtown_a_north_out'],
        ['downtown_b_to_a', 'downtown_a_south_out'],
      ],
      downtown_b_west_in: [
        ['downtown_b_to_a', 'downtown_a_north_out'],
        ['downtown_b_to_a', 'downtown_a_south_out'],
      ],
      downtown_b_east_in: [['downtown_b_to_a', 'downtown_a_west_out']],
    },
  ), {
    downtown_a_north_in: [
      ['downtown_a_south_out'],
      ['downtown_a_west_out'],
      ['downtown_a_to_b', 'downtown_b_north_out'],
      ['downtown_a_to_b', 'downtown_b_south_out'],
    ],
    downtown_a_south_in: [
      ['downtown_a_north_out'],
      ['downtown_a_west_out'],
      ['downtown_a_to_b', 'downtown_b_north_out'],
      ['downtown_a_to_b', 'downtown_b_south_out'],
    ],
    downtown_a_west_in: [
      ['downtown_a_north_out'],
      ['downtown_a_south_out'],
      ['downtown_a_to_b', 'downtown_b_east_out'],
    ],
    downtown_b_north_in: [
      ['downtown_b_south_out'],
      ['downtown_b_east_out'],
      ['downtown_b_to_a', 'downtown_a_north_out'],
      ['downtown_b_to_a', 'downtown_a_south_out'],
    ],
    downtown_b_south_in: [
      ['downtown_b_north_out'],
      ['downtown_b_east_out'],
      ['downtown_b_to_a', 'downtown_a_north_out'],
      ['downtown_b_to_a', 'downtown_a_south_out'],
    ],
    downtown_b_east_in: [
      ['downtown_b_north_out'],
      ['downtown_b_south_out'],
      ['downtown_b_to_a', 'downtown_a_west_out'],
    ],
  })

  return {
    id: 'double_cross',
    name: 'Два перекрёстка',
    intersections: [nodeA.bounds, nodeB.bounds],
    roads,
    lights: [...nodeA.lights, ...nodeB.lights],
    trafficRateMeta: [
      ...filterTrafficMeta(nodeA, ['downtown_a_east_in']),
      ...filterTrafficMeta(nodeB, ['downtown_b_west_in']),
    ],
    routeOptions,
  }
}

const createTripleMap = () => {
  const nodeA = createNode({
    prefix: 'ring_a',
    title: 'Северо-западный узел',
    bounds: { left: 220, right: 380, top: 180, bottom: 340 },
  })
  const nodeB = createNode({
    prefix: 'ring_b',
    title: 'Северо-восточный узел',
    bounds: { left: 820, right: 980, top: 180, bottom: 340 },
  })
  const nodeC = createNode({
    prefix: 'ring_c',
    title: 'Южный узел',
    bounds: { left: 820, right: 980, top: 620, bottom: 780 },
  })

  const blockedRoadIds = [
    'ring_a_east_in',
    'ring_a_east_out',
    'ring_b_west_in',
    'ring_b_west_out',
    'ring_b_south_in',
    'ring_b_south_out',
    'ring_c_north_in',
    'ring_c_north_out',
    'ring_c_west_in',
    'ring_c_west_out',
  ]

  const roads = [
    ...filterNodeRoads(nodeA, blockedRoadIds),
    ...filterNodeRoads(nodeB, blockedRoadIds),
    ...filterNodeRoads(nodeC, blockedRoadIds),
    createConnectionRoad({
      id: 'ring_a_to_b',
      startPoint: nodeA.points.eastOut,
      endPoint: nodeB.points.westIn,
      controlledBy: 'ring_b_west_light',
    }),
    createConnectionRoad({
      id: 'ring_b_to_a',
      startPoint: nodeB.points.westOut,
      endPoint: nodeA.points.eastIn,
      controlledBy: 'ring_a_east_light',
    }),
    createConnectionRoad({
      id: 'ring_b_to_c',
      startPoint: nodeB.points.southOut,
      endPoint: nodeC.points.northIn,
      controlledBy: 'ring_c_north_light',
    }),
    createConnectionRoad({
      id: 'ring_c_to_b',
      startPoint: nodeC.points.northOut,
      endPoint: nodeB.points.southIn,
      controlledBy: 'ring_b_south_light',
    }),
  ]

  const routeOptions = replaceRoutes(extendRoutes(
    { ...nodeA.routeOptions, ...nodeB.routeOptions, ...nodeC.routeOptions },
    {
      ring_a_north_in: [
        ['ring_a_to_b', 'ring_b_north_out'],
        ['ring_a_to_b', 'ring_b_to_c', 'ring_c_south_out'],
      ],
      ring_a_south_in: [
        ['ring_a_to_b', 'ring_b_south_out'],
        ['ring_a_to_b', 'ring_b_to_c', 'ring_c_east_out'],
      ],
      ring_a_west_in: [
        ['ring_a_to_b', 'ring_b_east_out'],
        ['ring_a_to_b', 'ring_b_to_c', 'ring_c_north_out'],
      ],
      ring_a_east_in: [['ring_a_to_b', 'ring_b_north_out']],
      ring_b_north_in: [
        ['ring_b_to_a', 'ring_a_north_out'],
        ['ring_b_to_c', 'ring_c_south_out'],
      ],
      ring_b_south_in: [['ring_b_to_a', 'ring_a_west_out']],
      ring_b_west_in: [['ring_b_to_c', 'ring_c_east_out']],
      ring_b_east_in: [['ring_b_to_a', 'ring_a_south_out']],
      ring_c_north_in: [
        ['ring_c_to_b', 'ring_b_to_a', 'ring_a_north_out'],
        ['ring_c_to_b', 'ring_b_east_out'],
      ],
      ring_c_south_in: [
        ['ring_c_east_out'],
        ['ring_c_to_b', 'ring_b_to_a', 'ring_a_west_out'],
        ['ring_c_to_b', 'ring_b_south_out'],
      ],
      ring_c_east_in: [
        ['ring_c_to_b', 'ring_b_west_out'],
        ['ring_c_to_b', 'ring_b_to_a', 'ring_a_north_out'],
      ],
    },
  ), {
    ring_a_north_in: [
      ['ring_a_south_out'],
      ['ring_a_west_out'],
      ['ring_a_to_b', 'ring_b_north_out'],
      ['ring_a_to_b', 'ring_b_to_c', 'ring_c_south_out'],
    ],
    ring_a_south_in: [
      ['ring_a_north_out'],
      ['ring_a_west_out'],
      ['ring_a_to_b', 'ring_b_south_out'],
      ['ring_a_to_b', 'ring_b_to_c', 'ring_c_east_out'],
    ],
    ring_a_west_in: [
      ['ring_a_north_out'],
      ['ring_a_south_out'],
      ['ring_a_to_b', 'ring_b_east_out'],
      ['ring_a_to_b', 'ring_b_to_c', 'ring_c_north_out'],
    ],
    ring_b_north_in: [
      ['ring_b_east_out'],
      ['ring_b_to_a', 'ring_a_north_out'],
      ['ring_b_to_c', 'ring_c_south_out'],
    ],
    ring_b_east_in: [
      ['ring_b_north_out'],
      ['ring_b_to_a', 'ring_a_south_out'],
    ],
    ring_c_south_in: [
      ['ring_c_east_out'],
      ['ring_c_to_b', 'ring_b_to_a', 'ring_a_west_out'],
      ['ring_c_to_b', 'ring_b_south_out'],
    ],
    ring_c_east_in: [
      ['ring_c_south_out'],
      ['ring_c_to_b', 'ring_b_to_a', 'ring_a_north_out'],
    ],
  })

  delete routeOptions.ring_c_west_in

  return {
    id: 'ring_route',
    name: 'Три перекрёстка',
    intersections: [nodeA.bounds, nodeB.bounds, nodeC.bounds],
    roads,
    lights: [
      ...nodeA.lights,
      ...nodeB.lights,
      ...nodeC.lights.filter((light) => light.id !== 'ring_c_west_light'),
    ],
    trafficRateMeta: [
      ...filterTrafficMeta(nodeA, ['ring_a_east_in']),
      ...filterTrafficMeta(nodeB, ['ring_b_west_in', 'ring_b_south_in']),
      ...filterTrafficMeta(nodeC, ['ring_c_north_in', 'ring_c_west_in']),
    ],
    routeOptions,
  }
}

export const MAP_DEFINITIONS = [
  createSingleMap(),
  createDoubleMap(),
  createTripleMap(),
]

export const MAP_OPTIONS = MAP_DEFINITIONS.map(({ id, name }) => ({ id, name }))
export const DEFAULT_MAP_ID = MAP_DEFINITIONS[0].id

export function getMapDefinition(mapId) {
  return MAP_DEFINITIONS.find((map) => map.id === mapId) ?? MAP_DEFINITIONS[0]
}

export function createMapControls(mapId) {
  const map = getMapDefinition(mapId)

  return {
    mapId: map.id,
    vehicleTarget: 40,
    speedMultiplier: 1,
    breakdownChance: 0,
    lightTimings: Object.fromEntries(
      map.lights.map((light) => [light.id, { greenTime: 5, redTime: 5 }]),
    ),
    trafficRates: Object.fromEntries(map.trafficRateMeta.map((meta) => [meta.id, 1])),
  }
}

export const DEFAULT_CONTROLS = createMapControls(DEFAULT_MAP_ID)
