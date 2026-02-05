import React, { useState, useEffect } from 'react';
import { Bot, RefreshCw, AlertTriangle, Sparkles, Zap } from 'lucide-react';
import { analyzeEconomy } from '../services/geminiService';
import { InflationDataPoint, CommodityItem } from '../types';

interface AIAnalystProps {
  inflationData: InflationDataPoint[];
  commodities: CommodityItem[];
  selectedModel: string;
}

export const AIAnalyst: React.FC<AIAnalystProps> = ({ inflationData, commodities, selectedModel }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await analyzeEconomy(inflationData, commodities, selectedModel);
      setAnalysis(result);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [selectedModel]);

  return (
    <div className="bg-gradient-to-br from-[#1c1c1e] to-[#121212] text-white rounded-3xl shadow-xl overflow-hidden flex flex-col h-full border border-app-border relative">
      {/* Decorative gradient blob */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      
      <div className="p-6 border-b border-app-border flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/20 p-2.5 rounded-xl border border-indigo-500/30">
            <Sparkles className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Gemini Economist</h3>
            <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-xs text-gray-400">AI Model Active</p>
            </div>
          </div>
        </div>
        <button 
          onClick={fetchAnalysis} 
          disabled={loading}
          className="p-3 hover:bg-white/5 rounded-full transition-colors border border-transparent hover:border-white/10"
        >
          <RefreshCw className={`h-4 w-4 text-gray-400 ${loading ? 'animate-spin text-white' : ''}`} />
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="space-y-4">
             {[1, 2, 3].map(i => (
                 <div key={i} className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-3 py-1">
                        <div className="h-2 bg-white/10 rounded w-3/4"></div>
                        <div className="h-2 bg-white/10 rounded"></div>
                        <div className="h-2 bg-white/10 rounded w-5/6"></div>
                    </div>
                 </div>
             ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-red-400">
            <AlertTriangle className="h-10 w-10 mb-4 opacity-50" />
            <p className="text-sm">Analysis currently unavailable.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {analysis.split('\n').map((line, i) => {
                if (line.startsWith('###') || line.includes('**Current Status**') || line.includes('**Impact Analysis**') || line.includes('**Short-term Outlook**')) {
                    const title = line.replace(/###|\*\*/g, '').replace(':', '');
                    return (
                        <div key={i} className="flex items-center gap-2 mt-4 mb-2">
                             <Zap className="h-4 w-4 text-app-accent" />
                             <h3 className="text-base font-bold text-white">{title}</h3>
                        </div>
                    );
                }
                if (line.startsWith('1.') || line.startsWith('-')) {
                    return (
                        <div key={i} className="bg-app-surface/40 p-3 rounded-xl border border-white/5 mb-2">
                            <p className="text-sm text-gray-300 leading-relaxed">{line.replace(/^[0-9.-]+\s/, '')}</p>
                        </div>
                    )
                }
                if (line.trim() === '') return null;
                return <p key={i} className="text-sm text-gray-400 leading-relaxed">{line.replace(/\*\*/g, '')}</p>;
            })}
          </div>
        )}
      </div>

      <div className="p-4 bg-black/20 text-[10px] text-center text-gray-600 uppercase tracking-widest font-bold">
        Powered by Gemini 3 Flash
      </div>
    </div>
  );
};
