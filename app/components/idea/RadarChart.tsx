interface RadarDataPoint {
  label: string;
  score: number;
  color: string;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  size?: number;
}

export function RadarChart({ data, size = 260 }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 50; // 레이블 공간 확보
  const N = data.length;
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const angle = (i: number) => (-Math.PI / 2) + (i * 2 * Math.PI) / N;

  const gridPoint = (level: number, i: number) => ({
    x: cx + level * R * Math.cos(angle(i)),
    y: cy + level * R * Math.sin(angle(i)),
  });

  const dataPoint = (score: number, i: number) => ({
    x: cx + (score / 100) * R * Math.cos(angle(i)),
    y: cy + (score / 100) * R * Math.sin(angle(i)),
  });

  const labelPoint = (i: number) => ({
    x: cx + (R + 32) * Math.cos(angle(i)),
    y: cy + (R + 32) * Math.sin(angle(i)),
  });

  const toPoints = (pts: { x: number; y: number }[]) =>
    pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const gridPolygons = levels.map(level =>
    toPoints(data.map((_, i) => gridPoint(level, i)))
  );

  const dataPolygon = toPoints(data.map((d, i) => dataPoint(d.score, i)));

  const textAnchor = (i: number): 'start' | 'end' | 'middle' => {
    const a = angle(i);
    const cos = Math.cos(a);
    if (cos > 0.1) return 'start';
    if (cos < -0.1) return 'end';
    return 'middle';
  };

  const vbPad = 48;
  const vbSize = size + vbPad * 2;

  return (
    <svg
      viewBox={`${-vbPad} ${-vbPad} ${vbSize} ${vbSize}`}
      width={size}
      height={size}
      className="overflow-visible"
    >
      {/* Grid polygons */}
      {gridPolygons.map((pts, lvl) => (
        <polygon
          key={lvl}
          points={pts}
          fill="none"
          stroke="#334155"
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {data.map((_, i) => {
        const outer = gridPoint(1.0, i);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={outer.x}
            y2={outer.y}
            stroke="#334155"
            strokeWidth="1"
          />
        );
      })}

      {/* Data fill */}
      <polygon
        points={dataPolygon}
        fill="rgba(99,102,241,0.15)"
        stroke="#6366f1"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Data dots */}
      {data.map((d, i) => {
        const pt = dataPoint(d.score, i);
        return (
          <circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r={4}
            fill="#6366f1"
          />
        );
      })}

      {/* Labels */}
      {data.map((d, i) => {
        const lp = labelPoint(i);
        return (
          <text
            key={i}
            x={lp.x}
            y={lp.y}
            textAnchor={textAnchor(i)}
            dominantBaseline="middle"
            fontSize="11"
            fill="#94a3b8"
          >
            {d.label}
            <tspan x={lp.x} dy="13" fontSize="10" fill="#6366f1" fontWeight="bold">
              {d.score}
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}
