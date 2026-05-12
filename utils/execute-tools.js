import config from '../config/index.js';
import { search } from '../services/serpapi.js';
import { getWeather } from '../services/weather.js';
import { TOOL_GOOGLE_SEARCH, TOOL_GET_WEATHER } from './tools.js';

/**
 * 執行工具調用
 * @param {string} toolName - 工具名稱
 * @param {Object} args - 工具參數
 * @returns {Promise<string>} 工具執行結果
 */
export const executeToolCall = async (toolName, args) => {
  try {
    switch (toolName) {
      case TOOL_GOOGLE_SEARCH: {
        if (!config.SERPAPI_API_KEY) {
          return JSON.stringify({ error: '未設定 SERPAPI_API_KEY' });
        }
        const { query } = args;
        const res = await search({ q: query });
        const { answer_box: answerBox, knowledge_graph: knowledgeGraph, organic_results: organicResults } = res.data;
        
        let answer = '';
        if (organicResults && organicResults[0]) {
          answer += organicResults[0].snippet || '';
        }
        if (answerBox?.answer) answer += ` ${answerBox.answer}`;
        if (answerBox?.result) answer += ` ${answerBox.result}`;
        if (answerBox?.snippet) answer += ` ${answerBox.snippet}`;
        if (knowledgeGraph?.description) {
          answer += ` ${knowledgeGraph.title} - ${knowledgeGraph.description}`;
        }
        
        return JSON.stringify({
          query,
          answer: answer.trim() || '未找到相關資訊',
          source: 'Google Search',
        });
      }

      case TOOL_GET_WEATHER: {
        if (!config.WEATHER_API_KEY) {
          return JSON.stringify({ error: '未設定 WEATHER_API_KEY' });
        }
        const { city, units = 'metric' } = args;
        const res = await getWeather({ city, units });
        const { data } = res;
        
        const tempUnit = units === 'metric' ? '°C' : '°F';
        const result = {
          city: data.name,
          country: data.sys.country,
          temperature: `${Math.round(data.main.temp)}${tempUnit}`,
          feels_like: `${Math.round(data.main.feels_like)}${tempUnit}`,
          humidity: `${data.main.humidity}%`,
          description: data.weather[0].description,
          wind_speed: `${data.wind.speed} m/s`,
        };
        
        return JSON.stringify(result);
      }

      default:
        return JSON.stringify({ error: `未知的工具: ${toolName}` });
    }
  } catch (error) {
    return JSON.stringify({ 
      error: error.message || '工具執行失敗',
      tool: toolName,
    });
  }
};

export default executeToolCall;
