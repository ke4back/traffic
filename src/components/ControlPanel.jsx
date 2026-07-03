import { SPEED_OPTIONS } from '../utils/constants'

function ControlPanel({
  controls,
  isRunning,
  onChange,
  onStart,
  onStop,
  onReset,
}) {
  return (
    <section className="panelCard">
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
          <label htmlFor="vehicleTarget">Количество автомобилей</label>
          <span className="controlValue">{controls.vehicleTarget}</span>
        </div>
        <input
          id="vehicleTarget"
          className="slider"
          type="range"
          min="10"
          max="300"
          step="1"
          value={controls.vehicleTarget}
          onChange={(event) =>
            onChange('vehicleTarget', Number(event.target.value))
          }
        />
        <p className="hintText">Целевое количество активных машин в системе.</p>
      </div>

      <div className="controlGroup">
        <div className="controlLabelRow">
          <label htmlFor="speedMultiplier">Скорость моделирования</label>
          <span className="controlValue">
            {controls.speedMultiplier.toFixed(1)}x
          </span>
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
            onChange(
              'speedMultiplier',
              SPEED_OPTIONS[Number(event.target.value)] ?? 1,
            )
          }
        />
        <p className="hintText">Доступные режимы: 0.5x, 1x, 2x, 4x.</p>
      </div>

      <div className="controlGroup">
        <div className="controlLabelRow">
          <label htmlFor="greenTime">Длительность зеленого сигнала</label>
          <span className="controlValue">{controls.greenTime.toFixed(0)} c</span>
        </div>
        <input
          id="greenTime"
          className="slider"
          type="range"
          min="4"
          max="16"
          step="1"
          value={controls.greenTime}
          onChange={(event) => onChange('greenTime', Number(event.target.value))}
        />
      </div>

      <div className="controlGroup">
        <div className="controlLabelRow">
          <label htmlFor="redTime">Длительность красного сигнала</label>
          <span className="controlValue">{controls.redTime.toFixed(0)} c</span>
        </div>
        <input
          id="redTime"
          className="slider"
          type="range"
          min="4"
          max="16"
          step="1"
          value={controls.redTime}
          onChange={(event) => onChange('redTime', Number(event.target.value))}
        />
        <p className="hintText">
          Светофоры автоматически синхронизируются между вертикальным и
          горизонтальным направлениями.
        </p>
      </div>
    </section>
  )
}

export default ControlPanel
