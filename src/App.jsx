import { useState } from 'react'
import './App.css'
import ControlPanel from './components/ControlPanel'
import StatisticsPanel from './components/StatisticsPanel'
import CanvasView from './components/CanvasView'
import Simulation from './classes/Simulation'
import { DEFAULT_CONTROLS, TRAFFIC_RATE_META } from './utils/constants'
import { deepMerge } from './utils/helpers'

function App() {
  const [simulation] = useState(() => new Simulation(DEFAULT_CONTROLS))
  const [controls, setControls] = useState(DEFAULT_CONTROLS)
  const [statistics, setStatistics] = useState(() => simulation.calculateStatistics())
  const [isRunning, setIsRunning] = useState(false)

  const handleControlChange = (path, value) => {
    setControls((current) => {
      const nextControls = updateNestedControl(current, path, value)
      simulation.applyControls(nextControls)
      return nextControls
    })

    setStatistics(simulation.calculateStatistics())
  }

  const handleStart = () => {
    simulation.start()
    setIsRunning(true)
  }

  const handleStop = () => {
    simulation.stop()
    setIsRunning(false)
    setStatistics(simulation.calculateStatistics())
  }

  const handleReset = () => {
    simulation.reset(controls)
    setIsRunning(false)
    setStatistics(simulation.calculateStatistics())
  }

  const handleRandomizeTraffic = () => {
    setControls((current) => {
      const trafficRates = TRAFFIC_RATE_META.reduce((nextRates, { id }) => {
        nextRates[id] = Number((Math.random() * 3).toFixed(2))
        return nextRates
      }, {})
      const nextControls = deepMerge(current, { trafficRates })
      simulation.applyControls(nextControls)
      return nextControls
    })

    setStatistics(simulation.calculateStatistics())
  }

  return (
    <main className="appShell">
      <aside className="sidebar">
        <div className="brandCard">
          <p className="eyebrow">Имитационная модель</p>
          <h1>Городское движение</h1>
          <p className="intro">
            Большая городская схема с разными потоками по направлениям,
            независимыми настройками светофоров и живой статистикой по пробкам.
          </p>
        </div>

        <ControlPanel
          controls={controls}
          isRunning={isRunning}
          onChange={handleControlChange}
          onRandomizeTraffic={handleRandomizeTraffic}
          onStart={handleStart}
          onStop={handleStop}
          onReset={handleReset}
        />

        <StatisticsPanel statistics={statistics} />
      </aside>

      <section className="canvasSection">
        <CanvasView
          simulation={simulation}
          onRunningChange={setIsRunning}
          onStatisticsChange={setStatistics}
        />
      </section>
    </main>
  )
}

function updateNestedControl(currentControls, path, value) {
  if (path.length === 1) {
    return deepMerge(currentControls, { [path[0]]: value })
  }

  const patch = {}
  let cursor = patch

  path.forEach((segment, index) => {
    if (index === path.length - 1) {
      cursor[segment] = value
      return
    }

    cursor[segment] = {}
    cursor = cursor[segment]
  })

  return deepMerge(currentControls, patch)
}

export default App
