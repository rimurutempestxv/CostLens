export interface InflationDataPoint {
  date: string; // YYYY-MM
  value: number; // Percentage or Price
  isForecast?: boolean;
  upperBound?: number; // For confidence intervals
  lowerBound?: number; // For confidence intervals
}

export interface CommodityItem {
  id: string;
  name: string;
  category: 'Food' | 'Energy' | 'Transport';
  currentPrice: number;
  previousPrice: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  history: InflationDataPoint[];
}

export interface EconomicIndicator {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  description: string;
}

export enum ForecastModel {
  ARIMA = 'ARIMA',
  SARIMA = 'SARIMA',
  HOLT_WINTERS = 'Holt-Winters'
}
