
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { analyzeStock, getMarketSummary, getRealtimeNews } from './services/geminiService';
import { StockAnalysis, MarketSummary, MarketNewsItem } from './types';
import AnalysisView from './components/AnalysisView';
import MarketPulse from './components/MarketPulse';
import NewsFeed from './components/NewsFeed';
import Screener from './components/Screener';
import OrderActivity from './components/OrderActivity';
import IntradayView from './components/IntradayView';
import PortfolioView from './components/PortfolioView';
import IPOView from './components/IPOView';
import ImageStudio from './components/ImageStudio';

type ViewMode = 'dashboard' | 'screener' | 'analysis' | 'orders' | 'intraday' | 'portfolio' | 'ipo' | 'studio';

// Increased interval to 5 minutes (300,000ms) to respect free tier rate limits
const REFRESH_INTERVAL = 300000; 

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [newsLoading, setNewsLoading] = useState(true);
  const [feedLoading, setFeedLoading] = useState(true);
  const [analysis, setAnalysis] = useState<StockAnalysis | null>(null);
  const [marketSummary, setMarketSummary] = useState<MarketSummary | null>(null);
  const [realtimeNews, setRealtimeNews] = useState<MarketNewsItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [nextRefreshIn, setNextRefreshIn] = useState(REFRESH_INTERVAL / 1000);

  const fetchMarketData = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setNewsLoading(true);
      setFeedLoading(true);
    }
    setError(null);
    try {
      const summary = await getMarketSummary();
      setMarketSummary(summary);
      setNewsLoading(false);
      
      const news = await getRealtimeNews();
      setRealtimeNews(news);
      setFeedLoading(false);
      setLastUpdated(new Date());
      setNextRefreshIn(REFRESH_INTERVAL / 1000);
    } catch (err: any) {
      console.error(err);
      if (isInitial) setError("Market engine throttled. Retrying shortly...");
    } finally {
      setNewsLoading(false);
      setFeedLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketData(true);
    const interval = setInterval(() => fetchMarketData(false), REFRESH_INTERVAL);
    const countdown = setInterval(() => setNextRefreshIn(p => p > 0 ? p - 1 : REFRESH_INTERVAL / 1000), 1000);
    return () => { clearInterval(interval); clearInterval(countdown); };
  }, [fetchMarketData]);

  const triggerAnalysis = async (targetSymbol: string) => {
    setLoading(true);
    setError(null);
    setSymbol(targetSymbol.toUpperCase());
    try {
      const data = await analyzeStock(targetSymbol);
      setAnalysis(data);
      setViewMode('analysis');
    } catch (err: any) {
      const isQuota = err.message.toLowerCase().includes('quota') || err.message.toLowerCase().includes('429');
      setError(isQuota ? "AI Quota exceeded. Please wait a moment and try again." : "Analysis failed. Check ticker symbol.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbol.trim()) triggerAnalysis(symbol);
  };

  return (
    <div className="min-h-screen pb-20 bg-[#070b14] text-slate-100 font-inter">
      <nav className="border-b border-slate-800 bg-[#0f172a]/90 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setViewMode('dashboard'); setAnalysis(null); }}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <h1 className="text-xl font-bold">BharatStock AI</h1>
          </div>
          
          <div className="hidden lg:flex items-center gap-6">
            {['DASHBOARD', 'PORTFOLIO', 'ORDER WINS', 'IPO CENTER', 'INTRADAY', 'SCREENER'].map((nav) => (
              <button 
                key={nav}
                onClick={() => { setViewMode(nav.toLowerCase().replace(' ', '') as ViewMode); setAnalysis(null); }}
                className={`text-[10px] font-black tracking-widest uppercase transition-colors ${viewMode === nav.toLowerCase().replace(' ', '') ? 'text-indigo-400' : 'text-slate-500 hover:text-white'}`}
              >
                {nav}
              </button>
            ))}
          </div>

          <div className="flex flex-col items-end">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[9px] text-emerald-400 font-black uppercase tracking-widest">Grounded Sync</span>
             </div>
             <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">
                Refresh in {Math.floor(nextRefreshIn / 60)}m {Math.floor(nextRefreshIn % 60)}s
             </span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        <div className="max-w-2xl mx-auto mb-10 text-center">
          <h2 className="text-4xl font-black mb-3 tracking-tight">Advanced <span className="text-indigo-500">Market Insight</span></h2>
          <form onSubmit={handleSearch} className="relative group mt-6">
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="Ticker Symbol (RELIANCE, TCS...)"
              className="w-full bg-[#111827] border border-slate-800 rounded-2xl py-4 px-6 text-xl font-medium focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700"
            />
            <button type="submit" disabled={loading} className="absolute right-2 top-2 bottom-2 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all disabled:opacity-50">
              {loading ? '...' : 'Analyze'}
            </button>
          </form>
        </div>

        {error && <div className="max-w-2xl mx-auto mb-8 bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl text-center text-rose-400 text-xs font-bold animate-pulse">{error}</div>}

        {loading ? (
           <div className="py-20 text-center">
              <div className="w-12 h-12 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Processing Financial Intelligence...</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              {viewMode === 'analysis' && analysis ? <AnalysisView data={analysis} /> :
               viewMode === 'screener' ? <Screener onSelectStock={triggerAnalysis} /> :
               viewMode === 'orders' ? <OrderActivity onSelectStock={triggerAnalysis} /> :
               viewMode === 'intraday' ? <IntradayView onSelectStock={triggerAnalysis} /> :
               viewMode === 'portfolio' ? <PortfolioView /> :
               viewMode === 'ipo' ? <IPOView /> :
               viewMode === 'studio' ? <ImageStudio /> :
               <div className="space-y-8">
                  {newsLoading ? <div className="h-64 bg-[#111827] rounded-2xl animate-pulse" /> : marketSummary && <MarketPulse data={marketSummary} />}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['Contract Wins', 'IPO Tracker', 'AI Viz Studio'].map((title, i) => (
                      <div key={i} className="bg-[#111827] p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer" onClick={() => setViewMode(['orders', 'ipo', 'studio'][i] as ViewMode)}>
                        <h4 className="font-bold text-white mb-1">{title}</h4>
                        <p className="text-xs text-slate-500">Deep AI analysis on {title.toLowerCase()}.</p>
                      </div>
                    ))}
                  </div>
               </div>
              }
            </div>
            <div className="lg:col-span-1">
              <NewsFeed news={realtimeNews} loading={feedLoading} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
