/* tslint:disable */
/* eslint-disable */

export class WasmL3Book {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Get the spread
   */
  get_spread(): number;
  /**
   * Get the trading pair symbol
   */
  get_symbol(): string;
  /**
   * Get the best ask price
   */
  get_best_ask(): number;
  /**
   * Get the best bid price
   */
  get_best_bid(): number;
  /**
   * Get VWAP for buying a quantity
   *
   * Returns the volume-weighted average price to buy the given quantity
   */
  get_vwap_ask(qty: number): number;
  /**
   * Get VWAP for selling a quantity
   *
   * Returns the volume-weighted average price to sell the given quantity
   */
  get_vwap_bid(qty: number): number;
  /**
   * Modify an order's quantity
   *
   * Returns true if modified, false if order not found
   */
  modify_order(order_id: string, new_qty: number): boolean;
  /**
   * Remove an order from the book
   *
   * Returns the removed order as a JS object, or null if not found
   */
  remove_order(order_id: string): any;
  /**
   * Get the bid/ask imbalance ratio
   *
   * Returns a value between -1.0 (all asks) and 1.0 (all bids)
   */
  get_imbalance(): number;
  /**
   * Get the mid price
   */
  get_mid_price(): number;
  /**
   * Set precision for checksum calculation
   */
  set_precision(price_precision: number, qty_precision: number): void;
  /**
   * Get the side of an order
   *
   * Returns "bid", "ask", or null if not found
   */
  get_order_side(order_id: string): any;
  /**
   * Get the total number of orders in the book
   */
  get_order_count(): number;
  /**
   * Compute the checksum for the current book state
   */
  compute_checksum(): number;
  /**
   * Get the last processed sequence number
   */
  get_last_sequence(): bigint;
  /**
   * Get total ask quantity
   */
  get_total_ask_qty(): number;
  /**
   * Get total bid quantity
   */
  get_total_bid_qty(): number;
  /**
   * Update the last sequence number
   */
  set_last_sequence(seq: bigint): void;
  /**
   * Validate the book against an expected checksum
   *
   * Returns true if checksum matches, false otherwise
   */
  validate_checksum(expected: number): boolean;
  /**
   * Get the queue position for an order
   *
   * Returns an object with position info, or null if order not found:
   * ```javascript
   * {
   *   position: number,      // 0-indexed position in queue
   *   orders_ahead: number,  // Same as position
   *   qty_ahead: number,     // Total quantity ahead
   *   total_orders: number,  // Total orders at this level
   *   total_qty: number,     // Total quantity at this level
   *   fill_probability: number // 0.0 to 1.0
   * }
   * ```
   */
  get_queue_position(order_id: string): any;
  /**
   * Get all ask levels aggregated (L2 format)
   */
  get_aggregated_asks(): any;
  /**
   * Get all bid levels aggregated (L2 format)
   *
   * Returns array of `[{price: number, qty: number}, ...]`
   */
  get_aggregated_bids(): any;
  /**
   * Get the number of ask levels
   */
  get_ask_level_count(): number;
  /**
   * Get all orders at the best ask level
   */
  get_best_ask_orders(): any;
  /**
   * Get all orders at the best bid level
   */
  get_best_bid_orders(): any;
  /**
   * Get the number of bid levels
   */
  get_bid_level_count(): number;
  /**
   * Add a new order with full metadata
   *
   * # Arguments
   * * `order_id` - Unique order identifier
   * * `price` - Order price
   * * `qty` - Order quantity
   * * `side` - "bid" or "ask"
   * * `timestamp` - Microseconds since epoch
   * * `sequence` - Sequence number for ordering
   */
  add_order_with_metadata(order_id: string, price: number, qty: number, side: string, timestamp: bigint, sequence: bigint): boolean;
  /**
   * Get top N aggregated ask levels
   */
  get_top_aggregated_asks(n: number): any;
  /**
   * Get top N aggregated bid levels
   */
  get_top_aggregated_bids(n: number): any;
  /**
   * Create a new L3 orderbook
   *
   * # Arguments
   * * `symbol` - Trading pair symbol (e.g., "BTC/USD")
   * * `depth` - Maximum depth (10, 100, or 1000)
   */
  constructor(symbol: string, depth: number);
  /**
   * Clear all orders and levels
   */
  clear(): void;
  /**
   * Check if the book is empty
   */
  is_empty(): boolean;
  /**
   * Take a snapshot of the current book state
   *
   * Returns an object with aggregated levels and all orders
   */
  snapshot(): any;
  /**
   * Truncate book to maximum depth
   *
   * Removes levels beyond the configured depth limit
   */
  truncate(): void;
  /**
   * Add a new order to the book
   *
   * # Arguments
   * * `order_id` - Unique order identifier
   * * `price` - Order price
   * * `qty` - Order quantity
   * * `side` - "bid" or "ask"
   *
   * Returns true if added, false if order already exists
   */
  add_order(order_id: string, price: number, qty: number, side: string): boolean;
  /**
   * Get the maximum depth
   */
  get_depth(): number;
  /**
   * Get an order by ID
   *
   * Returns the order as a JS object, or null if not found
   */
  get_order(order_id: string): any;
  /**
   * Check if an order exists
   */
  has_order(order_id: string): boolean;
}

