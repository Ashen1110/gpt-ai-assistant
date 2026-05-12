/**
 * 定義所有可用的工具 (Function Calling)
 */

import config from '../config/index.js';

export const TOOL_GOOGLE_SEARCH = 'google_search';
export const TOOL_GET_WEATHER = 'get_weather';

/**
 * 取得當前日期字串
 */
const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
};

/**
 * 工具定義 - 符合 OpenAI Function Calling 格式
 */
const allTools = [
  {
    type: 'function',
    function: {
      name: TOOL_GOOGLE_SEARCH,
      description: `在 Google 搜尋資訊。當需要最新資訊、事實查證、新聞、網路搜尋時使用。注意：今天是 ${getCurrentDate()}，請根據搜尋結果判斷資訊的時效性。`,
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: '要搜尋的關鍵字或問題',
          },
        },
        required: ['query'],
      },
    },
    requiresApiKey: 'SERPAPI_API_KEY',
  },
  {
    type: 'function',
    function: {
      name: TOOL_GET_WEATHER,
      description: `查詢指定城市的即時天氣及未來 3 天預報。包含溫度、濕度、天氣狀況、降雨機率等。使用 Open-Meteo API，無需 API Key。今天是 ${getCurrentDate()}。`,
      parameters: {
        type: 'object',
        properties: {
          city: {
            type: 'string',
            description: '要查詢天氣的城市名稱，例如：Taipei, Tokyo, New York, Hong Kong',
          },
          units: {
            type: 'string',
            enum: ['metric', 'imperial'],
            description: '溫度單位。metric 為攝氏度，imperial 為華氏度。預設為 metric。',
          },
        },
        required: ['city'],
      },
    },
  },
];

// 根據 API Key 的可用性過濾工具
export const tools = allTools.filter(tool => {
  if (tool.requiresApiKey) {
    return config[tool.requiresApiKey] !== null && config[tool.requiresApiKey] !== undefined;
  }
  return true;
}).map(({ requiresApiKey, ...tool }) => tool);

export default tools;
