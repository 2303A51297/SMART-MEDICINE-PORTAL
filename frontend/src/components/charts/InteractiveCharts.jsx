import React from 'react';

// Modern SVG Bar Chart
export const BarChart = ({ data = [], xKey = 'name', yKey = 'value', height = 240, color = '#0284c7' }) => {
  if (!data || data.length === 0) {
    return <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No data available for chart</div>;
  }

  const maxValue = Math.max(...data.map(d => Number(d[yKey]) || 0), 1);
  const chartHeight = height - 40;

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <div style={{ minWidth: data.length * 50, height, display: 'flex', alignItems: 'flex-end', gap: '16px', padding: '10px 10px 30px', position: 'relative' }}>
        {/* Background grid lines */}
        <div style={{ position: 'absolute', top: 10, left: 0, right: 0, borderTop: '1px dashed #e2e8f0' }} />
        <div style={{ position: 'absolute', top: height / 2, left: 0, right: 0, borderTop: '1px dashed #e2e8f0' }} />
        <div style={{ position: 'absolute', bottom: 30, left: 0, right: 0, borderTop: '1px solid #cbd5e1' }} />

        {data.map((item, idx) => {
          const val = Number(item[yKey]) || 0;
          const barHeight = Math.max((val / maxValue) * chartHeight, 6);
          const label = String(item[xKey] || '').slice(0, 10);

          return (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', zIndex: 2 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                {val}
              </div>
              <div
                title={`${item[xKey]}: ${val}`}
                style={{
                  width: '100%',
                  maxWidth: 36,
                  height: `${barHeight}px`,
                  background: item.color || color,
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.4s ease',
                  cursor: 'pointer'
                }}
              />
              <div style={{ position: 'absolute', bottom: 6, fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap' }}>
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Donut Progress / Distribution Chart
export const DonutChart = ({ segments = [], size = 180, strokeWidth = 24, centerLabel = '', centerValue = '' }) => {
  const total = segments.reduce((acc, s) => acc + (Number(s.value) || 0), 0) || 1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          {segments.map((seg, idx) => {
            const val = Number(seg.value) || 0;
            const strokeDasharray = `${(val / total) * circumference} ${circumference}`;
            const strokeDashoffset = -currentOffset;
            currentOffset += (val / total) * circumference;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.color || '#0284c7'}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            );
          })}
        </svg>

        {/* Center Text */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>{centerValue}</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{centerLabel}</span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
        {segments.map((seg, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: seg.color }} />
            <span style={{ color: 'var(--text-muted)' }}>{seg.label}:</span>
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

