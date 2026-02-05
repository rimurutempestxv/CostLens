import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp } from 'lucide-react';
import { EconomicIndicator } from '../types';

export const StatCard: React.FC<{ data: EconomicIndicator }> = ({ data }) => {
  // Determine color based on logic:
  // Inflation UP = Bad (Red), Down = Good (Green)
  // Exchange Rate UP = Usually Bad for Naira (Red)
  // GDP/Others UP = Good (Green)
  
  let isBad = false;
  
  if (data.label.includes('Inflation')) {
     isBad = data.trend === 'up';
  } else if (data.label.includes('Exchange')) {
     isBad = data.change > 0;
  } else {
     isBad = data.trend === 'down';
  }

  const TrendIcon = data.change > 0 ? ArrowUpRight : data.change < 0 ? ArrowDownRight : Minus;
  const trendColor = isBad ? 'text-app-danger' : 'text-app-success';
  const bgColor = isBad ? 'bg-red-500/10' : 'bg-green-500/10';

  return (
    <div className="group bg-app-card rounded-3xl p-6 border border-app-border hover:border-app-accent/50 transition-all duration-300 relative overflow-hidden">
      {/* Background Gradient Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity opacity-0 group-hover:opacity-100"></div>

      <div className="flex justify-between items-start mb-4">
        <span className="text-app-muted text-sm font-medium tracking-wide">{data.label}</span>
        <div className={`p-2 rounded-xl ${bgColor}`}>
            <TrendingUp className={`h-4 w-4 ${trendColor}`} />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="text-3xl font-bold text-white tracking-tight">
            {data.value}
        </div>
        
        <div className="flex items-center gap-2">
            <div className={`flex items-center px-2 py-1 rounded-lg ${bgColor} ${trendColor} text-xs font-bold`}>
                <TrendIcon className="h-3 w-3 mr-1" />
                {Math.abs(data.change)}%
            </div>
            <span className="text-xs text-app-muted">vs last month</span>
        </div>
      </div>
    </div>
  );
};
