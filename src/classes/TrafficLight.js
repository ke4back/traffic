import { TRAFFIC_LIGHT_STATES, YELLOW_TIME } from '../utils/constants'

class TrafficLight {
  constructor({
    id,
    x,
    y,
    axis,
    initialState = TRAFFIC_LIGHT_STATES.RED,
    greenTime = 8,
    yellowTime = YELLOW_TIME,
    redTime = 8,
  }) {
    this.id = id
    this.x = x
    this.y = y
    this.axis = axis
    this.state = initialState
    this.timer = this.getDurationForState(initialState, greenTime, yellowTime, redTime)
    this.greenTime = greenTime
    this.yellowTime = yellowTime
    this.redTime = redTime
  }

  // Returns the configured duration for a specific traffic light state.
  getDurationForState(state, greenTime = this.greenTime, yellowTime = this.yellowTime, redTime = this.redTime) {
    if (state === TRAFFIC_LIGHT_STATES.GREEN) {
      return greenTime
    }

    if (state === TRAFFIC_LIGHT_STATES.YELLOW) {
      return yellowTime
    }

    return redTime
  }

  // Applies fresh timings while preserving the current phase of the light.
  setDurations(greenTime, yellowTime, redTime) {
    this.greenTime = greenTime
    this.yellowTime = yellowTime
    this.redTime = redTime
    this.timer = Math.min(this.timer, this.getDurationForState(this.state))
  }

  // Advances the light timer and flips to the next state when the timer expires.
  update(deltaTime) {
    this.timer -= deltaTime

    if (this.timer <= 0) {
      this.switchState()
    }
  }

  // Switches the traffic light to the next phase in the red-yellow-green cycle.
  switchState() {
    if (this.state === TRAFFIC_LIGHT_STATES.GREEN) {
      this.state = TRAFFIC_LIGHT_STATES.YELLOW
      this.timer = this.yellowTime
      return
    }

    if (this.state === TRAFFIC_LIGHT_STATES.YELLOW) {
      this.state = TRAFFIC_LIGHT_STATES.RED
      this.timer = this.redTime
      return
    }

    this.state = TRAFFIC_LIGHT_STATES.GREEN
    this.timer = this.greenTime
  }

  // Renders a compact traffic light head with the active lamp highlighted.
  draw(ctx) {
    const lampColors = {
      [TRAFFIC_LIGHT_STATES.RED]: '#da5252',
      [TRAFFIC_LIGHT_STATES.YELLOW]: '#f59f00',
      [TRAFFIC_LIGHT_STATES.GREEN]: '#2f9e62',
    }

    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.fillStyle = '#1f1f1f'
    ctx.fillRect(-10, -16, 20, 32)

    ;[
      TRAFFIC_LIGHT_STATES.RED,
      TRAFFIC_LIGHT_STATES.YELLOW,
      TRAFFIC_LIGHT_STATES.GREEN,
    ].forEach((state, index) => {
      ctx.beginPath()
      ctx.fillStyle =
        this.state === state ? lampColors[state] : 'rgba(255, 255, 255, 0.14)'
      ctx.arc(0, -10 + index * 10, 3.5, 0, Math.PI * 2)
      ctx.fill()
    })

    ctx.restore()
  }
}

export default TrafficLight
