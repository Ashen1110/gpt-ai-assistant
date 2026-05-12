import config from '../config/index.js';
import { search } from '../services/serpapi.js';
import { getWeather, getWeatherDescription } from '../services/weather.js';
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
        const { city, units = 'metric' } = args;
        const res = await getWeather({ city, units });
        const { data } = res;
        
        const tempUnit = units === 'metric' ? '°C' : '°F';
        
        // 當前天氣
        const current = data.current;
        const weatherCode = current.weather_code;
        const weatherDesc = getWeatherDescription(weatherCode);
        
        // 未來幾天預報
        const dailyForecast = [];
        for (let i = 0; i < Math.min(7, data.daily.time?.length || 0); i++) {
          dailyForecast.push({
            date: data.daily.time[i],
            weather: getWeatherDescription(data.daily.weather_code[i]),
            temp_max: `${Math.round(data.daily.temperature_2m_max[i])}${tempUnit}`,
            temp_min: `${Math.round(data.daily.temperature_2m_min[i])}${tempUnit}`,
            precipitation_probability: `${data.daily.precipitation_probability_max[i]}%`,
          });
        }
        
        const result = {
          city: data.name,
          current_weather: {
            temperature: `${Math.round(current.temperature_2m)}${tempUnit}`,
            feels_like: `${Math.round(current.apparent_temperature)}${tempUnit}`,
            humidity: `${current.relative_humidity_2m}%`,
            description: weatherDesc,
            wind_speed: `${current.wind_speed_10m} m/s`,
          },
          forecast: dailyForecast,
          timezone: data.timezone,
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
