import { useEffect, useState } from 'react'
import './App.css'
import ControlPanel from './components/ControlPanel'
import StatisticsPanel from './components/StatisticsPanel'
import CanvasView from './components/CanvasView'
import Simulation from './classes/Simulation'
import { DEFAULT_CONTROLS } from './utils/constants'

function App() {
  const [simulation] = useState(() => new Simulation(DEFAULT_CONTROLS))
  const [controls, setControls] = useState(DEFAULT_CONTROLS)
  const [statistics, setStatistics] = useState(() => simulation.calculateStatistics())
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    simulation.applyControls(controls)
  }, [controls, simulation])

  const handleControlChange = (name, value) => {
    setControls((current) => {
      const nextControls = {
        ...current,
        [name]: value,
      }

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

  return (
    <main className="appShell">
      <aside className="sidebar">
        <div className="brandCard">
          <p className="eyebrow">Имитационная модель</p>
          <h1>Городское движение</h1>
          <p className="intro">
            Реалистичная симуляция городского потока: автомобили соблюдают
            светофоры, держат дистанцию и формируют пробки при высокой нагрузке.
          </p>
        </div>

        <ControlPanel
          controls={controls}
          isRunning={isRunning}
          onChange={handleControlChange}
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

export default App
