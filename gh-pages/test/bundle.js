(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return b64.length * 3 / 4 - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, j, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr(len * 3 / 4 - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],2:[function(require,module,exports){
(function (global){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"base64-js":1,"ieee754":3,"isarray":6}],3:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],4:[function(require,module,exports){
'use strict';
var numberIsNan = require('number-is-nan');

module.exports = Number.isFinite || function (val) {
	return !(typeof val !== 'number' || numberIsNan(val) || val === Infinity || val === -Infinity);
};

},{"number-is-nan":11}],5:[function(require,module,exports){
// https://github.com/paulmillr/es6-shim
// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.isinteger
var isFinite = require("is-finite");
module.exports = Number.isInteger || function(val) {
  return typeof val === "number" &&
    isFinite(val) &&
    Math.floor(val) === val;
};

},{"is-finite":4}],6:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],7:[function(require,module,exports){
(function (global){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used to compose bitmasks for comparison styles. */
var UNORDERED_COMPARE_FLAG = 1,
    PARTIAL_COMPARE_FLAG = 2;

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    return freeProcess && freeProcess.binding('util');
  } catch (e) {}
}());

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function arraySome(array, predicate) {
  var index = -1,
      length = array ? array.length : 0;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var Symbol = root.Symbol,
    Uint8Array = root.Uint8Array,
    propertyIsEnumerable = objectProto.propertyIsEnumerable,
    splice = arrayProto.splice;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object);

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView'),
    Map = getNative(root, 'Map'),
    Promise = getNative(root, 'Promise'),
    Set = getNative(root, 'Set'),
    WeakMap = getNative(root, 'WeakMap'),
    nativeCreate = getNative(Object, 'create');

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  return this.has(key) && delete this.__data__[key];
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  return getMapData(this, key)['delete'](key);
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  getMapData(this, key).set(key, value);
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values ? values.length : 0;

  this.__data__ = new MapCache;
  while (++index < length) {
    this.add(values[index]);
  }
}

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  this.__data__ = new ListCache(entries);
}

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
}

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  return this.__data__['delete'](key);
}

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var cache = this.__data__;
  if (cache instanceof ListCache) {
    var pairs = cache.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      return this;
    }
    cache = this.__data__ = new MapCache(pairs);
  }
  cache.set(key, value);
  return this;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  // Safari 9 makes `arguments.length` enumerable in strict mode.
  var result = (isArray(value) || isArguments(value))
    ? baseTimes(value.length, String)
    : [];

  var length = result.length,
      skipIndexes = !!length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `getTag`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  return objectToString.call(value);
}

/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {boolean} [bitmask] The bitmask of comparison flags.
 *  The bitmask may be composed of the following flags:
 *     1 - Unordered comparison
 *     2 - Partial comparison
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, customizer, bitmask, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!isObject(value) && !isObjectLike(other))) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, baseIsEqual, customizer, bitmask, stack);
}

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {number} [bitmask] The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep(object, other, equalFunc, customizer, bitmask, stack) {
  var objIsArr = isArray(object),
      othIsArr = isArray(other),
      objTag = arrayTag,
      othTag = arrayTag;

  if (!objIsArr) {
    objTag = getTag(object);
    objTag = objTag == argsTag ? objectTag : objTag;
  }
  if (!othIsArr) {
    othTag = getTag(other);
    othTag = othTag == argsTag ? objectTag : othTag;
  }
  var objIsObj = objTag == objectTag && !isHostObject(object),
      othIsObj = othTag == objectTag && !isHostObject(other),
      isSameTag = objTag == othTag;

  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack);
    return (objIsArr || isTypedArray(object))
      ? equalArrays(object, other, equalFunc, customizer, bitmask, stack)
      : equalByTag(object, other, objTag, equalFunc, customizer, bitmask, stack);
  }
  if (!(bitmask & PARTIAL_COMPARE_FLAG)) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;

      stack || (stack = new Stack);
      return equalFunc(objUnwrapped, othUnwrapped, customizer, bitmask, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack);
  return equalObjects(object, other, equalFunc, customizer, bitmask, stack);
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[objectToString.call(value)];
}

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} customizer The function to customize comparisons.
 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function equalArrays(array, other, equalFunc, customizer, bitmask, stack) {
  var isPartial = bitmask & PARTIAL_COMPARE_FLAG,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(array);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var index = -1,
      result = true,
      seen = (bitmask & UNORDERED_COMPARE_FLAG) ? new SetCache : undefined;

  stack.set(array, other);
  stack.set(other, array);

  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, arrValue, index, other, array, stack)
        : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (seen) {
      if (!arraySome(other, function(othValue, othIndex) {
            if (!seen.has(othIndex) &&
                (arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack))) {
              return seen.add(othIndex);
            }
          })) {
        result = false;
        break;
      }
    } else if (!(
          arrValue === othValue ||
            equalFunc(arrValue, othValue, customizer, bitmask, stack)
        )) {
      result = false;
      break;
    }
  }
  stack['delete'](array);
  stack['delete'](other);
  return result;
}

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} customizer The function to customize comparisons.
 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalByTag(object, other, tag, equalFunc, customizer, bitmask, stack) {
  switch (tag) {
    case dataViewTag:
      if ((object.byteLength != other.byteLength) ||
          (object.byteOffset != other.byteOffset)) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag:
      if ((object.byteLength != other.byteLength) ||
          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
        return false;
      }
      return true;

    case boolTag:
    case dateTag:
    case numberTag:
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      return eq(+object, +other);

    case errorTag:
      return object.name == other.name && object.message == other.message;

    case regexpTag:
    case stringTag:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == (other + '');

    case mapTag:
      var convert = mapToArray;

    case setTag:
      var isPartial = bitmask & PARTIAL_COMPARE_FLAG;
      convert || (convert = setToArray);

      if (object.size != other.size && !isPartial) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= UNORDERED_COMPARE_FLAG;

      // Recursively compare objects (susceptible to call stack limits).
      stack.set(object, other);
      var result = equalArrays(convert(object), convert(other), equalFunc, customizer, bitmask, stack);
      stack['delete'](object);
      return result;

    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} customizer The function to customize comparisons.
 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects(object, other, equalFunc, customizer, bitmask, stack) {
  var isPartial = bitmask & PARTIAL_COMPARE_FLAG,
      objProps = keys(object),
      objLength = objProps.length,
      othProps = keys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
      return false;
    }
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(object);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);

  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, objValue, key, other, object, stack)
        : customizer(objValue, othValue, key, object, other, stack);
    }
    // Recursively compare objects (susceptible to call stack limits).
    if (!(compared === undefined
          ? (objValue === othValue || equalFunc(objValue, othValue, customizer, bitmask, stack))
          : compared
        )) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor &&
        ('constructor' in object && 'constructor' in other) &&
        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack['delete'](object);
  stack['delete'](other);
  return result;
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11,
// for data views in Edge < 14, and promises in Node.js.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = objectToString.call(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : undefined;

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Performs a deep comparison between two values to determine if they are
 * equivalent.
 *
 * **Note:** This method supports comparing arrays, array buffers, booleans,
 * date objects, error objects, maps, numbers, `Object` objects, regexes,
 * sets, strings, symbols, and typed arrays. `Object` objects are compared
 * by their own, not inherited, enumerable properties. Functions and DOM
 * nodes are **not** supported.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.isEqual(object, other);
 * // => true
 *
 * object === other;
 * // => false
 */
function isEqual(value, other) {
  return baseIsEqual(value, other);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

module.exports = isEqual;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],8:[function(require,module,exports){
(function (global){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used to compose bitmasks for comparison styles. */
var UNORDERED_COMPARE_FLAG = 1,
    PARTIAL_COMPARE_FLAG = 2;

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0,
    MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/,
    reLeadingDot = /^\./,
    rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    return freeProcess && freeProcess.binding('util');
  } catch (e) {}
}());

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * A specialized version of `_.includes` for arrays without support for
 * specifying an index to search from.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludes(array, value) {
  var length = array ? array.length : 0;
  return !!length && baseIndexOf(array, value, 0) > -1;
}

/**
 * This function is like `arrayIncludes` except that it accepts a comparator.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @param {Function} comparator The comparator invoked per element.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludesWith(array, value, comparator) {
  var index = -1,
      length = array ? array.length : 0;

  while (++index < length) {
    if (comparator(value, array[index])) {
      return true;
    }
  }
  return false;
}

/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function arraySome(array, predicate) {
  var index = -1,
      length = array ? array.length : 0;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  if (value !== value) {
    return baseFindIndex(array, baseIsNaN, fromIndex);
  }
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.isNaN` without support for number objects.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
 */
function baseIsNaN(value) {
  return value !== value;
}

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

/**
 * Checks if a cache value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function cacheHas(cache, key) {
  return cache.has(key);
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var Symbol = root.Symbol,
    Uint8Array = root.Uint8Array,
    propertyIsEnumerable = objectProto.propertyIsEnumerable,
    splice = arrayProto.splice;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object);

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView'),
    Map = getNative(root, 'Map'),
    Promise = getNative(root, 'Promise'),
    Set = getNative(root, 'Set'),
    WeakMap = getNative(root, 'WeakMap'),
    nativeCreate = getNative(Object, 'create');

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  return this.has(key) && delete this.__data__[key];
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  return getMapData(this, key)['delete'](key);
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  getMapData(this, key).set(key, value);
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values ? values.length : 0;

  this.__data__ = new MapCache;
  while (++index < length) {
    this.add(values[index]);
  }
}

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  this.__data__ = new ListCache(entries);
}

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
}

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  return this.__data__['delete'](key);
}

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var cache = this.__data__;
  if (cache instanceof ListCache) {
    var pairs = cache.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      return this;
    }
    cache = this.__data__ = new MapCache(pairs);
  }
  cache.set(key, value);
  return this;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  // Safari 9 makes `arguments.length` enumerable in strict mode.
  var result = (isArray(value) || isArguments(value))
    ? baseTimes(value.length, String)
    : [];

  var length = result.length,
      skipIndexes = !!length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path) {
  path = isKey(path, object) ? [path] : castPath(path);

  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[toKey(path[index++])];
  }
  return (index && index == length) ? object : undefined;
}

/**
 * The base implementation of `getTag`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  return objectToString.call(value);
}

/**
 * The base implementation of `_.hasIn` without support for deep paths.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {Array|string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 */
function baseHasIn(object, key) {
  return object != null && key in Object(object);
}

/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {boolean} [bitmask] The bitmask of comparison flags.
 *  The bitmask may be composed of the following flags:
 *     1 - Unordered comparison
 *     2 - Partial comparison
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, customizer, bitmask, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!isObject(value) && !isObjectLike(other))) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, baseIsEqual, customizer, bitmask, stack);
}

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {number} [bitmask] The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep(object, other, equalFunc, customizer, bitmask, stack) {
  var objIsArr = isArray(object),
      othIsArr = isArray(other),
      objTag = arrayTag,
      othTag = arrayTag;

  if (!objIsArr) {
    objTag = getTag(object);
    objTag = objTag == argsTag ? objectTag : objTag;
  }
  if (!othIsArr) {
    othTag = getTag(other);
    othTag = othTag == argsTag ? objectTag : othTag;
  }
  var objIsObj = objTag == objectTag && !isHostObject(object),
      othIsObj = othTag == objectTag && !isHostObject(other),
      isSameTag = objTag == othTag;

  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack);
    return (objIsArr || isTypedArray(object))
      ? equalArrays(object, other, equalFunc, customizer, bitmask, stack)
      : equalByTag(object, other, objTag, equalFunc, customizer, bitmask, stack);
  }
  if (!(bitmask & PARTIAL_COMPARE_FLAG)) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;

      stack || (stack = new Stack);
      return equalFunc(objUnwrapped, othUnwrapped, customizer, bitmask, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack);
  return equalObjects(object, other, equalFunc, customizer, bitmask, stack);
}

/**
 * The base implementation of `_.isMatch` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @param {Object} source The object of property values to match.
 * @param {Array} matchData The property names, values, and compare flags to match.
 * @param {Function} [customizer] The function to customize comparisons.
 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
 */
function baseIsMatch(object, source, matchData, customizer) {
  var index = matchData.length,
      length = index,
      noCustomizer = !customizer;

  if (object == null) {
    return !length;
  }
  object = Object(object);
  while (index--) {
    var data = matchData[index];
    if ((noCustomizer && data[2])
          ? data[1] !== object[data[0]]
          : !(data[0] in object)
        ) {
      return false;
    }
  }
  while (++index < length) {
    data = matchData[index];
    var key = data[0],
        objValue = object[key],
        srcValue = data[1];

    if (noCustomizer && data[2]) {
      if (objValue === undefined && !(key in object)) {
        return false;
      }
    } else {
      var stack = new Stack;
      if (customizer) {
        var result = customizer(objValue, srcValue, key, object, source, stack);
      }
      if (!(result === undefined
            ? baseIsEqual(srcValue, objValue, customizer, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG, stack)
            : result
          )) {
        return false;
      }
    }
  }
  return true;
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[objectToString.call(value)];
}

/**
 * The base implementation of `_.iteratee`.
 *
 * @private
 * @param {*} [value=_.identity] The value to convert to an iteratee.
 * @returns {Function} Returns the iteratee.
 */
function baseIteratee(value) {
  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
  if (typeof value == 'function') {
    return value;
  }
  if (value == null) {
    return identity;
  }
  if (typeof value == 'object') {
    return isArray(value)
      ? baseMatchesProperty(value[0], value[1])
      : baseMatches(value);
  }
  return property(value);
}

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * The base implementation of `_.matches` which doesn't clone `source`.
 *
 * @private
 * @param {Object} source The object of property values to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatches(source) {
  var matchData = getMatchData(source);
  if (matchData.length == 1 && matchData[0][2]) {
    return matchesStrictComparable(matchData[0][0], matchData[0][1]);
  }
  return function(object) {
    return object === source || baseIsMatch(object, source, matchData);
  };
}

/**
 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
 *
 * @private
 * @param {string} path The path of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatchesProperty(path, srcValue) {
  if (isKey(path) && isStrictComparable(srcValue)) {
    return matchesStrictComparable(toKey(path), srcValue);
  }
  return function(object) {
    var objValue = get(object, path);
    return (objValue === undefined && objValue === srcValue)
      ? hasIn(object, path)
      : baseIsEqual(srcValue, objValue, undefined, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG);
  };
}

/**
 * A specialized version of `baseProperty` which supports deep paths.
 *
 * @private
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function basePropertyDeep(path) {
  return function(object) {
    return baseGet(object, path);
  };
}

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * The base implementation of `_.uniqBy` without support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new duplicate free array.
 */
function baseUniq(array, iteratee, comparator) {
  var index = -1,
      includes = arrayIncludes,
      length = array.length,
      isCommon = true,
      result = [],
      seen = result;

  if (comparator) {
    isCommon = false;
    includes = arrayIncludesWith;
  }
  else if (length >= LARGE_ARRAY_SIZE) {
    var set = iteratee ? null : createSet(array);
    if (set) {
      return setToArray(set);
    }
    isCommon = false;
    includes = cacheHas;
    seen = new SetCache;
  }
  else {
    seen = iteratee ? [] : result;
  }
  outer:
  while (++index < length) {
    var value = array[index],
        computed = iteratee ? iteratee(value) : value;

    value = (comparator || value !== 0) ? value : 0;
    if (isCommon && computed === computed) {
      var seenIndex = seen.length;
      while (seenIndex--) {
        if (seen[seenIndex] === computed) {
          continue outer;
        }
      }
      if (iteratee) {
        seen.push(computed);
      }
      result.push(value);
    }
    else if (!includes(seen, computed, comparator)) {
      if (seen !== result) {
        seen.push(computed);
      }
      result.push(value);
    }
  }
  return result;
}

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {Array} Returns the cast property path array.
 */
function castPath(value) {
  return isArray(value) ? value : stringToPath(value);
}

/**
 * Creates a set object of `values`.
 *
 * @private
 * @param {Array} values The values to add to the set.
 * @returns {Object} Returns the new set.
 */
var createSet = !(Set && (1 / setToArray(new Set([,-0]))[1]) == INFINITY) ? noop : function(values) {
  return new Set(values);
};

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} customizer The function to customize comparisons.
 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function equalArrays(array, other, equalFunc, customizer, bitmask, stack) {
  var isPartial = bitmask & PARTIAL_COMPARE_FLAG,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(array);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var index = -1,
      result = true,
      seen = (bitmask & UNORDERED_COMPARE_FLAG) ? new SetCache : undefined;

  stack.set(array, other);
  stack.set(other, array);

  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, arrValue, index, other, array, stack)
        : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (seen) {
      if (!arraySome(other, function(othValue, othIndex) {
            if (!seen.has(othIndex) &&
                (arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack))) {
              return seen.add(othIndex);
            }
          })) {
        result = false;
        break;
      }
    } else if (!(
          arrValue === othValue ||
            equalFunc(arrValue, othValue, customizer, bitmask, stack)
        )) {
      result = false;
      break;
    }
  }
  stack['delete'](array);
  stack['delete'](other);
  return result;
}

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} customizer The function to customize comparisons.
 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalByTag(object, other, tag, equalFunc, customizer, bitmask, stack) {
  switch (tag) {
    case dataViewTag:
      if ((object.byteLength != other.byteLength) ||
          (object.byteOffset != other.byteOffset)) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag:
      if ((object.byteLength != other.byteLength) ||
          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
        return false;
      }
      return true;

    case boolTag:
    case dateTag:
    case numberTag:
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      return eq(+object, +other);

    case errorTag:
      return object.name == other.name && object.message == other.message;

    case regexpTag:
    case stringTag:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == (other + '');

    case mapTag:
      var convert = mapToArray;

    case setTag:
      var isPartial = bitmask & PARTIAL_COMPARE_FLAG;
      convert || (convert = setToArray);

      if (object.size != other.size && !isPartial) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= UNORDERED_COMPARE_FLAG;

      // Recursively compare objects (susceptible to call stack limits).
      stack.set(object, other);
      var result = equalArrays(convert(object), convert(other), equalFunc, customizer, bitmask, stack);
      stack['delete'](object);
      return result;

    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} customizer The function to customize comparisons.
 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects(object, other, equalFunc, customizer, bitmask, stack) {
  var isPartial = bitmask & PARTIAL_COMPARE_FLAG,
      objProps = keys(object),
      objLength = objProps.length,
      othProps = keys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
      return false;
    }
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(object);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);

  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, objValue, key, other, object, stack)
        : customizer(objValue, othValue, key, object, other, stack);
    }
    // Recursively compare objects (susceptible to call stack limits).
    if (!(compared === undefined
          ? (objValue === othValue || equalFunc(objValue, othValue, customizer, bitmask, stack))
          : compared
        )) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor &&
        ('constructor' in object && 'constructor' in other) &&
        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack['delete'](object);
  stack['delete'](other);
  return result;
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the property names, values, and compare flags of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the match data of `object`.
 */
