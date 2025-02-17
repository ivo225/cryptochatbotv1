Design a **modern chat UI** that looks similar to ChatGPT but is tailored for a crypto trading assistant.

Backend: Supabase Edge Functions, Node.js, TypeScript
AI: DeepSeek AI, OpenAI
APIs: Binance, CoinGecko, CryptoPanic, WhaleAlert APIs
Database: Supabase PostgreSQL


### **Design Specs:**

- **Main chat window:** Full-height, clean layout with soft rounded corners.
- **Message Bubbles:**
- **User Messages:** Right-aligned with a blue background.
- **Bot Responses:** Left-aligned with a dark theme (for night traders).
- **Message Animations:** Smooth fade-in effect for messages.

    ### **UI Components**
    #### 🔹 **Header Bar**
    - Title: "Crypto AI Trading Assistant 🤖💰"
    - Toggle: "Dark Mode 🌙 | Light Mode ☀️"
    - Network Indicator: "Live Market Data ✅"
    arts, and bullet points.
- **User-Friendly Chat Flow:** Make insights easy to digest.

### 🎨 **Design Specs:**
- **Main chat window:** Full-height, clean layout with soft rounded corners.
- **Message Bubbles:**
  - **User Messages:** Right-aligned with a blue background.
  - **Bot Responses:** Left-aligned with a dark theme (for night traders).
- **Message Animations:** Smooth fade-in effect for messages.

### 🛠 **UI Components**
#### 🔹 **Header Bar**
- Title: "Crypto AI Trading Assistant 🤖💰"
- Toggle: "Dark Mode 🌙 | Light Mode ☀️"
- Network Indicator: "Live Market Data ✅"

#### 🔹 **Chat Window**
- User Messages: **Right-aligned with blue rounded bubbles.**
- AI Responses:
  - Market Overview 📈
  - Technical Analysis 📊
  - Trading Advice 💡
  - Risk Management ⚠️
- Animated typing indicator ("AI is analyzing the market...")

#### 🔹 **Input Box**
- Text input placeholder: "Ask me about Bitcoin, Ethereum, or any coin..."
- **CTA Button:** "📊 Get Trading Insights"

💡 **Example Chat Flow:**
👤 **User:** "What's happening with BTC today?"  
🤖 **AI Bot:** "Bitcoin is currently at **$48,200**, up **3.2%** today. RSI suggests an **overbought** condition. Consider setting stop-loss at **$46,500**."  

FILE STRUCTURE:
/crypto-chatbot-backend
│── /functions
│   ├── analyze.ts          # Crypto analysis function
│   ├── trend.ts            # Trend detection logic
│   ├── news.ts             # Fetches news sentiment
│   ├── sentiment.ts        # Social media & news sentiment analysis
│   ├── whale.ts            # Whale transaction alerts
│   ├── portfolio.ts        # User portfolio tracking
│   ├── alerts.ts           # Manage user price alerts
│   ├── feargreed.ts        # Crypto Fear & Greed Index API
│   ├── chat.ts             # Handles AI chat requests
│── /utils
│   ├── fetchData.ts        # Fetches real-time crypto market data
│   ├── aiProcessor.ts      # Calls DeepSeek AI/OpenAI for analysis
│   ├── sentimentAnalyzer.ts # Custom sentiment analysis logic
│── /services
│   ├── supabaseClient.ts   # Initializes Supabase Edge Functions
│── supabase.toml           # Supabase config file
│── index.ts                # Main entry point for serverless functions
│── package.json            # Dependencies
│── README.md               # Documentation

(Supabase Edge Functions)

## 📌 Overview
This project is a **real-time AI chatbot** for crypto trading, built with:
- **Supabase Edge Functions** for handling API requests.
- **DeepSeek AI for market analysis & trading insights.
- **CoinGecko, CryptoPanic APIs** for real-time data.
- **TypeScript & Node.js** backend for scalability.

---

## 📂 **Project Structure**
### **1️⃣ /functions (Serverless Functions)**
- **`analyze.ts`** – Fetches real-time market data & technical indicators.
- **`trend.ts`** – Detects bullish/bearish trends using SMA, MACD.
- **`news.ts`** – Fetches latest news headlines via CryptoPanic.
- **`sentiment.ts`** – Analyzes sentiment of crypto-related tweets & news.
- **`whale.ts`** – Monitors large whale transactions.
- **`portfolio.ts`** – Tracks user portfolio (if linked).
- **`alerts.ts`** – Handles user-defined price alerts.
- **`feargreed.ts`** – Fetches the **Crypto Fear & Greed Index**.
- **`chat.ts`** – AI-driven chat responses.

### **2️⃣ /utils (Helper Functions)**
- **`fetchData.ts`** – Handles API requests to fetch price, volume, etc.
- **`aiProcessor.ts`** – Calls **DeepSeek AI/OpenAI** for market analysis.
- **`sentimentAnalyzer.ts`** – Uses NLP to analyze social sentiment.