export class WasmOrderbook {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Get the spread (ask - bid) as a number
   *
   * Returns 0 if either side is empty.
   */
  get_spread(): number;
  /**
   * Get the trading pair symbol
   */
  get_symbol(): string;
  /**
   * Create a new orderbook with specific depth
   *
   * # Arguments
   * * `symbol` - Trading pair symbol
   * * `depth` - Orderbook depth (10, 25, 100, 500, or 1000)
   */
  static with_depth(symbol: string, depth: number): WasmOrderbook;
  /**
   * Get the best ask price
   */
  get_best_ask(): number;
  /**
   * Get the best bid price
   */
  get_best_bid(): number;
  /**
   * Get the last validated checksum
   */
  get_checksum(): number;
  /**
   * Get top N asks
   */
  get_top_asks(n: number): any;
  /**
   * Get top N bids
   */
  get_top_bids(n: number): any;
  /**
   * Apply a message and return orderbook state in one call
   *
   * This is the recommended method for browser use as it avoids
   * multiple WASM calls which can cause borrow conflicts.
   *
   * Returns an object with:
   * ```javascript
   * {
   *   type: "snapshot" | "update" | "ignored",
   *   bids: [{price, qty}, ...],
   *   asks: [{price, qty}, ...],
   *   best_bid: number,
   *   best_ask: number,
   *   spread: number,
   *   mid_price: number
   * }
   * ```
   */
  apply_and_get(json: string, depth: number): any;
  /**
   * Apply a raw JSON message from the WebSocket
   *
   * Browser calls this with `event.data` from `ws.onmessage`.
   * Returns the message type: "snapshot", "update", "ignored", or throws on error.
   */
  apply_message(json: string): string;
  /**
   * Clear history buffer
   */
  clear_history(): void;
  /**
   * Get the number of ask levels
   */
  get_ask_count(): number;
  /**
   * Get the number of bid levels
   */
  get_bid_count(): number;
  /**
   * Get the mid price ((ask + bid) / 2)
   *
   * Returns 0 if either side is empty.
   */
  get_mid_price(): number;
  /**
   * Set precision for checksum calculation
   *
   * Each trading pair has specific precision values for price and quantity.
   * This must be set correctly for checksum validation to work.
   *
   * # Arguments
   * * `price_precision` - Decimal places for prices (e.g., 1 for BTC/USD, 2 for ETH/USD)
   * * `qty_precision` - Decimal places for quantities (usually 8)
   */
  set_precision(price_precision: number, qty_precision: number): void;
  /**
   * Enable history tracking for time-travel feature
   *
   * # Arguments
   * * `max_snapshots` - Maximum number of snapshots to retain
   */
  enable_history(max_snapshots: number): void;
  /**
   * Disable history tracking
   */
  disable_history(): void;
  /**
   * Get a historical snapshot by index (0 = oldest)
   *
   * Returns an object with bids, asks, and checksum, or null if not found.
   */
  get_snapshot_at(index: number): any;
  /**
   * Get the number of stored history snapshots
   */
  get_history_length(): number;
  /**
   * Check if history is enabled
   */
  is_history_enabled(): boolean;
  /**
   * Get the latest history sequence number
   */
  get_latest_sequence(): bigint;
  /**
   * Create a new orderbook for a trading pair
   *
   * # Arguments
   * * `symbol` - Trading pair symbol (e.g., "BTC/USD")
   */
  constructor(symbol: string);
  /**
   * Reset the orderbook to uninitialized state
   */
  reset(): void;
  /**
   * Get all asks as a JavaScript array
   *
   * Returns array of objects: `[{price: number, qty: number}, ...]`
   */
  get_asks(): any;
  /**
   * Get all bids as a JavaScript array
   *
   * Returns array of objects: `[{price: number, qty: number}, ...]`
   */
  get_bids(): any;
  /**
   * Get the current state as a string
   */
  get_state(): string;
  /**
   * Check if the orderbook is synchronized
   */
  is_synced(): boolean;
}

