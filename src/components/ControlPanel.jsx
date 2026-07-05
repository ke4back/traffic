import { MAP_OPTIONS, SPEED_OPTIONS } from '../utils/constants'

function ControlPanel({
  controls,
  isRunning,
  trafficRateMeta,
  onChange,
  onMapChange,
  onRandomizeTraffic,
  onStart,
  onStop,
  onReset,
}) {
  return (
    <section className="panelCard controlPanelCard">
      <h2>Панель управления</h2>

      <div className="buttonRow">
        <button
          type="button"
          className="controlButton start"
          onClick={onStart}
          disabled={isRunning}
        >
          Start
        </button>
        <button
          type="button"
          className="controlButton stop"
          onClick={onStop}
          disabled={!isRunning}
        >
          Stop
        </button>
        <button type="button" className="controlButton reset" onClick={onReset}>
          Reset
        </button>
      </div>

      <div className="controlGroup">
        <div className="controlLabelRow">
          <label htmlFor="mapId">Карта</label>
        </div>
        <select
          id="mapId"
          className="panelSelect"
          value={controls.mapId}
          onChange={(event) => onMapChange(event.target.value)}
        >
          {MAP_OPTIONS.map((map) => (
            <option key={map.id} value={map.id}>
              {map.name}
            </option>
          ))}
        </select>
      </div>

      <div className="controlGroup">
        <div className="controlLabelRow">
          <label htmlFor="vehicleTarget">Количество автомобилей</label>
          <span className="controlValue">{controls.vehicleTarget}</span>
        </div>
        <input
          id="vehicleTarget"
          className="slider"
          type="range"
          min="0"
          max="100"
          step="1"
          value={controls.vehicleTarget}
          onChange={(event) => onChange(['vehicleTarget'], Number(event.target.value))}
        />
      </div>

      <div className="controlGroup">
        <div className="controlLabelRow">
          <label htmlFor="speedMultiplier">Скорость моделирования</label>
          <span className="controlValue">{controls.speedMultiplier.toFixed(1)}x</span>
        </div>
        <input
          id="speedMultiplier"
          className="slider"
          type="range"
          min="0"
          max={String(SPEED_OPTIONS.length - 1)}
          step="1"
          value={String(SPEED_OPTIONS.indexOf(controls.speedMultiplier))}
          onChange={(event) =>
            onChange(['speedMultiplier'], SPEED_OPTIONS[Number(event.target.value)] ?? 1)
          }
        />
      </div>

      <div className="controlGroup">
        <div className="controlLabelRow">
          <label htmlFor="breakdownChance">Вероятность поломки (в тик)</label>
          <span className="controlValue">
            {(controls.breakdownChance * 100).toFixed(3)}%
          </span>
        </div>
        <input
          id="breakdownChance"
          className="slider"
          type="range"
          min="0"
          max="0.0002"
          step="0.00001"
          value={controls.breakdownChance}
          onChange={(event) => onChange(['breakdownChance'], Number(event.target.value))}
        />
      </div>

      <div className="subPanel">
        <h3>Интенсивность потоков</h3>
        <div className="buttonRow">
          <button
            type="button"
            className="controlButton reset fullWidthButton"
            onClick={onRandomizeTraffic}
          >
            Случайные потоки
          </button>
        </div>
        {trafficRateMeta.map((rate) => (
          <div key={rate.id} className="controlGroup compact">
            <div className="controlLabelRow">
              <label htmlFor={rate.id}>{rate.label}</label>
              <span className="controlValue">
                {controls.trafficRates[rate.id].toFixed(2)}x
              </span>
            </div>
            <input
              id={rate.id}
              className="slider"
              type="range"
              min="0"
              max="3"
              step="0.05"
              value={controls.trafficRates[rate.id]}
              onChange={(event) =>
                onChange(['trafficRates', rate.id], Number(event.target.value))
              }
            />
          </div>
        ))}
      </div>
    </section>
  )
}

export default ControlPanel