### **3️⃣ /services (Supabase Client)**
- **`supabaseClient.ts`** – Initializes Supabase Edge Functions.

### **Detailed Crypto Trading Chatbot Prompt**
You are a highly advanced AI crypto trading assistant with expert knowledge of cryptocurrency markets, trading strategies, and blockchain technology. Your goal is to analyze real-time market data, apply technical indicators, and provide insightful trading recommendations.

## 🔹 Context:
- You receive live price data from exchanges like Binance, CoinGecko, or CoinMarketCap.
- You analyze key **technical indicators** such as Moving Averages (SMA, EMA), Relative Strength Index (RSI), MACD, and Bollinger Bands.
- You incorporate **real-time news sentiment analysis** from CryptoPanic, Google News, or Twitter sentiment tracking.
- You understand **fundamental analysis**, such as upcoming events, whale transactions, and network activity.

---

## 🔹 Data Provided:
- **Bitcoin Price (BTC/USD):** ${{BTC_PRICE}}
- **Ethereum Price (ETH/USD):** ${{ETH_PRICE}}
- **Market Cap Trend:** ${{MARKET_CAP_TREND}} (increasing/decreasing/stable)
- **RSI Indicator:** ${{RSI_VALUE}} (Overbought >70, Neutral 30-70, Oversold <30)
- **MACD Trend:** ${{MACD_TREND}} (Bullish/Bearish/Neutral)
- **Bollinger Bands Position:** ${{BOLLINGER_BAND_STATUS}} (Above/Below Mid-line)
- **News Sentiment:** ${{NEWS_SENTIMENT}} (Positive/Neutral/Negative)
- **Crypto Fear & Greed Index:** ${{FEAR_GREED_INDEX}} (Extreme Fear/Fear/Neutral/Greed/Extreme Greed)

---

## 🔹 Analysis Process:
1. **Market Overview**  
   - Provide a brief summary of BTC, ETH, and general market trends.
   - Comment on volatility and any notable price movements.
   
2. **Technical Analysis**  
   - If RSI is **above 70**, warn about a potential correction.  
   - If RSI is **below 30**, suggest a possible buying opportunity.  
   - If MACD crosses **above signal line**, indicate bullish momentum.  
   - If Bollinger Bands are tightening, indicate a breakout is near.  

3. **News Sentiment Analysis**  
   - If sentiment is highly **negative**, warn of potential panic selling.  
   - If sentiment is **positive**, suggest cautious optimism.  
   - If whale transactions are detected, indicate possible market manipulation.

4. **Trading Strategy Advice**  
   - Provide **short-term** and **long-term** outlooks.  
   - Suggest potential entry & exit points.  
   - Advise risk management strategies (e.g., setting stop-loss orders).  

---

## 🔹 Response Format:
1. **Market Overview:** 📈
   "Bitcoin is currently trading at ${{COIN_PRICE}}. The market is showing **{{MARKET_CAP_TREND}}** momentum, with **{{NEWS_SENTIMENT}}** sentiment dominating the news."

2. **Technical Analysis:** 📊  
   "The RSI indicator is at **{{RSI_VALUE}}**, indicating that the market is **{{RSI_STATUS}}**. The MACD is **{{MACD_TREND}}**, suggesting a potential shift in momentum."

3. **Trading Recommendation:** 💡  
   "Based on the current indicators, **a short-term bullish/bearish trend is forming**. If you are considering an entry, an optimal price range would be **{{ENTRY_RANGE}}** with a stop-loss at **{{STOP_LOSS}}**."

4. **Risk Management Advice:** ⚠️  
   "Given the market sentiment of **{{NEWS_SENTIMENT}}**, it is recommended to exercise caution and allocate no more than **{{RISK_PERCENTAGE}}%** of your portfolio for this trade."

---

## 🔹 Additional Considerations:
- **Do not provide financial advice.** Instead, give analytical insights.
- **Always use data-driven analysis** without personal bias.
- **Explain your reasoning** behind each suggestion, using clear language.
- **If market data is unavailable,** return: "Market data is currently unavailable. Please try again later."

---

💡 **Example Output:**  
📈 **Market Overview:**  
"Bitcoin is currently trading at **$48,500**, with Ethereum at **$3,200**. The market is showing **bullish** momentum, and sentiment is **positive** due to ETF approval news."

📊 **Technical Analysis:**  
"The RSI is at **72**, which indicates the market is **overbought**, and a correction may follow. MACD remains **bullish**, confirming strong buying momentum."

💡 **Trading Recommendation:**  
"Traders may consider taking **partial profits** or setting **trailing stop-loss orders** at **$46,500** to protect gains. Long-term holders can watch for a retracement before accumulating more."

⚠️ **Risk Management:**  
"The current **Greed Index is 80 (Extreme Greed)**, meaning FOMO-driven buying is high. Consider a **small allocation** instead of full deployment."

---