function getMatchData(object) {
  var result = keys(object),
      length = result.length;

  while (length--) {
    var key = result[length],
        value = object[key];

    result[length] = [key, value, isStrictComparable(value)];
  }
  return result;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11,
// for data views in Edge < 14, and promises in Node.js.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = objectToString.call(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : undefined;

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

/**
 * Checks if `path` exists on `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @param {Function} hasFunc The function to check properties.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 */
function hasPath(object, path, hasFunc) {
  path = isKey(path, object) ? [path] : castPath(path);

  var result,
      index = -1,
      length = path.length;

  while (++index < length) {
    var key = toKey(path[index]);
    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }
    object = object[key];
  }
  if (result) {
    return result;
  }
  var length = object ? object.length : 0;
  return !!length && isLength(length) && isIndex(key, length) &&
    (isArray(object) || isArguments(object));
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  if (isArray(value)) {
    return false;
  }
  var type = typeof value;
  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
      value == null || isSymbol(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
    (object != null && value in Object(object));
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` if suitable for strict
 *  equality comparisons, else `false`.
 */
function isStrictComparable(value) {
  return value === value && !isObject(value);
}

/**
 * A specialized version of `matchesProperty` for source values suitable
 * for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function matchesStrictComparable(key, srcValue) {
  return function(object) {
    if (object == null) {
      return false;
    }
    return object[key] === srcValue &&
      (srcValue !== undefined || (key in Object(object)));
  };
}

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
var stringToPath = memoize(function(string) {
  string = toString(string);

  var result = [];
  if (reLeadingDot.test(string)) {
    result.push('');
  }
  string.replace(rePropName, function(match, number, quote, string) {
    result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
});

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey(value) {
  if (typeof value == 'string' || isSymbol(value)) {
    return value;
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * This method is like `_.uniq` except that it accepts `iteratee` which is
 * invoked for each element in `array` to generate the criterion by which
 * uniqueness is computed. The iteratee is invoked with one argument: (value).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {Function} [iteratee=_.identity]
 *  The iteratee invoked per element.
 * @returns {Array} Returns the new duplicate free array.
 * @example
 *
 * _.uniqBy([2.1, 1.2, 2.3], Math.floor);
 * // => [2.1, 1.2]
 *
 * // The `_.property` iteratee shorthand.
 * _.uniqBy([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
 * // => [{ 'x': 1 }, { 'x': 2 }]
 */
function uniqBy(array, iteratee) {
  return (array && array.length)
    ? baseUniq(array, baseIteratee(iteratee, 2))
    : [];
}

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize(func, resolver) {
  if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result);
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache);
  return memoized;
}

// Assign cache to `_.memoize`.
memoize.Cache = MapCache;

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */
function get(object, path, defaultValue) {
  var result = object == null ? undefined : baseGet(object, path);
  return result === undefined ? defaultValue : result;
}

/**
 * Checks if `path` is a direct or inherited property of `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 * @example
 *
 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
 *
 * _.hasIn(object, 'a');
 * // => true
 *
 * _.hasIn(object, 'a.b');
 * // => true
 *
 * _.hasIn(object, ['a', 'b']);
 * // => true
 *
 * _.hasIn(object, 'b');
 * // => false
 */
function hasIn(object, path) {
  return object != null && hasPath(object, path, baseHasIn);
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

/**
 * This method returns `undefined`.
 *
 * @static
 * @memberOf _
 * @since 2.3.0
 * @category Util
 * @example
 *
 * _.times(2, _.noop);
 * // => [undefined, undefined]
 */
function noop() {
  // No operation performed.
}

/**
 * Creates a function that returns the value at `path` of a given object.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 * @example
 *
 * var objects = [
 *   { 'a': { 'b': 2 } },
 *   { 'a': { 'b': 1 } }
 * ];
 *
 * _.map(objects, _.property('a.b'));
 * // => [2, 1]
 *
 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
 * // => [1, 2]
 */
function property(path) {
  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
}

module.exports = uniqBy;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],9:[function(require,module,exports){
(function (global){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to generate unique IDs. */
var idCounter = 0;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var Symbol = root.Symbol;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

/**
 * Generates a unique ID. If `prefix` is given, the ID is appended to it.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {string} [prefix=''] The value to prefix the ID with.
 * @returns {string} Returns the unique ID.
 * @example
 *
 * _.uniqueId('contact_');
 * // => 'contact_104'
 *
 * _.uniqueId();
 * // => '105'
 */
function uniqueId(prefix) {
  var id = ++idCounter;
  return toString(prefix) + id;
}

module.exports = uniqueId;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],10:[function(require,module,exports){
module.exports=function(x){return (typeof x==='undefined')||(x === null)}

},{}],11:[function(require,module,exports){
'use strict';
module.exports = Number.isNaN || function (x) {
	return x !== x;
};

},{}],12:[function(require,module,exports){
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var t = _interopDefault(require('should-type'));

function format(msg) {
  var args = arguments;
  for (var i = 1, l = args.length; i < l; i++) {
    msg = msg.replace(/%s/, args[i]);
  }
  return msg;
}

var hasOwnProperty = Object.prototype.hasOwnProperty;

function EqualityFail(a, b, reason, path) {
  this.a = a;
  this.b = b;
  this.reason = reason;
  this.path = path;
}

function typeToString(tp) {
  return tp.type + (tp.cls ? '(' + tp.cls + (tp.sub ? ' ' + tp.sub : '') + ')' : '');
}

var  PLUS_0_AND_MINUS_0 = '+0 is not equal to -0';
var  DIFFERENT_TYPES = 'A has type %s and B has type %s';
var  EQUALITY = 'A is not equal to B';
var  EQUALITY_PROTOTYPE = 'A and B have different prototypes';
var  WRAPPED_VALUE = 'A wrapped value is not equal to B wrapped value';
var  FUNCTION_SOURCES = 'function A is not equal to B by source code value (via .toString call)';
var  MISSING_KEY = '%s has no key %s';
var  SET_MAP_MISSING_KEY = 'Set/Map missing key %s';


var DEFAULT_OPTIONS = {
  checkProtoEql: true,
  checkSubType: true,
  plusZeroAndMinusZeroEqual: true,
  collectAllFails: false
};

function setBooleanDefault(property, obj, opts, defaults) {
  obj[property] = typeof opts[property] !== 'boolean' ? defaults[property] : opts[property];
}

var METHOD_PREFIX = '_check_';

function EQ(opts, a, b, path) {
  opts = opts || {};

  setBooleanDefault('checkProtoEql', this, opts, DEFAULT_OPTIONS);
  setBooleanDefault('plusZeroAndMinusZeroEqual', this, opts, DEFAULT_OPTIONS);
  setBooleanDefault('checkSubType', this, opts, DEFAULT_OPTIONS);
  setBooleanDefault('collectAllFails', this, opts, DEFAULT_OPTIONS);

  this.a = a;
  this.b = b;

  this._meet = opts._meet || [];

  this.fails = opts.fails || [];

  this.path = path || [];
}

function ShortcutError(fail) {
  this.name = 'ShortcutError';
  this.message = 'fail fast';
  this.fail = fail;
}

ShortcutError.prototype = Object.create(Error.prototype);

EQ.checkStrictEquality = function(a, b) {
  this.collectFail(a !== b, EQUALITY);
};

EQ.add = function add(type, cls, sub, f) {
  var args = Array.prototype.slice.call(arguments);
  f = args.pop();
  EQ.prototype[METHOD_PREFIX + args.join('_')] = f;
};

EQ.prototype = {
  check: function() {
    try {
      this.check0();
    } catch (e) {
      if (e instanceof ShortcutError) {
        return [e.fail];
      }
      throw e;
    }
    return this.fails;
  },

  check0: function() {
    var a = this.a;
    var b = this.b;

    // equal a and b exit early
    if (a === b) {
      // check for +0 !== -0;
      return this.collectFail(a === 0 && (1 / a !== 1 / b) && !this.plusZeroAndMinusZeroEqual, PLUS_0_AND_MINUS_0);
    }

    var typeA = t(a);
    var typeB = t(b);

    // if objects has different types they are not equal
    if (typeA.type !== typeB.type || typeA.cls !== typeB.cls || typeA.sub !== typeB.sub) {
      return this.collectFail(true, format(DIFFERENT_TYPES, typeToString(typeA), typeToString(typeB)));
    }

    // as types the same checks type specific things
    var name1 = typeA.type, name2 = typeA.type;
    if (typeA.cls) {
      name1 += '_' + typeA.cls;
      name2 += '_' + typeA.cls;
    }
    if (typeA.sub) {
      name2 += '_' + typeA.sub;
    }

    var f = this[METHOD_PREFIX + name2] || this[METHOD_PREFIX + name1] || this[METHOD_PREFIX + typeA.type] || this.defaultCheck;

    f.call(this, this.a, this.b);
  },

  collectFail: function(comparison, reason, showReason) {
    if (comparison) {
      var res = new EqualityFail(this.a, this.b, reason, this.path);
      res.showReason = !!showReason;

      this.fails.push(res);

      if (!this.collectAllFails) {
        throw new ShortcutError(res);
      }
    }
  },

  checkPlainObjectsEquality: function(a, b) {
    // compare deep objects and arrays
    // stacks contain references only
    //
    var meet = this._meet;
    var m = this._meet.length;
    while (m--) {
      var st = meet[m];
      if (st[0] === a && st[1] === b) {
        return;
      }
    }

    // add `a` and `b` to the stack of traversed objects
    meet.push([a, b]);

    // TODO maybe something else like getOwnPropertyNames
    var key;
    for (key in b) {
      if (hasOwnProperty.call(b, key)) {
        if (hasOwnProperty.call(a, key)) {
          this.checkPropertyEquality(key);
        } else {
          this.collectFail(true, format(MISSING_KEY, 'A', key));
        }
      }
    }

    // ensure both objects have the same number of properties
    for (key in a) {
      if (hasOwnProperty.call(a, key)) {
        this.collectFail(!hasOwnProperty.call(b, key), format(MISSING_KEY, 'B', key));
      }
    }

    meet.pop();

    if (this.checkProtoEql) {
      //TODO should i check prototypes for === or use eq?
      this.collectFail(Object.getPrototypeOf(a) !== Object.getPrototypeOf(b), EQUALITY_PROTOTYPE, true);
    }

  },

  checkPropertyEquality: function(propertyName) {
    var _eq = new EQ(this, this.a[propertyName], this.b[propertyName], this.path.concat([propertyName]));
    _eq.check0();
  },

  defaultCheck: EQ.checkStrictEquality
};


EQ.add(t.NUMBER, function(a, b) {
  this.collectFail((a !== a && b === b) || (b !== b && a === a) || (a !== b && a === a && b === b), EQUALITY);
});

[t.SYMBOL, t.BOOLEAN, t.STRING].forEach(function(tp) {
  EQ.add(tp, EQ.checkStrictEquality);
});

EQ.add(t.FUNCTION, function(a, b) {
  // functions are compared by their source code
  this.collectFail(a.toString() !== b.toString(), FUNCTION_SOURCES);
  // check user properties
  this.checkPlainObjectsEquality(a, b);
});

EQ.add(t.OBJECT, t.REGEXP, function(a, b) {
  // check regexp flags
  var flags = ['source', 'global', 'multiline', 'lastIndex', 'ignoreCase', 'sticky', 'unicode'];
  while (flags.length) {
    this.checkPropertyEquality(flags.shift());
  }
  // check user properties
  this.checkPlainObjectsEquality(a, b);
});

EQ.add(t.OBJECT, t.DATE, function(a, b) {
  //check by timestamp only (using .valueOf)
  this.collectFail(+a !== +b, EQUALITY);
  // check user properties
  this.checkPlainObjectsEquality(a, b);
});

[t.NUMBER, t.BOOLEAN, t.STRING].forEach(function(tp) {
  EQ.add(t.OBJECT, tp, function(a, b) {
    //primitive type wrappers
    this.collectFail(a.valueOf() !== b.valueOf(), WRAPPED_VALUE);
    // check user properties
    this.checkPlainObjectsEquality(a, b);
  });
});

EQ.add(t.OBJECT, function(a, b) {
  this.checkPlainObjectsEquality(a, b);
});

[t.ARRAY, t.ARGUMENTS, t.TYPED_ARRAY].forEach(function(tp) {
  EQ.add(t.OBJECT, tp, function(a, b) {
    this.checkPropertyEquality('length');

    this.checkPlainObjectsEquality(a, b);
  });
});

EQ.add(t.OBJECT, t.ARRAY_BUFFER, function(a, b) {
  this.checkPropertyEquality('byteLength');

  this.checkPlainObjectsEquality(a, b);
});

EQ.add(t.OBJECT, t.ERROR, function(a, b) {
  this.checkPropertyEquality('name');
  this.checkPropertyEquality('message');

  this.checkPlainObjectsEquality(a, b);
});

EQ.add(t.OBJECT, t.BUFFER, function(a) {
  this.checkPropertyEquality('length');

  var l = a.length;
  while (l--) {
    this.checkPropertyEquality(l);
  }

  //we do not check for user properties because
  //node Buffer have some strange hidden properties
});

[t.MAP, t.SET, t.WEAK_MAP, t.WEAK_SET].forEach(function(tp) {
  EQ.add(t.OBJECT, tp, function(a, b) {
    this._meet.push([a, b]);

    var iteratorA = a.entries();
    for (var nextA = iteratorA.next(); !nextA.done; nextA = iteratorA.next()) {

      var iteratorB = b.entries();
      var keyFound = false;
      for (var nextB = iteratorB.next(); !nextB.done; nextB = iteratorB.next()) {
        // try to check keys first
        var r = eq(nextA.value[0], nextB.value[0], { collectAllFails: false, _meet: this._meet });

        if (r.length === 0) {
          keyFound = true;

          // check values also
          eq(nextA.value[1], nextB.value[1], this);
        }
      }

      if (!keyFound) {
        // no such key at all
        this.collectFail(true, format(SET_MAP_MISSING_KEY, nextA.value[0]));
      }
    }

    this._meet.pop();

    this.checkPlainObjectsEquality(a, b);
  });
});


function eq(a, b, opts) {
  return new EQ(opts, a, b).check();
}

eq.EQ = EQ;

module.exports = eq;
},{"should-type":15}],13:[function(require,module,exports){
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var t = _interopDefault(require('should-type'));
var shouldTypeAdaptors = require('should-type-adaptors');

function looksLikeANumber(n) {
  return !!n.match(/\d+/);
}

function keyCompare(a, b) {
  var aNum = looksLikeANumber(a);
  var bNum = looksLikeANumber(b);
  if (aNum && bNum) {
    return 1*a - 1*b;
  } else if (aNum && !bNum) {
    return -1;
  } else if (!aNum && bNum) {
    return 1;
  } else {
    return a.localeCompare(b);
  }
}

function genKeysFunc(f) {
  return function(value) {
    var k = f(value);
    k.sort(keyCompare);
    return k;
  };
}

function Formatter(opts) {
  opts = opts || {};

  this.seen = [];

  var keysFunc;
  if (typeof opts.keysFunc === 'function') {
    keysFunc = opts.keysFunc;
  } else if (opts.keys === false) {
    keysFunc = Object.getOwnPropertyNames;
  } else {
    keysFunc = Object.keys;
  }

  this.getKeys = genKeysFunc(keysFunc);

  this.maxLineLength = typeof opts.maxLineLength === 'number' ? opts.maxLineLength : 60;
  this.propSep = opts.propSep || ',';

  this.isUTCdate = !!opts.isUTCdate;
}



Formatter.prototype = {
  constructor: Formatter,

  format: function(value) {
    var tp = t(value);

    if (this.alreadySeen(value)) {
      return '[Circular]';
    }

    var tries = tp.toTryTypes();
    var f = this.defaultFormat;
    while (tries.length) {
      var toTry = tries.shift();
      var name = Formatter.formatterFunctionName(toTry);
      if (this[name]) {
        f = this[name];
        break;
      }
    }
    return f.call(this, value).trim();
  },

  defaultFormat: function(obj) {
    return String(obj);
  },

  alreadySeen: function(value) {
    return this.seen.indexOf(value) >= 0;
  }

};

Formatter.addType = function addType(tp, f) {
  Formatter.prototype[Formatter.formatterFunctionName(tp)] = f;
};

Formatter.formatterFunctionName = function formatterFunctionName(tp) {
  return '_format_' + tp.toString('_');
};

var EOL = '\n';

function indent(v, indentation) {
  return v
    .split(EOL)
    .map(function(vv) {
      return indentation + vv;
    })
    .join(EOL);
}

function pad(str, value, filler) {
  str = String(str);
  var isRight = false;

  if (value < 0) {
    isRight = true;
    value = -value;
  }

  if (str.length < value) {
    var padding = new Array(value - str.length + 1).join(filler);
    return isRight ? str + padding : padding + str;
  } else {
    return str;
  }
}

function pad0(str, value) {
  return pad(str, value, '0');
}

var functionNameRE = /^\s*function\s*(\S*)\s*\(/;

function functionName(f) {
  if (f.name) {
    return f.name;
  }
  var matches = f.toString().match(functionNameRE);
  if (matches === null) {
    // `functionNameRE` doesn't match arrow functions.
    return '';
  }
  var name = matches[1];
  return name;
}

function constructorName(obj) {
  while (obj) {
    var descriptor = Object.getOwnPropertyDescriptor(obj, 'constructor');
    if (descriptor !== undefined &&  typeof descriptor.value === 'function') {
      var name = functionName(descriptor.value);
      if (name !== '') {
        return name;
      }
    }

    obj = Object.getPrototypeOf(obj);
  }
}

var INDENT = '  ';

function addSpaces(str) {
  return indent(str, INDENT);
}

function typeAdaptorForEachFormat(obj, opts) {
  opts = opts || {};
  var filterKey = opts.filterKey || function() { return true; };

  var formatKey = opts.formatKey || this.format;
  var formatValue = opts.formatValue || this.format;

  var keyValueSep = typeof opts.keyValueSep !== 'undefined' ? opts.keyValueSep : ': ';

  this.seen.push(obj);

  var formatLength = 0;
  var pairs = [];

  shouldTypeAdaptors.forEach(obj, function(value, key) {
    if (!filterKey(key)) {
      return;
    }

    var formattedKey = formatKey.call(this, key);
    var formattedValue = formatValue.call(this, value, key);

    var pair = formattedKey ? (formattedKey + keyValueSep + formattedValue) : formattedValue;

    formatLength += pair.length;
    pairs.push(pair);
  }, this);

  this.seen.pop();

  (opts.additionalKeys || []).forEach(function(keyValue) {
    var pair = keyValue[0] + keyValueSep + this.format(keyValue[1]);
    formatLength += pair.length;
    pairs.push(pair);
  }, this);

  var prefix = opts.prefix || constructorName(obj) || '';
  if (prefix.length > 0) {
    prefix += ' ';
  }

  var lbracket, rbracket;
  if (Array.isArray(opts.brackets)) {
    lbracket = opts.brackets[0];
    rbracket = opts.brackets[1];
  } else {
    lbracket = '{';
    rbracket = '}';
  }

  var rootValue = opts.value || '';

  if (pairs.length === 0) {
    return rootValue || (prefix + lbracket + rbracket);
  }

  if (formatLength <= this.maxLineLength) {
    return prefix + lbracket + ' ' + (rootValue ? rootValue + ' ' : '') + pairs.join(this.propSep + ' ') + ' ' + rbracket;
  } else {
    return prefix + lbracket + '\n' + (rootValue ? '  ' + rootValue + '\n' : '') + pairs.map(addSpaces).join(this.propSep + '\n') + '\n' + rbracket;
  }
}

function formatPlainObjectKey(key) {
  return typeof key === 'string' && key.match(/^[a-zA-Z_$][a-zA-Z_$0-9]*$/) ? key : this.format(key);
}

function getPropertyDescriptor(obj, key) {
  var desc;
  try {
    desc = Object.getOwnPropertyDescriptor(obj, key) || { value: obj[key] };
  } catch (e) {
    desc = { value: e };
  }
  return desc;
}

function formatPlainObjectValue(obj, key) {
  var desc = getPropertyDescriptor(obj, key);
  if (desc.get && desc.set) {
    return '[Getter/Setter]';
  }
  if (desc.get) {
    return '[Getter]';
  }
  if (desc.set) {
    return '[Setter]';
  }

  return this.format(desc.value);
}

function formatPlainObject(obj, opts) {
  opts = opts || {};
  opts.keyValueSep = ': ';
  opts.formatKey = opts.formatKey || formatPlainObjectKey;
  opts.formatValue = opts.formatValue || function(value, key) {
    return formatPlainObjectValue.call(this, obj, key);
  };
  return typeAdaptorForEachFormat.call(this, obj, opts);
}

function formatWrapper1(value) {
  return formatPlainObject.call(this, value, {
    additionalKeys: [['[[PrimitiveValue]]', value.valueOf()]]
  });
}


function formatWrapper2(value) {
  var realValue = value.valueOf();

  return formatPlainObject.call(this, value, {
    filterKey: function(key) {
      //skip useless indexed properties
      return !(key.match(/\d+/) && parseInt(key, 10) < realValue.length);
    },
    additionalKeys: [['[[PrimitiveValue]]', realValue]]
  });
}

function formatRegExp(value) {
  return formatPlainObject.call(this, value, {
    value: String(value)
  });
}

function formatFunction(value) {
  return formatPlainObject.call(this, value, {
    prefix: 'Function',
    additionalKeys: [['name', functionName(value)]]
  });
}

function formatArray(value) {
  return formatPlainObject.call(this, value, {
    formatKey: function(key) {
      if (!key.match(/\d+/)) {
        return formatPlainObjectKey.call(this, key);
      }
    },
    brackets: ['[', ']']
  });
}

function formatArguments(value) {
  return formatPlainObject.call(this, value, {
    formatKey: function(key) {
      if (!key.match(/\d+/)) {
        return formatPlainObjectKey.call(this, key);
      }
    },
    brackets: ['[', ']'],
    prefix: 'Arguments'
  });
}

function _formatDate(value, isUTC) {
  var prefix = isUTC ? 'UTC' : '';

  var date = value['get' + prefix + 'FullYear']() +
    '-' +
    pad0(value['get' + prefix + 'Month']() + 1, 2) +
    '-' +
    pad0(value['get' + prefix + 'Date'](), 2);

  var time = pad0(value['get' + prefix + 'Hours'](), 2) +
    ':' +
    pad0(value['get' + prefix + 'Minutes'](), 2) +
    ':' +
    pad0(value['get' + prefix + 'Seconds'](), 2) +
    '.' +
    pad0(value['get' + prefix + 'Milliseconds'](), 3);

  var to = value.getTimezoneOffset();
  var absTo = Math.abs(to);
  var hours = Math.floor(absTo / 60);
  var minutes = absTo - hours * 60;
  var tzFormat = (to < 0 ? '+' : '-') + pad0(hours, 2) + pad0(minutes, 2);

  return date + ' ' + time + (isUTC ? '' : ' ' + tzFormat);
}

function formatDate(value) {
  return formatPlainObject.call(this, value, { value: _formatDate(value, this.isUTCdate) });
}

function formatError(value) {
  return formatPlainObject.call(this, value, {
    prefix: value.name,
    additionalKeys: [['message', value.message]]
  });
}

function generateFormatForNumberArray(lengthProp, name, padding) {
  return function(value) {
    var max = this.byteArrayMaxLength || 50;
    var length = value[lengthProp];
    var formattedValues = [];
    var len = 0;
    for (var i = 0; i < max && i < length; i++) {
      var b = value[i] || 0;
      var v = pad0(b.toString(16), padding);
      len += v.length;
      formattedValues.push(v);
    }
    var prefix = value.constructor.name || name || '';
    if (prefix) {
      prefix += ' ';
    }

    if (formattedValues.length === 0) {
      return prefix + '[]';
    }

    if (len <= this.maxLineLength) {
      return prefix + '[ ' + formattedValues.join(this.propSep + ' ') + ' ' + ']';
    } else {
      return prefix + '[\n' + formattedValues.map(addSpaces).join(this.propSep + '\n') + '\n' + ']';
    }
  };
}

function formatMap(obj) {
  return typeAdaptorForEachFormat.call(this, obj, {
    keyValueSep: ' => '
  });
}

function formatSet(obj) {
  return typeAdaptorForEachFormat.call(this, obj, {
    keyValueSep: '',
    formatKey: function() { return ''; }
  });
}

function genSimdVectorFormat(constructorName, length) {
  return function(value) {
    var Constructor = value.constructor;
    var extractLane = Constructor.extractLane;

    var len = 0;
    var props = [];

    for (var i = 0; i < length; i ++) {
      var key = this.format(extractLane(value, i));
      len += key.length;
      props.push(key);
    }

    if (len <= this.maxLineLength) {
      return constructorName + ' [ ' + props.join(this.propSep + ' ') + ' ]';
    } else {
      return constructorName + ' [\n' + props.map(addSpaces).join(this.propSep + '\n') + '\n' + ']';
    }
  };
}

function defaultFormat(value, opts) {
  return new Formatter(opts).format(value);
}

defaultFormat.Formatter = Formatter;
defaultFormat.addSpaces = addSpaces;
defaultFormat.pad0 = pad0;
defaultFormat.functionName = functionName;
defaultFormat.constructorName = constructorName;
defaultFormat.formatPlainObjectKey = formatPlainObjectKey;
defaultFormat.typeAdaptorForEachFormat = typeAdaptorForEachFormat;
// adding primitive types
Formatter.addType(new t.Type(t.UNDEFINED), function() {
  return 'undefined';
});
Formatter.addType(new t.Type(t.NULL), function() {
  return 'null';
});
Formatter.addType(new t.Type(t.BOOLEAN), function(value) {
  return value ? 'true': 'false';
});
Formatter.addType(new t.Type(t.SYMBOL), function(value) {
  return value.toString();
});
Formatter.addType(new t.Type(t.NUMBER), function(value) {
  if (value === 0 && 1 / value < 0) {
    return '-0';
  }
  return String(value);
});

Formatter.addType(new t.Type(t.STRING), function(value) {
  return '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
      .replace(/'/g, "\\'")
      .replace(/\\"/g, '"') + '\'';
});

Formatter.addType(new t.Type(t.FUNCTION), formatFunction);

// plain object
Formatter.addType(new t.Type(t.OBJECT), formatPlainObject);

// type wrappers
Formatter.addType(new t.Type(t.OBJECT, t.NUMBER), formatWrapper1);
Formatter.addType(new t.Type(t.OBJECT, t.BOOLEAN), formatWrapper1);
Formatter.addType(new t.Type(t.OBJECT, t.STRING), formatWrapper2);

Formatter.addType(new t.Type(t.OBJECT, t.REGEXP), formatRegExp);
Formatter.addType(new t.Type(t.OBJECT, t.ARRAY), formatArray);
Formatter.addType(new t.Type(t.OBJECT, t.ARGUMENTS), formatArguments);
Formatter.addType(new t.Type(t.OBJECT, t.DATE), formatDate);
Formatter.addType(new t.Type(t.OBJECT, t.ERROR), formatError);
Formatter.addType(new t.Type(t.OBJECT, t.SET), formatSet);
Formatter.addType(new t.Type(t.OBJECT, t.MAP), formatMap);
Formatter.addType(new t.Type(t.OBJECT, t.WEAK_MAP), formatMap);
Formatter.addType(new t.Type(t.OBJECT, t.WEAK_SET), formatSet);

Formatter.addType(new t.Type(t.OBJECT, t.BUFFER), generateFormatForNumberArray('length', 'Buffer', 2));

Formatter.addType(new t.Type(t.OBJECT, t.ARRAY_BUFFER), generateFormatForNumberArray('byteLength', 'ArrayBuffer', 2));

Formatter.addType(new t.Type(t.OBJECT, t.TYPED_ARRAY, 'int8'), generateFormatForNumberArray('length', 'Int8Array', 2));
Formatter.addType(new t.Type(t.OBJECT, t.TYPED_ARRAY, 'uint8'), generateFormatForNumberArray('length', 'Uint8Array', 2));
Formatter.addType(new t.Type(t.OBJECT, t.TYPED_ARRAY, 'uint8clamped'), generateFormatForNumberArray('length', 'Uint8ClampedArray', 2));

Formatter.addType(new t.Type(t.OBJECT, t.TYPED_ARRAY, 'int16'), generateFormatForNumberArray('length', 'Int16Array', 4));
Formatter.addType(new t.Type(t.OBJECT, t.TYPED_ARRAY, 'uint16'), generateFormatForNumberArray('length', 'Uint16Array', 4));

Formatter.addType(new t.Type(t.OBJECT, t.TYPED_ARRAY, 'int32'), generateFormatForNumberArray('length', 'Int32Array', 8));
Formatter.addType(new t.Type(t.OBJECT, t.TYPED_ARRAY, 'uint32'), generateFormatForNumberArray('length', 'Uint32Array', 8));

Formatter.addType(new t.Type(t.OBJECT, t.SIMD, 'bool16x8'), genSimdVectorFormat('Bool16x8', 8));
Formatter.addType(new t.Type(t.OBJECT, t.SIMD, 'bool32x4'), genSimdVectorFormat('Bool32x4', 4));
Formatter.addType(new t.Type(t.OBJECT, t.SIMD, 'bool8x16'), genSimdVectorFormat('Bool8x16', 16));
Formatter.addType(new t.Type(t.OBJECT, t.SIMD, 'float32x4'), genSimdVectorFormat('Float32x4', 4));
Formatter.addType(new t.Type(t.OBJECT, t.SIMD, 'int16x8'), genSimdVectorFormat('Int16x8', 8));
Formatter.addType(new t.Type(t.OBJECT, t.SIMD, 'int32x4'), genSimdVectorFormat('Int32x4', 4));
Formatter.addType(new t.Type(t.OBJECT, t.SIMD, 'int8x16'), genSimdVectorFormat('Int8x16', 16));
Formatter.addType(new t.Type(t.OBJECT, t.SIMD, 'uint16x8'), genSimdVectorFormat('Uint16x8', 8));
Formatter.addType(new t.Type(t.OBJECT, t.SIMD, 'uint32x4'), genSimdVectorFormat('Uint32x4', 4));
Formatter.addType(new t.Type(t.OBJECT, t.SIMD, 'uint8x16'), genSimdVectorFormat('Uint8x16', 16));


Formatter.addType(new t.Type(t.OBJECT, t.PROMISE), function() {
  return '[Promise]';//TODO it could be nice to inspect its state and value
});

Formatter.addType(new t.Type(t.OBJECT, t.XHR), function() {
  return '[XMLHttpRequest]';//TODO it could be nice to inspect its state
});

Formatter.addType(new t.Type(t.OBJECT, t.HTML_ELEMENT), function(value) {
  return value.outerHTML;
});

Formatter.addType(new t.Type(t.OBJECT, t.HTML_ELEMENT, '#text'), function(value) {
  return value.nodeValue;
});

Formatter.addType(new t.Type(t.OBJECT, t.HTML_ELEMENT, '#document'), function(value) {
  return value.documentElement.outerHTML;
});

Formatter.addType(new t.Type(t.OBJECT, t.HOST), function() {
  return '[Host]';
});

module.exports = defaultFormat;
},{"should-type":15,"should-type-adaptors":14}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var shouldUtil = require('should-util');
var t = _interopDefault(require('should-type'));

// TODO in future add generators instead of forEach and iterator implementation


function ObjectIterator(obj) {
  this._obj = obj;
}

ObjectIterator.prototype = {
  __shouldIterator__: true, // special marker

  next: function() {
    if (this._done) {
      throw new Error('Iterator already reached the end');
    }

    if (!this._keys) {
      this._keys = Object.keys(this._obj);
      this._index = 0;
    }

    var key = this._keys[this._index];
    this._done = this._index === this._keys.length;
    this._index += 1;

    return {
      value: this._done ? void 0: [key, this._obj[key]],
      done: this._done
    };
  }
};

if (typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol') {
  ObjectIterator.prototype[Symbol.iterator] = function() {
    return this;
  };
}


function TypeAdaptorStorage() {
  this._typeAdaptors = [];
  this._iterableTypes = {};
}

TypeAdaptorStorage.prototype = {
  add: function(type, cls, sub, adaptor) {
    return this.addType(new t.Type(type, cls, sub), adaptor);
  },

  addType: function(type, adaptor) {
    this._typeAdaptors[type.toString()] = adaptor;
  },

  getAdaptor: function(tp, funcName) {
    var tries = tp.toTryTypes();
    while (tries.length) {
      var toTry = tries.shift();
      var ad = this._typeAdaptors[toTry];
      if (ad && ad[funcName]) {
        return ad[funcName];
      }
    }
  },

  requireAdaptor: function(tp, funcName) {
    var a = this.getAdaptor(tp, funcName);
    if (!a) {
      throw new Error('There is no type adaptor `' + funcName + '` for ' + tp.toString());
    }
    return a;
  },

  addIterableType: function(tp) {
    this._iterableTypes[tp.toString()] = true;
  },

  isIterableType: function(tp) {
    return !!this._iterableTypes[tp.toString()];
  }
};

var defaultTypeAdaptorStorage = new TypeAdaptorStorage();

var objectAdaptor = {
  forEach: function(obj, f, context) {
    for (var prop in obj) {
      if (shouldUtil.hasOwnProperty(obj, prop) && shouldUtil.propertyIsEnumerable(obj, prop)) {
        if (f.call(context, obj[prop], prop, obj) === false) {
          return;
        }
      }
    }
  },

  has: function(obj, prop) {
    return shouldUtil.hasOwnProperty(obj, prop);
  },

  get: function(obj, prop) {
    return obj[prop];
  },

  iterator: function(obj) {
    return new ObjectIterator(obj);
  }
};

// default for objects
defaultTypeAdaptorStorage.addType(new t.Type(t.OBJECT), objectAdaptor);
defaultTypeAdaptorStorage.addType(new t.Type(t.FUNCTION), objectAdaptor);

var mapAdaptor = {
  has: function(obj, key) {
    return obj.has(key);
  },

  get: function(obj, key) {
    return obj.get(key);
  },

  forEach: function(obj, f, context) {
    var iter = obj.entries();
    forEach(iter, function(value) {
      return f.call(context, value[1], value[0], obj);
    });
  },

  size: function(obj) {
    return obj.size;
  },

  isEmpty: function(obj) {
    return obj.size === 0;
  },

  iterator: function(obj) {
    return obj.entries();
  }
};

var setAdaptor = shouldUtil.merge({}, mapAdaptor);
setAdaptor.get = function(obj, key) {
  if (obj.has(key)) {
    return key;
  }
};

defaultTypeAdaptorStorage.addType(new t.Type(t.OBJECT, t.MAP), mapAdaptor);
defaultTypeAdaptorStorage.addType(new t.Type(t.OBJECT, t.SET), setAdaptor);
defaultTypeAdaptorStorage.addType(new t.Type(t.OBJECT, t.WEAK_SET), setAdaptor);
defaultTypeAdaptorStorage.addType(new t.Type(t.OBJECT, t.WEAK_MAP), mapAdaptor);

defaultTypeAdaptorStorage.addType(new t.Type(t.STRING), {
  isEmpty: function(obj) {
    return obj === '';
  },

  size: function(obj) {
    return obj.length;
  }
});

defaultTypeAdaptorStorage.addIterableType(new t.Type(t.OBJECT, t.ARRAY));
defaultTypeAdaptorStorage.addIterableType(new t.Type(t.OBJECT, t.ARGUMENTS));

function forEach(obj, f, context) {
  if (shouldUtil.isGeneratorFunction(obj)) {
    return forEach(obj(), f, context);
  } else if (shouldUtil.isIterator(obj)) {
    var value = obj.next();
    while (!value.done) {
      if (f.call(context, value.value, 'value', obj) === false) {
        return;
      }
      value = obj.next();
    }
  } else {
    var type = t(obj);
    var func = defaultTypeAdaptorStorage.requireAdaptor(type, 'forEach');
    func(obj, f, context);
  }
}


function size(obj) {
  var type = t(obj);
  var func = defaultTypeAdaptorStorage.getAdaptor(type, 'size');
  if (func) {
    return func(obj);
  } else {
    var len = 0;
    forEach(obj, function() {
      len += 1;
    });
    return len;
  }
}

function isEmpty(obj) {
  var type = t(obj);
  var func = defaultTypeAdaptorStorage.getAdaptor(type, 'isEmpty');
  if (func) {
    return func(obj);
  } else {
    var res = true;
    forEach(obj, function() {
      res = false;
      return false;
    });
    return res;
  }
}

// return boolean if obj has such 'key'
function has(obj, key) {
  var type = t(obj);
  var func = defaultTypeAdaptorStorage.requireAdaptor(type, 'has');
  return func(obj, key);
}

// return value for given key
function get(obj, key) {
  var type = t(obj);
  var func = defaultTypeAdaptorStorage.requireAdaptor(type, 'get');
  return func(obj, key);
}

function reduce(obj, f, initialValue) {
  var res = initialValue;
  forEach(obj, function(value, key) {
    res = f(res, value, key, obj);
  });
  return res;
}

function some(obj, f, context) {
  var res = false;
  forEach(obj, function(value, key) {
    if (f.call(context, value, key, obj)) {
      res = true;
      return false;
    }
  }, context);
  return res;
}

function every(obj, f, context) {
  var res = true;
  forEach(obj, function(value, key) {
    if (!f.call(context, value, key, obj)) {
      res = false;
      return false;
    }
  }, context);
  return res;
}

function isIterable(obj) {
  return defaultTypeAdaptorStorage.isIterableType(t(obj));
}

function iterator(obj) {
  return defaultTypeAdaptorStorage.requireAdaptor(t(obj), 'iterator')(obj);
}

exports.defaultTypeAdaptorStorage = defaultTypeAdaptorStorage;
exports.forEach = forEach;
exports.size = size;
exports.isEmpty = isEmpty;
exports.has = has;
exports.get = get;
exports.reduce = reduce;
exports.some = some;
exports.every = every;
exports.isIterable = isIterable;
exports.iterator = iterator;
},{"should-type":15,"should-util":16}],15:[function(require,module,exports){
(function (Buffer){
'use strict';

var types = {
  NUMBER: 'number',
  UNDEFINED: 'undefined',
  STRING: 'string',
  BOOLEAN: 'boolean',
  OBJECT: 'object',
  FUNCTION: 'function',
  NULL: 'null',
  ARRAY: 'array',
  REGEXP: 'regexp',
  DATE: 'date',
  ERROR: 'error',
  ARGUMENTS: 'arguments',
  SYMBOL: 'symbol',
  ARRAY_BUFFER: 'array-buffer',
  TYPED_ARRAY: 'typed-array',
  DATA_VIEW: 'data-view',
  MAP: 'map',
  SET: 'set',
  WEAK_SET: 'weak-set',
  WEAK_MAP: 'weak-map',
  PROMISE: 'promise',

// node buffer
  BUFFER: 'buffer',

// dom html element
  HTML_ELEMENT: 'html-element',
  HTML_ELEMENT_TEXT: 'html-element-text',
  DOCUMENT: 'document',
  WINDOW: 'window',
  FILE: 'file',
  FILE_LIST: 'file-list',
  BLOB: 'blob',

  HOST: 'host',

  XHR: 'xhr',

  // simd
  SIMD: 'simd'
};

/*
 * Simple data function to store type information
 * @param {string} type Usually what is returned from typeof
 * @param {string} cls  Sanitized @Class via Object.prototype.toString
 * @param {string} sub  If type and cls the same, and need to specify somehow
 * @private
 * @example
 *
 * //for null
 * new Type('null');
 *
 * //for Date
 * new Type('object', 'date');
 *
 * //for Uint8Array
 *
 * new Type('object', 'typed-array', 'uint8');
 */
function Type(type, cls, sub) {
  if (!type) {
    throw new Error('Type class must be initialized at least with `type` information');
  }
  this.type = type;
  this.cls = cls;
  this.sub = sub;
}

Type.prototype = {
  toString: function(sep) {
    sep = sep || ';';
    var str = [this.type];
    if (this.cls) {
      str.push(this.cls);
    }
    if (this.sub) {
      str.push(this.sub);
    }
    return str.join(sep);
  },

  toTryTypes: function() {
    var _types = [];
    if (this.sub) {
      _types.push(new Type(this.type, this.cls, this.sub));
    }
    if (this.cls) {
      _types.push(new Type(this.type, this.cls));
    }
    _types.push(new Type(this.type));

    return _types;
  }
};

var toString = Object.prototype.toString;



/**
 * Function to store type checks
 * @private
 */
function TypeChecker() {
  this.checks = [];
}

TypeChecker.prototype = {
  add: function(func) {
    this.checks.push(func);
    return this;
  },

  addBeforeFirstMatch: function(obj, func) {
    var match = this.getFirstMatch(obj);
    if (match) {
      this.checks.splice(match.index, 0, func);
    } else {
      this.add(func);
    }
  },

  addTypeOf: function(type, res) {
    return this.add(function(obj, tpeOf) {
      if (tpeOf === type) {
        return new Type(res);
      }
    });
  },

  addClass: function(cls, res, sub) {
    return this.add(function(obj, tpeOf, objCls) {
      if (objCls === cls) {
        return new Type(types.OBJECT, res, sub);
      }
    });
  },

  getFirstMatch: function(obj) {
    var typeOf = typeof obj;
    var cls = toString.call(obj);

    for (var i = 0, l = this.checks.length; i < l; i++) {
      var res = this.checks[i].call(this, obj, typeOf, cls);
      if (typeof res !== 'undefined') {
        return { result: res, func: this.checks[i], index: i };
      }
    }
  },

  getType: function(obj) {
    var match = this.getFirstMatch(obj);
    return match && match.result;
  }
};

var main = new TypeChecker();

//TODO add iterators

main
  .addTypeOf(types.NUMBER, types.NUMBER)
  .addTypeOf(types.UNDEFINED, types.UNDEFINED)
  .addTypeOf(types.STRING, types.STRING)
  .addTypeOf(types.BOOLEAN, types.BOOLEAN)
  .addTypeOf(types.FUNCTION, types.FUNCTION)
  .addTypeOf(types.SYMBOL, types.SYMBOL)
  .add(function(obj) {
    if (obj === null) {
      return new Type(types.NULL);
    }
  })
  .addClass('[object String]', types.STRING)
  .addClass('[object Boolean]', types.BOOLEAN)
  .addClass('[object Number]', types.NUMBER)
  .addClass('[object Array]', types.ARRAY)
  .addClass('[object RegExp]', types.REGEXP)
  .addClass('[object Error]', types.ERROR)
  .addClass('[object Date]', types.DATE)
  .addClass('[object Arguments]', types.ARGUMENTS)

  .addClass('[object ArrayBuffer]', types.ARRAY_BUFFER)
  .addClass('[object Int8Array]', types.TYPED_ARRAY, 'int8')
  .addClass('[object Uint8Array]', types.TYPED_ARRAY, 'uint8')
  .addClass('[object Uint8ClampedArray]', types.TYPED_ARRAY, 'uint8clamped')
  .addClass('[object Int16Array]', types.TYPED_ARRAY, 'int16')
  .addClass('[object Uint16Array]', types.TYPED_ARRAY, 'uint16')
  .addClass('[object Int32Array]', types.TYPED_ARRAY, 'int32')
  .addClass('[object Uint32Array]', types.TYPED_ARRAY, 'uint32')
  .addClass('[object Float32Array]', types.TYPED_ARRAY, 'float32')
  .addClass('[object Float64Array]', types.TYPED_ARRAY, 'float64')

  .addClass('[object Bool16x8]', types.SIMD, 'bool16x8')
  .addClass('[object Bool32x4]', types.SIMD, 'bool32x4')
  .addClass('[object Bool8x16]', types.SIMD, 'bool8x16')
  .addClass('[object Float32x4]', types.SIMD, 'float32x4')
  .addClass('[object Int16x8]', types.SIMD, 'int16x8')
  .addClass('[object Int32x4]', types.SIMD, 'int32x4')
  .addClass('[object Int8x16]', types.SIMD, 'int8x16')
  .addClass('[object Uint16x8]', types.SIMD, 'uint16x8')
  .addClass('[object Uint32x4]', types.SIMD, 'uint32x4')
  .addClass('[object Uint8x16]', types.SIMD, 'uint8x16')

  .addClass('[object DataView]', types.DATA_VIEW)
  .addClass('[object Map]', types.MAP)
  .addClass('[object WeakMap]', types.WEAK_MAP)
  .addClass('[object Set]', types.SET)
  .addClass('[object WeakSet]', types.WEAK_SET)
  .addClass('[object Promise]', types.PROMISE)
  .addClass('[object Blob]', types.BLOB)
  .addClass('[object File]', types.FILE)
  .addClass('[object FileList]', types.FILE_LIST)
  .addClass('[object XMLHttpRequest]', types.XHR)
  .add(function(obj) {
    if ((typeof Promise === types.FUNCTION && obj instanceof Promise) ||
        (typeof obj.then === types.FUNCTION)) {
          return new Type(types.OBJECT, types.PROMISE);
        }
  })
  .add(function(obj) {
    if (typeof Buffer !== 'undefined' && obj instanceof Buffer) {// eslint-disable-line no-undef
      return new Type(types.OBJECT, types.BUFFER);
    }
  })
  .add(function(obj) {
    if (typeof Node !== 'undefined' && obj instanceof Node) {
      return new Type(types.OBJECT, types.HTML_ELEMENT, obj.nodeName);
    }
  })
  .add(function(obj) {
    // probably at the begginging should be enough these checks
    if (obj.Boolean === Boolean && obj.Number === Number && obj.String === String && obj.Date === Date) {
      return new Type(types.OBJECT, types.HOST);
    }
  })
  .add(function() {
    return new Type(types.OBJECT);
  });

/**
 * Get type information of anything
 *
 * @param  {any} obj Anything that could require type information
 * @return {Type}    type info
 * @private
 */
function getGlobalType(obj) {
  return main.getType(obj);
}

getGlobalType.checker = main;
getGlobalType.TypeChecker = TypeChecker;
getGlobalType.Type = Type;

Object.keys(types).forEach(function(typeName) {
  getGlobalType[typeName] = types[typeName];
});

module.exports = getGlobalType;
}).call(this,require("buffer").Buffer)
},{"buffer":2}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _hasOwnProperty = Object.prototype.hasOwnProperty;
var _propertyIsEnumerable = Object.prototype.propertyIsEnumerable;

function hasOwnProperty(obj, key) {
  return _hasOwnProperty.call(obj, key);
}

function propertyIsEnumerable(obj, key) {
  return _propertyIsEnumerable.call(obj, key);
}

function merge(a, b) {
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
}

function isIterator(obj) {
  if (!obj) {
    return false;
  }

  if (obj.__shouldIterator__) {
    return true;
  }

  return typeof obj.next === 'function' &&
    typeof Symbol === 'function' &&
    typeof Symbol.iterator === 'symbol' &&
    typeof obj[Symbol.iterator] === 'function' &&
    obj[Symbol.iterator]() === obj;
}

//TODO find better way
function isGeneratorFunction(f) {
  return typeof f === 'function' && /^function\s*\*\s*/.test(f.toString());
}

exports.hasOwnProperty = hasOwnProperty;
exports.propertyIsEnumerable = propertyIsEnumerable;
exports.merge = merge;
exports.isIterator = isIterator;
exports.isGeneratorFunction = isGeneratorFunction;
},{}],17:[function(require,module,exports){
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var getType = _interopDefault(require('should-type'));
var eql = _interopDefault(require('should-equal'));
var sformat = _interopDefault(require('should-format'));
var shouldTypeAdaptors = require('should-type-adaptors');
var shouldUtil = require('should-util');

function isWrapperType(obj) {
  return obj instanceof Number ||
    obj instanceof String ||
    obj instanceof Boolean;
}

function convertPropertyName(name) {
  return (typeof name === 'symbol') ? name : String(name);
}

var functionName = sformat.functionName;

var config = {
  typeAdaptors: shouldTypeAdaptors.defaultTypeAdaptorStorage,

  getFormatter: function(opts) {
    return new sformat.Formatter(opts || config);
  }
};

function format(value, opts) {
  return config.getFormatter(opts).format(value);
}

function formatProp(value) {
  var formatter = config.getFormatter();
  return sformat.formatPlainObjectKey.call(formatter, value);
}

/**
 * should AssertionError
 * @param {Object} options
 * @constructor
 * @memberOf should
 * @static
 */
function AssertionError(options) {
  shouldUtil.merge(this, options);

  if (!options.message) {
    Object.defineProperty(this, 'message', {
        get: function() {
          if (!this._message) {
            this._message = this.generateMessage();
            this.generatedMessage = true;
          }
          return this._message;
        },
        configurable: true,
        enumerable: false
      }
    );
  }

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.stackStartFunction);
  } else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      if (this.stackStartFunction) {
        // try to strip useless frames
        var fn_name = functionName(this.stackStartFunction);
        var idx = out.indexOf('\n' + fn_name);
        if (idx >= 0) {
          // once we have located the function frame
          // we need to strip out everything before it (and its line)
          var next_line = out.indexOf('\n', idx + 1);
          out = out.substring(next_line + 1);
        }
      }

      this.stack = out;
    }
  }
}


var indent = '    ';
function prependIndent(line) {
  return indent + line;
}

function indentLines(text) {
  return text.split('\n').map(prependIndent).join('\n');
}


// assert.AssertionError instanceof Error
AssertionError.prototype = Object.create(Error.prototype, {
  name: {
    value: 'AssertionError'
  },

  generateMessage: {
    value: function() {
      if (!this.operator && this.previous) {
        return this.previous.message;
      }
      var actual = format(this.actual);
      var expected = 'expected' in this ? ' ' + format(this.expected) : '';
      var details = 'details' in this && this.details ? ' (' + this.details + ')' : '';

      var previous = this.previous ? '\n' + indentLines(this.previous.message) : '';

      return 'expected ' + actual + (this.negate ? ' not ' : ' ') + this.operator + expected + details + previous;
    }
  }
});

/**
 * should Assertion
 * @param {*} obj Given object for assertion
 * @constructor
 * @memberOf should
 * @static
 */
function Assertion(obj) {
  this.obj = obj;

  this.anyOne = false;
  this.negate = false;

  this.params = {actual: obj};
}

Assertion.prototype = {
  constructor: Assertion,

  /**
   * Base method for assertions.
   *
   * Before calling this method need to fill Assertion#params object. This method usually called from other assertion methods.
   * `Assertion#params` can contain such properties:
   * * `operator` - required string containing description of this assertion
   * * `obj` - optional replacement for this.obj, it usefull if you prepare more clear object then given
   * * `message` - if this property filled with string any others will be ignored and this one used as assertion message
   * * `expected` - any object used when you need to assert relation between given object and expected. Like given == expected (== is a relation)
   * * `details` - additional string with details to generated message
   *
   * @memberOf Assertion
   * @category assertion
   * @param {*} expr Any expression that will be used as a condition for asserting.
   * @example
   *
   * var a = new should.Assertion(42);
   *
   * a.params = {
   *  operator: 'to be magic number',
   * }
   *
   * a.assert(false);
   * //throws AssertionError: expected 42 to be magic number
   */
  assert: function(expr) {
    if (expr) {
      return this;
    }

    var params = this.params;

    if ('obj' in params && !('actual' in params)) {
      params.actual = params.obj;
    } else if (!('obj' in params) && !('actual' in params)) {
      params.actual = this.obj;
    }

    params.stackStartFunction = params.stackStartFunction || this.assert;
    params.negate = this.negate;

    params.assertion = this;

    throw new AssertionError(params);
  },

  /**
   * Shortcut for `Assertion#assert(false)`.
   *
   * @memberOf Assertion
   * @category assertion
   * @example
   *
   * var a = new should.Assertion(42);
   *
   * a.params = {
   *  operator: 'to be magic number',
   * }
   *
   * a.fail();
   * //throws AssertionError: expected 42 to be magic number
   */
  fail: function() {
    return this.assert(false);
  }
};



/**
 * Assertion used to delegate calls of Assertion methods inside of Promise.
 * It has almost all methods of Assertion.prototype
 *
 * @param {Promise} obj
 */
function PromisedAssertion(/* obj */) {
  Assertion.apply(this, arguments);
}

/**
 * Make PromisedAssertion to look like promise. Delegate resolve and reject to given promise.
 *
 * @private
 * @returns {Promise}
 */
PromisedAssertion.prototype.then = function(resolve, reject) {
  return this.obj.then(resolve, reject);
};

/**
 * Way to extend Assertion function. It uses some logic
 * to define only positive assertions and itself rule with negative assertion.
 *
 * All actions happen in subcontext and this method take care about negation.
 * Potentially we can add some more modifiers that does not depends from state of assertion.
 *
 * @memberOf Assertion
 * @static
 * @param {String} name Name of assertion. It will be used for defining method or getter on Assertion.prototype
 * @param {Function} func Function that will be called on executing assertion
 * @example
 *
 * Assertion.add('asset', function() {
 *      this.params = { operator: 'to be asset' }
 *
 *      this.obj.should.have.property('id').which.is.a.Number()
 *      this.obj.should.have.property('path')
 * })
 */
Assertion.add = function(name, func) {
  Object.defineProperty(Assertion.prototype, name, {
    enumerable: true,
    configurable: true,
    value: function() {
      var context = new Assertion(this.obj, this, name);
      context.anyOne = this.anyOne;

      try {
        func.apply(context, arguments);
      } catch (e) {
        // check for fail
        if (e instanceof AssertionError) {
          // negative fail
          if (this.negate) {
            this.obj = context.obj;
            this.negate = false;
            return this;
          }

          if (context !== e.assertion) {
            context.params.previous = e;
          }

          // positive fail
          context.negate = false;
          context.fail();
        }
        // throw if it is another exception
        throw e;
      }

      // negative pass
      if (this.negate) {
        context.negate = true; // because .fail will set negate
        context.params.details = 'false negative fail';
        context.fail();
      }

      // positive pass
      if (!this.params.operator) {
        this.params = context.params; // shortcut
      }
      this.obj = context.obj;
      this.negate = false;
      return this;
    }
  });

  Object.defineProperty(PromisedAssertion.prototype, name, {
    enumerable: true,
    configurable: true,
    value: function() {
      var args = arguments;
      this.obj = this.obj.then(function(a) {
        return a[name].apply(a, args);
      });

      return this;
    }
  });
};

/**
 * Add chaining getter to Assertion like .a, .which etc
 *
 * @memberOf Assertion
 * @static
 * @param  {string} name   name of getter
 * @param  {function} [onCall] optional function to call
 */
Assertion.addChain = function(name, onCall) {
  onCall = onCall || function() {};
  Object.defineProperty(Assertion.prototype, name, {
    get: function() {
      onCall.call(this);
      return this;
    },
    enumerable: true
  });

  Object.defineProperty(PromisedAssertion.prototype, name, {
    enumerable: true,
    configurable: true,
    get: function() {
      this.obj = this.obj.then(function(a) {
        return a[name];
      });

      return this;
    }
  });
};

/**
 * Create alias for some `Assertion` property
 *
 * @memberOf Assertion
 * @static
 * @param {String} from Name of to map
 * @param {String} to Name of alias
 * @example
 *
 * Assertion.alias('true', 'True')
 */
Assertion.alias = function(from, to) {
  var desc = Object.getOwnPropertyDescriptor(Assertion.prototype, from);
  if (!desc) {
    throw new Error('Alias ' + from + ' -> ' + to + ' could not be created as ' + from + ' not defined');
  }
  Object.defineProperty(Assertion.prototype, to, desc);

  var desc2 = Object.getOwnPropertyDescriptor(PromisedAssertion.prototype, from);
  if (desc2) {
    Object.defineProperty(PromisedAssertion.prototype, to, desc2);
  }
};
/**
 * Negation modifier. Current assertion chain become negated. Each call invert negation on current assertion.
 *
 * @name not
 * @property
 * @memberOf Assertion
 * @category assertion
 */
Assertion.addChain('not', function() {
  this.negate = !this.negate;
});

/**
 * Any modifier - it affect on execution of sequenced assertion to do not `check all`, but `check any of`.
 *
 * @name any
 * @property
 * @memberOf Assertion
 * @category assertion
 */
Assertion.addChain('any', function() {
  this.anyOne = true;
});

var pSlice = Array.prototype.slice;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = ok;
// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.
/**
 * Node.js standard [`assert.fail`](http://nodejs.org/api/assert.html#assert_assert_fail_actual_expected_message_operator).
 * @static
 * @memberOf should
 * @category assertion assert
 * @param {*} actual Actual object
 * @param {*} expected Expected object
 * @param {string} message Message for assertion
 * @param {string} operator Operator text
 */
function fail(actual, expected, message, operator, stackStartFunction) {
  var a = new Assertion(actual);
  a.params = {
    operator: operator,
    expected: expected,
    message: message,
    stackStartFunction: stackStartFunction || fail
  };

  a.fail();
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.
/**
 * Node.js standard [`assert.ok`](http://nodejs.org/api/assert.html#assert_assert_value_message_assert_ok_value_message).
 * @static
 * @memberOf should
 * @category assertion assert
 * @param {*} value
 * @param {string} [message]
 */
function ok(value, message) {
  if (!value) {
    fail(value, true, message, '==', assert.ok);
  }
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

/**
 * Node.js standard [`assert.equal`](http://nodejs.org/api/assert.html#assert_assert_equal_actual_expected_message).
 * @static
 * @memberOf should
 * @category assertion assert
 * @param {*} actual
 * @param {*} expected
 * @param {string} [message]
 */
assert.equal = function equal(actual, expected, message) {
  if (actual != expected) {
    fail(actual, expected, message, '==', assert.equal);
  }
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);
/**
 * Node.js standard [`assert.notEqual`](http://nodejs.org/api/assert.html#assert_assert_notequal_actual_expected_message).
 * @static
 * @memberOf should
 * @category assertion assert
 * @param {*} actual
 * @param {*} expected
 * @param {string} [message]
 */
assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);
/**
 * Node.js standard [`assert.deepEqual`](http://nodejs.org/api/assert.html#assert_assert_deepequal_actual_expected_message).
 * But uses should.js .eql implementation instead of Node.js own deepEqual.
 *
 * @static
 * @memberOf should
 * @category assertion assert
 * @param {*} actual
 * @param {*} expected
 * @param {string} [message]
 */
assert.deepEqual = function deepEqual(actual, expected, message) {
  if (eql(actual, expected).length !== 0) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};


// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);
/**
 * Node.js standard [`assert.notDeepEqual`](http://nodejs.org/api/assert.html#assert_assert_notdeepequal_actual_expected_message).
 * But uses should.js .eql implementation instead of Node.js own deepEqual.
 *
 * @static
 * @memberOf should
 * @category assertion assert
 * @param {*} actual
 * @param {*} expected
 * @param {string} [message]
 */
assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (eql(actual, expected).result) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);
/**
 * Node.js standard [`assert.strictEqual`](http://nodejs.org/api/assert.html#assert_assert_strictequal_actual_expected_message).
 * @static
 * @memberOf should
 * @category assertion assert
 * @param {*} actual
 * @param {*} expected
 * @param {string} [message]
 */
assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);
/**
 * Node.js standard [`assert.notStrictEqual`](http://nodejs.org/api/assert.html#assert_assert_notstrictequal_actual_expected_message).
 * @static
 * @memberOf should
 * @category assertion assert
 * @param {*} actual
 * @param {*} expected
 * @param {string} [message]
 */
assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof expected == 'string') {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ')' : '.') +
  (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected && !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);
/**
 * Node.js standard [`assert.throws`](http://nodejs.org/api/assert.html#assert_assert_throws_block_error_message).
 * @static
 * @memberOf should
 * @category assertion assert
 * @param {Function} block
 * @param {Function} [error]
 * @param {String} [message]
 */
assert.throws = function(/*block, error, message*/) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
/**
 * Node.js standard [`assert.doesNotThrow`](http://nodejs.org/api/assert.html#assert_assert_doesnotthrow_block_message).
 * @static
 * @memberOf should
 * @category assertion assert
 * @param {Function} block
 * @param {String} [message]
 */
assert.doesNotThrow = function(/*block, message*/) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

/**
 * Node.js standard [`assert.ifError`](http://nodejs.org/api/assert.html#assert_assert_iferror_value).
 * @static
 * @memberOf should
 * @category assertion assert
 * @param {Error} err
 */
assert.ifError = function(err) {
  if (err) {
    throw err;
  }
};

function assertExtensions(should) {
  var i = should.format;

  /*
   * Expose assert to should
   *
   * This allows you to do things like below
   * without require()ing the assert module.
   *
   *    should.equal(foo.bar, undefined);
   *
   */
  shouldUtil.merge(should, assert);

  /**
   * Assert _obj_ exists, with optional message.
   *
   * @static
   * @memberOf should
   * @category assertion assert
   * @alias should.exists
   * @param {*} obj
   * @param {String} [msg]
   * @example
   *
   * should.exist(1);
   * should.exist(new Date());
   */
  should.exist = should.exists = function(obj, msg) {
    if (null == obj) {
      throw new AssertionError({
        message: msg || ('expected ' + i(obj) + ' to exist'), stackStartFunction: should.exist
      });
    }
  };

  should.not = {};
  /**
   * Asserts _obj_ does not exist, with optional message.
   *
   * @name not.exist
   * @static
   * @memberOf should
   * @category assertion assert
   * @alias should.not.exists
   * @param {*} obj
   * @param {String} [msg]
   * @example
   *
   * should.not.exist(null);
   * should.not.exist(void 0);
   */
  should.not.exist = should.not.exists = function(obj, msg) {
    if (null != obj) {
      throw new AssertionError({
        message: msg || ('expected ' + i(obj) + ' to not exist'), stackStartFunction: should.not.exist
      });
    }
  };
}

/*
 * should.js - assertion library
 * Copyright(c) 2010-2013 TJ Holowaychuk <tj@vision-media.ca>
 * Copyright(c) 2013-2016 Denis Bardadym <bardadymchik@gmail.com>
 * MIT Licensed
 */

function chainAssertions(should, Assertion) {
  /**
   * Simple chaining. It actually do nothing.
   *
   * @memberOf Assertion
   * @name be
   * @property {should.Assertion} be
   * @alias Assertion#an
   * @alias Assertion#of
   * @alias Assertion#a
   * @alias Assertion#and
   * @alias Assertion#have
   * @alias Assertion#has
   * @alias Assertion#with
   * @alias Assertion#is
   * @alias Assertion#which
   * @alias Assertion#the
   * @alias Assertion#it
   * @category assertion chaining
   */
  ['an', 'of', 'a', 'and', 'be', 'has', 'have', 'with', 'is', 'which', 'the', 'it'].forEach(function(name) {
    Assertion.addChain(name);
  });
}

/*
 * should.js - assertion library
 * Copyright(c) 2010-2013 TJ Holowaychuk <tj@vision-media.ca>
 * Copyright(c) 2013-2016 Denis Bardadym <bardadymchik@gmail.com>
 * MIT Licensed
 */

function booleanAssertions(should, Assertion) {
  /**
   * Assert given object is exactly `true`.
   *
   * @name true
   * @memberOf Assertion
   * @category assertion bool
   * @alias Assertion#True
   * @param {string} [message] Optional message
   * @example
   *
   * (true).should.be.true();
   * false.should.not.be.true();
   *
   * ({ a: 10}).should.not.be.true();
   */
  Assertion.add('true', function(message) {
    this.is.exactly(true, message);
  });

  Assertion.alias('true', 'True');

  /**
   * Assert given object is exactly `false`.
   *
   * @name false
   * @memberOf Assertion
   * @category assertion bool
   * @alias Assertion#False
   * @param {string} [message] Optional message
   * @example
   *
   * (true).should.not.be.false();
   * false.should.be.false();
   */
  Assertion.add('false', function(message) {
    this.is.exactly(false, message);
  });

  Assertion.alias('false', 'False');

  /**
   * Assert given object is truthy according javascript type conversions.
   *
   * @name ok
   * @memberOf Assertion
   * @category assertion bool
   * @example
   *
   * (true).should.be.ok();
   * ''.should.not.be.ok();
   * should(null).not.be.ok();
   * should(void 0).not.be.ok();
   *
   * (10).should.be.ok();
   * (0).should.not.be.ok();
   */
  Assertion.add('ok', function() {
    this.params = { operator: 'to be truthy' };

    this.assert(this.obj);
  });
}

/*
 * should.js - assertion library
 * Copyright(c) 2010-2013 TJ Holowaychuk <tj@vision-media.ca>
 * Copyright(c) 2013-2016 Denis Bardadym <bardadymchik@gmail.com>
 * MIT Licensed
 */

function numberAssertions(should, Assertion) {

  /**
   * Assert given object is NaN
   * @name NaN
   * @memberOf Assertion
   * @category assertion numbers
   * @example
   *
   * (10).should.not.be.NaN();
   * NaN.should.be.NaN();
   */
  Assertion.add('NaN', function() {
    this.params = { operator: 'to be NaN' };

    this.assert(this.obj !== this.obj);
  });

  /**
   * Assert given object is not finite (positive or negative)
   *
   * @name Infinity
   * @memberOf Assertion
   * @category assertion numbers
   * @example
   *
   * (10).should.not.be.Infinity();
   * NaN.should.not.be.Infinity();
   */
  Assertion.add('Infinity', function() {
    this.params = { operator: 'to be Infinity' };

    this.is.a.Number()
      .and.not.a.NaN()
      .and.assert(!isFinite(this.obj));
  });

  /**
   * Assert given number between `start` and `finish` or equal one of them.
   *
   * @name within
   * @memberOf Assertion
   * @category assertion numbers
   * @param {number} start Start number
   * @param {number} finish Finish number
   * @param {string} [description] Optional message
   * @example
   *
   * (10).should.be.within(0, 20);
   */
  Assertion.add('within', function(start, finish, description) {
    this.params = { operator: 'to be within ' + start + '..' + finish, message: description };

    this.assert(this.obj >= start && this.obj <= finish);
  });

  /**
   * Assert given number near some other `value` within `delta`
   *
   * @name approximately
   * @memberOf Assertion
   * @category assertion numbers
   * @param {number} value Center number
   * @param {number} delta Radius
   * @param {string} [description] Optional message
   * @example
   *
   * (9.99).should.be.approximately(10, 0.1);
   */
  Assertion.add('approximately', function(value, delta, description) {
    this.params = { operator: 'to be approximately ' + value + ' ±' + delta, message: description };

    this.assert(Math.abs(this.obj - value) <= delta);
  });

  /**
   * Assert given number above `n`.
   *
   * @name above
   * @alias Assertion#greaterThan
   * @memberOf Assertion
   * @category assertion numbers
   * @param {number} n Margin number
   * @param {string} [description] Optional message
   * @example
   *
   * (10).should.be.above(0);
   */
  Assertion.add('above', function(n, description) {
    this.params = { operator: 'to be above ' + n, message: description };

    this.assert(this.obj > n);
  });

  /**
   * Assert given number below `n`.
   *
   * @name below
   * @alias Assertion#lessThan
   * @memberOf Assertion
   * @category assertion numbers
   * @param {number} n Margin number
   * @param {string} [description] Optional message
   * @example
   *
   * (0).should.be.below(10);
   */
  Assertion.add('below', function(n, description) {
    this.params = { operator: 'to be below ' + n, message: description };

    this.assert(this.obj < n);
  });

  Assertion.alias('above', 'greaterThan');
  Assertion.alias('below', 'lessThan');

  /**
   * Assert given number above `n`.
   *
   * @name aboveOrEqual
   * @alias Assertion#greaterThanOrEqual
   * @memberOf Assertion
   * @category assertion numbers
   * @param {number} n Margin number
   * @param {string} [description] Optional message
   * @example
   *
   * (10).should.be.aboveOrEqual(0);
   * (10).should.be.aboveOrEqual(10);
   */
  Assertion.add('aboveOrEqual', function(n, description) {
    this.params = { operator: 'to be above or equal' + n, message: description };

    this.assert(this.obj >= n);
  });

  /**
   * Assert given number below `n`.
   *
   * @name belowOrEqual
   * @alias Assertion#lessThanOrEqual
   * @memberOf Assertion
   * @category assertion numbers
   * @param {number} n Margin number
   * @param {string} [description] Optional message
   * @example
   *
   * (0).should.be.belowOrEqual(10);
   * (0).should.be.belowOrEqual(0);
   */
  Assertion.add('belowOrEqual', function(n, description) {
    this.params = { operator: 'to be below or equal' + n, message: description };

    this.assert(this.obj <= n);
  });

  Assertion.alias('aboveOrEqual', 'greaterThanOrEqual');
  Assertion.alias('belowOrEqual', 'lessThanOrEqual');

}

function typeAssertions(should, Assertion) {
  /**
   * Assert given object is number
   * @name Number
   * @memberOf Assertion
   * @category assertion types
   */
  Assertion.add('Number', function() {
    this.params = {operator: 'to be a number'};

    this.have.type('number');
  });

  /**
   * Assert given object is arguments
   * @name arguments
   * @alias Assertion#Arguments
   * @memberOf Assertion
   * @category assertion types
   */
  Assertion.add('arguments', function() {
    this.params = {operator: 'to be arguments'};

    this.have.class('Arguments');
  });

  Assertion.alias('arguments', 'Arguments');

  /**
   * Assert given object has some type using `typeof`
   * @name type
   * @memberOf Assertion
   * @param {string} type Type name
   * @param {string} [description] Optional message
   * @category assertion types
   */
  Assertion.add('type', function(type, description) {
    this.params = {operator: 'to have type ' + type, message: description};

    should(typeof this.obj).be.exactly(type);
  });

  /**
   * Assert given object is instance of `constructor`
   * @name instanceof
   * @alias Assertion#instanceOf
   * @memberOf Assertion
   * @param {Function} constructor Constructor function
   * @param {string} [description] Optional message
   * @category assertion types
   */
  Assertion.add('instanceof', function(constructor, description) {
    this.params = {operator: 'to be an instance of ' + functionName(constructor), message: description};

    this.assert(Object(this.obj) instanceof constructor);
  });

  Assertion.alias('instanceof', 'instanceOf');

  /**
   * Assert given object is function
   * @name Function
   * @memberOf Assertion
   * @category assertion types
   */
  Assertion.add('Function', function() {
    this.params = {operator: 'to be a function'};

    this.have.type('function');
  });

  /**
   * Assert given object is object
   * @name Object
   * @memberOf Assertion
   * @category assertion types
   */
  Assertion.add('Object', function() {
    this.params = {operator: 'to be an object'};

    this.is.not.null().and.have.type('object');
  });

  /**
   * Assert given object is string
   * @name String
   * @memberOf Assertion
   * @category assertion types
   */
  Assertion.add('String', function() {
    this.params = {operator: 'to be a string'};

    this.have.type('string');
  });

  /**
   * Assert given object is array
   * @name Array
   * @memberOf Assertion
   * @category assertion types
   */
  Assertion.add('Array', function() {
    this.params = {operator: 'to be an array'};

    this.have.class('Array');
  });

  /**
   * Assert given object is boolean
   * @name Boolean
   * @memberOf Assertion
   * @category assertion types
   */
  Assertion.add('Boolean', function() {
    this.params = {operator: 'to be a boolean'};

    this.have.type('boolean');
  });

  /**
   * Assert given object is error
   * @name Error
   * @memberOf Assertion
   * @category assertion types
   */
  Assertion.add('Error', function() {
    this.params = {operator: 'to be an error'};

    this.have.instanceOf(Error);
  });

  /**
   * Assert given object is a date
   * @name Date
   * @memberOf Assertion
   * @category assertion types
   */
  Assertion.add('Date', function() {
    this.params = {operator: 'to be a date'};

    this.have.instanceOf(Date);
  });

  /**
   * Assert given object is null
   * @name null
   * @alias Assertion#Null
   * @memberOf Assertion
   * @category assertion types
   */
  Assertion.add('null', function() {
    this.params = {operator: 'to be null'};

    this.assert(this.obj === null);
  });

  Assertion.alias('null', 'Null');

  /**
   * Assert given object has some internal [[Class]], via Object.prototype.toString call
   * @name class
   * @alias Assertion#Class
   * @memberOf Assertion
   * @category assertion types
   */
  Assertion.add('class', function(cls) {
    this.params = {operator: 'to have [[Class]] ' + cls};

    this.assert(Object.prototype.toString.call(this.obj) === '[object ' + cls + ']');
  });

  Assertion.alias('class', 'Class');

  /**
   * Assert given object is undefined
   * @name undefined
   * @alias Assertion#Undefined
   * @memberOf Assertion
   * @category assertion types
   */
  Assertion.add('undefined', function() {
    this.params = {operator: 'to be undefined'};

    this.assert(this.obj === void 0);
  });

  Assertion.alias('undefined', 'Undefined');

  /**
   * Assert given object supports es6 iterable protocol (just check
   * that object has property Symbol.iterator, which is a function)
   * @name iterable
   * @memberOf Assertion
   * @category assertion es6
   */
  Assertion.add('iterable', function() {
    this.params = {operator: 'to be iterable'};

    should(this.obj).have.property(Symbol.iterator).which.is.a.Function();
  });

  /**
   * Assert given object supports es6 iterator protocol (just check
   * that object has property next, which is a function)
   * @name iterator
   * @memberOf Assertion
   * @category assertion es6
   */
  Assertion.add('iterator', function() {
    this.params = {operator: 'to be iterator'};

    should(this.obj).have.property('next').which.is.a.Function();
  });

  /**
   * Assert given object is a generator object
   * @name generator
   * @memberOf Assertion
   * @category assertion es6
   */
  Assertion.add('generator', function() {
    this.params = {operator: 'to be generator'};

    should(this.obj).be.iterable
      .and.iterator
      .and.it.is.equal(this.obj[Symbol.iterator]());
  });
}

function formatEqlResult(r, a, b) {
  return ((r.path.length > 0 ? 'at ' + r.path.map(formatProp).join(' -> ') : '') +
  (r.a === a ? '' : ', A has ' + format(r.a)) +
  (r.b === b ? '' : ' and B has ' + format(r.b)) +
  (r.showReason ? ' because ' + r.reason : '')).trim();
}

function equalityAssertions(should, Assertion) {


  /**
   * Deep object equality comparison. For full spec see [`should-equal tests`](https://github.com/shouldjs/equal/blob/master/test.js).
   *
   * @name eql
   * @memberOf Assertion
   * @category assertion equality
   * @alias Assertion#deepEqual
   * @param {*} val Expected value
   * @param {string} [description] Optional message
   * @example
   *
   * (10).should.be.eql(10);
   * ('10').should.not.be.eql(10);
   * (-0).should.not.be.eql(+0);
   *
   * NaN.should.be.eql(NaN);
   *
   * ({ a: 10}).should.be.eql({ a: 10 });
   * [ 'a' ].should.not.be.eql({ '0': 'a' });
   */
  Assertion.add('eql', function(val, description) {
    this.params = {operator: 'to equal', expected: val, message: description};
    var obj = this.obj;
    var fails = eql(this.obj, val, should.config);
    this.params.details = fails.map(function(fail) {
      return formatEqlResult(fail, obj, val);
    }).join(', ');

    this.params.showDiff = eql(getType(obj), getType(val)).length === 0;

    this.assert(fails.length === 0);
  });

  /**
   * Exact comparison using ===.
   *
   * @name equal
   * @memberOf Assertion
   * @category assertion equality
   * @alias Assertion#exactly
   * @param {*} val Expected value
   * @param {string} [description] Optional message
   * @example
   *
   * 10.should.be.equal(10);
   * 'a'.should.be.exactly('a');
   *
   * should(null).be.exactly(null);
   */
  Assertion.add('equal', function(val, description) {
    this.params = {operator: 'to be', expected: val, message: description};

    this.params.showDiff = eql(getType(this.obj), getType(val)).length === 0;

    this.assert(val === this.obj);
  });

  Assertion.alias('equal', 'exactly');
  Assertion.alias('eql', 'deepEqual');

  function addOneOf(name, message, method) {
    Assertion.add(name, function(vals) {
      if (arguments.length !== 1) {
        vals = Array.prototype.slice.call(arguments);
      } else {
        should(vals).be.Array();
      }

      this.params = {operator: message, expected: vals};

      var obj = this.obj;
      var found = false;

      shouldTypeAdaptors.forEach(vals, function(val) {
        try {
          should(val)[method](obj);
          found = true;
          return false;
        } catch (e) {
          if (e instanceof should.AssertionError) {
            return;//do nothing
          }
          throw e;
        }
      });

      this.assert(found);
    });
  }

  /**
   * Exact comparison using === to be one of supplied objects.
   *
   * @name equalOneOf
   * @memberOf Assertion
   * @category assertion equality
   * @param {Array|*} vals Expected values
   * @example
   *
   * 'ab'.should.be.equalOneOf('a', 10, 'ab');
   * 'ab'.should.be.equalOneOf(['a', 10, 'ab']);
   */
  addOneOf('equalOneOf', 'to be equals one of', 'equal');

  /**
   * Exact comparison using .eql to be one of supplied objects.
   *
   * @name oneOf
   * @memberOf Assertion
   * @category assertion equality
   * @param {Array|*} vals Expected values
   * @example
   *
   * ({a: 10}).should.be.oneOf('a', 10, 'ab', {a: 10});
   * ({a: 10}).should.be.oneOf(['a', 10, 'ab', {a: 10}]);
   */
  addOneOf('oneOf', 'to be one of', 'eql');

}

function promiseAssertions(should, Assertion) {
  /**
   * Assert given object is a Promise
   *
   * @name Promise
   * @memberOf Assertion
   * @category assertion promises
   * @example
   *
   * promise.should.be.Promise()
   * (new Promise(function(resolve, reject) { resolve(10); })).should.be.a.Promise()
   * (10).should.not.be.a.Promise()
   */
  Assertion.add('Promise', function() {
    this.params = {operator: 'to be promise'};

    var obj = this.obj;

    should(obj).have.property('then')
      .which.is.a.Function();
  });

  /**
   * Assert given promise will be fulfilled. Result of assertion is still .thenable and should be handled accordingly.
   *
   * @name fulfilled
   * @memberOf Assertion
   * @returns {Promise}
   * @category assertion promises
   * @example
   *
   * // don't forget to handle async nature
   * (new Promise(function(resolve, reject) { resolve(10); })).should.be.fulfilled();
   *
   * // test example with mocha it is possible to return promise
   * it('is async', () => {
   *    return new Promise(resolve => resolve(10))
   *      .should.be.fulfilled();
   * });
   */
  Assertion.prototype.fulfilled = function Assertion$fulfilled() {
    this.params = {operator: 'to be fulfilled'};

    should(this.obj).be.a.Promise();

    var that = this;
    return this.obj.then(function next$onResolve(value) {
      if (that.negate) {
        that.fail();
      }
      return value;
    }, function next$onReject(err) {
      if (!that.negate) {
        that.params.operator += ', but it was rejected with ' + should.format(err);
        that.fail();
      }
      return err;
    });
  };

  /**
   * Assert given promise will be rejected. Result of assertion is still .thenable and should be handled accordingly.
   *
   * @name rejected
   * @memberOf Assertion
   * @category assertion promises
   * @returns {Promise}
   * @example
   *
   * // don't forget to handle async nature
   * (new Promise(function(resolve, reject) { resolve(10); }))
   *    .should.not.be.rejected();
   *
   * // test example with mocha it is possible to return promise
   * it('is async', () => {
   *    return new Promise((resolve, reject) => reject(new Error('boom')))
   *      .should.be.rejected();
   * });
   */
  Assertion.prototype.rejected = function() {
    this.params = {operator: 'to be rejected'};

    should(this.obj).be.a.Promise();

    var that = this;
    return this.obj.then(function(value) {
      if (!that.negate) {
        that.params.operator += ', but it was fulfilled';
        if (arguments.length != 0) {
          that.params.operator += ' with ' + should.format(value);
        }
        that.fail();
      }
      return value;
    }, function next$onError(err) {
      if (that.negate) {
        that.fail();
      }
      return err;
    });
  };

  /**
   * Assert given promise will be fulfilled with some expected value (value compared using .eql).
   * Result of assertion is still .thenable and should be handled accordingly.
   *
   * @name fulfilledWith
   * @memberOf Assertion
   * @category assertion promises
   * @returns {Promise}
   * @example
   *
   * // don't forget to handle async nature
   * (new Promise(function(resolve, reject) { resolve(10); }))
   *    .should.be.fulfilledWith(10);
   *
   * // test example with mocha it is possible to return promise
   * it('is async', () => {
   *    return new Promise((resolve, reject) => resolve(10))
   *       .should.be.fulfilledWith(10);
   * });
   */
  Assertion.prototype.fulfilledWith = function(expectedValue) {
    this.params = {operator: 'to be fulfilled with ' + should.format(expectedValue)};

    should(this.obj).be.a.Promise();

    var that = this;
    return this.obj.then(function(value) {
      if (that.negate) {
        that.fail();
      }
      should(value).eql(expectedValue);
      return value;
    }, function next$onError(err) {
      if (!that.negate) {
        that.params.operator += ', but it was rejected with ' + should.format(err);
        that.fail();
      }
      return err;
    });
  };

  /**
   * Assert given promise will be rejected with some sort of error. Arguments is the same for Assertion#throw.
   * Result of assertion is still .thenable and should be handled accordingly.
   *
   * @name rejectedWith
   * @memberOf Assertion
   * @category assertion promises
   * @returns {Promise}
   * @example
   *
   * function failedPromise() {
   *   return new Promise(function(resolve, reject) {
   *     reject(new Error('boom'))
   *   })
   * }
   * failedPromise().should.be.rejectedWith(Error);
   * failedPromise().should.be.rejectedWith('boom');
   * failedPromise().should.be.rejectedWith(/boom/);
   * failedPromise().should.be.rejectedWith(Error, { message: 'boom' });
   * failedPromise().should.be.rejectedWith({ message: 'boom' });
   *
   * // test example with mocha it is possible to return promise
   * it('is async', () => {
   *    return failedPromise().should.be.rejectedWith({ message: 'boom' });
   * });
   */
  Assertion.prototype.rejectedWith = function(message, properties) {
    this.params = {operator: 'to be rejected'};

    should(this.obj).be.a.Promise();

    var that = this;
    return this.obj.then(function(value) {
      if (!that.negate) {
        that.fail();
      }
      return value;
    }, function next$onError(err) {
      if (that.negate) {
        that.fail();
      }

      var errorMatched = true;
      var errorInfo = '';

      if ('string' === typeof message) {
        errorMatched = message === err.message;
      } else if (message instanceof RegExp) {
        errorMatched = message.test(err.message);
      } else if ('function' === typeof message) {
        errorMatched = err instanceof message;
      } else if (message !== null && typeof message === 'object') {
        try {
          should(err).match(message);
        } catch (e) {
          if (e instanceof should.AssertionError) {
            errorInfo = ': ' + e.message;
            errorMatched = false;
          } else {
            throw e;
          }
        }
      }

      if (!errorMatched) {
        if ( typeof message === 'string' || message instanceof RegExp) {
          errorInfo = ' with a message matching ' + should.format(message) + ", but got '" + err.message + "'";
        } else if ('function' === typeof message) {
          errorInfo = ' of type ' + functionName(message) + ', but got ' + functionName(err.constructor);
        }
      } else if ('function' === typeof message && properties) {
        try {
          should(err).match(properties);
        } catch (e) {
          if (e instanceof should.AssertionError) {
            errorInfo = ': ' + e.message;
            errorMatched = false;
          } else {
            throw e;
          }
        }
      }

      that.params.operator += errorInfo;

      that.assert(errorMatched);

      return err;
    });
  };

  /**
   * Assert given object is promise and wrap it in PromisedAssertion, which has all properties of Assertion.
   * That means you can chain as with usual Assertion.
   * Result of assertion is still .thenable and should be handled accordingly.
   *
   * @name finally
   * @memberOf Assertion
   * @alias Assertion#eventually
   * @category assertion promises
   * @returns {PromisedAssertion} Like Assertion, but .then this.obj in Assertion
   * @example
   *
   * (new Promise(function(resolve, reject) { resolve(10); }))
   *    .should.be.eventually.equal(10);
   *
   * // test example with mocha it is possible to return promise
   * it('is async', () => {
   *    return new Promise(resolve => resolve(10))
   *      .should.be.finally.equal(10);
   * });
   */
  Object.defineProperty(Assertion.prototype, 'finally', {
    get: function() {
      should(this.obj).be.a.Promise();

      var that = this;

      return new PromisedAssertion(this.obj.then(function(obj) {
        var a = should(obj);

        a.negate = that.negate;
        a.anyOne = that.anyOne;

        return a;
      }));
    }
  });

  Assertion.alias('finally', 'eventually');
}

/*
 * should.js - assertion library
 * Copyright(c) 2010-2013 TJ Holowaychuk <tj@vision-media.ca>
 * Copyright(c) 2013-2016 Denis Bardadym <bardadymchik@gmail.com>
 * MIT Licensed
 */

function stringAssertions(should, Assertion) {
  /**
   * Assert given string starts with prefix
   * @name startWith
   * @memberOf Assertion
   * @category assertion strings
   * @param {string} str Prefix
   * @param {string} [description] Optional message
   * @example
   *
   * 'abc'.should.startWith('a');
   */
  Assertion.add('startWith', function(str, description) {
    this.params = { operator: 'to start with ' + should.format(str), message: description };

    this.assert(0 === this.obj.indexOf(str));
  });

  /**
   * Assert given string ends with prefix
   * @name endWith
   * @memberOf Assertion
   * @category assertion strings
   * @param {string} str Prefix
   * @param {string} [description] Optional message
   * @example
   *
   * 'abca'.should.endWith('a');
   */
  Assertion.add('endWith', function(str, description) {
    this.params = { operator: 'to end with ' + should.format(str), message: description };

    this.assert(this.obj.indexOf(str, this.obj.length - str.length) >= 0);
  });
}

function containAssertions(should, Assertion) {
  var i = should.format;

  /**
   * Assert that given object contain something that equal to `other`. It uses `should-equal` for equality checks.
   * If given object is array it search that one of elements was equal to `other`.
   * If given object is string it checks if `other` is a substring - expected that `other` is a string.
   * If given object is Object it checks that `other` is a subobject - expected that `other` is a object.
   *
   * @name containEql
   * @memberOf Assertion
   * @category assertion contain
   * @param {*} other Nested object
   * @example
   *
   * [1, 2, 3].should.containEql(1);
   * [{ a: 1 }, 'a', 10].should.containEql({ a: 1 });
   *
   * 'abc'.should.containEql('b');
   * 'ab1c'.should.containEql(1);
   *
   * ({ a: 10, c: { d: 10 }}).should.containEql({ a: 10 });
   * ({ a: 10, c: { d: 10 }}).should.containEql({ c: { d: 10 }});
   * ({ a: 10, c: { d: 10 }}).should.containEql({ b: 10 });
   * // throws AssertionError: expected { a: 10, c: { d: 10 } } to contain { b: 10 }
   * //            expected { a: 10, c: { d: 10 } } to have property b
   */
  Assertion.add('containEql', function(other) {
    this.params = { operator: 'to contain ' + i(other) };

    this.is.not.null().and.not.undefined();

    var obj = this.obj;

    if (typeof obj == 'string') {
      this.assert(obj.indexOf(String(other)) >= 0);
    } else if (shouldTypeAdaptors.isIterable(obj)) {
      this.assert(shouldTypeAdaptors.some(obj, function(v) {
        return eql(v, other).length === 0;
      }));
    } else {
      shouldTypeAdaptors.forEach(other, function(value, key) {
        should(obj).have.value(key, value);
      }, this);
    }
  });

  /**
   * Assert that given object is contain equally structured object on the same depth level.
   * If given object is an array and `other` is an array it checks that the eql elements is going in the same sequence in given array (recursive)
   * If given object is an object it checks that the same keys contain deep equal values (recursive)
   * On other cases it try to check with `.eql`
   *
   * @name containDeepOrdered
   * @memberOf Assertion
   * @category assertion contain
   * @param {*} other Nested object
   * @example
   *
   * [ 1, 2, 3].should.containDeepOrdered([1, 2]);
   * [ 1, 2, [ 1, 2, 3 ]].should.containDeepOrdered([ 1, [ 2, 3 ]]);
   *
   * ({ a: 10, b: { c: 10, d: [1, 2, 3] }}).should.containDeepOrdered({a: 10});
   * ({ a: 10, b: { c: 10, d: [1, 2, 3] }}).should.containDeepOrdered({b: {c: 10}});
   * ({ a: 10, b: { c: 10, d: [1, 2, 3] }}).should.containDeepOrdered({b: {d: [1, 3]}});
   */
  Assertion.add('containDeepOrdered', function(other) {
    this.params = {operator: 'to contain ' + i(other)};

    var obj = this.obj;
    if (typeof obj == 'string') {// expect other to be string
      this.is.equal(String(other));
    } else if (shouldTypeAdaptors.isIterable(obj) && shouldTypeAdaptors.isIterable(other)) {
      var objIterator = shouldTypeAdaptors.iterator(obj);
      var otherIterator = shouldTypeAdaptors.iterator(other);

      var nextObj = objIterator.next();
      var nextOther = otherIterator.next();
      while (!nextObj.done && !nextOther.done) {
        try {
          should(nextObj.value[1]).containDeepOrdered(nextOther.value[1]);
          nextOther = otherIterator.next();
        } catch (e) {
          if (!(e instanceof should.AssertionError)) {
            throw e;
          }
        }
        nextObj = objIterator.next();
      }

      this.assert(nextOther.done);
    } else if (obj != null && other != null && typeof obj == 'object' && typeof other == 'object') {//TODO compare types object contains object case
      shouldTypeAdaptors.forEach(other, function(value, key) {
        should(obj[key]).containDeepOrdered(value);
      });

      // if both objects is empty means we finish traversing - and we need to compare for hidden values
      if (shouldTypeAdaptors.isEmpty(other)) {
        this.eql(other);
      }
    } else {
      this.eql(other);
    }
  });

  /**
   * The same like `Assertion#containDeepOrdered` but all checks on arrays without order.
   *
   * @name containDeep
   * @memberOf Assertion
   * @category assertion contain
   * @param {*} other Nested object
   * @example
   *
   * [ 1, 2, 3].should.containDeep([2, 1]);
   * [ 1, 2, [ 1, 2, 3 ]].should.containDeep([ 1, [ 3, 1 ]]);
   */
  Assertion.add('containDeep', function(other) {
    this.params = {operator: 'to contain ' + i(other)};

    var obj = this.obj;
    if (typeof obj == 'string') {// expect other to be string
      this.is.equal(String(other));
    } else if (shouldTypeAdaptors.isIterable(obj) && shouldTypeAdaptors.isIterable(other)) {
      var usedKeys = {};
      shouldTypeAdaptors.forEach(other, function(otherItem) {
        this.assert(shouldTypeAdaptors.some(obj, function(item, index) {
          if (index in usedKeys) {
            return false;
          }

          try {
            should(item).containDeep(otherItem);
            usedKeys[index] = true;
            return true;
          } catch (e) {
            if (e instanceof should.AssertionError) {
              return false;
            }
            throw e;
          }
        }));
      }, this);
    } else if (obj != null && other != null && typeof obj == 'object' && typeof other == 'object') {// object contains object case
      shouldTypeAdaptors.forEach(other, function(value, key) {
        should(obj[key]).containDeep(value);
      });

      // if both objects is empty means we finish traversing - and we need to compare for hidden values
      if (shouldTypeAdaptors.isEmpty(other)) {
        this.eql(other);
      }
    } else {
      this.eql(other);
    }
  });

}

var aSlice = Array.prototype.slice;

function propertyAssertions(should, Assertion) {
  var i = should.format;
  /**
   * Asserts given object has some descriptor. **On success it change given object to be value of property**.
   *
   * @name propertyWithDescriptor
   * @memberOf Assertion
   * @category assertion property
   * @param {string} name Name of property
   * @param {Object} desc Descriptor like used in Object.defineProperty (not required to add all properties)
   * @example
   *
   * ({ a: 10 }).should.have.propertyWithDescriptor('a', { enumerable: true });
   */
  Assertion.add('propertyWithDescriptor', function(name, desc) {
    this.params = {actual: this.obj, operator: 'to have own property with descriptor ' + i(desc)};
    var obj = this.obj;
    this.have.ownProperty(name);
    should(Object.getOwnPropertyDescriptor(Object(obj), name)).have.properties(desc);
  });

  function processPropsArgs() {
    var args = {};
    if (arguments.length > 1) {
      args.names = aSlice.call(arguments);
    } else {
      var arg = arguments[0];
      if (typeof arg === 'string') {
        args.names = [arg];
      } else if (Array.isArray(arg)) {
        args.names = arg;
      } else {
        args.names = Object.keys(arg);
        args.values = arg;
      }
    }
    return args;
  }


  /**
   * Asserts given object has enumerable property with optionally value. **On success it change given object to be value of property**.
   *
   * @name enumerable
   * @memberOf Assertion
   * @category assertion property
   * @param {string} name Name of property
   * @param {*} [val] Optional property value to check
   * @example
   *
   * ({ a: 10 }).should.have.enumerable('a');
   */
  Assertion.add('enumerable', function(name, val) {
    name = convertPropertyName(name);

    this.params = {
      operator: "to have enumerable property " + formatProp(name) + (arguments.length > 1 ? " equal to " + i(val): "")
    };

    var desc = { enumerable: true };
    if (arguments.length > 1) {
      desc.value = val;
    }
    this.have.propertyWithDescriptor(name, desc);
  });

  /**
   * Asserts given object has enumerable properties
   *
   * @name enumerables
   * @memberOf Assertion
   * @category assertion property
   * @param {Array|...string|Object} names Names of property
   * @example
   *
   * ({ a: 10, b: 10 }).should.have.enumerables('a');
   */
  Assertion.add('enumerables', function(/*names*/) {
    var args = processPropsArgs.apply(null, arguments);

    this.params = {
      operator: "to have enumerables " + args.names.map(formatProp)
    };

    var obj = this.obj;
    args.names.forEach(function(name) {
      should(obj).have.enumerable(name);
    });
  });

  /**
   * Asserts given object has property with optionally value. **On success it change given object to be value of property**.
   *
   * @name property
   * @memberOf Assertion
   * @category assertion property
   * @param {string} name Name of property
   * @param {*} [val] Optional property value to check
   * @example
   *
   * ({ a: 10 }).should.have.property('a');
   */
  Assertion.add('property', function(name, val) {
    name = convertPropertyName(name);
    if (arguments.length > 1) {
      var p = {};
      p[name] = val;
      this.have.properties(p);
    } else {
      this.have.properties(name);
    }
    this.obj = this.obj[name];
  });

  /**
   * Asserts given object has properties. On this method affect .any modifier, which allow to check not all properties.
   *
   * @name properties
   * @memberOf Assertion
   * @category assertion property
   * @param {Array|...string|Object} names Names of property
   * @example
   *
   * ({ a: 10 }).should.have.properties('a');
   * ({ a: 10, b: 20 }).should.have.properties([ 'a' ]);
   * ({ a: 10, b: 20 }).should.have.properties({ b: 20 });
   */
  Assertion.add('properties', function(names) {
    var values = {};
    if (arguments.length > 1) {
      names = aSlice.call(arguments);
    } else if (!Array.isArray(names)) {
      if (typeof names == 'string' || typeof names == 'symbol') {
        names = [names];
      } else {
        values = names;
        names = Object.keys(names);
      }
    }

    var obj = Object(this.obj), missingProperties = [];

    //just enumerate properties and check if they all present
    names.forEach(function(name) {
      if (!(name in obj)) {
        missingProperties.push(formatProp(name));
      }
    });

    var props = missingProperties;
    if (props.length === 0) {
      props = names.map(formatProp);
    } else if (this.anyOne) {
      props = names.filter(function(name) {
        return missingProperties.indexOf(formatProp(name)) < 0;
      }).map(formatProp);
    }

    var operator = (props.length === 1 ?
        'to have property ' : 'to have ' + (this.anyOne ? 'any of ' : '') + 'properties ') + props.join(', ');

    this.params = {obj: this.obj, operator: operator};

    //check that all properties presented
    //or if we request one of them that at least one them presented
    this.assert(missingProperties.length === 0 || (this.anyOne && missingProperties.length != names.length));

    // check if values in object matched expected
    var valueCheckNames = Object.keys(values);
    if (valueCheckNames.length) {
      var wrongValues = [];
      props = [];

      // now check values, as there we have all properties
      valueCheckNames.forEach(function(name) {
        var value = values[name];
        if (eql(obj[name], value).length !== 0) {
          wrongValues.push(formatProp(name) + ' of ' + i(value) + ' (got ' + i(obj[name]) + ')');
        } else {
          props.push(formatProp(name) + ' of ' + i(value));
        }
      });

      if ((wrongValues.length !== 0 && !this.anyOne) || (this.anyOne && props.length === 0)) {
        props = wrongValues;
      }

      operator = (props.length === 1 ?
        'to have property ' : 'to have ' + (this.anyOne ? 'any of ' : '') + 'properties ') + props.join(', ');

      this.params = {obj: this.obj, operator: operator};

      //if there is no not matched values
      //or there is at least one matched
      this.assert(wrongValues.length === 0 || (this.anyOne && wrongValues.length != valueCheckNames.length));
    }
  });

  /**
   * Asserts given object has property `length` with given value `n`
   *
   * @name length
   * @alias Assertion#lengthOf
   * @memberOf Assertion
   * @category assertion property
   * @param {number} n Expected length
   * @param {string} [description] Optional message
   * @example
   *
   * [1, 2].should.have.length(2);
   */
  Assertion.add('length', function(n, description) {
    this.have.property('length', n, description);
  });

  Assertion.alias('length', 'lengthOf');

  /**
   * Asserts given object has own property. **On success it change given object to be value of property**.
   *
   * @name ownProperty
   * @alias Assertion#hasOwnProperty
   * @memberOf Assertion
   * @category assertion property
   * @param {string} name Name of property
   * @param {string} [description] Optional message
   * @example
   *
   * ({ a: 10 }).should.have.ownProperty('a');
   */
  Assertion.add('ownProperty', function(name, description) {
    name = convertPropertyName(name);
    this.params = {
      actual: this.obj,
      operator: 'to have own property ' + formatProp(name),
      message: description
    };

    this.assert(shouldUtil.hasOwnProperty(this.obj, name));

    this.obj = this.obj[name];
  });

  Assertion.alias('ownProperty', 'hasOwnProperty');

  /**
   * Asserts given object is empty. For strings, arrays and arguments it checks .length property, for objects it checks keys.
   *
   * @name empty
   * @memberOf Assertion
   * @category assertion property
   * @example
   *
   * ''.should.be.empty();
   * [].should.be.empty();
   * ({}).should.be.empty();
   */
  Assertion.add('empty', function() {
    this.params = {operator: 'to be empty'};
    this.assert(shouldTypeAdaptors.isEmpty(this.obj));
  }, true);

  /**
   * Asserts given object has such keys. Compared to `properties`, `keys` does not accept Object as a argument.
   * When calling via .key current object in assertion changed to value of this key
   *
   * @name keys
   * @alias Assertion#key
   * @memberOf Assertion
   * @category assertion property
   * @param {...*} keys Keys to check
   * @example
   *
   * ({ a: 10 }).should.have.keys('a');
   * ({ a: 10, b: 20 }).should.have.keys('a', 'b');
   * (new Map([[1, 2]])).should.have.key(1);
   */
  Assertion.add('keys', function(keys) {
    keys = aSlice.call(arguments);

    var obj = Object(this.obj);

    // first check if some keys are missing
    var missingKeys = keys.filter(function(key) {
      return !shouldTypeAdaptors.has(obj, key);
    });

    var verb = 'to have ' + (keys.length === 1 ? 'key ' : 'keys ');

    this.params = {operator: verb + keys.join(', ')};

    if (missingKeys.length > 0) {
      this.params.operator += '\n\tmissing keys: ' + missingKeys.join(', ');
    }

    this.assert(missingKeys.length === 0);
  });


  Assertion.add('key', function(key) {
    this.have.keys(key);
    this.obj = shouldTypeAdaptors.get(this.obj, key);
  });

  /**
   * Asserts given object has such value for given key
   *
   * @name value
   * @memberOf Assertion
   * @category assertion property
   * @param {*} key Key to check
   * @param {*} value Value to check
   * @example
   *
   * ({ a: 10 }).should.have.value('a', 10);
   * (new Map([[1, 2]])).should.have.value(1, 2);
   */
  Assertion.add('value', function(key, value) {
    this.have.key(key).which.is.eql(value);
  });

  /**
   * Asserts given object has such size.
   *
   * @name size
   * @memberOf Assertion
   * @category assertion property
   * @param {number} s Size to check
   * @example
   *
   * ({ a: 10 }).should.have.size(1);
   * (new Map([[1, 2]])).should.have.size(1);
   */
  Assertion.add('size', function(s) {
    this.params = { operator: 'to have size ' + s };
    shouldTypeAdaptors.size(this.obj).should.be.exactly(s);
  });

  /**
   * Asserts given object has nested property in depth by path. **On success it change given object to be value of final property**.
   *
   * @name propertyByPath
   * @memberOf Assertion
   * @category assertion property
   * @param {Array|...string} properties Properties path to search
   * @example
   *
   * ({ a: {b: 10}}).should.have.propertyByPath('a', 'b').eql(10);
   */
  Assertion.add('propertyByPath', function(properties) {
    if (arguments.length > 1) {
      properties = aSlice.call(arguments);
    } else if (arguments.length === 1 && typeof properties == 'string') {
      properties = [properties];
    } else if (arguments.length === 0) {
      properties = [];
    }

    var allProps = properties.map(formatProp);

    properties = properties.map(String);

    var obj = should(Object(this.obj));

    var foundProperties = [];

    var currentProperty;
    while (properties.length) {
      currentProperty = properties.shift();
      this.params = {operator: 'to have property by path ' + allProps.join(', ') + ' - failed on ' + formatProp(currentProperty)};
      obj = obj.have.property(currentProperty);
      foundProperties.push(currentProperty);
    }

    this.params = {obj: this.obj, operator: 'to have property by path ' + allProps.join(', ')};

    this.obj = obj.obj;
  });
}

function errorAssertions(should, Assertion) {
  var i = should.format;

  /**
   * Assert given function throws error with such message.
   *
   * @name throw
   * @memberOf Assertion
   * @category assertion errors
   * @alias Assertion#throwError
   * @param {string|RegExp|Function|Object|GeneratorFunction|GeneratorObject} [message] Message to match or properties
   * @param {Object} [properties] Optional properties that will be matched to thrown error
   * @example
   *
   * (function(){ throw new Error('fail') }).should.throw();
   * (function(){ throw new Error('fail') }).should.throw('fail');
   * (function(){ throw new Error('fail') }).should.throw(/fail/);
   *
   * (function(){ throw new Error('fail') }).should.throw(Error);
   * var error = new Error();
   * error.a = 10;
   * (function(){ throw error; }).should.throw(Error, { a: 10 });
   * (function(){ throw error; }).should.throw({ a: 10 });
   * (function*() {
   *   yield throwError();
   * }).should.throw();
   */
  Assertion.add('throw', function(message, properties) {
    var fn = this.obj;
    var err = {};
    var errorInfo = '';
    var thrown = false;

    if (shouldUtil.isGeneratorFunction(fn)) {
      return should(fn()).throw(message, properties);
    } else if (shouldUtil.isIterator(fn)) {
      return should(fn.next.bind(fn)).throw(message, properties);
    }

    this.is.a.Function();

    var errorMatched = true;

    try {
      fn();
    } catch (e) {
      thrown = true;
      err = e;
    }

    if (thrown) {
      if (message) {
        if ('string' == typeof message) {
          errorMatched = message == err.message;
        } else if (message instanceof RegExp) {
          errorMatched = message.test(err.message);
        } else if ('function' == typeof message) {
          errorMatched = err instanceof message;
        } else if (null != message) {
          try {
            should(err).match(message);
          } catch (e) {
            if (e instanceof should.AssertionError) {
              errorInfo = ": " + e.message;
              errorMatched = false;
            } else {
              throw e;
            }
          }
        }

        if (!errorMatched) {
          if ('string' == typeof message || message instanceof RegExp) {
            errorInfo = " with a message matching " + i(message) + ", but got '" + err.message + "'";
          } else if ('function' == typeof message) {
            errorInfo = " of type " + functionName(message) + ", but got " + functionName(err.constructor);
          }
        } else if ('function' == typeof message && properties) {
          try {
            should(err).match(properties);
          } catch (e) {
            if (e instanceof should.AssertionError) {
              errorInfo = ": " + e.message;
              errorMatched = false;
            } else {
              throw e;
            }
          }
        }
      } else {
        errorInfo = " (got " + i(err) + ")";
      }
    }

    this.params = { operator: 'to throw exception' + errorInfo };

    this.assert(thrown);
    this.assert(errorMatched);
  });

  Assertion.alias('throw', 'throwError');
}

function matchingAssertions(should, Assertion) {
  var i = should.format;

  /**
   * Asserts if given object match `other` object, using some assumptions:
   * First object matched if they are equal,
   * If `other` is a regexp and given object is a string check on matching with regexp
   * If `other` is a regexp and given object is an array check if all elements matched regexp
   * If `other` is a regexp and given object is an object check values on matching regexp
   * If `other` is a function check if this function throws AssertionError on given object or return false - it will be assumed as not matched
   * If `other` is an object check if the same keys matched with above rules
   * All other cases failed.
   *
   * Usually it is right idea to add pre type assertions, like `.String()` or `.Object()` to be sure assertions will do what you are expecting.
   * Object iteration happen by keys (properties with enumerable: true), thus some objects can cause small pain. Typical example is js
   * Error - it by default has 2 properties `name` and `message`, but they both non-enumerable. In this case make sure you specify checking props (see examples).
   *
   * @name match
   * @memberOf Assertion
   * @category assertion matching
   * @param {*} other Object to match
   * @param {string} [description] Optional message
   * @example
   * 'foobar'.should.match(/^foo/);
   * 'foobar'.should.not.match(/^bar/);
   *
   * ({ a: 'foo', c: 'barfoo' }).should.match(/foo$/);
   *
   * ['a', 'b', 'c'].should.match(/[a-z]/);
   *
   * (5).should.not.match(function(n) {
   *   return n < 0;
   * });
   * (5).should.not.match(function(it) {
   *    it.should.be.an.Array();
   * });
   * ({ a: 10, b: 'abc', c: { d: 10 }, d: 0 }).should
   * .match({ a: 10, b: /c$/, c: function(it) {
   *    return it.should.have.property('d', 10);
   * }});
   *
   * [10, 'abc', { d: 10 }, 0].should
   * .match({ '0': 10, '1': /c$/, '2': function(it) {
   *    return it.should.have.property('d', 10);
   * }});
   *
   * var myString = 'abc';
   *
   * myString.should.be.a.String().and.match(/abc/);
   *
   * myString = {};
   *
   * myString.should.match(/abc/); //yes this will pass
   * //better to do
   * myString.should.be.an.Object().and.not.empty().and.match(/abc/);//fixed
   *
   * (new Error('boom')).should.match(/abc/);//passed because no keys
   * (new Error('boom')).should.not.match({ message: /abc/ });//check specified property
   */
  Assertion.add('match', function(other, description) {
    this.params = {operator: 'to match ' + i(other), message: description};

    if (eql(this.obj, other).length !== 0) {
      if (other instanceof RegExp) { // something - regex

        if (typeof this.obj == 'string') {

          this.assert(other.exec(this.obj));
        } else if (null != this.obj && typeof this.obj == 'object') {

          var notMatchedProps = [], matchedProps = [];
          shouldTypeAdaptors.forEach(this.obj, function(value, name) {
            if (other.exec(value)) {
              matchedProps.push(formatProp(name));
            } else {
              notMatchedProps.push(formatProp(name) + ' (' + i(value) + ')');
            }
          }, this);

          if (notMatchedProps.length) {
            this.params.operator += '\n    not matched properties: ' + notMatchedProps.join(', ');
          }
          if (matchedProps.length) {
            this.params.operator += '\n    matched properties: ' + matchedProps.join(', ');
          }

          this.assert(notMatchedProps.length === 0);
        } // should we try to convert to String and exec?
      } else if (typeof other == 'function') {
        var res;

        res = other(this.obj);

        //if we throw exception ok - it is used .should inside
        if (typeof res == 'boolean') {
          this.assert(res); // if it is just boolean function assert on it
        }
      } else if (other != null && this.obj != null && typeof other == 'object' && typeof this.obj == 'object') { // try to match properties (for Object and Array)
        notMatchedProps = [];
        matchedProps = [];

        shouldTypeAdaptors.forEach(other, function(value, key) {
          try {
            should(this.obj).have.property(key).which.match(value);
            matchedProps.push(formatProp(key));
          } catch (e) {
            if (e instanceof should.AssertionError) {
              notMatchedProps.push(formatProp(key) + ' (' + i(this.obj[key]) + ')');
            } else {
              throw e;
            }
          }
        }, this);

        if (notMatchedProps.length) {
          this.params.operator += '\n    not matched properties: ' + notMatchedProps.join(', ');
        }
        if (matchedProps.length) {
          this.params.operator += '\n    matched properties: ' + matchedProps.join(', ');
        }

        this.assert(notMatchedProps.length === 0);
      } else {
        this.assert(false);
      }
    }
  });

  /**
   * Asserts if given object values or array elements all match `other` object, using some assumptions:
   * First object matched if they are equal,
   * If `other` is a regexp - matching with regexp
   * If `other` is a function check if this function throws AssertionError on given object or return false - it will be assumed as not matched
   * All other cases check if this `other` equal to each element
   *
   * @name matchEach
   * @memberOf Assertion
   * @category assertion matching
   * @alias Assertion#matchEvery
   * @param {*} other Object to match
   * @param {string} [description] Optional message
   * @example
   * [ 'a', 'b', 'c'].should.matchEach(/\w+/);
   * [ 'a', 'a', 'a'].should.matchEach('a');
   *
   * [ 'a', 'a', 'a'].should.matchEach(function(value) { value.should.be.eql('a') });
   *
   * { a: 'a', b: 'a', c: 'a' }.should.matchEach(function(value) { value.should.be.eql('a') });
   */
  Assertion.add('matchEach', function(other, description) {
    this.params = {operator: 'to match each ' + i(other), message: description};

    shouldTypeAdaptors.forEach(this.obj, function(value) {
      should(value).match(other);
    }, this);
  });

  /**
  * Asserts if any of given object values or array elements match `other` object, using some assumptions:
  * First object matched if they are equal,
  * If `other` is a regexp - matching with regexp
  * If `other` is a function check if this function throws AssertionError on given object or return false - it will be assumed as not matched
  * All other cases check if this `other` equal to each element
  *
  * @name matchAny
  * @memberOf Assertion
  * @category assertion matching
  * @param {*} other Object to match
  * @alias Assertion#matchSome
  * @param {string} [description] Optional message
  * @example
  * [ 'a', 'b', 'c'].should.matchAny(/\w+/);
  * [ 'a', 'b', 'c'].should.matchAny('a');
  *
  * [ 'a', 'b', 'c'].should.matchAny(function(value) { value.should.be.eql('a') });
  *
  * { a: 'a', b: 'b', c: 'c' }.should.matchAny(function(value) { value.should.be.eql('a') });
  */
  Assertion.add('matchAny', function(other, description) {
    this.params = {operator: 'to match any ' + i(other), message: description};

    this.assert(shouldTypeAdaptors.some(this.obj, function(value) {
      try {
        should(value).match(other);
        return true;
      } catch (e) {
        if (e instanceof should.AssertionError) {
          // Caught an AssertionError, return false to the iterator
          return false;
        }
        throw e;
      }
    }));
  });

  Assertion.alias('matchAny', 'matchSome');
  Assertion.alias('matchEach', 'matchEvery');
}

/**
 * Our function should
 *
 * @param {*} obj Object to assert
 * @returns {should.Assertion} Returns new Assertion for beginning assertion chain
 * @example
 *
 * var should = require('should');
 * should('abc').be.a.String();
 */
function should(obj) {
  return (new Assertion(obj));
}

should.AssertionError = AssertionError;
should.Assertion = Assertion;

// exposing modules dirty way
should.modules = {
  format: sformat,
  type: getType,
  equal: eql
};
should.format = format;

/**
 * Object with configuration.
 * It contains such properties:
 * * `checkProtoEql` boolean - Affect if `.eql` will check objects prototypes
 * * `plusZeroAndMinusZeroEqual` boolean - Affect if `.eql` will treat +0 and -0 as equal
 * Also it can contain options for should-format.
 *
 * @type {Object}
 * @memberOf should
 * @static
 * @example
 *
 * var a = { a: 10 }, b = Object.create(null);
 * b.a = 10;
 *
 * a.should.be.eql(b);
 * //not throws
 *
 * should.config.checkProtoEql = true;
 * a.should.be.eql(b);
 * //throws AssertionError: expected { a: 10 } to equal { a: 10 } (because A and B have different prototypes)
 */
should.config = config;

/**
 * Allow to extend given prototype with should property using given name. This getter will **unwrap** all standard wrappers like `Number`, `Boolean`, `String`.
 * Using `should(obj)` is the equivalent of using `obj.should` with known issues (like nulls and method calls etc).
 *
 * To add new assertions, need to use Assertion.add method.
 *
 * @param {string} [propertyName] Name of property to add. Default is `'should'`.
 * @param {Object} [proto] Prototype to extend with. Default is `Object.prototype`.
 * @memberOf should
 * @returns {{ name: string, descriptor: Object, proto: Object }} Descriptor enough to return all back
 * @static
 * @example
 *
 * var prev = should.extend('must', Object.prototype);
 *
 * 'abc'.must.startWith('a');
 *
 * var should = should.noConflict(prev);
 * should.not.exist(Object.prototype.must);
 */
should.extend = function(propertyName, proto) {
  propertyName = propertyName || 'should';
  proto = proto || Object.prototype;

  var prevDescriptor = Object.getOwnPropertyDescriptor(proto, propertyName);

  Object.defineProperty(proto, propertyName, {
    set: function() {
    },
    get: function() {
      return should(isWrapperType(this) ? this.valueOf() : this);
    },
    configurable: true
  });

  return { name: propertyName, descriptor: prevDescriptor, proto: proto };
};

/**
 * Delete previous extension. If `desc` missing it will remove default extension.
 *
 * @param {{ name: string, descriptor: Object, proto: Object }} [desc] Returned from `should.extend` object
 * @memberOf should
 * @returns {Function} Returns should function
 * @static
 * @example
 *
 * var should = require('should').noConflict();
 *
 * should(Object.prototype).not.have.property('should');
 *
 * var prev = should.extend('must', Object.prototype);
 * 'abc'.must.startWith('a');
 * should.noConflict(prev);
 *
 * should(Object.prototype).not.have.property('must');
 */
should.noConflict = function(desc) {
  desc = desc || should._prevShould;

  if (desc) {
    delete desc.proto[desc.name];

    if (desc.descriptor) {
      Object.defineProperty(desc.proto, desc.name, desc.descriptor);
    }
  }
  return should;
};

/**
 * Simple utility function for a bit more easier should assertion extension
 * @param {Function} f So called plugin function. It should accept 2 arguments: `should` function and `Assertion` constructor
 * @memberOf should
 * @returns {Function} Returns `should` function
 * @static
 * @example
 *
 * should.use(function(should, Assertion) {
 *   Assertion.add('asset', function() {
 *      this.params = { operator: 'to be asset' };
 *
 *      this.obj.should.have.property('id').which.is.a.Number();
 *      this.obj.should.have.property('path');
 *  })
 * })
 */
should.use = function(f) {
  f(should, should.Assertion);
  return this;
};

should
  .use(assertExtensions)
  .use(chainAssertions)
  .use(booleanAssertions)
  .use(numberAssertions)
  .use(equalityAssertions)
  .use(typeAssertions)
  .use(stringAssertions)
  .use(propertyAssertions)
  .use(errorAssertions)
  .use(matchingAssertions)
  .use(containAssertions)
  .use(promiseAssertions);

module.exports = should;
},{"should-equal":12,"should-format":13,"should-type":15,"should-type-adaptors":14,"should-util":16}],18:[function(require,module,exports){
var should = require('./cjs/should');

var defaultProto = Object.prototype;
var defaultProperty = 'should';

//Expose api via `Object#should`.
try {
  var prevShould = should.extend(defaultProperty, defaultProto);
  should._prevShould = prevShould;
} catch(e) {
  //ignore errors
}

module.exports = should;

},{"./cjs/should":17}],19:[function(require,module,exports){
/**
 * @param {Object} obj
 * @returns {Function}
 */

function staticProps (obj) {
  /**
   * @param {Object} props
   * @param {Boolean} [enumerable]
   */
  return function (props, enumerable) {
    var staticProps = {}

    for (var propName in props) {
      var staticProp = {
        configurable: false,
        enumerable: enumerable
      }
      var prop = props[propName]

      if (typeof prop === 'function') staticProp.get = prop
      else {
        staticProp.value = prop

        staticProp.writable = false
      }

      staticProps[propName] = staticProp
    }
    Object.defineProperties(obj, staticProps)
  }
}
module.exports = staticProps

},{}],20:[function(require,module,exports){
// In browserify context, *strict-mode* fall back to a no op.
module.exports = function (cb) { cb() }

},{}],21:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var isequal = require('lodash.isequal');
var isInteger = require('is-integer');
var uniqueid = require('lodash.uniqueid');
var uniqby = require('lodash.uniqby');
var staticProps = require('static-props');

