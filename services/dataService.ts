import { InflationDataPoint, CommodityItem, EconomicIndicator } from '../types';

// Helper to generate a date string
const getDate = (year: number, month: number) => `${year}-${String(month).padStart(2, '0')}`;

// Mock Historical Inflation Data (Approximate real figures for Nigeria 2022-2024)
export const getInflationHistory = (): InflationDataPoint[] => {
  const data: InflationDataPoint[] = [
    { date: '2022-01', value: 15.6 },
    { date: '2022-03', value: 15.9 },
    { date: '2022-06', value: 18.6 },
    { date: '2022-09', value: 20.7 },
    { date: '2022-12', value: 21.3 },
    { date: '2023-01', value: 21.8 },
    { date: '2023-03', value: 22.0 },
    { date: '2023-05', value: 22.4 }, // Subsidy removal talk starts heating up
    { date: '2023-06', value: 22.8 },
    { date: '2023-09', value: 26.7 },
    { date: '2023-12', value: 28.9 },
    { date: '2024-01', value: 29.9 },
    { date: '2024-03', value: 33.2 },
    { date: '2024-06', value: 34.1 },
    { date: '2024-09', value: 32.7 },
    { date: '2024-12', value: 33.8 },
  ];
  return data;
};

// Generate Forecast Data (Simulated ARIMA output)
export const generateForecast = (history: InflationDataPoint[], months: number = 6): InflationDataPoint[] => {
  const lastPoint = history[history.length - 1];
  const lastValue = lastPoint.value;
  const lastDateParts = lastPoint.date.split('-');
  let currentYear = parseInt(lastDateParts[0]);
  let currentMonth = parseInt(lastDateParts[1]);

  const forecast: InflationDataPoint[] = [];
  
  // Simulation parameters for Nigeria's volatility
  const volatility = 1.2; 
  const trend = 0.3; // Slight upward trend assumption

  for (let i = 1; i <= months; i++) {
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }

    const projectedValue = lastValue + (trend * i) + (Math.random() - 0.5) * volatility;
    // Uncertainty grows with time
    const uncertainty = (i * 0.8); 

    forecast.push({
      date: getDate(currentYear, currentMonth),
      value: parseFloat(projectedValue.toFixed(2)),
      isForecast: true,
      upperBound: parseFloat((projectedValue + uncertainty).toFixed(2)),
      lowerBound: parseFloat((projectedValue - uncertainty).toFixed(2)),
    });
  }

  return forecast;
};

export const getCommodities = (): CommodityItem[] => [
  {
    id: '1',
    name: 'Rice (Foreign, 50kg)',
    category: 'Food',
    currentPrice: 95000,
    previousPrice: 88000,
    unit: 'bag',
    trend: 'up',
    history: []
  },
  {
    id: '2',
    name: 'Petrol (PMS)',
    category: 'Energy',
    currentPrice: 1050,
    previousPrice: 980,
    unit: 'liter',
    trend: 'up',
    history: []
  },
  {
    id: '3',
    name: 'Cooking Gas (12.5kg)',
    category: 'Energy',
    currentPrice: 16500,
    previousPrice: 15000,
    unit: 'cylinder',
    trend: 'up',
    history: []
  },
  {
    id: '4',
    name: 'Garri (White)',
    category: 'Food',
    currentPrice: 3500,
    previousPrice: 3600,
    unit: 'paint rubber',
    trend: 'down',
    history: []
  },
   {
    id: '5',
    name: 'Cement',
    category: 'Transport', // Broadly construction/housing
    currentPrice: 8500,
    previousPrice: 8500,
    unit: 'bag',
    trend: 'stable',
    history: []
  }
];

export const getIndicators = (): EconomicIndicator[] => [
  {
    label: 'Headline Inflation',
    value: '33.8%',
    change: 1.1,
    trend: 'up',
    description: 'Year-on-Year change in CPI'
  },
  {
    label: 'Food Inflation',
    value: '40.5%',
    change: 2.3,
    trend: 'up',
    description: 'Impacts basic cost of living'
  },
  {
    label: 'Exchange Rate (Parallel)',
    value: '₦1,740',
    change: -0.5,
    trend: 'down', // Down means value of Naira dropped (price went up), but visually up arrow usually means "price up". Let's standardize: Trend UP means VALUE INCREASED (Bad for inflation metrics usually)
    description: 'USD/NGN Market Rate'
  },
  {
    label: 'MPR (Interest Rate)',
    value: '27.25%',
    change: 0,
    trend: 'neutral',
    description: 'CBN Benchmark Rate'
  }
];

export const mergeLiveData = (
    currentCommodities: CommodityItem[],
    currentIndicators: EconomicIndicator[],
    liveData: { inflation?: number, commodities?: Record<string, number> }
) => {
    let updatedCommodities = [...currentCommodities];
    let updatedIndicators = [...currentIndicators];

    // Update Commodities
    if (liveData.commodities) {
        updatedCommodities = updatedCommodities.map(item => {
            const livePrice = liveData.commodities?.[item.name];
            if (livePrice && livePrice !== item.currentPrice && livePrice > 0) {
                return {
                    ...item,
                    previousPrice: item.currentPrice, // Shift current to previous
                    currentPrice: livePrice,
                    trend: livePrice > item.currentPrice ? 'up' : livePrice < item.currentPrice ? 'down' : 'stable'
                };
            }
            return item;
        });
    }

    // Update Indicators (Headline Inflation)
    if (liveData.inflation) {
        updatedIndicators = updatedIndicators.map(ind => {
            if (ind.label === 'Headline Inflation') {
                const currentVal = parseFloat(ind.value.toString().replace('%', ''));
                if (currentVal !== liveData.inflation) {
                    return {
                        ...ind,
                        value: `${liveData.inflation}%`,
                        change: parseFloat((liveData.inflation - currentVal).toFixed(2)),
                        trend: liveData.inflation > currentVal ? 'up' : 'down'
                    }
                }
            }
            return ind;
        });
    }

    return { updatedCommodities, updatedIndicators };
};
