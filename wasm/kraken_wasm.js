let wasm;

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => state.dtor(state.a, state.b));

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {

        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            state.a = a;
            real._wbg_cb_unref();
        }
    };
    real._wbg_cb_unref = () => {
        if (--state.cnt === 0) {
            state.dtor(state.a, state.b);
            state.a = 0;
            CLOSURE_DTORS.unregister(state);
        }
    };
    CLOSURE_DTORS.register(real, state, state);
    return real;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    }
}

let WASM_VECTOR_LEN = 0;

function wasm_bindgen__convert__closures_____invoke__h6aaf97c3c7ca937c(arg0, arg1, arg2) {
    wasm.wasm_bindgen__convert__closures_____invoke__h6aaf97c3c7ca937c(arg0, arg1, arg2);
}

function wasm_bindgen__convert__closures_____invoke__ha4fd3f87c3ac44c5(arg0, arg1) {
    wasm.wasm_bindgen__convert__closures_____invoke__ha4fd3f87c3ac44c5(arg0, arg1);
}

function wasm_bindgen__convert__closures_____invoke__h58b0931533b4cf09(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen__convert__closures_____invoke__h58b0931533b4cf09(arg0, arg1, arg2, arg3);
}

const __wbindgen_enum_RequestMode = ["same-origin", "no-cors", "cors", "navigate"];

const WasmL3BookFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasml3book_free(ptr >>> 0, 1));

const WasmOrderbookFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmorderbook_free(ptr >>> 0, 1));

const WasmRateLimiterFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmratelimiter_free(ptr >>> 0, 1));

const WasmRestClientFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmrestclient_free(ptr >>> 0, 1));

/**
 * WASM-compatible L3 orderbook wrapper
 *
 * Provides Level 3 (order-level) orderbook functionality for JavaScript,
 * enabling individual order tracking, queue position calculation, and
 * advanced market making features.
 *
 * # Usage (JavaScript)
 *
 * ```javascript
 * import init, { WasmL3Book } from 'kraken-wasm';
 *
 * await init();
 *
 * const book = new WasmL3Book('BTC/USD', 100);
 *
 * // Add orders
 * book.add_order('order1', 50000.0, 1.5, 'bid');
 * book.add_order('order2', 50001.0, 2.0, 'ask');
 *
 * // Check queue position
 * const pos = book.get_queue_position('order1');
 * console.log('Position:', pos.position, 'Qty ahead:', pos.qty_ahead);
 *
 * // Get aggregated view (L2 format)
 * console.log('Top bids:', book.get_aggregated_bids(10));
 * ```
 */