var getDegree = require('./getDegree');
var getIncidentEdgeIds = require('./getIncidentEdgeIds');
var _getRank = require('./getRank');

/**
 * Hypergraph
 *
 * http://en.wikipedia.org/wiki/Hypergraph
 *
 * @param {Object} [graph]
 * @param {Object} [graph.edges]
 * @param {Object} [graph.nodes]
 * @param {Boolean} [graph.multigraph] can contain duplicated edges
 * @param {Boolean} [graph.pseudograph] is a multigraph with loops allowed
 * @param {Number} [graph.uniform] all edges has the same cardinality (i.e. number of nodes)
 *
 * @class
 */

// TODO add options like
// * rank, maxDegree, etc
// if it is directed, an a -> b edge is different from b -> a

var Graph = function () {
  function Graph() {
    _classCallCheck(this, Graph);

    var arg = arguments[0] || {};
    var obj = {};

    if (isInteger(arg.uniform)) {
      if (arg.uniform < 2) {
        throw new TypeError('Argument uniform cannot be less than 2');
      } else {
        obj.uniform = arg.uniform;
      }
    }

    if (arg.multigraph === true) obj.multigraph = true;

    if (arg.pseudograph === true) {
      obj.multigraph = true;
      obj.pseudograph = true;
    }

    obj.edges = arg.edges || {};
    obj.nodes = arg.nodes || {};

    var enumerable = true;
    staticProps(this)(obj, enumerable);
  }

  /**
   * Add an hyperedge that connects given nodeIds.
   *
   * @param {Array} nodeIds
   * @returns {String} id
   */

  _createClass(Graph, [{
    key: 'addEdge',
    value: function addEdge(nodeIds) {
      var _this = this;

      if (nodeIds.length < 2) {
        throw new Error('An edge must point at two or more nodes');
      }

      var uniform = this.uniform;

      if (uniform) {
        var cardinality = nodeIds.length;

        if (uniform !== cardinality) {
          throw new Error('Cannot add an edge with cardinality ' + cardinality + ' to a ' + uniform + '-uniform graph');
        }
      }

      if (!this.pseudograph) {
        if (uniqby(nodeIds).length < nodeIds.length) {
          throw new Error('This is not a pseudograph, it is not allowed to create loops');
        }
      }

      if (!this.multigraph) {
        for (var edgeId in this.edges) {
          var edge = this.edges[edgeId];

          if (isequal(nodeIds, edge)) {
            throw new Error('This is not a multigraph, you cannot add duplicated edges');
          }
        }
      }

      var nodeIdsNotFound = nodeIds.filter(function (id) {
        return !_this.nodes.hasOwnProperty(id);
      });

      if (nodeIdsNotFound.length > 0) {
        throw new Error('Edge points to some nodeId not found in this graph; ' + nodeIdsNotFound.join(','));
      }

      var id = uniqueid();

      this.edges[id] = nodeIds;

      return id;
    }

    /**
     * Add a node, containing given data.
     *
     * @param {*} data
     * @returns {String} id of the node created
     */

  }, {
    key: 'addNode',
    value: function addNode(data) {
      var id = uniqueid();

      this.nodes[id] = data;

      return id;
    }

    /**
     * Returns the degree of a node, that is the number of incident edges with loops counted twice.
     *
     * @param {String} nodeId
     * @returns {Number} degree
     */

  }, {
    key: 'degreeOf',
    value: function degreeOf(nodeId) {
      return getDegree(this.edges, nodeId);
    }

    /**
     * Delete edge by given id.
     *
     * @param {String} id
     * @returns {void}
     */

  }, {
    key: 'delEdge',
    value: function delEdge(id) {
      delete this.edges[id];
    }

    /**
     * Delete node by given id.
     *
     * @param {String} id
     * @returns {void}
     */

  }, {
    key: 'delNode',
    value: function delNode(id) {
      delete this.nodes[id];

      var incidentEdgeIds = getIncidentEdgeIds(this.edges, id);

      // TODO in an hypergraph it should not remove the edge, but
      // remove the nodeIds from edges. and remove the edge if it is empty.
      // Document in the README and the jsdoc above that it removes also edges
      for (var edgeId in incidentEdgeIds) {
        this.delEdge(edgeId);
      }
    }

    /**
     * Returns the max cardinality of any of the edges in the hypergraph.
     *
     * @returns {Number} rank
     */

  }, {
    key: 'getRank',
    value: function getRank() {
      if (this.uniform) return this.uniform;

      return _getRank(this.edges);
    }
  }]);

  return Graph;
}();