export class WasmRateLimiter {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Check if making a request would exceed the rate limit
   *
   * Returns true if the rate limit would be exceeded
   */
  is_limited(): boolean;
  /**
   * Try to acquire a token for making a request
   *
   * Returns true if a token was acquired, false if rate limited
   */
  try_acquire(): boolean;
  /**
   * Get utilization percentage (0.0 to 1.0)
   *
   * 0.0 = no tokens used, 1.0 = all tokens used
   */
  utilization(): number;
  /**
   * Create a rate limiter with Kraken's default public endpoint limits
   *
   * 15 requests, refilling at 0.5 per second (30 per minute)
   */
  static kraken_public(): WasmRateLimiter;
  /**
   * Create a rate limiter with Kraken's default private endpoint limits
   *
   * 20 requests, refilling at 0.33 per second (20 per minute)
   */
  static kraken_private(): WasmRateLimiter;
  /**
   * Wait for a token to become available (returns a Promise)
   *
   * This is useful for async/await patterns in JavaScript
   */
  wait_for_token(): Promise<any>;
  /**
   * Get time until a token is available (in milliseconds)
   *
   * Returns 0 if a token is immediately available
   */
  time_until_available(): number;
  /**
   * Create a new rate limiter
   *
   * # Arguments
   * * `capacity` - Maximum number of tokens (requests)
   * * `refill_rate` - Tokens added per second
   */
  constructor(capacity: number, refill_rate: number);
  /**
   * Reset the limiter to full capacity
   */
  reset(): void;
  /**
   * Get the maximum capacity
   */
  capacity(): number;
  /**
   * Get the number of available tokens
   */
  available(): number;
}

export class WasmRestClient {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Get asset info
   *
   * Returns information about all available assets
   */
  get_assets(): Promise<any>;
  /**
   * Get recent spread data
   *
   * # Arguments
   * * `pair` - Trading pair
   * * `since` - Optional timestamp to get spreads since
   */
  get_spread(pair: string, since?: bigint | null): Promise<any>;
  /**
   * Get ticker information
   *
   * # Arguments
   * * `pair` - Trading pair(s), comma-separated (e.g., "XBTUSD" or "XBTUSD,ETHUSD")
   */
  get_ticker(pair: string): Promise<any>;
  /**
   * Get the base URL
   */
  get_base_url(): string;
  /**
   * Get orderbook
   *
   * # Arguments
   * * `pair` - Trading pair
   * * `count` - Maximum number of bids/asks (1-500)
   */
  get_orderbook(pair: string, count?: number | null): Promise<any>;
  /**
   * Create a REST client with custom base URL (for testing)
   */
  static with_base_url(base_url: string): WasmRestClient;
  /**
   * Get specific asset pair info
   *
   * # Arguments
   * * `pair` - Trading pair (e.g., "XBTUSD", "ETHUSD")
   */
  get_asset_pair(pair: string): Promise<any>;
  /**
   * Get tradeable asset pairs
   *
   * Returns information about all tradeable pairs
   */
  get_asset_pairs(): Promise<any>;
  /**
   * Get server time
   *
   * Returns the server's current time
   */
  get_server_time(): Promise<any>;
  /**
   * Get recent trades
   *
   * # Arguments
   * * `pair` - Trading pair
   * * `since` - Optional trade ID to get trades since
   * * `count` - Optional max number of trades
   */
  get_recent_trades(pair: string, since?: string | null, count?: number | null): Promise<any>;
  /**
   * Get system status
   *
   * Returns the current system status (online, maintenance, etc.)
   */
  get_system_status(): Promise<any>;
  /**
   * Create a new REST client
   */
  constructor();
  /**
   * Get OHLC data
   *
   * # Arguments
   * * `pair` - Trading pair
   * * `interval` - Time interval in minutes (1, 5, 15, 30, 60, 240, 1440, 10080, 21600)
   * * `since` - Optional Unix timestamp to get data since
   */
  get_ohlc(pair: string, interval: number, since?: bigint | null): Promise<any>;
  /**
   * Get specific asset info
   *
   * # Arguments
   * * `asset` - Asset name (e.g., "XBT", "ETH")
   */
  get_asset(asset: string): Promise<any>;
}

