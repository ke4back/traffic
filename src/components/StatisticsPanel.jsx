import { formatTime, roundTo } from '../utils/helpers'

function StatisticsPanel({ statistics }) {
  return (
    <section className="panelCard">
      <h2>Статистика</h2>

      <div className="statsGrid">
        <div className="statCard">
          <span className="statLabel">Количество автомобилей</span>
          <span className="statValue">{statistics.activeVehicles}</span>
        </div>
        <div className="statCard">
          <span className="statLabel">Средняя скорость</span>
          <span className="statValue">{roundTo(statistics.averageSpeed, 1)} px/c</span>
        </div>
        <div className="statCard">
          <span className="statLabel">Среднее время ожидания</span>
          <span className="statValue">{formatTime(statistics.averageWaitingTime)}</span>
        </div>
        <div className="statCard">
          <span className="statLabel">Машин в пробке</span>
          <span className="statValue">{statistics.jamVehicles}</span>
        </div>
        <div className="statCard">
          <span className="statLabel">Среднее время поездки</span>
          <span className="statValue">{formatTime(statistics.averageTripTime)}</span>
        </div>
        <div className="statCard">
          <span className="statLabel">Завершенные маршруты</span>
          <span className="statValue">{statistics.completedRoutes}</span>
        </div>
      </div>

      <div className="legendRow">
        <span className="legendItem">
          <span
            className="legendDot"
            style={{ backgroundColor: '#2f9e62' }}
          ></span>
          Зеленый: движение
        </span>
        <span className="legendItem">
          <span
            className="legendDot"
            style={{ backgroundColor: '#f59f00' }}
          ></span>
          Желтый: переключение
        </span>
        <span className="legendItem">
          <span
            className="legendDot"
            style={{ backgroundColor: '#da5252' }}
          ></span>
          Красный: остановка
        </span>
      </div>
    </section>
  )
}

export default StatisticsPanel
