import axios from 'axios';
import config from '../config/index.js';
import { handleFulfilled, handleRejected, handleRequest } from './utils/index.js';

// 主要城市的經緯度對照表
const CITY_COORDINATES = {
  'taipei': { lat: 25.0330, lon: 121.5654, name: '台北' },
  'hong kong': { lat: 22.3193, lon: 114.1694, name: '香港' },
  'tokyo': { lat: 35.6762, lon: 139.6503, name: '東京' },
  'new york': { lat: 40.7128, lon: -74.0060, name: '紐約' },
  'london': { lat: 51.5074, lon: -0.1278, name: '倫敦' },
  'paris': { lat: 48.8566, lon: 2.3522, name: '巴黎' },
  'singapore': { lat: 1.3521, lon: 103.8198, name: '新加坡' },
  'seoul': { lat: 37.5665, lon: 126.9780, name: '首爾' },
  'shanghai': { lat: 31.2304, lon: 121.4737, name: '上海' },
  'beijing': { lat: 39.9042, lon: 116.4074, name: '北京' },
  'sydney': { lat: -33.8688, lon: 151.2093, name: '雪梨' },
  'los angeles': { lat: 34.0522, lon: -118.2437, name: '洛杉磯' },
  'san francisco': { lat: 37.7749, lon: -122.4194, name: '舊金山' },
};

// Geocoding API client
const geocodingClient = axios.create({
  baseURL: 'https://geocoding-api.open-meteo.com/v1',
  timeout: config.WEATHER_TIMEOUT,
  headers: {
    'Accept-Encoding': 'gzip, deflate, compress',
  },
});

// Weather API client
const weatherClient = axios.create({
  baseURL: 'https://api.open-meteo.com/v1',
  timeout: config.WEATHER_TIMEOUT,
  headers: {
    'Accept-Encoding': 'gzip, deflate, compress',
  },
});

geocodingClient.interceptors.request.use(handleRequest);
geocodingClient.interceptors.response.use(handleFulfilled, handleRejected);

weatherClient.interceptors.request.use(handleRequest);
weatherClient.interceptors.response.use(handleFulfilled, handleRejected);

/**
 * 取得城市經緯度
 * @param {string} city - 城市名稱
 * @returns {Promise<{lat: number, lon: number, name: string}>}
 */
const getCityCoordinates = async (city) => {
  const cityLower = city.toLowerCase();
  
  // 先檢查預設城市列表
  if (CITY_COORDINATES[cityLower]) {
    return CITY_COORDINATES[cityLower];
  }
  
  // 使用 Geocoding API 查詢
  const { data } = await geocodingClient.get('/search', {
    params: {
      name: city,
      count: 1,
      language: 'zh',
      format: 'json',
    },
  });
  
  if (!data.results || data.results.length === 0) {
    throw new Error(`找不到城市: ${city}`);
  }
  
  const result = data.results[0];
  return {
    lat: result.latitude,
    lon: result.longitude,
    name: result.name,
  };
};

/**
 * 天氣代碼對應描述（WMO Weather interpretation codes）
 */
const getWeatherDescription = (code) => {
  const weatherCodes = {
    0: '晴天',
    1: '大致晴朗',
    2: '部分多雲',
    3: '陰天',
    45: '有霧',
    48: '霧凇',
    51: '小毛毛雨',
    53: '中度毛毛雨',
    55: '大毛毛雨',
    61: '小雨',
    63: '中雨',
    65: '大雨',
    71: '小雪',
    73: '中雪',
    75: '大雪',
    77: '米雪',
    80: '小陣雨',
    81: '中陣雨',
    82: '大陣雨',
    85: '小陣雪',
    86: '大陣雪',
    95: '雷暴',
    96: '雷暴伴有小冰雹',
    99: '雷暴伴有大冰雹',
  };
  
  return weatherCodes[code] || '未知';
};

/**
 * 查詢城市天氣
 * @param {Object} params
 * @param {string} params.city - 城市名稱
 * @param {string} params.units - 單位 (metric/imperial)
 * @returns {Promise}
 */
const getWeather = async ({
  city,
  units = 'metric',
}) => {
  // 取得城市經緯度
  const { lat, lon, name } = await getCityCoordinates(city);
  
  // 查詢天氣資料
  const temperatureUnit = units === 'imperial' ? 'fahrenheit' : 'celsius';
  
  const { data } = await weatherClient.get('/forecast', {
    params: {
      latitude: lat,
      longitude: lon,
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
      temperature_unit: temperatureUnit,
      wind_speed_unit: 'ms',
      timezone: 'auto',
      forecast_days: 7,
    },
  });
  
  // 格式化回應以符合原有的介面
  return {
    data: {
      name,
      coord: { lat, lon },
      current: data.current,
      daily: data.daily,
      timezone: data.timezone,
    },
  };
};

export {
  getWeather,
  getWeatherDescription,
};

export default null;
