
import React, { useState, useEffect } from 'react';
import { PortfolioHolding } from '../types';

const PortfolioView: React.FC = () => {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newStock, setNewStock] = useState({ symbol: '', quantity: 1, buyPrice: 0 });

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('bharatstock_portfolio');
    if (saved) {
      try {
        setHoldings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load portfolio", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('bharatstock_portfolio', JSON.stringify(holdings));
  }, [holdings]);

  const addHolding = () => {
    if (!newStock.symbol) return;
    const holding: PortfolioHolding = {
      id: Math.random().toString(36).substr(2, 9),
      symbol: newStock.symbol.toUpperCase(),
      quantity: newStock.quantity,
      buyPrice: newStock.buyPrice,
      currentPrice: newStock.buyPrice, // Mock current price as buy price initially
      lastUpdated: new Date().toISOString()
    };
    setHoldings([...holdings, holding]);
    setNewStock({ symbol: '', quantity: 1, buyPrice: 0 });
    setIsAdding(false);
  };

  const removeHolding = (id: string) => {
    setHoldings(holdings.filter(h => h.id !== id));
  };

  const handleExportCSV = () => {
    if (holdings.length === 0) return;
    
    const headers = ["Symbol", "Quantity", "Buy Price", "Investment", "Current Price", "Current Value", "P&L", "P&L %"];
    const rows = holdings.map(h => {
      const investment = h.buyPrice * h.quantity;
      const currentVal = (h.currentPrice || h.buyPrice) * h.quantity;
      const pnl = currentVal - investment;
      const pnlPct = (pnl / investment) * 100;
      
      return [
        h.symbol,
        h.quantity,
        h.buyPrice,
        investment.toFixed(2),
        (h.currentPrice || h.buyPrice),
        currentVal.toFixed(2),
        pnl.toFixed(2),
        pnlPct.toFixed(2) + "%"
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BharatStock_Portfolio_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalInvestment = holdings.reduce((acc, h) => acc + (h.buyPrice * h.quantity), 0);
  const totalCurrentValue = holdings.reduce((acc, h) => acc + ((h.currentPrice || h.buyPrice) * h.quantity), 0);
  const totalPnL = totalCurrentValue - totalInvestment;
  const pnlPercent = totalInvestment > 0 ? (totalPnL / totalInvestment) * 100 : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 text-white">
            <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            My Portfolio
          </h3>
          <p className="text-xs text-slate-500 mt-1">Track your Indian stock holdings and performance.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportCSV}
            disabled={holdings.length === 0}
            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 font-bold py-2 px-6 rounded-xl text-sm transition-all border border-slate-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Stock
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Investment</p>
          <p className="text-2xl font-black text-white">₹{totalInvestment.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Current Value</p>
          <p className="text-2xl font-black text-white">₹{totalCurrentValue.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Total P&L</p>
          <div className="flex items-center gap-2">
            <p className={`text-2xl font-black ${totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ₹{totalPnL.toLocaleString('en-IN')}
            </p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${totalPnL >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              {totalPnL >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {isAdding && (
        <div className="bg-slate-900/80 border border-indigo-500/30 p-6 rounded-2xl animate-in fade-in zoom-in-95">
          <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Add New Holding</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input 
              placeholder="Symbol (e.g. RELIANCE)"
              value={newStock.symbol}
              onChange={e => setNewStock({...newStock, symbol: e.target.value})}
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:border-indigo-500 outline-none"
            />
            <input 
              type="number"
              placeholder="Quantity"
              value={newStock.quantity}
              onChange={e => setNewStock({...newStock, quantity: parseInt(e.target.value) || 0})}
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:border-indigo-500 outline-none"
            />
            <input 
              type="number"
              placeholder="Buy Price"
              value={newStock.buyPrice}
              onChange={e => setNewStock({...newStock, buyPrice: parseFloat(e.target.value) || 0})}
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:border-indigo-500 outline-none"
            />
            <div className="flex gap-2">
              <button onClick={addHolding} className="flex-grow bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-sm transition-all">Save</button>
              <button onClick={() => setIsAdding(false)} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-xl text-sm transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800">
                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Stock</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Qty</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Buy Price</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Investment</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Current</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">P&L</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {holdings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-600 font-medium italic">Your portfolio is empty. Add a stock to get started.</td>
                </tr>
              ) : holdings.map((h) => {
                const investment = h.buyPrice * h.quantity;
                const currentVal = (h.currentPrice || h.buyPrice) * h.quantity;
                const pnl = currentVal - investment;
                const pnlPct = (pnl / investment) * 100;
                
                return (
                  <tr key={h.id} className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-white text-sm">{h.symbol}</span>
                    </td>
                    <td className="p-4 text-right font-medium text-slate-300">{h.quantity}</td>
                    <td className="p-4 text-right font-medium text-slate-300">₹{h.buyPrice.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-right font-medium text-slate-300">₹{investment.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-right font-medium text-white">₹{(h.currentPrice || h.buyPrice).toLocaleString('en-IN')}</td>
                    <td className="p-4 text-right">
                      <div className={`text-sm font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {pnl >= 0 ? '+' : ''}{pnl.toLocaleString('en-IN')}
                      </div>
                      <div className={`text-[10px] font-bold ${pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => removeHolding(h.id)}
                        className="text-slate-600 hover:text-rose-400 transition-colors p-2"
                        title="Remove Holding"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PortfolioView;
