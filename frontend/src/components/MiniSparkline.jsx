import {
  ResponsiveContainer,
  AreaChart,
  Area,
  YAxis,
} from 'recharts';

/**
 * Tiny sparkline that sits inside a StockCard.
 * `history` = array of { price } objects (oldest → newest)
 * `isUp`    = boolean controlling colour
 */
export default function MiniSparkline({ history, isUp }) {
  if (!history || history.length < 2) return null;

  const color = isUp ? '#3fb950' : '#f85149';

  return (
    <ResponsiveContainer width="100%" height={52}>
      <AreaChart data={history} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
        <defs>
          <linearGradient id={`spark-${isUp ? 'up' : 'dn'}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* domain auto-fits to visible data so tiny moves look visible */}
        <YAxis domain={['auto', 'auto']} hide />
        <Area
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#spark-${isUp ? 'up' : 'dn'})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
