import { LIGHT_CONTROL_META, SPEED_OPTIONS, TRAFFIC_RATE_META } from '../utils/constants'

function ControlPanel({
  controls,
  isRunning,
  onChange,
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
          <label htmlFor="vehicleTarget">Количество автомобилей</label>
          <span className="controlValue">{controls.vehicleTarget}</span>
        </div>
        <input
          id="vehicleTarget"
          className="slider"
          type="range"
          min="0"
          max="50"
          step="1"
          value={controls.vehicleTarget}
          onChange={(event) => onChange(['vehicleTarget'], Number(event.target.value))}
        />
        <p className="hintText">Целевое количество активных машин в симуляции.</p>
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
              ['speedMultiplier'],
              SPEED_OPTIONS[Number(event.target.value)] ?? 1,
            )
          }
        />
      </div>

      <div className="controlGroup">
        <div className="controlLabelRow">
          <label htmlFor="breakdownChance">Вероятность поломки машины</label>
          <span className="controlValue">
            {(controls.breakdownChance * 100).toFixed(2)}%
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
        {TRAFFIC_RATE_META.map((rate) => (
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
                onChange(
                  ['trafficRates', rate.id],
                  Number(event.target.value),
                )
              }
            />
          </div>
        ))}
      </div>

      <div className="subPanel">
        <h3>Настройки светофоров</h3>
        {LIGHT_CONTROL_META.map((light) => (
          <div key={light.id} className="lightCard">
            <h4>{light.label}</h4>

            <div className="controlGroup compact">
              <div className="controlLabelRow">
                <label htmlFor={`${light.id}-green`}>Зеленый сигнал</label>
                <span className="controlValue">
                  {controls.lightTimings[light.id].greenTime.toFixed(0)} c
                </span>
              </div>
              <input
                id={`${light.id}-green`}
                className="slider"
                type="range"
                min="0"
                max="20"
                step="1"
                value={controls.lightTimings[light.id].greenTime}
                onChange={(event) =>
                  onChange(
                    ['lightTimings', light.id, 'greenTime'],
                    Number(event.target.value),
                  )
                }
              />
            </div>

            <div className="controlGroup compact">
              <div className="controlLabelRow">
                <label htmlFor={`${light.id}-red`}>Красный сигнал</label>
                <span className="controlValue">
                  {controls.lightTimings[light.id].redTime.toFixed(0)} c
                </span>
              </div>
              <input
                id={`${light.id}-red`}
                className="slider"
                type="range"
                min="0"
                max="20"
                step="1"
                value={controls.lightTimings[light.id].redTime}
                onChange={(event) =>
                  onChange(
                    ['lightTimings', light.id, 'redTime'],
                    Number(event.target.value),
                  )
                }
              />
            </div>
          </div>
        ))}
        <p className="hintText">
          Желтый сигнал фиксирован и длится {2} секунды для каждого светофора.
        </p>
      </div>
    </section>
  )
}

export default ControlPanel
