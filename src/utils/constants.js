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

export const DEFAULT_CONTROLS = {
  vehicleTarget: 40,
  speedMultiplier: 1,
  breakdownChance: 0,
  lightTimings: {
    north_light: { greenTime: 5, redTime: 5 },
    south_light: { greenTime: 5, redTime: 5 },
    west_light: { greenTime: 5, redTime: 5 },
    east_light: { greenTime: 5, redTime: 5 },
  },
  trafficRates: {
    north_in: 1.8,
    south_in: 1.15,
    west_in: 0.65,
    east_in: 1.0,
  },
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
  left: 670,
  right: 830,
  top: 410,
  bottom: 570,
}

export const INTERSECTION_POINTS = {
  northIn: { x: 716, y: 410 },
  northOut: { x: 784, y: 410 },
  southIn: { x: 784, y: 570 },
  southOut: { x: 716, y: 570 },
  westIn: { x: 670, y: 524 },
  westOut: { x: 670, y: 456 },
  eastIn: { x: 830, y: 456 },
  eastOut: { x: 830, y: 524 },
}

export const ROAD_DEFINITIONS = [
  {
    id: 'north_in',
    startPoint: { x: 716, y: 40 },
    endPoint: INTERSECTION_POINTS.northIn,
    lanes: 1,
    speedLimit: 126,
    controlledBy: 'north_light',
    entry: true,
    exit: false,
    axis: 'vertical',
    label: 'Север',
  },
  {
    id: 'north_out',
    startPoint: INTERSECTION_POINTS.northOut,
    endPoint: { x: 784, y: 40 },
    lanes: 1,
    speedLimit: 150,
    entry: false,
    exit: true,
    axis: 'vertical',
    label: 'Север выезд',
  },
  {
    id: 'south_in',
    startPoint: { x: 784, y: 940 },
    endPoint: INTERSECTION_POINTS.southIn,
    lanes: 1,
    speedLimit: 118,
    controlledBy: 'south_light',
    entry: true,
    exit: false,
    axis: 'vertical',
    label: 'Юг',
  },
  {
    id: 'south_out',
    startPoint: INTERSECTION_POINTS.southOut,
    endPoint: { x: 716, y: 940 },
    lanes: 1,
    speedLimit: 150,
    entry: false,
    exit: true,
    axis: 'vertical',
    label: 'Юг выезд',
  },
  {
    id: 'west_in',
    startPoint: { x: 40, y: 524 },
    endPoint: INTERSECTION_POINTS.westIn,
    lanes: 1,
    speedLimit: 112,
    controlledBy: 'west_light',
    entry: true,
    exit: false,
    axis: 'horizontal',
    label: 'Запад',
  },
  {
    id: 'west_out',
    startPoint: INTERSECTION_POINTS.westOut,
    endPoint: { x: 40, y: 456 },
    lanes: 1,
    speedLimit: 144,
    entry: false,
    exit: true,
    axis: 'horizontal',
    label: 'Запад выезд',
  },
  {
    id: 'east_in',
    startPoint: { x: 1460, y: 456 },
    endPoint: INTERSECTION_POINTS.eastIn,
    lanes: 1,
    speedLimit: 116,
    controlledBy: 'east_light',
    entry: true,
    exit: false,
    axis: 'horizontal',
    label: 'Восток',
  },
  {
    id: 'east_out',
    startPoint: INTERSECTION_POINTS.eastOut,
    endPoint: { x: 1460, y: 524 },
    lanes: 1,
    speedLimit: 144,
    entry: false,
    exit: true,
    axis: 'horizontal',
    label: 'Восток выезд',
  },
]

export const LIGHT_DEFINITIONS = [
  {
    id: 'north_light',
    x: 736,
    y: 390,
    axis: 'vertical',
    initialState: TRAFFIC_LIGHT_STATES.GREEN,
    title: 'Северный светофор',
  },
  {
    id: 'south_light',
    x: 764,
    y: 590,
    axis: 'vertical',
    initialState: TRAFFIC_LIGHT_STATES.RED,
    title: 'Южный светофор',
  },
  {
    id: 'west_light',
    x: 648,
    y: 500,
    axis: 'horizontal',
    initialState: TRAFFIC_LIGHT_STATES.RED,
    title: 'Западный светофор',
  },
  {
    id: 'east_light',
    x: 852,
    y: 480,
    axis: 'horizontal',
    initialState: TRAFFIC_LIGHT_STATES.GREEN,
    title: 'Восточный светофор',
  },
]

export const LIGHT_CONTROL_META = [
  { id: 'north_light', label: 'Северный светофор' },
  { id: 'south_light', label: 'Южный светофор' },
  { id: 'west_light', label: 'Западный светофор' },
  { id: 'east_light', label: 'Восточный светофор' },
]

export const TRAFFIC_RATE_META = [
  { id: 'north_in', label: 'Поток с севера' },
  { id: 'south_in', label: 'Поток с юга' },
  { id: 'west_in', label: 'Поток с запада' },
  { id: 'east_in', label: 'Поток с востока' },
]

export const ROUTE_OPTIONS = {
  north_in: ['south_out', 'east_out', 'west_out'],
  south_in: ['north_out', 'east_out', 'west_out'],
  west_in: ['east_out', 'north_out', 'south_out'],
  east_in: ['west_out', 'north_out', 'south_out'],
}
