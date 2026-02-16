
import React, { useState, useEffect } from 'react';
import { getScreenerResults } from '../services/geminiService';
import { ScreenerStock } from '../types';

interface ScreenerProps {
  onSelectStock: (symbol: string) => void;
}

const CATEGORIES = [
  { id: 'gainers', label: 'Top Gainers', filter: 'Top 10 gainers in Nifty 50 today' },
  { id: 'losers', label: 'Top Losers', filter: 'Top 10 losers in Nifty 50 today' },
  { id: 'dividends', label: 'High Dividend Yield', filter: 'Highest dividend yield stocks in NSE' },
  { id: 'undervalued', label: 'Undervalued Gems', filter: 'Indian stocks with low PE ratio and strong growth' },
  { id: 'bluechip', label: 'Blue Chip Staples', filter: 'Safest blue chip stocks in India' },
];

const Screener: React.FC<ScreenerProps> = ({ onSelectStock }) => {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [stocks, setStocks] = useState<ScreenerStock[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStocks = async (category: typeof CATEGORIES[0]) => {
    setLoading(true);
    try {
      const data = await getScreenerResults(category.filter);
      setStocks(data);
    } catch (error) {
      console.error("Failed to screen stocks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks(activeCategory);
  }, [activeCategory]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              activeCategory.id === cat.id 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80">
                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Symbol</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Company</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Price</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Change</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">M.Cap</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">P/E</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-slate-800/50">
                    <td colSpan={7} className="p-6">
                      <div className="h-4 bg-slate-800 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : stocks.map((stock, i) => (
                <tr key={i} className="border-b border-slate-800/50 hover:bg-white/5 transition-colors group">
                  <td className="p-4">
                    <span className="font-bold text-white bg-slate-800 px-2 py-1 rounded text-xs">{stock.symbol}</span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-slate-300 truncate max-w-[150px] md:max-w-xs" title={stock.companyName}>
                      {stock.companyName}
                    </div>
                    <div className="text-[10px] text-slate-600">{stock.sector}</div>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-sm font-bold text-white">{stock.price}</span>
                  </td>
                  <td className="p-4 text-right">
                    <span className={`text-xs font-bold ${
                      stock.change.includes('-') ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {stock.change}
                    </span>
                  </td>
                  <td className="p-4 text-right text-xs text-slate-400">{stock.marketCap}</td>
                  <td className="p-4 text-right text-xs text-slate-400">{stock.peRatio}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => onSelectStock(stock.symbol)}
                      className="bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all"
                    >
                      Analyze
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Screener;
