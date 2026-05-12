/**
 * 定義所有可用的工具 (Function Calling)
 */

export const TOOL_GOOGLE_SEARCH = 'google_search';
export const TOOL_GET_WEATHER = 'get_weather';

/**
 * 工具定義 - 符合 OpenAI Function Calling 格式
 */
export const tools = [
  {
    type: 'function',
    function: {
      name: TOOL_GOOGLE_SEARCH,
      description: '在 Google 搜尋資訊。當需要最新資訊、事實查證、新聞、網路搜尋時使用。',
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
  },
  {
    type: 'function',
    function: {
      name: TOOL_GET_WEATHER,
      description: '查詢指定城市的即時天氣及未來 7 天預報。包含溫度、濕度、天氣狀況、降雨機率等。使用 Open-Meteo API，無需 API Key。',
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

export default tools;
