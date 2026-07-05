import { useEffect, useRef } from 'react'
import useAnimation from '../hooks/useAnimation'
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../utils/constants'

function CanvasView({
  simulation,
  onStatisticsChange,
  onRunningChange,
  onLightSelect,
}) {
  const canvasRef = useRef(null)
  const statsTimerRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (!context) {
      return
    }

    simulation.draw(context)
    onStatisticsChange(simulation.calculateStatistics())
  }, [onStatisticsChange, simulation])

  useAnimation((deltaTime) => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (!context) {
      return
    }

    simulation.update(deltaTime)
    simulation.draw(context)

    statsTimerRef.current += deltaTime

    if (statsTimerRef.current >= 0.15) {
      statsTimerRef.current = 0
      onStatisticsChange(simulation.calculateStatistics())
      onRunningChange(simulation.running)
    }
  }, true)

  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    const bounds = canvas.getBoundingClientRect()
    const scaleX = CANVAS_WIDTH / bounds.width
    const scaleY = CANVAS_HEIGHT / bounds.height
    const x = (event.clientX - bounds.left) * scaleX
    const y = (event.clientY - bounds.top) * scaleY
    const light = simulation.getTrafficLightAtPoint(x, y)

    onLightSelect(light?.id ?? null)
  }

  return (
    <div className="canvasCard">
      <div className="canvasViewport">
        <canvas
          ref={canvasRef}
          className="canvasFrame"
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onClick={handleCanvasClick}
        />
      </div>
    </div>
  )
}

export default CanvasView
