
export interface StockAnalysis {
  symbol: string;
  companyName: string;
  currentPrice: string;
  pros: string[];
  cons: string[];
  detailedAnalysis: string;
  prediction: {
    targetPrice: string;
    expectedReturn: string;
    timeframe: string;
    confidence: string;
  };
  riskScore: 'Low' | 'Medium' | 'High';
  technicalScorecard: {
    quality: number;
    valuation: number;
    momentum: number;
  };
  peers: Array<{
    symbol: string;
    companyName: string;
    price: string;
    marketCap: string;
  }>;
  orderBookInsight: {
    buyDepth: number;
    sellDepth: number;
    sentiment: 'Bullish' | 'Bearish' | 'Neutral';
    reasoning: string;
  };
  priceHistory: Array<{ date: string; price: number }>;
  sources: Array<{ title: string; uri: string }>;
}

export interface MarketSummary {
  headline: string;
  overview: string;
  indices: {
    nifty50: string;
    sensex: string;
    niftyBank: string;
  };
  topStories: Array<{ title: string; description: string }>;
  sectoralPerformance: Array<{ sector: string; status: string; impact: string }>;
  globalCues: string;
}

export interface MarketNewsItem {
  title: string;
  summary: string;
  impact: 'Bullish' | 'Bearish' | 'Neutral';
  impactReason: string;
  timestamp: string;
}

export interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
  type: 'bid' | 'ask';
}

export interface ScreenerStock {
  symbol: string;
  companyName: string;
  price: string;
  change: string;
  marketCap: string;
  peRatio: string;
  sector: string;
}

export interface CompanyOrder {
  symbol: string;
  companyName: string;
  worth: string;
  client: string;
  period: string;
  description: string;
  announcedDate: string;
}

export interface IntradayRecommendation {
  symbol: string;
  companyName: string;
  bias: 'Bullish' | 'Bearish';
  currentPrice: string;
  entryPrice: string;
  targetPrice: string;
  stopLoss: string;
  expectedProfit: string;
  movementReason: string;
  strongReason: string;
  volatility: 'Low' | 'Medium' | 'High';
  lastUpdated: string;
}

export interface PortfolioHolding {
  id: string;
  symbol: string;
  quantity: number;
  buyPrice: number;
  currentPrice?: number;
  lastUpdated?: string;
}

export interface IPOInfo {
  companyName: string;
  priceBand: string;
  lotSize: string;
  gmp: string;
  gmpPercentage: string;
  anchorBook: string;
  verdict: 'Apply' | 'Avoid' | 'Neutral';
  reasoning: string;
  openDate: string;
  closeDate: string;
  status: 'Open' | 'Upcoming' | 'Closed';
}
