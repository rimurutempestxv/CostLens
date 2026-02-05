import React, { useMemo } from 'react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts';
import { InflationDataPoint } from '../types';
import { Maximize2, BarChart2 } from 'lucide-react';

interface InflationChartProps {
  historicalData: InflationDataPoint[];
  forecastData: InflationDataPoint[];
  showForecast: boolean;
}

export const InflationChart: React.FC<InflationChartProps> = ({
  historicalData,
  forecastData,
  showForecast
}) => {
  const data = useMemo(() => {
    if (!showForecast) return historicalData;

    const formattedForecast = forecastData.map(d => ({
        ...d,
        range: [d.lowerBound, d.upperBound] 
    }));

    return [...historicalData, ...formattedForecast];
  }, [historicalData, forecastData, showForecast]);

  const currentVal = historicalData[historicalData.length - 1]?.value;

  return (
    <div className="w-full h-[500px] bg-app-card p-6 rounded-3xl border border-app-border relative overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 z-10">
        <div>
            <p className="text-app-muted text-sm font-medium mb-1">Inflation Trend (CPI)</p>
            <h3 className="text-4xl font-bold text-white tracking-tight">{currentVal}%</h3>
            <p className="text-xs text-app-accent mt-2 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-app-accent animate-pulse"></span>
                +0.73% Today
            </p>
        </div>
        <div className="flex gap-2">
            <button className="p-2 rounded-xl bg-app-surface border border-app-border text-app-muted hover:text-white hover:border-white/20 transition-colors">
                <BarChart2 className="h-5 w-5" />
            </button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 w-full -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d946ef" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} stroke="#2A2A2A" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10, fill: '#525252' }} 
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={30}
            />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip 
              contentStyle={{ 
                  backgroundColor: '#1E1E1E', 
                  borderRadius: '12px', 
                  border: '1px solid #333',
                  boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' 
              }}
              labelStyle={{ color: '#A1A1AA', fontSize: '12px', marginBottom: '4px' }}
              itemStyle={{ color: '#fff', fontWeight: 600 }}
              formatter={(value: any, name: string) => {
                  if (name === 'range') return [`${value[0]}% - ${value[1]}%`, 'Range'];
                  return [`${value}%`, 'Inflation'];
              }}
            />
            
            {showForecast && (
              <Area
                type="monotone"
                dataKey="range"
                stroke="none"
                fill="#fca5a5" // Light red/orange for uncertainty
                fillOpacity={0.1}
              />
            )}

            <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#d946ef" 
                strokeWidth={3}
                fill="url(#colorValue)" 
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#d946ef"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#fff', stroke: '#d946ef', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Filter Tabs (Visual Only for this demo) */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-app-border z-10">
         <div className="flex gap-4">
             {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((tf, i) => (
                 <button key={tf} className={`text-xs font-bold ${i === 4 ? 'text-white bg-app-surface px-3 py-1 rounded-lg' : 'text-app-muted hover:text-white'}`}>
                     {tf}
                 </button>
             ))}
         </div>
      </div>
    </div>
  );
};
