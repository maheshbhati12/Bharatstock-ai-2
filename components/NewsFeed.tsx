
import React from 'react';
import { MarketNewsItem } from '../types';

interface NewsFeedProps {
  news: MarketNewsItem[];
  loading: boolean;
}

const NewsFeed: React.FC<NewsFeedProps> = ({ news, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-24 bg-slate-800/50 rounded-xl animate-pulse border border-slate-700"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          Real-Time Analysis Feed
        </h3>
        <span className="text-[10px] text-indigo-400 font-medium bg-indigo-500/10 px-2 py-0.5 rounded">Updated Live</span>
      </div>
      
      {news.map((item, idx) => (
        <div key={idx} className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-all group">
          <div className="flex justify-between items-start gap-3 mb-2">
            <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors leading-tight">
              {item.title}
            </h4>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase shrink-0 ${
              item.impact === 'Bullish' ? 'bg-emerald-500/20 text-emerald-400' :
              item.impact === 'Bearish' ? 'bg-rose-500/20 text-rose-400' :
              'bg-slate-700 text-slate-400'
            }`}>
              {item.impact}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            {item.summary}
          </p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/50">
            <span className="text-[10px] text-slate-500 font-medium italic">
              Impact: {item.impactReason}
            </span>
            <span className="text-[10px] text-slate-600 font-bold uppercase">{item.timestamp}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NewsFeed;
