
import React, { useState, useEffect, useMemo } from 'react';
import { OrderBookEntry } from '../types';

interface OrderBookProps {
  currentPrice: number;
  sentiment: string;
}

interface ProcessedEntry extends OrderBookEntry {
  cumulativeQty: number;
  cumulativeValue: number;
  lastUpdateType?: 'up' | 'down' | 'none';
}

const OrderBook: React.FC<OrderBookProps> = ({ currentPrice, sentiment }) => {
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);
  const [bids, setBids] = useState<OrderBookEntry[]>([]);

  // Initial generation
  const generateInitialEntries = (type: 'bid' | 'ask', basePrice: number): OrderBookEntry[] => {
    return Array.from({ length: 15 }).map((_, i) => {
      const step = (i + 1) * 0.1;
      const price = type === 'bid' ? basePrice - step : basePrice + step;
      const quantity = Math.floor(Math.random() * 5000) + 500;
      return {
        price: Number(price.toFixed(2)),
        quantity,
        total: quantity * price,
        type
      };
    }).sort((a, b) => type === 'bid' ? b.price - a.price : a.price - b.price);
  };

  // Reset book when price changes
  useEffect(() => {
    if (currentPrice > 0) {
      setAsks(generateInitialEntries('ask', currentPrice));
      setBids(generateInitialEntries('bid', currentPrice));
    }
  }, [currentPrice]);

  // Real-time simulation ticker
  useEffect(() => {
    const interval = setInterval(() => {
      const updateEntries = (entries: OrderBookEntry[], type: 'bid' | 'ask') => {
        return entries.map(entry => {
          // 30% chance to update a row
          if (Math.random() > 0.7) {
            const qtyChange = Math.floor((Math.random() - 0.5) * 500);
            const newQty = Math.max(100, entry.quantity + qtyChange);
            
            // Subtle price shift (10% chance)
            let newPrice = entry.price;
            if (Math.random() > 0.9) {
              const priceShift = 0.05 * (Math.random() > 0.5 ? 1 : -1);
              newPrice = Number((entry.price + priceShift).toFixed(2));
              
              // Prevent spread crossing relative to currentPrice
              if (type === 'bid' && newPrice >= currentPrice) newPrice = entry.price;
              if (type === 'ask' && newPrice <= currentPrice) newPrice = entry.price;
            }

            return {
              ...entry,
              price: newPrice,
              quantity: newQty,
              total: newQty * newPrice
            };
          }
          return entry;
        }).sort((a, b) => type === 'bid' ? b.price - a.price : a.price - b.price);
      };

      setAsks(prev => updateEntries(prev, 'ask'));
      setBids(prev => updateEntries(prev, 'bid'));
    }, 1500);

    return () => clearInterval(interval);
  }, [currentPrice]);

  const processedAsks = useMemo(() => {
    let cumulativeQty = 0;
    let cumulativeValue = 0;
    return [...asks].sort((a, b) => a.price - b.price).map(entry => {
      cumulativeQty += entry.quantity;
      cumulativeValue += entry.total;
      return { ...entry, cumulativeQty, cumulativeValue };
    });
  }, [asks]);

  const processedBids = useMemo(() => {
    let cumulativeQty = 0;
    let cumulativeValue = 0;
    return [...bids].sort((a, b) => b.price - a.price).map(entry => {
      cumulativeQty += entry.quantity;
      cumulativeValue += entry.total;
      return { ...entry, cumulativeQty, cumulativeValue };
    });
  }, [bids]);

  const lowestAsk = asks.length > 0 ? Math.min(...asks.map(a => a.price)) : currentPrice;
  const highestBid = bids.length > 0 ? Math.max(...bids.map(b => b.price)) : currentPrice;
  const spread = Number((lowestAsk - highestBid).toFixed(2));
  const spreadPercentage = ((spread / currentPrice) * 100).toFixed(3);

  const getTooltip = (entry: ProcessedEntry) => {
    return `--- Individual Entry ---
Price: ₹${entry.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
Quantity: ${entry.quantity.toLocaleString()}
Value: ₹${entry.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}

--- Cumulative Depth ---
Total Qty: ${entry.cumulativeQty.toLocaleString()}
Total Value: ₹${entry.cumulativeValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2 text-slate-100">
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Live Order Book
        </h3>
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
          sentiment === 'Bullish' ? 'bg-emerald-500/20 text-emerald-400' : 
          sentiment === 'Bearish' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-700 text-slate-400'
        }`}>
          {sentiment}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-6 flex-grow min-h-[300px]">
        {/* ASKS (Sellers) - Red */}
        <div className="flex flex-col">
          <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 mb-2 px-1">
            <span>Price (₹)</span>
            <span>Qty</span>
          </div>
          <div className="space-y-[2px]">
            {processedAsks.slice(0, 8).reverse().map((ask, idx) => (
              <div 
                key={`${ask.price}-${idx}`} 
                className="flex justify-between text-[13px] py-1 px-1 relative group cursor-help overflow-hidden rounded-sm hover:bg-white/5 transition-colors"
                title={getTooltip(ask)}
              >
                 <div className="absolute right-0 top-0 bottom-0 bg-rose-500/10 transition-all duration-500 pointer-events-none" style={{ width: `${Math.min((ask.cumulativeQty / 25000) * 100, 100)}%` }}></div>
                 <span className="text-rose-400 font-medium z-10">{ask.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                 <span className="text-slate-300 font-mono z-10 tabular-nums">{ask.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* BIDS (Buyers) - Green */}
        <div className="flex flex-col">
          <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 mb-2 px-1">
            <span>Qty</span>
            <span>Price (₹)</span>
          </div>
          <div className="space-y-[2px]">
            {processedBids.slice(0, 8).map((bid, idx) => (
              <div 
                key={`${bid.price}-${idx}`} 
                className="flex justify-between text-[13px] py-1 px-1 relative group cursor-help overflow-hidden rounded-sm hover:bg-white/5 transition-colors"
                title={getTooltip(bid)}
              >
                 <div className="absolute left-0 top-0 bottom-0 bg-emerald-500/10 transition-all duration-500 pointer-events-none" style={{ width: `${Math.min((bid.cumulativeQty / 25000) * 100, 100)}%` }}></div>
                 <span className="text-slate-300 font-mono z-10 tabular-nums">{bid.quantity}</span>
                 <span className="text-emerald-400 font-medium z-10">{bid.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest">Mid Market Price</span>
          </div>
          <div className="text-3xl font-black text-white tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            ₹{currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-slate-500 uppercase font-bold">Spread</span>
              <span className="text-xs font-bold text-indigo-400">₹{spread.toFixed(2)}</span>
            </div>
            <div className="w-px h-6 bg-slate-700"></div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-slate-500 uppercase font-bold">Spread %</span>
              <span className="text-xs font-bold text-indigo-400">{spreadPercentage}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderBook;
