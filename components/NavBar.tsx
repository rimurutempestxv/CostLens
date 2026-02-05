import React from 'react';
import { LayoutDashboard, TrendingUp, Calculator, Menu, RefreshCw, Radio, Settings, User } from 'lucide-react';

interface NavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isUpdating?: boolean;
  lastUpdated?: Date | null;
  onRefresh?: () => void;
}

export const NavBar: React.FC<NavBarProps> = ({ activeTab, setActiveTab, isUpdating, lastUpdated, onRefresh }) => {
  return (
    <>
      {/* Desktop Top Nav */}
      <nav className="hidden md:block bg-app-bg border-b border-app-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="bg-app-surface p-2.5 rounded-xl border border-app-border">
                <TrendingUp className="h-6 w-6 text-app-accent" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-white">CostLens</span>
            </div>
            
            <div className="flex items-center space-x-1">
              {['dashboard', 'market', 'calculator'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeTab === tab 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-app-muted hover:text-white hover:bg-app-surface'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-4">
               {/* Live Status */}
               <div className="flex items-center gap-2 bg-app-surface px-4 py-2 rounded-full border border-app-border">
                  {isUpdating ? (
                      <RefreshCw className="h-3 w-3 text-app-accent animate-spin" />
                  ) : (
                      <Radio className="h-3 w-3 text-app-success animate-pulse" />
                  )}
                  <div className="flex flex-col leading-none">
                      <span className="text-[10px] text-app-muted font-bold tracking-wider">LIVE API</span>
                      {lastUpdated && !isUpdating && (
                          <span className="text-[9px] text-app-muted opacity-70">
                            {lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                      )}
                  </div>
               </div>
               
               <button 
                  onClick={onRefresh}
                  disabled={isUpdating}
                  className="p-3 bg-app-surface border border-app-border rounded-full text-app-muted hover:text-white hover:border-app-accent transition-all"
               >
                  <RefreshCw className={`h-5 w-5 ${isUpdating ? 'animate-spin' : ''}`} />
               </button>
               
               <div className="h-10 w-10 bg-app-surface rounded-full border border-app-border flex items-center justify-center">
                  <User className="h-5 w-5 text-app-muted" />
               </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar (Title & Refresh) */}
      <div className="md:hidden sticky top-0 z-50 bg-app-bg/95 backdrop-blur-md border-b border-app-border px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <span className="font-bold text-xl text-white">CostLens</span>
        </div>
        <div className="flex items-center gap-3">
            {isUpdating && <RefreshCw className="h-4 w-4 text-app-accent animate-spin" />}
            <div className="h-8 w-8 bg-app-surface rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-app-muted" />
            </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 bg-[#1C1C1E] border border-white/10 rounded-3xl z-50 shadow-2xl shadow-black/50">
        <div className="flex justify-around items-center h-16 px-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`p-3 rounded-2xl transition-all ${activeTab === 'dashboard' ? 'bg-white/10 text-white' : 'text-gray-500'}`}
          >
            <LayoutDashboard className="h-6 w-6" />
          </button>
          <button 
            onClick={() => setActiveTab('market')}
            className={`p-3 rounded-2xl transition-all ${activeTab === 'market' ? 'bg-white/10 text-white' : 'text-gray-500'}`}
          >
            <TrendingUp className="h-6 w-6" />
          </button>
          <button 
            onClick={() => setActiveTab('calculator')}
            className={`p-3 rounded-2xl transition-all ${activeTab === 'calculator' ? 'bg-white/10 text-white' : 'text-gray-500'}`}
          >
            <Calculator className="h-6 w-6" />
          </button>
          <button 
            onClick={onRefresh}
            className={`p-3 rounded-2xl transition-all active:scale-95 text-gray-500`}
          >
             <RefreshCw className={`h-6 w-6 ${isUpdating ? 'animate-spin text-app-accent' : ''}`} />
          </button>
        </div>
      </nav>
    </>
  );
};