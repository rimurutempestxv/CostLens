import React, { useState, useEffect, useCallback } from 'react';
import { NavBar } from './components/NavBar';
import { StatCard } from './components/StatCard';
import { InflationChart } from './components/InflationChart';
import { AIAnalyst } from './components/AIAnalyst';
import { Calculator } from './components/Calculator';
import { getInflationHistory, generateForecast, getCommodities, getIndicators, mergeLiveData } from './services/dataService';
import { getLatestMarketData } from './services/geminiService';
import { InflationDataPoint, CommodityItem, EconomicIndicator, ForecastModel } from './types';
import { ShoppingCart, Fuel, Droplet, ArrowRight, Loader2, RefreshCw, Wallet, SlidersHorizontal } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [inflationHistory, setInflationHistory] = useState<InflationDataPoint[]>([]);
  const [forecast, setForecast] = useState<InflationDataPoint[]>([]);
  const [commodities, setCommodities] = useState<CommodityItem[]>([]);
  const [indicators, setIndicators] = useState<EconomicIndicator[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(ForecastModel.ARIMA);
  const [showForecast, setShowForecast] = useState<boolean>(true);
  
  // Polling State
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const history = getInflationHistory();
    setInflationHistory(history);
    setForecast(generateForecast(history));
    setCommodities(getCommodities());
    setIndicators(getIndicators());
  }, []);

  const fetchLiveData = useCallback(async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    
    try {
      const liveData = await getLatestMarketData();
      
      if (liveData.inflation || (liveData.commodities && Object.keys(liveData.commodities).length > 0)) {
        const { updatedCommodities, updatedIndicators } = mergeLiveData(
          commodities,
          indicators,
          liveData
        );
        
        setCommodities(updatedCommodities);
        setIndicators(updatedIndicators);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Polling error:", error);
    } finally {
      setIsUpdating(false);
    }
  }, [commodities, indicators, isUpdating]);

  useEffect(() => {
    const initialTimer = setTimeout(() => {
        if (!lastUpdated) fetchLiveData();
    }, 2000); 

    const intervalId = setInterval(fetchLiveData, 3600000); 

    return () => {
        clearTimeout(initialTimer);
        clearInterval(intervalId);
    };
  }, [fetchLiveData, lastUpdated]);

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = e.target.value;
    setSelectedModel(model);
    setForecast(generateForecast(inflationHistory));
  };

  return (
    <div className="min-h-screen bg-app-bg text-white pb-24 md:pb-12 font-sans selection:bg-app-accent selection:text-white">
      <NavBar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isUpdating={isUpdating}
        lastUpdated={lastUpdated}
        onRefresh={fetchLiveData}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* TAB: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {indicators.map((indicator, idx) => (
                <StatCard key={idx} data={indicator} />
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Chart & Controls */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Controls Bar */}
                <div className="flex justify-between items-center bg-app-card p-2 rounded-2xl border border-app-border">
                    <div className="flex items-center gap-2 pl-2">
                        <SlidersHorizontal className="h-4 w-4 text-app-muted"/>
                        <span className="text-xs font-bold text-app-muted uppercase">Model</span>
                    </div>
                    <div className="flex items-center gap-4">
                         <div className="relative group">
                            <select 
                                value={selectedModel}
                                onChange={handleModelChange}
                                className="appearance-none bg-app-surface text-white text-xs font-bold py-2 pl-4 pr-8 rounded-xl outline-none focus:ring-1 focus:ring-app-accent cursor-pointer transition-all hover:bg-white/10"
                            >
                                <option value={ForecastModel.ARIMA}>ARIMA</option>
                                <option value={ForecastModel.SARIMA}>SARIMA</option>
                                <option value={ForecastModel.HOLT_WINTERS}>Holt-Winters</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => setShowForecast(!showForecast)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${showForecast ? 'bg-app-accent text-white shadow-glow' : 'bg-app-surface text-app-muted hover:text-white'}`}
                        >
                            {showForecast ? 'Forecast ON' : 'Forecast OFF'}
                        </button>
                    </div>
                </div>

                <InflationChart 
                  historicalData={inflationHistory} 
                  forecastData={forecast} 
                  showForecast={showForecast} 
                />

                {/* Market List (Redesigned) */}
                <div className="bg-app-card rounded-3xl border border-app-border overflow-hidden">
                  <div className="px-6 py-5 border-b border-app-border flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2 text-lg">
                       Market Watch
                    </h3>
                    <button 
                      onClick={() => setActiveTab('market')}
                      className="text-xs font-bold px-4 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
                    >
                      View All
                    </button>
                  </div>
                  <div className="divide-y divide-app-border">
                    {commodities.slice(0, 3).map((item) => (
                      <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${item.category === 'Energy' ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-500'}`}>
                            <span className="text-xs font-bold">{item.name.substring(0, 2).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-bold text-white group-hover:text-app-accent transition-colors">{item.name}</p>
                            <p className="text-xs text-app-muted">{item.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white">₦{item.currentPrice.toLocaleString()}</p>
                          <p className={`text-xs font-bold ${item.trend === 'up' ? 'text-app-danger' : 'text-app-success'}`}>
                             {item.trend === 'up' ? '+' : ''} {Math.abs(((item.currentPrice - item.previousPrice)/item.previousPrice)*100).toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: AI Analyst */}
              <div className="lg:h-auto">
                <AIAnalyst 
                  inflationData={inflationHistory} 
                  commodities={commodities}
                  selectedModel={selectedModel}
                />
              </div>

            </div>
          </div>
        )}

        {/* TAB: MARKET */}
        {activeTab === 'market' && (
          <div className="animate-fade-in pb-20">
             <div className="bg-app-card rounded-3xl border border-app-border p-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h2 className="text-3xl font-bold text-white tracking-tight">Commodity Prices</h2>
                    <button 
                        onClick={fetchLiveData} 
                        disabled={isUpdating}
                        className="w-full md:w-auto px-6 py-3 bg-app-surface border border-app-border text-white rounded-full hover:border-app-accent hover:text-app-accent transition-all flex items-center justify-center gap-2 text-sm font-bold"
                    >
                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin"/> : <RefreshCw className="h-4 w-4"/>}
                        Sync Market Data
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {commodities.map((item) => (
                      <div key={item.id} className="bg-app-surface/50 p-6 rounded-3xl border border-app-border hover:border-app-accent/50 transition-all hover:bg-app-surface cursor-pointer group">
                         <div className="flex justify-between items-start mb-4">
                           <div className="h-12 w-12 rounded-2xl bg-app-bg border border-app-border flex items-center justify-center group-hover:scale-110 transition-transform">
                              <span className="font-bold text-app-muted">{item.name.charAt(0)}</span>
                           </div>
                           <div className={`px-3 py-1 rounded-full text-xs font-bold ${item.trend === 'up' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                {item.trend === 'up' ? '▲' : '▼'} {Math.abs(((item.currentPrice - item.previousPrice)/item.previousPrice)*100).toFixed(1)}%
                           </div>
                         </div>
                         
                         <h3 className="font-bold text-lg text-white mb-1">{item.name}</h3>
                         <p className="text-xs text-app-muted mb-4">{item.unit}</p>
                         
                         <div className="flex items-end justify-between">
                            <span className="text-2xl font-bold text-white">₦{item.currentPrice.toLocaleString()}</span>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {/* TAB: CALCULATOR */}
        {activeTab === 'calculator' && (
          <div className="animate-fade-in">
            <Calculator />
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
