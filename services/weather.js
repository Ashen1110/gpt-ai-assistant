import axios from 'axios';
import config from '../config/index.js';
import { handleFulfilled, handleRejected, handleRequest } from './utils/index.js';

const client = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  timeout: config.WEATHER_TIMEOUT,
  headers: {
    'Accept-Encoding': 'gzip, deflate, compress',
  },
});

client.interceptors.request.use((c) => {
  c.params = {
    appid: config.WEATHER_API_KEY,
    ...c.params,
  };
  return handleRequest(c);
});

client.interceptors.response.use(handleFulfilled, (err) => {
  if (err.response?.data?.message) {
    err.message = err.response.data.message;
  }
  return handleRejected(err);
});

/**
 * 查詢城市天氣
 * @param {Object} params
 * @param {string} params.city - 城市名稱
 * @param {string} params.units - 單位 (metric/imperial)
 * @returns {Promise}
 */
const getWeather = ({
  city,
  units = 'metric',
}) => client.get('/weather', {
  params: {
    q: city,
    units,
    lang: 'zh_tw',
  },
});

export {
  getWeather,
};

export default null;
