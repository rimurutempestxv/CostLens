import React, { useState } from 'react';
import { Calculator as CalcIcon, MapPin, Lightbulb, ArrowRightLeft } from 'lucide-react';
import { getCostOfLivingTips } from '../services/geminiService';

export const Calculator: React.FC = () => {
  const [salary, setSalary] = useState<number>(150000);
  const [location, setLocation] = useState<string>('Lagos');
  const [result, setResult] = useState<number | null>(null);
  const [tips, setTips] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Simplified Purchasing Power Logic
  const calculateImpact = () => {
    const inflationRate = 0.33; 
    const realValue = salary / (1 + inflationRate);
    setResult(realValue);
    fetchTips();
  };

  const fetchTips = async () => {
    setLoading(true);
    const tipData = await getCostOfLivingTips(salary, location);
    setTips(tipData);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pb-20">
      
      {/* Input Card */}
      <div className="bg-app-card p-8 rounded-3xl border border-app-border">
        <div className="flex items-center justify-between mb-8">
            <div>
                 <h2 className="text-2xl font-bold text-white">Purchasing Power</h2>
                 <p className="text-app-muted text-sm mt-1">Calculate your real salary value</p>
            </div>
            <div className="h-10 w-10 bg-app-surface rounded-full flex items-center justify-center border border-app-border">
                 <ArrowRightLeft className="h-5 w-5 text-white" />
            </div>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Monthly Income</label>
            <div className="bg-app-bg rounded-2xl p-4 flex items-center justify-between border border-transparent focus-within:border-app-accent transition-colors">
              <span className="text-2xl font-bold text-app-muted">₦</span>
              <input
                type="number"
                value={salary}
                onChange={(e) => setSalary(Number(e.target.value))}
                className="bg-transparent text-right text-3xl font-bold text-white w-full outline-none placeholder-gray-700"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Location</label>
            <div className="relative">
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full appearance-none bg-app-surface text-white text-lg font-medium p-4 rounded-2xl border border-app-border outline-none focus:border-app-accent transition-colors"
              >
                <option value="Lagos">Lagos</option>
                <option value="Abuja">Abuja</option>
                <option value="Port Harcourt">Port Harcourt</option>
                <option value="Kano">Kano</option>
                <option value="Ibadan">Ibadan</option>
                <option value="Enugu">Enugu</option>
              </select>
              <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-app-muted pointer-events-none" />
            </div>
          </div>

          <button
            onClick={calculateImpact}
            className="w-full bg-white text-black font-bold text-lg py-4 rounded-full hover:scale-[1.02] active:scale-95 transition-all shadow-glow mt-4"
          >
            Calculate Impact
          </button>
        </div>

        {result !== null && (
          <div className="mt-8 pt-6 border-t border-app-border">
            <div className="flex justify-between items-center mb-2">
                <span className="text-app-muted text-sm">Real 2023 Value</span>
                <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded">-33%</span>
            </div>
            <div className="text-4xl font-bold text-white mb-2">
              ₦{result.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-app-muted leading-relaxed">
              Due to inflation, your current salary has the purchasing power of this amount compared to a year ago.
            </p>
          </div>
        )}
      </div>

      {/* Tips Card */}
      <div className="bg-app-card p-8 rounded-3xl border border-app-border relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-app-accent/10 rounded-full blur-[100px] -mr-20 -mt-20"></div>
         
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-500/20 rounded-xl">
                    <Lightbulb className="h-6 w-6 text-yellow-500" />
                </div>
                <h2 className="text-xl font-bold text-white">Smart Tips</h2>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-app-muted gap-4">
                    <div className="animate-spin h-8 w-8 border-4 border-app-surface border-t-app-accent rounded-full"></div>
                    <p className="text-sm">Analysing market data...</p>
                </div>
            ) : tips ? (
                <div className="space-y-4">
                     {tips.replace(/\*/g, '').split('- ').map((tip, i) => (
                        tip.length > 5 ? (
                            <div key={i} className="bg-app-surface/50 p-4 rounded-2xl border border-app-border hover:border-app-accent/30 transition-colors">
                                <div className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-app-accent text-white rounded-full flex items-center justify-center text-xs font-bold">{i}</span>
                                    <p className="text-sm text-gray-300 leading-relaxed">{tip}</p>
                                </div>
                            </div>
                        ) : null
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-app-muted border-2 border-dashed border-app-border rounded-2xl bg-app-surface/20">
                    <p className="text-sm">Calculate to reveal tips</p>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};
