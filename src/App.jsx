import { useMemo, useState } from 'react'
import './App.css'
import ControlPanel from './components/ControlPanel'
import StatisticsPanel from './components/StatisticsPanel'
import CanvasView from './components/CanvasView'
import Simulation from './classes/Simulation'
import {
  DEFAULT_CONTROLS,
  createMapControls,
  getMapDefinition,
} from './utils/constants'
import { deepMerge } from './utils/helpers'

function App() {
  const [simulation] = useState(() => new Simulation(DEFAULT_CONTROLS))
  const [controls, setControls] = useState(DEFAULT_CONTROLS)
  const [statistics, setStatistics] = useState(() => simulation.calculateStatistics())
  const [isRunning, setIsRunning] = useState(false)
  const [selectedLightId, setSelectedLightId] = useState(null)

  const activeMap = useMemo(() => getMapDefinition(controls.mapId), [controls.mapId])
  const selectedLight = selectedLightId ? simulation.getTrafficLightById(selectedLightId) : null

  const handleControlChange = (path, value) => {
    setControls((current) => {
      const nextControls = updateNestedControl(current, path, value)
      simulation.applyControls(nextControls)
      return nextControls
    })

    setStatistics(simulation.calculateStatistics())
  }

  const handleMapChange = (mapId) => {
    setSelectedLightId(null)
    setControls((current) => {
      const nextControls = {
        ...createMapControls(mapId),
        vehicleTarget: current.vehicleTarget,
        speedMultiplier: current.speedMultiplier,
        breakdownChance: current.breakdownChance,
      }
      simulation.reset(nextControls)
      return nextControls
    })
    setIsRunning(false)
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
    setSelectedLightId(null)
    setIsRunning(false)
    setStatistics(simulation.calculateStatistics())
  }

  const handleRandomizeTraffic = () => {
    setControls((current) => {
      const trafficRates = activeMap.trafficRateMeta.reduce((nextRates, { id }) => {
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
            Несколько карт с несколькими перекрёстками, потоками машин и настройкой
            светофоров прямо по клику на карте.
          </p>
        </div>

        {selectedLight ? (
          <section className="panelCard lightSettingsCard">
            <div className="controlLabelRow">
              <h2>Светофор</h2>
              <button
                type="button"
                className="ghostButton"
                onClick={() => setSelectedLightId(null)}
              >
                Закрыть
              </button>
            </div>
            <p className="hintText">{selectedLight.label}</p>

            <div className="controlGroup compact">
              <div className="controlLabelRow">
                <label htmlFor={`${selectedLight.id}-green`}>Зелёный сигнал</label>
                <span className="controlValue">
                  {controls.lightTimings[selectedLight.id].greenTime.toFixed(0)} c
                </span>
              </div>
              <input
                id={`${selectedLight.id}-green`}
                className="slider"
                type="range"
                min="0"
                max="20"
                step="1"
                value={controls.lightTimings[selectedLight.id].greenTime}
                onChange={(event) =>
                  handleControlChange(
                    ['lightTimings', selectedLight.id, 'greenTime'],
                    Number(event.target.value),
                  )
                }
              />
            </div>

            <div className="controlGroup compact">
              <div className="controlLabelRow">
                <label htmlFor={`${selectedLight.id}-red`}>Красный сигнал</label>
                <span className="controlValue">
                  {controls.lightTimings[selectedLight.id].redTime.toFixed(0)} c
                </span>
              </div>
              <input
                id={`${selectedLight.id}-red`}
                className="slider"
                type="range"
                min="0"
                max="20"
                step="1"
                value={controls.lightTimings[selectedLight.id].redTime}
                onChange={(event) =>
                  handleControlChange(
                    ['lightTimings', selectedLight.id, 'redTime'],
                    Number(event.target.value),
                  )
                }
              />
            </div>

            <p className="hintText">
              Нажмите на другой светофор на карте, чтобы переключить меню.
            </p>
          </section>
        ) : null}

        <ControlPanel
          controls={controls}
          isRunning={isRunning}
          trafficRateMeta={activeMap.trafficRateMeta}
          onChange={handleControlChange}
          onMapChange={handleMapChange}
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
          onLightSelect={setSelectedLightId}
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