/**
 * Initialize panic hook for better error messages in browser console
 */
export function init(): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_wasml3book_free: (a: number, b: number) => void;
  readonly __wbg_wasmorderbook_free: (a: number, b: number) => void;
  readonly __wbg_wasmratelimiter_free: (a: number, b: number) => void;
  readonly __wbg_wasmrestclient_free: (a: number, b: number) => void;
  readonly wasml3book_add_order: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => number;
  readonly wasml3book_add_order_with_metadata: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: bigint, i: bigint) => number;
  readonly wasml3book_clear: (a: number) => void;
  readonly wasml3book_compute_checksum: (a: number) => number;
  readonly wasml3book_get_aggregated_asks: (a: number) => any;
  readonly wasml3book_get_aggregated_bids: (a: number) => any;
  readonly wasml3book_get_ask_level_count: (a: number) => number;
  readonly wasml3book_get_best_ask: (a: number) => number;
  readonly wasml3book_get_best_ask_orders: (a: number) => any;
  readonly wasml3book_get_best_bid: (a: number) => number;
  readonly wasml3book_get_best_bid_orders: (a: number) => any;
  readonly wasml3book_get_bid_level_count: (a: number) => number;
  readonly wasml3book_get_depth: (a: number) => number;
  readonly wasml3book_get_imbalance: (a: number) => number;
  readonly wasml3book_get_last_sequence: (a: number) => bigint;
  readonly wasml3book_get_mid_price: (a: number) => number;
  readonly wasml3book_get_order: (a: number, b: number, c: number) => any;
  readonly wasml3book_get_order_count: (a: number) => number;
  readonly wasml3book_get_order_side: (a: number, b: number, c: number) => any;
  readonly wasml3book_get_queue_position: (a: number, b: number, c: number) => any;
  readonly wasml3book_get_spread: (a: number) => number;
  readonly wasml3book_get_symbol: (a: number) => [number, number];
  readonly wasml3book_get_top_aggregated_asks: (a: number, b: number) => any;
  readonly wasml3book_get_top_aggregated_bids: (a: number, b: number) => any;
  readonly wasml3book_get_total_ask_qty: (a: number) => number;
  readonly wasml3book_get_total_bid_qty: (a: number) => number;
  readonly wasml3book_get_vwap_ask: (a: number, b: number) => number;
  readonly wasml3book_get_vwap_bid: (a: number, b: number) => number;
  readonly wasml3book_has_order: (a: number, b: number, c: number) => number;
  readonly wasml3book_is_empty: (a: number) => number;
  readonly wasml3book_modify_order: (a: number, b: number, c: number, d: number) => number;
  readonly wasml3book_new: (a: number, b: number, c: number) => number;
  readonly wasml3book_remove_order: (a: number, b: number, c: number) => any;
  readonly wasml3book_set_last_sequence: (a: number, b: bigint) => void;
  readonly wasml3book_set_precision: (a: number, b: number, c: number) => void;
  readonly wasml3book_snapshot: (a: number) => any;
  readonly wasml3book_truncate: (a: number) => void;
  readonly wasml3book_validate_checksum: (a: number, b: number) => number;
  readonly wasmorderbook_apply_and_get: (a: number, b: number, c: number, d: number) => [number, number, number];
  readonly wasmorderbook_apply_message: (a: number, b: number, c: number) => [number, number, number, number];
  readonly wasmorderbook_clear_history: (a: number) => void;
  readonly wasmorderbook_disable_history: (a: number) => void;
  readonly wasmorderbook_enable_history: (a: number, b: number) => void;
  readonly wasmorderbook_get_ask_count: (a: number) => number;
  readonly wasmorderbook_get_asks: (a: number) => any;
  readonly wasmorderbook_get_best_ask: (a: number) => number;
  readonly wasmorderbook_get_best_bid: (a: number) => number;
  readonly wasmorderbook_get_bid_count: (a: number) => number;
  readonly wasmorderbook_get_bids: (a: number) => any;
  readonly wasmorderbook_get_checksum: (a: number) => number;
  readonly wasmorderbook_get_history_length: (a: number) => number;
  readonly wasmorderbook_get_latest_sequence: (a: number) => bigint;
  readonly wasmorderbook_get_mid_price: (a: number) => number;
  readonly wasmorderbook_get_snapshot_at: (a: number, b: number) => any;
  readonly wasmorderbook_get_spread: (a: number) => number;
  readonly wasmorderbook_get_state: (a: number) => [number, number];
  readonly wasmorderbook_get_symbol: (a: number) => [number, number];
  readonly wasmorderbook_get_top_asks: (a: number, b: number) => any;
  readonly wasmorderbook_get_top_bids: (a: number, b: number) => any;
  readonly wasmorderbook_is_history_enabled: (a: number) => number;
  readonly wasmorderbook_is_synced: (a: number) => number;
  readonly wasmorderbook_new: (a: number, b: number) => number;
  readonly wasmorderbook_reset: (a: number) => void;
  readonly wasmorderbook_set_precision: (a: number, b: number, c: number) => void;
  readonly wasmorderbook_with_depth: (a: number, b: number, c: number) => number;
  readonly wasmratelimiter_available: (a: number) => number;
  readonly wasmratelimiter_capacity: (a: number) => number;
  readonly wasmratelimiter_is_limited: (a: number) => number;
  readonly wasmratelimiter_kraken_private: () => number;
  readonly wasmratelimiter_kraken_public: () => number;
  readonly wasmratelimiter_new: (a: number, b: number) => number;
  readonly wasmratelimiter_reset: (a: number) => void;
  readonly wasmratelimiter_time_until_available: (a: number) => number;
  readonly wasmratelimiter_try_acquire: (a: number) => number;
  readonly wasmratelimiter_utilization: (a: number) => number;
  readonly wasmratelimiter_wait_for_token: (a: number) => any;
  readonly wasmrestclient_get_asset: (a: number, b: number, c: number) => any;
  readonly wasmrestclient_get_asset_pair: (a: number, b: number, c: number) => any;
  readonly wasmrestclient_get_asset_pairs: (a: number) => any;
  readonly wasmrestclient_get_assets: (a: number) => any;
  readonly wasmrestclient_get_base_url: (a: number) => [number, number];
  readonly wasmrestclient_get_ohlc: (a: number, b: number, c: number, d: number, e: number, f: bigint) => any;
  readonly wasmrestclient_get_orderbook: (a: number, b: number, c: number, d: number) => any;
  readonly wasmrestclient_get_recent_trades: (a: number, b: number, c: number, d: number, e: number, f: number) => any;
  readonly wasmrestclient_get_server_time: (a: number) => any;
  readonly wasmrestclient_get_spread: (a: number, b: number, c: number, d: number, e: bigint) => any;
  readonly wasmrestclient_get_system_status: (a: number) => any;
  readonly wasmrestclient_get_ticker: (a: number, b: number, c: number) => any;
  readonly wasmrestclient_new: () => number;
  readonly wasmrestclient_with_base_url: (a: number, b: number) => number;
  readonly init: () => void;
  readonly wasm_bindgen__convert__closures_____invoke__h6aaf97c3c7ca937c: (a: number, b: number, c: any) => void;
  readonly wasm_bindgen__closure__destroy__hc3dcdbb56181ee86: (a: number, b: number) => void;
  readonly wasm_bindgen__convert__closures_____invoke__ha4fd3f87c3ac44c5: (a: number, b: number) => void;
  readonly wasm_bindgen__closure__destroy__hc9f3cc98260493a5: (a: number, b: number) => void;
  readonly wasm_bindgen__convert__closures_____invoke__h58b0931533b4cf09: (a: number, b: number, c: any, d: any) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_externrefs: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
