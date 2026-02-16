
import React from 'react';
import { MarketSummary } from '../types';

interface MarketPulseProps {
  data: MarketSummary;
}

const MarketPulse: React.FC<MarketPulseProps> = ({ data }) => {
  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-2xl overflow-hidden mb-12 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-gradient-to-r from-indigo-900/50 to-slate-800 p-6 border-b border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="text-rose-400 text-xs font-bold uppercase tracking-widest">Market Pulse Live</span>
          </div>
          <span className="text-slate-500 text-xs font-medium">{new Date().toLocaleDateString()}</span>
        </div>
        <h2 className="text-2xl font-bold text-white">{data.headline}</h2>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Key Indices */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">Key Indices</h3>
          <div className="space-y-3">
            {[
              { label: 'NIFTY 50', val: data.indices.nifty50 },
              { label: 'SENSEX', val: data.indices.sensex },
              { label: 'NIFTY BANK', val: data.indices.niftyBank }
            ].map((idx) => (
              <div key={idx.label} className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-400">{idx.label}</span>
                <span className="text-sm font-black text-white">{idx.val}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3">Global Cues</h3>
            <p className="text-xs text-slate-400 leading-relaxed italic">
              {data.globalCues}
            </p>
          </div>
        </div>

        {/* Market Stories */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Today's Deep Dive</h3>
          <div className="space-y-6">
            {data.topStories.map((story, i) => (
              <div key={i} className="group cursor-default">
                <h4 className="text-white font-bold group-hover:text-indigo-400 transition-colors mb-1">{story.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{story.description}</p>
              </div>
            ))}
          </div>
          <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
             <p className="text-sm text-slate-300 font-medium leading-relaxed">{data.overview}</p>
          </div>
        </div>

        {/* Sectoral Performance */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Sectoral Move</h3>
          <div className="space-y-3">
            {data.sectoralPerformance.map((sector, i) => (
              <div key={i} className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-white uppercase">{sector.sector}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    sector.status.toLowerCase().includes('top') || sector.status.toLowerCase().includes('gain') 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {sector.status}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">{sector.impact}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketPulse;
