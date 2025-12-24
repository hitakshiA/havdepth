import { useState, useEffect, useRef, useCallback } from 'react'
import initWasm, { WasmOrderbook } from '../wasm/kraken_wasm.js'

const SYMBOLS = ['BTC/USD', 'ETH/USD', 'SOL/USD', 'XRP/USD', 'ADA/USD']
const DEPTH = 100  // Kraken supports: 10, 25, 100, 500, 1000

// Precision settings for checksum calculation
const SYMBOL_PRECISION = {
  'BTC/USD': [1, 8],
  'ETH/USD': [2, 8],
  'SOL/USD': [2, 8],
  'XRP/USD': [5, 8],
  'ADA/USD': [6, 8],
}

export default function App() {
  const [status, setStatus] = useState('Initializing...')
  const [sdkReady, setSdkReady] = useState(false)
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USD')
  const [bids, setBids] = useState([])
  const [asks, setAsks] = useState([])
  const [midPrice, setMidPrice] = useState(null)
  const [spread, setSpread] = useState(null)

  const booksRef = useRef({})
  const wsRef = useRef(null)
  const canvasRef = useRef(null)
  const messageQueueRef = useRef([])
  const processingRef = useRef(false)
  const selectedSymbolRef = useRef(selectedSymbol)

  // Keep ref in sync with state
  useEffect(() => {
    selectedSymbolRef.current = selectedSymbol
  }, [selectedSymbol])

  // Process messages sequentially to avoid WASM borrow conflicts
  const processNextMessage = useCallback(() => {
    if (processingRef.current) return
    if (messageQueueRef.current.length === 0) return

    processingRef.current = true
    const { symbol, data } = messageQueueRef.current.shift()

    try {
      const book = booksRef.current[symbol]
      if (!book) {
        processingRef.current = false
        if (messageQueueRef.current.length > 0) setTimeout(processNextMessage, 0)
        return
      }

      const result = book.apply_and_get(data, DEPTH)

      // Only update UI if this is the currently selected symbol
      if (result && (result.msg_type === 'update' || result.msg_type === 'snapshot')) {
        if (symbol === selectedSymbolRef.current) {
          const topBids = result.bids || []
          const topAsks = result.asks || []

          setBids(topBids)
          setAsks(topAsks)
          setMidPrice(result.mid_price || null)
          setSpread(result.spread || null)
        }
      }
    } catch (e) {
      // Silently ignore errors
    } finally {
      processingRef.current = false
      if (messageQueueRef.current.length > 0) {
        setTimeout(processNextMessage, 0)
      }
    }
  }, [])

  const queueMessage = useCallback((symbol, data) => {
    messageQueueRef.current.push({ symbol, data })
    if (messageQueueRef.current.length > 200) {
      messageQueueRef.current = messageQueueRef.current.slice(-100)
    }
    processNextMessage()
  }, [processNextMessage])

  useEffect(() => {
    let mounted = true

    async function init() {
      console.log('[HAVDEPTH] Initializing Havklo SDK...')
      await initWasm()
      if (!mounted) return

      console.log('[HAVDEPTH] SDK ready')
      setSdkReady(true)

      // Create orderbooks for all symbols with correct precision
      SYMBOLS.forEach(sym => {
        const book = WasmOrderbook.with_depth(sym, DEPTH)
        const [pricePrecision, qtyPrecision] = SYMBOL_PRECISION[sym] || [2, 8]
        book.set_precision(pricePrecision, qtyPrecision)
        booksRef.current[sym] = book
      })

      setStatus('Connecting...')
      const ws = new WebSocket('wss://ws.kraken.com/v2')
      wsRef.current = ws

      ws.onopen = () => {
        if (!mounted) return
        console.log('[HAVDEPTH] WebSocket connected')
        setStatus('Connected')
        ws.send(JSON.stringify({
          method: 'subscribe',
          params: { channel: 'book', symbol: SYMBOLS, depth: DEPTH }
        }))
      }

      ws.onmessage = (event) => {
        if (!mounted) return
        try {
          const msg = JSON.parse(event.data)
          if (msg.channel === 'book' && msg.data?.[0]?.symbol) {
            queueMessage(msg.data[0].symbol, event.data)
          }
        } catch (e) {}
      }

      ws.onclose = () => {
        if (!mounted) return
        setStatus('Disconnected')
      }
      ws.onerror = () => setStatus('Error')
    }

    init()
    return () => {
      mounted = false
      wsRef.current?.close()
      Object.values(booksRef.current).forEach(book => {
        try { book.free() } catch (e) {}
      })
    }
  }, [queueMessage])

  // Handle symbol change
  const handleSymbolChange = (newSymbol) => {
    setSelectedSymbol(newSymbol)
    setBids([])
    setAsks([])
    setMidPrice(null)
    setSpread(null)
  }

  // Helper to get price/qty from SDK objects
  const getPrice = (item) => item.price || item[0] || 0
  const getQty = (item) => item.qty || item[1] || 0

  // Draw depth chart
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || bids.length === 0 || asks.length === 0) return

    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    const padding = 40

    // Clear
    ctx.fillStyle = '#0a0e14'
    ctx.fillRect(0, 0, width, height)

    // Calculate cumulative volumes
    let cumBids = []
    let cumAsks = []
    let cumVol = 0

    for (let i = 0; i < bids.length; i++) {
      cumVol += getQty(bids[i])
      cumBids.push({ price: getPrice(bids[i]), volume: cumVol })
    }

    cumVol = 0
    for (let i = 0; i < asks.length; i++) {
      cumVol += getQty(asks[i])
      cumAsks.push({ price: getPrice(asks[i]), volume: cumVol })
    }

    if (cumBids.length === 0 || cumAsks.length === 0) return

    // Find ranges
    const maxVolume = Math.max(
      cumBids[cumBids.length - 1]?.volume || 0,
      cumAsks[cumAsks.length - 1]?.volume || 0
    )
    const minPrice = cumBids[cumBids.length - 1]?.price || 0
    const maxPrice = cumAsks[cumAsks.length - 1]?.price || 0
    const priceRange = maxPrice - minPrice

    if (priceRange <= 0 || maxVolume <= 0) return

    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Helper functions
    const priceToX = (price) => padding + ((price - minPrice) / priceRange) * chartWidth
    const volumeToY = (vol) => padding + chartHeight - (vol / maxVolume) * chartHeight

    // Draw grid
    ctx.strokeStyle = '#1a1f29'
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i / 5) * chartHeight
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Draw bid area (green)
    ctx.beginPath()
    ctx.moveTo(priceToX(cumBids[0].price), volumeToY(0))
    cumBids.forEach(({ price, volume }) => {
      ctx.lineTo(priceToX(price), volumeToY(volume))
    })
    ctx.lineTo(priceToX(cumBids[cumBids.length - 1].price), volumeToY(0))
    ctx.closePath()

    const bidGradient = ctx.createLinearGradient(0, padding, 0, height - padding)
    bidGradient.addColorStop(0, 'rgba(0, 255, 136, 0.4)')
    bidGradient.addColorStop(1, 'rgba(0, 255, 136, 0.05)')
    ctx.fillStyle = bidGradient
    ctx.fill()

    // Draw bid line
    ctx.beginPath()
    ctx.moveTo(priceToX(cumBids[0].price), volumeToY(cumBids[0].volume))
    cumBids.forEach(({ price, volume }) => {
      ctx.lineTo(priceToX(price), volumeToY(volume))
    })
    ctx.strokeStyle = '#00FF88'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw ask area (red)
    ctx.beginPath()
    ctx.moveTo(priceToX(cumAsks[0].price), volumeToY(0))
    cumAsks.forEach(({ price, volume }) => {
      ctx.lineTo(priceToX(price), volumeToY(volume))
    })
    ctx.lineTo(priceToX(cumAsks[cumAsks.length - 1].price), volumeToY(0))
    ctx.closePath()

    const askGradient = ctx.createLinearGradient(0, padding, 0, height - padding)
    askGradient.addColorStop(0, 'rgba(255, 68, 68, 0.4)')
    askGradient.addColorStop(1, 'rgba(255, 68, 68, 0.05)')
    ctx.fillStyle = askGradient
    ctx.fill()

    // Draw ask line
    ctx.beginPath()
    ctx.moveTo(priceToX(cumAsks[0].price), volumeToY(cumAsks[0].volume))
    cumAsks.forEach(({ price, volume }) => {
      ctx.lineTo(priceToX(price), volumeToY(volume))
    })
    ctx.strokeStyle = '#FF4444'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw mid price line
    if (midPrice) {
      ctx.beginPath()
      ctx.moveTo(priceToX(midPrice), padding)
      ctx.lineTo(priceToX(midPrice), height - padding)
      ctx.strokeStyle = '#FFD700'
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Draw price labels
    ctx.fillStyle = '#666'
    ctx.font = '11px SF Mono'
    ctx.textAlign = 'center'

    const priceStep = priceRange / 5
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + priceStep * i
      ctx.fillText('$' + price.toLocaleString(undefined, { maximumFractionDigits: 0 }), priceToX(price), height - 10)
    }

    // Draw volume labels
    ctx.textAlign = 'right'
    for (let i = 0; i <= 4; i++) {
      const vol = (maxVolume / 4) * (4 - i)
      ctx.fillText(vol.toFixed(2), padding - 5, padding + (i / 4) * chartHeight + 4)
    }

  }, [bids, asks, midPrice])

  const coinSymbol = selectedSymbol.split('/')[0]

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={styles.title}>HAVDEPTH</h1>
          <span style={{
            fontSize: '10px',
            padding: '2px 6px',
            background: sdkReady ? '#00D9FF' : '#666',
            color: '#0a0e14',
            borderRadius: '4px',
            fontWeight: 'bold'
          }}>
            SDK
          </span>
        </div>
        <div style={styles.symbolSelector}>
          {SYMBOLS.map(sym => (
            <button
              key={sym}
              style={{
                ...styles.symbolBtn,
                background: selectedSymbol === sym ? '#00D9FF' : 'transparent',
                color: selectedSymbol === sym ? '#0a0e14' : '#b3b1ad',
              }}
              onClick={() => handleSymbolChange(sym)}
            >
              {sym.split('/')[0]}
            </button>
          ))}
        </div>
        <div style={styles.statusBar}>
          <span style={{
            ...styles.statusDot,
            background: status === 'Connected' ? '#00FF88' : '#FF4444'
          }} />
          <span>{status}</span>
        </div>
      </header>

      <div style={styles.stats}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>MID PRICE</div>
          <div style={{ ...styles.statValue, color: '#FFD700' }}>
            ${midPrice?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '---'}
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>SPREAD</div>
          <div style={{ ...styles.statValue, color: '#00D9FF' }}>
            ${spread?.toFixed(4) || '---'}
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>BID DEPTH</div>
          <div style={{ ...styles.statValue, color: '#00FF88' }}>
            {bids.reduce((s, b) => s + getQty(b), 0).toFixed(4)} {coinSymbol}
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>ASK DEPTH</div>
          <div style={{ ...styles.statValue, color: '#FF4444' }}>
            {asks.reduce((s, a) => s + getQty(a), 0).toFixed(4)} {coinSymbol}
          </div>
        </div>
      </div>

      <div style={styles.chartContainer}>
        <h2 style={styles.sectionTitle}>CUMULATIVE DEPTH — <span style={{ color: '#FFD700' }}>{selectedSymbol}</span></h2>
        <div style={styles.legend}>
          <span style={{ color: '#00FF88' }}>● Bids (Buy Orders)</span>
          <span style={{ color: '#FF4444' }}>● Asks (Sell Orders)</span>
          <span style={{ color: '#FFD700' }}>┊ Mid Price</span>
        </div>
        <canvas
          ref={canvasRef}
          width={900}
          height={400}
          style={styles.canvas}
        />
      </div>

      <div style={styles.levelTables}>
        <div style={styles.levelTable}>
          <h3 style={{ ...styles.tableTitle, color: '#00FF88' }}>TOP BIDS</h3>
          <div style={styles.tableHeader}>
            <span>Price</span>
            <span>Quantity</span>
            <span>Cumulative</span>
          </div>
          {(() => {
            let cum = 0
            return bids.slice(0, 10).map((bid, i) => {
              const price = getPrice(bid)
              const qty = getQty(bid)
              cum += qty
              return (
                <div key={i} style={styles.tableRow}>
                  <span style={{ color: '#FFD700' }}>${price.toLocaleString()}</span>
                  <span>{qty.toFixed(4)}</span>
                  <span style={{ color: '#00FF88' }}>{cum.toFixed(4)}</span>
                </div>
              )
            })
          })()}
        </div>

        <div style={styles.levelTable}>
          <h3 style={{ ...styles.tableTitle, color: '#FF4444' }}>TOP ASKS</h3>
          <div style={styles.tableHeader}>
            <span>Price</span>
            <span>Quantity</span>
            <span>Cumulative</span>
          </div>
          {(() => {
            let cum = 0
            return asks.slice(0, 10).map((ask, i) => {
              const price = getPrice(ask)
              const qty = getQty(ask)
              cum += qty
              return (
                <div key={i} style={styles.tableRow}>
                  <span style={{ color: '#FFD700' }}>${price.toLocaleString()}</span>
                  <span>{qty.toFixed(4)}</span>
                  <span style={{ color: '#FF4444' }}>{cum.toFixed(4)}</span>
                </div>
              )
            })
          })()}
        </div>
      </div>

      <footer style={styles.footer}>
        Powered by <span style={{ color: '#00D9FF' }}>Havklo SDK</span> | Real-time data from Kraken WebSocket v2
      </footer>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0a0e14',
    color: '#b3b1ad',
    fontFamily: "'SF Mono', monospace",
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    borderBottom: '1px solid #2a2e38',
    paddingBottom: '15px',
  },
  title: {
    color: '#00D9FF',
    fontSize: '24px',
    fontWeight: 'bold',
    letterSpacing: '4px',
    margin: 0,
  },
  symbolSelector: {
    display: 'flex',
    gap: '8px',
  },
  symbolBtn: {
    padding: '6px 12px',
    border: '1px solid #2a2e38',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    fontFamily: "'SF Mono', monospace",
    transition: 'all 0.2s',
  },
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '15px',
    marginBottom: '25px',
  },
  statCard: {
    background: '#12171f',
    borderRadius: '8px',
    padding: '15px',
    border: '1px solid #2a2e38',
    textAlign: 'center',
  },
  statLabel: {
    color: '#666',
    fontSize: '10px',
    letterSpacing: '1px',
    marginBottom: '6px',
  },
  statValue: {
    fontSize: '16px',
    fontWeight: 'bold',
  },
  chartContainer: {
    background: '#12171f',
    borderRadius: '8px',
    padding: '20px',
    border: '1px solid #2a2e38',
    marginBottom: '25px',
  },
  sectionTitle: {
    color: '#00D9FF',
    fontSize: '12px',
    letterSpacing: '2px',
    marginBottom: '10px',
    marginTop: 0,
  },
  legend: {
    display: 'flex',
    gap: '20px',
    marginBottom: '15px',
    fontSize: '12px',
  },
  canvas: {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
  levelTables: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '25px',
  },
  levelTable: {
    background: '#12171f',
    borderRadius: '8px',
    padding: '20px',
    border: '1px solid #2a2e38',
  },
  tableTitle: {
    fontSize: '12px',
    letterSpacing: '2px',
    marginBottom: '15px',
    marginTop: 0,
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    padding: '8px 0',
    borderBottom: '1px solid #2a2e38',
    fontSize: '10px',
    color: '#666',
    letterSpacing: '1px',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    padding: '6px 0',
    borderBottom: '1px solid #1a1f29',
    fontSize: '12px',
  },
  footer: {
    textAlign: 'center',
    color: '#666',
    fontSize: '12px',
    paddingTop: '15px',
    borderTop: '1px solid #2a2e38',
  },
}
