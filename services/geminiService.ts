
import { GoogleGenAI, Type } from "@google/genai";
import { StockAnalysis, MarketSummary, MarketNewsItem, ScreenerStock, CompanyOrder, IntradayRecommendation, IPOInfo } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

// Extended cache duration to 5 minutes for general market data to reduce API pressure
const CACHE_DURATION = 5 * 60 * 1000; 
const cache: Record<string, { data: any; timestamp: number }> = {};

function getCachedData<T>(key: string): T | null {
  const cached = cache[key];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) return cached.data;
  return null;
}

function setCachedData(key: string, data: any) {
  cache[key] = { data, timestamp: Date.now() };
}

// Increased throttle to 4 seconds per request to stay within free tier limits
let apiLock = Promise.resolve();
async function throttle() {
  const currentLock = apiLock;
  apiLock = currentLock.then(() => new Promise(resolve => setTimeout(resolve, 4000)));
  await currentLock;
}

async function withRetry<T>(fn: () => Promise<T>, retries = 5, initialDelay = 8000): Promise<T> {
  let delay = initialDelay;
  for (let i = 0; i <= retries; i++) {
    try {
      await throttle();
      return await fn();
    } catch (error: any) {
      const errorMsg = error?.message?.toLowerCase() || "";
      const isRateLimit = 
        error?.status === 429 || 
        error?.code === 429 || 
        errorMsg.includes('429') || 
        errorMsg.includes('resource_exhausted') || 
        errorMsg.includes('quota') ||
        errorMsg.includes('limit');

      if (i < retries && isRateLimit) {
        // Log for debugging
        console.warn(`Rate limit hit. Retrying in ${delay / 1000}s... (Attempt ${i + 1}/${retries})`);
        
        const jitter = Math.random() * 2000;
        const waitTime = delay + jitter;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        // Exponential backoff
        delay *= 2; 
        continue;
      }
      throw error;
    }
  }
  throw new Error("AI capacity reached. Please check your Gemini API quota or wait a few minutes.");
}

export const analyzeStock = async (symbol: string): Promise<StockAnalysis> => {
  return await withRetry(async () => {
    const ai = getAI();
    const prompt = `Perform a high-precision financial analysis of the Indian stock "${symbol}". 
    Focus on providing DETAILED positive growth drivers (Pros) and specific risk factors (Cons). 
    Generate a comprehensive professional narrative about its recent price action and valuation.
    Include:
    1. A risk level (Low, Medium, or High).
    2. A technical scorecard (0-100) for Quality, Valuation, and Momentum.
    3. A list of 3-4 main sector competitors in India (Peers).
    4. Simulated order book data for NSE.
    Format the response strictly as JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            symbol: { type: Type.STRING },
            companyName: { type: Type.STRING },
            currentPrice: { type: Type.STRING },
            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
            cons: { type: Type.ARRAY, items: { type: Type.STRING } },
            detailedAnalysis: { type: Type.STRING },
            riskScore: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
            technicalScorecard: {
              type: Type.OBJECT,
              properties: {
                quality: { type: Type.NUMBER },
                valuation: { type: Type.NUMBER },
                momentum: { type: Type.NUMBER },
              },
              required: ["quality", "valuation", "momentum"],
            },
            peers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  symbol: { type: Type.STRING },
                  companyName: { type: Type.STRING },
                  price: { type: Type.STRING },
                  marketCap: { type: Type.STRING },
                },
                required: ["symbol", "companyName", "price", "marketCap"],
              }
            },
            prediction: {
              type: Type.OBJECT,
              properties: {
                targetPrice: { type: Type.STRING },
                expectedReturn: { type: Type.STRING },
                timeframe: { type: Type.STRING },
                confidence: { type: Type.STRING },
              },
              required: ["targetPrice", "expectedReturn", "timeframe", "confidence"],
            },
            orderBookInsight: {
              type: Type.OBJECT,
              properties: {
                buyDepth: { type: Type.NUMBER },
                sellDepth: { type: Type.NUMBER },
                sentiment: { type: Type.STRING, enum: ['Bullish', 'Bearish', 'Neutral'] },
                reasoning: { type: Type.STRING },
              },
              required: ["buyDepth", "sellDepth", "sentiment", "reasoning"],
            },
            priceHistory: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                },
                required: ["date", "price"],
              }
            }
          },
          required: ["symbol", "companyName", "currentPrice", "pros", "cons", "detailedAnalysis", "riskScore", "technicalScorecard", "peers", "prediction", "orderBookInsight", "priceHistory"]
        },
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Market Source',
      uri: chunk.web?.uri || '#'
    })) || [];

    return { ...JSON.parse(response.text), sources };
  });
};

export const getMarketSummary = async (): Promise<MarketSummary> => {
  const cacheKey = 'market_summary';
  const cached = getCachedData<MarketSummary>(cacheKey);
  if (cached) return cached;

  const result = await withRetry(async () => {
    const ai = getAI();
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize Indian Stock Market activity for ${today} in JSON.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            overview: { type: Type.STRING },
            indices: {
              type: Type.OBJECT,
              properties: {
                nifty50: { type: Type.STRING },
                sensex: { type: Type.STRING },
                niftyBank: { type: Type.STRING },
              },
              required: ["nifty50", "sensex", "niftyBank"],
            },
            topStories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { title: { type: Type.STRING }, description: { type: Type.STRING } },
                required: ["title", "description"],
              }
            },
            sectoralPerformance: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { sector: { type: Type.STRING }, status: { type: Type.STRING }, impact: { type: Type.STRING } },
                required: ["sector", "status", "impact"],
              }
            },
            globalCues: { type: Type.STRING },
          },
          required: ["headline", "overview", "indices", "topStories", "sectoralPerformance", "globalCues"]
        },
      },
    });
    return JSON.parse(response.text);
  });
  setCachedData(cacheKey, result);
  return result;
};

export const getRealtimeNews = async (): Promise<MarketNewsItem[]> => {
  const cacheKey = 'market_news';
  const cached = getCachedData<MarketNewsItem[]>(cacheKey);
  if (cached) return cached;

  const result = await withRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `List 5 most impactful news events currently affecting the Indian stock market in JSON.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              impact: { type: Type.STRING, enum: ['Bullish', 'Bearish', 'Neutral'] },
              impactReason: { type: Type.STRING },
              timestamp: { type: Type.STRING },
            },
            required: ["title", "summary", "impact", "impactReason", "timestamp"],
          }
        },
      },
    });
    return JSON.parse(response.text);
  });
  setCachedData(cacheKey, result);
  return result;
};

