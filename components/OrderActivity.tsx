
import React, { useState, useEffect, useMemo } from 'react';
import { getRecentOrders } from '../services/geminiService';
import { CompanyOrder } from '../types';

const TIME_FILTERS = [
  "Today",
  "Yesterday",
  "7 Days",
  "1 Month",
  "3 Months",
  "6 Months"
];

const OrderActivity: React.FC<{ onSelectStock: (symbol: string) => void }> = ({ onSelectStock }) => {
  const [orders, setOrders] = useState<CompanyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState("7 Days");

  const fetchOrders = async (query?: string, time?: string) => {
    setLoading(true);
    try {
      const data = await getRecentOrders(query, time || activeFilter);
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(searchTerm, activeFilter);
  }, [activeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(searchTerm, activeFilter);
  };

  const totalValue = useMemo(() => {
    return orders.reduce((acc, order) => {
      const val = parseFloat(order.worth.replace(/[^0-9.]/g, '')) || 0;
      return acc + val;
    }, 0);
  }, [orders]);

  if (loading && orders.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-slate-800 animate-pulse rounded-xl w-full"></div>
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 text-white">
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            Order Wins Terminal
          </h3>
          <p className="text-xs text-slate-500 mt-1">Grounded analysis of recently received corporate contracts across NSE/BSE.</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
           <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search companies..."
              className="bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:border-indigo-500 outline-none w-full md:w-64 transition-all"
           />
           <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">Search</button>
        </form>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
         <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
               <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Contract Inflow ({activeFilter})</p>
               <p className="text-xl font-black text-emerald-400">₹{totalValue.toLocaleString('en-IN')} Cr+</p>
            </div>
            <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
         </div>
         <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
               <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Major Wins Count</p>
               <p className="text-xl font-black text-indigo-400">{orders.length} Companies</p>
            </div>
            <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
         </div>
      </div>

      {/* Time Period Filter Bar */}
      <div className="flex items-center gap-1 p-1.5 bg-slate-900/80 border border-slate-800 rounded-2xl overflow-x-auto no-scrollbar">
        {TIME_FILTERS.map((time) => (
          <button
            key={time}
            onClick={() => setActiveFilter(time)}
            className={`flex-1 min-w-[110px] py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeFilter === time 
              ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30' 
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            {time}
          </button>
        ))}
      </div>

      {orders.length === 0 && !loading ? (
        <div className="text-center py-24 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
           <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
           </div>
           <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No contract wins identified for this timeframe.</p>
        </div>
      ) : (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
          {orders.map((order, i) => {
            const isVeryRecent = activeFilter === "Today" || activeFilter === "Yesterday";
            
            return (
              <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-500/50 transition-all group backdrop-blur-sm relative overflow-hidden animate-in zoom-in-95 duration-300">
                {isVeryRecent && (
                  <div className="absolute top-0 right-0 p-4">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                  </div>
                )}

                <div className="z-10">
                  <div className="flex justify-between items-start mb-5">
                    <div className="cursor-pointer max-w-[65%]" onClick={() => onSelectStock(order.symbol)}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
                          {order.symbol}
                        </span>
                        {isVeryRecent && <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">New Order</span>}
                      </div>
                      <h4 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors truncate">{order.companyName}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-0.5">Announced: {order.announcedDate}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 font-black text-xl tracking-tight">₹{order.worth}</div>
                      <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Contract value</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-5">
                     <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/50">
                        <p className="text-[8px] text-slate-600 font-black uppercase mb-1">Awarded By</p>
                        <p className="text-[11px] font-bold text-slate-300 truncate">{order.client}</p>
                     </div>
                     <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/50">
                        <p className="text-[8px] text-slate-600 font-black uppercase mb-1 flex items-center gap-1">
                          Timeline
                          <svg className="w-2 h-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3" /></svg>
                        </p>
                        <p className="text-[11px] font-bold text-indigo-400">{order.period}</p>
                     </div>
                  </div>

                  <div className="bg-slate-800/30 p-4 rounded-xl mb-5 border border-slate-800/30 group-hover:bg-slate-800/50 transition-colors">
                    <p className="text-[11px] text-slate-400 leading-relaxed italic line-clamp-3">
                      "{order.description}"
                    </p>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-800/50 flex justify-between items-center text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5">
                     <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                     </svg>
                     Grounded Insight
                  </span>
                  <button 
                    onClick={() => onSelectStock(order.symbol)}
                    className="text-indigo-400 hover:text-white transition-all bg-indigo-500/10 hover:bg-indigo-600 px-3 py-1.5 rounded-lg border border-indigo-500/20 text-[8px] font-black flex items-center gap-2"
                  >
                    Deep Analysis
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 text-center">
         <p className="text-[10px] text-slate-500 max-w-lg mx-auto leading-relaxed uppercase tracking-tighter">
           AI-Grounded Order Terminal: Syncing corporate filings from the last 6 months. Dates and values are estimated from public disclosures.
         </p>
      </div>
    </div>
  );
};

export default OrderActivity;
