
import React, { useState, useEffect } from 'react';
import { getIntradayRecommendations } from '../services/geminiService';
import { IntradayRecommendation } from '../types';

interface IntradayViewProps {
  onSelectStock: (symbol: string) => void;
}

const IntradayView: React.FC<IntradayViewProps> = ({ onSelectStock }) => {
  const [picks, setPicks] = useState<IntradayRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchPicks = async (query?: string) => {
    // Only show full-screen loader for initial fetch or search change
    if (picks.length === 0 || isSearching) setLoading(true);
    
    try {
      const data = await getIntradayRecommendations(query);
      setPicks(data);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Failed to fetch intraday picks", error);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchPicks();
    // Real-time LTP update interval (30 seconds)
    const interval = setInterval(() => {
      fetchPicks(searchQuery || undefined);
    }, 30000); 
    return () => clearInterval(interval);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    fetchPicks(searchQuery);
  };

  if (loading && picks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-slate-800/50 rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-72 bg-slate-800/50 rounded-2xl border border-slate-700"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 text-white">
            <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Live Intraday Ticker
          </h3>
          <p className="text-xs text-slate-500 mt-1">LTP grounding updates every 30s. Last sync: {lastRefresh.toLocaleTimeString()}</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Real-time LTP</span>
           </div>
        </div>
      </div>

      <form onSubmit={handleSearch} className="relative max-w-xl mx-auto md:mx-0">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by sector (Banking, IT, Railways)..."
          className="block w-full pl-10 pr-24 py-3 bg-[#0f172a] border border-slate-800 rounded-xl text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
        >
          {loading ? '...' : 'Scan'}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {picks.map((pick, i) => {
          const ltpStr = pick.currentPrice.replace(/[^0-9.]/g, '');
          const entryStr = pick.entryPrice.replace(/[^0-9.]/g, '');
          const ltp = parseFloat(ltpStr) || 0;
          const entry = parseFloat(entryStr) || 0;
          const isTriggered = pick.bias === 'Bullish' ? ltp >= entry : ltp <= entry;
          
          return (
            <div key={i} className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all flex flex-col group backdrop-blur-sm shadow-xl relative animate-in zoom-in-95 duration-300">
              <div className={`h-1.5 w-full ${pick.bias === 'Bullish' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
              
              <div className="p-5 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="cursor-pointer overflow-hidden flex-1" onClick={() => onSelectStock(pick.symbol)}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-black uppercase text-white bg-slate-800 px-1.5 py-0.5 rounded tracking-widest">
                        {pick.symbol}
                      </span>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                        pick.bias === 'Bullish' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {pick.bias}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors truncate">{pick.companyName}</h4>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xl font-black text-white tracking-tighter">₹{ltp.toLocaleString('en-IN')}</div>
                    <div className={`text-[8px] font-bold uppercase flex items-center justify-end gap-1 ${isTriggered ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {isTriggered ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Triggered
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          Awaiting
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-[#0f172a] p-2 rounded-lg border border-slate-800 text-center">
                    <div className="text-[8px] text-slate-500 font-bold uppercase mb-0.5">Entry</div>
                    <div className="text-[11px] font-black text-white">₹{pick.entryPrice}</div>
                  </div>
                  <div className="bg-[#0f172a] p-2 rounded-lg border border-slate-800 text-center">
                    <div className="text-[8px] text-slate-500 font-bold uppercase mb-0.5">Target</div>
                    <div className="text-[11px] font-black text-emerald-400">₹{pick.targetPrice}</div>
                  </div>
                  <div className="bg-[#0f172a] p-2 rounded-lg border border-slate-800 text-center">
                    <div className="text-[8px] text-slate-500 font-bold uppercase mb-0.5">SL</div>
                    <div className="text-[11px] font-black text-rose-400">₹{pick.stopLoss}</div>
                  </div>
                </div>

                <div className="flex-grow">
                   <p className="text-[11px] text-slate-400 leading-relaxed italic line-clamp-2">"{pick.movementReason}"</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-slate-600 font-bold uppercase">Volatility: {pick.volatility}</span>
                    <span className="text-[8px] text-emerald-500/80 font-black uppercase tracking-tighter">Potential: {pick.expectedProfit}</span>
                  </div>
                  <button 
                    onClick={() => onSelectStock(pick.symbol)}
                    className="text-[9px] font-bold text-slate-400 hover:text-white transition-all bg-slate-800 px-2.5 py-1 rounded border border-slate-700 hover:border-indigo-500/50"
                  >
                    Analysis →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 text-center">
         <p className="text-[10px] text-slate-500 max-w-lg mx-auto leading-relaxed">
           Real-time price grounding is powered by Google Search. Current prices reflect live exchange market data.
         </p>
      </div>
    </div>
  );
};

export default IntradayView;
