# Havdepth - Cumulative Depth Chart

A real-time cumulative depth chart visualizer powered by the [Havklo SDK](https://github.com/hitakshiA/Havklo_sdk). See market liquidity at a glance with mountain-style depth visualization.

## What This Demonstrates

I built Havdepth to showcase the **Havklo SDK's** ability to maintain deep orderbook state for visualization. The app tracks 50 price levels and renders a cumulative depth chart showing buy/sell walls.

**Key SDK features demonstrated:**
- **Deep orderbook tracking** - 50 levels of depth for comprehensive liquidity view
- **Multi-symbol support** - Switch between 5 trading pairs seamlessly
- **Real-time canvas rendering** - Smooth updates powered by SDK's efficient data structure
- **Cumulative volume calculation** - Stack orders to visualize total depth at each price

## Features

- Cumulative depth chart with gradient fills
- Mountain-style visualization (bids left, asks right)
- Mid-price indicator line
- Top 10 bid/ask tables with cumulative totals
- Multi-symbol selector (BTC, ETH, SOL, XRP, ADA)
- Real-time stats: mid price, spread, total depth
- Dark theme optimized for trading

## Quick Start

```bash
# Clone the repository
git clone https://github.com/hitakshiA/havdepth.git
cd havdepth

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

## How It Works

The app uses canvas to render cumulative depth from orderbook data:

```javascript
import initWasm, { WasmOrderbook } from './wasm/kraken_wasm.js'

await initWasm()

// Create orderbook with 50 levels
const book = WasmOrderbook.with_depth('BTC/USD', 50)
book.set_precision(1, 8)

// Get full depth in one call
const result = book.apply_and_get(message, 50)

// Calculate cumulative volumes for chart
let cumVolume = 0
result.bids.forEach(bid => {
  cumVolume += bid.qty
  cumBids.push({ price: bid.price, volume: cumVolume })
})

// Render to canvas...
```

## Understanding Depth Charts

| Feature | Meaning |
|---------|---------|
| Green area | Cumulative bid (buy) volume |
| Red area | Cumulative ask (sell) volume |
| Yellow line | Current mid-price |
| Steep walls | Strong support/resistance |
| Thin areas | Low liquidity zones |

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool with WASM support
- **Canvas API** - Depth chart rendering
- **Havklo SDK (WASM)** - Kraken orderbook engine
- **Kraken WebSocket v2** - Real-time market data

## About

Built by **Hitakshi Arora** for the Kraken Forge Hackathon.

Part of the Havklo SDK example applications demonstrating real-time Kraken market data integration.

## License

MIT
