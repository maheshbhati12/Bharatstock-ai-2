
import React, { useState, useEffect } from 'react';
import { getIPOData } from '../services/geminiService';
import { IPOInfo } from '../types';

const IPOView: React.FC = () => {
  const [ipos, setIpos] = useState<IPOInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIPOs = async () => {
    setLoading(true);
    try {
      const data = await getIPOData();
      setIpos(data);
    } catch (error) {
      console.error("Failed to fetch IPOs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIPOs();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-80 bg-slate-800/50 rounded-2xl border border-slate-700"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 text-white">
            <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Current & Upcoming IPOs
          </h3>
          <p className="text-xs text-slate-500 mt-1">AI insights on Grey Market Premium and Anchor Book participation.</p>
        </div>
        <button 
          onClick={fetchIPOs}
          className="text-[10px] font-bold text-indigo-400 border border-indigo-500/30 px-3 py-1.5 rounded-lg hover:bg-indigo-500/10 transition-colors uppercase tracking-widest"
        >
          Refresh IPOs
        </button>
      </div>

      {ipos.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-20 text-center">
          <p className="text-slate-500 font-medium">No active or upcoming IPOs identified at this moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ipos.map((ipo, i) => (
            <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all flex flex-col group backdrop-blur-sm shadow-xl">
              <div className={`h-1.5 w-full ${
                ipo.verdict === 'Apply' ? 'bg-emerald-500' : ipo.verdict === 'Avoid' ? 'bg-rose-500' : 'bg-amber-500'
              }`}></div>
              
              <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        ipo.status === 'Open' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {ipo.status}
                      </span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        ipo.verdict === 'Apply' ? 'bg-emerald-500/20 text-emerald-400' : ipo.verdict === 'Avoid' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        Verdict: {ipo.verdict}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{ipo.companyName}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{ipo.openDate} — {ipo.closeDate}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-white">₹{ipo.priceBand}</div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Price Band</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 flex flex-col items-center justify-center">
                    <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">GMP (Grey Market)</div>
                    <div className={`text-lg font-black ${ipo.gmp.startsWith('-') ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {ipo.gmp} ({ipo.gmpPercentage})
                    </div>
                  </div>
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 flex flex-col items-center justify-center">
                    <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">Lot Size</div>
                    <div className="text-lg font-black text-slate-300">{ipo.lotSize} Shares</div>
                  </div>
                </div>

                <div className="flex-grow space-y-4">
                  <div className="bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10">
                    <h5 className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Anchor Book Highlights
                    </h5>
                    <p className="text-xs text-slate-300 leading-relaxed italic">"{ipo.anchorBook}"</p>
                  </div>
                  <div>
                    <h5 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">AI Recommendation Logic</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">{ipo.reasoning}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IPOView;
