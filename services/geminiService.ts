import { GoogleGenAI } from "@google/genai";
import { InflationDataPoint, CommodityItem } from "../types";

// Initialize Gemini
// Note: In a production app, these calls should go through a backend to protect the API key.
// For this frontend-only demo, we use the env variable directly.
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeEconomy = async (
  inflationData: InflationDataPoint[],
  commodities: CommodityItem[],
  selectedModel: string
): Promise<string> => {
  if (!apiKey) return "API Key not configured. Please set a valid API Key to receive AI insights.";

  const recentInflation = inflationData.slice(-5).map(d => `${d.date}: ${d.value}%`).join(', ');
  const commoditySummary = commodities.map(c => `${c.name} is ₦${c.currentPrice}`).join(', ');

  const prompt = `
    You are a Senior Economist specializing in the Nigerian economy. 
    Analyze the following data for a dashboard user:
    
    Recent Inflation Trend: [${recentInflation}]
    Key Commodity Prices: [${commoditySummary}]
    Forecasting Model Used: ${selectedModel}

    Please provide a concise, 3-paragraph executive summary:
    1. **Current Status**: Interpret the latest inflation numbers. Is it accelerating or decelerating? Mention key drivers (e.g., currency devaluation, fuel subsidy).
    2. **Impact Analysis**: How does the price of rice/fuel affect the average Nigerian household's purchasing power right now?
    3. **Short-term Outlook**: Based on the trend, what should consumers expect in the next 3 months?

    Keep the tone professional yet accessible. Use markdown for bolding key terms.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Analysis currently unavailable.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Unable to generate analysis at this time due to network or API restrictions.";
  }
};

export const getCostOfLivingTips = async (salary: number, location: string): Promise<string> => {
    if (!apiKey) return "API Key missing.";
    
    const prompt = `
      User Profile: Lives in ${location}, Nigeria. Monthly Salary: ₦${salary}.
      Current economic context: High inflation (~33%), high fuel costs.
      
      Provide 4 specific, actionable, and culturally relevant money-saving tips for this user. 
      Focus on food substitution, transport hacks, and energy conservation relevant to Nigeria.
      Format as a bulleted list.
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text || "Tips unavailable.";
    } catch (error) {
      console.error(error);
      return "Could not retrieve tips.";
    }
  };

export const getLatestMarketData = async (): Promise<{ inflation?: number, commodities?: Record<string, number> }> => {
  if (!apiKey) {
    console.warn("API Key missing for live data fetch");
    return {};
  }

  const prompt = `
    Perform a Google Search to find the very latest available data for Nigeria (current year) for:
    1. Nigeria Headline Inflation Rate (NBS year-on-year % change).
    2. Current market price of a 50kg bag of foreign rice in Nigeria (Lagos/General market).
    3. Current pump price of Petrol (PMS) per liter in Nigeria.
    4. Current price of 12.5kg Cooking Gas cylinder.

    Extract the numeric values representing the current price or rate.
    
    Return the data in this specific text format:
    INFLATION: <value>%
    RICE: <value>
    PETROL: <value>
    GAS: <value>
    
    Example format (do not use these numbers, find real ones):
    INFLATION: 33.20%
    RICE: 95000
    PETROL: 1050
    GAS: 16000
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text || "";
    
    // Simple parsing logic to extract numbers from the formatted response
    const inflationMatch = text.match(/INFLATION:\s*([\d.]+)/i);
    const riceMatch = text.match(/RICE:\s*([\d,.]+)/i);
    const petrolMatch = text.match(/PETROL:\s*([\d,.]+)/i);
    const gasMatch = text.match(/GAS:\s*([\d,.]+)/i);

    const parsePrice = (str: string) => {
      // Remove commas and parse
      return parseFloat(str.replace(/,/g, ''));
    };

    return {
      inflation: inflationMatch ? parseFloat(inflationMatch[1]) : undefined,
      commodities: {
        'Rice (Foreign, 50kg)': riceMatch ? parsePrice(riceMatch[1]) : 0,
        'Petrol (PMS)': petrolMatch ? parsePrice(petrolMatch[1]) : 0,
        'Cooking Gas (12.5kg)': gasMatch ? parsePrice(gasMatch[1]) : 0,
      }
    };

  } catch (error) {
    console.error("Failed to fetch live data via Gemini:", error);
    return {};
  }
};
