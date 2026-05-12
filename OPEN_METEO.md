# Open-Meteo 天氣 API 整合說明

## ✅ 已完成！

你的 GPT AI Assistant 現在使用 **Open-Meteo** 來提供天氣資訊。

## 🎉 優點

- ✅ **完全免費** - 無使用限制
- ✅ **無需 API Key** - 不用註冊，立即可用
- ✅ **全球支援** - 支援世界各地城市
- ✅ **7 天預報** - 提供未來一週天氣預測
- ✅ **詳細資訊** - 溫度、濕度、降雨機率、風速等

## 🚀 如何使用

### 必要設定

在 `.env` 檔案中只需要：

```bash
# 啟用 Function Calling（必須！）
OPENAI_ENABLE_FUNCTION_CALLING=true

# OpenAI API Key（必須！）
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 環境（建議）
NODE_ENV=production
```

**注意：不再需要 `WEATHER_API_KEY`！**

### 支援的查詢

AI 現在可以回答：

- ✅ "香港這禮拜的天氣如何？"
- ✅ "台北今天會下雨嗎？"
- ✅ "東京未來三天的氣溫？"
- ✅ "紐約這週末天氣怎麼樣？"
- ✅ "我們星期四到星期日會在香港，需要帶傘嗎？"

## 📊 回傳資料

Open-Meteo 提供：

### 當前天氣
- 溫度（攝氏/華氏）
- 體感溫度
- 濕度
- 天氣描述（晴天、多雲、雨天等）
- 風速

### 7 天預報
- 每日最高/最低溫度
- 天氣狀況
- 降雨機率
- 日期

## 🌍 支援城市

內建常用城市快速查詢：
- 台北、香港、東京、首爾、上海、北京、新加坡
- 紐約、洛杉磯、舊金山、倫敦、巴黎
- 雪梨
- ...以及全球其他城市（自動查詢）

## 🔧 技術細節

### 使用的 API

1. **Geocoding API**
   - 網址: `https://geocoding-api.open-meteo.com/v1`
   - 用途: 將城市名稱轉換為經緯度

2. **Weather Forecast API**
   - 網址: `https://api.open-meteo.com/v1`
   - 用途: 查詢天氣資料

### 修改的檔案

- ✅ [services/weather.js](services/weather.js) - 改用 Open-Meteo API
- ✅ [utils/execute-tools.js](utils/execute-tools.js) - 更新回傳格式，包含 7 天預報
- ✅ [utils/tools.js](utils/tools.js) - 更新工具描述
- ✅ [config/index.js](config/index.js) - 移除 WEATHER_API_KEY
- ✅ [.env.example](.env.example) - 移除 WEATHER_API_KEY

## 📝 範例對話

**用戶：** "香港這禮拜的天氣如何？我們星期四晚上~星期日傍晚會到香港，想問溫度、濕度以及是否會下雨？"

**AI 會：**
1. 自動調用 `get_weather` 工具
2. 查詢香港未來 7 天天氣
3. 分析星期四到星期日的天氣狀況
4. 回答溫度、濕度、降雨機率

**AI 回應範例：**
> 香港這週的天氣預報：
> 
> **星期四：** 多雲，26-30°C，濕度 75%，降雨機率 20%
> **星期五：** 部分多雲，27-31°C，濕度 70%，降雨機率 15%
> **星期六：** 晴天，28-32°C，濕度 65%，降雨機率 10%
> **星期日：** 大致晴朗，27-31°C，濕度 68%，降雨機率 25%
> 
> 建議攜帶輕便雨具以備不時之需，整體來說天氣相當適合旅遊！

## ⚡ 立即測試

重新啟動服務後，嘗試問：

```
香港這禮拜天氣如何？
```

你應該會看到詳細的 7 天天氣預報！

## 📚 更多資訊

- Open-Meteo 官網: https://open-meteo.com/
- Open-Meteo API 文件: https://open-meteo.com/en/docs
- GitHub: https://github.com/open-meteo/open-meteo