export class WasmL3Book {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmL3BookFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasml3book_free(ptr, 0);
    }
    /**
     * Get the spread
     * @returns {number}
     */
    get_spread() {
        const ret = wasm.wasml3book_get_spread(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get the trading pair symbol
     * @returns {string}
     */
    get_symbol() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasml3book_get_symbol(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Get the best ask price
     * @returns {number}
     */
    get_best_ask() {
        const ret = wasm.wasml3book_get_best_ask(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get the best bid price
     * @returns {number}
     */
    get_best_bid() {
        const ret = wasm.wasml3book_get_best_bid(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get VWAP for buying a quantity
     *
     * Returns the volume-weighted average price to buy the given quantity
     * @param {number} qty
     * @returns {number}
     */
    get_vwap_ask(qty) {
        const ret = wasm.wasml3book_get_vwap_ask(this.__wbg_ptr, qty);
        return ret;
    }
    /**
     * Get VWAP for selling a quantity
     *
     * Returns the volume-weighted average price to sell the given quantity
     * @param {number} qty
     * @returns {number}
     */
    get_vwap_bid(qty) {
        const ret = wasm.wasml3book_get_vwap_bid(this.__wbg_ptr, qty);
        return ret;
    }
    /**
     * Modify an order's quantity
     *
     * Returns true if modified, false if order not found
     * @param {string} order_id
     * @param {number} new_qty
     * @returns {boolean}
     */
    modify_order(order_id, new_qty) {
        const ptr0 = passStringToWasm0(order_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasml3book_modify_order(this.__wbg_ptr, ptr0, len0, new_qty);
        return ret !== 0;
    }
    /**
     * Remove an order from the book
     *
     * Returns the removed order as a JS object, or null if not found
     * @param {string} order_id
     * @returns {any}
     */
    remove_order(order_id) {
        const ptr0 = passStringToWasm0(order_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasml3book_remove_order(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * Get the bid/ask imbalance ratio
     *
     * Returns a value between -1.0 (all asks) and 1.0 (all bids)
     * @returns {number}
     */
    get_imbalance() {
        const ret = wasm.wasml3book_get_imbalance(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get the mid price
     * @returns {number}
     */
    get_mid_price() {
        const ret = wasm.wasml3book_get_mid_price(this.__wbg_ptr);
        return ret;
    }
    /**
     * Set precision for checksum calculation
     * @param {number} price_precision
     * @param {number} qty_precision
     */
    set_precision(price_precision, qty_precision) {
        wasm.wasml3book_set_precision(this.__wbg_ptr, price_precision, qty_precision);
    }
    /**
     * Get the side of an order
     *
     * Returns "bid", "ask", or null if not found
     * @param {string} order_id
     * @returns {any}
     */
    get_order_side(order_id) {
        const ptr0 = passStringToWasm0(order_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasml3book_get_order_side(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * Get the total number of orders in the book
     * @returns {number}
     */
    get_order_count() {
        const ret = wasm.wasml3book_get_order_count(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Compute the checksum for the current book state
     * @returns {number}
     */
    compute_checksum() {
        const ret = wasm.wasml3book_compute_checksum(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Get the last processed sequence number
     * @returns {bigint}
     */
    get_last_sequence() {
        const ret = wasm.wasml3book_get_last_sequence(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * Get total ask quantity
     * @returns {number}
     */
    get_total_ask_qty() {
        const ret = wasm.wasml3book_get_total_ask_qty(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get total bid quantity
     * @returns {number}
     */
    get_total_bid_qty() {
        const ret = wasm.wasml3book_get_total_bid_qty(this.__wbg_ptr);
        return ret;
    }
    /**
     * Update the last sequence number
     * @param {bigint} seq
     */
    set_last_sequence(seq) {
        wasm.wasml3book_set_last_sequence(this.__wbg_ptr, seq);
    }
    /**
     * Validate the book against an expected checksum
     *
     * Returns true if checksum matches, false otherwise
     * @param {number} expected
     * @returns {boolean}
     */
    validate_checksum(expected) {
        const ret = wasm.wasml3book_validate_checksum(this.__wbg_ptr, expected);
        return ret !== 0;
    }
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
     * @param {string} order_id
     * @returns {any}
     */
    get_queue_position(order_id) {
        const ptr0 = passStringToWasm0(order_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasml3book_get_queue_position(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * Get all ask levels aggregated (L2 format)
     * @returns {any}
     */
    get_aggregated_asks() {
        const ret = wasm.wasml3book_get_aggregated_asks(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get all bid levels aggregated (L2 format)
     *
     * Returns array of `[{price: number, qty: number}, ...]`
     * @returns {any}
     */
    get_aggregated_bids() {
        const ret = wasm.wasml3book_get_aggregated_bids(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get the number of ask levels
     * @returns {number}
     */
    get_ask_level_count() {
        const ret = wasm.wasml3book_get_ask_level_count(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Get all orders at the best ask level
     * @returns {any}
     */
    get_best_ask_orders() {
        const ret = wasm.wasml3book_get_best_ask_orders(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get all orders at the best bid level
     * @returns {any}
     */
    get_best_bid_orders() {
        const ret = wasm.wasml3book_get_best_bid_orders(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get the number of bid levels
     * @returns {number}
     */
    get_bid_level_count() {
        const ret = wasm.wasml3book_get_bid_level_count(this.__wbg_ptr);
        return ret >>> 0;
    }
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
     * @param {string} order_id
     * @param {number} price
     * @param {number} qty
     * @param {string} side
     * @param {bigint} timestamp
     * @param {bigint} sequence
     * @returns {boolean}
     */
    add_order_with_metadata(order_id, price, qty, side, timestamp, sequence) {
        const ptr0 = passStringToWasm0(order_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(side, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasml3book_add_order_with_metadata(this.__wbg_ptr, ptr0, len0, price, qty, ptr1, len1, timestamp, sequence);
        return ret !== 0;
    }
    /**
     * Get top N aggregated ask levels
     * @param {number} n
     * @returns {any}
     */
    get_top_aggregated_asks(n) {
        const ret = wasm.wasml3book_get_top_aggregated_asks(this.__wbg_ptr, n);
        return ret;
    }
    /**
     * Get top N aggregated bid levels
     * @param {number} n
     * @returns {any}
     */
    get_top_aggregated_bids(n) {
        const ret = wasm.wasml3book_get_top_aggregated_bids(this.__wbg_ptr, n);
        return ret;
    }
    /**
     * Create a new L3 orderbook
     *
     * # Arguments
     * * `symbol` - Trading pair symbol (e.g., "BTC/USD")
     * * `depth` - Maximum depth (10, 100, or 1000)
     * @param {string} symbol
     * @param {number} depth
     */
    constructor(symbol, depth) {
        const ptr0 = passStringToWasm0(symbol, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasml3book_new(ptr0, len0, depth);
        this.__wbg_ptr = ret >>> 0;
        WasmL3BookFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Clear all orders and levels
     */
    clear() {
        wasm.wasml3book_clear(this.__wbg_ptr);
    }
    /**
     * Check if the book is empty
     * @returns {boolean}
     */
    is_empty() {
        const ret = wasm.wasml3book_is_empty(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Take a snapshot of the current book state
     *
     * Returns an object with aggregated levels and all orders
     * @returns {any}
     */
    snapshot() {
        const ret = wasm.wasml3book_snapshot(this.__wbg_ptr);
        return ret;
    }
    /**
     * Truncate book to maximum depth
     *
     * Removes levels beyond the configured depth limit
     */
    truncate() {
        wasm.wasml3book_truncate(this.__wbg_ptr);
    }
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
     * @param {string} order_id
     * @param {number} price
     * @param {number} qty
     * @param {string} side
     * @returns {boolean}
     */
    add_order(order_id, price, qty, side) {
        const ptr0 = passStringToWasm0(order_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(side, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasml3book_add_order(this.__wbg_ptr, ptr0, len0, price, qty, ptr1, len1);
        return ret !== 0;
    }
    /**
     * Get the maximum depth
     * @returns {number}
     */
    get_depth() {
        const ret = wasm.wasml3book_get_depth(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Get an order by ID
     *
     * Returns the order as a JS object, or null if not found
     * @param {string} order_id
     * @returns {any}
     */
    get_order(order_id) {
        const ptr0 = passStringToWasm0(order_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasml3book_get_order(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * Check if an order exists
     * @param {string} order_id
     * @returns {boolean}
     */
    has_order(order_id) {
        const ptr0 = passStringToWasm0(order_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasml3book_has_order(this.__wbg_ptr, ptr0, len0);
        return ret !== 0;
    }
}
if (Symbol.dispose) WasmL3Book.prototype[Symbol.dispose] = WasmL3Book.prototype.free;

/**
 * WASM-compatible orderbook wrapper
 *
 * Provides a JavaScript-friendly API for managing orderbook state.
 */
export class WasmOrderbook {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmOrderbook.prototype);
        obj.__wbg_ptr = ptr;
        WasmOrderbookFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmOrderbookFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmorderbook_free(ptr, 0);
    }
    /**
     * Get the spread (ask - bid) as a number
     *
     * Returns 0 if either side is empty.
     * @returns {number}
     */
    get_spread() {
        const ret = wasm.wasmorderbook_get_spread(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get the trading pair symbol
     * @returns {string}
     */
    get_symbol() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmorderbook_get_symbol(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Create a new orderbook with specific depth
     *
     * # Arguments
     * * `symbol` - Trading pair symbol
     * * `depth` - Orderbook depth (10, 25, 100, 500, or 1000)
     * @param {string} symbol
     * @param {number} depth
     * @returns {WasmOrderbook}
     */
    static with_depth(symbol, depth) {
        const ptr0 = passStringToWasm0(symbol, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmorderbook_with_depth(ptr0, len0, depth);
        return WasmOrderbook.__wrap(ret);
    }
    /**
     * Get the best ask price
     * @returns {number}
     */
    get_best_ask() {
        const ret = wasm.wasmorderbook_get_best_ask(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get the best bid price
     * @returns {number}
     */
    get_best_bid() {
        const ret = wasm.wasmorderbook_get_best_bid(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get the last validated checksum
     * @returns {number}
     */
    get_checksum() {
        const ret = wasm.wasmorderbook_get_checksum(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Get top N asks
     * @param {number} n
     * @returns {any}
     */
    get_top_asks(n) {
        const ret = wasm.wasmorderbook_get_top_asks(this.__wbg_ptr, n);
        return ret;
    }
    /**
     * Get top N bids
     * @param {number} n
     * @returns {any}
     */
    get_top_bids(n) {
        const ret = wasm.wasmorderbook_get_top_bids(this.__wbg_ptr, n);
        return ret;
    }
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
     * @param {string} json
     * @param {number} depth
     * @returns {any}
     */
    apply_and_get(json, depth) {
        const ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmorderbook_apply_and_get(this.__wbg_ptr, ptr0, len0, depth);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Apply a raw JSON message from the WebSocket
     *
     * Browser calls this with `event.data` from `ws.onmessage`.
     * Returns the message type: "snapshot", "update", "ignored", or throws on error.
     * @param {string} json
     * @returns {string}
     */
    apply_message(json) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmorderbook_apply_message(this.__wbg_ptr, ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * Clear history buffer
     */
    clear_history() {
        wasm.wasmorderbook_clear_history(this.__wbg_ptr);
    }
    /**
     * Get the number of ask levels
     * @returns {number}
     */
    get_ask_count() {
        const ret = wasm.wasmorderbook_get_ask_count(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Get the number of bid levels
     * @returns {number}
     */
    get_bid_count() {
        const ret = wasm.wasmorderbook_get_bid_count(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Get the mid price ((ask + bid) / 2)
     *
     * Returns 0 if either side is empty.
     * @returns {number}
     */
    get_mid_price() {
        const ret = wasm.wasmorderbook_get_mid_price(this.__wbg_ptr);
        return ret;
    }
    /**
     * Set precision for checksum calculation
     *
     * Each trading pair has specific precision values for price and quantity.
     * This must be set correctly for checksum validation to work.
     *
     * # Arguments
     * * `price_precision` - Decimal places for prices (e.g., 1 for BTC/USD, 2 for ETH/USD)
     * * `qty_precision` - Decimal places for quantities (usually 8)
     * @param {number} price_precision
     * @param {number} qty_precision
     */
    set_precision(price_precision, qty_precision) {
        wasm.wasmorderbook_set_precision(this.__wbg_ptr, price_precision, qty_precision);
    }
    /**
     * Enable history tracking for time-travel feature
     *
     * # Arguments
     * * `max_snapshots` - Maximum number of snapshots to retain
     * @param {number} max_snapshots
     */
    enable_history(max_snapshots) {
        wasm.wasmorderbook_enable_history(this.__wbg_ptr, max_snapshots);
    }
    /**
     * Disable history tracking
     */
    disable_history() {
        wasm.wasmorderbook_disable_history(this.__wbg_ptr);
    }
    /**
     * Get a historical snapshot by index (0 = oldest)
     *
     * Returns an object with bids, asks, and checksum, or null if not found.
     * @param {number} index
     * @returns {any}
     */
    get_snapshot_at(index) {
        const ret = wasm.wasmorderbook_get_snapshot_at(this.__wbg_ptr, index);
        return ret;
    }
    /**
     * Get the number of stored history snapshots
     * @returns {number}
     */
    get_history_length() {
        const ret = wasm.wasmorderbook_get_history_length(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Check if history is enabled
     * @returns {boolean}
     */
    is_history_enabled() {
        const ret = wasm.wasmorderbook_is_history_enabled(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Get the latest history sequence number
     * @returns {bigint}
     */
    get_latest_sequence() {
        const ret = wasm.wasmorderbook_get_latest_sequence(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * Create a new orderbook for a trading pair
     *
     * # Arguments
     * * `symbol` - Trading pair symbol (e.g., "BTC/USD")
     * @param {string} symbol
     */
    constructor(symbol) {
        const ptr0 = passStringToWasm0(symbol, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmorderbook_new(ptr0, len0);
        this.__wbg_ptr = ret >>> 0;
        WasmOrderbookFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Reset the orderbook to uninitialized state
     */
    reset() {
        wasm.wasmorderbook_reset(this.__wbg_ptr);
    }
    /**
     * Get all asks as a JavaScript array
     *
     * Returns array of objects: `[{price: number, qty: number}, ...]`
     * @returns {any}
     */
    get_asks() {
        const ret = wasm.wasmorderbook_get_asks(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get all bids as a JavaScript array
     *
     * Returns array of objects: `[{price: number, qty: number}, ...]`
     * @returns {any}
     */
    get_bids() {
        const ret = wasm.wasmorderbook_get_bids(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get the current state as a string
     * @returns {string}
     */
    get_state() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmorderbook_get_state(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Check if the orderbook is synchronized
     * @returns {boolean}
     */
    is_synced() {
        const ret = wasm.wasmorderbook_is_synced(this.__wbg_ptr);
        return ret !== 0;
    }
}
if (Symbol.dispose) WasmOrderbook.prototype[Symbol.dispose] = WasmOrderbook.prototype.free;

/**
 * WASM-compatible rate limiter for client-side request throttling
 *
 * Uses a token bucket algorithm to rate limit requests. This helps prevent
 * hitting Kraken's API rate limits when making requests from the browser.
 *
 * # Usage (JavaScript)
 *
 * ```javascript
 * import init, { WasmRateLimiter } from 'kraken-wasm';
 *
 * await init();
 *
 * // Create a limiter for public endpoints (15 req/min, refill 0.25/sec)
 * const limiter = new WasmRateLimiter(15, 0.25);
 *
 * // Before making a request
 * if (limiter.try_acquire()) {
 *     await client.get_ticker('XBTUSD');
 * } else {
 *     const waitTime = limiter.time_until_available();
 *     console.log(`Rate limited, wait ${waitTime}ms`);
 * }
 *
 * // Or wait for availability
 * await limiter.wait_for_token();
 * await client.get_ticker('ETHUSD');
 * ```
 */
export class WasmRateLimiter {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmRateLimiter.prototype);
        obj.__wbg_ptr = ptr;
        WasmRateLimiterFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmRateLimiterFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmratelimiter_free(ptr, 0);
    }
    /**
     * Check if making a request would exceed the rate limit
     *
     * Returns true if the rate limit would be exceeded
     * @returns {boolean}
     */
    is_limited() {
        const ret = wasm.wasmratelimiter_is_limited(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Try to acquire a token for making a request
     *
     * Returns true if a token was acquired, false if rate limited
     * @returns {boolean}
     */
    try_acquire() {
        const ret = wasm.wasmratelimiter_try_acquire(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Get utilization percentage (0.0 to 1.0)
     *
     * 0.0 = no tokens used, 1.0 = all tokens used
     * @returns {number}
     */
    utilization() {
        const ret = wasm.wasmratelimiter_utilization(this.__wbg_ptr);
        return ret;
    }
    /**
     * Create a rate limiter with Kraken's default public endpoint limits
     *
     * 15 requests, refilling at 0.5 per second (30 per minute)
     * @returns {WasmRateLimiter}
     */
    static kraken_public() {
        const ret = wasm.wasmratelimiter_kraken_public();
        return WasmRateLimiter.__wrap(ret);
    }
    /**
     * Create a rate limiter with Kraken's default private endpoint limits
     *
     * 20 requests, refilling at 0.33 per second (20 per minute)
     * @returns {WasmRateLimiter}
     */
    static kraken_private() {
        const ret = wasm.wasmratelimiter_kraken_private();
        return WasmRateLimiter.__wrap(ret);
    }
    /**
     * Wait for a token to become available (returns a Promise)
     *
     * This is useful for async/await patterns in JavaScript
     * @returns {Promise<any>}
     */
    wait_for_token() {
        const ret = wasm.wasmratelimiter_wait_for_token(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get time until a token is available (in milliseconds)
     *
     * Returns 0 if a token is immediately available
     * @returns {number}
     */
    time_until_available() {
        const ret = wasm.wasmratelimiter_time_until_available(this.__wbg_ptr);
        return ret;
    }
    /**
     * Create a new rate limiter
     *
     * # Arguments
     * * `capacity` - Maximum number of tokens (requests)
     * * `refill_rate` - Tokens added per second
     * @param {number} capacity
     * @param {number} refill_rate
     */
    constructor(capacity, refill_rate) {
        const ret = wasm.wasmratelimiter_new(capacity, refill_rate);
        this.__wbg_ptr = ret >>> 0;
        WasmRateLimiterFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Reset the limiter to full capacity
     */
    reset() {
        wasm.wasmratelimiter_reset(this.__wbg_ptr);
    }
    /**
     * Get the maximum capacity
     * @returns {number}
     */
    capacity() {
        const ret = wasm.wasmratelimiter_capacity(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get the number of available tokens
     * @returns {number}
     */
    available() {
        const ret = wasm.wasmratelimiter_available(this.__wbg_ptr);
        return ret;
    }
}
if (Symbol.dispose) WasmRateLimiter.prototype[Symbol.dispose] = WasmRateLimiter.prototype.free;

/**
 * WASM-compatible REST client for Kraken public endpoints
 *
 * Uses the browser's fetch API to make HTTP requests to Kraken's REST API.
 * Only public endpoints are supported (no authentication required).
 *
 * # Usage (JavaScript)
 *
 * ```javascript
 * import init, { WasmRestClient } from 'kraken-wasm';
 *
 * await init();
 *
 * const client = new WasmRestClient();
 *
 * // Get ticker data
 * const ticker = await client.get_ticker('XBTUSD');
 * console.log('BTC price:', ticker.XXBTZUSD.c[0]);
 *
 * // Get orderbook
 * const book = await client.get_orderbook('ETHUSD', 10);
 * console.log('ETH bids:', book.XETHZUSD.bids);
 * ```
 */
export class WasmRestClient {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmRestClient.prototype);
        obj.__wbg_ptr = ptr;
        WasmRestClientFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmRestClientFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmrestclient_free(ptr, 0);
    }
    /**
     * Get asset info
     *
     * Returns information about all available assets
     * @returns {Promise<any>}
     */
    get_assets() {
        const ret = wasm.wasmrestclient_get_assets(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get recent spread data
     *
     * # Arguments
     * * `pair` - Trading pair
     * * `since` - Optional timestamp to get spreads since
     * @param {string} pair
     * @param {bigint | null} [since]
     * @returns {Promise<any>}
     */
    get_spread(pair, since) {
        const ptr0 = passStringToWasm0(pair, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmrestclient_get_spread(this.__wbg_ptr, ptr0, len0, !isLikeNone(since), isLikeNone(since) ? BigInt(0) : since);
        return ret;
    }
    /**
     * Get ticker information
     *
     * # Arguments
     * * `pair` - Trading pair(s), comma-separated (e.g., "XBTUSD" or "XBTUSD,ETHUSD")
     * @param {string} pair
     * @returns {Promise<any>}
     */
    get_ticker(pair) {
        const ptr0 = passStringToWasm0(pair, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmrestclient_get_ticker(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * Get the base URL
     * @returns {string}
     */
    get_base_url() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmrestclient_get_base_url(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Get orderbook
     *
     * # Arguments
     * * `pair` - Trading pair
     * * `count` - Maximum number of bids/asks (1-500)
     * @param {string} pair
     * @param {number | null} [count]
     * @returns {Promise<any>}
     */
    get_orderbook(pair, count) {
        const ptr0 = passStringToWasm0(pair, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmrestclient_get_orderbook(this.__wbg_ptr, ptr0, len0, isLikeNone(count) ? 0xFFFFFF : count);
        return ret;
    }
    /**
     * Create a REST client with custom base URL (for testing)
     * @param {string} base_url
     * @returns {WasmRestClient}
     */
    static with_base_url(base_url) {
        const ptr0 = passStringToWasm0(base_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmrestclient_with_base_url(ptr0, len0);
        return WasmRestClient.__wrap(ret);
    }
    /**
     * Get specific asset pair info
     *
     * # Arguments
     * * `pair` - Trading pair (e.g., "XBTUSD", "ETHUSD")
     * @param {string} pair
     * @returns {Promise<any>}
     */
    get_asset_pair(pair) {
        const ptr0 = passStringToWasm0(pair, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmrestclient_get_asset_pair(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * Get tradeable asset pairs
     *
     * Returns information about all tradeable pairs
     * @returns {Promise<any>}
     */
    get_asset_pairs() {
        const ret = wasm.wasmrestclient_get_asset_pairs(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get server time
     *
     * Returns the server's current time
     * @returns {Promise<any>}
     */
    get_server_time() {
        const ret = wasm.wasmrestclient_get_server_time(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get recent trades
     *
     * # Arguments
     * * `pair` - Trading pair
     * * `since` - Optional trade ID to get trades since
     * * `count` - Optional max number of trades
     * @param {string} pair
     * @param {string | null} [since]
     * @param {number | null} [count]
     * @returns {Promise<any>}
     */
    get_recent_trades(pair, since, count) {
        const ptr0 = passStringToWasm0(pair, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(since) ? 0 : passStringToWasm0(since, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmrestclient_get_recent_trades(this.__wbg_ptr, ptr0, len0, ptr1, len1, isLikeNone(count) ? 0x100000001 : (count) >>> 0);
        return ret;
    }
    /**
     * Get system status
     *
     * Returns the current system status (online, maintenance, etc.)
     * @returns {Promise<any>}
     */
    get_system_status() {
        const ret = wasm.wasmrestclient_get_system_status(this.__wbg_ptr);
        return ret;
    }
    /**
     * Create a new REST client
     */
    constructor() {
        const ret = wasm.wasmrestclient_new();
        this.__wbg_ptr = ret >>> 0;
        WasmRestClientFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Get OHLC data
     *
     * # Arguments
     * * `pair` - Trading pair
     * * `interval` - Time interval in minutes (1, 5, 15, 30, 60, 240, 1440, 10080, 21600)
     * * `since` - Optional Unix timestamp to get data since
     * @param {string} pair
     * @param {number} interval
     * @param {bigint | null} [since]
     * @returns {Promise<any>}
     */
    get_ohlc(pair, interval, since) {
        const ptr0 = passStringToWasm0(pair, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmrestclient_get_ohlc(this.__wbg_ptr, ptr0, len0, interval, !isLikeNone(since), isLikeNone(since) ? BigInt(0) : since);
        return ret;
    }
    /**
     * Get specific asset info
     *
     * # Arguments
     * * `asset` - Asset name (e.g., "XBT", "ETH")
     * @param {string} asset
     * @returns {Promise<any>}
     */
    get_asset(asset) {
        const ptr0 = passStringToWasm0(asset, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmrestclient_get_asset(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
}
if (Symbol.dispose) WasmRestClient.prototype[Symbol.dispose] = WasmRestClient.prototype.free;

/**
 * Initialize panic hook for better error messages in browser console
 */
export function init() {
    wasm.init();
}

const EXPECTED_RESPONSE_TYPES = new Set(['basic', 'cors', 'default']);

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && EXPECTED_RESPONSE_TYPES.has(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_Error_52673b7de5a0ca89 = function(arg0, arg1) {
        const ret = Error(getStringFromWasm0(arg0, arg1));
        return ret;
    };
    imports.wbg.__wbg_String_8f0eb39a4a4c2f66 = function(arg0, arg1) {
        const ret = String(arg1);
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg___wbindgen_debug_string_adfb662ae34724b6 = function(arg0, arg1) {
        const ret = debugString(arg1);
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg___wbindgen_is_function_8d400b8b1af978cd = function(arg0) {
        const ret = typeof(arg0) === 'function';
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_undefined_f6b95eab589e0269 = function(arg0) {
        const ret = arg0 === undefined;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_string_get_a2a31e16edf96e42 = function(arg0, arg1) {
        const obj = arg1;
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg___wbindgen_throw_dd24417ed36fc46e = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbg__wbg_cb_unref_87dfb5aaa0cbcea7 = function(arg0) {
        arg0._wbg_cb_unref();
    };
    imports.wbg.__wbg_call_3020136f7a2d6e44 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = arg0.call(arg1, arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_call_abb4ff46ce38be40 = function() { return handleError(function (arg0, arg1) {
        const ret = arg0.call(arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_error_7534b8e9a36f1ab4 = function(arg0, arg1) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg0;
            deferred0_1 = arg1;
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_fetch_8119fbf8d0e4f4d1 = function(arg0, arg1) {
        const ret = arg0.fetch(arg1);
        return ret;
    };
    imports.wbg.__wbg_get_6b7bd52aca3f9671 = function(arg0, arg1) {
        const ret = arg0[arg1 >>> 0];
        return ret;
    };
    imports.wbg.__wbg_get_af9dab7e9603ea93 = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.get(arg0, arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_headers_850c3fb50632ae78 = function(arg0) {
        const ret = arg0.headers;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Response_cd74d1c2ac92cb0b = function(arg0) {
        let result;
        try {
            result = arg0 instanceof Response;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Window_b5cf7783caa68180 = function(arg0) {
        let result;
        try {
            result = arg0 instanceof Window;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_isArray_51fd9e6422c0a395 = function(arg0) {
        const ret = Array.isArray(arg0);
        return ret;
    };
    imports.wbg.__wbg_json_47d847e3a3f1cf40 = function() { return handleError(function (arg0) {
        const ret = arg0.json();
        return ret;
    }, arguments) };
    imports.wbg.__wbg_length_d45040a40c570362 = function(arg0) {
        const ret = arg0.length;
        return ret;
    };
    imports.wbg.__wbg_new_1ba21ce319a06297 = function() {
        const ret = new Object();
        return ret;
    };
    imports.wbg.__wbg_new_25f239778d6112b9 = function() {
        const ret = new Array();
        return ret;
    };
    imports.wbg.__wbg_new_8a6f238a6ece86ea = function() {
        const ret = new Error();
        return ret;
    };
    imports.wbg.__wbg_new_ff12d2b041fb48f1 = function(arg0, arg1) {
        try {
            var state0 = {a: arg0, b: arg1};
            var cb0 = (arg0, arg1) => {
                const a = state0.a;
                state0.a = 0;
                try {
                    return wasm_bindgen__convert__closures_____invoke__h58b0931533b4cf09(a, state0.b, arg0, arg1);
                } finally {
                    state0.a = a;
                }
            };
            const ret = new Promise(cb0);
            return ret;
        } finally {
            state0.a = state0.b = 0;
        }
    };
    imports.wbg.__wbg_new_no_args_cb138f77cf6151ee = function(arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return ret;
    };
    imports.wbg.__wbg_new_with_str_and_init_c5748f76f5108934 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = new Request(getStringFromWasm0(arg0, arg1), arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_now_69d776cd24f5215b = function() {
        const ret = Date.now();
        return ret;
    };
    imports.wbg.__wbg_ok_dd98ecb60d721e20 = function(arg0) {
        const ret = arg0.ok;
        return ret;
    };
    imports.wbg.__wbg_queueMicrotask_9b549dfce8865860 = function(arg0) {
        const ret = arg0.queueMicrotask;
        return ret;
    };
    imports.wbg.__wbg_queueMicrotask_fca69f5bfad613a5 = function(arg0) {
        queueMicrotask(arg0);
    };
    imports.wbg.__wbg_resolve_fd5bfbaa4ce36e1e = function(arg0) {
        const ret = Promise.resolve(arg0);
        return ret;
    };
    imports.wbg.__wbg_setTimeout_06477c23d31efef1 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = arg0.setTimeout(arg1, arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_set_3f1d0b984ed272ed = function(arg0, arg1, arg2) {
        arg0[arg1] = arg2;
    };
    imports.wbg.__wbg_set_425eb8b710d5beee = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        arg0.set(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_set_7df433eea03a5c14 = function(arg0, arg1, arg2) {
        arg0[arg1 >>> 0] = arg2;
    };
    imports.wbg.__wbg_set_method_76c69e41b3570627 = function(arg0, arg1, arg2) {
        arg0.method = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_mode_611016a6818fc690 = function(arg0, arg1) {
        arg0.mode = __wbindgen_enum_RequestMode[arg1];
    };
    imports.wbg.__wbg_stack_0ed75d68575b0f3c = function(arg0, arg1) {
        const ret = arg1.stack;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_static_accessor_GLOBAL_769e6b65d6557335 = function() {
        const ret = typeof global === 'undefined' ? null : global;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_static_accessor_GLOBAL_THIS_60cf02db4de8e1c1 = function() {
        const ret = typeof globalThis === 'undefined' ? null : globalThis;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_static_accessor_SELF_08f5a74c69739274 = function() {
        const ret = typeof self === 'undefined' ? null : self;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_static_accessor_WINDOW_a8924b26aa92d024 = function() {
        const ret = typeof window === 'undefined' ? null : window;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_statusText_0eec2bbb2c8f22e2 = function(arg0, arg1) {
        const ret = arg1.statusText;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_status_9bfc680efca4bdfd = function(arg0) {
        const ret = arg0.status;
        return ret;
    };
    imports.wbg.__wbg_then_429f7caf1026411d = function(arg0, arg1, arg2) {
        const ret = arg0.then(arg1, arg2);
        return ret;
    };
    imports.wbg.__wbg_then_4f95312d68691235 = function(arg0, arg1) {
        const ret = arg0.then(arg1);
        return ret;
    };
    imports.wbg.__wbindgen_cast_2241b6af4c4b2941 = function(arg0, arg1) {
        // Cast intrinsic for `Ref(String) -> Externref`.
        const ret = getStringFromWasm0(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbindgen_cast_4625c577ab2ec9ee = function(arg0) {
        // Cast intrinsic for `U64 -> Externref`.
        const ret = BigInt.asUintN(64, arg0);
        return ret;
    };
    imports.wbg.__wbindgen_cast_537c9407d5b326b9 = function(arg0, arg1) {
        // Cast intrinsic for `Closure(Closure { dtor_idx: 55, function: Function { arguments: [], shim_idx: 56, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
        const ret = makeMutClosure(arg0, arg1, wasm.wasm_bindgen__closure__destroy__hc9f3cc98260493a5, wasm_bindgen__convert__closures_____invoke__ha4fd3f87c3ac44c5);
        return ret;
    };
    imports.wbg.__wbindgen_cast_d6cd19b81560fd6e = function(arg0) {
        // Cast intrinsic for `F64 -> Externref`.
        const ret = arg0;
        return ret;
    };
    imports.wbg.__wbindgen_cast_d7a5c5b374c0e0a3 = function(arg0, arg1) {
        // Cast intrinsic for `Closure(Closure { dtor_idx: 78, function: Function { arguments: [Externref], shim_idx: 79, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
        const ret = makeMutClosure(arg0, arg1, wasm.wasm_bindgen__closure__destroy__hc3dcdbb56181ee86, wasm_bindgen__convert__closures_____invoke__h6aaf97c3c7ca937c);
        return ret;
    };
    imports.wbg.__wbindgen_init_externref_table = function() {
        const table = wasm.__wbindgen_externrefs;
        const offset = table.grow(4);
        table.set(0, undefined);
        table.set(offset + 0, undefined);
        table.set(offset + 1, null);
        table.set(offset + 2, true);
        table.set(offset + 3, false);
    };

    return imports;
}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;


    wasm.__wbindgen_start();
    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (typeof module !== 'undefined') {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (typeof module_or_path === 'undefined') {
        module_or_path = new URL('kraken_wasm_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;
