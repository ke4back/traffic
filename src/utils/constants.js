export const CANVAS_WIDTH = 960
export const CANVAS_HEIGHT = 720
export const ROAD_WIDTH = 56
export const VEHICLE_LENGTH = 22
export const VEHICLE_WIDTH = 12
export const SAFE_GAP = 26
export const STOP_MARGIN = 26
export const YELLOW_TIME = 2
export const SPEED_OPTIONS = [0.5, 1, 2, 4]

export const DEFAULT_CONTROLS = {
  vehicleTarget: 80,
  speedMultiplier: 1,
  greenTime: 8,
  redTime: 8,
}

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

export const INTERSECTION_BOUNDS = {
  left: 420,
  right: 540,
  top: 300,
  bottom: 420,
}

export const INTERSECTION_CENTER = {
  x: (INTERSECTION_BOUNDS.left + INTERSECTION_BOUNDS.right) / 2,
  y: (INTERSECTION_BOUNDS.top + INTERSECTION_BOUNDS.bottom) / 2,
}

export const INTERSECTION_POINTS = {
  northIn: { x: 450, y: 300 },
  northOut: { x: 510, y: 300 },
  southIn: { x: 510, y: 420 },
  southOut: { x: 450, y: 420 },
  westIn: { x: 420, y: 390 },
  westOut: { x: 420, y: 330 },
  eastIn: { x: 540, y: 330 },
  eastOut: { x: 540, y: 390 },
}

export const ROAD_DEFINITIONS = [
  {
    id: 'north_in',
    startPoint: { x: 450, y: 30 },
    endPoint: INTERSECTION_POINTS.northIn,
    lanes: 1,
    speedLimit: 120,
    controlledBy: 'north_light',
    entry: true,
    exit: false,
    axis: 'vertical',
  },
  {
    id: 'north_out',
    startPoint: INTERSECTION_POINTS.northOut,
    endPoint: { x: 510, y: 30 },
    lanes: 1,
    speedLimit: 140,
    entry: false,
    exit: true,
    axis: 'vertical',
  },
  {
    id: 'south_in',
    startPoint: { x: 510, y: 690 },
    endPoint: INTERSECTION_POINTS.southIn,
    lanes: 1,
    speedLimit: 120,
    controlledBy: 'south_light',
    entry: true,
    exit: false,
    axis: 'vertical',
  },
  {
    id: 'south_out',
    startPoint: INTERSECTION_POINTS.southOut,
    endPoint: { x: 450, y: 690 },
    lanes: 1,
    speedLimit: 140,
    entry: false,
    exit: true,
    axis: 'vertical',
  },
  {
    id: 'west_in',
    startPoint: { x: 30, y: 390 },
    endPoint: INTERSECTION_POINTS.westIn,
    lanes: 1,
    speedLimit: 120,
    controlledBy: 'west_light',
    entry: true,
    exit: false,
    axis: 'horizontal',
  },
  {
    id: 'west_out',
    startPoint: INTERSECTION_POINTS.westOut,
    endPoint: { x: 30, y: 330 },
    lanes: 1,
    speedLimit: 140,
    entry: false,
    exit: true,
    axis: 'horizontal',
  },
  {
    id: 'east_in',
    startPoint: { x: 930, y: 330 },
    endPoint: INTERSECTION_POINTS.eastIn,
    lanes: 1,
    speedLimit: 120,
    controlledBy: 'east_light',
    entry: true,
    exit: false,
    axis: 'horizontal',
  },
  {
    id: 'east_out',
    startPoint: INTERSECTION_POINTS.eastOut,
    endPoint: { x: 930, y: 390 },
    lanes: 1,
    speedLimit: 140,
    entry: false,
    exit: true,
    axis: 'horizontal',
  },
]

export const LIGHT_DEFINITIONS = [
  {
    id: 'north_light',
    x: 468,
    y: 286,
    axis: 'vertical',
    initialState: TRAFFIC_LIGHT_STATES.GREEN,
  },
  {
    id: 'south_light',
    x: 492,
    y: 434,
    axis: 'vertical',
    initialState: TRAFFIC_LIGHT_STATES.GREEN,
  },
  {
    id: 'west_light',
    x: 434,
    y: 372,
    axis: 'horizontal',
    initialState: TRAFFIC_LIGHT_STATES.RED,
  },
  {
    id: 'east_light',
    x: 526,
    y: 348,
    axis: 'horizontal',
    initialState: TRAFFIC_LIGHT_STATES.RED,
  },
]

export const ROUTE_OPTIONS = {
  north_in: ['south_out', 'east_out', 'west_out'],
  south_in: ['north_out', 'east_out', 'west_out'],
  west_in: ['east_out', 'north_out', 'south_out'],
  east_in: ['west_out', 'north_out', 'south_out'],
}
