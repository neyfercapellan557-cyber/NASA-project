import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

export default function ExperimentModelChart({
  id,
  data,
  graph,
  currentValue,
  elapsedSeconds,
  duration,
  compareDefault
}) {
  return (
    <section className="lab-model-chart" aria-label={`${graph.title} en función del tiempo`}>
      <div className="lab-chart-heading">
        <div>
          <span className="panel-kicker">RESULTADO DEL MODELO · NO SON DATOS EXPERIMENTALES</span>
          <h4>{graph.title}</h4>
        </div>
        <strong>{currentValue.toFixed(id === 'droplet' || id === 'solid' ? 2 : 3)} {graph.unit}</strong>
      </div>
      <div className="lab-chart-canvas">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 10, right: 12, left: 2, bottom: 4 }}>
            <CartesianGrid stroke="#243449" strokeDasharray="3 5" />
            <XAxis
              dataKey="time"
              type="number"
              domain={[0, duration]}
              tickFormatter={(value) => Number(value).toPrecision(2)}
              stroke="#8293a8"
              tick={{ fontSize: 9 }}
              label={{ value: 'Tiempo (s)', position: 'insideBottom', offset: -2, fill: '#91a0b3', fontSize: 10 }}
            />
            <YAxis
              stroke="#8293a8"
              tick={{ fontSize: 9 }}
              width={48}
              label={{ value: graph.unit, angle: -90, position: 'insideLeft', fill: '#91a0b3', fontSize: 9 }}
              domain={id === 'smoke' || id === 'extinction' || id === 'microgravity'
                ? [0, 1]
                : ['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{ background: '#101a29', border: '1px solid #344a61', borderRadius: 6, fontSize: 10 }}
              labelFormatter={(value) => `t = ${Number(value).toFixed(2)} s`}
              formatter={(value, name) => [`${Number(value).toFixed(3)} ${graph.unit}`, name]}
            />
            <ReferenceLine
              x={elapsedSeconds}
              stroke="#ffd08a"
              strokeDasharray="3 4"
              label={{ value: 'tiempo', fill: '#ffd08a', fontSize: 8, position: 'insideTopRight' }}
            />
            {compareDefault && <Legend wrapperStyle={{ fontSize: 9, color: '#b8c5d5' }} />}
            <Line
              type="monotone"
              dataKey="current"
              name="Parámetros actuales"
              stroke="#ff9a5c"
              strokeWidth={2.2}
              dot={false}
              isAnimationActive={false}
            />
            {compareDefault && (
              <Line
                type="monotone"
                dataKey="reference"
                name="Referencia predeterminada"
                stroke="#35cddd"
                strokeWidth={1.6}
                strokeDasharray="5 4"
                dot={false}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