module.exports = Graph;

},{"./getDegree":23,"./getIncidentEdgeIds":24,"./getRank":26,"is-integer":5,"lodash.isequal":7,"lodash.uniqby":8,"lodash.uniqueid":9,"static-props":19}],22:[function(require,module,exports){
"use strict";

/**
 * Compute adjacent nodes
 *
 * @param {Object} edges
 * @param {String} nodeId
 * @returns {Array} adjacentNodeIds
 */

var getAdjacentNodeIds = function getAdjacentNodeIds(edges, nodeId) {
  var adjacentNodeIds = [];

  var givenNodeId = function givenNodeId(id) {
    return id !== nodeId;
  };

  var foundNodeIds = function foundNodeIds(id) {
    return adjacentNodeIds.indexOf(id) === -1;
  };

  for (var edgeId in edges) {
    var edge = edges[edgeId];

    // Nothing to do if edge does not contain nodeId.
    if (edge.indexOf(nodeId) === -1) continue;

    // Take all nodeIds except given nodeId, avoid repetitions.
    var nodeIds = edge.filter(givenNodeId).filter(foundNodeIds);

    adjacentNodeIds = adjacentNodeIds.concat(nodeIds);
  }

  return adjacentNodeIds;
};

module.exports = getAdjacentNodeIds;

},{}],23:[function(require,module,exports){
"use strict";

/**
 * The degree of a vertex is the number of incident edges, with loops counted twice.
 *
 * http://en.wikipedia.org/wiki/Degree_(graph_theory)
 *
 * @param {Object} edges
 * @param {String} nodeId
 * @returns {Number} degree
 */

var getDegree = function getDegree(edges, nodeId) {
  var degree = 0;

  var countIncidents = function countIncidents(id) {
    if (id === nodeId) {
      degree++;
    }
  };

  for (var edgeId in edges) {
    var edge = edges[edgeId];

    edge.forEach(countIncidents);
  }

  return degree;
};

module.exports = getDegree;

},{}],24:[function(require,module,exports){
"use strict";

/**
 * Edges incident to given node
 *
 * @param {Object} edges
 * @param {String} nodeId
 * @returns {Array} incidentEdgeIds
 */

var getIncidentEdgeIds = function getIncidentEdgeIds(edges, nodeId) {
  var incidentEdgeIds = [];

  var pushUniqueIncidents = function pushUniqueIncidents(edgeId, nodeId, id) {
    var isIncident = id === nodeId;
    var isUnique = incidentEdgeIds.indexOf(edgeId) < 0;

    if (isIncident && isUnique) {
      incidentEdgeIds.push(edgeId);
    }
  };

  for (var edgeId in edges) {
    var edge = edges[edgeId];

    edge.forEach(pushUniqueIncidents.bind(null, edgeId, nodeId));
  }

  return incidentEdgeIds;
};

module.exports = getIncidentEdgeIds;

},{}],25:[function(require,module,exports){
'use strict';

var no = require('not-defined');

/**
 * Compute edges which does not refer to existing nodeIds
 *
 * @param {Object} edges
 * @param {Object} nodes
 * @returns {Array} orphanEdgeIds
 */

var getOrphanEdgeIds = function getOrphanEdgeIds(edges, nodes) {
  var orphanEdgeIds = [];

  var nodeIdsNotFound = function nodeIdsNotFound(nodeId) {
    return no(nodes[nodeId]);
  };

  for (var edgeId in edges) {
    var edge = edges[edgeId];

    if (edge.filter(nodeIdsNotFound).length > 0) {
      orphanEdgeIds.push(edgeId);
    }
  }

  return orphanEdgeIds;
};

module.exports = getOrphanEdgeIds;

},{"not-defined":10}],26:[function(require,module,exports){
"use strict";

/**
  The rank is the maximum cardinality of any of the edges in the hypergraph
 *
 * @params {Object} edges
 * @returns {Number} rank
 */

var getRank = function getRank(edges) {
  var rank = 0;

  for (var edgeId in edges) {
    var edge = edges[edgeId];
    rank = Math.max(rank, edge.length);
  }

  return rank;
};

module.exports = getRank;

},{}],27:[function(require,module,exports){
'use strict';

require('strict-mode')(function () {
  exports.Graph = require('./Graph');
});

},{"./Graph":21,"strict-mode":20}],28:[function(require,module,exports){
'use strict';

describe('default Graph', function () {
  var no = require('not-defined');
  var should = require('should');

  var Graph = require('iper').Graph;

  var nodeData1 = 'foo';
  var nodeData2 = ['bar'];

  var graph = new Graph();
  var nodeId1;
  var nodeId2;
  var edgeId1;

  describe('constructor', function () {
    it('defaults to an empty graph', function () {
      graph.edges.should.deepEqual({});
      graph.nodes.should.deepEqual({});

      should.not.exist(graph.multigraph);
      should.not.exist(graph.pseudograph);
    });
  });

  describe('addNode()', function () {
    it('creates a node', function () {
      nodeId1 = graph.addNode(nodeData1);
      graph.nodes[nodeId1].should.be.eql(nodeData1);
    });

    it('returns an id', function () {
      nodeId2 = graph.addNode(nodeData2);
      nodeId2.should.be.a.String;
    });
  });

  describe('addEdge()', function () {
    it('creates an edge', function () {
      var nodeIds = [nodeId1, nodeId2];

      edgeId1 = graph.addEdge(nodeIds);

      graph.edges[edgeId1].should.be.eql(nodeIds);
    });

    it('requires at least two nodeIds', function () {
      var nodeId = graph.addNode();

      var nodeIds = [nodeId];(function () {
        graph.addEdge(nodeIds);
      }).should.throw();
    });

    it('cannot create an edge pointing to some nodeId not found', function () {
      var nodeId1 = graph.addNode();
      var nodeId2 = graph.addNode();

      var nodeIds = [nodeId1, 'nodeIdNotFound', nodeId2];(function () {
        graph.addEdge(nodeIds);
      }).should.throw();
    });

    it('can create edges with cardinality greater than 2', function () {
      var graph = new Graph();

      var nodeId1 = graph.addNode();
      var nodeId2 = graph.addNode();
      var nodeId3 = graph.addNode();

      var nodeIds = [nodeId1, nodeId2, nodeId3];

      var edgeId1 = graph.addEdge(nodeIds);

      graph.edges[edgeId1].should.be.eql(nodeIds);
    });

    it('returns an id', function () {
      edgeId1.should.be.a.String;
    });

    it('cannot create loops', function () {
      var nodeId = graph.addNode();

      var nodeIds = [nodeId, nodeId];(function () {
        graph.addEdge(nodeIds);
      }).should.throw();
    });

    it('cannot create duplicated edges', function () {
      var nodeId1 = graph.addNode();
      var nodeId2 = graph.addNode();

      graph.addEdge([nodeId1, nodeId2]);(function () {
        graph.addEdge([nodeId1, nodeId2]);
      }).should.throw();
    });
  });

  describe('degreeOf(nodeId)', function () {
    it('returns the degree of a node', function () {
      graph.degreeOf(nodeId1).should.be.eql(1);
    });
  });

  describe('delNode()', function () {
    it('removes a node', function () {
      graph.delNode(nodeId1);

      var nodeNotDefined = no(graph.nodes[nodeId1]);
      nodeNotDefined.should.be.true;
    });

    it('removes incident edges', function () {
      var incidentEdgeRemoved = no(graph.edges[edgeId1]);
      incidentEdgeRemoved.should.be.true;
    });
  });

  describe('delEdge()', function () {
    it('removes an edge', function () {
      nodeId1 = graph.addNode(nodeData1);
      nodeId2 = graph.addNode(nodeData2);
      var nodeIds = [nodeId1, nodeId2];
      edgeId1 = graph.addEdge(nodeIds);

      graph.delEdge(edgeId1);

      var edgeNotDefined = typeof graph.edges[edgeId1] === 'undefined';
      edgeNotDefined.should.be.true;
    });
  });

  describe('getRank()', function () {
    it('returns the max cardinality of any edge', function () {
      var graph = new Graph();

      var nodeId1 = graph.addNode();
      var nodeId2 = graph.addNode();
      var nodeId3 = graph.addNode();
      var nodeId4 = graph.addNode();

      graph.addEdge([nodeId1, nodeId2]);
      graph.addEdge([nodeId3, nodeId2]);
      graph.addEdge([nodeId1, nodeId4]);

      graph.getRank().should.be.eql(2);

      graph.addEdge([nodeId1, nodeId2, nodeId3]);

      graph.getRank().should.be.eql(3);

      graph.addEdge([nodeId4, nodeId1, nodeId2, nodeId3]);

      graph.getRank().should.be.eql(4);
    });
  });
});

},{"iper":27,"not-defined":10,"should":18}],29:[function(require,module,exports){
module.exports={
  "nodes": {
    "1": "foo",
    "2": "bar"
  },
  "edges": {
    "0": ["1", "2"]
  }
}

},{}],30:[function(require,module,exports){
module.exports={
  "edges": {
    "0": ["a", "b", "c"],
    "1": ["b", "c", "a"],
    "2": ["c", "a", "b"]
  },
  "nodes": {
    "a": 1,
    "b": 2,
    "c": 3
  }
}

},{}],31:[function(require,module,exports){
module.exports={
  "nodes": {
    "isolated": "node",
    "another": ["node"],
    "yet": {"another": 1}
  },
  "edges": {
    "0": ["another", "yet"]
  }
}

},{}],32:[function(require,module,exports){
module.exports={
  "nodes": {
    "0": "foo"
  },
  "edges": {
    "1": ["0", "0"]
  }
}

},{}],33:[function(require,module,exports){
module.exports={
  "nodes": {
    "1": "foo",
    "2": "bar"
  },
  "edges": {
    "0": ["3", "2"]
  } 
}

},{}],34:[function(require,module,exports){
module.exports={
  "nodes": {
    "1": "foo",
    "2": "bar"
  },
  "edges": {
    "0": ["1", "2"],
    "3": ["4", "5"],
    "6": ["7", "8"]
  } 
}

},{}],35:[function(require,module,exports){
'use strict';

describe('getAdjacentNodeIds', function () {
  var getAdjacentNodeIds = require('./utils').getAdjacentNodeIds;

  var graph1 = require('./examples/graphs/graph1.json');
  var graph2 = require('./examples/graphs/graph2.json');

  it('is mutual', function () {
    var edges = graph1.edges;
    var nodeId1 = '1';
    var nodeId2 = '2';

    getAdjacentNodeIds(edges, nodeId1).should.be.eql([nodeId2]);
    getAdjacentNodeIds(edges, nodeId2).should.be.eql([nodeId1]);
  });

  it('returns an empty array if there is no adjacent node', function () {
    var edges = graph1.edges;
    var nodeId = 'not found';

    getAdjacentNodeIds(edges, nodeId).should.be.eql([]);
  });

  it('returns adjacent nodes', function () {
    var edges = graph2.edges;
    var nodeId;

    nodeId = 'a';
    getAdjacentNodeIds(edges, nodeId).should.be.eql(['b', 'c']);

    nodeId = 'b';
    getAdjacentNodeIds(edges, nodeId).should.be.eql(['a', 'c']);
  });
});

},{"./examples/graphs/graph1.json":29,"./examples/graphs/graph2.json":30,"./utils":43}],36:[function(require,module,exports){
'use strict';

describe('getDegree', function () {
  var getDegree = require('./utils').getDegree;

  var graph1 = require('./examples/graphs/graph1.json');
  var isolatedNode = require('./examples/graphs/isolatedNode.json');
  var loop1 = require('./examples/graphs/loop1.json');

  it('returns number of incident edges', function () {
    var edges = graph1.edges;

    getDegree(edges, '1').should.be.eql(1);
    getDegree(edges, '2').should.be.eql(1);
  });

  it('is 0 for isolated nodes', function () {
    var edges = isolatedNode.edges;

    getDegree(edges, 'isolated').should.be.eql(0);
  });

  it('counts loops twice', function () {
    var edges = loop1.edges;

    getDegree(edges, '0').should.be.eql(2);
  });
});

},{"./examples/graphs/graph1.json":29,"./examples/graphs/isolatedNode.json":31,"./examples/graphs/loop1.json":32,"./utils":43}],37:[function(require,module,exports){
'use strict';

describe('getIncidentEdgeIds', function () {
  var getIncidentEdgeIds = require('./utils').getIncidentEdgeIds;

  var graph1 = require('./examples/graphs/graph1.json');
  var graph2 = require('./examples/graphs/graph2.json');
  var isolatedNode = require('./examples/graphs/isolatedNode.json');

  it('returns an empty array if there is no incident edge', function () {
    var nodeId = 'isolated';
    var edges = isolatedNode.edges;

    getIncidentEdgeIds(edges, nodeId).should.be.eql([]);
  });

  it('returns incident edges', function () {
    var result;
    var nodeId;
    var edges;

    nodeId = '1';
    edges = graph1.edges;
    result = ['0'];
    getIncidentEdgeIds(edges, nodeId).should.be.eql(result);

    nodeId = '2';
    edges = graph1.edges;
    result = ['0'];
    getIncidentEdgeIds(edges, nodeId).should.be.eql(result);

    nodeId = 'a';
    edges = graph2.edges;
    result = ['0', '1', '2'];
    getIncidentEdgeIds(edges, nodeId).should.be.eql(result);

    nodeId = 'b';
    edges = graph2.edges;
    result = ['0', '1', '2'];
    getIncidentEdgeIds(edges, nodeId).should.be.eql(result);

    nodeId = 'c';
    edges = graph2.edges;
    result = ['0', '1', '2'];
    getIncidentEdgeIds(edges, nodeId).should.be.eql(result);
  });
});

},{"./examples/graphs/graph1.json":29,"./examples/graphs/graph2.json":30,"./examples/graphs/isolatedNode.json":31,"./utils":43}],38:[function(require,module,exports){
'use strict';

describe('getOrphanEdgeIds', function () {
  var getOrphanEdgeIds = require('./utils').getOrphanEdgeIds;

  var graph1 = require('./examples/graphs/graph1.json');
  var orphanEdges1 = require('./examples/graphs/orphanEdges1.json');
  var orphanEdges2 = require('./examples/graphs/orphanEdges2.json');

  it('returns orphan edges', function () {
    getOrphanEdgeIds(orphanEdges1.edges, orphanEdges1.nodes).should.be.eql(['0']);

    getOrphanEdgeIds(orphanEdges2.edges, orphanEdges2.nodes).should.be.eql(['3', '6']);
  });

  it('returns an empty array if there is no orphan edge', function () {
    var edges = graph1.edges;
    var nodes = graph1.nodes;

    getOrphanEdgeIds(edges, nodes).should.be.eql([]);
  });
});

},{"./examples/graphs/graph1.json":29,"./examples/graphs/orphanEdges1.json":33,"./examples/graphs/orphanEdges2.json":34,"./utils":43}],39:[function(require,module,exports){
'use strict';

describe('getRank', function () {
  var getRank = require('./utils').getRank;

  var graph1 = require('./examples/graphs/graph1.json');
  var graph2 = require('./examples/graphs/graph2.json');

  it('returns the maximum cardinality of the edges', function () {
    getRank(graph1.edges).should.be.eql(2);
    getRank(graph2.edges).should.be.eql(3);
  });
});

},{"./examples/graphs/graph1.json":29,"./examples/graphs/graph2.json":30,"./utils":43}],40:[function(require,module,exports){
'use strict';

describe('multi Graph', function () {
  var should = require('should');

  var Graph = require('iper').Graph;

  var graph = new Graph({ multigraph: true });

  describe('constructor', function () {
    it('accepts multigraph flag and adds it to attributes', function () {
      graph.multigraph.should.be.true;
    });
  });

  describe('addEdge()', function () {
    it('cannot add duplicated edges', function () {
      var nodeId1 = graph.addNode();
      var nodeId2 = graph.addNode();

      var edgeId1 = graph.addEdge([nodeId1, nodeId2]);
      var edgeId2 = graph.addEdge([nodeId1, nodeId2]);

      should.deepEqual(graph.edges[edgeId1], graph.edges[edgeId2]);
      edgeId1.should.be.not.equal(edgeId2);
    });
  });
});

},{"iper":27,"should":18}],41:[function(require,module,exports){
'use strict';

describe('pseudo Graph', function () {
  var Graph = require('iper').Graph;

  var graph = new Graph({ pseudograph: true });

  describe('constructor', function () {
    it('accepts pseudograph flag and adds it to attributes', function () {
      graph.pseudograph.should.be.true;
    });

    it('implies multigraph', function () {
      graph.multigraph.should.be.true;
    });
  });

  describe('addEdge()', function () {
    it('can create loops', function () {
      var nodeId = graph.addNode();
      var nodeIds = [nodeId, nodeId];

      var edgeId = graph.addEdge(nodeIds);

      graph.edges[edgeId].should.be.eql(nodeIds);
    });
  });
});

},{"iper":27}],42:[function(require,module,exports){
'use strict';

describe('uniform Graph', function () {
  var Graph = require('iper').Graph;
  var k = 2;

  var graph = new Graph({ uniform: k });

  describe('constructor', function () {
    it('accepts uniform flag and adds it to attributes', function () {
      graph.uniform.should.be.eql(k);
    });

    it('required uniform to be equal or grater than 2', function () {
      ;(function () {
        Graph({ uniform: -2 });
      }).should.throw();(function () {
        Graph({ uniform: 1 });
      }).should.throw();
    });
  });

  describe('addEdge()', function () {
    it('cannot create edges with cardinality other than k', function () {
      var nodeId1 = graph.addNode();
      var nodeId2 = graph.addNode();
      var nodeId3 = graph.addNode();

      var nodeIds = [nodeId1, nodeId2, nodeId3];(function () {
        graph.addEdge(nodeIds);
      }).should.throw();
    });
  });

  describe('getRank()', function () {
    it('returns the value of uniform, even if the graph is still empty', function () {
      var rank = 10;

      var graph = new Graph({ uniform: rank });

      rank.should.be.equal(graph.getRank());
    });
  });
});

},{"iper":27}],43:[function(require,module,exports){
'use strict';

require('strict-mode')(function () {
  exports.getAdjacentNodeIds = require('../src/getAdjacentNodeIds');
  exports.getDegree = require('../src/getDegree');
  exports.getIncidentEdgeIds = require('../src/getIncidentEdgeIds');
  exports.getOrphanEdgeIds = require('../src/getOrphanEdgeIds');
  exports.getRank = require('../src/getRank');
});

},{"../src/getAdjacentNodeIds":22,"../src/getDegree":23,"../src/getIncidentEdgeIds":24,"../src/getOrphanEdgeIds":25,"../src/getRank":26,"strict-mode":20}]},{},[28,35,36,37,38,39,40,41,42,43]);