export const getIntradayRecommendations = async (query?: string): Promise<IntradayRecommendation[]> => {
  return await withRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Top 5 intraday momentum picks for the Indian market ${query || ''} in JSON.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              symbol: { type: Type.STRING },
              companyName: { type: Type.STRING },
              bias: { type: Type.STRING, enum: ['Bullish', 'Bearish'] },
              currentPrice: { type: Type.STRING },
              entryPrice: { type: Type.STRING },
              targetPrice: { type: Type.STRING },
              stopLoss: { type: Type.STRING },
              expectedProfit: { type: Type.STRING },
              movementReason: { type: Type.STRING },
              strongReason: { type: Type.STRING },
              volatility: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
              lastUpdated: { type: Type.STRING },
            },
            required: ["symbol", "companyName", "bias", "currentPrice", "entryPrice", "targetPrice", "stopLoss", "expectedProfit", "movementReason", "strongReason", "volatility", "lastUpdated"],
          }
        },
      },
    });
    return JSON.parse(response.text);
  });
};

export const getRecentOrders = async (query?: string, timeRange: string = "7 Days"): Promise<CompanyOrder[]> => {
  return await withRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Major corporate orders for Indian companies in the last ${timeRange} ${query || ''} in JSON.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              symbol: { type: Type.STRING },
              companyName: { type: Type.STRING },
              worth: { type: Type.STRING },
              client: { type: Type.STRING },
              period: { type: Type.STRING },
              description: { type: Type.STRING },
              announcedDate: { type: Type.STRING },
            },
            required: ["symbol", "companyName", "worth", "client", "period", "description", "announcedDate"],
          }
        },
      },
    });
    return JSON.parse(response.text);
  });
};

export const getIPOData = async (): Promise<IPOInfo[]> => {
  return await withRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Active and upcoming Indian IPOs with GMP in JSON.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              companyName: { type: Type.STRING },
              priceBand: { type: Type.STRING },
              lotSize: { type: Type.STRING },
              gmp: { type: Type.STRING },
              gmpPercentage: { type: Type.STRING },
              anchorBook: { type: Type.STRING },
              verdict: { type: Type.STRING, enum: ['Apply', 'Avoid', 'Neutral'] },
              reasoning: { type: Type.STRING },
              openDate: { type: Type.STRING },
              closeDate: { type: Type.STRING },
              status: { type: Type.STRING, enum: ['Open', 'Upcoming', 'Closed'] },
            },
            required: ["companyName", "priceBand", "lotSize", "gmp", "gmpPercentage", "anchorBook", "verdict", "reasoning", "openDate", "closeDate", "status"],
          }
        },
      },
    });
    return JSON.parse(response.text);
  });
};

export const editImage = async (base64Data: string, mimeType: string, prompt: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ inlineData: { data: base64Data, mimeType: mimeType } }, { text: prompt }],
    },
  });
  const part = response.candidates[0].content.parts.find(p => p.inlineData);
  if (part?.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
  throw new Error("No image returned");
};

export const getScreenerResults = async (filter: string): Promise<ScreenerStock[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `List 5 Indian stocks matching filter: "${filter}" in JSON.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            symbol: { type: Type.STRING },
            companyName: { type: Type.STRING },
            price: { type: Type.STRING },
            change: { type: Type.STRING },
            marketCap: { type: Type.STRING },
            peRatio: { type: Type.STRING },
            sector: { type: Type.STRING },
          },
          required: ["symbol", "companyName", "price", "change", "marketCap", "peRatio", "sector"],
        }
      },
    },
  });
  return JSON.parse(response.text);
};
