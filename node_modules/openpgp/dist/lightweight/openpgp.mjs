/*! OpenPGP.js v6.1.0 - 2025-01-30 - this is LGPL licensed code, see LICENSE/our website https://openpgpjs.org/ for more information. */
const globalThis = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

const doneWritingPromise = Symbol('doneWritingPromise');
const doneWritingResolve = Symbol('doneWritingResolve');
const doneWritingReject = Symbol('doneWritingReject');

const readingIndex = Symbol('readingIndex');

class ArrayStream extends Array {
  constructor() {
    super();
    // ES5 patch, see https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
    Object.setPrototypeOf(this, ArrayStream.prototype);

    this[doneWritingPromise] = new Promise((resolve, reject) => {
      this[doneWritingResolve] = resolve;
      this[doneWritingReject] = reject;
    });
    this[doneWritingPromise].catch(() => {});
  }
}

ArrayStream.prototype.getReader = function() {
  if (this[readingIndex] === undefined) {
    this[readingIndex] = 0;
  }
  return {
    read: async () => {
      await this[doneWritingPromise];
      if (this[readingIndex] === this.length) {
        return { value: undefined, done: true };
      }
      return { value: this[this[readingIndex]++], done: false };
    }
  };
};

ArrayStream.prototype.readToEnd = async function(join) {
  await this[doneWritingPromise];
  const result = join(this.slice(this[readingIndex]));
  this.length = 0;
  return result;
};

ArrayStream.prototype.clone = function() {
  const clone = new ArrayStream();
  clone[doneWritingPromise] = this[doneWritingPromise].then(() => {
    clone.push(...this);
  });
  return clone;
};

/**
 * Check whether data is an ArrayStream
 * @param {Any} input  data to check
 * @returns {boolean}
 */
function isArrayStream(input) {
  return input && input.getReader && Array.isArray(input);
}

/**
 * A wrapper class over the native WritableStreamDefaultWriter.
 * It also lets you "write data to" array streams instead of streams.
 * @class
 */
function Writer(input) {
  if (!isArrayStream(input)) {
    const writer = input.getWriter();
    const releaseLock = writer.releaseLock;
    writer.releaseLock = () => {
      writer.closed.catch(function() {});
      releaseLock.call(writer);
    };
    return writer;
  }
  this.stream = input;
}

/**
 * Write a chunk of data.
 * @returns {Promise<undefined>}
 * @async
 */
Writer.prototype.write = async function(chunk) {
  this.stream.push(chunk);
};

/**
 * Close the stream.
 * @returns {Promise<undefined>}
 * @async
 */
Writer.prototype.close = async function() {
  this.stream[doneWritingResolve]();
};

/**
 * Error the stream.
 * @returns {Promise<Object>}
 * @async
 */
Writer.prototype.abort = async function(reason) {
  this.stream[doneWritingReject](reason);
  return reason;
};

/**
 * Release the writer's lock.
 * @returns {undefined}
 * @async
 */
Writer.prototype.releaseLock = function() {};

/* eslint-disable no-prototype-builtins */
typeof globalThis.process === 'object' &&
  typeof globalThis.process.versions === 'object';

/**
 * Check whether data is a Stream, and if so of which type
 * @param {Any} input  data to check
 * @returns {'web'|'node'|'array'|'web-like'|false}
 */
function isStream(input) {
  if (isArrayStream(input)) {
    return 'array';
  }
  if (globalThis.ReadableStream && globalThis.ReadableStream.prototype.isPrototypeOf(input)) {
    return 'web';
  }
  // try and detect a node native stream without having to import its class
  if (input &&
    !(globalThis.ReadableStream && input instanceof globalThis.ReadableStream) &&
    typeof input._read === 'function' && typeof input._readableState === 'object') {
    throw new Error('Native Node streams are no longer supported: please manually convert the stream to a WebStream, using e.g. `stream.Readable.toWeb`');
  }
  if (input && input.getReader) {
    return 'web-like';
  }
  return false;
}

/**
 * Check whether data is a Uint8Array
 * @param {Any} input  data to check
 * @returns {Boolean}
 */
function isUint8Array(input) {
  return Uint8Array.prototype.isPrototypeOf(input);
}

/**
 * Concat Uint8Arrays
 * @param {Array<Uint8array>} Array of Uint8Arrays to concatenate
 * @returns {Uint8array} Concatenated array
 */
function concatUint8Array(arrays) {
  if (arrays.length === 1) return arrays[0];

  let totalLength = 0;
  for (let i = 0; i < arrays.length; i++) {
    if (!isUint8Array(arrays[i])) {
      throw new Error('concatUint8Array: Data must be in the form of a Uint8Array');
    }

    totalLength += arrays[i].length;
  }

  const result = new Uint8Array(totalLength);
  let pos = 0;
  arrays.forEach(function (element) {
    result.set(element, pos);
    pos += element.length;
  });

  return result;
}

const doneReadingSet = new WeakSet();
/**
 * The external buffer is used to store values that have been peeked or unshifted from the original stream.
 * Because of how streams are implemented, such values cannot be "put back" in the original stream,
 * but they need to be returned first when reading from the input again.
 */
const externalBuffer = Symbol('externalBuffer');

/**
 * A wrapper class over the native ReadableStreamDefaultReader.
 * This additionally implements pushing back data on the stream, which
 * lets us implement peeking and a host of convenience functions.
 * It also lets you read data other than streams, such as a Uint8Array.
 * @class
 */
function Reader(input) {
  this.stream = input;
  if (input[externalBuffer]) {
    this[externalBuffer] = input[externalBuffer].slice();
  }
  if (isArrayStream(input)) {
    const reader = input.getReader();
    this._read = reader.read.bind(reader);
    this._releaseLock = () => {};
    this._cancel = () => {};
    return;
  }
  let streamType = isStream(input);
  if (streamType) {
    const reader = input.getReader();
    this._read = reader.read.bind(reader);
    this._releaseLock = () => {
      reader.closed.catch(function() {});
      reader.releaseLock();
    };
    this._cancel = reader.cancel.bind(reader);
    return;
  }
  let doneReading = false;
  this._read = async () => {
    if (doneReading || doneReadingSet.has(input)) {
      return { value: undefined, done: true };
    }
    doneReading = true;
    return { value: input, done: false };
  };
  this._releaseLock = () => {
    if (doneReading) {
      try {
        doneReadingSet.add(input);
      } catch(e) {}
    }
  };
}

/**
 * Read a chunk of data.
 * @returns {Promise<Object>} Either { done: false, value: Uint8Array | String } or { done: true, value: undefined }
 * @async
 */
Reader.prototype.read = async function() {
  if (this[externalBuffer] && this[externalBuffer].length) {
    const value = this[externalBuffer].shift();
    return { done: false, value };
  }
  return this._read();
};

/**
 * Allow others to read the stream.
 */
Reader.prototype.releaseLock = function() {
  if (this[externalBuffer]) {
    this.stream[externalBuffer] = this[externalBuffer];
  }
  this._releaseLock();
};

/**
 * Cancel the stream.
 */
Reader.prototype.cancel = function(reason) {
  return this._cancel(reason);
};

/**
 * Read up to and including the first \n character.
 * @returns {Promise<String|Undefined>}
 * @async
 */
Reader.prototype.readLine = async function() {
  let buffer = [];
  let returnVal;
  while (!returnVal) {
    let { done, value } = await this.read();
    value += '';
    if (done) {
      if (buffer.length) return concat(buffer);
      return;
    }
    const lineEndIndex = value.indexOf('\n') + 1;
    if (lineEndIndex) {
      returnVal = concat(buffer.concat(value.substr(0, lineEndIndex)));
      buffer = [];
    }
    if (lineEndIndex !== value.length) {
      buffer.push(value.substr(lineEndIndex));
    }
  }
  this.unshift(...buffer);
  return returnVal;
};

/**
 * Read a single byte/character.
 * @returns {Promise<Number|String|Undefined>}
 * @async
 */
Reader.prototype.readByte = async function() {
  const { done, value } = await this.read();
  if (done) return;
  const byte = value[0];
  this.unshift(slice(value, 1));
  return byte;
};

/**
 * Read a specific amount of bytes/characters, unless the stream ends before that amount.
 * @returns {Promise<Uint8Array|String|Undefined>}
 * @async
 */
Reader.prototype.readBytes = async function(length) {
  const buffer = [];
  let bufferLength = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await this.read();
    if (done) {
      if (buffer.length) return concat(buffer);
      return;
    }
    buffer.push(value);
    bufferLength += value.length;
    if (bufferLength >= length) {
      const bufferConcat = concat(buffer);
      this.unshift(slice(bufferConcat, length));
      return slice(bufferConcat, 0, length);
    }
  }
};

/**
 * Peek (look ahead) a specific amount of bytes/characters, unless the stream ends before that amount.
 * @returns {Promise<Uint8Array|String|Undefined>}
 * @async
 */
Reader.prototype.peekBytes = async function(length) {
  const bytes = await this.readBytes(length);
  this.unshift(bytes);
  return bytes;
};

/**
 * Push data to the front of the stream.
 * Data must have been read in the last call to read*.
 * @param {...(Uint8Array|String|Undefined)} values
 */
Reader.prototype.unshift = function(...values) {
  if (!this[externalBuffer]) {
    this[externalBuffer] = [];
  }
  if (
    values.length === 1 && isUint8Array(values[0]) &&
    this[externalBuffer].length && values[0].length &&
    this[externalBuffer][0].byteOffset >= values[0].length
  ) {
    this[externalBuffer][0] = new Uint8Array(
      this[externalBuffer][0].buffer,
      this[externalBuffer][0].byteOffset - values[0].length,
      this[externalBuffer][0].byteLength + values[0].length
    );
    return;
  }
  this[externalBuffer].unshift(...values.filter(value => value && value.length));
};

/**
 * Read the stream to the end and return its contents, concatenated by the join function (defaults to streams.concat).
 * @param {Function} join
 * @returns {Promise<Uint8array|String|Any>} the return value of join()
 * @async
 */
Reader.prototype.readToEnd = async function(join=concat) {
  const result = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await this.read();
    if (done) break;
    result.push(value);
  }
  return join(result);
};

/**
 * Convert data to Stream
 * @param {ReadableStream|Uint8array|String} input  data to convert
 * @returns {ReadableStream} Converted data
 */
function toStream(input) {
  let streamType = isStream(input);
  if (streamType) {
    return input;
  }
  return new ReadableStream({
    start(controller) {
      controller.enqueue(input);
      controller.close();
    }
  });
}

/**
 * Convert non-streamed data to ArrayStream; this is a noop if `input` is already a stream.
 * @param {Object} input  data to convert
 * @returns {ArrayStream} Converted data
 */
function toArrayStream(input) {
  if (isStream(input)) {
    return input;
  }
  const stream = new ArrayStream();
  (async () => {
    const writer = getWriter(stream);
    await writer.write(input);
    await writer.close();
  })();
  return stream;
}

/**
 * Concat a list of Uint8Arrays, Strings or Streams
 * The caller should not mix Uint8Arrays with Strings, but may mix Streams with non-Streams.
 * @param {Array<Uint8array|String|ReadableStream>} Array of Uint8Arrays/Strings/Streams to concatenate
 * @returns {Uint8array|String|ReadableStream} Concatenated array
 */
function concat(list) {
  if (list.some(stream => isStream(stream) && !isArrayStream(stream))) {
    return concatStream(list);
  }
  if (list.some(stream => isArrayStream(stream))) {
    return concatArrayStream(list);
  }
  if (typeof list[0] === 'string') {
    return list.join('');
  }
  return concatUint8Array(list);
}

/**
 * Concat a list of Streams
 * @param {Array<ReadableStream|Uint8array|String>} list  Array of Uint8Arrays/Strings/Streams to concatenate
 * @returns {ReadableStream} Concatenated list
 */
function concatStream(list) {
  list = list.map(toStream);
  const transform = transformWithCancel(async function(reason) {
    await Promise.all(transforms.map(stream => cancel(stream, reason)));
  });
  let prev = Promise.resolve();
  const transforms = list.map((stream, i) => transformPair(stream, (readable, writable) => {
    prev = prev.then(() => pipe(readable, transform.writable, {
      preventClose: i !== list.length - 1
    }));
    return prev;
  }));
  return transform.readable;
}

/**
 * Concat a list of ArrayStreams
 * @param {Array<ArrayStream|Uint8array|String>} list  Array of Uint8Arrays/Strings/ArrayStreams to concatenate
 * @returns {ArrayStream} Concatenated streams
 */
function concatArrayStream(list) {
  const result = new ArrayStream();
  let prev = Promise.resolve();
  list.forEach((stream, i) => {
    prev = prev.then(() => pipe(stream, result, {
      preventClose: i !== list.length - 1
    }));
    return prev;
  });
  return result;
}

/**
 * Pipe a readable stream to a writable stream. Don't throw on input stream errors, but forward them to the output stream.
 * @param {ReadableStream|Uint8array|String} input
 * @param {WritableStream} target
 * @param {Object} (optional) options
 * @returns {Promise<undefined>} Promise indicating when piping has finished (input stream closed or errored)
 * @async
 */
async function pipe(input, target, {
  preventClose = false,
  preventAbort = false,
  preventCancel = false
} = {}) {
  if (isStream(input) && !isArrayStream(input)) {
    input = toStream(input);
    try {
      if (input[externalBuffer]) {
        const writer = getWriter(target);
        for (let i = 0; i < input[externalBuffer].length; i++) {
          await writer.ready;
          await writer.write(input[externalBuffer][i]);
        }
        writer.releaseLock();
      }
      await input.pipeTo(target, {
        preventClose,
        preventAbort,
        preventCancel
      });
    } catch(e) {}
    return;
  }
  input = toArrayStream(input);
  const reader = getReader(input);
  const writer = getWriter(target);
  try {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      await writer.ready;
      const { done, value } = await reader.read();
      if (done) {
        if (!preventClose) await writer.close();
        break;
      }
      await writer.write(value);
    }
  } catch (e) {
    if (!preventAbort) await writer.abort(e);
  } finally {
    reader.releaseLock();
    writer.releaseLock();
  }
}

/**
 * Pipe a readable stream through a transform stream.
 * @param {ReadableStream|Uint8array|String} input
 * @param {Object} (optional) options
 * @returns {ReadableStream} transformed stream
 */
function transformRaw(input, options) {
  const transformStream = new TransformStream(options);
  pipe(input, transformStream.writable);
  return transformStream.readable;
}

/**
 * Create a cancelable TransformStream.
 * @param {Function} cancel
 * @returns {TransformStream}
 */
function transformWithCancel(customCancel) {
  let pulled = false;
  let cancelled = false;
  let backpressureChangePromiseResolve, backpressureChangePromiseReject;
  let outputController;
  return {
    readable: new ReadableStream({
      start(controller) {
        outputController = controller;
      },
      pull() {
        if (backpressureChangePromiseResolve) {
          backpressureChangePromiseResolve();
        } else {
          pulled = true;
        }
      },
      async cancel(reason) {
        cancelled = true;
        if (customCancel) {
          await customCancel(reason);
        }
        if (backpressureChangePromiseReject) {
          backpressureChangePromiseReject(reason);
        }
      }
    }, {highWaterMark: 0}),
    writable: new WritableStream({
      write: async function(chunk) {
        if (cancelled) {
          throw new Error('Stream is cancelled');
        }
        outputController.enqueue(chunk);
        if (!pulled) {
          await new Promise((resolve, reject) => {
            backpressureChangePromiseResolve = resolve;
            backpressureChangePromiseReject = reject;
          });
          backpressureChangePromiseResolve = null;
          backpressureChangePromiseReject = null;
        } else {
          pulled = false;
        }
      },
      close: outputController.close.bind(outputController),
      abort: outputController.error.bind(outputController)
    })
  };
}

/**
 * Transform a stream using helper functions which are called on each chunk, and on stream close, respectively.
 * @param {ReadableStream|Uint8array|String} input
 * @param {Function} process
 * @param {Function} finish
 * @returns {ReadableStream|Uint8array|String}
 */
function transform(input, process = () => undefined, finish = () => undefined) {
  if (isArrayStream(input)) {
    const output = new ArrayStream();
    (async () => {
      const writer = getWriter(output);
      try {
        const data = await readToEnd(input);
        const result1 = process(data);
        const result2 = finish();
        let result;
        if (result1 !== undefined && result2 !== undefined) result = concat([result1, result2]);
        else result = result1 !== undefined ? result1 : result2;
        await writer.write(result);
        await writer.close();
      } catch (e) {
        await writer.abort(e);
      }
    })();
    return output;
  }
  if (isStream(input)) {
    return transformRaw(input, {
      async transform(value, controller) {
        try {
          const result = await process(value);
          if (result !== undefined) controller.enqueue(result);
        } catch(e) {
          controller.error(e);
        }
      },
      async flush(controller) {
        try {
          const result = await finish();
          if (result !== undefined) controller.enqueue(result);
        } catch(e) {
          controller.error(e);
        }
      }
    });
  }
  const result1 = process(input);
  const result2 = finish();
  if (result1 !== undefined && result2 !== undefined) return concat([result1, result2]);
  return result1 !== undefined ? result1 : result2;
}

/**
 * Transform a stream using a helper function which is passed a readable and a writable stream.
 *   This function also maintains the possibility to cancel the input stream,
 *   and does so on cancelation of the output stream, despite cancelation
 *   normally being impossible when the input stream is being read from.
 * @param {ReadableStream|Uint8array|String} input
 * @param {Function} fn
 * @returns {ReadableStream}
 */
function transformPair(input, fn) {
  if (isStream(input) && !isArrayStream(input)) {
    let incomingTransformController;
    const incoming = new TransformStream({
      start(controller) {
        incomingTransformController = controller;
      }
    });

    const pipeDonePromise = pipe(input, incoming.writable);

    const outgoing = transformWithCancel(async function(reason) {
      incomingTransformController.error(reason);
      await pipeDonePromise;
      await new Promise(setTimeout);
    });
    fn(incoming.readable, outgoing.writable);
    return outgoing.readable;
  }
  input = toArrayStream(input);
  const output = new ArrayStream();
  fn(input, output);
  return output;
}

/**
 * Parse a stream using a helper function which is passed a Reader.
 *   The reader additionally has a remainder() method which returns a
 *   stream pointing to the remainder of input, and is linked to input
 *   for cancelation.
 * @param {ReadableStream|Uint8array|String} input
 * @param {Function} fn
 * @returns {Any} the return value of fn()
 */
function parse(input, fn) {
  let returnValue;
  const transformed = transformPair(input, (readable, writable) => {
    const reader = getReader(readable);
    reader.remainder = () => {
      reader.releaseLock();
      pipe(readable, writable);
      return transformed;
    };
    returnValue = fn(reader);
  });
  return returnValue;
}

/**
 * Tee a Stream for reading it twice. The input stream can no longer be read after tee()ing.
 *   Reading either of the two returned streams will pull from the input stream.
 *   The input stream will only be canceled if both of the returned streams are canceled.
 * @param {ReadableStream|Uint8array|String} input
 * @returns {Array<ReadableStream|Uint8array|String>} array containing two copies of input
 */
function tee(input) {
  if (isArrayStream(input)) {
    throw new Error('ArrayStream cannot be tee()d, use clone() instead');
  }
  if (isStream(input)) {
    const teed = toStream(input).tee();
    teed[0][externalBuffer] = teed[1][externalBuffer] = input[externalBuffer];
    return teed;
  }
  return [slice(input), slice(input)];
}

/**
 * Clone a Stream for reading it twice. The input stream can still be read after clone()ing.
 *   Reading from the clone will pull from the input stream.
 *   The input stream will only be canceled if both the clone and the input stream are canceled.
 * @param {ReadableStream|Uint8array|String} input
 * @returns {ReadableStream|Uint8array|String} cloned input
 */
function clone(input) {
  if (isArrayStream(input)) {
    return input.clone();
  }
  if (isStream(input)) {
    const teed = tee(input);
    overwrite(input, teed[0]);
    return teed[1];
  }
  return slice(input);
}

/**
 * Clone a Stream for reading it twice. Data will arrive at the same rate as the input stream is being read.
 *   Reading from the clone will NOT pull from the input stream. Data only arrives when reading the input stream.
 *   The input stream will NOT be canceled if the clone is canceled, only if the input stream are canceled.
 *   If the input stream is canceled, the clone will be errored.
 * @param {ReadableStream|Uint8array|String} input
 * @returns {ReadableStream|Uint8array|String} cloned input
 */
function passiveClone(input) {
  if (isArrayStream(input)) {
    return clone(input);
  }
  if (isStream(input)) {
    return new ReadableStream({
      start(controller) {
        const transformed = transformPair(input, async (readable, writable) => {
          const reader = getReader(readable);
          const writer = getWriter(writable);
          try {
            // eslint-disable-next-line no-constant-condition
            while (true) {
              await writer.ready;
              const { done, value } = await reader.read();
              if (done) {
                try { controller.close(); } catch(e) {}
                await writer.close();
                return;
              }
              try { controller.enqueue(value); } catch(e) {}
              await writer.write(value);
            }
          } catch(e) {
            controller.error(e);
            await writer.abort(e);
          }
        });
        overwrite(input, transformed);
      }
    });
  }
  return slice(input);
}

/**
 * Modify a stream object to point to a different stream object.
 *   This is used internally by clone() and passiveClone() to provide an abstraction over tee().
 * @param {ReadableStream} input
 * @param {ReadableStream} clone
 */
function overwrite(input, clone) {
  // Overwrite input.getReader, input.locked, etc to point to clone
  Object.entries(Object.getOwnPropertyDescriptors(input.constructor.prototype)).forEach(([name, descriptor]) => {
    if (name === 'constructor') {
      return;
    }
    if (descriptor.value) {
      descriptor.value = descriptor.value.bind(clone);
    } else {
      descriptor.get = descriptor.get.bind(clone);
    }
    Object.defineProperty(input, name, descriptor);
  });
}

/**
 * Return a stream pointing to a part of the input stream.
 * @param {ReadableStream|Uint8array|String} input
 * @returns {ReadableStream|Uint8array|String} clone
 */
function slice(input, begin=0, end=Infinity) {
  if (isArrayStream(input)) {
    throw new Error('Not implemented');
  }
  if (isStream(input)) {
    if (begin >= 0 && end >= 0) {
      let bytesRead = 0;
      return transformRaw(input, {
        transform(value, controller) {
          if (bytesRead < end) {
            if (bytesRead + value.length >= begin) {
              controller.enqueue(slice(value, Math.max(begin - bytesRead, 0), end - bytesRead));
            }
            bytesRead += value.length;
          } else {
            controller.terminate();
          }
        }
      });
    }
    if (begin < 0 && (end < 0 || end === Infinity)) {
      let lastBytes = [];
      return transform(input, value => {
        if (value.length >= -begin) lastBytes = [value];
        else lastBytes.push(value);
      }, () => slice(concat(lastBytes), begin, end));
    }
    if (begin === 0 && end < 0) {
      let lastBytes;
      return transform(input, value => {
        const returnValue = lastBytes ? concat([lastBytes, value]) : value;
        if (returnValue.length >= -end) {
          lastBytes = slice(returnValue, end);
          return slice(returnValue, begin, end);
        }
          lastBytes = returnValue;
      });
    }
    console.warn(`stream.slice(input, ${begin}, ${end}) not implemented efficiently.`);
    return fromAsync(async () => slice(await readToEnd(input), begin, end));
  }
  if (input[externalBuffer]) {
    input = concat(input[externalBuffer].concat([input]));
  }
  if (isUint8Array(input)) {
    return input.subarray(begin, end === Infinity ? input.length : end);
  }
  return input.slice(begin, end);
}

/**
 * Read a stream to the end and return its contents, concatenated by the join function (defaults to concat).
 * @param {ReadableStream|Uint8array|String} input
 * @param {Function} join
 * @returns {Promise<Uint8array|String|Any>} the return value of join()
 * @async
 */
async function readToEnd(input, join=concat) {
  if (isArrayStream(input)) {
    return input.readToEnd(join);
  }
  if (isStream(input)) {
    return getReader(input).readToEnd(join);
  }
  return input;
}

/**
 * Cancel a stream.
 * @param {ReadableStream|Uint8array|String} input
 * @param {Any} reason
 * @returns {Promise<Any>} indicates when the stream has been canceled
 * @async
 */
async function cancel(input, reason) {
  if (isStream(input)) {
    if (input.cancel) {
      const cancelled = await input.cancel(reason);
      // the stream is not always cancelled at this point, so we wait some more
      await new Promise(setTimeout);
      return cancelled;
    }
    if (input.destroy) {
      input.destroy(reason);
      await new Promise(setTimeout);
      return reason;
    }
  }
}

/**
 * Convert an async function to an ArrayStream. When the function returns, its return value is written to the stream.
 * @param {Function} fn
 * @returns {ArrayStream}
 */
function fromAsync(fn) {
  const arrayStream = new ArrayStream();
  (async () => {
    const writer = getWriter(arrayStream);
    try {
      await writer.write(await fn());
      await writer.close();
    } catch (e) {
      await writer.abort(e);
    }
  })();
  return arrayStream;
}

/**
 * Get a Reader
 * @param {ReadableStream|Uint8array|String} input
 * @returns {Reader}
 */
function getReader(input) {
  return new Reader(input);
}

/**
 * Get a Writer
 * @param {WritableStream} input
 * @returns {Writer}
 */
function getWriter(input) {
  return new Writer(input);
}

/**
 * @module enums
 */

const byValue = Symbol('byValue');

var enums = {

  /** Maps curve names under various standards to one
   * @see {@link https://wiki.gnupg.org/ECC|ECC - GnuPG wiki}
   * @enum {String}
   * @readonly
   */
  curve: {
    /** NIST P-256 Curve */
    'nistP256':               'nistP256',
    /** @deprecated use `nistP256` instead */
    'p256':                   'nistP256',

    /** NIST P-384 Curve */
    'nistP384':               'nistP384',
    /** @deprecated use `nistP384` instead */
    'p384':                   'nistP384',

    /** NIST P-521 Curve */
    'nistP521':               'nistP521',
    /** @deprecated use `nistP521` instead */
    'p521':                   'nistP521',

    /** SECG SECP256k1 Curve */
    'secp256k1':              'secp256k1',

    /** Ed25519 - deprecated by crypto-refresh (replaced by standaone Ed25519 algo) */
    'ed25519Legacy':          'ed25519Legacy',
    /** @deprecated use `ed25519Legacy` instead */
    'ed25519':                'ed25519Legacy',

    /** Curve25519 - deprecated by crypto-refresh (replaced by standaone X25519 algo) */
    'curve25519Legacy':       'curve25519Legacy',
    /** @deprecated use `curve25519Legacy` instead */
    'curve25519':             'curve25519Legacy',

    /** BrainpoolP256r1 Curve */
    'brainpoolP256r1':       'brainpoolP256r1',

    /** BrainpoolP384r1 Curve */
    'brainpoolP384r1':       'brainpoolP384r1',

    /** BrainpoolP512r1 Curve */
    'brainpoolP512r1':       'brainpoolP512r1'
  },

  /** A string to key specifier type
   * @enum {Integer}
   * @readonly
   */
  s2k: {
    simple: 0,
    salted: 1,
    iterated: 3,
    argon2: 4,
    gnu: 101
  },

  /** {@link https://tools.ietf.org/html/draft-ietf-openpgp-crypto-refresh-08.html#section-9.1|crypto-refresh RFC, section 9.1}
   * @enum {Integer}
   * @readonly
   */
  publicKey: {
    /** RSA (Encrypt or Sign) [HAC] */
    rsaEncryptSign: 1,
    /** RSA (Encrypt only) [HAC] */
    rsaEncrypt: 2,
    /** RSA (Sign only) [HAC] */
    rsaSign: 3,
    /** Elgamal (Encrypt only) [ELGAMAL] [HAC] */
    elgamal: 16,
    /** DSA (Sign only) [FIPS186] [HAC] */
    dsa: 17,
    /** ECDH (Encrypt only) [RFC6637] */
    ecdh: 18,
    /** ECDSA (Sign only) [RFC6637] */
    ecdsa: 19,
    /** EdDSA (Sign only) - deprecated by crypto-refresh (replaced by `ed25519` identifier below)
     * [{@link https://tools.ietf.org/html/draft-koch-eddsa-for-openpgp-04|Draft RFC}] */
    eddsaLegacy: 22,
    /** Reserved for AEDH */
    aedh: 23,
    /** Reserved for AEDSA */
    aedsa: 24,
    /** X25519 (Encrypt only) */
    x25519: 25,
    /** X448 (Encrypt only) */
    x448: 26,
    /** Ed25519 (Sign only) */
    ed25519: 27,
    /** Ed448 (Sign only) */
    ed448: 28
  },

  /** {@link https://tools.ietf.org/html/rfc4880#section-9.2|RFC4880, section 9.2}
   * @enum {Integer}
   * @readonly
   */
  symmetric: {
    /** Not implemented! */
    idea: 1,
    tripledes: 2,
    cast5: 3,
    blowfish: 4,
    aes128: 7,
    aes192: 8,
    aes256: 9,
    twofish: 10
  },

  /** {@link https://tools.ietf.org/html/rfc4880#section-9.3|RFC4880, section 9.3}
   * @enum {Integer}
   * @readonly
   */
  compression: {
    uncompressed: 0,
    /** RFC1951 */
    zip: 1,
    /** RFC1950 */
    zlib: 2,
    bzip2: 3
  },

  /** {@link https://tools.ietf.org/html/rfc4880#section-9.4|RFC4880, section 9.4}
   * @enum {Integer}
   * @readonly
   */
  hash: {
    md5: 1,
    sha1: 2,
    ripemd: 3,
    sha256: 8,
    sha384: 9,
    sha512: 10,
    sha224: 11,
    sha3_256: 12,
    sha3_512: 14
  },

  /** A list of hash names as accepted by webCrypto functions.
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest|Parameters, algo}
   * @enum {String}
   */
  webHash: {
    'SHA-1': 2,
    'SHA-256': 8,
    'SHA-384': 9,
    'SHA-512': 10
  },

  /** {@link https://www.rfc-editor.org/rfc/rfc9580.html#name-aead-algorithms}
   * @enum {Integer}
   * @readonly
   */
  aead: {
    eax: 1,
    ocb: 2,
    gcm: 3,
    /** @deprecated used by OpenPGP.js v5 for legacy AEAD support; use `gcm` instead for the RFC9580-standardized ID */
    experimentalGCM: 100 // Private algorithm
  },

  /** A list of packet types and numeric tags associated with them.
   * @enum {Integer}
   * @readonly
   */
  packet: {
    publicKeyEncryptedSessionKey: 1,
    signature: 2,
    symEncryptedSessionKey: 3,
    onePassSignature: 4,
    secretKey: 5,
    publicKey: 6,
    secretSubkey: 7,
    compressedData: 8,
    symmetricallyEncryptedData: 9,
    marker: 10,
    literalData: 11,
    trust: 12,
    userID: 13,
    publicSubkey: 14,
    userAttribute: 17,
    symEncryptedIntegrityProtectedData: 18,
    modificationDetectionCode: 19,
    aeadEncryptedData: 20, // see IETF draft: https://tools.ietf.org/html/draft-ford-openpgp-format-00#section-2.1
    padding: 21
  },

  /** Data types in the literal packet
   * @enum {Integer}
   * @readonly
   */
  literal: {
    /** Binary data 'b' */
    binary: 'b'.charCodeAt(),
    /** Text data 't' */
    text: 't'.charCodeAt(),
    /** Utf8 data 'u' */
    utf8: 'u'.charCodeAt(),
    /** MIME message body part 'm' */
    mime: 'm'.charCodeAt()
  },


  /** One pass signature packet type
   * @enum {Integer}
   * @readonly
   */
  signature: {
    /** 0x00: Signature of a binary document. */
    binary: 0,
    /** 0x01: Signature of a canonical text document.
     *
     * Canonicalyzing the document by converting line endings. */
    text: 1,
    /** 0x02: Standalone signature.
     *
     * This signature is a signature of only its own subpacket contents.
     * It is calculated identically to a signature over a zero-lengh
     * binary document.  Note that it doesn't make sense to have a V3
     * standalone signature. */
    standalone: 2,
    /** 0x10: Generic certification of a User ID and Public-Key packet.
     *
     * The issuer of this certification does not make any particular
     * assertion as to how well the certifier has checked that the owner
     * of the key is in fact the person described by the User ID. */
    certGeneric: 16,
    /** 0x11: Persona certification of a User ID and Public-Key packet.
     *
     * The issuer of this certification has not done any verification of
     * the claim that the owner of this key is the User ID specified. */
    certPersona: 17,
    /** 0x12: Casual certification of a User ID and Public-Key packet.
     *
     * The issuer of this certification has done some casual
     * verification of the claim of identity. */
    certCasual: 18,
    /** 0x13: Positive certification of a User ID and Public-Key packet.
     *
     * The issuer of this certification has done substantial
     * verification of the claim of identity.
     *
     * Most OpenPGP implementations make their "key signatures" as 0x10
     * certifications.  Some implementations can issue 0x11-0x13
     * certifications, but few differentiate between the types. */
    certPositive: 19,
    /** 0x30: Certification revocation signature
     *
     * This signature revokes an earlier User ID certification signature
     * (signature class 0x10 through 0x13) or direct-key signature
     * (0x1F).  It should be issued by the same key that issued the
     * revoked signature or an authorized revocation key.  The signature
     * is computed over the same data as the certificate that it
     * revokes, and should have a later creation date than that
     * certificate. */
    certRevocation: 48,
    /** 0x18: Subkey Binding Signature
     *
     * This signature is a statement by the top-level signing key that
     * indicates that it owns the subkey.  This signature is calculated
     * directly on the primary key and subkey, and not on any User ID or
     * other packets.  A signature that binds a signing subkey MUST have
     * an Embedded Signature subpacket in this binding signature that
     * contains a 0x19 signature made by the signing subkey on the
     * primary key and subkey. */
    subkeyBinding: 24,
    /** 0x19: Primary Key Binding Signature
     *
     * This signature is a statement by a signing subkey, indicating
     * that it is owned by the primary key and subkey.  This signature
     * is calculated the same way as a 0x18 signature: directly on the
     * primary key and subkey, and not on any User ID or other packets.
     *
     * When a signature is made over a key, the hash data starts with the
     * octet 0x99, followed by a two-octet length of the key, and then body
     * of the key packet.  (Note that this is an old-style packet header for
     * a key packet with two-octet length.)  A subkey binding signature
     * (type 0x18) or primary key binding signature (type 0x19) then hashes
     * the subkey using the same format as the main key (also using 0x99 as
     * the first octet). */
    keyBinding: 25,
    /** 0x1F: Signature directly on a key
     *
     * This signature is calculated directly on a key.  It binds the
     * information in the Signature subpackets to the key, and is
     * appropriate to be used for subpackets that provide information
     * about the key, such as the Revocation Key subpacket.  It is also
     * appropriate for statements that non-self certifiers want to make
     * about the key itself, rather than the binding between a key and a
     * name. */
    key: 31,
    /** 0x20: Key revocation signature
     *
     * The signature is calculated directly on the key being revoked.  A
     * revoked key is not to be used.  Only revocation signatures by the
     * key being revoked, or by an authorized revocation key, should be
     * considered valid revocation signatures.a */
    keyRevocation: 32,
    /** 0x28: Subkey revocation signature
     *
     * The signature is calculated directly on the subkey being revoked.
     * A revoked subkey is not to be used.  Only revocation signatures
     * by the top-level signature key that is bound to this subkey, or
     * by an authorized revocation key, should be considered valid
     * revocation signatures.
     *
     * Key revocation signatures (types 0x20 and 0x28)
     * hash only the key being revoked. */
    subkeyRevocation: 40,
    /** 0x40: Timestamp signature.
     * This signature is only meaningful for the timestamp contained in
     * it. */
    timestamp: 64,
    /** 0x50: Third-Party Confirmation signature.
     *
     * This signature is a signature over some other OpenPGP Signature
     * packet(s).  It is analogous to a notary seal on the signed data.
     * A third-party signature SHOULD include Signature Target
     * subpacket(s) to give easy identification.  Note that we really do
     * mean SHOULD.  There are plausible uses for this (such as a blind
     * party that only sees the signature, not the key or source
     * document) that cannot include a target subpacket. */
    thirdParty: 80
  },

  /** Signature subpacket type
   * @enum {Integer}
   * @readonly
   */
  signatureSubpacket: {
    signatureCreationTime: 2,
    signatureExpirationTime: 3,
    exportableCertification: 4,
    trustSignature: 5,
    regularExpression: 6,
    revocable: 7,
    keyExpirationTime: 9,
    placeholderBackwardsCompatibility: 10,
    preferredSymmetricAlgorithms: 11,
    revocationKey: 12,
    issuerKeyID: 16,
    notationData: 20,
    preferredHashAlgorithms: 21,
    preferredCompressionAlgorithms: 22,
    keyServerPreferences: 23,
    preferredKeyServer: 24,
    primaryUserID: 25,
    policyURI: 26,
    keyFlags: 27,
    signersUserID: 28,
    reasonForRevocation: 29,
    features: 30,
    signatureTarget: 31,
    embeddedSignature: 32,
    issuerFingerprint: 33,
    preferredAEADAlgorithms: 34,
    preferredCipherSuites: 39
  },

  /** Key flags
   * @enum {Integer}
   * @readonly
   */
  keyFlags: {
    /** 0x01 - This key may be used to certify other keys. */
    certifyKeys: 1,
    /** 0x02 - This key may be used to sign data. */
    signData: 2,
    /** 0x04 - This key may be used to encrypt communications. */
    encryptCommunication: 4,
    /** 0x08 - This key may be used to encrypt storage. */
    encryptStorage: 8,
    /** 0x10 - The private component of this key may have been split
     *        by a secret-sharing mechanism. */
    splitPrivateKey: 16,
    /** 0x20 - This key may be used for authentication. */
    authentication: 32,
    /** 0x80 - The private component of this key may be in the
     *        possession of more than one person. */
    sharedPrivateKey: 128
  },

  /** Armor type
   * @enum {Integer}
   * @readonly
   */
  armor: {
    multipartSection: 0,
    multipartLast: 1,
    signed: 2,
    message: 3,
    publicKey: 4,
    privateKey: 5,
    signature: 6
  },

  /** {@link https://tools.ietf.org/html/rfc4880#section-5.2.3.23|RFC4880, section 5.2.3.23}
   * @enum {Integer}
   * @readonly
   */
  reasonForRevocation: {
    /** No reason specified (key revocations or cert revocations) */
    noReason: 0,
    /** Key is superseded (key revocations) */
    keySuperseded: 1,
    /** Key material has been compromised (key revocations) */
    keyCompromised: 2,
    /** Key is retired and no longer used (key revocations) */
    keyRetired: 3,
    /** User ID information is no longer valid (cert revocations) */
    userIDInvalid: 32
  },

  /** {@link https://tools.ietf.org/html/draft-ietf-openpgp-rfc4880bis-04#section-5.2.3.25|RFC4880bis-04, section 5.2.3.25}
   * @enum {Integer}
   * @readonly
   */
  features: {
    /** 0x01 - Modification Detection (packets 18 and 19) */
    modificationDetection: 1,
    /** 0x02 - AEAD Encrypted Data Packet (packet 20) and version 5
     *         Symmetric-Key Encrypted Session Key Packets (packet 3) */
    aead: 2,
    /** 0x04 - Version 5 Public-Key Packet format and corresponding new
      *        fingerprint format */
    v5Keys: 4,
    seipdv2: 8
  },

  /**
   * Asserts validity of given value and converts from string/integer to integer.
   * @param {Object} type target enum type
   * @param {String|Integer} e value to check and/or convert
   * @returns {Integer} enum value if it exists
   * @throws {Error} if the value is invalid
   */
  write: function(type, e) {
    if (typeof e === 'number') {
      e = this.read(type, e);
    }

    if (type[e] !== undefined) {
      return type[e];
    }

    throw new Error('Invalid enum value.');
  },

  /**
   * Converts enum integer value to the corresponding string, if it exists.
   * @param {Object} type target enum type
   * @param {Integer} e value to convert
   * @returns {String} name of enum value if it exists
   * @throws {Error} if the value is invalid
   */
  read: function(type, e) {
    if (!type[byValue]) {
      type[byValue] = [];
      Object.entries(type).forEach(([key, value]) => {
        type[byValue][value] = key;
      });
    }

    if (type[byValue][e] !== undefined) {
      return type[byValue][e];
    }

    throw new Error('Invalid enum value.');
  }
};

// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


var config = {
  /**
   * @memberof module:config
   * @property {Integer} preferredHashAlgorithm Default hash algorithm {@link module:enums.hash}
   */
  preferredHashAlgorithm: enums.hash.sha512,
  /**
   * @memberof module:config
   * @property {Integer} preferredSymmetricAlgorithm Default encryption cipher {@link module:enums.symmetric}
   */
  preferredSymmetricAlgorithm: enums.symmetric.aes256,
  /**
   * @memberof module:config
   * @property {Integer} compression Default compression algorithm {@link module:enums.compression}
   */
  preferredCompressionAlgorithm: enums.compression.uncompressed,
  /**
   * Use Authenticated Encryption with Additional Data (AEAD) protection for symmetric encryption.
   * This option is applicable to:
   * - key generation (encryption key preferences),
   * - password-based message encryption, and
   * - private key encryption.
   * In the case of message encryption using public keys, the encryption key preferences are respected instead.
   * Note: not all OpenPGP implementations are compatible with this option.
   * @see {@link https://tools.ietf.org/html/draft-ietf-openpgp-crypto-refresh-10.html|draft-crypto-refresh-10}
   * @memberof module:config
   * @property {Boolean} aeadProtect
   */
  aeadProtect: false,
  /**
   * When reading OpenPGP v4 private keys (e.g. those generated in OpenPGP.js when not setting `config.v5Keys = true`)
   * which were encrypted by OpenPGP.js v5 (or older) using `config.aeadProtect = true`,
   * this option must be set, otherwise key parsing and/or key decryption will fail.
   * Note: only set this flag if you know that the keys are of the legacy type, as non-legacy keys
   * will be processed incorrectly.
   */
  parseAEADEncryptedV4KeysAsLegacy: false,
  /**
   * Default Authenticated Encryption with Additional Data (AEAD) encryption mode
   * Only has an effect when aeadProtect is set to true.
   * @memberof module:config
   * @property {Integer} preferredAEADAlgorithm Default AEAD mode {@link module:enums.aead}
   */
  preferredAEADAlgorithm: enums.aead.gcm,
  /**
   * Chunk Size Byte for Authenticated Encryption with Additional Data (AEAD) mode
   * Only has an effect when aeadProtect is set to true.
   * Must be an integer value from 0 to 56.
   * @memberof module:config
   * @property {Integer} aeadChunkSizeByte
   */
  aeadChunkSizeByte: 12,
  /**
   * Use v6 keys.
   * Note: not all OpenPGP implementations are compatible with this option.
   * **FUTURE OPENPGP.JS VERSIONS MAY BREAK COMPATIBILITY WHEN USING THIS OPTION**
   * @memberof module:config
   * @property {Boolean} v6Keys
   */
  v6Keys: false,
  /**
   * Enable parsing v5 keys and v5 signatures (which is different from the AEAD-encrypted SEIPDv2 packet).
   * These are non-standard entities, which in the crypto-refresh have been superseded
   * by v6 keys and v6 signatures, respectively.
   * However, generation of v5 entities was supported behind config flag in OpenPGP.js v5, and some other libraries,
   * hence parsing them might be necessary in some cases.
   */
  enableParsingV5Entities: false,
  /**
   * S2K (String to Key) type, used for key derivation in the context of secret key encryption
   * and password-encrypted data. Weaker s2k options are not allowed.
   * Note: Argon2 is the strongest option but not all OpenPGP implementations are compatible with it
   * (pending standardisation).
   * @memberof module:config
   * @property {enums.s2k.argon2|enums.s2k.iterated} s2kType {@link module:enums.s2k}
   */
  s2kType: enums.s2k.iterated,
  /**
   * {@link https://tools.ietf.org/html/rfc4880#section-3.7.1.3| RFC4880 3.7.1.3}:
   * Iteration Count Byte for Iterated and Salted S2K (String to Key).
   * Only relevant if `config.s2kType` is set to `enums.s2k.iterated`.
   * Note: this is the exponent value, not the final number of iterations (refer to specs for more details).
   * @memberof module:config
   * @property {Integer} s2kIterationCountByte
   */
  s2kIterationCountByte: 224,
  /**
   * {@link https://tools.ietf.org/html/draft-ietf-openpgp-crypto-refresh-07.html#section-3.7.1.4| draft-crypto-refresh 3.7.1.4}:
   * Argon2 parameters for S2K (String to Key).
   * Only relevant if `config.s2kType` is set to `enums.s2k.argon2`.
   * Default settings correspond to the second recommendation from RFC9106 ("uniformly safe option"),
   * to ensure compatibility with memory-constrained environments.
   * For more details on the choice of parameters, see https://tools.ietf.org/html/rfc9106#section-4.
   * @memberof module:config
   * @property {Object} params
   * @property {Integer} params.passes - number of iterations t
   * @property {Integer} params.parallelism - degree of parallelism p
   * @property {Integer} params.memoryExponent - one-octet exponent indicating the memory size, which will be: 2**memoryExponent kibibytes.
   */
  s2kArgon2Params: {
    passes: 3,
    parallelism: 4, // lanes
    memoryExponent: 16 // 64 MiB of RAM
  },
  /**
   * Allow decryption of messages without integrity protection.
   * This is an **insecure** setting:
   *  - message modifications cannot be detected, thus processing the decrypted data is potentially unsafe.
   *  - it enables downgrade attacks against integrity-protected messages.
   * @memberof module:config
   * @property {Boolean} allowUnauthenticatedMessages
   */
  allowUnauthenticatedMessages: false,
  /**
   * Allow streaming unauthenticated data before its integrity has been checked. This would allow the application to
   * process large streams while limiting memory usage by releasing the decrypted chunks as soon as possible
   * and deferring checking their integrity until the decrypted stream has been read in full.
   *
   * This setting is **insecure** if the encrypted data has been corrupted by a malicious entity:
   * - if the partially decrypted message is processed further or displayed to the user, it opens up the possibility of attacks such as EFAIL
   *    (see https://efail.de/).
   * - an attacker with access to traces or timing info of internal processing errors could learn some info about the data.
   *
   * NB: this setting does not apply to AEAD-encrypted data, where the AEAD data chunk is never released until integrity is confirmed.
   * @memberof module:config
   * @property {Boolean} allowUnauthenticatedStream
   */
  allowUnauthenticatedStream: false,
  /**
   * Minimum RSA key size allowed for key generation and message signing, verification and encryption.
   * The default is 2047 since due to a bug, previous versions of OpenPGP.js could generate 2047-bit keys instead of 2048-bit ones.
   * @memberof module:config
   * @property {Number} minRSABits
   */
  minRSABits: 2047,
  /**
   * Work-around for rare GPG decryption bug when encrypting with multiple passwords.
   * **Slower and slightly less secure**
   * @memberof module:config
   * @property {Boolean} passwordCollisionCheck
   */
  passwordCollisionCheck: false,
  /**
   * Allow decryption using RSA keys without `encrypt` flag.
   * This setting is potentially insecure, but it is needed to get around an old openpgpjs bug
   * where key flags were ignored when selecting a key for encryption.
   * @memberof module:config
   * @property {Boolean} allowInsecureDecryptionWithSigningKeys
   */
  allowInsecureDecryptionWithSigningKeys: false,
  /**
   * Allow verification of message signatures with keys whose validity at the time of signing cannot be determined.
   * Instead, a verification key will also be consider valid as long as it is valid at the current time.
   * This setting is potentially insecure, but it is needed to verify messages signed with keys that were later reformatted,
   * and have self-signature's creation date that does not match the primary key creation date.
   * @memberof module:config
   * @property {Boolean} allowInsecureDecryptionWithSigningKeys
   */
  allowInsecureVerificationWithReformattedKeys: false,
  /**
   * Allow using keys that do not have any key flags set.
   * Key flags are needed to restrict key usage to specific purposes: for instance, a signing key could only be allowed to certify other keys, and not sign messages
   * (see https://www.ietf.org/archive/id/draft-ietf-openpgp-crypto-refresh-10.html#section-5.2.3.29).
   * Some older keys do not declare any key flags, which means they are not allowed to be used for any operation.
   * This setting allows using such keys for any operation for which they are compatible, based on their public key algorithm.
   */
  allowMissingKeyFlags: false,
  /**
   * Enable constant-time decryption of RSA- and ElGamal-encrypted session keys, to hinder Bleichenbacher-like attacks (https://link.springer.com/chapter/10.1007/BFb0055716).
   * This setting has measurable performance impact and it is only helpful in application scenarios where both of the following conditions apply:
   * - new/incoming messages are automatically decrypted (without user interaction);
   * - an attacker can determine how long it takes to decrypt each message (e.g. due to decryption errors being logged remotely).
   * See also `constantTimePKCS1DecryptionSupportedSymmetricAlgorithms`.
   * @memberof module:config
   * @property {Boolean} constantTimePKCS1Decryption
   */
  constantTimePKCS1Decryption: false,
  /**
   * This setting is only meaningful if `constantTimePKCS1Decryption` is enabled.
   * Decryption of RSA- and ElGamal-encrypted session keys of symmetric algorithms different from the ones specified here will fail.
   * However, the more algorithms are added, the slower the decryption procedure becomes.
   * @memberof module:config
   * @property {Set<Integer>} constantTimePKCS1DecryptionSupportedSymmetricAlgorithms {@link module:enums.symmetric}
   */
  constantTimePKCS1DecryptionSupportedSymmetricAlgorithms: new Set([enums.symmetric.aes128, enums.symmetric.aes192, enums.symmetric.aes256]),
  /**
   * @memberof module:config
   * @property {Boolean} ignoreUnsupportedPackets Ignore unsupported/unrecognizable packets on parsing instead of throwing an error
   */
  ignoreUnsupportedPackets: true,
  /**
   * @memberof module:config
   * @property {Boolean} ignoreMalformedPackets Ignore malformed packets on parsing instead of throwing an error
   */
  ignoreMalformedPackets: false,
  /**
   * Parsing of packets is normally restricted to a predefined set of packets. For example a Sym. Encrypted Integrity Protected Data Packet can only
   * contain a certain set of packets including LiteralDataPacket. With this setting we can allow additional packets, which is probably not advisable
   * as a global config setting, but can be used for specific function calls (e.g. decrypt method of Message).
   * @memberof module:config
   * @property {Array} additionalAllowedPackets Allow additional packets on parsing. Defined as array of packet classes, e.g. [PublicKeyPacket]
   */
  additionalAllowedPackets: [],
  /**
   * @memberof module:config
   * @property {Boolean} showVersion Whether to include {@link module:config/config.versionString} in armored messages
   */
  showVersion: false,
  /**
   * @memberof module:config
   * @property {Boolean} showComment Whether to include {@link module:config/config.commentString} in armored messages
   */
  showComment: false,
  /**
   * @memberof module:config
   * @property {String} versionString A version string to be included in armored messages
   */
  versionString: 'OpenPGP.js 6.1.0',
  /**
   * @memberof module:config
   * @property {String} commentString A comment string to be included in armored messages
   */
  commentString: 'https://openpgpjs.org',

  /**
   * Max userID string length (used for parsing)
   * @memberof module:config
   * @property {Integer} maxUserIDLength
   */
  maxUserIDLength: 1024 * 5,
  /**
   * Contains notatations that are considered "known". Known notations do not trigger
   * validation error when the notation is marked as critical.
   * @memberof module:config
   * @property {Array} knownNotations
   */
  knownNotations: [],
  /**
   * If true, a salt notation is used to randomize signatures generated by v4 and v5 keys (v6 signatures are always non-deterministic, by design).
   * This protects EdDSA signatures from potentially leaking the secret key in case of faults (i.e. bitflips) which, in principle, could occur
   * during the signing computation. It is added to signatures of any algo for simplicity, and as it may also serve as protection in case of
   * weaknesses in the hash algo, potentially hindering e.g. some chosen-prefix attacks.
   * NOTE: the notation is interoperable, but will reveal that the signature has been generated using OpenPGP.js, which may not be desirable in some cases.
   */
  nonDeterministicSignaturesViaNotation: true,
  /**
   * Whether to use the the noble-curves library for curves (other than Curve25519) that are not supported by the available native crypto API.
   * When false, certain standard curves will not be supported (depending on the platform).
   * @memberof module:config
   * @property {Boolean} useEllipticFallback
   */
  useEllipticFallback: true,
  /**
   * Reject insecure hash algorithms
   * @memberof module:config
   * @property {Set<Integer>} rejectHashAlgorithms {@link module:enums.hash}
   */
  rejectHashAlgorithms: new Set([enums.hash.md5, enums.hash.ripemd]),
  /**
   * Reject insecure message hash algorithms
   * @memberof module:config
   * @property {Set<Integer>} rejectMessageHashAlgorithms {@link module:enums.hash}
   */
  rejectMessageHashAlgorithms: new Set([enums.hash.md5, enums.hash.ripemd, enums.hash.sha1]),
  /**
   * Reject insecure public key algorithms for key generation and message encryption, signing or verification
   * @memberof module:config
   * @property {Set<Integer>} rejectPublicKeyAlgorithms {@link module:enums.publicKey}
   */
  rejectPublicKeyAlgorithms: new Set([enums.publicKey.elgamal, enums.publicKey.dsa]),
  /**
   * Reject non-standard curves for key generation, message encryption, signing or verification
   * @memberof module:config
   * @property {Set<String>} rejectCurves {@link module:enums.curve}
   */
  rejectCurves: new Set([enums.curve.secp256k1])
};

// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA

const createRequire = () => () => {}; // Must be stripped in browser built

const debugMode = (() => {
  try {
    return process.env.NODE_ENV === 'development'; // eslint-disable-line no-process-env
  } catch (e) {}
  return false;
})();

const util = {
  isString: function(data) {
    return typeof data === 'string' || data instanceof String;
  },

  nodeRequire: createRequire(),

  isArray: function(data) {
    return data instanceof Array;
  },

  isUint8Array: isUint8Array,

  isStream: isStream,

  /**
   * Load noble-curves lib on demand and return the requested curve function
   * @param {enums.publicKey} publicKeyAlgo
   * @param {enums.curve} [curveName] - for algos supporting different curves (e.g. ECDSA)
   * @returns curve implementation
   * @throws on unrecognized curve, or curve not implemented by noble-curve
   */
  getNobleCurve: async (publicKeyAlgo, curveName) => {
    if (!config.useEllipticFallback) {
      throw new Error('This curve is only supported in the full build of OpenPGP.js');
    }

    const { nobleCurves } = await import('./noble_curves.mjs');
    switch (publicKeyAlgo) {
      case enums.publicKey.ecdh:
      case enums.publicKey.ecdsa: {
        const curve = nobleCurves.get(curveName);
        if (!curve) throw new Error('Unsupported curve');
        return curve;
      }
      case enums.publicKey.x448:
        return nobleCurves.get('x448');
      case enums.publicKey.ed448:
        return nobleCurves.get('ed448');
      default:
        throw new Error('Unsupported curve');
    }
  },

  readNumber: function (bytes) {
    let n = 0;
    for (let i = 0; i < bytes.length; i++) {
      n += (256 ** i) * bytes[bytes.length - 1 - i];
    }
    return n;
  },

  writeNumber: function (n, bytes) {
    const b = new Uint8Array(bytes);
    for (let i = 0; i < bytes; i++) {
      b[i] = (n >> (8 * (bytes - i - 1))) & 0xFF;
    }

    return b;
  },

  readDate: function (bytes) {
    const n = util.readNumber(bytes);
    const d = new Date(n * 1000);
    return d;
  },

  writeDate: function (time) {
    const numeric = Math.floor(time.getTime() / 1000);

    return util.writeNumber(numeric, 4);
  },

  normalizeDate: function (time = Date.now()) {
    return time === null || time === Infinity ? time : new Date(Math.floor(+time / 1000) * 1000);
  },

  /**
   * Read one MPI from bytes in input
   * @param {Uint8Array} bytes - Input data to parse
   * @returns {Uint8Array} Parsed MPI.
   */
  readMPI: function (bytes) {
    const bits = (bytes[0] << 8) | bytes[1];
    const bytelen = (bits + 7) >>> 3;
    // There is a decryption oracle risk here by enforcing the MPI length using `readExactSubarray` in the context of SEIPDv1 encrypted signatures,
    // where unauthenticated streamed decryption is done (via `config.allowUnauthenticatedStream`), since the decrypted signature data being processed
    // has not been authenticated (yet).
    // However, such config setting is known to be insecure, and there are other packet parsing errors that can cause similar issues.
    // Also, AEAD is also not affected.
    return util.readExactSubarray(bytes, 2, 2 + bytelen);
  },

  /**
   * Read exactly `end - start` bytes from input.
   * This is a stricter version of `.subarray`.
   * @param {Uint8Array} input - Input data to parse
   * @returns {Uint8Array} subarray of size always equal to `end - start`
   * @throws if the input array is too short.
   */
  readExactSubarray: function (input, start, end) {
    if (input.length < (end - start)) {
      throw new Error('Input array too short');
    }
    return input.subarray(start, end);
  },

  /**
   * Left-pad Uint8Array to length by adding 0x0 bytes
   * @param {Uint8Array} bytes - Data to pad
   * @param {Number} length - Padded length
   * @returns {Uint8Array} Padded bytes.
   */
  leftPad(bytes, length) {
    if (bytes.length > length) {
      throw new Error('Input array too long');
    }
    const padded = new Uint8Array(length);
    const offset = length - bytes.length;
    padded.set(bytes, offset);
    return padded;
  },

  /**
   * Convert a Uint8Array to an MPI-formatted Uint8Array.
   * @param {Uint8Array} bin - An array of 8-bit integers to convert
   * @returns {Uint8Array} MPI-formatted Uint8Array.
   */
  uint8ArrayToMPI: function (bin) {
    const bitSize = util.uint8ArrayBitLength(bin);
    if (bitSize === 0) {
      throw new Error('Zero MPI');
    }
    const stripped = bin.subarray(bin.length - Math.ceil(bitSize / 8));
    const prefix = new Uint8Array([(bitSize & 0xFF00) >> 8, bitSize & 0xFF]);
    return util.concatUint8Array([prefix, stripped]);
  },

  /**
   * Return bit length of the input data
   * @param {Uint8Array} bin input data (big endian)
   * @returns bit length
   */
  uint8ArrayBitLength: function (bin) {
    let i; // index of leading non-zero byte
    for (i = 0; i < bin.length; i++) if (bin[i] !== 0) break;
    if (i === bin.length) {
      return 0;
    }
    const stripped = bin.subarray(i);
    return (stripped.length - 1) * 8 + util.nbits(stripped[0]);
  },

  /**
   * Convert a hex string to an array of 8-bit integers
   * @param {String} hex - A hex string to convert
   * @returns {Uint8Array} An array of 8-bit integers.
   */
  hexToUint8Array: function (hex) {
    const result = new Uint8Array(hex.length >> 1);
    for (let k = 0; k < hex.length >> 1; k++) {
      result[k] = parseInt(hex.substr(k << 1, 2), 16);
    }
    return result;
  },

  /**
   * Convert an array of 8-bit integers to a hex string
   * @param {Uint8Array} bytes - Array of 8-bit integers to convert
   * @returns {String} Hexadecimal representation of the array.
   */
  uint8ArrayToHex: function (bytes) {
    const hexAlphabet = '0123456789abcdef';
    let s = '';
    bytes.forEach(v => { s += hexAlphabet[v >> 4] + hexAlphabet[v & 15]; });
    return s;
  },

  /**
   * Convert a string to an array of 8-bit integers
   * @param {String} str - String to convert
   * @returns {Uint8Array} An array of 8-bit integers.
   */
  stringToUint8Array: function (str) {
    return transform(str, str => {
      if (!util.isString(str)) {
        throw new Error('stringToUint8Array: Data must be in the form of a string');
      }

      const result = new Uint8Array(str.length);
      for (let i = 0; i < str.length; i++) {
        result[i] = str.charCodeAt(i);
      }
      return result;
    });
  },

  /**
   * Convert an array of 8-bit integers to a string
   * @param {Uint8Array} bytes - An array of 8-bit integers to convert
   * @returns {String} String representation of the array.
   */
  uint8ArrayToString: function (bytes) {
    bytes = new Uint8Array(bytes);
    const result = [];
    const bs = 1 << 14;
    const j = bytes.length;

    for (let i = 0; i < j; i += bs) {
      result.push(String.fromCharCode.apply(String, bytes.subarray(i, i + bs < j ? i + bs : j)));
    }
    return result.join('');
  },

  /**
   * Convert a native javascript string to a Uint8Array of utf8 bytes
   * @param {String|ReadableStream} str - The string to convert
   * @returns {Uint8Array|ReadableStream} A valid squence of utf8 bytes.
   */
  encodeUTF8: function (str) {
    const encoder = new TextEncoder('utf-8');
    // eslint-disable-next-line no-inner-declarations
    function process(value, lastChunk = false) {
      return encoder.encode(value, { stream: !lastChunk });
    }
    return transform(str, process, () => process('', true));
  },

  /**
   * Convert a Uint8Array of utf8 bytes to a native javascript string
   * @param {Uint8Array|ReadableStream} utf8 - A valid squence of utf8 bytes
   * @returns {String|ReadableStream} A native javascript string.
   */
  decodeUTF8: function (utf8) {
    const decoder = new TextDecoder('utf-8');
    // eslint-disable-next-line no-inner-declarations
    function process(value, lastChunk = false) {
      return decoder.decode(value, { stream: !lastChunk });
    }
    return transform(utf8, process, () => process(new Uint8Array(), true));
  },

  /**
   * Concat a list of Uint8Arrays, Strings or Streams
   * The caller must not mix Uint8Arrays with Strings, but may mix Streams with non-Streams.
   * @param {Array<Uint8Array|String|ReadableStream>} Array - Of Uint8Arrays/Strings/Streams to concatenate
   * @returns {Uint8Array|String|ReadableStream} Concatenated array.
   */
  concat: concat,

  /**
   * Concat Uint8Arrays
   * @param {Array<Uint8Array>} Array - Of Uint8Arrays to concatenate
   * @returns {Uint8Array} Concatenated array.
   */
  concatUint8Array: concatUint8Array,

  /**
   * Check Uint8Array equality
   * @param {Uint8Array} array1 - First array
   * @param {Uint8Array} array2 - Second array
   * @returns {Boolean} Equality.
   */
  equalsUint8Array: function (array1, array2) {
    if (!util.isUint8Array(array1) || !util.isUint8Array(array2)) {
      throw new Error('Data must be in the form of a Uint8Array');
    }

    if (array1.length !== array2.length) {
      return false;
    }

    for (let i = 0; i < array1.length; i++) {
      if (array1[i] !== array2[i]) {
        return false;
      }
    }
    return true;
  },

  /**
   * Calculates a 16bit sum of a Uint8Array by adding each character
   * codes modulus 65535
   * @param {Uint8Array} Uint8Array - To create a sum of
   * @returns {Uint8Array} 2 bytes containing the sum of all charcodes % 65535.
   */
  writeChecksum: function (text) {
    let s = 0;
    for (let i = 0; i < text.length; i++) {
      s = (s + text[i]) & 0xFFFF;
    }
    return util.writeNumber(s, 2);
  },

  /**
   * Helper function to print a debug message. Debug
   * messages are only printed if
   * @param {String} str - String of the debug message
   */
  printDebug: function (str) {
    if (debugMode) {
      console.log('[OpenPGP.js debug]', str);
    }
  },

  /**
   * Helper function to print a debug error. Debug
   * messages are only printed if
   * @param {String} str - String of the debug message
   */
  printDebugError: function (error) {
    if (debugMode) {
      console.error('[OpenPGP.js debug]', error);
    }
  },

  // returns bit length of the integer x
  nbits: function (x) {
    let r = 1;
    let t = x >>> 16;
    if (t !== 0) {
      x = t;
      r += 16;
    }
    t = x >> 8;
    if (t !== 0) {
      x = t;
      r += 8;
    }
    t = x >> 4;
    if (t !== 0) {
      x = t;
      r += 4;
    }
    t = x >> 2;
    if (t !== 0) {
      x = t;
      r += 2;
    }
    t = x >> 1;
    if (t !== 0) {
      x = t;
      r += 1;
    }
    return r;
  },

  /**
   * If S[1] == 0, then double(S) == (S[2..128] || 0);
   * otherwise, double(S) == (S[2..128] || 0) xor
   * (zeros(120) || 10000111).
   *
   * Both OCB and EAX (through CMAC) require this function to be constant-time.
   *
   * @param {Uint8Array} data
   */
  double: function(data) {
    const doubleVar = new Uint8Array(data.length);
    const last = data.length - 1;
    for (let i = 0; i < last; i++) {
      doubleVar[i] = (data[i] << 1) ^ (data[i + 1] >> 7);
    }
    doubleVar[last] = (data[last] << 1) ^ ((data[0] >> 7) * 0x87);
    return doubleVar;
  },

  /**
   * Shift a Uint8Array to the right by n bits
   * @param {Uint8Array} array - The array to shift
   * @param {Integer} bits - Amount of bits to shift (MUST be smaller
   * than 8)
   * @returns {String} Resulting array.
   */
  shiftRight: function (array, bits) {
    if (bits) {
      for (let i = array.length - 1; i >= 0; i--) {
        array[i] >>= bits;
        if (i > 0) {
          array[i] |= (array[i - 1] << (8 - bits));
        }
      }
    }
    return array;
  },

  /**
   * Get native Web Cryptography API.
   * @returns {Object} The SubtleCrypto API
   * @throws if the API is not available
   */
  getWebCrypto: function() {
    const globalWebCrypto = typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle;
    // Fallback for Node 16, which does not expose WebCrypto as a global
    const webCrypto = globalWebCrypto || this.getNodeCrypto()?.webcrypto.subtle;
    if (!webCrypto) {
      throw new Error('The WebCrypto API is not available');
    }
    return webCrypto;
  },

  /**
   * Get native Node.js crypto api.
   * @returns {Object} The crypto module or 'undefined'.
   */
  getNodeCrypto: function() {
    return this.nodeRequire('crypto');
  },

  getNodeZlib: function() {
    return this.nodeRequire('zlib');
  },

  /**
   * Get native Node.js Buffer constructor. This should be used since
   * Buffer is not available under browserify.
   * @returns {Function} The Buffer constructor or 'undefined'.
   */
  getNodeBuffer: function() {
    return (this.nodeRequire('buffer') || {}).Buffer;
  },

  getHardwareConcurrency: function() {
    if (typeof navigator !== 'undefined') {
      return navigator.hardwareConcurrency || 1;
    }

    const os = this.nodeRequire('os'); // Assume we're on Node.js.
    return os.cpus().length;
  },

  /**
   * Test email format to ensure basic compliance:
   * - must include a single @
   * - no control or space unicode chars allowed
   * - no backslash and square brackets (as the latter can mess with the userID parsing)
   * - cannot end with a punctuation char
   * These checks are not meant to be exhaustive; applications are strongly encouraged to implement stricter validation,
   * e.g. based on the W3C HTML spec (https://html.spec.whatwg.org/multipage/input.html#email-state-(type=email)).
   */
  isEmailAddress: function(data) {
    if (!util.isString(data)) {
      return false;
    }
    const re = /^[^\p{C}\p{Z}@<>\\]+@[^\p{C}\p{Z}@<>\\]+[^\p{C}\p{Z}\p{P}]$/u;
    return re.test(data);
  },

  /**
   * Normalize line endings to <CR><LF>
   * Support any encoding where CR=0x0D, LF=0x0A
   */
  canonicalizeEOL: function(data) {
    const CR = 13;
    const LF = 10;
    let carryOverCR = false;

    return transform(data, bytes => {
      if (carryOverCR) {
        bytes = util.concatUint8Array([new Uint8Array([CR]), bytes]);
      }

      if (bytes[bytes.length - 1] === CR) {
        carryOverCR = true;
        bytes = bytes.subarray(0, -1);
      } else {
        carryOverCR = false;
      }

      let index;
      const indices = [];
      for (let i = 0; ; i = index) {
        index = bytes.indexOf(LF, i) + 1;
        if (index) {
          if (bytes[index - 2] !== CR) indices.push(index);
        } else {
          break;
        }
      }
      if (!indices.length) {
        return bytes;
      }

      const normalized = new Uint8Array(bytes.length + indices.length);
      let j = 0;
      for (let i = 0; i < indices.length; i++) {
        const sub = bytes.subarray(indices[i - 1] || 0, indices[i]);
        normalized.set(sub, j);
        j += sub.length;
        normalized[j - 1] = CR;
        normalized[j] = LF;
        j++;
      }
      normalized.set(bytes.subarray(indices[indices.length - 1] || 0), j);
      return normalized;
    }, () => (carryOverCR ? new Uint8Array([CR]) : undefined));
  },

  /**
   * Convert line endings from canonicalized <CR><LF> to native <LF>
   * Support any encoding where CR=0x0D, LF=0x0A
   */
  nativeEOL: function(data) {
    const CR = 13;
    const LF = 10;
    let carryOverCR = false;

    return transform(data, bytes => {
      if (carryOverCR && bytes[0] !== LF) {
        bytes = util.concatUint8Array([new Uint8Array([CR]), bytes]);
      } else {
        bytes = new Uint8Array(bytes); // Don't mutate passed bytes
      }

      if (bytes[bytes.length - 1] === CR) {
        carryOverCR = true;
        bytes = bytes.subarray(0, -1);
      } else {
        carryOverCR = false;
      }

      let index;
      let j = 0;
      for (let i = 0; i !== bytes.length; i = index) {
        index = bytes.indexOf(CR, i) + 1;
        if (!index) index = bytes.length;
        const last = index - (bytes[index] === LF ? 1 : 0);
        if (i) bytes.copyWithin(j, i, last);
        j += last - i;
      }
      return bytes.subarray(0, j);
    }, () => (carryOverCR ? new Uint8Array([CR]) : undefined));
  },

  /**
   * Remove trailing spaces, carriage returns and tabs from each line
   */
  removeTrailingSpaces: function(text) {
    return text.split('\n').map(line => {
      let i = line.length - 1;
      for (; i >= 0 && (line[i] === ' ' || line[i] === '\t' || line[i] === '\r'); i--);
      return line.substr(0, i + 1);
    }).join('\n');
  },

  wrapError: function(message, error) {
    if (!error) {
      return new Error(message);
    }

    // update error message
    try {
      error.message = message + ': ' + error.message;
    } catch (e) {}

    return error;
  },

  /**
   * Map allowed packet tags to corresponding classes
   * Meant to be used to format `allowedPacket` for Packetlist.read
   * @param {Array<Object>} allowedClasses
   * @returns {Object} map from enum.packet to corresponding *Packet class
   */
  constructAllowedPackets: function(allowedClasses) {
    const map = {};
    allowedClasses.forEach(PacketClass => {
      if (!PacketClass.tag) {
        throw new Error('Invalid input: expected a packet class');
      }
      map[PacketClass.tag] = PacketClass;
    });
    return map;
  },

  /**
   * Return a Promise that will resolve as soon as one of the promises in input resolves
   * or will reject if all input promises all rejected
   * (similar to Promise.any, but with slightly different error handling)
   * @param {Array<Promise>} promises
   * @return {Promise<Any>} Promise resolving to the result of the fastest fulfilled promise
   *                          or rejected with the Error of the last resolved Promise (if all promises are rejected)
   */
  anyPromise: function(promises) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      let exception;
      await Promise.all(promises.map(async promise => {
        try {
          resolve(await promise);
        } catch (e) {
          exception = e;
        }
      }));
      reject(exception);
    });
  },

  /**
   * Return either `a` or `b` based on `cond`, in algorithmic constant time.
   * @param {Boolean} cond
   * @param {Uint8Array} a
   * @param {Uint8Array} b
   * @returns `a` if `cond` is true, `b` otherwise
   */
  selectUint8Array: function(cond, a, b) {
    const length = Math.max(a.length, b.length);
    const result = new Uint8Array(length);
    let end = 0;
    for (let i = 0; i < result.length; i++) {
      result[i] = (a[i] & (256 - cond)) | (b[i] & (255 + cond));
      end += (cond & i < a.length) | ((1 - cond) & i < b.length);
    }
    return result.subarray(0, end);
  },
  /**
   * Return either `a` or `b` based on `cond`, in algorithmic constant time.
   * NB: it only supports `a, b` with values between 0-255.
   * @param {Boolean} cond
   * @param {Uint8} a
   * @param {Uint8} b
   * @returns `a` if `cond` is true, `b` otherwise
   */
  selectUint8: function(cond, a, b) {
    return (a & (256 - cond)) | (b & (255 + cond));
  },
  /**
   * @param {module:enums.symmetric} cipherAlgo
   */
  isAES: function(cipherAlgo) {
    return cipherAlgo === enums.symmetric.aes128 || cipherAlgo === enums.symmetric.aes192 || cipherAlgo === enums.symmetric.aes256;
  }
};

/* OpenPGP radix-64/base64 string encoding/decoding
 * Copyright 2005 Herbert Hanewinkel, www.haneWIN.de
 * version 1.0, check www.haneWIN.de for the latest version
 *
 * This software is provided as-is, without express or implied warranty.
 * Permission to use, copy, modify, distribute or sell this software, with or
 * without fee, for any purpose and by any individual or organization, is hereby
 * granted, provided that the above copyright notice and this paragraph appear
 * in all copies. Distribution as a part of an application or binary must
 * include the above copyright notice in the documentation and/or other materials
 * provided with the application or distribution.
 */


const Buffer$2 = util.getNodeBuffer();

let encodeChunk;
let decodeChunk;
if (Buffer$2) {
  encodeChunk = buf => Buffer$2.from(buf).toString('base64');
  decodeChunk = str => {
    const b = Buffer$2.from(str, 'base64');
    return new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
  };
} else {
  encodeChunk = buf => btoa(util.uint8ArrayToString(buf));
  decodeChunk = str => util.stringToUint8Array(atob(str));
}

/**
 * Convert binary array to radix-64
 * @param {Uint8Array | ReadableStream<Uint8Array>} data - Uint8Array to convert
 * @returns {String | ReadableStream<String>} Radix-64 version of input string.
 * @static
 */
function encode$1(data) {
  let buf = new Uint8Array();
  return transform(data, value => {
    buf = util.concatUint8Array([buf, value]);
    const r = [];
    const bytesPerLine = 45; // 60 chars per line * (3 bytes / 4 chars of base64).
    const lines = Math.floor(buf.length / bytesPerLine);
    const bytes = lines * bytesPerLine;
    const encoded = encodeChunk(buf.subarray(0, bytes));
    for (let i = 0; i < lines; i++) {
      r.push(encoded.substr(i * 60, 60));
      r.push('\n');
    }
    buf = buf.subarray(bytes);
    return r.join('');
  }, () => (buf.length ? encodeChunk(buf) + '\n' : ''));
}

/**
 * Convert radix-64 to binary array
 * @param {String | ReadableStream<String>} data - Radix-64 string to convert
 * @returns {Uint8Array | ReadableStream<Uint8Array>} Binary array version of input string.
 * @static
 */
function decode$1(data) {
  let buf = '';
  return transform(data, value => {
    buf += value;

    // Count how many whitespace characters there are in buf
    let spaces = 0;
    const spacechars = [' ', '\t', '\r', '\n'];
    for (let i = 0; i < spacechars.length; i++) {
      const spacechar = spacechars[i];
      for (let pos = buf.indexOf(spacechar); pos !== -1; pos = buf.indexOf(spacechar, pos + 1)) {
        spaces++;
      }
    }

    // Backtrack until we have 4n non-whitespace characters
    // that we can safely base64-decode
    let length = buf.length;
    for (; length > 0 && (length - spaces) % 4 !== 0; length--) {
      if (spacechars.includes(buf[length])) spaces--;
    }

    const decoded = decodeChunk(buf.substr(0, length));
    buf = buf.substr(length);
    return decoded;
  }, () => decodeChunk(buf));
}

/**
 * Convert a Base-64 encoded string an array of 8-bit integer
 *
 * Note: accepts both Radix-64 and URL-safe strings
 * @param {String} base64 - Base-64 encoded string to convert
 * @returns {Uint8Array} An array of 8-bit integers.
 */
function b64ToUint8Array(base64) {
  return decode$1(base64.replace(/-/g, '+').replace(/_/g, '/'));
}

/**
 * Convert an array of 8-bit integer to a Base-64 encoded string
 * @param {Uint8Array} bytes - An array of 8-bit integers to convert
 * @param {bool} url - If true, output is URL-safe
 * @returns {String} Base-64 encoded string.
 */
function uint8ArrayToB64(bytes, url) {
  let encoded = encode$1(bytes).replace(/[\r\n]/g, '');
  {
    encoded = encoded.replace(/[+]/g, '-').replace(/[/]/g, '_').replace(/[=]/g, '');
  }
  return encoded;
}

// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


/**
 * Finds out which Ascii Armoring type is used. Throws error if unknown type.
 * @param {String} text - ascii armored text
 * @returns {Integer} 0 = MESSAGE PART n of m.
 *         1 = MESSAGE PART n
 *         2 = SIGNED MESSAGE
 *         3 = PGP MESSAGE
 *         4 = PUBLIC KEY BLOCK
 *         5 = PRIVATE KEY BLOCK
 *         6 = SIGNATURE
 * @private
 */
function getType(text) {
  const reHeader = /^-----BEGIN PGP (MESSAGE, PART \d+\/\d+|MESSAGE, PART \d+|SIGNED MESSAGE|MESSAGE|PUBLIC KEY BLOCK|PRIVATE KEY BLOCK|SIGNATURE)-----$/m;

  const header = text.match(reHeader);

  if (!header) {
    throw new Error('Unknown ASCII armor type');
  }

  // BEGIN PGP MESSAGE, PART X/Y
  // Used for multi-part messages, where the armor is split amongst Y
  // parts, and this is the Xth part out of Y.
  if (/MESSAGE, PART \d+\/\d+/.test(header[1])) {
    return enums.armor.multipartSection;
  }
  // BEGIN PGP MESSAGE, PART X
  // Used for multi-part messages, where this is the Xth part of an
  // unspecified number of parts. Requires the MESSAGE-ID Armor
  // Header to be used.
  if (/MESSAGE, PART \d+/.test(header[1])) {
    return enums.armor.multipartLast;
  }
  // BEGIN PGP SIGNED MESSAGE
  if (/SIGNED MESSAGE/.test(header[1])) {
    return enums.armor.signed;
  }
  // BEGIN PGP MESSAGE
  // Used for signed, encrypted, or compressed files.
  if (/MESSAGE/.test(header[1])) {
    return enums.armor.message;
  }
  // BEGIN PGP PUBLIC KEY BLOCK
  // Used for armoring public keys.
  if (/PUBLIC KEY BLOCK/.test(header[1])) {
    return enums.armor.publicKey;
  }
  // BEGIN PGP PRIVATE KEY BLOCK
  // Used for armoring private keys.
  if (/PRIVATE KEY BLOCK/.test(header[1])) {
    return enums.armor.privateKey;
  }
  // BEGIN PGP SIGNATURE
  // Used for detached signatures, OpenPGP/MIME signatures, and
  // cleartext signatures. Note that PGP 2.x uses BEGIN PGP MESSAGE
  // for detached signatures.
  if (/SIGNATURE/.test(header[1])) {
    return enums.armor.signature;
  }
}

/**
 * Add additional information to the armor version of an OpenPGP binary
 * packet block.
 * @author  Alex
 * @version 2011-12-16
 * @param {String} [customComment] - Additional comment to add to the armored string
 * @returns {String} The header information.
 * @private
 */
function addheader(customComment, config) {
  let result = '';
  if (config.showVersion) {
    result += 'Version: ' + config.versionString + '\n';
  }
  if (config.showComment) {
    result += 'Comment: ' + config.commentString + '\n';
  }
  if (customComment) {
    result += 'Comment: ' + customComment + '\n';
  }
  result += '\n';
  return result;
}

/**
 * Calculates a checksum over the given data and returns it base64 encoded
 * @param {String | ReadableStream<String>} data - Data to create a CRC-24 checksum for
 * @returns {String | ReadableStream<String>} Base64 encoded checksum.
 * @private
 */
function getCheckSum(data) {
  const crc = createcrc24(data);
  return encode$1(crc);
}

// https://create.stephan-brumme.com/crc32/#slicing-by-8-overview

const crc_table = [
  new Array(0xFF),
  new Array(0xFF),
  new Array(0xFF),
  new Array(0xFF)
];

for (let i = 0; i <= 0xFF; i++) {
  let crc = i << 16;
  for (let j = 0; j < 8; j++) {
    crc = (crc << 1) ^ ((crc & 0x800000) !== 0 ? 0x864CFB : 0);
  }
  crc_table[0][i] =
    ((crc & 0xFF0000) >> 16) |
    (crc & 0x00FF00) |
    ((crc & 0x0000FF) << 16);
}
for (let i = 0; i <= 0xFF; i++) {
  crc_table[1][i] = (crc_table[0][i] >> 8) ^ crc_table[0][crc_table[0][i] & 0xFF];
}
for (let i = 0; i <= 0xFF; i++) {
  crc_table[2][i] = (crc_table[1][i] >> 8) ^ crc_table[0][crc_table[1][i] & 0xFF];
}
for (let i = 0; i <= 0xFF; i++) {
  crc_table[3][i] = (crc_table[2][i] >> 8) ^ crc_table[0][crc_table[2][i] & 0xFF];
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView#Endianness
const isLittleEndian = (function() {
  const buffer = new ArrayBuffer(2);
  new DataView(buffer).setInt16(0, 0xFF, true /* littleEndian */);
  // Int16Array uses the platform's endianness.
  return new Int16Array(buffer)[0] === 0xFF;
}());

/**
 * Internal function to calculate a CRC-24 checksum over a given string (data)
 * @param {String | ReadableStream<String>} input - Data to create a CRC-24 checksum for
 * @returns {Uint8Array | ReadableStream<Uint8Array>} The CRC-24 checksum.
 * @private
 */
function createcrc24(input) {
  let crc = 0xCE04B7;
  return transform(input, value => {
    const len32 = isLittleEndian ? Math.floor(value.length / 4) : 0;
    const arr32 = new Uint32Array(value.buffer, value.byteOffset, len32);
    for (let i = 0; i < len32; i++) {
      crc ^= arr32[i];
      crc =
        crc_table[0][(crc >> 24) & 0xFF] ^
        crc_table[1][(crc >> 16) & 0xFF] ^
        crc_table[2][(crc >> 8) & 0xFF] ^
        crc_table[3][(crc >> 0) & 0xFF];
    }
    for (let i = len32 * 4; i < value.length; i++) {
      crc = (crc >> 8) ^ crc_table[0][(crc & 0xFF) ^ value[i]];
    }
  }, () => new Uint8Array([crc, crc >> 8, crc >> 16]));
}

/**
 * Verify armored headers. crypto-refresh-06, section 6.2:
 * "An OpenPGP implementation may consider improperly formatted Armor
 * Headers to be corruption of the ASCII Armor, but SHOULD make an
 * effort to recover."
 * @private
 * @param {Array<String>} headers - Armor headers
 */
function verifyHeaders$1(headers) {
  for (let i = 0; i < headers.length; i++) {
    if (!/^([^\s:]|[^\s:][^:]*[^\s:]): .+$/.test(headers[i])) {
      util.printDebugError(new Error('Improperly formatted armor header: ' + headers[i]));
    }
    if (!/^(Version|Comment|MessageID|Hash|Charset): .+$/.test(headers[i])) {
      util.printDebugError(new Error('Unknown header: ' + headers[i]));
    }
  }
}

/**
 * Remove the (optional) checksum from an armored message.
 * @param {String} text - OpenPGP armored message
 * @returns {String} The body of the armored message.
 * @private
 */
function removeChecksum(text) {
  let body = text;

  const lastEquals = text.lastIndexOf('=');

  if (lastEquals >= 0 && lastEquals !== text.length - 1) { // '=' as the last char means no checksum
    body = text.slice(0, lastEquals);
  }

  return body;
}

/**
 * Dearmor an OpenPGP armored message; verify the checksum and return
 * the encoded bytes
 * @param {String} input - OpenPGP armored message
 * @returns {Promise<Object>} An object with attribute "text" containing the message text,
 * an attribute "data" containing a stream of bytes and "type" for the ASCII armor type
 * @async
 * @static
 */
function unarmor(input) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      const reSplit = /^-----[^-]+-----$/m;
      const reEmptyLine = /^[ \f\r\t\u00a0\u2000-\u200a\u202f\u205f\u3000]*$/;

      let type;
      const headers = [];
      let lastHeaders = headers;
      let headersDone;
      let text = [];
      let textDone;
      const data = decode$1(transformPair(input, async (readable, writable) => {
        const reader = getReader(readable);
        try {
          while (true) {
            let line = await reader.readLine();
            if (line === undefined) {
              throw new Error('Misformed armored text');
            }
            // remove trailing whitespace at end of lines
            line = util.removeTrailingSpaces(line.replace(/[\r\n]/g, ''));
            if (!type) {
              if (reSplit.test(line)) {
                type = getType(line);
              }
            } else if (!headersDone) {
              if (reSplit.test(line)) {
                reject(new Error('Mandatory blank line missing between armor headers and armor data'));
              }
              if (!reEmptyLine.test(line)) {
                lastHeaders.push(line);
              } else {
                verifyHeaders$1(lastHeaders);
                headersDone = true;
                if (textDone || type !== enums.armor.signed) {
                  resolve({ text, data, headers, type });
                  break;
                }
              }
            } else if (!textDone && type === enums.armor.signed) {
              if (!reSplit.test(line)) {
                // Reverse dash-escaping for msg
                text.push(line.replace(/^- /, ''));
              } else {
                text = text.join('\r\n');
                textDone = true;
                verifyHeaders$1(lastHeaders);
                lastHeaders = [];
                headersDone = false;
              }
            }
          }
        } catch (e) {
          reject(e);
          return;
        }
        const writer = getWriter(writable);
        try {
          while (true) {
            await writer.ready;
            const { done, value } = await reader.read();
            if (done) {
              throw new Error('Misformed armored text');
            }
            const line = value + '';
            if (line.indexOf('=') === -1 && line.indexOf('-') === -1) {
              await writer.write(line);
            } else {
              let remainder = await reader.readToEnd();
              if (!remainder.length) remainder = '';
              remainder = line + remainder;
              remainder = util.removeTrailingSpaces(remainder.replace(/\r/g, ''));
              const parts = remainder.split(reSplit);
              if (parts.length === 1) {
                throw new Error('Misformed armored text');
              }
              const body = removeChecksum(parts[0].slice(0, -1));
              await writer.write(body);
              break;
            }
          }
          await writer.ready;
          await writer.close();
        } catch (e) {
          await writer.abort(e);
        }
      }));
    } catch (e) {
      reject(e);
    }
  }).then(async result => {
    if (isArrayStream(result.data)) {
      result.data = await readToEnd(result.data);
    }
    return result;
  });
}


/**
 * Armor an OpenPGP binary packet block
 * @param {module:enums.armor} messageType - Type of the message
 * @param {Uint8Array | ReadableStream<Uint8Array>} body - The message body to armor
 * @param {Integer} [partIndex]
 * @param {Integer} [partTotal]
 * @param {String} [customComment] - Additional comment to add to the armored string
 * @param {Boolean} [emitChecksum] - Whether to compute and include the CRC checksum
 *  (NB: some types of data must not include it, but compliance is left as responsibility of the caller: this function does not carry out any checks)
 * @param {Object} [config] - Full configuration, defaults to openpgp.config
 * @returns {String | ReadableStream<String>} Armored text.
 * @static
 */
function armor(messageType, body, partIndex, partTotal, customComment, emitChecksum = false, config$1 = config) {
  let text;
  let hash;
  if (messageType === enums.armor.signed) {
    text = body.text;
    hash = body.hash;
    body = body.data;
  }
  // unless explicitly forbidden by the spec, we need to include the checksum to work around a GnuPG bug
  // where data fails to be decoded if the base64 ends with no padding chars (=) (see https://dev.gnupg.org/T7071)
  const maybeBodyClone = emitChecksum && passiveClone(body);

  const result = [];
  switch (messageType) {
    case enums.armor.multipartSection:
      result.push('-----BEGIN PGP MESSAGE, PART ' + partIndex + '/' + partTotal + '-----\n');
      result.push(addheader(customComment, config$1));
      result.push(encode$1(body));
      maybeBodyClone && result.push('=', getCheckSum(maybeBodyClone));
      result.push('-----END PGP MESSAGE, PART ' + partIndex + '/' + partTotal + '-----\n');
      break;
    case enums.armor.multipartLast:
      result.push('-----BEGIN PGP MESSAGE, PART ' + partIndex + '-----\n');
      result.push(addheader(customComment, config$1));
      result.push(encode$1(body));
      maybeBodyClone && result.push('=', getCheckSum(maybeBodyClone));
      result.push('-----END PGP MESSAGE, PART ' + partIndex + '-----\n');
      break;
    case enums.armor.signed:
      result.push('-----BEGIN PGP SIGNED MESSAGE-----\n');
      result.push(hash ? `Hash: ${hash}\n\n` : '\n');
      result.push(text.replace(/^-/mg, '- -'));
      result.push('\n-----BEGIN PGP SIGNATURE-----\n');
      result.push(addheader(customComment, config$1));
      result.push(encode$1(body));
      maybeBodyClone && result.push('=', getCheckSum(maybeBodyClone));
      result.push('-----END PGP SIGNATURE-----\n');
      break;
    case enums.armor.message:
      result.push('-----BEGIN PGP MESSAGE-----\n');
      result.push(addheader(customComment, config$1));
      result.push(encode$1(body));
      maybeBodyClone && result.push('=', getCheckSum(maybeBodyClone));
      result.push('-----END PGP MESSAGE-----\n');
      break;
    case enums.armor.publicKey:
      result.push('-----BEGIN PGP PUBLIC KEY BLOCK-----\n');
      result.push(addheader(customComment, config$1));
      result.push(encode$1(body));
      maybeBodyClone && result.push('=', getCheckSum(maybeBodyClone));
      result.push('-----END PGP PUBLIC KEY BLOCK-----\n');
      break;
    case enums.armor.privateKey:
      result.push('-----BEGIN PGP PRIVATE KEY BLOCK-----\n');
      result.push(addheader(customComment, config$1));
      result.push(encode$1(body));
      maybeBodyClone && result.push('=', getCheckSum(maybeBodyClone));
      result.push('-----END PGP PRIVATE KEY BLOCK-----\n');
      break;
    case enums.armor.signature:
      result.push('-----BEGIN PGP SIGNATURE-----\n');
      result.push(addheader(customComment, config$1));
      result.push(encode$1(body));
      maybeBodyClone && result.push('=', getCheckSum(maybeBodyClone));
      result.push('-----END PGP SIGNATURE-----\n');
      break;
  }

  return util.concat(result);
}

// Operations are not constant time, but we try and limit timing leakage where we can
const _0n$1 = BigInt(0);
const _1n$4 = BigInt(1);
function uint8ArrayToBigInt(bytes) {
    const hexAlphabet = '0123456789ABCDEF';
    let s = '';
    bytes.forEach(v => {
        s += hexAlphabet[v >> 4] + hexAlphabet[v & 15];
    });
    return BigInt('0x0' + s);
}
function mod(a, m) {
    const reduced = a % m;
    return reduced < _0n$1 ? reduced + m : reduced;
}
/**
 * Compute modular exponentiation using square and multiply
 * @param {BigInt} a - Base
 * @param {BigInt} e - Exponent
 * @param {BigInt} n - Modulo
 * @returns {BigInt} b ** e mod n.
 */
function modExp(b, e, n) {
    if (n === _0n$1)
        throw Error('Modulo cannot be zero');
    if (n === _1n$4)
        return BigInt(0);
    if (e < _0n$1)
        throw Error('Unsopported negative exponent');
    let exp = e;
    let x = b;
    x %= n;
    let r = BigInt(1);
    while (exp > _0n$1) {
        const lsb = exp & _1n$4;
        exp >>= _1n$4; // e / 2
        // Always compute multiplication step, to reduce timing leakage
        const rx = (r * x) % n;
        // Update r only if lsb is 1 (odd exponent)
        r = lsb ? rx : r;
        x = (x * x) % n; // Square
    }
    return r;
}
function abs(x) {
    return x >= _0n$1 ? x : -x;
}
/**
 * Extended Eucleadian algorithm (http://anh.cs.luc.edu/331/notes/xgcd.pdf)
 * Given a and b, compute (x, y) such that ax + by = gdc(a, b).
 * Negative numbers are also supported.
 * @param {BigInt} a - First operand
 * @param {BigInt} b - Second operand
 * @returns {{ gcd, x, y: bigint }}
 */
function _egcd(aInput, bInput) {
    let x = BigInt(0);
    let y = BigInt(1);
    let xPrev = BigInt(1);
    let yPrev = BigInt(0);
    // Deal with negative numbers: run algo over absolute values,
    // and "move" the sign to the returned x and/or y.
    // See https://math.stackexchange.com/questions/37806/extended-euclidean-algorithm-with-negative-numbers
    let a = abs(aInput);
    let b = abs(bInput);
    const aNegated = aInput < _0n$1;
    const bNegated = bInput < _0n$1;
    while (b !== _0n$1) {
        const q = a / b;
        let tmp = x;
        x = xPrev - q * x;
        xPrev = tmp;
        tmp = y;
        y = yPrev - q * y;
        yPrev = tmp;
        tmp = b;
        b = a % b;
        a = tmp;
    }
    return {
        x: aNegated ? -xPrev : xPrev,
        y: bNegated ? -yPrev : yPrev,
        gcd: a
    };
}
/**
 * Compute the inverse of `a` modulo `n`
 * Note: `a` and and `n` must be relatively prime
 * @param {BigInt} a
 * @param {BigInt} n - Modulo
 * @returns {BigInt} x such that a*x = 1 mod n
 * @throws {Error} if the inverse does not exist
 */
function modInv(a, n) {
    const { gcd, x } = _egcd(a, n);
    if (gcd !== _1n$4) {
        throw new Error('Inverse does not exist');
    }
    return mod(x + n, n);
}
/**
 * Compute greatest common divisor between this and n
 * @param {BigInt} aInput - Operand
 * @param {BigInt} bInput - Operand
 * @returns {BigInt} gcd
 */
function gcd(aInput, bInput) {
    let a = aInput;
    let b = bInput;
    while (b !== _0n$1) {
        const tmp = b;
        b = a % b;
        a = tmp;
    }
    return a;
}
/**
 * Get this value as an exact Number (max 53 bits)
 * Fails if this value is too large
 * @returns {Number}
 */
function bigIntToNumber(x) {
    const number = Number(x);
    if (number > Number.MAX_SAFE_INTEGER) {
        // We throw and error to conform with the bn.js implementation
        throw new Error('Number can only safely store up to 53 bits');
    }
    return number;
}
/**
 * Get value of i-th bit
 * @param {BigInt} x
 * @param {Number} i - Bit index
 * @returns {Number} Bit value.
 */
function getBit(x, i) {
    const bit = (x >> BigInt(i)) & _1n$4;
    return bit === _0n$1 ? 0 : 1;
}
/**
 * Compute bit length
 */
function bitLength(x) {
    // -1n >> -1n is -1n
    // 1n >> 1n is 0n
    const target = x < _0n$1 ? BigInt(-1) : _0n$1;
    let bitlen = 1;
    let tmp = x;
    // eslint-disable-next-line no-cond-assign
    while ((tmp >>= _1n$4) !== target) {
        bitlen++;
    }
    return bitlen;
}
/**
 * Compute byte length
 */
function byteLength(x) {
    const target = x < _0n$1 ? BigInt(-1) : _0n$1;
    const _8n = BigInt(8);
    let len = 1;
    let tmp = x;
    // eslint-disable-next-line no-cond-assign
    while ((tmp >>= _8n) !== target) {
        len++;
    }
    return len;
}
/**
 * Get Uint8Array representation of this number
 * @param {String} endian - Endianess of output array (defaults to 'be')
 * @param {Number} length - Of output array
 * @returns {Uint8Array}
 */
function bigIntToUint8Array(x, endian = 'be', length) {
    // we get and parse the hex string (https://coolaj86.com/articles/convert-js-bigints-to-typedarrays/)
    // this is faster than shift+mod iterations
    let hex = x.toString(16);
    if (hex.length % 2 === 1) {
        hex = '0' + hex;
    }
    const rawLength = hex.length / 2;
    const bytes = new Uint8Array(length || rawLength);
    // parse hex
    const offset = length ? length - rawLength : 0;
    let i = 0;
    while (i < rawLength) {
        bytes[i + offset] = parseInt(hex.slice(2 * i, 2 * i + 2), 16);
        i++;
    }
    if (endian !== 'be') {
        bytes.reverse();
    }
    return bytes;
}

// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


const nodeCrypto$9 = util.getNodeCrypto();

/**
 * Retrieve secure random byte array of the specified length
 * @param {Integer} length - Length in bytes to generate
 * @returns {Uint8Array} Random byte array.
 */
function getRandomBytes(length) {
  const webcrypto = typeof crypto !== 'undefined' ? crypto : nodeCrypto$9?.webcrypto;
  if (webcrypto?.getRandomValues) {
    const buf = new Uint8Array(length);
    return webcrypto.getRandomValues(buf);
  } else {
    throw new Error('No secure random number generator available.');
  }
}

/**
 * Create a secure random BigInt that is greater than or equal to min and less than max.
 * @param {bigint} min - Lower bound, included
 * @param {bigint} max - Upper bound, excluded
 * @returns {bigint} Random BigInt.
 * @async
 */
function getRandomBigInteger(min, max) {
  if (max < min) {
    throw new Error('Illegal parameter value: max <= min');
  }

  const modulus = max - min;
  const bytes = byteLength(modulus);

  // Using a while loop is necessary to avoid bias introduced by the mod operation.
  // However, we request 64 extra random bits so that the bias is negligible.
  // Section B.1.1 here: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.186-4.pdf
  const r = uint8ArrayToBigInt(getRandomBytes(bytes + 8));
  return mod(r, modulus) + min;
}

// OpenPGP.js - An OpenPGP implementation in javascript
// Copyright (C) 2018 Proton Technologies AG
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
/**
 * @fileoverview Algorithms for probabilistic random prime generation
 * @module crypto/public_key/prime
 */
const _1n$3 = BigInt(1);
/**
 * Generate a probably prime random number
 * @param bits - Bit length of the prime
 * @param e - Optional RSA exponent to check against the prime
 * @param k - Optional number of iterations of Miller-Rabin test
 */
function randomProbablePrime(bits, e, k) {
    const _30n = BigInt(30);
    const min = _1n$3 << BigInt(bits - 1);
    /*
     * We can avoid any multiples of 3 and 5 by looking at n mod 30
     * n mod 30 = 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29
     * the next possible prime is mod 30:
     *            1  7  7  7  7  7  7 11 11 11 11 13 13 17 17 17 17 19 19 23 23 23 23 29 29 29 29 29 29 1
     */
    const adds = [1, 6, 5, 4, 3, 2, 1, 4, 3, 2, 1, 2, 1, 4, 3, 2, 1, 2, 1, 4, 3, 2, 1, 6, 5, 4, 3, 2, 1, 2];
    let n = getRandomBigInteger(min, min << _1n$3);
    let i = bigIntToNumber(mod(n, _30n));
    do {
        n += BigInt(adds[i]);
        i = (i + adds[i]) % adds.length;
        // If reached the maximum, go back to the minimum.
        if (bitLength(n) > bits) {
            n = mod(n, min << _1n$3);
            n += min;
            i = bigIntToNumber(mod(n, _30n));
        }
    } while (!isProbablePrime(n, e, k));
    return n;
}
/**
 * Probabilistic primality testing
 * @param n - Number to test
 * @param e - Optional RSA exponent to check against the prime
 * @param k - Optional number of iterations of Miller-Rabin test
 */
function isProbablePrime(n, e, k) {
    if (e && gcd(n - _1n$3, e) !== _1n$3) {
        return false;
    }
    if (!divisionTest(n)) {
        return false;
    }
    if (!fermat(n)) {
        return false;
    }
    if (!millerRabin(n, k)) {
        return false;
    }
    // TODO implement the Lucas test
    // See Section C.3.3 here: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.186-4.pdf
    return true;
}
/**
 * Tests whether n is probably prime or not using Fermat's test with b = 2.
 * Fails if b^(n-1) mod n != 1.
 * @param n - Number to test
 * @param b - Optional Fermat test base
 */
function fermat(n, b = BigInt(2)) {
    return modExp(b, n - _1n$3, n) === _1n$3;
}
function divisionTest(n) {
    const _0n = BigInt(0);
    return smallPrimes.every(m => mod(n, m) !== _0n);
}
// https://github.com/gpg/libgcrypt/blob/master/cipher/primegen.c
const smallPrimes = [
    7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43,
    47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101,
    103, 107, 109, 113, 127, 131, 137, 139, 149, 151,
    157, 163, 167, 173, 179, 181, 191, 193, 197, 199,
    211, 223, 227, 229, 233, 239, 241, 251, 257, 263,
    269, 271, 277, 281, 283, 293, 307, 311, 313, 317,
    331, 337, 347, 349, 353, 359, 367, 373, 379, 383,
    389, 397, 401, 409, 419, 421, 431, 433, 439, 443,
    449, 457, 461, 463, 467, 479, 487, 491, 499, 503,
    509, 521, 523, 541, 547, 557, 563, 569, 571, 577,
    587, 593, 599, 601, 607, 613, 617, 619, 631, 641,
    643, 647, 653, 659, 661, 673, 677, 683, 691, 701,
    709, 719, 727, 733, 739, 743, 751, 757, 761, 769,
    773, 787, 797, 809, 811, 821, 823, 827, 829, 839,
    853, 857, 859, 863, 877, 881, 883, 887, 907, 911,
    919, 929, 937, 941, 947, 953, 967, 971, 977, 983,
    991, 997, 1009, 1013, 1019, 1021, 1031, 1033,
    1039, 1049, 1051, 1061, 1063, 1069, 1087, 1091,
    1093, 1097, 1103, 1109, 1117, 1123, 1129, 1151,
    1153, 1163, 1171, 1181, 1187, 1193, 1201, 1213,
    1217, 1223, 1229, 1231, 1237, 1249, 1259, 1277,
    1279, 1283, 1289, 1291, 1297, 1301, 1303, 1307,
    1319, 1321, 1327, 1361, 1367, 1373, 1381, 1399,
    1409, 1423, 1427, 1429, 1433, 1439, 1447, 1451,
    1453, 1459, 1471, 1481, 1483, 1487, 1489, 1493,
    1499, 1511, 1523, 1531, 1543, 1549, 1553, 1559,
    1567, 1571, 1579, 1583, 1597, 1601, 1607, 1609,
    1613, 1619, 1621, 1627, 1637, 1657, 1663, 1667,
    1669, 1693, 1697, 1699, 1709, 1721, 1723, 1733,
    1741, 1747, 1753, 1759, 1777, 1783, 1787, 1789,
    1801, 1811, 1823, 1831, 1847, 1861, 1867, 1871,
    1873, 1877, 1879, 1889, 1901, 1907, 1913, 1931,
    1933, 1949, 1951, 1973, 1979, 1987, 1993, 1997,
    1999, 2003, 2011, 2017, 2027, 2029, 2039, 2053,
    2063, 2069, 2081, 2083, 2087, 2089, 2099, 2111,
    2113, 2129, 2131, 2137, 2141, 2143, 2153, 2161,
    2179, 2203, 2207, 2213, 2221, 2237, 2239, 2243,
    2251, 2267, 2269, 2273, 2281, 2287, 2293, 2297,
    2309, 2311, 2333, 2339, 2341, 2347, 2351, 2357,
    2371, 2377, 2381, 2383, 2389, 2393, 2399, 2411,
    2417, 2423, 2437, 2441, 2447, 2459, 2467, 2473,
    2477, 2503, 2521, 2531, 2539, 2543, 2549, 2551,
    2557, 2579, 2591, 2593, 2609, 2617, 2621, 2633,
    2647, 2657, 2659, 2663, 2671, 2677, 2683, 2687,
    2689, 2693, 2699, 2707, 2711, 2713, 2719, 2729,
    2731, 2741, 2749, 2753, 2767, 2777, 2789, 2791,
    2797, 2801, 2803, 2819, 2833, 2837, 2843, 2851,
    2857, 2861, 2879, 2887, 2897, 2903, 2909, 2917,
    2927, 2939, 2953, 2957, 2963, 2969, 2971, 2999,
    3001, 3011, 3019, 3023, 3037, 3041, 3049, 3061,
    3067, 3079, 3083, 3089, 3109, 3119, 3121, 3137,
    3163, 3167, 3169, 3181, 3187, 3191, 3203, 3209,
    3217, 3221, 3229, 3251, 3253, 3257, 3259, 3271,
    3299, 3301, 3307, 3313, 3319, 3323, 3329, 3331,
    3343, 3347, 3359, 3361, 3371, 3373, 3389, 3391,
    3407, 3413, 3433, 3449, 3457, 3461, 3463, 3467,
    3469, 3491, 3499, 3511, 3517, 3527, 3529, 3533,
    3539, 3541, 3547, 3557, 3559, 3571, 3581, 3583,
    3593, 3607, 3613, 3617, 3623, 3631, 3637, 3643,
    3659, 3671, 3673, 3677, 3691, 3697, 3701, 3709,
    3719, 3727, 3733, 3739, 3761, 3767, 3769, 3779,
    3793, 3797, 3803, 3821, 3823, 3833, 3847, 3851,
    3853, 3863, 3877, 3881, 3889, 3907, 3911, 3917,
    3919, 3923, 3929, 3931, 3943, 3947, 3967, 3989,
    4001, 4003, 4007, 4013, 4019, 4021, 4027, 4049,
    4051, 4057, 4073, 4079, 4091, 4093, 4099, 4111,
    4127, 4129, 4133, 4139, 4153, 4157, 4159, 4177,
    4201, 4211, 4217, 4219, 4229, 4231, 4241, 4243,
    4253, 4259, 4261, 4271, 4273, 4283, 4289, 4297,
    4327, 4337, 4339, 4349, 4357, 4363, 4373, 4391,
    4397, 4409, 4421, 4423, 4441, 4447, 4451, 4457,
    4463, 4481, 4483, 4493, 4507, 4513, 4517, 4519,
    4523, 4547, 4549, 4561, 4567, 4583, 4591, 4597,
    4603, 4621, 4637, 4639, 4643, 4649, 4651, 4657,
    4663, 4673, 4679, 4691, 4703, 4721, 4723, 4729,
    4733, 4751, 4759, 4783, 4787, 4789, 4793, 4799,
    4801, 4813, 4817, 4831, 4861, 4871, 4877, 4889,
    4903, 4909, 4919, 4931, 4933, 4937, 4943, 4951,
    4957, 4967, 4969, 4973, 4987, 4993, 4999
].map(n => BigInt(n));
// Miller-Rabin - Miller Rabin algorithm for primality test
// Copyright Fedor Indutny, 2014.
//
// This software is licensed under the MIT License.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
// Adapted on Jan 2018 from version 4.0.1 at https://github.com/indutny/miller-rabin
// Sample syntax for Fixed-Base Miller-Rabin:
// millerRabin(n, k, () => new BN(small_primes[Math.random() * small_primes.length | 0]))
/**
 * Tests whether n is probably prime or not using the Miller-Rabin test.
 * See HAC Remark 4.28.
 * @param n - Number to test
 * @param k - Optional number of iterations of Miller-Rabin test
 * @param rand - Optional function to generate potential witnesses
 * @returns {boolean}
 * @async
 */
function millerRabin(n, k, rand) {
    const len = bitLength(n);
    if (!k) {
        k = Math.max(1, (len / 48) | 0);
    }
    const n1 = n - _1n$3; // n - 1
    // Find d and s, (n - 1) = (2 ^ s) * d;
    let s = 0;
    while (!getBit(n1, s)) {
        s++;
    }
    const d = n >> BigInt(s);
    for (; k > 0; k--) {
        const a = getRandomBigInteger(BigInt(2), n1);
        let x = modExp(a, d, n);
        if (x === _1n$3 || x === n1) {
            continue;
        }
        let i;
        for (i = 1; i < s; i++) {
            x = mod(x * x, n);
            if (x === _1n$3) {
                return false;
            }
            if (x === n1) {
                break;
            }
        }
        if (i === s) {
            return false;
        }
    }
    return true;
}

/**
 * @fileoverview Provides an interface to hashing functions available in Node.js or external libraries.
 * @see {@link https://github.com/asmcrypto/asmcrypto.js|asmCrypto}
 * @see {@link https://github.com/indutny/hash.js|hash.js}
 * @module crypto/hash
 */


const webCrypto$a = util.getWebCrypto();
const nodeCrypto$8 = util.getNodeCrypto();
const nodeCryptoHashes = nodeCrypto$8 && nodeCrypto$8.getHashes();

function nodeHash(type) {
  if (!nodeCrypto$8 || !nodeCryptoHashes.includes(type)) {
    return;
  }
  return async function (data) {
    const shasum = nodeCrypto$8.createHash(type);
    return transform(data, value => {
      shasum.update(value);
    }, () => new Uint8Array(shasum.digest()));
  };
}

function nobleHash(nobleHashName, webCryptoHashName) {
  const getNobleHash = async () => {
    const { nobleHashes } = await import('./noble_hashes.mjs');
    const hash = nobleHashes.get(nobleHashName);
    if (!hash) throw new Error('Unsupported hash');
    return hash;
  };

  return async function(data) {
    if (isArrayStream(data)) {
      data = await readToEnd(data);
    }
    if (util.isStream(data)) {
      const hash = await getNobleHash();

      const hashInstance = hash.create();
      return transform(data, value => {
        hashInstance.update(value);
      }, () => hashInstance.digest());
    } else if (webCrypto$a && webCryptoHashName) {
      return new Uint8Array(await webCrypto$a.digest(webCryptoHashName, data));
    } else {
      const hash = await getNobleHash();

      return hash(data);
    }
  };
}

const md5 = nodeHash('md5') || nobleHash('md5');
const sha1 = nodeHash('sha1') || nobleHash('sha1', 'SHA-1');
const sha224 = nodeHash('sha224') || nobleHash('sha224');
const sha256 = nodeHash('sha256') || nobleHash('sha256', 'SHA-256');
const sha384 = nodeHash('sha384') || nobleHash('sha384', 'SHA-384');
const sha512 = nodeHash('sha512') || nobleHash('sha512', 'SHA-512');
const ripemd = nodeHash('ripemd160') || nobleHash('ripemd160');
const sha3_256 = nodeHash('sha3-256') || nobleHash('sha3_256');
const sha3_512 = nodeHash('sha3-512') || nobleHash('sha3_512');

/**
 * Create a hash on the specified data using the specified algorithm
 * @param {module:enums.hash} algo - Hash algorithm type (see {@link https://tools.ietf.org/html/rfc4880#section-9.4|RFC 4880 9.4})
 * @param {Uint8Array} data - Data to be hashed
 * @returns {Promise<Uint8Array>} Hash value.
 */
function computeDigest(algo, data) {
  switch (algo) {
    case enums.hash.md5:
      return md5(data);
    case enums.hash.sha1:
      return sha1(data);
    case enums.hash.ripemd:
      return ripemd(data);
    case enums.hash.sha256:
      return sha256(data);
    case enums.hash.sha384:
      return sha384(data);
    case enums.hash.sha512:
      return sha512(data);
    case enums.hash.sha224:
      return sha224(data);
    case enums.hash.sha3_256:
      return sha3_256(data);
    case enums.hash.sha3_512:
      return sha3_512(data);
    default:
      throw new Error('Unsupported hash function');
  }
}

/**
 * Returns the hash size in bytes of the specified hash algorithm type
 * @param {module:enums.hash} algo - Hash algorithm type (See {@link https://tools.ietf.org/html/rfc4880#section-9.4|RFC 4880 9.4})
 * @returns {Integer} Size in bytes of the resulting hash.
 */
function getHashByteLength(algo) {
  switch (algo) {
    case enums.hash.md5:
      return 16;
    case enums.hash.sha1:
    case enums.hash.ripemd:
      return 20;
    case enums.hash.sha256:
      return 32;
    case enums.hash.sha384:
      return 48;
    case enums.hash.sha512:
      return 64;
    case enums.hash.sha224:
      return 28;
    case enums.hash.sha3_256:
      return 32;
    case enums.hash.sha3_512:
      return 64;
    default:
      throw new Error('Invalid hash algorithm.');
  }
}

// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


/**
 * ASN1 object identifiers for hashes
 * @see {@link https://tools.ietf.org/html/rfc4880#section-5.2.2}
 */
const hash_headers = [];
hash_headers[1] = [0x30, 0x20, 0x30, 0x0c, 0x06, 0x08, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x02, 0x05, 0x05, 0x00, 0x04,
  0x10];
hash_headers[2] = [0x30, 0x21, 0x30, 0x09, 0x06, 0x05, 0x2b, 0x0e, 0x03, 0x02, 0x1a, 0x05, 0x00, 0x04, 0x14];
hash_headers[3] = [0x30, 0x21, 0x30, 0x09, 0x06, 0x05, 0x2B, 0x24, 0x03, 0x02, 0x01, 0x05, 0x00, 0x04, 0x14];
hash_headers[8] = [0x30, 0x31, 0x30, 0x0d, 0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x01, 0x05, 0x00,
  0x04, 0x20];
hash_headers[9] = [0x30, 0x41, 0x30, 0x0d, 0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x02, 0x05, 0x00,
  0x04, 0x30];
hash_headers[10] = [0x30, 0x51, 0x30, 0x0d, 0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x03, 0x05,
  0x00, 0x04, 0x40];
hash_headers[11] = [0x30, 0x2d, 0x30, 0x0d, 0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x04, 0x05,
  0x00, 0x04, 0x1C];

/**
 * Create padding with secure random data
 * @private
 * @param {Integer} length - Length of the padding in bytes
 * @returns {Uint8Array} Random padding.
 */
function getPKCS1Padding(length) {
  const result = new Uint8Array(length);
  let count = 0;
  while (count < length) {
    const randomBytes = getRandomBytes(length - count);
    for (let i = 0; i < randomBytes.length; i++) {
      if (randomBytes[i] !== 0) {
        result[count++] = randomBytes[i];
      }
    }
  }
  return result;
}

/**
 * Create a EME-PKCS1-v1_5 padded message
 * @see {@link https://tools.ietf.org/html/rfc4880#section-13.1.1|RFC 4880 13.1.1}
 * @param {Uint8Array} message - Message to be encoded
 * @param {Integer} keyLength - The length in octets of the key modulus
 * @returns {Uint8Array} EME-PKCS1 padded message.
 */
function emeEncode(message, keyLength) {
  const mLength = message.length;
  // length checking
  if (mLength > keyLength - 11) {
    throw new Error('Message too long');
  }
  // Generate an octet string PS of length k - mLen - 3 consisting of
  // pseudo-randomly generated nonzero octets
  const PS = getPKCS1Padding(keyLength - mLength - 3);
  // Concatenate PS, the message M, and other padding to form an
  // encoded message EM of length k octets as EM = 0x00 || 0x02 || PS || 0x00 || M.
  const encoded = new Uint8Array(keyLength);
  // 0x00 byte
  encoded[1] = 2;
  encoded.set(PS, 2);
  // 0x00 bytes
  encoded.set(message, keyLength - mLength);
  return encoded;
}

/**
 * Decode a EME-PKCS1-v1_5 padded message
 * @see {@link https://tools.ietf.org/html/rfc4880#section-13.1.2|RFC 4880 13.1.2}
 * @param {Uint8Array} encoded - Encoded message bytes
 * @param {Uint8Array} randomPayload - Data to return in case of decoding error (needed for constant-time processing)
 * @returns {Uint8Array} decoded data or `randomPayload` (on error, if given)
 * @throws {Error} on decoding failure, unless `randomPayload` is provided
 */
function emeDecode(encoded, randomPayload) {
  // encoded format: 0x00 0x02 <PS> 0x00 <payload>
  let offset = 2;
  let separatorNotFound = 1;
  for (let j = offset; j < encoded.length; j++) {
    separatorNotFound &= encoded[j] !== 0;
    offset += separatorNotFound;
  }

  const psLen = offset - 2;
  const payload = encoded.subarray(offset + 1); // discard the 0x00 separator
  const isValidPadding = encoded[0] === 0 & encoded[1] === 2 & psLen >= 8 & !separatorNotFound;

  if (randomPayload) {
    return util.selectUint8Array(isValidPadding, payload, randomPayload);
  }

  if (isValidPadding) {
    return payload;
  }

  throw new Error('Decryption error');
}

/**
 * Create a EMSA-PKCS1-v1_5 padded message
 * @see {@link https://tools.ietf.org/html/rfc4880#section-13.1.3|RFC 4880 13.1.3}
 * @param {Integer} algo - Hash algorithm type used
 * @param {Uint8Array} hashed - Message to be encoded
 * @param {Integer} emLen - Intended length in octets of the encoded message
 * @returns {Uint8Array} Encoded message.
 */
function emsaEncode(algo, hashed, emLen) {
  let i;
  if (hashed.length !== getHashByteLength(algo)) {
    throw new Error('Invalid hash length');
  }
  // produce an ASN.1 DER value for the hash function used.
  // Let T be the full hash prefix
  const hashPrefix = new Uint8Array(hash_headers[algo].length);
  for (i = 0; i < hash_headers[algo].length; i++) {
    hashPrefix[i] = hash_headers[algo][i];
  }
  // and let tLen be the length in octets prefix and hashed data
  const tLen = hashPrefix.length + hashed.length;
  if (emLen < tLen + 11) {
    throw new Error('Intended encoded message length too short');
  }
  // an octet string PS consisting of emLen - tLen - 3 octets with hexadecimal value 0xFF
  // The length of PS will be at least 8 octets
  const PS = new Uint8Array(emLen - tLen - 3).fill(0xff);

  // Concatenate PS, the hash prefix, hashed data, and other padding to form the
  // encoded message EM as EM = 0x00 || 0x01 || PS || 0x00 || prefix || hashed
  const EM = new Uint8Array(emLen);
  EM[1] = 0x01;
  EM.set(PS, 2);
  EM.set(hashPrefix, emLen - tLen);
  EM.set(hashed, emLen - hashed.length);
  return EM;
}

// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


const webCrypto$9 = util.getWebCrypto();
const nodeCrypto$7 = util.getNodeCrypto();
const _1n$2 = BigInt(1);

/** Create signature
 * @param {module:enums.hash} hashAlgo - Hash algorithm
 * @param {Uint8Array} data - Message
 * @param {Uint8Array} n - RSA public modulus
 * @param {Uint8Array} e - RSA public exponent
 * @param {Uint8Array} d - RSA private exponent
 * @param {Uint8Array} p - RSA private prime p
 * @param {Uint8Array} q - RSA private prime q
 * @param {Uint8Array} u - RSA private coefficient
 * @param {Uint8Array} hashed - Hashed message
 * @returns {Promise<Uint8Array>} RSA Signature.
 * @async
 */
async function sign$6(hashAlgo, data, n, e, d, p, q, u, hashed) {
  if (getHashByteLength(hashAlgo) >= n.length) {
    // Throw here instead of `emsaEncode` below, to provide a clearer and consistent error
    // e.g. if a 512-bit RSA key is used with a SHA-512 digest.
    // The size limit is actually slightly different but here we only care about throwing
    // on common key sizes.
    throw new Error('Digest size cannot exceed key modulus size');
  }

  if (data && !util.isStream(data)) {
    if (util.getWebCrypto()) {
      try {
        return await webSign$1(enums.read(enums.webHash, hashAlgo), data, n, e, d, p, q, u);
      } catch (err) {
        util.printDebugError(err);
      }
    } else if (util.getNodeCrypto()) {
      return nodeSign$1(hashAlgo, data, n, e, d, p, q, u);
    }
  }
  return bnSign(hashAlgo, n, d, hashed);
}

/**
 * Verify signature
 * @param {module:enums.hash} hashAlgo - Hash algorithm
 * @param {Uint8Array} data - Message
 * @param {Uint8Array} s - Signature
 * @param {Uint8Array} n - RSA public modulus
 * @param {Uint8Array} e - RSA public exponent
 * @param {Uint8Array} hashed - Hashed message
 * @returns {Boolean}
 * @async
 */
async function verify$6(hashAlgo, data, s, n, e, hashed) {
  if (data && !util.isStream(data)) {
    if (util.getWebCrypto()) {
      try {
        return await webVerify$1(enums.read(enums.webHash, hashAlgo), data, s, n, e);
      } catch (err) {
        util.printDebugError(err);
      }
    } else if (util.getNodeCrypto()) {
      return nodeVerify$1(hashAlgo, data, s, n, e);
    }
  }
  return bnVerify(hashAlgo, s, n, e, hashed);
}

/**
 * Encrypt message
 * @param {Uint8Array} data - Message
 * @param {Uint8Array} n - RSA public modulus
 * @param {Uint8Array} e - RSA public exponent
 * @returns {Promise<Uint8Array>} RSA Ciphertext.
 * @async
 */
async function encrypt$6(data, n, e) {
  if (util.getNodeCrypto()) {
    return nodeEncrypt$1(data, n, e);
  }
  return bnEncrypt(data, n, e);
}

/**
 * Decrypt RSA message
 * @param {Uint8Array} m - Message
 * @param {Uint8Array} n - RSA public modulus
 * @param {Uint8Array} e - RSA public exponent
 * @param {Uint8Array} d - RSA private exponent
 * @param {Uint8Array} p - RSA private prime p
 * @param {Uint8Array} q - RSA private prime q
 * @param {Uint8Array} u - RSA private coefficient
 * @param {Uint8Array} randomPayload - Data to return on decryption error, instead of throwing
 *                                     (needed for constant-time processing)
 * @returns {Promise<String>} RSA Plaintext.
 * @throws {Error} on decryption error, unless `randomPayload` is given
 * @async
 */
async function decrypt$6(data, n, e, d, p, q, u, randomPayload) {
  // Node v18.19.1, 20.11.1 and 21.6.2 have disabled support for PKCS#1 decryption,
  // and we want to avoid checking the error type to decide if the random payload
  // should indeed be returned.
  if (util.getNodeCrypto() && !randomPayload) {
    try {
      return await nodeDecrypt$1(data, n, e, d, p, q, u);
    } catch (err) {
      util.printDebugError(err);
    }
  }
  return bnDecrypt(data, n, e, d, p, q, u, randomPayload);
}

/**
 * Generate a new random private key B bits long with public exponent E.
 *
 * When possible, webCrypto or nodeCrypto is used. Otherwise, primes are generated using
 * 40 rounds of the Miller-Rabin probabilistic random prime generation algorithm.
 * @see module:crypto/public_key/prime
 * @param {Integer} bits - RSA bit length
 * @param {Integer} e - RSA public exponent
 * @returns {{n, e, d,
 *            p, q ,u: Uint8Array}} RSA public modulus, RSA public exponent, RSA private exponent,
 *                                  RSA private prime p, RSA private prime q, u = p ** -1 mod q
 * @async
 */
async function generate$4(bits, e) {
  e = BigInt(e);

  // Native RSA keygen using Web Crypto
  if (util.getWebCrypto()) {
    const keyGenOpt = {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: bits, // the specified keysize in bits
      publicExponent: bigIntToUint8Array(e), // take three bytes (max 65537) for exponent
      hash: {
        name: 'SHA-1' // not required for actual RSA keys, but for crypto api 'sign' and 'verify'
      }
    };
    const keyPair = await webCrypto$9.generateKey(keyGenOpt, true, ['sign', 'verify']);

    // export the generated keys as JsonWebKey (JWK)
    // https://tools.ietf.org/html/draft-ietf-jose-json-web-key-33
    const jwk = await webCrypto$9.exportKey('jwk', keyPair.privateKey);
    // map JWK parameters to corresponding OpenPGP names
    return jwkToPrivate(jwk, e);
  } else if (util.getNodeCrypto()) {
    const opts = {
      modulusLength: bits,
      publicExponent: bigIntToNumber(e),
      publicKeyEncoding: { type: 'pkcs1', format: 'jwk' },
      privateKeyEncoding: { type: 'pkcs1', format: 'jwk' }
    };
    const jwk = await new Promise((resolve, reject) => {
      nodeCrypto$7.generateKeyPair('rsa', opts, (err, _, jwkPrivateKey) => {
        if (err) {
          reject(err);
        } else {
          resolve(jwkPrivateKey);
        }
      });
    });
    return jwkToPrivate(jwk, e);
  }

  // RSA keygen fallback using 40 iterations of the Miller-Rabin test
  // See https://stackoverflow.com/a/6330138 for justification
  // Also see section C.3 here: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST
  let p;
  let q;
  let n;
  do {
    q = randomProbablePrime(bits - (bits >> 1), e, 40);
    p = randomProbablePrime(bits >> 1, e, 40);
    n = p * q;
  } while (bitLength(n) !== bits);

  const phi = (p - _1n$2) * (q - _1n$2);

  if (q < p) {
    [p, q] = [q, p];
  }

  return {
    n: bigIntToUint8Array(n),
    e: bigIntToUint8Array(e),
    d: bigIntToUint8Array(modInv(e, phi)),
    p: bigIntToUint8Array(p),
    q: bigIntToUint8Array(q),
    // dp: d.mod(p.subn(1)),
    // dq: d.mod(q.subn(1)),
    u: bigIntToUint8Array(modInv(p, q))
  };
}

/**
 * Validate RSA parameters
 * @param {Uint8Array} n - RSA public modulus
 * @param {Uint8Array} e - RSA public exponent
 * @param {Uint8Array} d - RSA private exponent
 * @param {Uint8Array} p - RSA private prime p
 * @param {Uint8Array} q - RSA private prime q
 * @param {Uint8Array} u - RSA inverse of p w.r.t. q
 * @returns {Promise<Boolean>} Whether params are valid.
 * @async
 */
async function validateParams$8(n, e, d, p, q, u) {
  n = uint8ArrayToBigInt(n);
  p = uint8ArrayToBigInt(p);
  q = uint8ArrayToBigInt(q);

  // expect pq = n
  if ((p * q) !== n) {
    return false;
  }

  const _2n = BigInt(2);
  // expect p*u = 1 mod q
  u = uint8ArrayToBigInt(u);
  if (mod(p * u, q) !== BigInt(1)) {
    return false;
  }

  e = uint8ArrayToBigInt(e);
  d = uint8ArrayToBigInt(d);
  /**
   * In RSA pkcs#1 the exponents (d, e) are inverses modulo lcm(p-1, q-1)
   * We check that [de = 1 mod (p-1)] and [de = 1 mod (q-1)]
   * By CRT on coprime factors of (p-1, q-1) it follows that [de = 1 mod lcm(p-1, q-1)]
   *
   * We blind the multiplication with r, and check that rde = r mod lcm(p-1, q-1)
   */
  const nSizeOver3 = BigInt(Math.floor(bitLength(n) / 3));
  const r = getRandomBigInteger(_2n, _2n << nSizeOver3); // r in [ 2, 2^{|n|/3} ) < p and q
  const rde = r * d * e;

  const areInverses = mod(rde, p - _1n$2) === r && mod(rde, q - _1n$2) === r;
  if (!areInverses) {
    return false;
  }

  return true;
}

async function bnSign(hashAlgo, n, d, hashed) {
  n = uint8ArrayToBigInt(n);
  const m = uint8ArrayToBigInt(emsaEncode(hashAlgo, hashed, byteLength(n)));
  d = uint8ArrayToBigInt(d);
  return bigIntToUint8Array(modExp(m, d, n), 'be', byteLength(n));
}

async function webSign$1(hashName, data, n, e, d, p, q, u) {
  /** OpenPGP keys require that p < q, and Safari Web Crypto requires that p > q.
   * We swap them in privateToJWK, so it usually works out, but nevertheless,
   * not all OpenPGP keys are compatible with this requirement.
   * OpenPGP.js used to generate RSA keys the wrong way around (p > q), and still
   * does if the underlying Web Crypto does so (though the tested implementations
   * don't do so).
   */
  const jwk = await privateToJWK$1(n, e, d, p, q, u);
  const algo = {
    name: 'RSASSA-PKCS1-v1_5',
    hash: { name: hashName }
  };
  const key = await webCrypto$9.importKey('jwk', jwk, algo, false, ['sign']);
  return new Uint8Array(await webCrypto$9.sign('RSASSA-PKCS1-v1_5', key, data));
}

async function nodeSign$1(hashAlgo, data, n, e, d, p, q, u) {
  const sign = nodeCrypto$7.createSign(enums.read(enums.hash, hashAlgo));
  sign.write(data);
  sign.end();

  const jwk = await privateToJWK$1(n, e, d, p, q, u);
  return new Uint8Array(sign.sign({ key: jwk, format: 'jwk', type: 'pkcs1' }));
}

async function bnVerify(hashAlgo, s, n, e, hashed) {
  n = uint8ArrayToBigInt(n);
  s = uint8ArrayToBigInt(s);
  e = uint8ArrayToBigInt(e);
  if (s >= n) {
    throw new Error('Signature size cannot exceed modulus size');
  }
  const EM1 = bigIntToUint8Array(modExp(s, e, n), 'be', byteLength(n));
  const EM2 = emsaEncode(hashAlgo, hashed, byteLength(n));
  return util.equalsUint8Array(EM1, EM2);
}

async function webVerify$1(hashName, data, s, n, e) {
  const jwk = publicToJWK(n, e);
  const key = await webCrypto$9.importKey('jwk', jwk, {
    name: 'RSASSA-PKCS1-v1_5',
    hash: { name:  hashName }
  }, false, ['verify']);
  return webCrypto$9.verify('RSASSA-PKCS1-v1_5', key, s, data);
}

async function nodeVerify$1(hashAlgo, data, s, n, e) {
  const jwk = publicToJWK(n, e);
  const key = { key: jwk, format: 'jwk', type: 'pkcs1' };

  const verify = nodeCrypto$7.createVerify(enums.read(enums.hash, hashAlgo));
  verify.write(data);
  verify.end();

  try {
    return verify.verify(key, s);
  } catch (err) {
    return false;
  }
}

async function nodeEncrypt$1(data, n, e) {
  const jwk = publicToJWK(n, e);
  const key = { key: jwk, format: 'jwk', type: 'pkcs1', padding: nodeCrypto$7.constants.RSA_PKCS1_PADDING };

  return new Uint8Array(nodeCrypto$7.publicEncrypt(key, data));
}

async function bnEncrypt(data, n, e) {
  n = uint8ArrayToBigInt(n);
  data = uint8ArrayToBigInt(emeEncode(data, byteLength(n)));
  e = uint8ArrayToBigInt(e);
  if (data >= n) {
    throw new Error('Message size cannot exceed modulus size');
  }
  return bigIntToUint8Array(modExp(data, e, n), 'be', byteLength(n));
}

async function nodeDecrypt$1(data, n, e, d, p, q, u) {
  const jwk = await privateToJWK$1(n, e, d, p, q, u);
  const key = { key: jwk, format: 'jwk' , type: 'pkcs1', padding: nodeCrypto$7.constants.RSA_PKCS1_PADDING };

  try {
    return new Uint8Array(nodeCrypto$7.privateDecrypt(key, data));
  } catch (err) {
    throw new Error('Decryption error');
  }
}

async function bnDecrypt(data, n, e, d, p, q, u, randomPayload) {
  data = uint8ArrayToBigInt(data);
  n = uint8ArrayToBigInt(n);
  e = uint8ArrayToBigInt(e);
  d = uint8ArrayToBigInt(d);
  p = uint8ArrayToBigInt(p);
  q = uint8ArrayToBigInt(q);
  u = uint8ArrayToBigInt(u);
  if (data >= n) {
    throw new Error('Data too large.');
  }
  const dq = mod(d, q - _1n$2); // d mod (q-1)
  const dp = mod(d, p - _1n$2); // d mod (p-1)

  const unblinder = getRandomBigInteger(BigInt(2), n);
  const blinder = modExp(modInv(unblinder, n), e, n);
  data = mod(data * blinder, n);

  const mp = modExp(data, dp, p); // data**{d mod (q-1)} mod p
  const mq = modExp(data, dq, q); // data**{d mod (p-1)} mod q
  const h = mod(u * (mq - mp), q); // u * (mq-mp) mod q (operands already < q)

  let result = h * p + mp; // result < n due to relations above

  result = mod(result * unblinder, n);

  return emeDecode(bigIntToUint8Array(result, 'be', byteLength(n)), randomPayload);
}

/** Convert Openpgp private key params to jwk key according to
 * @link https://tools.ietf.org/html/rfc7517
 * @param {String} hashAlgo
 * @param {Uint8Array} n
 * @param {Uint8Array} e
 * @param {Uint8Array} d
 * @param {Uint8Array} p
 * @param {Uint8Array} q
 * @param {Uint8Array} u
 */
async function privateToJWK$1(n, e, d, p, q, u) {
  const pNum = uint8ArrayToBigInt(p);
  const qNum = uint8ArrayToBigInt(q);
  const dNum = uint8ArrayToBigInt(d);

  let dq = mod(dNum, qNum - _1n$2); // d mod (q-1)
  let dp = mod(dNum, pNum - _1n$2); // d mod (p-1)
  dp = bigIntToUint8Array(dp);
  dq = bigIntToUint8Array(dq);
  return {
    kty: 'RSA',
    n: uint8ArrayToB64(n),
    e: uint8ArrayToB64(e),
    d: uint8ArrayToB64(d),
    // switch p and q
    p: uint8ArrayToB64(q),
    q: uint8ArrayToB64(p),
    // switch dp and dq
    dp: uint8ArrayToB64(dq),
    dq: uint8ArrayToB64(dp),
    qi: uint8ArrayToB64(u),
    ext: true
  };
}

/** Convert Openpgp key public params to jwk key according to
 * @link https://tools.ietf.org/html/rfc7517
 * @param {String} hashAlgo
 * @param {Uint8Array} n
 * @param {Uint8Array} e
 */
function publicToJWK(n, e) {
  return {
    kty: 'RSA',
    n: uint8ArrayToB64(n),
    e: uint8ArrayToB64(e),
    ext: true
  };
}

/** Convert JWK private key to OpenPGP private key params */
function jwkToPrivate(jwk, e) {
  return {
    n: b64ToUint8Array(jwk.n),
    e: bigIntToUint8Array(e),
    d: b64ToUint8Array(jwk.d),
    // switch p and q
    p: b64ToUint8Array(jwk.q),
    q: b64ToUint8Array(jwk.p),
    // Since p and q are switched in places, u is the inverse of jwk.q
    u: b64ToUint8Array(jwk.qi)
  };
}

// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


const _1n$1 = BigInt(1);

/**
 * ElGamal Encryption function
 * Note that in OpenPGP, the message needs to be padded with PKCS#1 (same as RSA)
 * @param {Uint8Array} data - To be padded and encrypted
 * @param {Uint8Array} p
 * @param {Uint8Array} g
 * @param {Uint8Array} y
 * @returns {Promise<{ c1: Uint8Array, c2: Uint8Array }>}
 * @async
 */
async function encrypt$5(data, p, g, y) {
  p = uint8ArrayToBigInt(p);
  g = uint8ArrayToBigInt(g);
  y = uint8ArrayToBigInt(y);

  const padded = emeEncode(data, byteLength(p));
  const m = uint8ArrayToBigInt(padded);

  // OpenPGP uses a "special" version of ElGamal where g is generator of the full group Z/pZ*
  // hence g has order p-1, and to avoid that k = 0 mod p-1, we need to pick k in [1, p-2]
  const k = getRandomBigInteger(_1n$1, p - _1n$1);
  return {
    c1: bigIntToUint8Array(modExp(g, k, p)),
    c2: bigIntToUint8Array(mod(modExp(y, k, p) * m, p))
  };
}

/**
 * ElGamal Encryption function
 * @param {Uint8Array} c1
 * @param {Uint8Array} c2
 * @param {Uint8Array} p
 * @param {Uint8Array} x
 * @param {Uint8Array} randomPayload - Data to return on unpadding error, instead of throwing
 *                                     (needed for constant-time processing)
 * @returns {Promise<Uint8Array>} Unpadded message.
 * @throws {Error} on decryption error, unless `randomPayload` is given
 * @async
 */
async function decrypt$5(c1, c2, p, x, randomPayload) {
  c1 = uint8ArrayToBigInt(c1);
  c2 = uint8ArrayToBigInt(c2);
  p = uint8ArrayToBigInt(p);
  x = uint8ArrayToBigInt(x);

  const padded = mod(modInv(modExp(c1, x, p), p) * c2, p);
  return emeDecode(bigIntToUint8Array(padded, 'be', byteLength(p)), randomPayload);
}

/**
 * Validate ElGamal parameters
 * @param {Uint8Array} p - ElGamal prime
 * @param {Uint8Array} g - ElGamal group generator
 * @param {Uint8Array} y - ElGamal public key
 * @param {Uint8Array} x - ElGamal private exponent
 * @returns {Promise<Boolean>} Whether params are valid.
 * @async
 */
async function validateParams$7(p, g, y, x) {
  p = uint8ArrayToBigInt(p);
  g = uint8ArrayToBigInt(g);
  y = uint8ArrayToBigInt(y);

  // Check that 1 < g < p
  if (g <= _1n$1 || g >= p) {
    return false;
  }

  // Expect p-1 to be large
  const pSize = BigInt(bitLength(p));
  const _1023n = BigInt(1023);
  if (pSize < _1023n) {
    return false;
  }

  /**
   * g should have order p-1
   * Check that g ** (p-1) = 1 mod p
   */
  if (modExp(g, p - _1n$1, p) !== _1n$1) {
    return false;
  }

  /**
   * Since p-1 is not prime, g might have a smaller order that divides p-1
   * We want to make sure that the order is large enough to hinder a small subgroup attack
   *
   * We just check g**i != 1 for all i up to a threshold
   */
  let res = g;
  let i = BigInt(1);
  const _2n = BigInt(2);
  const threshold = _2n << BigInt(17); // we want order > threshold
  while (i < threshold) {
    res = mod(res * g, p);
    if (res === _1n$1) {
      return false;
    }
    i++;
  }

  /**
   * Re-derive public key y' = g ** x mod p
   * Expect y == y'
   *
   * Blinded exponentiation computes g**{r(p-1) + x} to compare to y
   */
  x = uint8ArrayToBigInt(x);
  const r = getRandomBigInteger(_2n << (pSize - _1n$1), _2n << pSize); // draw r of same size as p-1
  const rqx = (p - _1n$1) * r + x;
  if (y !== modExp(g, rqx, p)) {
    return false;
  }

  return true;
}

// declare const globalThis: Record<string, any> | undefined;
const crypto$1 =
  typeof globalThis === 'object' && 'crypto' in globalThis ? globalThis.crypto : undefined;

const nacl = {};

// Ported in 2014 by Dmitry Chestnykh and Devi Mandiri.
// Public domain.
//
// Implementation derived from TweetNaCl version 20140427.
// See for details: http://tweetnacl.cr.yp.to/

var gf = function(init) {
  var i, r = new Float64Array(16);
  if (init) for (i = 0; i < init.length; i++) r[i] = init[i];
  return r;
};

//  Pluggable, initialized in high-level API below.
var randombytes = function(/* x, n */) { throw new Error('no PRNG'); };

var _9 = new Uint8Array(32); _9[0] = 9;

var gf0 = gf(),
    gf1 = gf([1]),
    _121665 = gf([0xdb41, 1]),
    D = gf([0x78a3, 0x1359, 0x4dca, 0x75eb, 0xd8ab, 0x4141, 0x0a4d, 0x0070, 0xe898, 0x7779, 0x4079, 0x8cc7, 0xfe73, 0x2b6f, 0x6cee, 0x5203]),
    D2 = gf([0xf159, 0x26b2, 0x9b94, 0xebd6, 0xb156, 0x8283, 0x149a, 0x00e0, 0xd130, 0xeef3, 0x80f2, 0x198e, 0xfce7, 0x56df, 0xd9dc, 0x2406]),
    X = gf([0xd51a, 0x8f25, 0x2d60, 0xc956, 0xa7b2, 0x9525, 0xc760, 0x692c, 0xdc5c, 0xfdd6, 0xe231, 0xc0a4, 0x53fe, 0xcd6e, 0x36d3, 0x2169]),
    Y = gf([0x6658, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666]),
    I = gf([0xa0b0, 0x4a0e, 0x1b27, 0xc4ee, 0xe478, 0xad2f, 0x1806, 0x2f43, 0xd7a7, 0x3dfb, 0x0099, 0x2b4d, 0xdf0b, 0x4fc1, 0x2480, 0x2b83]);

function ts64(x, i, h, l) {
  x[i]   = (h >> 24) & 0xff;
  x[i+1] = (h >> 16) & 0xff;
  x[i+2] = (h >>  8) & 0xff;
  x[i+3] = h & 0xff;
  x[i+4] = (l >> 24)  & 0xff;
  x[i+5] = (l >> 16)  & 0xff;
  x[i+6] = (l >>  8)  & 0xff;
  x[i+7] = l & 0xff;
}

function vn(x, xi, y, yi, n) {
  var i,d = 0;
  for (i = 0; i < n; i++) d |= x[xi+i]^y[yi+i];
  return (1 & ((d - 1) >>> 8)) - 1;
}

function crypto_verify_32(x, xi, y, yi) {
  return vn(x,xi,y,yi,32);
}

function set25519(r, a) {
  var i;
  for (i = 0; i < 16; i++) r[i] = a[i]|0;
}

function car25519(o) {
  var i, v, c = 1;
  for (i = 0; i < 16; i++) {
    v = o[i] + c + 65535;
    c = Math.floor(v / 65536);
    o[i] = v - c * 65536;
  }
  o[0] += c-1 + 37 * (c-1);
}

function sel25519(p, q, b) {
  var t, c = ~(b-1);
  for (var i = 0; i < 16; i++) {
    t = c & (p[i] ^ q[i]);
    p[i] ^= t;
    q[i] ^= t;
  }
}

function pack25519(o, n) {
  var i, j, b;
  var m = gf(), t = gf();
  for (i = 0; i < 16; i++) t[i] = n[i];
  car25519(t);
  car25519(t);
  car25519(t);
  for (j = 0; j < 2; j++) {
    m[0] = t[0] - 0xffed;
    for (i = 1; i < 15; i++) {
      m[i] = t[i] - 0xffff - ((m[i-1]>>16) & 1);
      m[i-1] &= 0xffff;
    }
    m[15] = t[15] - 0x7fff - ((m[14]>>16) & 1);
    b = (m[15]>>16) & 1;
    m[14] &= 0xffff;
    sel25519(t, m, 1-b);
  }
  for (i = 0; i < 16; i++) {
    o[2*i] = t[i] & 0xff;
    o[2*i+1] = t[i]>>8;
  }
}

function neq25519(a, b) {
  var c = new Uint8Array(32), d = new Uint8Array(32);
  pack25519(c, a);
  pack25519(d, b);
  return crypto_verify_32(c, 0, d, 0);
}

function par25519(a) {
  var d = new Uint8Array(32);
  pack25519(d, a);
  return d[0] & 1;
}

function unpack25519(o, n) {
  var i;
  for (i = 0; i < 16; i++) o[i] = n[2*i] + (n[2*i+1] << 8);
  o[15] &= 0x7fff;
}

function A(o, a, b) {
  for (var i = 0; i < 16; i++) o[i] = a[i] + b[i];
}

function Z(o, a, b) {
  for (var i = 0; i < 16; i++) o[i] = a[i] - b[i];
}

function M(o, a, b) {
  var v, c,
     t0 = 0,  t1 = 0,  t2 = 0,  t3 = 0,  t4 = 0,  t5 = 0,  t6 = 0,  t7 = 0,
     t8 = 0,  t9 = 0, t10 = 0, t11 = 0, t12 = 0, t13 = 0, t14 = 0, t15 = 0,
    t16 = 0, t17 = 0, t18 = 0, t19 = 0, t20 = 0, t21 = 0, t22 = 0, t23 = 0,
    t24 = 0, t25 = 0, t26 = 0, t27 = 0, t28 = 0, t29 = 0, t30 = 0,
    b0 = b[0],
    b1 = b[1],
    b2 = b[2],
    b3 = b[3],
    b4 = b[4],
    b5 = b[5],
    b6 = b[6],
    b7 = b[7],
    b8 = b[8],
    b9 = b[9],
    b10 = b[10],
    b11 = b[11],
    b12 = b[12],
    b13 = b[13],
    b14 = b[14],
    b15 = b[15];

  v = a[0];
  t0 += v * b0;
  t1 += v * b1;
  t2 += v * b2;
  t3 += v * b3;
  t4 += v * b4;
  t5 += v * b5;
  t6 += v * b6;
  t7 += v * b7;
  t8 += v * b8;
  t9 += v * b9;
  t10 += v * b10;
  t11 += v * b11;
  t12 += v * b12;
  t13 += v * b13;
  t14 += v * b14;
  t15 += v * b15;
  v = a[1];
  t1 += v * b0;
  t2 += v * b1;
  t3 += v * b2;
  t4 += v * b3;
  t5 += v * b4;
  t6 += v * b5;
  t7 += v * b6;
  t8 += v * b7;
  t9 += v * b8;
  t10 += v * b9;
  t11 += v * b10;
  t12 += v * b11;
  t13 += v * b12;
  t14 += v * b13;
  t15 += v * b14;
  t16 += v * b15;
  v = a[2];
  t2 += v * b0;
  t3 += v * b1;
  t4 += v * b2;
  t5 += v * b3;
  t6 += v * b4;
  t7 += v * b5;
  t8 += v * b6;
  t9 += v * b7;
  t10 += v * b8;
  t11 += v * b9;
  t12 += v * b10;
  t13 += v * b11;
  t14 += v * b12;
  t15 += v * b13;
  t16 += v * b14;
  t17 += v * b15;
  v = a[3];
  t3 += v * b0;
  t4 += v * b1;
  t5 += v * b2;
  t6 += v * b3;
  t7 += v * b4;
  t8 += v * b5;
  t9 += v * b6;
  t10 += v * b7;
  t11 += v * b8;
  t12 += v * b9;
  t13 += v * b10;
  t14 += v * b11;
  t15 += v * b12;
  t16 += v * b13;
  t17 += v * b14;
  t18 += v * b15;
  v = a[4];
  t4 += v * b0;
  t5 += v * b1;
  t6 += v * b2;
  t7 += v * b3;
  t8 += v * b4;
  t9 += v * b5;
  t10 += v * b6;
  t11 += v * b7;
  t12 += v * b8;
  t13 += v * b9;
  t14 += v * b10;
  t15 += v * b11;
  t16 += v * b12;
  t17 += v * b13;
  t18 += v * b14;
  t19 += v * b15;
  v = a[5];
  t5 += v * b0;
  t6 += v * b1;
  t7 += v * b2;
  t8 += v * b3;
  t9 += v * b4;
  t10 += v * b5;
  t11 += v * b6;
  t12 += v * b7;
  t13 += v * b8;
  t14 += v * b9;
  t15 += v * b10;
  t16 += v * b11;
  t17 += v * b12;
  t18 += v * b13;
  t19 += v * b14;
  t20 += v * b15;
  v = a[6];
  t6 += v * b0;
  t7 += v * b1;
  t8 += v * b2;
  t9 += v * b3;
  t10 += v * b4;
  t11 += v * b5;
  t12 += v * b6;
  t13 += v * b7;
  t14 += v * b8;
  t15 += v * b9;
  t16 += v * b10;
  t17 += v * b11;
  t18 += v * b12;
  t19 += v * b13;
  t20 += v * b14;
  t21 += v * b15;
  v = a[7];
  t7 += v * b0;
  t8 += v * b1;
  t9 += v * b2;
  t10 += v * b3;
  t11 += v * b4;
  t12 += v * b5;
  t13 += v * b6;
  t14 += v * b7;
  t15 += v * b8;
  t16 += v * b9;
  t17 += v * b10;
  t18 += v * b11;
  t19 += v * b12;
  t20 += v * b13;
  t21 += v * b14;
  t22 += v * b15;
  v = a[8];
  t8 += v * b0;
  t9 += v * b1;
  t10 += v * b2;
  t11 += v * b3;
  t12 += v * b4;
  t13 += v * b5;
  t14 += v * b6;
  t15 += v * b7;
  t16 += v * b8;
  t17 += v * b9;
  t18 += v * b10;
  t19 += v * b11;
  t20 += v * b12;
  t21 += v * b13;
  t22 += v * b14;
  t23 += v * b15;
  v = a[9];
  t9 += v * b0;
  t10 += v * b1;
  t11 += v * b2;
  t12 += v * b3;
  t13 += v * b4;
  t14 += v * b5;
  t15 += v * b6;
  t16 += v * b7;
  t17 += v * b8;
  t18 += v * b9;
  t19 += v * b10;
  t20 += v * b11;
  t21 += v * b12;
  t22 += v * b13;
  t23 += v * b14;
  t24 += v * b15;
  v = a[10];
  t10 += v * b0;
  t11 += v * b1;
  t12 += v * b2;
  t13 += v * b3;
  t14 += v * b4;
  t15 += v * b5;
  t16 += v * b6;
  t17 += v * b7;
  t18 += v * b8;
  t19 += v * b9;
  t20 += v * b10;
  t21 += v * b11;
  t22 += v * b12;
  t23 += v * b13;
  t24 += v * b14;
  t25 += v * b15;
  v = a[11];
  t11 += v * b0;
  t12 += v * b1;
  t13 += v * b2;
  t14 += v * b3;
  t15 += v * b4;
  t16 += v * b5;
  t17 += v * b6;
  t18 += v * b7;
  t19 += v * b8;
  t20 += v * b9;
  t21 += v * b10;
  t22 += v * b11;
  t23 += v * b12;
  t24 += v * b13;
  t25 += v * b14;
  t26 += v * b15;
  v = a[12];
  t12 += v * b0;
  t13 += v * b1;
  t14 += v * b2;
  t15 += v * b3;
  t16 += v * b4;
  t17 += v * b5;
  t18 += v * b6;
  t19 += v * b7;
  t20 += v * b8;
  t21 += v * b9;
  t22 += v * b10;
  t23 += v * b11;
  t24 += v * b12;
  t25 += v * b13;
  t26 += v * b14;
  t27 += v * b15;
  v = a[13];
  t13 += v * b0;
  t14 += v * b1;
  t15 += v * b2;
  t16 += v * b3;
  t17 += v * b4;
  t18 += v * b5;
  t19 += v * b6;
  t20 += v * b7;
  t21 += v * b8;
  t22 += v * b9;
  t23 += v * b10;
  t24 += v * b11;
  t25 += v * b12;
  t26 += v * b13;
  t27 += v * b14;
  t28 += v * b15;
  v = a[14];
  t14 += v * b0;
  t15 += v * b1;
  t16 += v * b2;
  t17 += v * b3;
  t18 += v * b4;
  t19 += v * b5;
  t20 += v * b6;
  t21 += v * b7;
  t22 += v * b8;
  t23 += v * b9;
  t24 += v * b10;
  t25 += v * b11;
  t26 += v * b12;
  t27 += v * b13;
  t28 += v * b14;
  t29 += v * b15;
  v = a[15];
  t15 += v * b0;
  t16 += v * b1;
  t17 += v * b2;
  t18 += v * b3;
  t19 += v * b4;
  t20 += v * b5;
  t21 += v * b6;
  t22 += v * b7;
  t23 += v * b8;
  t24 += v * b9;
  t25 += v * b10;
  t26 += v * b11;
  t27 += v * b12;
  t28 += v * b13;
  t29 += v * b14;
  t30 += v * b15;

  t0  += 38 * t16;
  t1  += 38 * t17;
  t2  += 38 * t18;
  t3  += 38 * t19;
  t4  += 38 * t20;
  t5  += 38 * t21;
  t6  += 38 * t22;
  t7  += 38 * t23;
  t8  += 38 * t24;
  t9  += 38 * t25;
  t10 += 38 * t26;
  t11 += 38 * t27;
  t12 += 38 * t28;
  t13 += 38 * t29;
  t14 += 38 * t30;
  // t15 left as is

  // first car
  c = 1;
  v =  t0 + c + 65535; c = Math.floor(v / 65536);  t0 = v - c * 65536;
  v =  t1 + c + 65535; c = Math.floor(v / 65536);  t1 = v - c * 65536;
  v =  t2 + c + 65535; c = Math.floor(v / 65536);  t2 = v - c * 65536;
  v =  t3 + c + 65535; c = Math.floor(v / 65536);  t3 = v - c * 65536;
  v =  t4 + c + 65535; c = Math.floor(v / 65536);  t4 = v - c * 65536;
  v =  t5 + c + 65535; c = Math.floor(v / 65536);  t5 = v - c * 65536;
  v =  t6 + c + 65535; c = Math.floor(v / 65536);  t6 = v - c * 65536;
  v =  t7 + c + 65535; c = Math.floor(v / 65536);  t7 = v - c * 65536;
  v =  t8 + c + 65535; c = Math.floor(v / 65536);  t8 = v - c * 65536;
  v =  t9 + c + 65535; c = Math.floor(v / 65536);  t9 = v - c * 65536;
  v = t10 + c + 65535; c = Math.floor(v / 65536); t10 = v - c * 65536;
  v = t11 + c + 65535; c = Math.floor(v / 65536); t11 = v - c * 65536;
  v = t12 + c + 65535; c = Math.floor(v / 65536); t12 = v - c * 65536;
  v = t13 + c + 65535; c = Math.floor(v / 65536); t13 = v - c * 65536;
  v = t14 + c + 65535; c = Math.floor(v / 65536); t14 = v - c * 65536;
  v = t15 + c + 65535; c = Math.floor(v / 65536); t15 = v - c * 65536;
  t0 += c-1 + 37 * (c-1);

  // second car
  c = 1;
  v =  t0 + c + 65535; c = Math.floor(v / 65536);  t0 = v - c * 65536;
  v =  t1 + c + 65535; c = Math.floor(v / 65536);  t1 = v - c * 65536;
  v =  t2 + c + 65535; c = Math.floor(v / 65536);  t2 = v - c * 65536;
  v =  t3 + c + 65535; c = Math.floor(v / 65536);  t3 = v - c * 65536;
  v =  t4 + c + 65535; c = Math.floor(v / 65536);  t4 = v - c * 65536;
  v =  t5 + c + 65535; c = Math.floor(v / 65536);  t5 = v - c * 65536;
  v =  t6 + c + 65535; c = Math.floor(v / 65536);  t6 = v - c * 65536;
  v =  t7 + c + 65535; c = Math.floor(v / 65536);  t7 = v - c * 65536;
  v =  t8 + c + 65535; c = Math.floor(v / 65536);  t8 = v - c * 65536;
  v =  t9 + c + 65535; c = Math.floor(v / 65536);  t9 = v - c * 65536;
  v = t10 + c + 65535; c = Math.floor(v / 65536); t10 = v - c * 65536;
  v = t11 + c + 65535; c = Math.floor(v / 65536); t11 = v - c * 65536;
  v = t12 + c + 65535; c = Math.floor(v / 65536); t12 = v - c * 65536;
  v = t13 + c + 65535; c = Math.floor(v / 65536); t13 = v - c * 65536;
  v = t14 + c + 65535; c = Math.floor(v / 65536); t14 = v - c * 65536;
  v = t15 + c + 65535; c = Math.floor(v / 65536); t15 = v - c * 65536;
  t0 += c-1 + 37 * (c-1);

  o[ 0] = t0;
  o[ 1] = t1;
  o[ 2] = t2;
  o[ 3] = t3;
  o[ 4] = t4;
  o[ 5] = t5;
  o[ 6] = t6;
  o[ 7] = t7;
  o[ 8] = t8;
  o[ 9] = t9;
  o[10] = t10;
  o[11] = t11;
  o[12] = t12;
  o[13] = t13;
  o[14] = t14;
  o[15] = t15;
}

function S(o, a) {
  M(o, a, a);
}

function inv25519(o, i) {
  var c = gf();
  var a;
  for (a = 0; a < 16; a++) c[a] = i[a];
  for (a = 253; a >= 0; a--) {
    S(c, c);
    if(a !== 2 && a !== 4) M(c, c, i);
  }
  for (a = 0; a < 16; a++) o[a] = c[a];
}

function pow2523(o, i) {
  var c = gf();
  var a;
  for (a = 0; a < 16; a++) c[a] = i[a];
  for (a = 250; a >= 0; a--) {
      S(c, c);
      if(a !== 1) M(c, c, i);
  }
  for (a = 0; a < 16; a++) o[a] = c[a];
}

function crypto_scalarmult(q, n, p) {
  var z = new Uint8Array(32);
  var x = new Float64Array(80), r, i;
  var a = gf(), b = gf(), c = gf(),
      d = gf(), e = gf(), f = gf();
  for (i = 0; i < 31; i++) z[i] = n[i];
  z[31]=(n[31]&127)|64;
  z[0]&=248;
  unpack25519(x,p);
  for (i = 0; i < 16; i++) {
    b[i]=x[i];
    d[i]=a[i]=c[i]=0;
  }
  a[0]=d[0]=1;
  for (i=254; i>=0; --i) {
    r=(z[i>>>3]>>>(i&7))&1;
    sel25519(a,b,r);
    sel25519(c,d,r);
    A(e,a,c);
    Z(a,a,c);
    A(c,b,d);
    Z(b,b,d);
    S(d,e);
    S(f,a);
    M(a,c,a);
    M(c,b,e);
    A(e,a,c);
    Z(a,a,c);
    S(b,a);
    Z(c,d,f);
    M(a,c,_121665);
    A(a,a,d);
    M(c,c,a);
    M(a,d,f);
    M(d,b,x);
    S(b,e);
    sel25519(a,b,r);
    sel25519(c,d,r);
  }
  for (i = 0; i < 16; i++) {
    x[i+16]=a[i];
    x[i+32]=c[i];
    x[i+48]=b[i];
    x[i+64]=d[i];
  }
  var x32 = x.subarray(32);
  var x16 = x.subarray(16);
  inv25519(x32,x32);
  M(x16,x16,x32);
  pack25519(q,x16);
  return 0;
}

function crypto_scalarmult_base(q, n) {
  return crypto_scalarmult(q, n, _9);
}

function crypto_box_keypair(y, x) {
  randombytes(x, 32);
  return crypto_scalarmult_base(y, x);
}

var K = [
  0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
  0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
  0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
  0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
  0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
  0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
  0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
  0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
  0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
  0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
  0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
  0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
  0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
  0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
  0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
  0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
  0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
  0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
  0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
  0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
  0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
  0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
  0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
  0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
  0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
  0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
  0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
  0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
  0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
  0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
  0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
  0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
  0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
  0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
  0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
  0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
  0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
  0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
  0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
  0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
];

function crypto_hashblocks_hl(hh, hl, m, n) {
  var wh = new Int32Array(16), wl = new Int32Array(16),
      bh0, bh1, bh2, bh3, bh4, bh5, bh6, bh7,
      bl0, bl1, bl2, bl3, bl4, bl5, bl6, bl7,
      th, tl, i, j, h, l, a, b, c, d;

  var ah0 = hh[0],
      ah1 = hh[1],
      ah2 = hh[2],
      ah3 = hh[3],
      ah4 = hh[4],
      ah5 = hh[5],
      ah6 = hh[6],
      ah7 = hh[7],

      al0 = hl[0],
      al1 = hl[1],
      al2 = hl[2],
      al3 = hl[3],
      al4 = hl[4],
      al5 = hl[5],
      al6 = hl[6],
      al7 = hl[7];

  var pos = 0;
  while (n >= 128) {
    for (i = 0; i < 16; i++) {
      j = 8 * i + pos;
      wh[i] = (m[j+0] << 24) | (m[j+1] << 16) | (m[j+2] << 8) | m[j+3];
      wl[i] = (m[j+4] << 24) | (m[j+5] << 16) | (m[j+6] << 8) | m[j+7];
    }
    for (i = 0; i < 80; i++) {
      bh0 = ah0;
      bh1 = ah1;
      bh2 = ah2;
      bh3 = ah3;
      bh4 = ah4;
      bh5 = ah5;
      bh6 = ah6;
      bh7 = ah7;

      bl0 = al0;
      bl1 = al1;
      bl2 = al2;
      bl3 = al3;
      bl4 = al4;
      bl5 = al5;
      bl6 = al6;
      bl7 = al7;

      // add
      h = ah7;
      l = al7;

      a = l & 0xffff; b = l >>> 16;
      c = h & 0xffff; d = h >>> 16;

      // Sigma1
      h = ((ah4 >>> 14) | (al4 << (32-14))) ^ ((ah4 >>> 18) | (al4 << (32-18))) ^ ((al4 >>> (41-32)) | (ah4 << (32-(41-32))));
      l = ((al4 >>> 14) | (ah4 << (32-14))) ^ ((al4 >>> 18) | (ah4 << (32-18))) ^ ((ah4 >>> (41-32)) | (al4 << (32-(41-32))));

      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;

      // Ch
      h = (ah4 & ah5) ^ (~ah4 & ah6);
      l = (al4 & al5) ^ (~al4 & al6);

      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;

      // K
      h = K[i*2];
      l = K[i*2+1];

      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;

      // w
      h = wh[i%16];
      l = wl[i%16];

      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;

      b += a >>> 16;
      c += b >>> 16;
      d += c >>> 16;

      th = c & 0xffff | d << 16;
      tl = a & 0xffff | b << 16;

      // add
      h = th;
      l = tl;

      a = l & 0xffff; b = l >>> 16;
      c = h & 0xffff; d = h >>> 16;

      // Sigma0
      h = ((ah0 >>> 28) | (al0 << (32-28))) ^ ((al0 >>> (34-32)) | (ah0 << (32-(34-32)))) ^ ((al0 >>> (39-32)) | (ah0 << (32-(39-32))));
      l = ((al0 >>> 28) | (ah0 << (32-28))) ^ ((ah0 >>> (34-32)) | (al0 << (32-(34-32)))) ^ ((ah0 >>> (39-32)) | (al0 << (32-(39-32))));

      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;

      // Maj
      h = (ah0 & ah1) ^ (ah0 & ah2) ^ (ah1 & ah2);
      l = (al0 & al1) ^ (al0 & al2) ^ (al1 & al2);

      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;

      b += a >>> 16;
      c += b >>> 16;
      d += c >>> 16;

      bh7 = (c & 0xffff) | (d << 16);
      bl7 = (a & 0xffff) | (b << 16);

      // add
      h = bh3;
      l = bl3;

      a = l & 0xffff; b = l >>> 16;
      c = h & 0xffff; d = h >>> 16;

      h = th;
      l = tl;

      a += l & 0xffff; b += l >>> 16;
      c += h & 0xffff; d += h >>> 16;

      b += a >>> 16;
      c += b >>> 16;
      d += c >>> 16;

      bh3 = (c & 0xffff) | (d << 16);
      bl3 = (a & 0xffff) | (b << 16);

      ah1 = bh0;
      ah2 = bh1;
      ah3 = bh2;
      ah4 = bh3;
      ah5 = bh4;
      ah6 = bh5;
      ah7 = bh6;
      ah0 = bh7;

      al1 = bl0;
      al2 = bl1;
      al3 = bl2;
      al4 = bl3;
      al5 = bl4;
      al6 = bl5;
      al7 = bl6;
      al0 = bl7;

      if (i%16 === 15) {
        for (j = 0; j < 16; j++) {
          // add
          h = wh[j];
          l = wl[j];

          a = l & 0xffff; b = l >>> 16;
          c = h & 0xffff; d = h >>> 16;

          h = wh[(j+9)%16];
          l = wl[(j+9)%16];

          a += l & 0xffff; b += l >>> 16;
          c += h & 0xffff; d += h >>> 16;

          // sigma0
          th = wh[(j+1)%16];
          tl = wl[(j+1)%16];
          h = ((th >>> 1) | (tl << (32-1))) ^ ((th >>> 8) | (tl << (32-8))) ^ (th >>> 7);
          l = ((tl >>> 1) | (th << (32-1))) ^ ((tl >>> 8) | (th << (32-8))) ^ ((tl >>> 7) | (th << (32-7)));

          a += l & 0xffff; b += l >>> 16;
          c += h & 0xffff; d += h >>> 16;

          // sigma1
          th = wh[(j+14)%16];
          tl = wl[(j+14)%16];
          h = ((th >>> 19) | (tl << (32-19))) ^ ((tl >>> (61-32)) | (th << (32-(61-32)))) ^ (th >>> 6);
          l = ((tl >>> 19) | (th << (32-19))) ^ ((th >>> (61-32)) | (tl << (32-(61-32)))) ^ ((tl >>> 6) | (th << (32-6)));

          a += l & 0xffff; b += l >>> 16;
          c += h & 0xffff; d += h >>> 16;

          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;

          wh[j] = (c & 0xffff) | (d << 16);
          wl[j] = (a & 0xffff) | (b << 16);
        }
      }
    }

    // add
    h = ah0;
    l = al0;

    a = l & 0xffff; b = l >>> 16;
    c = h & 0xffff; d = h >>> 16;

    h = hh[0];
    l = hl[0];

    a += l & 0xffff; b += l >>> 16;
    c += h & 0xffff; d += h >>> 16;

    b += a >>> 16;
    c += b >>> 16;
    d += c >>> 16;

    hh[0] = ah0 = (c & 0xffff) | (d << 16);
    hl[0] = al0 = (a & 0xffff) | (b << 16);

    h = ah1;
    l = al1;

    a = l & 0xffff; b = l >>> 16;
    c = h & 0xffff; d = h >>> 16;

    h = hh[1];
    l = hl[1];

    a += l & 0xffff; b += l >>> 16;
    c += h & 0xffff; d += h >>> 16;

    b += a >>> 16;
    c += b >>> 16;
    d += c >>> 16;

    hh[1] = ah1 = (c & 0xffff) | (d << 16);
    hl[1] = al1 = (a & 0xffff) | (b << 16);

    h = ah2;
    l = al2;

    a = l & 0xffff; b = l >>> 16;
    c = h & 0xffff; d = h >>> 16;

    h = hh[2];
    l = hl[2];

    a += l & 0xffff; b += l >>> 16;
    c += h & 0xffff; d += h >>> 16;

    b += a >>> 16;
    c += b >>> 16;
    d += c >>> 16;

    hh[2] = ah2 = (c & 0xffff) | (d << 16);
    hl[2] = al2 = (a & 0xffff) | (b << 16);

    h = ah3;
    l = al3;

    a = l & 0xffff; b = l >>> 16;
    c = h & 0xffff; d = h >>> 16;

    h = hh[3];
    l = hl[3];

    a += l & 0xffff; b += l >>> 16;
    c += h & 0xffff; d += h >>> 16;

    b += a >>> 16;
    c += b >>> 16;
    d += c >>> 16;

    hh[3] = ah3 = (c & 0xffff) | (d << 16);
    hl[3] = al3 = (a & 0xffff) | (b << 16);

    h = ah4;
    l = al4;

    a = l & 0xffff; b = l >>> 16;
    c = h & 0xffff; d = h >>> 16;

    h = hh[4];
    l = hl[4];

    a += l & 0xffff; b += l >>> 16;
    c += h & 0xffff; d += h >>> 16;

    b += a >>> 16;
    c += b >>> 16;
    d += c >>> 16;

    hh[4] = ah4 = (c & 0xffff) | (d << 16);
    hl[4] = al4 = (a & 0xffff) | (b << 16);

    h = ah5;
    l = al5;

    a = l & 0xffff; b = l >>> 16;
    c = h & 0xffff; d = h >>> 16;

    h = hh[5];
    l = hl[5];

    a += l & 0xffff; b += l >>> 16;
    c += h & 0xffff; d += h >>> 16;

    b += a >>> 16;
    c += b >>> 16;
    d += c >>> 16;

    hh[5] = ah5 = (c & 0xffff) | (d << 16);
    hl[5] = al5 = (a & 0xffff) | (b << 16);

    h = ah6;
    l = al6;

    a = l & 0xffff; b = l >>> 16;
    c = h & 0xffff; d = h >>> 16;

    h = hh[6];
    l = hl[6];

    a += l & 0xffff; b += l >>> 16;
    c += h & 0xffff; d += h >>> 16;

    b += a >>> 16;
    c += b >>> 16;
    d += c >>> 16;

    hh[6] = ah6 = (c & 0xffff) | (d << 16);
    hl[6] = al6 = (a & 0xffff) | (b << 16);

    h = ah7;
    l = al7;

    a = l & 0xffff; b = l >>> 16;
    c = h & 0xffff; d = h >>> 16;

    h = hh[7];
    l = hl[7];

    a += l & 0xffff; b += l >>> 16;
    c += h & 0xffff; d += h >>> 16;

    b += a >>> 16;
    c += b >>> 16;
    d += c >>> 16;

    hh[7] = ah7 = (c & 0xffff) | (d << 16);
    hl[7] = al7 = (a & 0xffff) | (b << 16);

    pos += 128;
    n -= 128;
  }

  return n;
}

function crypto_hash(out, m, n) {
  var hh = new Int32Array(8),
      hl = new Int32Array(8),
      x = new Uint8Array(256),
      i, b = n;

  hh[0] = 0x6a09e667;
  hh[1] = 0xbb67ae85;
  hh[2] = 0x3c6ef372;
  hh[3] = 0xa54ff53a;
  hh[4] = 0x510e527f;
  hh[5] = 0x9b05688c;
  hh[6] = 0x1f83d9ab;
  hh[7] = 0x5be0cd19;

  hl[0] = 0xf3bcc908;
  hl[1] = 0x84caa73b;
  hl[2] = 0xfe94f82b;
  hl[3] = 0x5f1d36f1;
  hl[4] = 0xade682d1;
  hl[5] = 0x2b3e6c1f;
  hl[6] = 0xfb41bd6b;
  hl[7] = 0x137e2179;

  crypto_hashblocks_hl(hh, hl, m, n);
  n %= 128;

  for (i = 0; i < n; i++) x[i] = m[b-n+i];
  x[n] = 128;

  n = 256-128*(n<112?1:0);
  x[n-9] = 0;
  ts64(x, n-8,  (b / 0x20000000) | 0, b << 3);
  crypto_hashblocks_hl(hh, hl, x, n);

  for (i = 0; i < 8; i++) ts64(out, 8*i, hh[i], hl[i]);

  return 0;
}

function add(p, q) {
  var a = gf(), b = gf(), c = gf(),
      d = gf(), e = gf(), f = gf(),
      g = gf(), h = gf(), t = gf();

  Z(a, p[1], p[0]);
  Z(t, q[1], q[0]);
  M(a, a, t);
  A(b, p[0], p[1]);
  A(t, q[0], q[1]);
  M(b, b, t);
  M(c, p[3], q[3]);
  M(c, c, D2);
  M(d, p[2], q[2]);
  A(d, d, d);
  Z(e, b, a);
  Z(f, d, c);
  A(g, d, c);
  A(h, b, a);

  M(p[0], e, f);
  M(p[1], h, g);
  M(p[2], g, f);
  M(p[3], e, h);
}

function cswap(p, q, b) {
  var i;
  for (i = 0; i < 4; i++) {
    sel25519(p[i], q[i], b);
  }
}

function pack(r, p) {
  var tx = gf(), ty = gf(), zi = gf();
  inv25519(zi, p[2]);
  M(tx, p[0], zi);
  M(ty, p[1], zi);
  pack25519(r, ty);
  r[31] ^= par25519(tx) << 7;
}

function scalarmult(p, q, s) {
  var b, i;
  set25519(p[0], gf0);
  set25519(p[1], gf1);
  set25519(p[2], gf1);
  set25519(p[3], gf0);
  for (i = 255; i >= 0; --i) {
    b = (s[(i/8)|0] >> (i&7)) & 1;
    cswap(p, q, b);
    add(q, p);
    add(p, p);
    cswap(p, q, b);
  }
}

function scalarbase(p, s) {
  var q = [gf(), gf(), gf(), gf()];
  set25519(q[0], X);
  set25519(q[1], Y);
  set25519(q[2], gf1);
  M(q[3], X, Y);
  scalarmult(p, q, s);
}

function crypto_sign_keypair(pk, sk, seeded) {
  var d = new Uint8Array(64);
  var p = [gf(), gf(), gf(), gf()];
  var i;

  if (!seeded) randombytes(sk, 32);
  crypto_hash(d, sk, 32);
  d[0] &= 248;
  d[31] &= 127;
  d[31] |= 64;

  scalarbase(p, d);
  pack(pk, p);

  for (i = 0; i < 32; i++) sk[i+32] = pk[i];
  return 0;
}

var L = new Float64Array([0xed, 0xd3, 0xf5, 0x5c, 0x1a, 0x63, 0x12, 0x58, 0xd6, 0x9c, 0xf7, 0xa2, 0xde, 0xf9, 0xde, 0x14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x10]);

function modL(r, x) {
  var carry, i, j, k;
  for (i = 63; i >= 32; --i) {
    carry = 0;
    for (j = i - 32, k = i - 12; j < k; ++j) {
      x[j] += carry - 16 * x[i] * L[j - (i - 32)];
      carry = Math.floor((x[j] + 128) / 256);
      x[j] -= carry * 256;
    }
    x[j] += carry;
    x[i] = 0;
  }
  carry = 0;
  for (j = 0; j < 32; j++) {
    x[j] += carry - (x[31] >> 4) * L[j];
    carry = x[j] >> 8;
    x[j] &= 255;
  }
  for (j = 0; j < 32; j++) x[j] -= carry * L[j];
  for (i = 0; i < 32; i++) {
    x[i+1] += x[i] >> 8;
    r[i] = x[i] & 255;
  }
}

function reduce(r) {
  var x = new Float64Array(64), i;
  for (i = 0; i < 64; i++) x[i] = r[i];
  for (i = 0; i < 64; i++) r[i] = 0;
  modL(r, x);
}

// Note: difference from C - smlen returned, not passed as argument.
function crypto_sign(sm, m, n, sk) {
  var d = new Uint8Array(64), h = new Uint8Array(64), r = new Uint8Array(64);
  var i, j, x = new Float64Array(64);
  var p = [gf(), gf(), gf(), gf()];

  crypto_hash(d, sk, 32);
  d[0] &= 248;
  d[31] &= 127;
  d[31] |= 64;

  var smlen = n + 64;
  for (i = 0; i < n; i++) sm[64 + i] = m[i];
  for (i = 0; i < 32; i++) sm[32 + i] = d[32 + i];

  crypto_hash(r, sm.subarray(32), n+32);
  reduce(r);
  scalarbase(p, r);
  pack(sm, p);

  for (i = 32; i < 64; i++) sm[i] = sk[i];
  crypto_hash(h, sm, n + 64);
  reduce(h);

  for (i = 0; i < 64; i++) x[i] = 0;
  for (i = 0; i < 32; i++) x[i] = r[i];
  for (i = 0; i < 32; i++) {
    for (j = 0; j < 32; j++) {
      x[i+j] += h[i] * d[j];
    }
  }

  modL(sm.subarray(32), x);
  return smlen;
}

function unpackneg(r, p) {
  var t = gf(), chk = gf(), num = gf(),
      den = gf(), den2 = gf(), den4 = gf(),
      den6 = gf();

  set25519(r[2], gf1);
  unpack25519(r[1], p);
  S(num, r[1]);
  M(den, num, D);
  Z(num, num, r[2]);
  A(den, r[2], den);

  S(den2, den);
  S(den4, den2);
  M(den6, den4, den2);
  M(t, den6, num);
  M(t, t, den);

  pow2523(t, t);
  M(t, t, num);
  M(t, t, den);
  M(t, t, den);
  M(r[0], t, den);

  S(chk, r[0]);
  M(chk, chk, den);
  if (neq25519(chk, num)) M(r[0], r[0], I);

  S(chk, r[0]);
  M(chk, chk, den);
  if (neq25519(chk, num)) return -1;

  if (par25519(r[0]) === (p[31]>>7)) Z(r[0], gf0, r[0]);

  M(r[3], r[0], r[1]);
  return 0;
}

function crypto_sign_open(m, sm, n, pk) {
  var i;
  var t = new Uint8Array(32), h = new Uint8Array(64);
  var p = [gf(), gf(), gf(), gf()],
      q = [gf(), gf(), gf(), gf()];

  if (n < 64) return -1;

  if (unpackneg(q, pk)) return -1;

  for (i = 0; i < n; i++) m[i] = sm[i];
  for (i = 0; i < 32; i++) m[i+32] = pk[i];
  crypto_hash(h, m, n);
  reduce(h);
  scalarmult(p, q, h);

  scalarbase(q, sm.subarray(32));
  add(p, q);
  pack(t, p);

  n -= 64;
  if (crypto_verify_32(sm, 0, t, 0)) {
    for (i = 0; i < n; i++) m[i] = 0;
    return -1;
  }

  for (i = 0; i < n; i++) m[i] = sm[i + 64];
  return n;
}

var crypto_scalarmult_BYTES = 32,
    crypto_scalarmult_SCALARBYTES = 32,
    crypto_box_PUBLICKEYBYTES = 32,
    crypto_box_SECRETKEYBYTES = 32,
    crypto_sign_BYTES = 64,
    crypto_sign_PUBLICKEYBYTES = 32,
    crypto_sign_SECRETKEYBYTES = 64,
    crypto_sign_SEEDBYTES = 32;

function checkArrayTypes() {
  for (var i = 0; i < arguments.length; i++) {
    if (!(arguments[i] instanceof Uint8Array))
      throw new TypeError('unexpected type, use Uint8Array');
  }
}

function cleanup(arr) {
  for (var i = 0; i < arr.length; i++) arr[i] = 0;
}

nacl.scalarMult = function(n, p) {
  checkArrayTypes(n, p);
  if (n.length !== crypto_scalarmult_SCALARBYTES) throw new Error('bad n size');
  if (p.length !== crypto_scalarmult_BYTES) throw new Error('bad p size');
  var q = new Uint8Array(crypto_scalarmult_BYTES);
  crypto_scalarmult(q, n, p);
  return q;
};

nacl.box = {};

nacl.box.keyPair = function() {
  var pk = new Uint8Array(crypto_box_PUBLICKEYBYTES);
  var sk = new Uint8Array(crypto_box_SECRETKEYBYTES);
  crypto_box_keypair(pk, sk);
  return {publicKey: pk, secretKey: sk};
};

nacl.box.keyPair.fromSecretKey = function(secretKey) {
  checkArrayTypes(secretKey);
  if (secretKey.length !== crypto_box_SECRETKEYBYTES)
    throw new Error('bad secret key size');
  var pk = new Uint8Array(crypto_box_PUBLICKEYBYTES);
  crypto_scalarmult_base(pk, secretKey);
  return {publicKey: pk, secretKey: new Uint8Array(secretKey)};
};

nacl.sign = function(msg, secretKey) {
  checkArrayTypes(msg, secretKey);
  if (secretKey.length !== crypto_sign_SECRETKEYBYTES)
    throw new Error('bad secret key size');
  var signedMsg = new Uint8Array(crypto_sign_BYTES+msg.length);
  crypto_sign(signedMsg, msg, msg.length, secretKey);
  return signedMsg;
};

nacl.sign.detached = function(msg, secretKey) {
  var signedMsg = nacl.sign(msg, secretKey);
  var sig = new Uint8Array(crypto_sign_BYTES);
  for (var i = 0; i < sig.length; i++) sig[i] = signedMsg[i];
  return sig;
};

nacl.sign.detached.verify = function(msg, sig, publicKey) {
  checkArrayTypes(msg, sig, publicKey);
  if (sig.length !== crypto_sign_BYTES)
    throw new Error('bad signature size');
  if (publicKey.length !== crypto_sign_PUBLICKEYBYTES)
    throw new Error('bad public key size');
  var sm = new Uint8Array(crypto_sign_BYTES + msg.length);
  var m = new Uint8Array(crypto_sign_BYTES + msg.length);
  var i;
  for (i = 0; i < crypto_sign_BYTES; i++) sm[i] = sig[i];
  for (i = 0; i < msg.length; i++) sm[i+crypto_sign_BYTES] = msg[i];
  return (crypto_sign_open(m, sm, sm.length, publicKey) >= 0);
};

nacl.sign.keyPair = function() {
  var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
  var sk = new Uint8Array(crypto_sign_SECRETKEYBYTES);
  crypto_sign_keypair(pk, sk);
  return {publicKey: pk, secretKey: sk};
};

nacl.sign.keyPair.fromSecretKey = function(secretKey) {
  checkArrayTypes(secretKey);
  if (secretKey.length !== crypto_sign_SECRETKEYBYTES)
    throw new Error('bad secret key size');
  var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
  for (var i = 0; i < pk.length; i++) pk[i] = secretKey[32+i];
  return {publicKey: pk, secretKey: new Uint8Array(secretKey)};
};

nacl.sign.keyPair.fromSeed = function(seed) {
  checkArrayTypes(seed);
  if (seed.length !== crypto_sign_SEEDBYTES)
    throw new Error('bad seed size');
  var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
  var sk = new Uint8Array(crypto_sign_SECRETKEYBYTES);
  for (var i = 0; i < 32; i++) sk[i] = seed[i];
  crypto_sign_keypair(pk, sk, true);
  return {publicKey: pk, secretKey: sk};
};

nacl.setPRNG = function(fn) {
  randombytes = fn;
};

(function() {
  // Initialize PRNG if environment provides CSPRNG.
  // If not, methods calling randombytes will throw.
  if (crypto$1 && crypto$1.getRandomValues) {
    // Browsers and Node v16+
    var QUOTA = 65536;
    nacl.setPRNG(function(x, n) {
      var i, v = new Uint8Array(n);
      for (i = 0; i < n; i += QUOTA) {
        crypto$1.getRandomValues(v.subarray(i, i + Math.min(n - i, QUOTA)));
      }
      for (i = 0; i < n; i++) x[i] = v[i];
      cleanup(v);
    });
  }
})();

// OpenPGP.js - An OpenPGP implementation in javascript
// Copyright (C) 2015-2016 Decentral
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


const knownOIDs = {
  '2a8648ce3d030107': enums.curve.nistP256,
  '2b81040022': enums.curve.nistP384,
  '2b81040023': enums.curve.nistP521,
  '2b8104000a': enums.curve.secp256k1,
  '2b06010401da470f01': enums.curve.ed25519Legacy,
  '2b060104019755010501': enums.curve.curve25519Legacy,
  '2b2403030208010107': enums.curve.brainpoolP256r1,
  '2b240303020801010b': enums.curve.brainpoolP384r1,
  '2b240303020801010d': enums.curve.brainpoolP512r1
};

class OID {
  constructor(oid) {
    if (oid instanceof OID) {
      this.oid = oid.oid;
    } else if (util.isArray(oid) ||
               util.isUint8Array(oid)) {
      oid = new Uint8Array(oid);
      if (oid[0] === 0x06) { // DER encoded oid byte array
        if (oid[1] !== oid.length - 2) {
          throw new Error('Length mismatch in DER encoded oid');
        }
        oid = oid.subarray(2);
      }
      this.oid = oid;
    } else {
      this.oid = '';
    }
  }

  /**
   * Method to read an OID object
   * @param {Uint8Array} input - Where to read the OID from
   * @returns {Number} Number of read bytes.
   */
  read(input) {
    if (input.length >= 1) {
      const length = input[0];
      if (input.length >= 1 + length) {
        this.oid = input.subarray(1, 1 + length);
        return 1 + this.oid.length;
      }
    }
    throw new Error('Invalid oid');
  }

  /**
   * Serialize an OID object
   * @returns {Uint8Array} Array with the serialized value the OID.
   */
  write() {
    return util.concatUint8Array([new Uint8Array([this.oid.length]), this.oid]);
  }

  /**
   * Serialize an OID object as a hex string
   * @returns {string} String with the hex value of the OID.
   */
  toHex() {
    return util.uint8ArrayToHex(this.oid);
  }

  /**
   * If a known curve object identifier, return the canonical name of the curve
   * @returns {enums.curve} String with the canonical name of the curve
   * @throws if unknown
   */
  getName() {
    const name = knownOIDs[this.toHex()];
    if (!name) {
      throw new Error('Unknown curve object identifier.');
    }

    return name;
  }
}

// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


function readSimpleLength(bytes) {
  let len = 0;
  let offset;
  const type = bytes[0];


  if (type < 192) {
    [len] = bytes;
    offset = 1;
  } else if (type < 255) {
    len = ((bytes[0] - 192) << 8) + (bytes[1]) + 192;
    offset = 2;
  } else if (type === 255) {
    len = util.readNumber(bytes.subarray(1, 1 + 4));
    offset = 5;
  }

  return {
    len: len,
    offset: offset
  };
}

/**
 * Encodes a given integer of length to the openpgp length specifier to a
 * string
 *
 * @param {Integer} length - The length to encode
 * @returns {Uint8Array} String with openpgp length representation.
 */
function writeSimpleLength(length) {
  if (length < 192) {
    return new Uint8Array([length]);
  } else if (length > 191 && length < 8384) {
    /*
      * let a = (total data packet length) - 192 let bc = two octet
      * representation of a let d = b + 192
      */
    return new Uint8Array([((length - 192) >> 8) + 192, (length - 192) & 0xFF]);
  }
  return util.concatUint8Array([new Uint8Array([255]), util.writeNumber(length, 4)]);
}

function writePartialLength(power) {
  if (power < 0 || power > 30) {
    throw new Error('Partial Length power must be between 1 and 30');
  }
  return new Uint8Array([224 + power]);
}

function writeTag(tag_type) {
  /* we're only generating v4 packet headers here */
  return new Uint8Array([0xC0 | tag_type]);
}

/**
 * Writes a packet header version 4 with the given tag_type and length to a
 * string
 *
 * @param {Integer} tag_type - Tag type
 * @param {Integer} length - Length of the payload
 * @returns {String} String of the header.
 */
function writeHeader(tag_type, length) {
  /* we're only generating v4 packet headers here */
  return util.concatUint8Array([writeTag(tag_type), writeSimpleLength(length)]);
}

/**
 * Whether the packet type supports partial lengths per RFC4880
 * @param {Integer} tag - Tag type
 * @returns {Boolean} String of the header.
 */
function supportsStreaming(tag) {
  return [
    enums.packet.literalData,
    enums.packet.compressedData,
    enums.packet.symmetricallyEncryptedData,
    enums.packet.symEncryptedIntegrityProtectedData,
    enums.packet.aeadEncryptedData
  ].includes(tag);
}

/**
 * Generic static Packet Parser function
 *
 * @param {Uint8Array | ReadableStream<Uint8Array>} input - Input stream as string
 * @param {Function} callback - Function to call with the parsed packet
 * @returns {Boolean} Returns false if the stream was empty and parsing is done, and true otherwise.
 */
async function readPackets(input, callback) {
  const reader = getReader(input);
  let writer;
  let callbackReturned;
  try {
    const peekedBytes = await reader.peekBytes(2);
    // some sanity checks
    if (!peekedBytes || peekedBytes.length < 2 || (peekedBytes[0] & 0x80) === 0) {
      throw new Error('Error during parsing. This message / key probably does not conform to a valid OpenPGP format.');
    }
    const headerByte = await reader.readByte();
    let tag = -1;
    let format = -1;
    let packetLength;

    format = 0; // 0 = old format; 1 = new format
    if ((headerByte & 0x40) !== 0) {
      format = 1;
    }

    let packetLengthType;
    if (format) {
      // new format header
      tag = headerByte & 0x3F; // bit 5-0
    } else {
      // old format header
      tag = (headerByte & 0x3F) >> 2; // bit 5-2
      packetLengthType = headerByte & 0x03; // bit 1-0
    }

    const packetSupportsStreaming = supportsStreaming(tag);
    let packet = null;
    if (packetSupportsStreaming) {
      if (util.isStream(input) === 'array') {
        const arrayStream = new ArrayStream();
        writer = getWriter(arrayStream);
        packet = arrayStream;
      } else {
        const transform = new TransformStream();
        writer = getWriter(transform.writable);
        packet = transform.readable;
      }
      // eslint-disable-next-line callback-return
      callbackReturned = callback({ tag, packet });
    } else {
      packet = [];
    }

    let wasPartialLength;
    do {
      if (!format) {
        // 4.2.1. Old Format Packet Lengths
        switch (packetLengthType) {
          case 0:
            // The packet has a one-octet length. The header is 2 octets
            // long.
            packetLength = await reader.readByte();
            break;
          case 1:
            // The packet has a two-octet length. The header is 3 octets
            // long.
            packetLength = (await reader.readByte() << 8) | await reader.readByte();
            break;
          case 2:
            // The packet has a four-octet length. The header is 5
            // octets long.
            packetLength = (await reader.readByte() << 24) | (await reader.readByte() << 16) | (await reader.readByte() <<
              8) | await reader.readByte();
            break;
          default:
            // 3 - The packet is of indeterminate length. The header is 1
            // octet long, and the implementation must determine how long
            // the packet is. If the packet is in a file, this means that
            // the packet extends until the end of the file. In general,
            // an implementation SHOULD NOT use indeterminate-length
            // packets except where the end of the data will be clear
            // from the context, and even then it is better to use a
            // definite length, or a new format header. The new format
            // headers described below have a mechanism for precisely
            // encoding data of indeterminate length.
            packetLength = Infinity;
            break;
        }
      } else { // 4.2.2. New Format Packet Lengths
        // 4.2.2.1. One-Octet Lengths
        const lengthByte = await reader.readByte();
        wasPartialLength = false;
        if (lengthByte < 192) {
          packetLength = lengthByte;
          // 4.2.2.2. Two-Octet Lengths
        } else if (lengthByte >= 192 && lengthByte < 224) {
          packetLength = ((lengthByte - 192) << 8) + (await reader.readByte()) + 192;
          // 4.2.2.4. Partial Body Lengths
        } else if (lengthByte > 223 && lengthByte < 255) {
          packetLength = 1 << (lengthByte & 0x1F);
          wasPartialLength = true;
          if (!packetSupportsStreaming) {
            throw new TypeError('This packet type does not support partial lengths.');
          }
          // 4.2.2.3. Five-Octet Lengths
        } else {
          packetLength = (await reader.readByte() << 24) | (await reader.readByte() << 16) | (await reader.readByte() <<
            8) | await reader.readByte();
        }
      }
      if (packetLength > 0) {
        let bytesRead = 0;
        while (true) {
          if (writer) await writer.ready;
          const { done, value } = await reader.read();
          if (done) {
            if (packetLength === Infinity) break;
            throw new Error('Unexpected end of packet');
          }
          const chunk = packetLength === Infinity ? value : value.subarray(0, packetLength - bytesRead);
          if (writer) await writer.write(chunk);
          else packet.push(chunk);
          bytesRead += value.length;
          if (bytesRead >= packetLength) {
            reader.unshift(value.subarray(packetLength - bytesRead + value.length));
            break;
          }
        }
      }
    } while (wasPartialLength);

    // If this was not a packet that "supports streaming", we peek to check
    // whether it is the last packet in the message. We peek 2 bytes instead
    // of 1 because the beginning of this function also peeks 2 bytes, and we
    // want to cut a `subarray` of the correct length into `web-stream-tools`'
    // `externalBuffer` as a tiny optimization here.
    //
    // If it *was* a streaming packet (i.e. the data packets), we peek at the
    // entire remainder of the stream, in order to forward errors in the
    // remainder of the stream to the packet data. (Note that this means we
    // read/peek at all signature packets before closing the literal data
    // packet, for example.) This forwards MDC errors to the literal data
    // stream, for example, so that they don't get lost / forgotten on
    // decryptedMessage.packets.stream, which we never look at.
    //
    // An example of what we do when stream-parsing a message containing
    // [ one-pass signature packet, literal data packet, signature packet ]:
    // 1. Read the one-pass signature packet
    // 2. Peek 2 bytes of the literal data packet
    // 3. Parse the one-pass signature packet
    //
    // 4. Read the literal data packet, simultaneously stream-parsing it
    // 5. Peek until the end of the message
    // 6. Finish parsing the literal data packet
    //
    // 7. Read the signature packet again (we already peeked at it in step 5)
    // 8. Peek at the end of the stream again (`peekBytes` returns undefined)
    // 9. Parse the signature packet
    //
    // Note that this means that if there's an error in the very end of the
    // stream, such as an MDC error, we throw in step 5 instead of in step 8
    // (or never), which is the point of this exercise.
    const nextPacket = await reader.peekBytes(packetSupportsStreaming ? Infinity : 2);
    if (writer) {
      await writer.ready;
      await writer.close();
    } else {
      packet = util.concatUint8Array(packet);
      // eslint-disable-next-line callback-return
      await callback({ tag, packet });
    }
    return !nextPacket || !nextPacket.length;
  } catch (e) {
    if (writer) {
      await writer.abort(e);
      return true;
    } else {
      throw e;
    }
  } finally {
    if (writer) {
      await callbackReturned;
    }
    reader.releaseLock();
  }
}

class UnsupportedError extends Error {
  constructor(...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UnsupportedError);
    }

    this.name = 'UnsupportedError';
  }
}

// unknown packet types are handled differently depending on the packet criticality
class UnknownPacketError extends UnsupportedError {
  constructor(...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UnsupportedError);
    }

    this.name = 'UnknownPacketError';
  }
}

class UnparseablePacket {
  constructor(tag, rawContent) {
    this.tag = tag;
    this.rawContent = rawContent;
  }

  write() {
    return this.rawContent;
  }
}

// OpenPGP.js - An OpenPGP implementation in javascript
// Copyright (C) 2018 Proton Technologies AG
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA



/**
 * Generate (non-legacy) EdDSA key
 * @param {module:enums.publicKey} algo - Algorithm identifier
 * @returns {Promise<{ A: Uint8Array, seed: Uint8Array }>}
 */
async function generate$3(algo) {
  switch (algo) {
    case enums.publicKey.ed25519:
      try {
        const webCrypto = util.getWebCrypto();
        const webCryptoKey = await webCrypto.generateKey('Ed25519', true, ['sign', 'verify']);

        const privateKey = await webCrypto.exportKey('jwk', webCryptoKey.privateKey);
        const publicKey = await webCrypto.exportKey('jwk', webCryptoKey.publicKey);

        return {
          A: new Uint8Array(b64ToUint8Array(publicKey.x)),
          seed: b64ToUint8Array(privateKey.d, true)
        };
      } catch (err) {
        if (err.name !== 'NotSupportedError' && err.name !== 'OperationError') { // Temporary (hopefully) fix for WebKit on Linux
          throw err;
        }
        const seed = getRandomBytes(getPayloadSize$1(algo));
        const { publicKey: A } = nacl.sign.keyPair.fromSeed(seed);
        return { A, seed };
      }

    case enums.publicKey.ed448: {
      const ed448 = await util.getNobleCurve(enums.publicKey.ed448);
      const seed = ed448.utils.randomPrivateKey();
      const A = ed448.getPublicKey(seed);
      return { A, seed };
    }
    default:
      throw new Error('Unsupported EdDSA algorithm');
  }
}

/**
 * Sign a message using the provided key
 * @param {module:enums.publicKey} algo - Algorithm identifier
 * @param {module:enums.hash} hashAlgo - Hash algorithm used to sign (must be sha256 or stronger)
 * @param {Uint8Array} message - Message to sign
 * @param {Uint8Array} publicKey - Public key
 * @param {Uint8Array} privateKey - Private key used to sign the message
 * @param {Uint8Array} hashed - The hashed message
 * @returns {Promise<{
 *   RS: Uint8Array
 * }>} Signature of the message
 * @async
 */
async function sign$5(algo, hashAlgo, message, publicKey, privateKey, hashed) {
  if (getHashByteLength(hashAlgo) < getHashByteLength(getPreferredHashAlgo$2(algo))) {
    // Enforce digest sizes:
    // - Ed25519: https://www.rfc-editor.org/rfc/rfc9580.html#section-5.2.3.4-4
    // - Ed448: https://www.rfc-editor.org/rfc/rfc9580.html#section-5.2.3.5-4
    throw new Error('Hash algorithm too weak for EdDSA.');
  }
  switch (algo) {
    case enums.publicKey.ed25519:
      try {
        const webCrypto = util.getWebCrypto();
        const jwk = privateKeyToJWK(algo, publicKey, privateKey);
        const key = await webCrypto.importKey('jwk', jwk, 'Ed25519', false, ['sign']);

        const signature = new Uint8Array(
          await webCrypto.sign('Ed25519', key, hashed)
        );

        return { RS: signature };
      } catch (err) {
        if (err.name !== 'NotSupportedError') {
          throw err;
        }
        const secretKey = util.concatUint8Array([privateKey, publicKey]);
        const signature = nacl.sign.detached(hashed, secretKey);
        return { RS: signature };
      }

    case enums.publicKey.ed448: {
      const ed448 = await util.getNobleCurve(enums.publicKey.ed448);
      const signature = ed448.sign(hashed, privateKey);
      return { RS: signature };
    }
    default:
      throw new Error('Unsupported EdDSA algorithm');
  }

}

/**
 * Verifies if a signature is valid for a message
 * @param {module:enums.publicKey} algo - Algorithm identifier
 * @param {module:enums.hash} hashAlgo - Hash algorithm used in the signature
 * @param  {{ RS: Uint8Array }} signature Signature to verify the message
 * @param {Uint8Array} m - Message to verify
 * @param {Uint8Array} publicKey - Public key used to verify the message
 * @param {Uint8Array} hashed - The hashed message
 * @returns {Boolean}
 * @async
 */
async function verify$5(algo, hashAlgo, { RS }, m, publicKey, hashed) {
  if (getHashByteLength(hashAlgo) < getHashByteLength(getPreferredHashAlgo$2(algo))) {
    // Enforce digest sizes:
    // - Ed25519: https://www.rfc-editor.org/rfc/rfc9580.html#section-5.2.3.4-4
    // - Ed448: https://www.rfc-editor.org/rfc/rfc9580.html#section-5.2.3.5-4
    throw new Error('Hash algorithm too weak for EdDSA.');
  }
  switch (algo) {
    case enums.publicKey.ed25519:
      try {
        const webCrypto = util.getWebCrypto();
        const jwk = publicKeyToJWK(algo, publicKey);
        const key = await webCrypto.importKey('jwk', jwk, 'Ed25519', false, ['verify']);
        const verified = await webCrypto.verify('Ed25519', key, RS, hashed);
        return verified;
      } catch (err) {
        if (err.name !== 'NotSupportedError') {
          throw err;
        }
        return nacl.sign.detached.verify(hashed, RS, publicKey);
      }

    case enums.publicKey.ed448: {
      const ed448 = await util.getNobleCurve(enums.publicKey.ed448);
      return ed448.verify(RS, hashed, publicKey);
    }
    default:
      throw new Error('Unsupported EdDSA algorithm');
  }
}
/**
 * Validate (non-legacy) EdDSA parameters
 * @param {module:enums.publicKey} algo - Algorithm identifier
 * @param {Uint8Array} A - EdDSA public point
 * @param {Uint8Array} seed - EdDSA secret seed
 * @param {Uint8Array} oid - (legacy only) EdDSA OID
 * @returns {Promise<Boolean>} Whether params are valid.
 * @async
 */
async function validateParams$6(algo, A, seed) {
  switch (algo) {
    case enums.publicKey.ed25519: {
      /**
       * Derive public point A' from private key
       * and expect A == A'
       * TODO: move to sign-verify using WebCrypto (same as ECDSA) when curve is more widely implemented
       */
      const { publicKey } = nacl.sign.keyPair.fromSeed(seed);
      return util.equalsUint8Array(A, publicKey);
    }

    case enums.publicKey.ed448: {
      const ed448 = await util.getNobleCurve(enums.publicKey.ed448);

      const publicKey = ed448.getPublicKey(seed);
      return util.equalsUint8Array(A, publicKey);
    }
    default:
      return false;
  }
}

function getPayloadSize$1(algo) {
  switch (algo) {
    case enums.publicKey.ed25519:
      return 32;

    case enums.publicKey.ed448:
      return 57;

    default:
      throw new Error('Unsupported EdDSA algorithm');
  }
}

function getPreferredHashAlgo$2(algo) {
  switch (algo) {
    case enums.publicKey.ed25519:
      return enums.hash.sha256;
    case enums.publicKey.ed448:
      return enums.hash.sha512;
    default:
      throw new Error('Unknown EdDSA algo');
  }
}

const publicKeyToJWK = (algo, publicKey) => {
  switch (algo) {
    case enums.publicKey.ed25519: {
      const jwk = {
        kty: 'OKP',
        crv: 'Ed25519',
        x: uint8ArrayToB64(publicKey),
        ext: true
      };
      return jwk;
    }
    default:
      throw new Error('Unsupported EdDSA algorithm');
  }
};

const privateKeyToJWK = (algo, publicKey, privateKey) => {
  switch (algo) {
    case enums.publicKey.ed25519: {
      const jwk = publicKeyToJWK(algo, publicKey);
      jwk.d = uint8ArrayToB64(privateKey);
      return jwk;
    }
    default:
      throw new Error('Unsupported EdDSA algorithm');
  }
};

var eddsa = /*#__PURE__*/Object.freeze({
  __proto__: null,
  generate: generate$3,
  getPayloadSize: getPayloadSize$1,
  getPreferredHashAlgo: getPreferredHashAlgo$2,
  sign: sign$5,
  validateParams: validateParams$6,
  verify: verify$5
});

function isBytes(a) {
    return (a instanceof Uint8Array ||
        (a != null && typeof a === 'object' && a.constructor.name === 'Uint8Array'));
}
function bytes(b, ...lengths) {
    if (!isBytes(b))
        throw new Error('Uint8Array expected');
    if (lengths.length > 0 && !lengths.includes(b.length))
        throw new Error(`Uint8Array expected of length ${lengths}, not of length=${b.length}`);
}
function exists(instance, checkFinished = true) {
    if (instance.destroyed)
        throw new Error('Hash instance has been destroyed');
    if (checkFinished && instance.finished)
        throw new Error('Hash#digest() has already been called');
}
function output(out, instance) {
    bytes(out);
    const min = instance.outputLen;
    if (out.length < min) {
        throw new Error(`digestInto() expects output buffer of length at least ${min}`);
    }
}

/*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) */
// Cast array to different type
const u8$1 = (arr) => new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
const u32$1 = (arr) => new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
// Cast array to view
const createView = (arr) => new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
// big-endian hardware is rare. Just in case someone still decides to run ciphers:
// early-throw an error because we don't support BE yet.
const isLE = new Uint8Array(new Uint32Array([0x11223344]).buffer)[0] === 0x44;
if (!isLE)
    throw new Error('Non little-endian hardware is not supported');
/**
 * @example utf8ToBytes('abc') // new Uint8Array([97, 98, 99])
 */
function utf8ToBytes(str) {
    if (typeof str !== 'string')
        throw new Error(`string expected, got ${typeof str}`);
    return new Uint8Array(new TextEncoder().encode(str)); // https://bugzil.la/1681809
}
/**
 * Normalizes (non-hex) string or Uint8Array to Uint8Array.
 * Warning: when Uint8Array is passed, it would NOT get copied.
 * Keep in mind for future mutable operations.
 */
function toBytes(data) {
    if (typeof data === 'string')
        data = utf8ToBytes(data);
    else if (isBytes(data))
        data = copyBytes(data);
    else
        throw new Error(`Uint8Array expected, got ${typeof data}`);
    return data;
}
/**
 * Copies several Uint8Arrays into one.
 */
function concatBytes(...arrays) {
    let sum = 0;
    for (let i = 0; i < arrays.length; i++) {
        const a = arrays[i];
        bytes(a);
        sum += a.length;
    }
    const res = new Uint8Array(sum);
    for (let i = 0, pad = 0; i < arrays.length; i++) {
        const a = arrays[i];
        res.set(a, pad);
        pad += a.length;
    }
    return res;
}
// Compares 2 u8a-s in kinda constant time
function equalBytes(a, b) {
    if (a.length !== b.length)
        return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++)
        diff |= a[i] ^ b[i];
    return diff === 0;
}
/**
 * @__NO_SIDE_EFFECTS__
 */
const wrapCipher = (params, c) => {
    Object.assign(c, params);
    return c;
};
// Polyfill for Safari 14
function setBigUint64(view, byteOffset, value, isLE) {
    if (typeof view.setBigUint64 === 'function')
        return view.setBigUint64(byteOffset, value, isLE);
    const _32n = BigInt(32);
    const _u32_max = BigInt(0xffffffff);
    const wh = Number((value >> _32n) & _u32_max);
    const wl = Number(value & _u32_max);
    const h = 0;
    const l = 4;
    view.setUint32(byteOffset + h, wh, isLE);
    view.setUint32(byteOffset + l, wl, isLE);
}
// Is byte array aligned to 4 byte offset (u32)?
function isAligned32(bytes) {
    return bytes.byteOffset % 4 === 0;
}
// copy bytes to new u8a (aligned). Because Buffer.slice is broken.
function copyBytes(bytes) {
    return Uint8Array.from(bytes);
}
function clean(...arrays) {
    for (let i = 0; i < arrays.length; i++) {
        arrays[i].fill(0);
    }
}

// GHash from AES-GCM and its little-endian "mirror image" Polyval from AES-SIV.
// Implemented in terms of GHash with conversion function for keys
// GCM GHASH from NIST SP800-38d, SIV from RFC 8452.
// https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf
// GHASH   modulo: x^128 + x^7   + x^2   + x     + 1
// POLYVAL modulo: x^128 + x^127 + x^126 + x^121 + 1
const BLOCK_SIZE$1 = 16;
// TODO: rewrite
// temporary padding buffer
const ZEROS16 = /* @__PURE__ */ new Uint8Array(16);
const ZEROS32 = u32$1(ZEROS16);
const POLY$1 = 0xe1; // v = 2*v % POLY
// v = 2*v % POLY
// NOTE: because x + x = 0 (add/sub is same), mul2(x) != x+x
// We can multiply any number using montgomery ladder and this function (works as double, add is simple xor)
const mul2$1 = (s0, s1, s2, s3) => {
    const hiBit = s3 & 1;
    return {
        s3: (s2 << 31) | (s3 >>> 1),
        s2: (s1 << 31) | (s2 >>> 1),
        s1: (s0 << 31) | (s1 >>> 1),
        s0: (s0 >>> 1) ^ ((POLY$1 << 24) & -(hiBit & 1)), // reduce % poly
    };
};
const swapLE = (n) => (((n >>> 0) & 0xff) << 24) |
    (((n >>> 8) & 0xff) << 16) |
    (((n >>> 16) & 0xff) << 8) |
    ((n >>> 24) & 0xff) |
    0;
/**
 * `mulX_POLYVAL(ByteReverse(H))` from spec
 * @param k mutated in place
 */
function _toGHASHKey(k) {
    k.reverse();
    const hiBit = k[15] & 1;
    // k >>= 1
    let carry = 0;
    for (let i = 0; i < k.length; i++) {
        const t = k[i];
        k[i] = (t >>> 1) | carry;
        carry = (t & 1) << 7;
    }
    k[0] ^= -hiBit & 0xe1; // if (hiBit) n ^= 0xe1000000000000000000000000000000;
    return k;
}
const estimateWindow = (bytes) => {
    if (bytes > 64 * 1024)
        return 8;
    if (bytes > 1024)
        return 4;
    return 2;
};
class GHASH {
    // We select bits per window adaptively based on expectedLength
    constructor(key, expectedLength) {
        this.blockLen = BLOCK_SIZE$1;
        this.outputLen = BLOCK_SIZE$1;
        this.s0 = 0;
        this.s1 = 0;
        this.s2 = 0;
        this.s3 = 0;
        this.finished = false;
        key = toBytes(key);
        bytes(key, 16);
        const kView = createView(key);
        let k0 = kView.getUint32(0, false);
        let k1 = kView.getUint32(4, false);
        let k2 = kView.getUint32(8, false);
        let k3 = kView.getUint32(12, false);
        // generate table of doubled keys (half of montgomery ladder)
        const doubles = [];
        for (let i = 0; i < 128; i++) {
            doubles.push({ s0: swapLE(k0), s1: swapLE(k1), s2: swapLE(k2), s3: swapLE(k3) });
            ({ s0: k0, s1: k1, s2: k2, s3: k3 } = mul2$1(k0, k1, k2, k3));
        }
        const W = estimateWindow(expectedLength || 1024);
        if (![1, 2, 4, 8].includes(W))
            throw new Error(`ghash: wrong window size=${W}, should be 2, 4 or 8`);
        this.W = W;
        const bits = 128; // always 128 bits;
        const windows = bits / W;
        const windowSize = (this.windowSize = 2 ** W);
        const items = [];
        // Create precompute table for window of W bits
        for (let w = 0; w < windows; w++) {
            // truth table: 00, 01, 10, 11
            for (let byte = 0; byte < windowSize; byte++) {
                // prettier-ignore
                let s0 = 0, s1 = 0, s2 = 0, s3 = 0;
                for (let j = 0; j < W; j++) {
                    const bit = (byte >>> (W - j - 1)) & 1;
                    if (!bit)
                        continue;
                    const { s0: d0, s1: d1, s2: d2, s3: d3 } = doubles[W * w + j];
                    (s0 ^= d0), (s1 ^= d1), (s2 ^= d2), (s3 ^= d3);
                }
                items.push({ s0, s1, s2, s3 });
            }
        }
        this.t = items;
    }
    _updateBlock(s0, s1, s2, s3) {
        (s0 ^= this.s0), (s1 ^= this.s1), (s2 ^= this.s2), (s3 ^= this.s3);
        const { W, t, windowSize } = this;
        // prettier-ignore
        let o0 = 0, o1 = 0, o2 = 0, o3 = 0;
        const mask = (1 << W) - 1; // 2**W will kill performance.
        let w = 0;
        for (const num of [s0, s1, s2, s3]) {
            for (let bytePos = 0; bytePos < 4; bytePos++) {
                const byte = (num >>> (8 * bytePos)) & 0xff;
                for (let bitPos = 8 / W - 1; bitPos >= 0; bitPos--) {
                    const bit = (byte >>> (W * bitPos)) & mask;
                    const { s0: e0, s1: e1, s2: e2, s3: e3 } = t[w * windowSize + bit];
                    (o0 ^= e0), (o1 ^= e1), (o2 ^= e2), (o3 ^= e3);
                    w += 1;
                }
            }
        }
        this.s0 = o0;
        this.s1 = o1;
        this.s2 = o2;
        this.s3 = o3;
    }
    update(data) {
        data = toBytes(data);
        exists(this);
        const b32 = u32$1(data);
        const blocks = Math.floor(data.length / BLOCK_SIZE$1);
        const left = data.length % BLOCK_SIZE$1;
        for (let i = 0; i < blocks; i++) {
            this._updateBlock(b32[i * 4 + 0], b32[i * 4 + 1], b32[i * 4 + 2], b32[i * 4 + 3]);
        }
        if (left) {
            ZEROS16.set(data.subarray(blocks * BLOCK_SIZE$1));
            this._updateBlock(ZEROS32[0], ZEROS32[1], ZEROS32[2], ZEROS32[3]);
            clean(ZEROS32); // clean tmp buffer
        }
        return this;
    }
    destroy() {
        const { t } = this;
        // clean precompute table
        for (const elm of t) {
            (elm.s0 = 0), (elm.s1 = 0), (elm.s2 = 0), (elm.s3 = 0);
        }
    }
    digestInto(out) {
        exists(this);
        output(out, this);
        this.finished = true;
        const { s0, s1, s2, s3 } = this;
        const o32 = u32$1(out);
        o32[0] = s0;
        o32[1] = s1;
        o32[2] = s2;
        o32[3] = s3;
        return out;
    }
    digest() {
        const res = new Uint8Array(BLOCK_SIZE$1);
        this.digestInto(res);
        this.destroy();
        return res;
    }
}
class Polyval extends GHASH {
    constructor(key, expectedLength) {
        key = toBytes(key);
        const ghKey = _toGHASHKey(copyBytes(key));
        super(ghKey, expectedLength);
        clean(ghKey);
    }
    update(data) {
        data = toBytes(data);
        exists(this);
        const b32 = u32$1(data);
        const left = data.length % BLOCK_SIZE$1;
        const blocks = Math.floor(data.length / BLOCK_SIZE$1);
        for (let i = 0; i < blocks; i++) {
            this._updateBlock(swapLE(b32[i * 4 + 3]), swapLE(b32[i * 4 + 2]), swapLE(b32[i * 4 + 1]), swapLE(b32[i * 4 + 0]));
        }
        if (left) {
            ZEROS16.set(data.subarray(blocks * BLOCK_SIZE$1));
            this._updateBlock(swapLE(ZEROS32[3]), swapLE(ZEROS32[2]), swapLE(ZEROS32[1]), swapLE(ZEROS32[0]));
            clean(ZEROS32);
        }
        return this;
    }
    digestInto(out) {
        exists(this);
        output(out, this);
        this.finished = true;
        // tmp ugly hack
        const { s0, s1, s2, s3 } = this;
        const o32 = u32$1(out);
        o32[0] = s0;
        o32[1] = s1;
        o32[2] = s2;
        o32[3] = s3;
        return out.reverse();
    }
}
function wrapConstructorWithKey(hashCons) {
    const hashC = (msg, key) => hashCons(key, msg.length).update(toBytes(msg)).digest();
    const tmp = hashCons(new Uint8Array(16), 0);
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = (key, expectedLength) => hashCons(key, expectedLength);
    return hashC;
}
const ghash = wrapConstructorWithKey((key, expectedLength) => new GHASH(key, expectedLength));
wrapConstructorWithKey((key, expectedLength) => new Polyval(key, expectedLength));

// prettier-ignore
/*
AES (Advanced Encryption Standard) aka Rijndael block cipher.

Data is split into 128-bit blocks. Encrypted in 10/12/14 rounds (128/192/256 bits). In every round:
1. **S-box**, table substitution
2. **Shift rows**, cyclic shift left of all rows of data array
3. **Mix columns**, multiplying every column by fixed polynomial
4. **Add round key**, round_key xor i-th column of array

Resources:
- FIPS-197 https://csrc.nist.gov/files/pubs/fips/197/final/docs/fips-197.pdf
- Original proposal: https://csrc.nist.gov/csrc/media/projects/cryptographic-standards-and-guidelines/documents/aes-development/rijndael-ammended.pdf
*/
const BLOCK_SIZE = 16;
const BLOCK_SIZE32 = 4;
const EMPTY_BLOCK = new Uint8Array(BLOCK_SIZE);
const POLY = 0x11b; // 1 + x + x**3 + x**4 + x**8
// TODO: remove multiplication, binary ops only
function mul2(n) {
    return (n << 1) ^ (POLY & -(n >> 7));
}
function mul(a, b) {
    let res = 0;
    for (; b > 0; b >>= 1) {
        // Montgomery ladder
        res ^= a & -(b & 1); // if (b&1) res ^=a (but const-time).
        a = mul2(a); // a = 2*a
    }
    return res;
}
// AES S-box is generated using finite field inversion,
// an affine transform, and xor of a constant 0x63.
const sbox = /* @__PURE__ */ (() => {
    const t = new Uint8Array(256);
    for (let i = 0, x = 1; i < 256; i++, x ^= mul2(x))
        t[i] = x;
    const box = new Uint8Array(256);
    box[0] = 0x63; // first elm
    for (let i = 0; i < 255; i++) {
        let x = t[255 - i];
        x |= x << 8;
        box[t[i]] = (x ^ (x >> 4) ^ (x >> 5) ^ (x >> 6) ^ (x >> 7) ^ 0x63) & 0xff;
    }
    clean(t);
    return box;
})();
// Inverted S-box
const invSbox = /* @__PURE__ */ sbox.map((_, j) => sbox.indexOf(j));
// Rotate u32 by 8
const rotr32_8 = (n) => (n << 24) | (n >>> 8);
const rotl32_8 = (n) => (n << 8) | (n >>> 24);
// The byte swap operation for uint32 (LE<->BE)
const byteSwap = (word) => ((word << 24) & 0xff000000) |
    ((word << 8) & 0xff0000) |
    ((word >>> 8) & 0xff00) |
    ((word >>> 24) & 0xff);
// T-table is optimization suggested in 5.2 of original proposal (missed from FIPS-197). Changes:
// - LE instead of BE
// - bigger tables: T0 and T1 are merged into T01 table and T2 & T3 into T23;
//   so index is u16, instead of u8. This speeds up things, unexpectedly
function genTtable(sbox, fn) {
    if (sbox.length !== 256)
        throw new Error('Wrong sbox length');
    const T0 = new Uint32Array(256).map((_, j) => fn(sbox[j]));
    const T1 = T0.map(rotl32_8);
    const T2 = T1.map(rotl32_8);
    const T3 = T2.map(rotl32_8);
    const T01 = new Uint32Array(256 * 256);
    const T23 = new Uint32Array(256 * 256);
    const sbox2 = new Uint16Array(256 * 256);
    for (let i = 0; i < 256; i++) {
        for (let j = 0; j < 256; j++) {
            const idx = i * 256 + j;
            T01[idx] = T0[i] ^ T1[j];
            T23[idx] = T2[i] ^ T3[j];
            sbox2[idx] = (sbox[i] << 8) | sbox[j];
        }
    }
    return { sbox, sbox2, T0, T1, T2, T3, T01, T23 };
}
const tableEncoding = /* @__PURE__ */ genTtable(sbox, (s) => (mul(s, 3) << 24) | (s << 16) | (s << 8) | mul(s, 2));
const tableDecoding = /* @__PURE__ */ genTtable(invSbox, (s) => (mul(s, 11) << 24) | (mul(s, 13) << 16) | (mul(s, 9) << 8) | mul(s, 14));
const xPowers = /* @__PURE__ */ (() => {
    const p = new Uint8Array(16);
    for (let i = 0, x = 1; i < 16; i++, x = mul2(x))
        p[i] = x;
    return p;
})();
function expandKeyLE(key) {
    bytes(key);
    const len = key.length;
    if (![16, 24, 32].includes(len))
        throw new Error(`aes: wrong key size: should be 16, 24 or 32, got: ${len}`);
    const { sbox2 } = tableEncoding;
    const toClean = [];
    if (!isAligned32(key))
        toClean.push((key = copyBytes(key)));
    const k32 = u32$1(key);
    const Nk = k32.length;
    const subByte = (n) => applySbox(sbox2, n, n, n, n);
    const xk = new Uint32Array(len + 28); // expanded key
    xk.set(k32);
    // 4.3.1 Key expansion
    for (let i = Nk; i < xk.length; i++) {
        let t = xk[i - 1];
        if (i % Nk === 0)
            t = subByte(rotr32_8(t)) ^ xPowers[i / Nk - 1];
        else if (Nk > 6 && i % Nk === 4)
            t = subByte(t);
        xk[i] = xk[i - Nk] ^ t;
    }
    clean(...toClean);
    return xk;
}
function expandKeyDecLE(key) {
    const encKey = expandKeyLE(key);
    const xk = encKey.slice();
    const Nk = encKey.length;
    const { sbox2 } = tableEncoding;
    const { T0, T1, T2, T3 } = tableDecoding;
    // Inverse key by chunks of 4 (rounds)
    for (let i = 0; i < Nk; i += 4) {
        for (let j = 0; j < 4; j++)
            xk[i + j] = encKey[Nk - i - 4 + j];
    }
    clean(encKey);
    // apply InvMixColumn except first & last round
    for (let i = 4; i < Nk - 4; i++) {
        const x = xk[i];
        const w = applySbox(sbox2, x, x, x, x);
        xk[i] = T0[w & 0xff] ^ T1[(w >>> 8) & 0xff] ^ T2[(w >>> 16) & 0xff] ^ T3[w >>> 24];
    }
    return xk;
}
// Apply tables
function apply0123(T01, T23, s0, s1, s2, s3) {
    return (T01[((s0 << 8) & 0xff00) | ((s1 >>> 8) & 0xff)] ^
        T23[((s2 >>> 8) & 0xff00) | ((s3 >>> 24) & 0xff)]);
}
function applySbox(sbox2, s0, s1, s2, s3) {
    return (sbox2[(s0 & 0xff) | (s1 & 0xff00)] |
        (sbox2[((s2 >>> 16) & 0xff) | ((s3 >>> 16) & 0xff00)] << 16));
}
function encrypt$4(xk, s0, s1, s2, s3) {
    const { sbox2, T01, T23 } = tableEncoding;
    let k = 0;
    (s0 ^= xk[k++]), (s1 ^= xk[k++]), (s2 ^= xk[k++]), (s3 ^= xk[k++]);
    const rounds = xk.length / 4 - 2;
    for (let i = 0; i < rounds; i++) {
        const t0 = xk[k++] ^ apply0123(T01, T23, s0, s1, s2, s3);
        const t1 = xk[k++] ^ apply0123(T01, T23, s1, s2, s3, s0);
        const t2 = xk[k++] ^ apply0123(T01, T23, s2, s3, s0, s1);
        const t3 = xk[k++] ^ apply0123(T01, T23, s3, s0, s1, s2);
        (s0 = t0), (s1 = t1), (s2 = t2), (s3 = t3);
    }
    // last round (without mixcolumns, so using SBOX2 table)
    const t0 = xk[k++] ^ applySbox(sbox2, s0, s1, s2, s3);
    const t1 = xk[k++] ^ applySbox(sbox2, s1, s2, s3, s0);
    const t2 = xk[k++] ^ applySbox(sbox2, s2, s3, s0, s1);
    const t3 = xk[k++] ^ applySbox(sbox2, s3, s0, s1, s2);
    return { s0: t0, s1: t1, s2: t2, s3: t3 };
}
// Can't be merged with encrypt: arg positions for apply0123 / applySbox are different
function decrypt$4(xk, s0, s1, s2, s3) {
    const { sbox2, T01, T23 } = tableDecoding;
    let k = 0;
    (s0 ^= xk[k++]), (s1 ^= xk[k++]), (s2 ^= xk[k++]), (s3 ^= xk[k++]);
    const rounds = xk.length / 4 - 2;
    for (let i = 0; i < rounds; i++) {
        const t0 = xk[k++] ^ apply0123(T01, T23, s0, s3, s2, s1);
        const t1 = xk[k++] ^ apply0123(T01, T23, s1, s0, s3, s2);
        const t2 = xk[k++] ^ apply0123(T01, T23, s2, s1, s0, s3);
        const t3 = xk[k++] ^ apply0123(T01, T23, s3, s2, s1, s0);
        (s0 = t0), (s1 = t1), (s2 = t2), (s3 = t3);
    }
    // Last round
    const t0 = xk[k++] ^ applySbox(sbox2, s0, s3, s2, s1);
    const t1 = xk[k++] ^ applySbox(sbox2, s1, s0, s3, s2);
    const t2 = xk[k++] ^ applySbox(sbox2, s2, s1, s0, s3);
    const t3 = xk[k++] ^ applySbox(sbox2, s3, s2, s1, s0);
    return { s0: t0, s1: t1, s2: t2, s3: t3 };
}
function getDst(len, dst) {
    if (dst === undefined)
        return new Uint8Array(len);
    bytes(dst);
    if (dst.length < len)
        throw new Error(`aes: wrong destination length, expected at least ${len}, got: ${dst.length}`);
    if (!isAligned32(dst))
        throw new Error('unaligned dst');
    return dst;
}
// TODO: investigate merging with ctr32
function ctrCounter(xk, nonce, src, dst) {
    bytes(nonce, BLOCK_SIZE);
    bytes(src);
    const srcLen = src.length;
    dst = getDst(srcLen, dst);
    const ctr = nonce;
    const c32 = u32$1(ctr);
    // Fill block (empty, ctr=0)
    let { s0, s1, s2, s3 } = encrypt$4(xk, c32[0], c32[1], c32[2], c32[3]);
    const src32 = u32$1(src);
    const dst32 = u32$1(dst);
    // process blocks
    for (let i = 0; i + 4 <= src32.length; i += 4) {
        dst32[i + 0] = src32[i + 0] ^ s0;
        dst32[i + 1] = src32[i + 1] ^ s1;
        dst32[i + 2] = src32[i + 2] ^ s2;
        dst32[i + 3] = src32[i + 3] ^ s3;
        // Full 128 bit counter with wrap around
        let carry = 1;
        for (let i = ctr.length - 1; i >= 0; i--) {
            carry = (carry + (ctr[i] & 0xff)) | 0;
            ctr[i] = carry & 0xff;
            carry >>>= 8;
        }
        ({ s0, s1, s2, s3 } = encrypt$4(xk, c32[0], c32[1], c32[2], c32[3]));
    }
    // leftovers (less than block)
    // It's possible to handle > u32 fast, but is it worth it?
    const start = BLOCK_SIZE * Math.floor(src32.length / BLOCK_SIZE32);
    if (start < srcLen) {
        const b32 = new Uint32Array([s0, s1, s2, s3]);
        const buf = u8$1(b32);
        for (let i = start, pos = 0; i < srcLen; i++, pos++)
            dst[i] = src[i] ^ buf[pos];
        clean(b32);
    }
    return dst;
}
// AES CTR with overflowing 32 bit counter
// It's possible to do 32le significantly simpler (and probably faster) by using u32.
// But, we need both, and perf bottleneck is in ghash anyway.
function ctr32(xk, isLE, nonce, src, dst) {
    bytes(nonce, BLOCK_SIZE);
    bytes(src);
    dst = getDst(src.length, dst);
    const ctr = nonce; // write new value to nonce, so it can be re-used
    const c32 = u32$1(ctr);
    const view = createView(ctr);
    const src32 = u32$1(src);
    const dst32 = u32$1(dst);
    const ctrPos = isLE ? 0 : 12;
    const srcLen = src.length;
    // Fill block (empty, ctr=0)
    let ctrNum = view.getUint32(ctrPos, isLE); // read current counter value
    let { s0, s1, s2, s3 } = encrypt$4(xk, c32[0], c32[1], c32[2], c32[3]);
    // process blocks
    for (let i = 0; i + 4 <= src32.length; i += 4) {
        dst32[i + 0] = src32[i + 0] ^ s0;
        dst32[i + 1] = src32[i + 1] ^ s1;
        dst32[i + 2] = src32[i + 2] ^ s2;
        dst32[i + 3] = src32[i + 3] ^ s3;
        ctrNum = (ctrNum + 1) >>> 0; // u32 wrap
        view.setUint32(ctrPos, ctrNum, isLE);
        ({ s0, s1, s2, s3 } = encrypt$4(xk, c32[0], c32[1], c32[2], c32[3]));
    }
    // leftovers (less than a block)
    const start = BLOCK_SIZE * Math.floor(src32.length / BLOCK_SIZE32);
    if (start < srcLen) {
        const b32 = new Uint32Array([s0, s1, s2, s3]);
        const buf = u8$1(b32);
        for (let i = start, pos = 0; i < srcLen; i++, pos++)
            dst[i] = src[i] ^ buf[pos];
        clean(b32);
    }
    return dst;
}
/**
 * CTR: counter mode. Creates stream cipher.
 * Requires good IV. Parallelizable. OK, but no MAC.
 */
const ctr = wrapCipher({ blockSize: 16, nonceLength: 16 }, function ctr(key, nonce) {
    bytes(key);
    bytes(nonce, BLOCK_SIZE);
    function processCtr(buf, dst) {
        bytes(buf);
        if (dst !== undefined) {
            bytes(dst);
            if (!isAligned32(dst))
                throw new Error('unaligned destination');
        }
        const xk = expandKeyLE(key);
        const n = copyBytes(nonce); // align + avoid changing
        const toClean = [xk, n];
        if (!isAligned32(buf))
            toClean.push((buf = copyBytes(buf)));
        const out = ctrCounter(xk, n, buf, dst);
        clean(...toClean);
        return out;
    }
    return {
        encrypt: (plaintext, dst) => processCtr(plaintext, dst),
        decrypt: (ciphertext, dst) => processCtr(ciphertext, dst),
    };
});
function validateBlockDecrypt(data) {
    bytes(data);
    if (data.length % BLOCK_SIZE !== 0) {
        throw new Error(`aes/(cbc-ecb).decrypt ciphertext should consist of blocks with size ${BLOCK_SIZE}`);
    }
}
function validateBlockEncrypt(plaintext, pcks5, dst) {
    bytes(plaintext);
    let outLen = plaintext.length;
    const remaining = outLen % BLOCK_SIZE;
    if (!pcks5 && remaining !== 0)
        throw new Error('aec/(cbc-ecb): unpadded plaintext with disabled padding');
    if (!isAligned32(plaintext))
        plaintext = copyBytes(plaintext);
    const b = u32$1(plaintext);
    if (pcks5) {
        let left = BLOCK_SIZE - remaining;
        if (!left)
            left = BLOCK_SIZE; // if no bytes left, create empty padding block
        outLen = outLen + left;
    }
    const out = getDst(outLen, dst);
    const o = u32$1(out);
    return { b, o, out };
}
function validatePCKS(data, pcks5) {
    if (!pcks5)
        return data;
    const len = data.length;
    if (!len)
        throw new Error('aes/pcks5: empty ciphertext not allowed');
    const lastByte = data[len - 1];
    if (lastByte <= 0 || lastByte > 16)
        throw new Error('aes/pcks5: wrong padding');
    const out = data.subarray(0, -lastByte);
    for (let i = 0; i < lastByte; i++)
        if (data[len - i - 1] !== lastByte)
            throw new Error('aes/pcks5: wrong padding');
    return out;
}
function padPCKS(left) {
    const tmp = new Uint8Array(16);
    const tmp32 = u32$1(tmp);
    tmp.set(left);
    const paddingByte = BLOCK_SIZE - left.length;
    for (let i = BLOCK_SIZE - paddingByte; i < BLOCK_SIZE; i++)
        tmp[i] = paddingByte;
    return tmp32;
}
/**
 * CBC: Cipher-Block-Chaining. Key is previous round’s block.
 * Fragile: needs proper padding. Unauthenticated: needs MAC.
 */
const cbc = wrapCipher({ blockSize: 16, nonceLength: 16 }, function cbc(key, iv, opts = {}) {
    bytes(key);
    bytes(iv, 16);
    const pcks5 = !opts.disablePadding;
    return {
        encrypt(plaintext, dst) {
            const xk = expandKeyLE(key);
            const { b, o, out: _out } = validateBlockEncrypt(plaintext, pcks5, dst);
            let _iv = iv;
            const toClean = [xk];
            if (!isAligned32(_iv))
                toClean.push((_iv = copyBytes(_iv)));
            const n32 = u32$1(_iv);
            // prettier-ignore
            let s0 = n32[0], s1 = n32[1], s2 = n32[2], s3 = n32[3];
            let i = 0;
            for (; i + 4 <= b.length;) {
                (s0 ^= b[i + 0]), (s1 ^= b[i + 1]), (s2 ^= b[i + 2]), (s3 ^= b[i + 3]);
                ({ s0, s1, s2, s3 } = encrypt$4(xk, s0, s1, s2, s3));
                (o[i++] = s0), (o[i++] = s1), (o[i++] = s2), (o[i++] = s3);
            }
            if (pcks5) {
                const tmp32 = padPCKS(plaintext.subarray(i * 4));
                (s0 ^= tmp32[0]), (s1 ^= tmp32[1]), (s2 ^= tmp32[2]), (s3 ^= tmp32[3]);
                ({ s0, s1, s2, s3 } = encrypt$4(xk, s0, s1, s2, s3));
                (o[i++] = s0), (o[i++] = s1), (o[i++] = s2), (o[i++] = s3);
            }
            clean(...toClean);
            return _out;
        },
        decrypt(ciphertext, dst) {
            validateBlockDecrypt(ciphertext);
            const xk = expandKeyDecLE(key);
            let _iv = iv;
            const toClean = [xk];
            if (!isAligned32(_iv))
                toClean.push((_iv = copyBytes(_iv)));
            const n32 = u32$1(_iv);
            const out = getDst(ciphertext.length, dst);
            if (!isAligned32(ciphertext))
                toClean.push((ciphertext = copyBytes(ciphertext)));
            const b = u32$1(ciphertext);
            const o = u32$1(out);
            // prettier-ignore
            let s0 = n32[0], s1 = n32[1], s2 = n32[2], s3 = n32[3];
            for (let i = 0; i + 4 <= b.length;) {
                // prettier-ignore
                const ps0 = s0, ps1 = s1, ps2 = s2, ps3 = s3;
                (s0 = b[i + 0]), (s1 = b[i + 1]), (s2 = b[i + 2]), (s3 = b[i + 3]);
                const { s0: o0, s1: o1, s2: o2, s3: o3 } = decrypt$4(xk, s0, s1, s2, s3);
                (o[i++] = o0 ^ ps0), (o[i++] = o1 ^ ps1), (o[i++] = o2 ^ ps2), (o[i++] = o3 ^ ps3);
            }
            clean(...toClean);
            return validatePCKS(out, pcks5);
        },
    };
});
/**
 * CFB: Cipher Feedback Mode. The input for the block cipher is the previous cipher output.
 * Unauthenticated: needs MAC.
 */
const cfb = wrapCipher({ blockSize: 16, nonceLength: 16 }, function cfb(key, iv) {
    bytes(key);
    bytes(iv, 16);
    function processCfb(src, isEncrypt, dst) {
        bytes(src);
        const srcLen = src.length;
        dst = getDst(srcLen, dst);
        const xk = expandKeyLE(key);
        let _iv = iv;
        const toClean = [xk];
        if (!isAligned32(_iv))
            toClean.push((_iv = copyBytes(_iv)));
        if (!isAligned32(src))
            toClean.push((src = copyBytes(src)));
        const src32 = u32$1(src);
        const dst32 = u32$1(dst);
        const next32 = isEncrypt ? dst32 : src32;
        const n32 = u32$1(_iv);
        // prettier-ignore
        let s0 = n32[0], s1 = n32[1], s2 = n32[2], s3 = n32[3];
        for (let i = 0; i + 4 <= src32.length;) {
            const { s0: e0, s1: e1, s2: e2, s3: e3 } = encrypt$4(xk, s0, s1, s2, s3);
            dst32[i + 0] = src32[i + 0] ^ e0;
            dst32[i + 1] = src32[i + 1] ^ e1;
            dst32[i + 2] = src32[i + 2] ^ e2;
            dst32[i + 3] = src32[i + 3] ^ e3;
            (s0 = next32[i++]), (s1 = next32[i++]), (s2 = next32[i++]), (s3 = next32[i++]);
        }
        // leftovers (less than block)
        const start = BLOCK_SIZE * Math.floor(src32.length / BLOCK_SIZE32);
        if (start < srcLen) {
            ({ s0, s1, s2, s3 } = encrypt$4(xk, s0, s1, s2, s3));
            const buf = u8$1(new Uint32Array([s0, s1, s2, s3]));
            for (let i = start, pos = 0; i < srcLen; i++, pos++)
                dst[i] = src[i] ^ buf[pos];
            clean(buf);
        }
        clean(...toClean);
        return dst;
    }
    return {
        encrypt: (plaintext, dst) => processCfb(plaintext, true, dst),
        decrypt: (ciphertext, dst) => processCfb(ciphertext, false, dst),
    };
});
// TODO: merge with chacha, however gcm has bitLen while chacha has byteLen
function computeTag(fn, isLE, key, data, AAD) {
    const aadLength = AAD == null ? 0 : AAD.length;
    const h = fn.create(key, data.length + aadLength);
    if (AAD)
        h.update(AAD);
    h.update(data);
    const num = new Uint8Array(16);
    const view = createView(num);
    if (AAD)
        setBigUint64(view, 0, BigInt(aadLength * 8), isLE);
    setBigUint64(view, 8, BigInt(data.length * 8), isLE);
    h.update(num);
    const res = h.digest();
    clean(num);
    return res;
}
/**
 * GCM: Galois/Counter Mode.
 * Modern, parallel version of CTR, with MAC.
 * Be careful: MACs can be forged.
 * Unsafe to use random nonces under the same key, due to collision chance.
 * As for nonce size, prefer 12-byte, instead of 8-byte.
 */
const gcm = wrapCipher({ blockSize: 16, nonceLength: 12, tagLength: 16 }, function gcm(key, nonce, AAD) {
    bytes(key);
    bytes(nonce);
    if (AAD !== undefined)
        bytes(AAD);
    // NIST 800-38d doesn't enforce minimum nonce length.
    // We enforce 8 bytes for compat with openssl.
    // 12 bytes are recommended. More than 12 bytes would be converted into 12.
    if (nonce.length < 8)
        throw new Error('aes/gcm: invalid nonce length');
    const tagLength = 16;
    function _computeTag(authKey, tagMask, data) {
        const tag = computeTag(ghash, false, authKey, data, AAD);
        for (let i = 0; i < tagMask.length; i++)
            tag[i] ^= tagMask[i];
        return tag;
    }
    function deriveKeys() {
        const xk = expandKeyLE(key);
        const authKey = EMPTY_BLOCK.slice();
        const counter = EMPTY_BLOCK.slice();
        ctr32(xk, false, counter, counter, authKey);
        // NIST 800-38d, page 15: different behavior for 96-bit and non-96-bit nonces
        if (nonce.length === 12) {
            counter.set(nonce);
        }
        else {
            const nonceLen = EMPTY_BLOCK.slice();
            const view = createView(nonceLen);
            setBigUint64(view, 8, BigInt(nonce.length * 8), false);
            // ghash(nonce || u64be(0) || u64be(nonceLen*8))
            const g = ghash.create(authKey).update(nonce).update(nonceLen);
            g.digestInto(counter); // digestInto doesn't trigger '.destroy'
            g.destroy();
        }
        const tagMask = ctr32(xk, false, counter, EMPTY_BLOCK);
        return { xk, authKey, counter, tagMask };
    }
    return {
        encrypt(plaintext) {
            bytes(plaintext);
            const { xk, authKey, counter, tagMask } = deriveKeys();
            const out = new Uint8Array(plaintext.length + tagLength);
            const toClean = [xk, authKey, counter, tagMask];
            if (!isAligned32(plaintext))
                toClean.push((plaintext = copyBytes(plaintext)));
            ctr32(xk, false, counter, plaintext, out);
            const tag = _computeTag(authKey, tagMask, out.subarray(0, out.length - tagLength));
            toClean.push(tag);
            out.set(tag, plaintext.length);
            clean(...toClean);
            return out;
        },
        decrypt(ciphertext) {
            bytes(ciphertext);
            if (ciphertext.length < tagLength)
                throw new Error(`aes/gcm: ciphertext less than tagLen (${tagLength})`);
            const { xk, authKey, counter, tagMask } = deriveKeys();
            const toClean = [xk, authKey, tagMask, counter];
            if (!isAligned32(ciphertext))
                toClean.push((ciphertext = copyBytes(ciphertext)));
            const data = ciphertext.subarray(0, -tagLength);
            const passedTag = ciphertext.subarray(-tagLength);
            const tag = _computeTag(authKey, tagMask, data);
            toClean.push(tag);
            if (!equalBytes(tag, passedTag))
                throw new Error('aes/gcm: invalid ghash tag');
            const out = ctr32(xk, false, counter, data);
            clean(...toClean);
            return out;
        },
    };
});
function isBytes32(a) {
    return (a != null &&
        typeof a === 'object' &&
        (a instanceof Uint32Array || a.constructor.name === 'Uint32Array'));
}
function encryptBlock(xk, block) {
    bytes(block, 16);
    if (!isBytes32(xk))
        throw new Error('_encryptBlock accepts result of expandKeyLE');
    const b32 = u32$1(block);
    let { s0, s1, s2, s3 } = encrypt$4(xk, b32[0], b32[1], b32[2], b32[3]);
    (b32[0] = s0), (b32[1] = s1), (b32[2] = s2), (b32[3] = s3);
    return block;
}
function decryptBlock(xk, block) {
    bytes(block, 16);
    if (!isBytes32(xk))
        throw new Error('_decryptBlock accepts result of expandKeyLE');
    const b32 = u32$1(block);
    let { s0, s1, s2, s3 } = decrypt$4(xk, b32[0], b32[1], b32[2], b32[3]);
    (b32[0] = s0), (b32[1] = s1), (b32[2] = s2), (b32[3] = s3);
    return block;
}
/**
 * AES-W (base for AESKW/AESKWP).
 * Specs: [SP800-38F](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-38F.pdf),
 * [RFC 3394](https://datatracker.ietf.org/doc/rfc3394/),
 * [RFC 5649](https://datatracker.ietf.org/doc/rfc5649/).
 */
const AESW = {
    /*
    High-level pseudocode:
    ```
    A: u64 = IV
    out = []
    for (let i=0, ctr = 0; i<6; i++) {
      for (const chunk of chunks(plaintext, 8)) {
        A ^= swapEndianess(ctr++)
        [A, res] = chunks(encrypt(A || chunk), 8);
        out ||= res
      }
    }
    out = A || out
    ```
    Decrypt is the same, but reversed.
    */
    encrypt(kek, out) {
        // Size is limited to 4GB, otherwise ctr will overflow and we'll need to switch to bigints.
        // If you need it larger, open an issue.
        if (out.length >= 2 ** 32)
            throw new Error('plaintext should be less than 4gb');
        const xk = expandKeyLE(kek);
        if (out.length === 16)
            encryptBlock(xk, out);
        else {
            const o32 = u32$1(out);
            // prettier-ignore
            let a0 = o32[0], a1 = o32[1]; // A
            for (let j = 0, ctr = 1; j < 6; j++) {
                for (let pos = 2; pos < o32.length; pos += 2, ctr++) {
                    const { s0, s1, s2, s3 } = encrypt$4(xk, a0, a1, o32[pos], o32[pos + 1]);
                    // A = MSB(64, B) ^ t where t = (n*j)+i
                    (a0 = s0), (a1 = s1 ^ byteSwap(ctr)), (o32[pos] = s2), (o32[pos + 1] = s3);
                }
            }
            (o32[0] = a0), (o32[1] = a1); // out = A || out
        }
        xk.fill(0);
    },
    decrypt(kek, out) {
        if (out.length - 8 >= 2 ** 32)
            throw new Error('ciphertext should be less than 4gb');
        const xk = expandKeyDecLE(kek);
        const chunks = out.length / 8 - 1; // first chunk is IV
        if (chunks === 1)
            decryptBlock(xk, out);
        else {
            const o32 = u32$1(out);
            // prettier-ignore
            let a0 = o32[0], a1 = o32[1]; // A
            for (let j = 0, ctr = chunks * 6; j < 6; j++) {
                for (let pos = chunks * 2; pos >= 1; pos -= 2, ctr--) {
                    a1 ^= byteSwap(ctr);
                    const { s0, s1, s2, s3 } = decrypt$4(xk, a0, a1, o32[pos], o32[pos + 1]);
                    (a0 = s0), (a1 = s1), (o32[pos] = s2), (o32[pos + 1] = s3);
                }
            }
            (o32[0] = a0), (o32[1] = a1);
        }
        xk.fill(0);
    },
};
const AESKW_IV = new Uint8Array(8).fill(0xa6); // A6A6A6A6A6A6A6A6
/**
 * AES-KW (key-wrap). Injects static IV into plaintext, adds counter, encrypts 6 times.
 * Reduces block size from 16 to 8 bytes.
 * For padded version, use aeskwp.
 * [RFC 3394](https://datatracker.ietf.org/doc/rfc3394/),
 * [NIST.SP.800-38F](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-38F.pdf).
 */
const aeskw = wrapCipher({ blockSize: 8 }, (kek) => ({
    encrypt(plaintext) {
        bytes(plaintext);
        if (!plaintext.length || plaintext.length % 8 !== 0)
            throw new Error('invalid plaintext length');
        if (plaintext.length === 8)
            throw new Error('8-byte keys not allowed in AESKW, use AESKWP instead');
        const out = concatBytes(AESKW_IV, plaintext);
        AESW.encrypt(kek, out);
        return out;
    },
    decrypt(ciphertext) {
        bytes(ciphertext);
        // ciphertext must be at least 24 bytes and a multiple of 8 bytes
        // 24 because should have at least two block (1 iv + 2).
        // Replace with 16 to enable '8-byte keys'
        if (ciphertext.length % 8 !== 0 || ciphertext.length < 3 * 8)
            throw new Error('invalid ciphertext length');
        const out = copyBytes(ciphertext);
        AESW.decrypt(kek, out);
        if (!equalBytes(out.subarray(0, 8), AESKW_IV))
            throw new Error('integrity check failed');
        out.subarray(0, 8).fill(0); // ciphertext.subarray(0, 8) === IV, but we clean it anyway
        return out.subarray(8);
    },
}));
// Private, unsafe low-level methods. Can change at any time.
const unsafe = {
    expandKeyLE,
    expandKeyDecLE,
    encrypt: encrypt$4,
    decrypt: decrypt$4,
    encryptBlock,
    decryptBlock,
    ctrCounter,
    ctr32,
};

async function getLegacyCipher(algo) {
  switch (algo) {
    case enums.symmetric.aes128:
    case enums.symmetric.aes192:
    case enums.symmetric.aes256:
      throw new Error('Not a legacy cipher');
    case enums.symmetric.cast5:
    case enums.symmetric.blowfish:
    case enums.symmetric.twofish:
    case enums.symmetric.tripledes: {
      const { legacyCiphers } = await import('./legacy_ciphers.mjs');
      const algoName = enums.read(enums.symmetric, algo);
      const cipher = legacyCiphers.get(algoName);
      if (!cipher) {
        throw new Error('Unsupported cipher algorithm');
      }
      return cipher;
    }
    default:
      throw new Error('Unsupported cipher algorithm');
  }
}

/**
 * Get block size for given cipher algo
 * @param {module:enums.symmetric} algo - alrogithm identifier
 */
function getCipherBlockSize(algo) {
  switch (algo) {
    case enums.symmetric.aes128:
    case enums.symmetric.aes192:
    case enums.symmetric.aes256:
    case enums.symmetric.twofish:
      return 16;
    case enums.symmetric.blowfish:
    case enums.symmetric.cast5:
    case enums.symmetric.tripledes:
      return 8;
    default:
      throw new Error('Unsupported cipher');
  }
}

/**
 * Get key size for given cipher algo
 * @param {module:enums.symmetric} algo - alrogithm identifier
 */
function getCipherKeySize(algo) {
  switch (algo) {
    case enums.symmetric.aes128:
    case enums.symmetric.blowfish:
    case enums.symmetric.cast5:
      return 16;
    case enums.symmetric.aes192:
    case enums.symmetric.tripledes:
      return 24;
    case enums.symmetric.aes256:
    case enums.symmetric.twofish:
      return 32;
    default:
      throw new Error('Unsupported cipher');
  }
}

/**
 * Get block and key size for given cipher algo
 * @param {module:enums.symmetric} algo - alrogithm identifier
 */
function getCipherParams(algo) {
  return { keySize: getCipherKeySize(algo), blockSize: getCipherBlockSize(algo) };
}

// OpenPGP.js - An OpenPGP implementation in javascript
// Copyright (C) 2015-2016 Decentral
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


const webCrypto$8 = util.getWebCrypto();
/**
 * AES key wrap
 * @param {enums.symmetric.aes128|enums.symmetric.aes256|enums.symmetric.aes192} algo - AES algo
 * @param {Uint8Array} key - wrapping key
 * @param {Uint8Array} dataToWrap
 * @returns {Uint8Array} wrapped key
 */
async function wrap(algo, key, dataToWrap) {
  const { keySize } = getCipherParams(algo);
  // sanity checks, since WebCrypto does not use the `algo` input
  if (!util.isAES(algo) || key.length !== keySize) {
    throw new Error('Unexpected algorithm or key size');
  }

  try {
    const wrappingKey = await webCrypto$8.importKey('raw', key, { name: 'AES-KW' }, false, ['wrapKey']);
    // Import data as HMAC key, as it has no key length requirements
    const keyToWrap = await webCrypto$8.importKey('raw', dataToWrap, { name: 'HMAC', hash: 'SHA-256' }, true, ['sign']);
    const wrapped = await webCrypto$8.wrapKey('raw', keyToWrap, wrappingKey, { name: 'AES-KW' });
    return new Uint8Array(wrapped);
  } catch (err) {
    // no 192 bit support in Chromium, which throws `OperationError`, see: https://www.chromium.org/blink/webcrypto#TOC-AES-support
    if (err.name !== 'NotSupportedError' &&
      !(key.length === 24 && err.name === 'OperationError')) {
      throw err;
    }
    util.printDebugError('Browser did not support operation: ' + err.message);
  }

  return aeskw(key).encrypt(dataToWrap);
}

/**
 * AES key unwrap
 * @param {enums.symmetric.aes128|enums.symmetric.aes256|enums.symmetric.aes192} algo - AES algo
 * @param {Uint8Array} key - wrapping key
 * @param {Uint8Array} wrappedData
 * @returns {Uint8Array} unwrapped data
 */
async function unwrap(algo, key, wrappedData) {
  const { keySize } = getCipherParams(algo);
  // sanity checks, since WebCrypto does not use the `algo` input
  if (!util.isAES(algo) || key.length !== keySize) {
    throw new Error('Unexpected algorithm or key size');
  }

  let wrappingKey;
  try {
    wrappingKey = await webCrypto$8.importKey('raw', key, { name: 'AES-KW' }, false, ['unwrapKey']);
  } catch (err) {
    // no 192 bit support in Chromium, which throws `OperationError`, see: https://www.chromium.org/blink/webcrypto#TOC-AES-support
    if (err.name !== 'NotSupportedError' &&
      !(key.length === 24 && err.name === 'OperationError')) {
      throw err;
    }
    util.printDebugError('Browser did not support operation: ' + err.message);
    return aeskw(key).decrypt(wrappedData);
  }

  try {
    const unwrapped = await webCrypto$8.unwrapKey('raw', wrappedData, wrappingKey, { name: 'AES-KW' }, { name: 'HMAC', hash: 'SHA-256' }, true, ['sign']);
    return new Uint8Array(await webCrypto$8.exportKey('raw', unwrapped));
  } catch (err) {
    if (err.name === 'OperationError') {
      throw new Error('Key Data Integrity failed');
    }
    throw err;
  }
}

/**
 * @fileoverview This module implements HKDF using either the WebCrypto API or Node.js' crypto API.
 * @module crypto/hkdf
 */


const webCrypto$7 = util.getWebCrypto();

async function computeHKDF(hashAlgo, inputKey, salt, info, outLen) {
  const hash = enums.read(enums.webHash, hashAlgo);
  if (!hash) throw new Error('Hash algo not supported with HKDF');

  const importedKey = await webCrypto$7.importKey('raw', inputKey, 'HKDF', false, ['deriveBits']);
  const bits = await webCrypto$7.deriveBits({ name: 'HKDF', hash, salt, info }, importedKey, outLen * 8);
  return new Uint8Array(bits);
}

/**
 * @fileoverview Key encryption and decryption for RFC 6637 ECDH
 * @module crypto/public_key/elliptic/ecdh
 */


const HKDF_INFO = {
  x25519: util.encodeUTF8('OpenPGP X25519'),
  x448: util.encodeUTF8('OpenPGP X448')
};

/**
 * Generate ECDH key for Montgomery curves
 * @param {module:enums.publicKey} algo - Algorithm identifier
 * @returns {Promise<{ A: Uint8Array, k: Uint8Array }>}
 */
async function generate$2(algo) {
  switch (algo) {
    case enums.publicKey.x25519: {
      // k stays in little-endian, unlike legacy ECDH over curve25519
      const k = getRandomBytes(32);
      const { publicKey: A } = nacl.box.keyPair.fromSecretKey(k);
      return { A, k };
    }

    case enums.publicKey.x448: {
      const x448 = await util.getNobleCurve(enums.publicKey.x448);
      const k = x448.utils.randomPrivateKey();
      const A = x448.getPublicKey(k);
      return { A, k };
    }
    default:
      throw new Error('Unsupported ECDH algorithm');
  }
}

/**
* Validate ECDH parameters
* @param {module:enums.publicKey} algo - Algorithm identifier
* @param {Uint8Array} A - ECDH public point
* @param {Uint8Array} k - ECDH secret scalar
* @returns {Promise<Boolean>} Whether params are valid.
* @async
*/
async function validateParams$5(algo, A, k) {
  switch (algo) {
    case enums.publicKey.x25519: {
      /**
       * Derive public point A' from private key
       * and expect A == A'
       */
      const { publicKey } = nacl.box.keyPair.fromSecretKey(k);
      return util.equalsUint8Array(A, publicKey);
    }
    case enums.publicKey.x448: {
      const x448 = await util.getNobleCurve(enums.publicKey.x448);
      /**
       * Derive public point A' from private key
       * and expect A == A'
       */
      const publicKey = x448.getPublicKey(k);
      return util.equalsUint8Array(A, publicKey);
    }

    default:
      return false;
  }
}

/**
 * Wrap and encrypt a session key
 *
 * @param {module:enums.publicKey} algo - Algorithm identifier
 * @param {Uint8Array} data - session key data to be encrypted
 * @param {Uint8Array} recipientA - Recipient public key (K_B)
 * @returns {Promise<{
 *  ephemeralPublicKey: Uint8Array,
 * wrappedKey: Uint8Array
 * }>} ephemeral public key (K_A) and encrypted key
 * @async
 */
async function encrypt$3(algo, data, recipientA) {
  const { ephemeralPublicKey, sharedSecret } = await generateEphemeralEncryptionMaterial(algo, recipientA);
  const hkdfInput = util.concatUint8Array([
    ephemeralPublicKey,
    recipientA,
    sharedSecret
  ]);
  switch (algo) {
    case enums.publicKey.x25519: {
      const cipherAlgo = enums.symmetric.aes128;
      const { keySize } = getCipherParams(cipherAlgo);
      const encryptionKey = await computeHKDF(enums.hash.sha256, hkdfInput, new Uint8Array(), HKDF_INFO.x25519, keySize);
      const wrappedKey = await wrap(cipherAlgo, encryptionKey, data);
      return { ephemeralPublicKey, wrappedKey };
    }
    case enums.publicKey.x448: {
      const cipherAlgo = enums.symmetric.aes256;
      const { keySize } = getCipherParams(enums.symmetric.aes256);
      const encryptionKey = await computeHKDF(enums.hash.sha512, hkdfInput, new Uint8Array(), HKDF_INFO.x448, keySize);
      const wrappedKey = await wrap(cipherAlgo, encryptionKey, data);
      return { ephemeralPublicKey, wrappedKey };
    }

    default:
      throw new Error('Unsupported ECDH algorithm');
  }
}

/**
 * Decrypt and unwrap the session key
 *
 * @param {module:enums.publicKey} algo - Algorithm identifier
 * @param {Uint8Array} ephemeralPublicKey - (K_A)
 * @param {Uint8Array} wrappedKey,
 * @param {Uint8Array} A - Recipient public key (K_b), needed for KDF
 * @param {Uint8Array} k - Recipient secret key (b)
 * @returns {Promise<Uint8Array>} decrypted session key data
 * @async
 */
async function decrypt$3(algo, ephemeralPublicKey, wrappedKey, A, k) {
  const sharedSecret = await recomputeSharedSecret(algo, ephemeralPublicKey, A, k);
  const hkdfInput = util.concatUint8Array([
    ephemeralPublicKey,
    A,
    sharedSecret
  ]);
  switch (algo) {
    case enums.publicKey.x25519: {
      const cipherAlgo = enums.symmetric.aes128;
      const { keySize } = getCipherParams(cipherAlgo);
      const encryptionKey = await computeHKDF(enums.hash.sha256, hkdfInput, new Uint8Array(), HKDF_INFO.x25519, keySize);
      return unwrap(cipherAlgo, encryptionKey, wrappedKey);
    }
    case enums.publicKey.x448: {
      const cipherAlgo = enums.symmetric.aes256;
      const { keySize } = getCipherParams(enums.symmetric.aes256);
      const encryptionKey = await computeHKDF(enums.hash.sha512, hkdfInput, new Uint8Array(), HKDF_INFO.x448, keySize);
      return unwrap(cipherAlgo, encryptionKey, wrappedKey);
    }
    default:
      throw new Error('Unsupported ECDH algorithm');
  }
}

function getPayloadSize(algo) {
  switch (algo) {
    case enums.publicKey.x25519:
      return 32;

    case enums.publicKey.x448:
      return 56;

    default:
      throw new Error('Unsupported ECDH algorithm');
  }
}

/**
 * Generate shared secret and ephemeral public key for encryption
 * @returns {Promise<{ ephemeralPublicKey: Uint8Array, sharedSecret: Uint8Array }>} ephemeral public key (K_A) and shared secret
 * @async
 */
async function generateEphemeralEncryptionMaterial(algo, recipientA) {
  switch (algo) {
    case enums.publicKey.x25519: {
      const ephemeralSecretKey = getRandomBytes(getPayloadSize(algo));
      const sharedSecret = nacl.scalarMult(ephemeralSecretKey, recipientA);
      assertNonZeroArray(sharedSecret);
      const { publicKey: ephemeralPublicKey } = nacl.box.keyPair.fromSecretKey(ephemeralSecretKey);
      return { ephemeralPublicKey, sharedSecret };
    }
    case enums.publicKey.x448: {
      const x448 = await util.getNobleCurve(enums.publicKey.x448);
      const ephemeralSecretKey = x448.utils.randomPrivateKey();
      const sharedSecret = x448.getSharedSecret(ephemeralSecretKey, recipientA);
      assertNonZeroArray(sharedSecret);
      const ephemeralPublicKey = x448.getPublicKey(ephemeralSecretKey);
      return { ephemeralPublicKey, sharedSecret };
    }
    default:
      throw new Error('Unsupported ECDH algorithm');
  }
}

async function recomputeSharedSecret(algo, ephemeralPublicKey, A, k) {
  switch (algo) {
    case enums.publicKey.x25519: {
      const sharedSecret = nacl.scalarMult(k, ephemeralPublicKey);
      assertNonZeroArray(sharedSecret);
      return sharedSecret;
    }
    case enums.publicKey.x448: {
      const x448 = await util.getNobleCurve(enums.publicKey.x448);
      const sharedSecret = x448.getSharedSecret(k, ephemeralPublicKey);
      assertNonZeroArray(sharedSecret);
      return sharedSecret;
    }
    default:
      throw new Error('Unsupported ECDH algorithm');
  }
}

/**
 * x25519 and x448 produce an all-zero value when given as input a point with small order.
 * This does not lead to a security issue in the context of ECDH, but it is still unexpected,
 * hence we throw.
 * @param {Uint8Array} sharedSecret
 */
function assertNonZeroArray(sharedSecret) {
  let acc = 0;
  for (let i = 0; i < sharedSecret.length; i++) {
    acc |= sharedSecret[i];
  }
  if (acc === 0) {
    throw new Error('Unexpected low order point');
  }
}

var ecdh_x = /*#__PURE__*/Object.freeze({
  __proto__: null,
  decrypt: decrypt$3,
  encrypt: encrypt$3,
  generate: generate$2,
  generateEphemeralEncryptionMaterial: generateEphemeralEncryptionMaterial,
  getPayloadSize: getPayloadSize,
  recomputeSharedSecret: recomputeSharedSecret,
  validateParams: validateParams$5
});

// OpenPGP.js - An OpenPGP implementation in javascript
// Copyright (C) 2015-2016 Decentral
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


const webCrypto$6 = util.getWebCrypto();
const nodeCrypto$6 = util.getNodeCrypto();

const webCurves = {
  [enums.curve.nistP256]: 'P-256',
  [enums.curve.nistP384]: 'P-384',
  [enums.curve.nistP521]: 'P-521'
};
const knownCurves = nodeCrypto$6 ? nodeCrypto$6.getCurves() : [];
const nodeCurves = nodeCrypto$6 ? {
  [enums.curve.secp256k1]: knownCurves.includes('secp256k1') ? 'secp256k1' : undefined,
  [enums.curve.nistP256]: knownCurves.includes('prime256v1') ? 'prime256v1' : undefined,
  [enums.curve.nistP384]: knownCurves.includes('secp384r1') ? 'secp384r1' : undefined,
  [enums.curve.nistP521]: knownCurves.includes('secp521r1') ? 'secp521r1' : undefined,
  [enums.curve.ed25519Legacy]: knownCurves.includes('ED25519') ? 'ED25519' : undefined,
  [enums.curve.curve25519Legacy]: knownCurves.includes('X25519') ? 'X25519' : undefined,
  [enums.curve.brainpoolP256r1]: knownCurves.includes('brainpoolP256r1') ? 'brainpoolP256r1' : undefined,
  [enums.curve.brainpoolP384r1]: knownCurves.includes('brainpoolP384r1') ? 'brainpoolP384r1' : undefined,
  [enums.curve.brainpoolP512r1]: knownCurves.includes('brainpoolP512r1') ? 'brainpoolP512r1' : undefined
} : {};

const curves = {
  [enums.curve.nistP256]: {
    oid: [0x06, 0x08, 0x2A, 0x86, 0x48, 0xCE, 0x3D, 0x03, 0x01, 0x07],
    keyType: enums.publicKey.ecdsa,
    hash: enums.hash.sha256,
    cipher: enums.symmetric.aes128,
    node: nodeCurves[enums.curve.nistP256],
    web: webCurves[enums.curve.nistP256],
    payloadSize: 32,
    sharedSize: 256,
    wireFormatLeadingByte: 0x04
  },
  [enums.curve.nistP384]: {
    oid: [0x06, 0x05, 0x2B, 0x81, 0x04, 0x00, 0x22],
    keyType: enums.publicKey.ecdsa,
    hash: enums.hash.sha384,
    cipher: enums.symmetric.aes192,
    node: nodeCurves[enums.curve.nistP384],
    web: webCurves[enums.curve.nistP384],
    payloadSize: 48,
    sharedSize: 384,
    wireFormatLeadingByte: 0x04
  },
  [enums.curve.nistP521]: {
    oid: [0x06, 0x05, 0x2B, 0x81, 0x04, 0x00, 0x23],
    keyType: enums.publicKey.ecdsa,
    hash: enums.hash.sha512,
    cipher: enums.symmetric.aes256,
    node: nodeCurves[enums.curve.nistP521],
    web: webCurves[enums.curve.nistP521],
    payloadSize: 66,
    sharedSize: 528,
    wireFormatLeadingByte: 0x04
  },
  [enums.curve.secp256k1]: {
    oid: [0x06, 0x05, 0x2B, 0x81, 0x04, 0x00, 0x0A],
    keyType: enums.publicKey.ecdsa,
    hash: enums.hash.sha256,
    cipher: enums.symmetric.aes128,
    node: nodeCurves[enums.curve.secp256k1],
    payloadSize: 32,
    wireFormatLeadingByte: 0x04
  },
  [enums.curve.ed25519Legacy]: {
    oid: [0x06, 0x09, 0x2B, 0x06, 0x01, 0x04, 0x01, 0xDA, 0x47, 0x0F, 0x01],
    keyType: enums.publicKey.eddsaLegacy,
    hash: enums.hash.sha512,
    node: false, // nodeCurves.ed25519 TODO
    payloadSize: 32,
    wireFormatLeadingByte: 0x40
  },
  [enums.curve.curve25519Legacy]: {
    oid: [0x06, 0x0A, 0x2B, 0x06, 0x01, 0x04, 0x01, 0x97, 0x55, 0x01, 0x05, 0x01],
    keyType: enums.publicKey.ecdh,
    hash: enums.hash.sha256,
    cipher: enums.symmetric.aes128,
    node: false, // nodeCurves.curve25519 TODO
    payloadSize: 32,
    wireFormatLeadingByte: 0x40
  },
  [enums.curve.brainpoolP256r1]: {
    oid: [0x06, 0x09, 0x2B, 0x24, 0x03, 0x03, 0x02, 0x08, 0x01, 0x01, 0x07],
    keyType: enums.publicKey.ecdsa,
    hash: enums.hash.sha256,
    cipher: enums.symmetric.aes128,
    node: nodeCurves[enums.curve.brainpoolP256r1],
    payloadSize: 32,
    wireFormatLeadingByte: 0x04
  },
  [enums.curve.brainpoolP384r1]: {
    oid: [0x06, 0x09, 0x2B, 0x24, 0x03, 0x03, 0x02, 0x08, 0x01, 0x01, 0x0B],
    keyType: enums.publicKey.ecdsa,
    hash: enums.hash.sha384,
    cipher: enums.symmetric.aes192,
    node: nodeCurves[enums.curve.brainpoolP384r1],
    payloadSize: 48,
    wireFormatLeadingByte: 0x04
  },
  [enums.curve.brainpoolP512r1]: {
    oid: [0x06, 0x09, 0x2B, 0x24, 0x03, 0x03, 0x02, 0x08, 0x01, 0x01, 0x0D],
    keyType: enums.publicKey.ecdsa,
    hash: enums.hash.sha512,
    cipher: enums.symmetric.aes256,
    node: nodeCurves[enums.curve.brainpoolP512r1],
    payloadSize: 64,
    wireFormatLeadingByte: 0x04
  }
};

class CurveWithOID {
  constructor(oidOrName) {
    try {
      this.name = oidOrName instanceof OID ?
        oidOrName.getName() :
        enums.write(enums.curve,oidOrName);
    } catch (err) {
      throw new UnsupportedError('Unknown curve');
    }
    const params = curves[this.name];

    this.keyType = params.keyType;

    this.oid = params.oid;
    this.hash = params.hash;
    this.cipher = params.cipher;
    this.node = params.node;
    this.web = params.web;
    this.payloadSize = params.payloadSize;
    this.sharedSize = params.sharedSize;
    this.wireFormatLeadingByte = params.wireFormatLeadingByte;
    if (this.web && util.getWebCrypto()) {
      this.type = 'web';
    } else if (this.node && util.getNodeCrypto()) {
      this.type = 'node';
    } else if (this.name === enums.curve.curve25519Legacy) {
      this.type = 'curve25519Legacy';
    } else if (this.name === enums.curve.ed25519Legacy) {
      this.type = 'ed25519Legacy';
    }
  }

  async genKeyPair() {
    switch (this.type) {
      case 'web':
        try {
          return await webGenKeyPair(this.name, this.wireFormatLeadingByte);
        } catch (err) {
          util.printDebugError('Browser did not support generating ec key ' + err.message);
          return jsGenKeyPair(this.name);
        }
      case 'node':
        return nodeGenKeyPair(this.name);
      case 'curve25519Legacy': {
        // the private key must be stored in big endian and already clamped: https://www.ietf.org/archive/id/draft-ietf-openpgp-crypto-refresh-13.html#section-5.5.5.6.1.1-3
        const { k, A } = await generate$2(enums.publicKey.x25519);
        const privateKey = k.slice().reverse();
        privateKey[0] = (privateKey[0] & 127) | 64;
        privateKey[31] &= 248;
        const publicKey = util.concatUint8Array([new Uint8Array([this.wireFormatLeadingByte]), A]);
        return { publicKey, privateKey };
      }
      case 'ed25519Legacy': {
        const { seed: privateKey, A } = await generate$3(enums.publicKey.ed25519);
        const publicKey = util.concatUint8Array([new Uint8Array([this.wireFormatLeadingByte]), A]);
        return { publicKey, privateKey };
      }
      default:
        return jsGenKeyPair(this.name);
    }
  }
}

async function generate$1(curveName) {
  const curve = new CurveWithOID(curveName);
  const { oid, hash, cipher } = curve;
  const keyPair = await curve.genKeyPair();
  return {
    oid,
    Q: keyPair.publicKey,
    secret: util.leftPad(keyPair.privateKey, curve.payloadSize),
    hash,
    cipher
  };
}

/**
 * Get preferred hash algo to use with the given curve
 * @param {module:type/oid} oid - curve oid
 * @returns {enums.hash} hash algorithm
 */
function getPreferredHashAlgo$1(oid) {
  return curves[oid.getName()].hash;
}

/**
 * Validate ECDH and ECDSA parameters
 * Not suitable for EdDSA (different secret key format)
 * @param {module:enums.publicKey} algo - EC algorithm, to filter supported curves
 * @param {module:type/oid} oid - EC object identifier
 * @param {Uint8Array} Q - EC public point
 * @param {Uint8Array} d - EC secret scalar
 * @returns {Promise<Boolean>} Whether params are valid.
 * @async
 */
async function validateStandardParams(algo, oid, Q, d) {
  const supportedCurves = {
    [enums.curve.nistP256]: true,
    [enums.curve.nistP384]: true,
    [enums.curve.nistP521]: true,
    [enums.curve.secp256k1]: true,
    [enums.curve.curve25519Legacy]: algo === enums.publicKey.ecdh,
    [enums.curve.brainpoolP256r1]: true,
    [enums.curve.brainpoolP384r1]: true,
    [enums.curve.brainpoolP512r1]: true
  };

  // Check whether the given curve is supported
  const curveName = oid.getName();
  if (!supportedCurves[curveName]) {
    return false;
  }

  if (curveName === enums.curve.curve25519Legacy) {
    d = d.slice().reverse();
    // Re-derive public point Q'
    const { publicKey } = nacl.box.keyPair.fromSecretKey(d);

    Q = new Uint8Array(Q);
    const dG = new Uint8Array([0x40, ...publicKey]); // Add public key prefix
    if (!util.equalsUint8Array(dG, Q)) {
      return false;
    }

    return true;
  }

  const nobleCurve = await util.getNobleCurve(enums.publicKey.ecdsa, curveName); // excluding curve25519Legacy, ecdh and ecdsa use the same curves
  /*
   * Re-derive public point Q' = dG from private key
   * Expect Q == Q'
   */
  const dG = nobleCurve.getPublicKey(d, false);
  if (!util.equalsUint8Array(dG, Q)) {
    return false;
  }

  return true;
}

/**
 * Check whether the public point has a valid encoding.
 * NB: this function does not check e.g. whether the point belongs to the curve.
 */
function checkPublicPointEnconding(curve, V) {
  const { payloadSize, wireFormatLeadingByte, name: curveName } = curve;

  const pointSize = (curveName === enums.curve.curve25519Legacy || curveName === enums.curve.ed25519Legacy) ? payloadSize : payloadSize * 2;

  if (V[0] !== wireFormatLeadingByte || V.length !== pointSize + 1) {
    throw new Error('Invalid point encoding');
  }
}

//////////////////////////
//                      //
//   Helper functions   //
//                      //
//////////////////////////
async function jsGenKeyPair(name) {
  const nobleCurve = await util.getNobleCurve(enums.publicKey.ecdsa, name); // excluding curve25519Legacy, ecdh and ecdsa use the same curves
  const privateKey = nobleCurve.utils.randomPrivateKey();
  const publicKey = nobleCurve.getPublicKey(privateKey, false);
  return { publicKey, privateKey };
}

async function webGenKeyPair(name, wireFormatLeadingByte) {
  // Note: keys generated with ECDSA and ECDH are structurally equivalent
  const webCryptoKey = await webCrypto$6.generateKey({ name: 'ECDSA', namedCurve: webCurves[name] }, true, ['sign', 'verify']);

  const privateKey = await webCrypto$6.exportKey('jwk', webCryptoKey.privateKey);
  const publicKey = await webCrypto$6.exportKey('jwk', webCryptoKey.publicKey);

  return {
    publicKey: jwkToRawPublic(publicKey, wireFormatLeadingByte),
    privateKey: b64ToUint8Array(privateKey.d)
  };
}

async function nodeGenKeyPair(name) {
  // Note: ECDSA and ECDH key generation is structurally equivalent
  const ecdh = nodeCrypto$6.createECDH(nodeCurves[name]);
  await ecdh.generateKeys();
  return {
    publicKey: new Uint8Array(ecdh.getPublicKey()),
    privateKey: new Uint8Array(ecdh.getPrivateKey())
  };
}

//////////////////////////
//                      //
//   Helper functions   //
//                      //
//////////////////////////

/**
 * @param {JsonWebKey} jwk - key for conversion
 *
 * @returns {Uint8Array} Raw public key.
 */
function jwkToRawPublic(jwk, wireFormatLeadingByte) {
  const bufX = b64ToUint8Array(jwk.x);
  const bufY = b64ToUint8Array(jwk.y);
  const publicKey = new Uint8Array(bufX.length + bufY.length + 1);
  publicKey[0] = wireFormatLeadingByte;
  publicKey.set(bufX, 1);
  publicKey.set(bufY, bufX.length + 1);
  return publicKey;
}

/**
 * @param {Integer} payloadSize - ec payload size
 * @param {String} name - curve name
 * @param {Uint8Array} publicKey - public key
 *
 * @returns {JsonWebKey} Public key in jwk format.
 */
function rawPublicToJWK(payloadSize, name, publicKey) {
  const len = payloadSize;
  const bufX = publicKey.slice(1, len + 1);
  const bufY = publicKey.slice(len + 1, len * 2 + 1);
  // https://www.rfc-editor.org/rfc/rfc7518.txt
  const jwk = {
    kty: 'EC',
    crv: name,
    x: uint8ArrayToB64(bufX),
    y: uint8ArrayToB64(bufY),
    ext: true
  };
  return jwk;
}

/**
 * @param {Integer} payloadSize - ec payload size
 * @param {String} name - curve name
 * @param {Uint8Array} publicKey - public key
 * @param {Uint8Array} privateKey - private key
 *
 * @returns {JsonWebKey} Private key in jwk format.
 */
function privateToJWK(payloadSize, name, publicKey, privateKey) {
  const jwk = rawPublicToJWK(payloadSize, name, publicKey);
  jwk.d = uint8ArrayToB64(privateKey);
  return jwk;
}

// OpenPGP.js - An OpenPGP implementation in javascript
// Copyright (C) 2015-2016 Decentral
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


const webCrypto$5 = util.getWebCrypto();
const nodeCrypto$5 = util.getNodeCrypto();

/**
 * Sign a message using the provided key
 * @param {module:type/oid} oid - Elliptic curve object identifier
 * @param {module:enums.hash} hashAlgo - Hash algorithm used to sign
 * @param {Uint8Array} message - Message to sign
 * @param {Uint8Array} publicKey - Public key
 * @param {Uint8Array} privateKey - Private key used to sign the message
 * @param {Uint8Array} hashed - The hashed message
 * @returns {Promise<{
 *   r: Uint8Array,
 *   s: Uint8Array
 * }>} Signature of the message
 * @async
 */
async function sign$4(oid, hashAlgo, message, publicKey, privateKey, hashed) {
  const curve = new CurveWithOID(oid);
  checkPublicPointEnconding(curve, publicKey);
  if (message && !util.isStream(message)) {
    const keyPair = { publicKey, privateKey };
    switch (curve.type) {
      case 'web':
        // If browser doesn't support a curve, we'll catch it
        try {
          // Need to await to make sure browser succeeds
          return await webSign(curve, hashAlgo, message, keyPair);
        } catch (err) {
          // We do not fallback if the error is related to key integrity
          // Unfortunaley Safari does not support nistP521 and throws a DataError when using it
          // So we need to always fallback for that curve
          if (curve.name !== 'nistP521' && (err.name === 'DataError' || err.name === 'OperationError')) {
            throw err;
          }
          util.printDebugError('Browser did not support signing: ' + err.message);
        }
        break;
      case 'node':
        return nodeSign(curve, hashAlgo, message, privateKey);
    }
  }

  const nobleCurve = await util.getNobleCurve(enums.publicKey.ecdsa, curve.name);
  // lowS: non-canonical sig: https://stackoverflow.com/questions/74338846/ecdsa-signature-verification-mismatch
  const signature = nobleCurve.sign(hashed, privateKey, { lowS: false });
  return {
    r: bigIntToUint8Array(signature.r, 'be', curve.payloadSize),
    s: bigIntToUint8Array(signature.s, 'be', curve.payloadSize)
  };
}

/**
 * Verifies if a signature is valid for a message
 * @param {module:type/oid} oid - Elliptic curve object identifier
 * @param {module:enums.hash} hashAlgo - Hash algorithm used in the signature
 * @param  {{r: Uint8Array,
             s: Uint8Array}}   signature Signature to verify
 * @param {Uint8Array} message - Message to verify
 * @param {Uint8Array} publicKey - Public key used to verify the message
 * @param {Uint8Array} hashed - The hashed message
 * @returns {Boolean}
 * @async
 */
async function verify$4(oid, hashAlgo, signature, message, publicKey, hashed) {
  const curve = new CurveWithOID(oid);
  checkPublicPointEnconding(curve, publicKey);
  // See https://github.com/openpgpjs/openpgpjs/pull/948.
  // NB: the impact was more likely limited to Brainpool curves, since thanks
  // to WebCrypto availability, NIST curve should not have been affected.
  // Similarly, secp256k1 should have been used rarely enough.
  // However, we implement the fix for all curves, since it's only needed in case of
  // verification failure, which is unexpected, hence a minor slowdown is acceptable.
  const tryFallbackVerificationForOldBug = async () => (
    hashed[0] === 0 ?
      jsVerify(curve, signature, hashed.subarray(1), publicKey) :
      false
  );

  if (message && !util.isStream(message)) {
    switch (curve.type) {
      case 'web':
        try {
          // Need to await to make sure browser succeeds
          const verified = await webVerify(curve, hashAlgo, signature, message, publicKey);
          return verified || tryFallbackVerificationForOldBug();
        } catch (err) {
          // We do not fallback if the error is related to key integrity
          // Unfortunately Safari does not support nistP521 and throws a DataError when using it
          // So we need to always fallback for that curve
          if (curve.name !== 'nistP521' && (err.name === 'DataError' || err.name === 'OperationError')) {
            throw err;
          }
          util.printDebugError('Browser did not support verifying: ' + err.message);
        }
        break;
      case 'node': {
        const verified = await nodeVerify(curve, hashAlgo, signature, message, publicKey);
        return verified || tryFallbackVerificationForOldBug();
      }
    }
  }

  const verified = await jsVerify(curve, signature, hashed, publicKey);
  return verified || tryFallbackVerificationForOldBug();
}

/**
 * Validate ECDSA parameters
 * @param {module:type/oid} oid - Elliptic curve object identifier
 * @param {Uint8Array} Q - ECDSA public point
 * @param {Uint8Array} d - ECDSA secret scalar
 * @returns {Promise<Boolean>} Whether params are valid.
 * @async
 */
async function validateParams$4(oid, Q, d) {
  const curve = new CurveWithOID(oid);
  // Reject curves x25519 and ed25519
  if (curve.keyType !== enums.publicKey.ecdsa) {
    return false;
  }

  // To speed up the validation, we try to use node- or webcrypto when available
  // and sign + verify a random message
  switch (curve.type) {
    case 'web':
    case 'node': {
      const message = getRandomBytes(8);
      const hashAlgo = enums.hash.sha256;
      const hashed = await computeDigest(hashAlgo, message);
      try {
        const signature = await sign$4(oid, hashAlgo, message, Q, d, hashed);
        // eslint-disable-next-line @typescript-eslint/return-await
        return await verify$4(oid, hashAlgo, signature, message, Q, hashed);
      } catch (err) {
        return false;
      }
    }
    default:
      return validateStandardParams(enums.publicKey.ecdsa, oid, Q, d);
  }
}


//////////////////////////
//                      //
//   Helper functions   //
//                      //
//////////////////////////

/**
 * Fallback javascript implementation of ECDSA verification.
 * To be used if no native implementation is available for the given curve/operation.
 */
async function jsVerify(curve, signature, hashed, publicKey) {
  const nobleCurve = await util.getNobleCurve(enums.publicKey.ecdsa, curve.name);
  // lowS: non-canonical sig: https://stackoverflow.com/questions/74338846/ecdsa-signature-verification-mismatch
  return nobleCurve.verify(util.concatUint8Array([signature.r, signature.s]), hashed, publicKey, { lowS: false });
}

async function webSign(curve, hashAlgo, message, keyPair) {
  const len = curve.payloadSize;
  const jwk = privateToJWK(curve.payloadSize, webCurves[curve.name], keyPair.publicKey, keyPair.privateKey);
  const key = await webCrypto$5.importKey(
    'jwk',
    jwk,
    {
      'name': 'ECDSA',
      'namedCurve': webCurves[curve.name],
      'hash': { name: enums.read(enums.webHash, curve.hash) }
    },
    false,
    ['sign']
  );

  const signature = new Uint8Array(await webCrypto$5.sign(
    {
      'name': 'ECDSA',
      'namedCurve': webCurves[curve.name],
      'hash': { name: enums.read(enums.webHash, hashAlgo) }
    },
    key,
    message
  ));

  return {
    r: signature.slice(0, len),
    s: signature.slice(len, len << 1)
  };
}

async function webVerify(curve, hashAlgo, { r, s }, message, publicKey) {
  const jwk = rawPublicToJWK(curve.payloadSize, webCurves[curve.name], publicKey);
  const key = await webCrypto$5.importKey(
    'jwk',
    jwk,
    {
      'name': 'ECDSA',
      'namedCurve': webCurves[curve.name],
      'hash': { name: enums.read(enums.webHash, curve.hash) }
    },
    false,
    ['verify']
  );

  const signature = util.concatUint8Array([r, s]).buffer;

  return webCrypto$5.verify(
    {
      'name': 'ECDSA',
      'namedCurve': webCurves[curve.name],
      'hash': { name: enums.read(enums.webHash, hashAlgo) }
    },
    key,
    signature,
    message
  );
}

async function nodeSign(curve, hashAlgo, message, privateKey) {
  // JWT encoding cannot be used for now, as Brainpool curves are not supported
  const ecKeyUtils = util.nodeRequire('eckey-utils');
  const nodeBuffer = util.getNodeBuffer();
  const { privateKey: derPrivateKey } = ecKeyUtils.generateDer({
    curveName: nodeCurves[curve.name],
    privateKey: nodeBuffer.from(privateKey)
  });

  const sign = nodeCrypto$5.createSign(enums.read(enums.hash, hashAlgo));
  sign.write(message);
  sign.end();

  const signature = new Uint8Array(sign.sign({ key: derPrivateKey, format: 'der', type: 'sec1', dsaEncoding: 'ieee-p1363' }));
  const len = curve.payloadSize;

  return {
    r: signature.subarray(0, len),
    s: signature.subarray(len, len << 1)
  };
}

async function nodeVerify(curve, hashAlgo, { r, s }, message, publicKey) {
  const ecKeyUtils = util.nodeRequire('eckey-utils');
  const nodeBuffer = util.getNodeBuffer();
  const { publicKey: derPublicKey } = ecKeyUtils.generateDer({
    curveName: nodeCurves[curve.name],
    publicKey: nodeBuffer.from(publicKey)
  });

  const verify = nodeCrypto$5.createVerify(enums.read(enums.hash, hashAlgo));
  verify.write(message);
  verify.end();

  const signature = util.concatUint8Array([r, s]);

  try {
    return verify.verify({ key: derPublicKey, format: 'der', type: 'spki', dsaEncoding: 'ieee-p1363' }, signature);
  } catch (err) {
    return false;
  }
}

var ecdsa = /*#__PURE__*/Object.freeze({
  __proto__: null,
  sign: sign$4,
  validateParams: validateParams$4,
  verify: verify$4
});

// OpenPGP.js - An OpenPGP implementation in javascript
// Copyright (C) 2018 Proton Technologies AG
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


/**
 * Sign a message using the provided legacy EdDSA key
 * @param {module:type/oid} oid - Elliptic curve object identifier
 * @param {module:enums.hash} hashAlgo - Hash algorithm used to sign (must be sha256 or stronger)
 * @param {Uint8Array} message - Message to sign
 * @param {Uint8Array} publicKey - Public key
 * @param {Uint8Array} privateKey - Private key used to sign the message
 * @param {Uint8Array} hashed - The hashed message
 * @returns {Promise<{
 *   r: Uint8Array,
 *   s: Uint8Array
 * }>} Signature of the message
 * @async
 */
async function sign$3(oid, hashAlgo, message, publicKey, privateKey, hashed) {
  const curve = new CurveWithOID(oid);
  checkPublicPointEnconding(curve, publicKey);
  if (getHashByteLength(hashAlgo) < getHashByteLength(enums.hash.sha256)) {
    // Enforce digest sizes, since the constraint was already present in RFC4880bis:
    // see https://tools.ietf.org/id/draft-ietf-openpgp-rfc4880bis-10.html#section-15-7.2
    // and https://www.rfc-editor.org/rfc/rfc9580.html#section-5.2.3.3-3
    throw new Error('Hash algorithm too weak for EdDSA.');
  }
  const { RS: signature } = await sign$5(enums.publicKey.ed25519, hashAlgo, message, publicKey.subarray(1), privateKey, hashed);
  // EdDSA signature params are returned in little-endian format
  return {
    r: signature.subarray(0, 32),
    s: signature.subarray(32)
  };
}

/**
 * Verifies if a legacy EdDSA signature is valid for a message
 * @param {module:type/oid} oid - Elliptic curve object identifier
 * @param {module:enums.hash} hashAlgo - Hash algorithm used in the signature
 * @param  {{r: Uint8Array,
             s: Uint8Array}}   signature Signature to verify the message
 * @param {Uint8Array} m - Message to verify
 * @param {Uint8Array} publicKey - Public key used to verify the message
 * @param {Uint8Array} hashed - The hashed message
 * @returns {Boolean}
 * @async
 */
async function verify$3(oid, hashAlgo, { r, s }, m, publicKey, hashed) {
  const curve = new CurveWithOID(oid);
  checkPublicPointEnconding(curve, publicKey);
  if (getHashByteLength(hashAlgo) < getHashByteLength(enums.hash.sha256)) {
    // Enforce digest sizes, since the constraint was already present in RFC4880bis:
    // see https://tools.ietf.org/id/draft-ietf-openpgp-rfc4880bis-10.html#section-15-7.2
    // and https://www.rfc-editor.org/rfc/rfc9580.html#section-5.2.3.3-3
    throw new Error('Hash algorithm too weak for EdDSA.');
  }
  const RS = util.concatUint8Array([r, s]);
  return verify$5(enums.publicKey.ed25519, hashAlgo, { RS }, m, publicKey.subarray(1), hashed);
}
/**
 * Validate legacy EdDSA parameters
 * @param {module:type/oid} oid - Elliptic curve object identifier
 * @param {Uint8Array} Q - EdDSA public point
 * @param {Uint8Array} k - EdDSA secret seed
 * @returns {Promise<Boolean>} Whether params are valid.
 * @async
 */
async function validateParams$3(oid, Q, k) {
  // Check whether the given curve is supported
  if (oid.getName() !== enums.curve.ed25519Legacy) {
    return false;
  }

  /**
   * Derive public point Q' = dG from private key
   * and expect Q == Q'
   */
  const { publicKey } = nacl.sign.keyPair.fromSeed(k);
  const dG = new Uint8Array([0x40, ...publicKey]); // Add public key prefix
  return util.equalsUint8Array(Q, dG);

}

var eddsa_legacy = /*#__PURE__*/Object.freeze({
  __proto__: null,
  sign: sign$3,
  validateParams: validateParams$3,
  verify: verify$3
});

// OpenPGP.js - An OpenPGP implementation in javascript
// Copyright (C) 2015-2016 Decentral
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


/**
 * @fileoverview Functions to add and remove PKCS5 padding
 * @see PublicKeyEncryptedSessionKeyPacket
 * @module crypto/pkcs5
 * @private
 */

/**
 * Add pkcs5 padding to a message
 * @param {Uint8Array} message - message to pad
 * @returns {Uint8Array} Padded message.
 */
function encode(message) {
  const c = 8 - (message.length % 8);
  const padded = new Uint8Array(message.length + c).fill(c);
  padded.set(message);
  return padded;
}

/**
 * Remove pkcs5 padding from a message
 * @param {Uint8Array} message - message to remove padding from
 * @returns {Uint8Array} Message without padding.
 */
function decode(message) {
  const len = message.length;
  if (len > 0) {
    const c = message[len - 1];
    if (c >= 1) {
      const provided = message.subarray(len - c);
      const computed = new Uint8Array(c).fill(c);
      if (util.equalsUint8Array(provided, computed)) {
        return message.subarray(0, len - c);
      }
    }
  }
  throw new Error('Invalid padding');
}

// OpenPGP.js - An OpenPGP implementation in javascript
// Copyright (C) 2015-2016 Decentral
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


const webCrypto$4 = util.getWebCrypto();
const nodeCrypto$4 = util.getNodeCrypto();

/**
 * Validate ECDH parameters
 * @param {module:type/oid} oid - Elliptic curve object identifier
 * @param {Uint8Array} Q - ECDH public point
 * @param {Uint8Array} d - ECDH secret scalar
 * @returns {Promise<Boolean>} Whether params are valid.
 * @async
 */
async function validateParams$2(oid, Q, d) {
  return validateStandardParams(enums.publicKey.ecdh, oid, Q, d);
}

// Build Param for ECDH algorithm (RFC 6637)
function buildEcdhParam(public_algo, oid, kdfParams, fingerprint) {
  return util.concatUint8Array([
    oid.write(),
    new Uint8Array([public_algo]),
    kdfParams.write(),
    util.stringToUint8Array('Anonymous Sender    '),
    fingerprint
  ]);
}

// Key Derivation Function (RFC 6637)
async function kdf(hashAlgo, X, length, param, stripLeading = false, stripTrailing = false) {
  // Note: X is little endian for Curve25519, big-endian for all others.
  // This is not ideal, but the RFC's are unclear
  // https://tools.ietf.org/html/draft-ietf-openpgp-rfc4880bis-02#appendix-B
  let i;
  if (stripLeading) {
    // Work around old go crypto bug
    for (i = 0; i < X.length && X[i] === 0; i++);
    X = X.subarray(i);
  }
  if (stripTrailing) {
    // Work around old OpenPGP.js bug
    for (i = X.length - 1; i >= 0 && X[i] === 0; i--);
    X = X.subarray(0, i + 1);
  }
  const digest = await computeDigest(hashAlgo, util.concatUint8Array([
    new Uint8Array([0, 0, 0, 1]),
    X,
    param
  ]));
  return digest.subarray(0, length);
}

/**
 * Generate ECDHE ephemeral key and secret from public key
 *
 * @param {CurveWithOID} curve - Elliptic curve object
 * @param {Uint8Array} Q - Recipient public key
 * @returns {Promise<{publicKey: Uint8Array, sharedKey: Uint8Array}>}
 * @async
 */
async function genPublicEphemeralKey(curve, Q) {
  switch (curve.type) {
    case 'curve25519Legacy': {
      const { sharedSecret: sharedKey, ephemeralPublicKey } = await generateEphemeralEncryptionMaterial(enums.publicKey.x25519, Q.subarray(1));
      const publicKey = util.concatUint8Array([new Uint8Array([curve.wireFormatLeadingByte]), ephemeralPublicKey]);
      return { publicKey, sharedKey }; // Note: sharedKey is little-endian here, unlike below
    }
    case 'web':
      if (curve.web && util.getWebCrypto()) {
        try {
          return await webPublicEphemeralKey(curve, Q);
        } catch (err) {
          util.printDebugError(err);
          return jsPublicEphemeralKey(curve, Q);
        }
      }
      break;
    case 'node':
      return nodePublicEphemeralKey(curve, Q);
    default:
      return jsPublicEphemeralKey(curve, Q);

  }
}

/**
 * Encrypt and wrap a session key
 *
 * @param {module:type/oid} oid - Elliptic curve object identifier
 * @param {module:type/kdf_params} kdfParams - KDF params including cipher and algorithm to use
 * @param {Uint8Array} data - Unpadded session key data
 * @param {Uint8Array} Q - Recipient public key
 * @param {Uint8Array} fingerprint - Recipient fingerprint, already truncated depending on the key version
 * @returns {Promise<{publicKey: Uint8Array, wrappedKey: Uint8Array}>}
 * @async
 */
async function encrypt$2(oid, kdfParams, data, Q, fingerprint) {
  const m = encode(data);

  const curve = new CurveWithOID(oid);
  checkPublicPointEnconding(curve, Q);
  const { publicKey, sharedKey } = await genPublicEphemeralKey(curve, Q);
  const param = buildEcdhParam(enums.publicKey.ecdh, oid, kdfParams, fingerprint);
  const { keySize } = getCipherParams(kdfParams.cipher);
  const Z = await kdf(kdfParams.hash, sharedKey, keySize, param);
  const wrappedKey = await wrap(kdfParams.cipher, Z, m);
  return { publicKey, wrappedKey };
}

/**
 * Generate ECDHE secret from private key and public part of ephemeral key
 *
 * @param {CurveWithOID} curve - Elliptic curve object
 * @param {Uint8Array} V - Public part of ephemeral key
 * @param {Uint8Array} Q - Recipient public key
 * @param {Uint8Array} d - Recipient private key
 * @returns {Promise<{secretKey: Uint8Array, sharedKey: Uint8Array}>}
 * @async
 */
async function genPrivateEphemeralKey(curve, V, Q, d) {
  if (d.length !== curve.payloadSize) {
    const privateKey = new Uint8Array(curve.payloadSize);
    privateKey.set(d, curve.payloadSize - d.length);
    d = privateKey;
  }
  switch (curve.type) {
    case 'curve25519Legacy': {
      const secretKey = d.slice().reverse();
      const sharedKey = await recomputeSharedSecret(enums.publicKey.x25519, V.subarray(1), Q.subarray(1), secretKey);
      return { secretKey, sharedKey }; // Note: sharedKey is little-endian here, unlike below
    }
    case 'web':
      if (curve.web && util.getWebCrypto()) {
        try {
          return await webPrivateEphemeralKey(curve, V, Q, d);
        } catch (err) {
          util.printDebugError(err);
          return jsPrivateEphemeralKey(curve, V, d);
        }
      }
      break;
    case 'node':
      return nodePrivateEphemeralKey(curve, V, d);
    default:
      return jsPrivateEphemeralKey(curve, V, d);
  }
}

/**
 * Decrypt and unwrap the value derived from session key
 *
 * @param {module:type/oid} oid - Elliptic curve object identifier
 * @param {module:type/kdf_params} kdfParams - KDF params including cipher and algorithm to use
 * @param {Uint8Array} V - Public part of ephemeral key
 * @param {Uint8Array} C - Encrypted and wrapped value derived from session key
 * @param {Uint8Array} Q - Recipient public key
 * @param {Uint8Array} d - Recipient private key
 * @param {Uint8Array} fingerprint - Recipient fingerprint, already truncated depending on the key version
 * @returns {Promise<Uint8Array>} Value derived from session key.
 * @async
 */
async function decrypt$2(oid, kdfParams, V, C, Q, d, fingerprint) {
  const curve = new CurveWithOID(oid);
  checkPublicPointEnconding(curve, Q);
  checkPublicPointEnconding(curve, V);
  const { sharedKey } = await genPrivateEphemeralKey(curve, V, Q, d);
  const param = buildEcdhParam(enums.publicKey.ecdh, oid, kdfParams, fingerprint);
  const { keySize } = getCipherParams(kdfParams.cipher);
  let err;
  for (let i = 0; i < 3; i++) {
    try {
      // Work around old go crypto bug and old OpenPGP.js bug, respectively.
      const Z = await kdf(kdfParams.hash, sharedKey, keySize, param, i === 1, i === 2);
      return decode(await unwrap(kdfParams.cipher, Z, C));
    } catch (e) {
      err = e;
    }
  }
  throw err;
}

async function jsPrivateEphemeralKey(curve, V, d) {
  const nobleCurve = await util.getNobleCurve(enums.publicKey.ecdh, curve.name);
  // The output includes parity byte
  const sharedSecretWithParity = nobleCurve.getSharedSecret(d, V);
  const sharedKey = sharedSecretWithParity.subarray(1);
  return { secretKey: d, sharedKey };
}

async function jsPublicEphemeralKey(curve, Q) {
  const nobleCurve = await util.getNobleCurve(enums.publicKey.ecdh, curve.name);
  const { publicKey: V, privateKey: v } = await curve.genKeyPair();

  // The output includes parity byte
  const sharedSecretWithParity = nobleCurve.getSharedSecret(v, Q);
  const sharedKey = sharedSecretWithParity.subarray(1);
  return { publicKey: V, sharedKey };
}

/**
 * Generate ECDHE secret from private key and public part of ephemeral key using webCrypto
 *
 * @param {CurveWithOID} curve - Elliptic curve object
 * @param {Uint8Array} V - Public part of ephemeral key
 * @param {Uint8Array} Q - Recipient public key
 * @param {Uint8Array} d - Recipient private key
 * @returns {Promise<{secretKey: Uint8Array, sharedKey: Uint8Array}>}
 * @async
 */
async function webPrivateEphemeralKey(curve, V, Q, d) {
  const recipient = privateToJWK(curve.payloadSize, curve.web, Q, d);
  let privateKey = webCrypto$4.importKey(
    'jwk',
    recipient,
    {
      name: 'ECDH',
      namedCurve: curve.web
    },
    true,
    ['deriveKey', 'deriveBits']
  );
  const jwk = rawPublicToJWK(curve.payloadSize, curve.web, V);
  let sender = webCrypto$4.importKey(
    'jwk',
    jwk,
    {
      name: 'ECDH',
      namedCurve: curve.web
    },
    true,
    []
  );
  [privateKey, sender] = await Promise.all([privateKey, sender]);
  let S = webCrypto$4.deriveBits(
    {
      name: 'ECDH',
      namedCurve: curve.web,
      public: sender
    },
    privateKey,
    curve.sharedSize
  );
  let secret = webCrypto$4.exportKey(
    'jwk',
    privateKey
  );
  [S, secret] = await Promise.all([S, secret]);
  const sharedKey = new Uint8Array(S);
  const secretKey = b64ToUint8Array(secret.d);
  return { secretKey, sharedKey };
}

/**
 * Generate ECDHE ephemeral key and secret from public key using webCrypto
 *
 * @param {CurveWithOID} curve - Elliptic curve object
 * @param {Uint8Array} Q - Recipient public key
 * @returns {Promise<{publicKey: Uint8Array, sharedKey: Uint8Array}>}
 * @async
 */
async function webPublicEphemeralKey(curve, Q) {
  const jwk = rawPublicToJWK(curve.payloadSize, curve.web, Q);
  let keyPair = webCrypto$4.generateKey(
    {
      name: 'ECDH',
      namedCurve: curve.web
    },
    true,
    ['deriveKey', 'deriveBits']
  );
  let recipient = webCrypto$4.importKey(
    'jwk',
    jwk,
    {
      name: 'ECDH',
      namedCurve: curve.web
    },
    false,
    []
  );
  [keyPair, recipient] = await Promise.all([keyPair, recipient]);
  let s = webCrypto$4.deriveBits(
    {
      name: 'ECDH',
      namedCurve: curve.web,
      public: recipient
    },
    keyPair.privateKey,
    curve.sharedSize
  );
  let p = webCrypto$4.exportKey(
    'jwk',
    keyPair.publicKey
  );
  [s, p] = await Promise.all([s, p]);
  const sharedKey = new Uint8Array(s);
  const publicKey = new Uint8Array(jwkToRawPublic(p, curve.wireFormatLeadingByte));
  return { publicKey, sharedKey };
}

/**
 * Generate ECDHE secret from private key and public part of ephemeral key using nodeCrypto
 *
 * @param {CurveWithOID} curve - Elliptic curve object
 * @param {Uint8Array} V - Public part of ephemeral key
 * @param {Uint8Array} d - Recipient private key
 * @returns {Promise<{secretKey: Uint8Array, sharedKey: Uint8Array}>}
 * @async
 */
async function nodePrivateEphemeralKey(curve, V, d) {
  const recipient = nodeCrypto$4.createECDH(curve.node);
  recipient.setPrivateKey(d);
  const sharedKey = new Uint8Array(recipient.computeSecret(V));
  const secretKey = new Uint8Array(recipient.getPrivateKey());
  return { secretKey, sharedKey };
}

/**
 * Generate ECDHE ephemeral key and secret from public key using nodeCrypto
 *
 * @param {CurveWithOID} curve - Elliptic curve object
 * @param {Uint8Array} Q - Recipient public key
 * @returns {Promise<{publicKey: Uint8Array, sharedKey: Uint8Array}>}
 * @async
 */
async function nodePublicEphemeralKey(curve, Q) {
  const sender = nodeCrypto$4.createECDH(curve.node);
  sender.generateKeys();
  const sharedKey = new Uint8Array(sender.computeSecret(Q));
  const publicKey = new Uint8Array(sender.getPublicKey());
  return { publicKey, sharedKey };
}

var ecdh = /*#__PURE__*/Object.freeze({
  __proto__: null,
  decrypt: decrypt$2,
  encrypt: encrypt$2,
  validateParams: validateParams$2
});

// OpenPGP.js - An OpenPGP implementation in javascript
// Copyright (C) 2015-2016 Decentral
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA

var elliptic = /*#__PURE__*/Object.freeze({
  __proto__: null,
  CurveWithOID: CurveWithOID,
  ecdh: ecdh,
  ecdhX: ecdh_x,
  ecdsa: ecdsa,
  eddsa: eddsa,
  eddsaLegacy: eddsa_legacy,
  generate: generate$1,
  getPreferredHashAlgo: getPreferredHashAlgo$1
});

// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


/*
  TODO regarding the hash function, read:
   https://tools.ietf.org/html/rfc4880#section-13.6
   https://tools.ietf.org/html/rfc4880#section-14
*/

const _0n = BigInt(0);
const _1n = BigInt(1);

/**
 * DSA Sign function
 * @param {Integer} hashAlgo
 * @param {Uint8Array} hashed
 * @param {Uint8Array} g
 * @param {Uint8Array} p
 * @param {Uint8Array} q
 * @param {Uint8Array} x
 * @returns {Promise<{ r: Uint8Array, s: Uint8Array }>}
 * @async
 */
async function sign$2(hashAlgo, hashed, g, p, q, x) {
  const _0n = BigInt(0);
  p = uint8ArrayToBigInt(p);
  q = uint8ArrayToBigInt(q);
  g = uint8ArrayToBigInt(g);
  x = uint8ArrayToBigInt(x);

  let k;
  let r;
  let s;
  let t;
  g = mod(g, p);
  x = mod(x, q);
  // If the output size of the chosen hash is larger than the number of
  // bits of q, the hash result is truncated to fit by taking the number
  // of leftmost bits equal to the number of bits of q.  This (possibly
  // truncated) hash function result is treated as a number and used
  // directly in the DSA signature algorithm.
  const h = mod(uint8ArrayToBigInt(hashed.subarray(0, byteLength(q))), q);
  // FIPS-186-4, section 4.6:
  // The values of r and s shall be checked to determine if r = 0 or s = 0.
  // If either r = 0 or s = 0, a new value of k shall be generated, and the
  // signature shall be recalculated. It is extremely unlikely that r = 0
  // or s = 0 if signatures are generated properly.
  while (true) {
    // See Appendix B here: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.186-4.pdf
    k = getRandomBigInteger(_1n, q); // returns in [1, q-1]
    r = mod(modExp(g, k, p), q); // (g**k mod p) mod q
    if (r === _0n) {
      continue;
    }
    const xr = mod(x * r, q);
    t = mod(h + xr, q); // H(m) + x*r mod q
    s = mod(modInv(k, q) * t, q); // k**-1 * (H(m) + x*r) mod q
    if (s === _0n) {
      continue;
    }
    break;
  }
  return {
    r: bigIntToUint8Array(r, 'be', byteLength(p)),
    s: bigIntToUint8Array(s, 'be', byteLength(p))
  };
}

/**
 * DSA Verify function
 * @param {Integer} hashAlgo
 * @param {Uint8Array} r
 * @param {Uint8Array} s
 * @param {Uint8Array} hashed
 * @param {Uint8Array} g
 * @param {Uint8Array} p
 * @param {Uint8Array} q
 * @param {Uint8Array} y
 * @returns {boolean}
 * @async
 */
async function verify$2(hashAlgo, r, s, hashed, g, p, q, y) {
  r = uint8ArrayToBigInt(r);
  s = uint8ArrayToBigInt(s);

  p = uint8ArrayToBigInt(p);
  q = uint8ArrayToBigInt(q);
  g = uint8ArrayToBigInt(g);
  y = uint8ArrayToBigInt(y);

  if (r <= _0n || r >= q ||
      s <= _0n || s >= q) {
    util.printDebug('invalid DSA Signature');
    return false;
  }
  const h = mod(uint8ArrayToBigInt(hashed.subarray(0, byteLength(q))), q);
  const w = modInv(s, q); // s**-1 mod q
  if (w === _0n) {
    util.printDebug('invalid DSA Signature');
    return false;
  }

  g = mod(g, p);
  y = mod(y, p);
  const u1 = mod(h * w, q); // H(m) * w mod q
  const u2 = mod(r * w, q); // r * w mod q
  const t1 = modExp(g, u1, p); // g**u1 mod p
  const t2 = modExp(y, u2, p); // y**u2 mod p
  const v = mod(mod(t1 * t2, p), q); // (g**u1 * y**u2 mod p) mod q
  return v === r;
}

/**
 * Validate DSA parameters
 * @param {Uint8Array} p - DSA prime
 * @param {Uint8Array} q - DSA group order
 * @param {Uint8Array} g - DSA sub-group generator
 * @param {Uint8Array} y - DSA public key
 * @param {Uint8Array} x - DSA private key
 * @returns {Promise<Boolean>} Whether params are valid.
 * @async
 */
async function validateParams$1(p, q, g, y, x) {
  p = uint8ArrayToBigInt(p);
  q = uint8ArrayToBigInt(q);
  g = uint8ArrayToBigInt(g);
  y = uint8ArrayToBigInt(y);
  // Check that 1 < g < p
  if (g <= _1n || g >= p) {
    return false;
  }

  /**
   * Check that subgroup order q divides p-1
   */
  if (mod(p - _1n, q) !== _0n) {
    return false;
  }

  /**
   * g has order q
   * Check that g ** q = 1 mod p
   */
  if (modExp(g, q, p) !== _1n) {
    return false;
  }

  /**
   * Check q is large and probably prime (we mainly want to avoid small factors)
   */
  const qSize = BigInt(bitLength(q));
  const _150n = BigInt(150);
  if (qSize < _150n || !isProbablePrime(q, null, 32)) {
    return false;
  }

  /**
   * Re-derive public key y' = g ** x mod p
   * Expect y == y'
   *
   * Blinded exponentiation computes g**{rq + x} to compare to y
   */
  x = uint8ArrayToBigInt(x);
  const _2n = BigInt(2);
  const r = getRandomBigInteger(_2n << (qSize - _1n), _2n << qSize); // draw r of same size as q
  const rqx = q * r + x;
  if (y !== modExp(g, rqx, p)) {
    return false;
  }

  return true;
}

// OpenPGP.js - An OpenPGP implementation in javascript
// Copyright (C) 2015-2016 Decentral
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


class ECDHSymmetricKey {
  constructor(data) {
    if (data) {
      this.data = data;
    }
  }

  /**
   * Read an ECDHSymmetricKey from an Uint8Array:
   * - 1 octect for the length `l`
   * - `l` octects of encoded session key data
   * @param {Uint8Array} bytes
   * @returns {Number} Number of read bytes.
   */
  read(bytes) {
    if (bytes.length >= 1) {
      const length = bytes[0];
      if (bytes.length >= 1 + length) {
        this.data = bytes.subarray(1, 1 + length);
        return 1 + this.data.length;
      }
    }
    throw new Error('Invalid symmetric key');
  }

  /**
   * Write an ECDHSymmetricKey as an Uint8Array
   * @returns  {Uint8Array} Serialised data
   */
  write() {
    return util.concatUint8Array([new Uint8Array([this.data.length]), this.data]);
  }
}

// OpenPGP.js - An OpenPGP implementation in javascript
// Copyright (C) 2015-2016 Decentral
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


/**
 * Implementation of type KDF parameters
 *
 * {@link https://tools.ietf.org/html/rfc6637#section-7|RFC 6637 7}:
 * A key derivation function (KDF) is necessary to implement the EC
 * encryption.  The Concatenation Key Derivation Function (Approved
 * Alternative 1) [NIST-SP800-56A] with the KDF hash function that is
 * SHA2-256 [FIPS-180-3] or stronger is REQUIRED.
 * @module type/kdf_params
 * @private
 */

class KDFParams {
  /**
   * @param {enums.hash} hash - Hash algorithm
   * @param {enums.symmetric} cipher - Symmetric algorithm
   */
  constructor(data) {
    if (data) {
      const { hash, cipher } = data;
      this.hash = hash;
      this.cipher = cipher;
    } else {
      this.hash = null;
      this.cipher = null;
    }
  }

  /**
   * Read KDFParams from an Uint8Array
   * @param {Uint8Array} input - Where to read the KDFParams from
   * @returns {Number} Number of read bytes.
   */
  read(input) {
    if (input.length < 4 || input[0] !== 3 || input[1] !== 1) {
      throw new UnsupportedError('Cannot read KDFParams');
    }
    this.hash = input[2];
    this.cipher = input[3];
    return 4;
  }

  /**
   * Write KDFParams to an Uint8Array
   * @returns  {Uint8Array}  Array with the KDFParams value
   */
  write() {
    return new Uint8Array([3, 1, this.hash, this.cipher]);
  }
}

/**
 * Encoded symmetric key for x25519 and x448
 * The payload format varies for v3 and v6 PKESK:
 * the former includes an algorithm byte preceeding the encrypted session key.
 *
 * @module type/x25519x448_symkey
 */


class ECDHXSymmetricKey {
  static fromObject({ wrappedKey, algorithm }) {
    const instance = new ECDHXSymmetricKey();
    instance.wrappedKey = wrappedKey;
    instance.algorithm = algorithm;
    return instance;
  }

  /**
   * - 1 octect for the length `l`
   * - `l` octects of encoded session key data (with optional leading algorithm byte)
   * @param {Uint8Array} bytes
   * @returns {Number} Number of read bytes.
   */
  read(bytes) {
    let read = 0;
    let followLength = bytes[read++];
    this.algorithm = followLength % 2 ? bytes[read++] : null; // session key size is always even
    followLength -= followLength % 2;
    this.wrappedKey = util.readExactSubarray(bytes, read, read + followLength); read += followLength;
  }

  /**
   * Write an MontgomerySymmetricKey as an Uint8Array
   * @returns  {Uint8Array} Serialised data
   */
  write() {
    return util.concatUint8Array([
      this.algorithm ?
        new Uint8Array([this.wrappedKey.length + 1, this.algorithm]) :
        new Uint8Array([this.wrappedKey.length]),
      this.wrappedKey
    ]);
  }
}

// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


/**
 * Encrypts data using specified algorithm and public key parameters.
 * See {@link https://tools.ietf.org/html/rfc4880#section-9.1|RFC 4880 9.1} for public key algorithms.
 * @param {module:enums.publicKey} keyAlgo - Public key algorithm
 * @param {module:enums.symmetric|null} symmetricAlgo - Cipher algorithm (v3 only)
 * @param {Object} publicParams - Algorithm-specific public key parameters
 * @param {Uint8Array} data - Session key data to be encrypted
 * @param {Uint8Array} fingerprint - Recipient fingerprint
 * @returns {Promise<Object>} Encrypted session key parameters.
 * @async
 */
async function publicKeyEncrypt(keyAlgo, symmetricAlgo, publicParams, data, fingerprint) {
  switch (keyAlgo) {
    case enums.publicKey.rsaEncrypt:
    case enums.publicKey.rsaEncryptSign: {
      const { n, e } = publicParams;
      const c = await encrypt$6(data, n, e);
      return { c };
    }
    case enums.publicKey.elgamal: {
      const { p, g, y } = publicParams;
      return encrypt$5(data, p, g, y);
    }
    case enums.publicKey.ecdh: {
      const { oid, Q, kdfParams } = publicParams;
      const { publicKey: V, wrappedKey: C } = await encrypt$2(
        oid, kdfParams, data, Q, fingerprint);
      return { V, C: new ECDHSymmetricKey(C) };
    }
    case enums.publicKey.x25519:
    case enums.publicKey.x448: {
      if (symmetricAlgo && !util.isAES(symmetricAlgo)) {
        // see https://gitlab.com/openpgp-wg/rfc4880bis/-/merge_requests/276
        throw new Error('X25519 and X448 keys can only encrypt AES session keys');
      }
      const { A } = publicParams;
      const { ephemeralPublicKey, wrappedKey } = await encrypt$3(
        keyAlgo, data, A);
      const C = ECDHXSymmetricKey.fromObject({ algorithm: symmetricAlgo, wrappedKey });
      return { ephemeralPublicKey, C };
    }
    default:
      return [];
  }
}

/**
 * Decrypts data using specified algorithm and private key parameters.
 * See {@link https://tools.ietf.org/html/rfc4880#section-5.5.3|RFC 4880 5.5.3}
 * @param {module:enums.publicKey} algo - Public key algorithm
 * @param {Object} publicKeyParams - Algorithm-specific public key parameters
 * @param {Object} privateKeyParams - Algorithm-specific private key parameters
 * @param {Object} sessionKeyParams - Encrypted session key parameters
 * @param {Uint8Array} fingerprint - Recipient fingerprint
 * @param {Uint8Array} [randomPayload] - Data to return on decryption error, instead of throwing
 *                                    (needed for constant-time processing in RSA and ElGamal)
 * @returns {Promise<Uint8Array>} Decrypted data.
 * @throws {Error} on sensitive decryption error, unless `randomPayload` is given
 * @async
 */
async function publicKeyDecrypt(algo, publicKeyParams, privateKeyParams, sessionKeyParams, fingerprint, randomPayload) {
  switch (algo) {
    case enums.publicKey.rsaEncryptSign:
    case enums.publicKey.rsaEncrypt: {
      const { c } = sessionKeyParams;
      const { n, e } = publicKeyParams;
      const { d, p, q, u } = privateKeyParams;
      return decrypt$6(c, n, e, d, p, q, u, randomPayload);
    }
    case enums.publicKey.elgamal: {
      const { c1, c2 } = sessionKeyParams;
      const p = publicKeyParams.p;
      const x = privateKeyParams.x;
      return decrypt$5(c1, c2, p, x, randomPayload);
    }
    case enums.publicKey.ecdh: {
      const { oid, Q, kdfParams } = publicKeyParams;
      const { d } = privateKeyParams;
      const { V, C } = sessionKeyParams;
      return decrypt$2(
        oid, kdfParams, V, C.data, Q, d, fingerprint);
    }
    case enums.publicKey.x25519:
    case enums.publicKey.x448: {
      const { A } = publicKeyParams;
      const { k } = privateKeyParams;
      const { ephemeralPublicKey, C } = sessionKeyParams;
      if (C.algorithm !== null && !util.isAES(C.algorithm)) {
        throw new Error('AES session key expected');
      }
      return decrypt$3(
        algo, ephemeralPublicKey, C.wrappedKey, A, k);
    }
    default:
      throw new Error('Unknown public key encryption algorithm.');
  }
}

/**
 * Parse public key material in binary form to get the key parameters
 * @param {module:enums.publicKey} algo - The key algorithm
 * @param {Uint8Array} bytes - The key material to parse
 * @returns {{ read: Number, publicParams: Object }} Number of read bytes plus key parameters referenced by name.
 */
function parsePublicKeyParams(algo, bytes) {
  let read = 0;
  switch (algo) {
    case enums.publicKey.rsaEncrypt:
    case enums.publicKey.rsaEncryptSign:
    case enums.publicKey.rsaSign: {
      const n = util.readMPI(bytes.subarray(read)); read += n.length + 2;
      const e = util.readMPI(bytes.subarray(read)); read += e.length + 2;
      return { read, publicParams: { n, e } };
    }
    case enums.publicKey.dsa: {
      const p = util.readMPI(bytes.subarray(read)); read += p.length + 2;
      const q = util.readMPI(bytes.subarray(read)); read += q.length + 2;
      const g = util.readMPI(bytes.subarray(read)); read += g.length + 2;
      const y = util.readMPI(bytes.subarray(read)); read += y.length + 2;
      return { read, publicParams: { p, q, g, y } };
    }
    case enums.publicKey.elgamal: {
      const p = util.readMPI(bytes.subarray(read)); read += p.length + 2;
      const g = util.readMPI(bytes.subarray(read)); read += g.length + 2;
      const y = util.readMPI(bytes.subarray(read)); read += y.length + 2;
      return { read, publicParams: { p, g, y } };
    }
    case enums.publicKey.ecdsa: {
      const oid = new OID(); read += oid.read(bytes);
      checkSupportedCurve(oid);
      const Q = util.readMPI(bytes.subarray(read)); read += Q.length + 2;
      return { read: read, publicParams: { oid, Q } };
    }
    case enums.publicKey.eddsaLegacy: {
      const oid = new OID(); read += oid.read(bytes);
      checkSupportedCurve(oid);
      if (oid.getName() !== enums.curve.ed25519Legacy) {
        throw new Error('Unexpected OID for eddsaLegacy');
      }
      let Q = util.readMPI(bytes.subarray(read)); read += Q.length + 2;
      Q = util.leftPad(Q, 33);
      return { read: read, publicParams: { oid, Q } };
    }
    case enums.publicKey.ecdh: {
      const oid = new OID(); read += oid.read(bytes);
      checkSupportedCurve(oid);
      const Q = util.readMPI(bytes.subarray(read)); read += Q.length + 2;
      const kdfParams = new KDFParams(); read += kdfParams.read(bytes.subarray(read));
      return { read: read, publicParams: { oid, Q, kdfParams } };
    }
    case enums.publicKey.ed25519:
    case enums.publicKey.ed448:
    case enums.publicKey.x25519:
    case enums.publicKey.x448: {
      const A = util.readExactSubarray(bytes, read, read + getCurvePayloadSize(algo)); read += A.length;
      return { read, publicParams: { A } };
    }
    default:
      throw new UnsupportedError('Unknown public key encryption algorithm.');
  }
}

/**
 * Parse private key material in binary form to get the key parameters
 * @param {module:enums.publicKey} algo - The key algorithm
 * @param {Uint8Array} bytes - The key material to parse
 * @param {Object} publicParams - (ECC only) public params, needed to format some private params
 * @returns {{ read: Number, privateParams: Object }} Number of read bytes plus the key parameters referenced by name.
 */
function parsePrivateKeyParams(algo, bytes, publicParams) {
  let read = 0;
  switch (algo) {
    case enums.publicKey.rsaEncrypt:
    case enums.publicKey.rsaEncryptSign:
    case enums.publicKey.rsaSign: {
      const d = util.readMPI(bytes.subarray(read)); read += d.length + 2;
      const p = util.readMPI(bytes.subarray(read)); read += p.length + 2;
      const q = util.readMPI(bytes.subarray(read)); read += q.length + 2;
      const u = util.readMPI(bytes.subarray(read)); read += u.length + 2;
      return { read, privateParams: { d, p, q, u } };
    }
    case enums.publicKey.dsa:
    case enums.publicKey.elgamal: {
      const x = util.readMPI(bytes.subarray(read)); read += x.length + 2;
      return { read, privateParams: { x } };
    }
    case enums.publicKey.ecdsa:
    case enums.publicKey.ecdh: {
      const payloadSize = getCurvePayloadSize(algo, publicParams.oid);
      let d = util.readMPI(bytes.subarray(read)); read += d.length + 2;
      d = util.leftPad(d, payloadSize);
      return { read, privateParams: { d } };
    }
    case enums.publicKey.eddsaLegacy: {
      const payloadSize = getCurvePayloadSize(algo, publicParams.oid);
      if (publicParams.oid.getName() !== enums.curve.ed25519Legacy) {
        throw new Error('Unexpected OID for eddsaLegacy');
      }
      let seed = util.readMPI(bytes.subarray(read)); read += seed.length + 2;
      seed = util.leftPad(seed, payloadSize);
      return { read, privateParams: { seed } };
    }
    case enums.publicKey.ed25519:
    case enums.publicKey.ed448: {
      const payloadSize = getCurvePayloadSize(algo);
      const seed = util.readExactSubarray(bytes, read, read + payloadSize); read += seed.length;
      return { read, privateParams: { seed } };
    }
    case enums.publicKey.x25519:
    case enums.publicKey.x448: {
      const payloadSize = getCurvePayloadSize(algo);
      const k = util.readExactSubarray(bytes, read, read + payloadSize); read += k.length;
      return { read, privateParams: { k } };
    }
    default:
      throw new UnsupportedError('Unknown public key encryption algorithm.');
  }
}

/** Returns the types comprising the encrypted session key of an algorithm
 * @param {module:enums.publicKey} algo - The key algorithm
 * @param {Uint8Array} bytes - The key material to parse
 * @returns {Object} The session key parameters referenced by name.
 */
function parseEncSessionKeyParams(algo, bytes) {
  let read = 0;
  switch (algo) {
    //   Algorithm-Specific Fields for RSA encrypted session keys:
    //       - MPI of RSA encrypted value m**e mod n.
    case enums.publicKey.rsaEncrypt:
    case enums.publicKey.rsaEncryptSign: {
      const c = util.readMPI(bytes.subarray(read));
      return { c };
    }

    //   Algorithm-Specific Fields for Elgamal encrypted session keys:
    //       - MPI of Elgamal value g**k mod p
    //       - MPI of Elgamal value m * y**k mod p
    case enums.publicKey.elgamal: {
      const c1 = util.readMPI(bytes.subarray(read)); read += c1.length + 2;
      const c2 = util.readMPI(bytes.subarray(read));
      return { c1, c2 };
    }
    //   Algorithm-Specific Fields for ECDH encrypted session keys:
    //       - MPI containing the ephemeral key used to establish the shared secret
    //       - ECDH Symmetric Key
    case enums.publicKey.ecdh: {
      const V = util.readMPI(bytes.subarray(read)); read += V.length + 2;
      const C = new ECDHSymmetricKey(); C.read(bytes.subarray(read));
      return { V, C };
    }
    //   Algorithm-Specific Fields for X25519 or X448 encrypted session keys:
    //       - 32 octets representing an ephemeral X25519 public key (or 57 octets for X448).
    //       - A one-octet size of the following fields.
    //       - The one-octet algorithm identifier, if it was passed (in the case of a v3 PKESK packet).
    //       - The encrypted session key.
    case enums.publicKey.x25519:
    case enums.publicKey.x448: {
      const pointSize = getCurvePayloadSize(algo);
      const ephemeralPublicKey = util.readExactSubarray(bytes, read, read + pointSize); read += ephemeralPublicKey.length;
      const C = new ECDHXSymmetricKey(); C.read(bytes.subarray(read));
      return { ephemeralPublicKey, C };
    }
    default:
      throw new UnsupportedError('Unknown public key encryption algorithm.');
  }
}

/**
 * Convert params to MPI and serializes them in the proper order
 * @param {module:enums.publicKey} algo - The public key algorithm
 * @param {Object} params - The key parameters indexed by name
 * @returns {Uint8Array} The array containing the MPIs.
 */
function serializeParams(algo, params) {
  // Some algorithms do not rely on MPIs to store the binary params
  const algosWithNativeRepresentation = new Set([
    enums.publicKey.ed25519,
    enums.publicKey.x25519,
    enums.publicKey.ed448,
    enums.publicKey.x448
  ]);
  const orderedParams = Object.keys(params).map(name => {
    const param = params[name];
    if (!util.isUint8Array(param)) return param.write();
    return algosWithNativeRepresentation.has(algo) ? param : util.uint8ArrayToMPI(param);
  });
  return util.concatUint8Array(orderedParams);
}

/**
 * Generate algorithm-specific key parameters
 * @param {module:enums.publicKey} algo - The public key algorithm
 * @param {Integer} bits - Bit length for RSA keys
 * @param {module:type/oid} oid - Object identifier for ECC keys
 * @returns {Promise<{ publicParams: {Object}, privateParams: {Object} }>} The parameters referenced by name.
 * @async
 */
function generateParams(algo, bits, oid) {
  switch (algo) {
    case enums.publicKey.rsaEncrypt:
    case enums.publicKey.rsaEncryptSign:
    case enums.publicKey.rsaSign:
      return generate$4(bits, 65537).then(({ n, e, d, p, q, u }) => ({
        privateParams: { d, p, q, u },
        publicParams: { n, e }
      }));
    case enums.publicKey.ecdsa:
      return generate$1(oid).then(({ oid, Q, secret }) => ({
        privateParams: { d: secret },
        publicParams: { oid: new OID(oid), Q }
      }));
    case enums.publicKey.eddsaLegacy:
      return generate$1(oid).then(({ oid, Q, secret }) => ({
        privateParams: { seed: secret },
        publicParams: { oid: new OID(oid), Q }
      }));
    case enums.publicKey.ecdh:
      return generate$1(oid).then(({ oid, Q, secret, hash, cipher }) => ({
        privateParams: { d: secret },
        publicParams: {
          oid: new OID(oid),
          Q,
          kdfParams: new KDFParams({ hash, cipher })
        }
      }));
    case enums.publicKey.ed25519:
    case enums.publicKey.ed448:
      return generate$3(algo).then(({ A, seed }) => ({
        privateParams: { seed },
        publicParams: { A }
      }));
    case enums.publicKey.x25519:
    case enums.publicKey.x448:
      return generate$2(algo).then(({ A, k }) => ({
        privateParams: { k },
        publicParams: { A }
      }));
    case enums.publicKey.dsa:
    case enums.publicKey.elgamal:
      throw new Error('Unsupported algorithm for key generation.');
    default:
      throw new Error('Unknown public key algorithm.');
  }
}

/**
 * Validate algorithm-specific key parameters
 * @param {module:enums.publicKey} algo - The public key algorithm
 * @param {Object} publicParams - Algorithm-specific public key parameters
 * @param {Object} privateParams - Algorithm-specific private key parameters
 * @returns {Promise<Boolean>} Whether the parameters are valid.
 * @async
 */
async function validateParams(algo, publicParams, privateParams) {
  if (!publicParams || !privateParams) {
    throw new Error('Missing key parameters');
  }
  switch (algo) {
    case enums.publicKey.rsaEncrypt:
    case enums.publicKey.rsaEncryptSign:
    case enums.publicKey.rsaSign: {
      const { n, e } = publicParams;
      const { d, p, q, u } = privateParams;
      return validateParams$8(n, e, d, p, q, u);
    }
    case enums.publicKey.dsa: {
      const { p, q, g, y } = publicParams;
      const { x } = privateParams;
      return validateParams$1(p, q, g, y, x);
    }
    case enums.publicKey.elgamal: {
      const { p, g, y } = publicParams;
      const { x } = privateParams;
      return validateParams$7(p, g, y, x);
    }
    case enums.publicKey.ecdsa:
    case enums.publicKey.ecdh: {
      const algoModule = elliptic[enums.read(enums.publicKey, algo)];
      const { oid, Q } = publicParams;
      const { d } = privateParams;
      return algoModule.validateParams(oid, Q, d);
    }
    case enums.publicKey.eddsaLegacy: {
      const { Q, oid } = publicParams;
      const { seed } = privateParams;
      return validateParams$3(oid, Q, seed);
    }
    case enums.publicKey.ed25519:
    case enums.publicKey.ed448: {
      const { A } = publicParams;
      const { seed } = privateParams;
      return validateParams$6(algo, A, seed);
    }
    case enums.publicKey.x25519:
    case enums.publicKey.x448: {
      const { A } = publicParams;
      const { k } = privateParams;
      return validateParams$5(algo, A, k);
    }
    default:
      throw new Error('Unknown public key algorithm.');
  }
}

/**
 * Generating a session key for the specified symmetric algorithm
 * See {@link https://tools.ietf.org/html/rfc4880#section-9.2|RFC 4880 9.2} for algorithms.
 * @param {module:enums.symmetric} algo - Symmetric encryption algorithm
 * @returns {Uint8Array} Random bytes as a string to be used as a key.
 */
function generateSessionKey$1(algo) {
  const { keySize } = getCipherParams(algo);
  return getRandomBytes(keySize);
}

/**
 * Check whether the given curve OID is supported
 * @param {module:type/oid} oid - EC object identifier
 * @throws {UnsupportedError} if curve is not supported
 */
function checkSupportedCurve(oid) {
  try {
    oid.getName();
  } catch (e) {
    throw new UnsupportedError('Unknown curve OID');
  }
}

/**
 * Get encoded secret size for a given elliptic algo
 * @param {module:enums.publicKey} algo - alrogithm identifier
 * @param {module:type/oid} [oid] - curve OID if needed by algo
 */
function getCurvePayloadSize(algo, oid) {
  switch (algo) {
    case enums.publicKey.ecdsa:
    case enums.publicKey.ecdh:
    case enums.publicKey.eddsaLegacy:
      return new CurveWithOID(oid).payloadSize;
    case enums.publicKey.ed25519:
    case enums.publicKey.ed448:
      return getPayloadSize$1(algo);
    case enums.publicKey.x25519:
    case enums.publicKey.x448:
      return getPayloadSize(algo);
    default:
      throw new Error('Unknown elliptic algo');
  }
}

/**
 * Get preferred signing hash algo for a given elliptic algo
 * @param {module:enums.publicKey} algo - alrogithm identifier
 * @param {module:type/oid} [oid] - curve OID if needed by algo
 */
function getPreferredCurveHashAlgo(algo, oid) {
  switch (algo) {
    case enums.publicKey.ecdsa:
    case enums.publicKey.eddsaLegacy:
      return getPreferredHashAlgo$1(oid);
    case enums.publicKey.ed25519:
    case enums.publicKey.ed448:
      return getPreferredHashAlgo$2(algo);
    default:
      throw new Error('Unknown elliptic signing algo');
  }
}

// Modified by ProtonTech AG


const webCrypto$3 = util.getWebCrypto();
const nodeCrypto$3 = util.getNodeCrypto();

const knownAlgos = nodeCrypto$3 ? nodeCrypto$3.getCiphers() : [];
const nodeAlgos = {
  idea: knownAlgos.includes('idea-cfb') ? 'idea-cfb' : undefined, /* Unused, not implemented */
  tripledes: knownAlgos.includes('des-ede3-cfb') ? 'des-ede3-cfb' : undefined,
  cast5: knownAlgos.includes('cast5-cfb') ? 'cast5-cfb' : undefined,
  blowfish: knownAlgos.includes('bf-cfb') ? 'bf-cfb' : undefined,
  aes128: knownAlgos.includes('aes-128-cfb') ? 'aes-128-cfb' : undefined,
  aes192: knownAlgos.includes('aes-192-cfb') ? 'aes-192-cfb' : undefined,
  aes256: knownAlgos.includes('aes-256-cfb') ? 'aes-256-cfb' : undefined
  /* twofish is not implemented in OpenSSL */
};

/**
 * Generates a random byte prefix for the specified algorithm
 * See {@link https://tools.ietf.org/html/rfc4880#section-9.2|RFC 4880 9.2} for algorithms.
 * @param {module:enums.symmetric} algo - Symmetric encryption algorithm
 * @returns {Promise<Uint8Array>} Random bytes with length equal to the block size of the cipher, plus the last two bytes repeated.
 * @async
 */
async function getPrefixRandom(algo) {
  const { blockSize } = getCipherParams(algo);
  const prefixrandom = await getRandomBytes(blockSize);
  const repeat = new Uint8Array([prefixrandom[prefixrandom.length - 2], prefixrandom[prefixrandom.length - 1]]);
  return util.concat([prefixrandom, repeat]);
}

/**
 * CFB encryption
 * @param {enums.symmetric} algo - block cipher algorithm
 * @param {Uint8Array} key
 * @param {MaybeStream<Uint8Array>} plaintext
 * @param {Uint8Array} iv
 * @param {Object} config - full configuration, defaults to openpgp.config
 * @returns MaybeStream<Uint8Array>
 */
async function encrypt$1(algo, key, plaintext, iv, config) {
  const algoName = enums.read(enums.symmetric, algo);
  if (util.getNodeCrypto() && nodeAlgos[algoName]) { // Node crypto library.
    return nodeEncrypt(algo, key, plaintext, iv);
  }
  if (util.isAES(algo)) {
    return aesEncrypt(algo, key, plaintext, iv);
  }

  const LegacyCipher = await getLegacyCipher(algo);
  const cipherfn = new LegacyCipher(key);
  const block_size = cipherfn.blockSize;

  const blockc = iv.slice();
  let pt = new Uint8Array();
  const process = chunk => {
    if (chunk) {
      pt = util.concatUint8Array([pt, chunk]);
    }
    const ciphertext = new Uint8Array(pt.length);
    let i;
    let j = 0;
    while (chunk ? pt.length >= block_size : pt.length) {
      const encblock = cipherfn.encrypt(blockc);
      for (i = 0; i < block_size; i++) {
        blockc[i] = pt[i] ^ encblock[i];
        ciphertext[j++] = blockc[i];
      }
      pt = pt.subarray(block_size);
    }
    return ciphertext.subarray(0, j);
  };
  return transform(plaintext, process, process);
}

/**
 * CFB decryption
 * @param {enums.symmetric} algo - block cipher algorithm
 * @param {Uint8Array} key
 * @param {MaybeStream<Uint8Array>} ciphertext
 * @param {Uint8Array} iv
 * @returns MaybeStream<Uint8Array>
 */
async function decrypt$1(algo, key, ciphertext, iv) {
  const algoName = enums.read(enums.symmetric, algo);
  if (nodeCrypto$3 && nodeAlgos[algoName]) { // Node crypto library.
    return nodeDecrypt(algo, key, ciphertext, iv);
  }
  if (util.isAES(algo)) {
    return aesDecrypt(algo, key, ciphertext, iv);
  }

  const LegacyCipher = await getLegacyCipher(algo);
  const cipherfn = new LegacyCipher(key);
  const block_size = cipherfn.blockSize;

  let blockp = iv;
  let ct = new Uint8Array();
  const process = chunk => {
    if (chunk) {
      ct = util.concatUint8Array([ct, chunk]);
    }
    const plaintext = new Uint8Array(ct.length);
    let i;
    let j = 0;
    while (chunk ? ct.length >= block_size : ct.length) {
      const decblock = cipherfn.encrypt(blockp);
      blockp = ct.subarray(0, block_size);
      for (i = 0; i < block_size; i++) {
        plaintext[j++] = blockp[i] ^ decblock[i];
      }
      ct = ct.subarray(block_size);
    }
    return plaintext.subarray(0, j);
  };
  return transform(ciphertext, process, process);
}

class WebCryptoEncryptor {
  constructor(algo, key, iv) {
    const { blockSize } = getCipherParams(algo);
    this.key = key;
    this.prevBlock = iv;
    this.nextBlock = new Uint8Array(blockSize);
    this.i = 0; // pointer inside next block
    this.blockSize = blockSize;
    this.zeroBlock = new Uint8Array(this.blockSize);
  }

  static async isSupported(algo) {
    const { keySize } = getCipherParams(algo);
    return webCrypto$3.importKey('raw', new Uint8Array(keySize), 'aes-cbc', false, ['encrypt'])
      .then(() => true, () => false);
  }

  async _runCBC(plaintext, nonZeroIV) {
    const mode = 'AES-CBC';
    this.keyRef = this.keyRef || await webCrypto$3.importKey('raw', this.key, mode, false, ['encrypt']);
    const ciphertext = await webCrypto$3.encrypt(
      { name: mode, iv: nonZeroIV || this.zeroBlock },
      this.keyRef,
      plaintext
    );
    return new Uint8Array(ciphertext).subarray(0, plaintext.length);
  }

  async encryptChunk(value) {
    const missing = this.nextBlock.length - this.i;
    const added = value.subarray(0, missing);
    this.nextBlock.set(added, this.i);
    if ((this.i + value.length) >= (2 * this.blockSize)) {
      const leftover = (value.length - missing) % this.blockSize;
      const plaintext = util.concatUint8Array([
        this.nextBlock,
        value.subarray(missing, value.length - leftover)
      ]);
      const toEncrypt = util.concatUint8Array([
        this.prevBlock,
        plaintext.subarray(0, plaintext.length - this.blockSize) // stop one block "early", since we only need to xor the plaintext and pass it over as prevBlock
      ]);

      const encryptedBlocks = await this._runCBC(toEncrypt);
      xorMut$1(encryptedBlocks, plaintext);
      this.prevBlock = encryptedBlocks.slice(-this.blockSize);

      // take care of leftover data
      if (leftover > 0) this.nextBlock.set(value.subarray(-leftover));
      this.i = leftover;

      return encryptedBlocks;
    }

    this.i += added.length;
    let encryptedBlock;
    if (this.i === this.nextBlock.length) { // block ready to be encrypted
      const curBlock = this.nextBlock;
      encryptedBlock = await this._runCBC(this.prevBlock);
      xorMut$1(encryptedBlock, curBlock);
      this.prevBlock = encryptedBlock.slice();
      this.i = 0;

      const remaining = value.subarray(added.length);
      this.nextBlock.set(remaining, this.i);
      this.i += remaining.length;
    } else {
      encryptedBlock = new Uint8Array();
    }

    return encryptedBlock;
  }

  async finish() {
    let result;
    if (this.i === 0) { // nothing more to encrypt
      result = new Uint8Array();
    } else {
      this.nextBlock = this.nextBlock.subarray(0, this.i);
      const curBlock = this.nextBlock;
      const encryptedBlock = await this._runCBC(this.prevBlock);
      xorMut$1(encryptedBlock, curBlock);
      result = encryptedBlock.subarray(0, curBlock.length);
    }

    this.clearSensitiveData();
    return result;
  }

  clearSensitiveData() {
    this.nextBlock.fill(0);
    this.prevBlock.fill(0);
    this.keyRef = null;
    this.key = null;
  }

  async encrypt(plaintext) {
    // plaintext is internally padded to block length before encryption
    const encryptedWithPadding = await this._runCBC(
      util.concatUint8Array([new Uint8Array(this.blockSize), plaintext]),
      this.iv
    );
    // drop encrypted padding
    const ct = encryptedWithPadding.subarray(0, plaintext.length);
    xorMut$1(ct, plaintext);
    this.clearSensitiveData();
    return ct;
  }
}

class NobleStreamProcessor {
  constructor(forEncryption, algo, key, iv) {
    this.forEncryption = forEncryption;
    const { blockSize } = getCipherParams(algo);
    this.key = unsafe.expandKeyLE(key);

    if (iv.byteOffset % 4 !== 0) iv = iv.slice(); // aligned arrays required by noble-ciphers
    this.prevBlock = getUint32Array(iv);
    this.nextBlock = new Uint8Array(blockSize);
    this.i = 0; // pointer inside next block
    this.blockSize = blockSize;
  }

  _runCFB(src) {
    const src32 = getUint32Array(src);
    const dst = new Uint8Array(src.length);
    const dst32 = getUint32Array(dst);
    for (let i = 0; i + 4 <= dst32.length; i += 4) {
      const { s0: e0, s1: e1, s2: e2, s3: e3 } = unsafe.encrypt(this.key, this.prevBlock[0], this.prevBlock[1], this.prevBlock[2], this.prevBlock[3]);
      dst32[i + 0] = src32[i + 0] ^ e0;
      dst32[i + 1] = src32[i + 1] ^ e1;
      dst32[i + 2] = src32[i + 2] ^ e2;
      dst32[i + 3] = src32[i + 3] ^ e3;
      this.prevBlock = (this.forEncryption ? dst32 : src32).slice(i, i + 4);
    }
    return dst;
  }

  async processChunk(value) {
    const missing = this.nextBlock.length - this.i;
    const added = value.subarray(0, missing);
    this.nextBlock.set(added, this.i);

    if ((this.i + value.length) >= (2 * this.blockSize)) {
      const leftover = (value.length - missing) % this.blockSize;
      const toProcess = util.concatUint8Array([
        this.nextBlock,
        value.subarray(missing, value.length - leftover)
      ]);

      const processedBlocks = this._runCFB(toProcess);

      // take care of leftover data
      if (leftover > 0) this.nextBlock.set(value.subarray(-leftover));
      this.i = leftover;

      return processedBlocks;
    }

    this.i += added.length;

    let processedBlock;
    if (this.i === this.nextBlock.length) { // block ready to be encrypted
      processedBlock = this._runCFB(this.nextBlock);
      this.i = 0;

      const remaining = value.subarray(added.length);
      this.nextBlock.set(remaining, this.i);
      this.i += remaining.length;
    } else {
      processedBlock = new Uint8Array();
    }

    return processedBlock;
  }

  async finish() {
    let result;
    if (this.i === 0) { // nothing more to encrypt
      result = new Uint8Array();
    } else {
      const processedBlock = this._runCFB(this.nextBlock);

      result = processedBlock.subarray(0, this.i);
    }

    this.clearSensitiveData();
    return result;
  }

  clearSensitiveData() {
    this.nextBlock.fill(0);
    this.prevBlock.fill(0);
    this.key.fill(0);
  }
}


async function aesEncrypt(algo, key, pt, iv) {
  if (webCrypto$3 && await WebCryptoEncryptor.isSupported(algo)) { // Chromium does not implement AES with 192-bit keys
    const cfb = new WebCryptoEncryptor(algo, key, iv);
    return util.isStream(pt) ? transform(pt, value => cfb.encryptChunk(value), () => cfb.finish()) : cfb.encrypt(pt);
  } else if (util.isStream(pt)) { // async callbacks are not accepted by streamTransform unless the input is a stream
    const cfb = new NobleStreamProcessor(true, algo, key, iv);
    return transform(pt, value => cfb.processChunk(value), () => cfb.finish());
  }
  return cfb(key, iv).encrypt(pt);
}

async function aesDecrypt(algo, key, ct, iv) {
  if (util.isStream(ct)) {
    const cfb = new NobleStreamProcessor(false, algo, key, iv);
    return transform(ct, value => cfb.processChunk(value), () => cfb.finish());
  }
  return cfb(key, iv).decrypt(ct);
}

function xorMut$1(a, b) {
  const aLength = Math.min(a.length, b.length);
  for (let i = 0; i < aLength; i++) {
    a[i] = a[i] ^ b[i];
  }
}

const getUint32Array = arr => new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));

function nodeEncrypt(algo, key, pt, iv) {
  const algoName = enums.read(enums.symmetric, algo);
  const cipherObj = new nodeCrypto$3.createCipheriv(nodeAlgos[algoName], key, iv);
  return transform(pt, value => new Uint8Array(cipherObj.update(value)));
}

function nodeDecrypt(algo, key, ct, iv) {
  const algoName = enums.read(enums.symmetric, algo);
  const decipherObj = new nodeCrypto$3.createDecipheriv(nodeAlgos[algoName], key, iv);
  return transform(ct, value => new Uint8Array(decipherObj.update(value)));
}

/**
 * @fileoverview This module implements AES-CMAC on top of
 * native AES-CBC using either the WebCrypto API or Node.js' crypto API.
 * @module crypto/cmac
 */


const webCrypto$2 = util.getWebCrypto();
const nodeCrypto$2 = util.getNodeCrypto();


/**
 * This implementation of CMAC is based on the description of OMAC in
 * http://web.cs.ucdavis.edu/~rogaway/papers/eax.pdf. As per that
 * document:
 *
 * We have made a small modification to the OMAC algorithm as it was
 * originally presented, changing one of its two constants.
 * Specifically, the constant 4 at line 85 was the constant 1/2 (the
 * multiplicative inverse of 2) in the original definition of OMAC [14].
 * The OMAC authors indicate that they will promulgate this modification
 * [15], which slightly simplifies implementations.
 */

const blockLength$3 = 16;


/**
 * xor `padding` into the end of `data`. This function implements "the
 * operation xor→ [which] xors the shorter string into the end of longer
 * one". Since data is always as least as long as padding, we can
 * simplify the implementation.
 * @param {Uint8Array} data
 * @param {Uint8Array} padding
 */
function rightXORMut(data, padding) {
  const offset = data.length - blockLength$3;
  for (let i = 0; i < blockLength$3; i++) {
    data[i + offset] ^= padding[i];
  }
  return data;
}

function pad(data, padding, padding2) {
  // if |M| in {n, 2n, 3n, ...}
  if (data.length && data.length % blockLength$3 === 0) {
    // then return M xor→ B,
    return rightXORMut(data, padding);
  }
  // else return (M || 10^(n−1−(|M| mod n))) xor→ P
  const padded = new Uint8Array(data.length + (blockLength$3 - (data.length % blockLength$3)));
  padded.set(data);
  padded[data.length] = 0b10000000;
  return rightXORMut(padded, padding2);
}

const zeroBlock$1 = new Uint8Array(blockLength$3);

async function CMAC(key) {
  const cbc = await CBC(key);

  // L ← E_K(0^n); B ← 2L; P ← 4L
  const padding = util.double(await cbc(zeroBlock$1));
  const padding2 = util.double(padding);

  return async function(data) {
    // return CBC_K(pad(M; B, P))
    return (await cbc(pad(data, padding, padding2))).subarray(-blockLength$3);
  };
}

async function CBC(key) {
  if (util.getNodeCrypto()) { // Node crypto library
    return async function(pt) {
      const en = new nodeCrypto$2.createCipheriv('aes-' + (key.length * 8) + '-cbc', key, zeroBlock$1);
      const ct = en.update(pt);
      return new Uint8Array(ct);
    };
  }

  if (util.getWebCrypto()) {
    try {
      key = await webCrypto$2.importKey('raw', key, { name: 'AES-CBC', length: key.length * 8 }, false, ['encrypt']);
      return async function(pt) {
        const ct = await webCrypto$2.encrypt({ name: 'AES-CBC', iv: zeroBlock$1, length: blockLength$3 * 8 }, key, pt);
        return new Uint8Array(ct).subarray(0, ct.byteLength - blockLength$3);
      };
    } catch (err) {
      // no 192 bit support in Chromium, which throws `OperationError`, see: https://www.chromium.org/blink/webcrypto#TOC-AES-support
      if (err.name !== 'NotSupportedError' &&
        !(key.length === 24 && err.name === 'OperationError')) {
        throw err;
      }
      util.printDebugError('Browser did not support operation: ' + err.message);
    }
  }

  return async function(pt) {
    return cbc(key, zeroBlock$1, { disablePadding: true }).encrypt(pt);
  };
}

// OpenPGP.js - An OpenPGP implementation in javascript
// Copyright (C) 2018 ProtonTech AG
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


const webCrypto$1 = util.getWebCrypto();
const nodeCrypto$1 = util.getNodeCrypto();
const Buffer$1 = util.getNodeBuffer();


const blockLength$2 = 16;
const ivLength$2 = blockLength$2;
const tagLength$2 = blockLength$2;

const zero = new Uint8Array(blockLength$2);
const one$1 = new Uint8Array(blockLength$2); one$1[blockLength$2 - 1] = 1;
const two = new Uint8Array(blockLength$2); two[blockLength$2 - 1] = 2;

async function OMAC(key) {
  const cmac = await CMAC(key);
  return function(t, message) {
    return cmac(util.concatUint8Array([t, message]));
  };
}

async function CTR(key) {
  if (util.getNodeCrypto()) { // Node crypto library
    return async function(pt, iv) {
      const en = new nodeCrypto$1.createCipheriv('aes-' + (key.length * 8) + '-ctr', key, iv);
      const ct = Buffer$1.concat([en.update(pt), en.final()]);
      return new Uint8Array(ct);
    };
  }

  if (util.getWebCrypto()) {
    try {
      const keyRef = await webCrypto$1.importKey('raw', key, { name: 'AES-CTR', length: key.length * 8 }, false, ['encrypt']);
      return async function(pt, iv) {
        const ct = await webCrypto$1.encrypt({ name: 'AES-CTR', counter: iv, length: blockLength$2 * 8 }, keyRef, pt);
        return new Uint8Array(ct);
      };
    } catch (err) {
      // no 192 bit support in Chromium, which throws `OperationError`, see: https://www.chromium.org/blink/webcrypto#TOC-AES-support
      if (err.name !== 'NotSupportedError' &&
        !(key.length === 24 && err.name === 'OperationError')) {
        throw err;
      }
      util.printDebugError('Browser did not support operation: ' + err.message);
    }
  }

  return async function(pt, iv) {
    return ctr(key, iv).encrypt(pt);
  };
}


/**
 * Class to en/decrypt using EAX mode.
 * @param {enums.symmetric} cipher - The symmetric cipher algorithm to use
 * @param {Uint8Array} key - The encryption key
 */
async function EAX(cipher, key) {
  if (cipher !== enums.symmetric.aes128 &&
    cipher !== enums.symmetric.aes192 &&
    cipher !== enums.symmetric.aes256) {
    throw new Error('EAX mode supports only AES cipher');
  }

  const [
    omac,
    ctr
  ] = await Promise.all([
    OMAC(key),
    CTR(key)
  ]);

  return {
    /**
     * Encrypt plaintext input.
     * @param {Uint8Array} plaintext - The cleartext input to be encrypted
     * @param {Uint8Array} nonce - The nonce (16 bytes)
     * @param {Uint8Array} adata - Associated data to sign
     * @returns {Promise<Uint8Array>} The ciphertext output.
     */
    encrypt: async function(plaintext, nonce, adata) {
      const [
        omacNonce,
        omacAdata
      ] = await Promise.all([
        omac(zero, nonce),
        omac(one$1, adata)
      ]);
      const ciphered = await ctr(plaintext, omacNonce);
      const omacCiphered = await omac(two, ciphered);
      const tag = omacCiphered; // Assumes that omac(*).length === tagLength.
      for (let i = 0; i < tagLength$2; i++) {
        tag[i] ^= omacAdata[i] ^ omacNonce[i];
      }
      return util.concatUint8Array([ciphered, tag]);
    },

    /**
     * Decrypt ciphertext input.
     * @param {Uint8Array} ciphertext - The ciphertext input to be decrypted
     * @param {Uint8Array} nonce - The nonce (16 bytes)
     * @param {Uint8Array} adata - Associated data to verify
     * @returns {Promise<Uint8Array>} The plaintext output.
     */
    decrypt: async function(ciphertext, nonce, adata) {
      if (ciphertext.length < tagLength$2) throw new Error('Invalid EAX ciphertext');
      const ciphered = ciphertext.subarray(0, -tagLength$2);
      const ctTag = ciphertext.subarray(-tagLength$2);
      const [
        omacNonce,
        omacAdata,
        omacCiphered
      ] = await Promise.all([
        omac(zero, nonce),
        omac(one$1, adata),
        omac(two, ciphered)
      ]);
      const tag = omacCiphered; // Assumes that omac(*).length === tagLength.
      for (let i = 0; i < tagLength$2; i++) {
        tag[i] ^= omacAdata[i] ^ omacNonce[i];
      }
      if (!util.equalsUint8Array(ctTag, tag)) throw new Error('Authentication tag mismatch');
      const plaintext = await ctr(ciphered, omacNonce);
      return plaintext;
    }
  };
}


/**
 * Get EAX nonce as defined by {@link https://tools.ietf.org/html/draft-ietf-openpgp-rfc4880bis-04#section-5.16.1|RFC4880bis-04, section 5.16.1}.
 * @param {Uint8Array} iv - The initialization vector (16 bytes)
 * @param {Uint8Array} chunkIndex - The chunk index (8 bytes)
 */
EAX.getNonce = function(iv, chunkIndex) {
  const nonce = iv.slice();
  for (let i = 0; i < chunkIndex.length; i++) {
    nonce[8 + i] ^= chunkIndex[i];
  }
  return nonce;
};

EAX.blockLength = blockLength$2;
EAX.ivLength = ivLength$2;
EAX.tagLength = tagLength$2;

// OpenPGP.js - An OpenPGP implementation in javascript
// Copyright (C) 2018 ProtonTech AG
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


const blockLength$1 = 16;
const ivLength$1 = 15;

// https://tools.ietf.org/html/draft-ietf-openpgp-rfc4880bis-04#section-5.16.2:
// While OCB [RFC7253] allows the authentication tag length to be of any
// number up to 128 bits long, this document requires a fixed
// authentication tag length of 128 bits (16 octets) for simplicity.
const tagLength$1 = 16;


function ntz(n) {
  let ntz = 0;
  for (let i = 1; (n & i) === 0; i <<= 1) {
    ntz++;
  }
  return ntz;
}

function xorMut(S, T) {
  for (let i = 0; i < S.length; i++) {
    S[i] ^= T[i];
  }
  return S;
}

function xor(S, T) {
  return xorMut(S.slice(), T);
}

const zeroBlock = new Uint8Array(blockLength$1);
const one = new Uint8Array([1]);

/**
 * Class to en/decrypt using OCB mode.
 * @param {enums.symmetric} cipher - The symmetric cipher algorithm to use
 * @param {Uint8Array} key - The encryption key
 */
async function OCB(cipher, key) {
  const { keySize } = getCipherParams(cipher);
  // sanity checks
  if (!util.isAES(cipher) || key.length !== keySize) {
    throw new Error('Unexpected algorithm or key size');
  }

  let maxNtz = 0;

  // `encipher` and `decipher` cannot be async, since `crypt` shares state across calls,
  // hence its execution cannot be broken up.
  // As a result, WebCrypto cannot currently be used for `encipher`.
  const aes = cbc(key, zeroBlock, { disablePadding: true });
  const encipher = block => aes.encrypt(block);
  const decipher = block => aes.decrypt(block);
  let mask;

  constructKeyVariables();

  function constructKeyVariables() {
    const mask_x = encipher(zeroBlock);
    const mask_$ = util.double(mask_x);
    mask = [];
    mask[0] = util.double(mask_$);


    mask.x = mask_x;
    mask.$ = mask_$;
  }

  function extendKeyVariables(text, adata) {
    const newMaxNtz = util.nbits(Math.max(text.length, adata.length) / blockLength$1 | 0) - 1;
    for (let i = maxNtz + 1; i <= newMaxNtz; i++) {
      mask[i] = util.double(mask[i - 1]);
    }
    maxNtz = newMaxNtz;
  }

  function hash(adata) {
    if (!adata.length) {
      // Fast path
      return zeroBlock;
    }

    //
    // Consider A as a sequence of 128-bit blocks
    //
    const m = adata.length / blockLength$1 | 0;

    const offset = new Uint8Array(blockLength$1);
    const sum = new Uint8Array(blockLength$1);
    for (let i = 0; i < m; i++) {
      xorMut(offset, mask[ntz(i + 1)]);
      xorMut(sum, encipher(xor(offset, adata)));
      adata = adata.subarray(blockLength$1);
    }

    //
    // Process any final partial block; compute final hash value
    //
    if (adata.length) {
      xorMut(offset, mask.x);

      const cipherInput = new Uint8Array(blockLength$1);
      cipherInput.set(adata, 0);
      cipherInput[adata.length] = 0b10000000;
      xorMut(cipherInput, offset);

      xorMut(sum, encipher(cipherInput));
    }

    return sum;
  }

  /**
   * Encrypt/decrypt data.
   * @param {encipher|decipher} fn - Encryption/decryption block cipher function
   * @param {Uint8Array} text - The cleartext or ciphertext (without tag) input
   * @param {Uint8Array} nonce - The nonce (15 bytes)
   * @param {Uint8Array} adata - Associated data to sign
   * @returns {Promise<Uint8Array>} The ciphertext or plaintext output, with tag appended in both cases.
   */
  function crypt(fn, text, nonce, adata) {
    //
    // Consider P as a sequence of 128-bit blocks
    //
    const m = text.length / blockLength$1 | 0;

    //
    // Key-dependent variables
    //
    extendKeyVariables(text, adata);

    //
    // Nonce-dependent and per-encryption variables
    //
    //    Nonce = num2str(TAGLEN mod 128,7) || zeros(120-bitlen(N)) || 1 || N
    // Note: We assume here that tagLength mod 16 == 0.
    const paddedNonce = util.concatUint8Array([zeroBlock.subarray(0, ivLength$1 - nonce.length), one, nonce]);
    //    bottom = str2num(Nonce[123..128])
    const bottom = paddedNonce[blockLength$1 - 1] & 0b111111;
    //    Ktop = ENCIPHER(K, Nonce[1..122] || zeros(6))
    paddedNonce[blockLength$1 - 1] &= 0b11000000;
    const kTop = encipher(paddedNonce);
    //    Stretch = Ktop || (Ktop[1..64] xor Ktop[9..72])
    const stretched = util.concatUint8Array([kTop, xor(kTop.subarray(0, 8), kTop.subarray(1, 9))]);
    //    Offset_0 = Stretch[1+bottom..128+bottom]
    const offset = util.shiftRight(stretched.subarray(0 + (bottom >> 3), 17 + (bottom >> 3)), 8 - (bottom & 7)).subarray(1);
    //    Checksum_0 = zeros(128)
    const checksum = new Uint8Array(blockLength$1);

    const ct = new Uint8Array(text.length + tagLength$1);

    //
    // Process any whole blocks
    //
    let i;
    let pos = 0;
    for (i = 0; i < m; i++) {
      // Offset_i = Offset_{i-1} xor L_{ntz(i)}
      xorMut(offset, mask[ntz(i + 1)]);
      // C_i = Offset_i xor ENCIPHER(K, P_i xor Offset_i)
      // P_i = Offset_i xor DECIPHER(K, C_i xor Offset_i)
      ct.set(xorMut(fn(xor(offset, text)), offset), pos);
      // Checksum_i = Checksum_{i-1} xor P_i
      xorMut(checksum, fn === encipher ? text : ct.subarray(pos));

      text = text.subarray(blockLength$1);
      pos += blockLength$1;
    }

    //
    // Process any final partial block and compute raw tag
    //
    if (text.length) {
      // Offset_* = Offset_m xor L_*
      xorMut(offset, mask.x);
      // Pad = ENCIPHER(K, Offset_*)
      const padding = encipher(offset);
      // C_* = P_* xor Pad[1..bitlen(P_*)]
      ct.set(xor(text, padding), pos);

      // Checksum_* = Checksum_m xor (P_* || 1 || new Uint8Array(127-bitlen(P_*)))
      const xorInput = new Uint8Array(blockLength$1);
      xorInput.set(fn === encipher ? text : ct.subarray(pos, -tagLength$1), 0);
      xorInput[text.length] = 0b10000000;
      xorMut(checksum, xorInput);
      pos += text.length;
    }
    // Tag = ENCIPHER(K, Checksum_* xor Offset_* xor L_$) xor HASH(K,A)
    const tag = xorMut(encipher(xorMut(xorMut(checksum, offset), mask.$)), hash(adata));

    //
    // Assemble ciphertext
    //
    // C = C_1 || C_2 || ... || C_m || C_* || Tag[1..TAGLEN]
    ct.set(tag, pos);
    return ct;
  }


  return {
    /**
     * Encrypt plaintext input.
     * @param {Uint8Array} plaintext - The cleartext input to be encrypted
     * @param {Uint8Array} nonce - The nonce (15 bytes)
     * @param {Uint8Array} adata - Associated data to sign
     * @returns {Promise<Uint8Array>} The ciphertext output.
     */
    encrypt: async function(plaintext, nonce, adata) {
      return crypt(encipher, plaintext, nonce, adata);
    },

    /**
     * Decrypt ciphertext input.
     * @param {Uint8Array} ciphertext - The ciphertext input to be decrypted
     * @param {Uint8Array} nonce - The nonce (15 bytes)
     * @param {Uint8Array} adata - Associated data to sign
     * @returns {Promise<Uint8Array>} The ciphertext output.
     */
    decrypt: async function(ciphertext, nonce, adata) {
      if (ciphertext.length < tagLength$1) throw new Error('Invalid OCB ciphertext');

      const tag = ciphertext.subarray(-tagLength$1);
      ciphertext = ciphertext.subarray(0, -tagLength$1);

      const crypted = crypt(decipher, ciphertext, nonce, adata);
      // if (Tag[1..TAGLEN] == T)
      if (util.equalsUint8Array(tag, crypted.subarray(-tagLength$1))) {
        return crypted.subarray(0, -tagLength$1);
      }
      throw new Error('Authentication tag mismatch');
    }
  };
}


/**
 * Get OCB nonce as defined by {@link https://tools.ietf.org/html/draft-ietf-openpgp-rfc4880bis-04#section-5.16.2|RFC4880bis-04, section 5.16.2}.
 * @param {Uint8Array} iv - The initialization vector (15 bytes)
 * @param {Uint8Array} chunkIndex - The chunk index (8 bytes)
 */
OCB.getNonce = function(iv, chunkIndex) {
  const nonce = iv.slice();
  for (let i = 0; i < chunkIndex.length; i++) {
    nonce[7 + i] ^= chunkIndex[i];
  }
  return nonce;
};

OCB.blockLength = blockLength$1;
OCB.ivLength = ivLength$1;
OCB.tagLength = tagLength$1;

// OpenPGP.js - An OpenPGP implementation in javascript
// Copyright (C) 2016 Tankred Hase
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


const webCrypto = util.getWebCrypto();
const nodeCrypto = util.getNodeCrypto();
const Buffer = util.getNodeBuffer();

const blockLength = 16;
const ivLength = 12; // size of the IV in bytes
const tagLength = 16; // size of the tag in bytes
const ALGO = 'AES-GCM';

/**
 * Class to en/decrypt using GCM mode.
 * @param {enums.symmetric} cipher - The symmetric cipher algorithm to use
 * @param {Uint8Array} key - The encryption key
 */
async function GCM(cipher, key) {
  if (cipher !== enums.symmetric.aes128 &&
    cipher !== enums.symmetric.aes192 &&
    cipher !== enums.symmetric.aes256) {
    throw new Error('GCM mode supports only AES cipher');
  }

  if (util.getNodeCrypto()) { // Node crypto library
    return {
      encrypt: async function(pt, iv, adata = new Uint8Array()) {
        const en = new nodeCrypto.createCipheriv('aes-' + (key.length * 8) + '-gcm', key, iv);
        en.setAAD(adata);
        const ct = Buffer.concat([en.update(pt), en.final(), en.getAuthTag()]); // append auth tag to ciphertext
        return new Uint8Array(ct);
      },

      decrypt: async function(ct, iv, adata = new Uint8Array()) {
        const de = new nodeCrypto.createDecipheriv('aes-' + (key.length * 8) + '-gcm', key, iv);
        de.setAAD(adata);
        de.setAuthTag(ct.slice(ct.length - tagLength, ct.length)); // read auth tag at end of ciphertext
        const pt = Buffer.concat([de.update(ct.slice(0, ct.length - tagLength)), de.final()]);
        return new Uint8Array(pt);
      }
    };
  }

  if (util.getWebCrypto()) {
    try {
      const _key = await webCrypto.importKey('raw', key, { name: ALGO }, false, ['encrypt', 'decrypt']);
      // Safari 13 and Safari iOS 14 does not support GCM-en/decrypting empty messages
      const webcryptoEmptyMessagesUnsupported = navigator.userAgent.match(/Version\/13\.\d(\.\d)* Safari/) ||
        navigator.userAgent.match(/Version\/(13|14)\.\d(\.\d)* Mobile\/\S* Safari/);
      return {
        encrypt: async function(pt, iv, adata = new Uint8Array()) {
          if (webcryptoEmptyMessagesUnsupported && !pt.length) {
            return gcm(key, iv, adata).encrypt(pt);
          }
          const ct = await webCrypto.encrypt({ name: ALGO, iv, additionalData: adata, tagLength: tagLength * 8 }, _key, pt);
          return new Uint8Array(ct);
        },

        decrypt: async function(ct, iv, adata = new Uint8Array()) {
          if (webcryptoEmptyMessagesUnsupported && ct.length === tagLength) {
            return gcm(key, iv, adata).decrypt(ct);
          }
          try {
            const pt = await webCrypto.decrypt({ name: ALGO, iv, additionalData: adata, tagLength: tagLength * 8 }, _key, ct);
            return new Uint8Array(pt);
          } catch (e) {
            if (e.name === 'OperationError') {
              throw new Error('Authentication tag mismatch');
            }
          }
        }
      };
    } catch (err) {
      // no 192 bit support in Chromium, which throws `OperationError`, see: https://www.chromium.org/blink/webcrypto#TOC-AES-support
      if (err.name !== 'NotSupportedError' &&
        !(key.length === 24 && err.name === 'OperationError')) {
        throw err;
      }
      util.printDebugError('Browser did not support operation: ' + err.message);
    }
  }

  return {
    encrypt: async function(pt, iv, adata) {
      return gcm(key, iv, adata).encrypt(pt);
    },

    decrypt: async function(ct, iv, adata) {
      return gcm(key, iv, adata).decrypt(ct);
    }
  };
}


/**
 * Get GCM nonce. Note: this operation is not defined by the standard.
 * A future version of the standard may define GCM mode differently,
 * hopefully under a different ID (we use Private/Experimental algorithm
 * ID 100) so that we can maintain backwards compatibility.
 * @param {Uint8Array} iv - The initialization vector (12 bytes)
 * @param {Uint8Array} chunkIndex - The chunk index (8 bytes)
 */
GCM.getNonce = function(iv, chunkIndex) {
  const nonce = iv.slice();
  for (let i = 0; i < chunkIndex.length; i++) {
    nonce[4 + i] ^= chunkIndex[i];
  }
  return nonce;
};

GCM.blockLength = blockLength;
GCM.ivLength = ivLength;
GCM.tagLength = tagLength;

/**
 * @fileoverview Cipher modes
 * @module crypto/cipherMode
 */


/**
* Get implementation of the given AEAD mode
* @param {enums.aead} algo
* @param {Boolean} [acceptExperimentalGCM] - whether to allow the non-standard, legacy `experimentalGCM` algo
* @returns {Object}
* @throws {Error} on invalid algo
*/
function getAEADMode(algo, acceptExperimentalGCM = false) {
  switch (algo) {
    case enums.aead.eax:
      return EAX;
    case enums.aead.ocb:
      return OCB;
    case enums.aead.gcm:
      return GCM;
    case enums.aead.experimentalGCM:
      if (!acceptExperimentalGCM) {
        throw new Error('Unexpected non-standard `experimentalGCM` AEAD algorithm provided in `config.preferredAEADAlgorithm`: use `gcm` instead');
      }
      return GCM;
    default:
      throw new Error('Unsupported AEAD mode');
  }
}

/**
 * @fileoverview Provides functions for asymmetric signing and signature verification
 * @module crypto/signature
 */


/**
 * Parse signature in binary form to get the parameters.
 * The returned values are only padded for EdDSA, since in the other cases their expected length
 * depends on the key params, hence we delegate the padding to the signature verification function.
 * See {@link https://tools.ietf.org/html/rfc4880#section-9.1|RFC 4880 9.1}
 * See {@link https://tools.ietf.org/html/rfc4880#section-5.2.2|RFC 4880 5.2.2.}
 * @param {module:enums.publicKey} algo - Public key algorithm
 * @param {Uint8Array} signature - Data for which the signature was created
 * @returns {Promise<Object>} True if signature is valid.
 * @async
 */
function parseSignatureParams(algo, signature) {
  let read = 0;
  switch (algo) {
    // Algorithm-Specific Fields for RSA signatures:
    // -  MPI of RSA signature value m**d mod n.
    case enums.publicKey.rsaEncryptSign:
    case enums.publicKey.rsaEncrypt:
    case enums.publicKey.rsaSign: {
      const s = util.readMPI(signature.subarray(read)); read += s.length + 2;
      // The signature needs to be the same length as the public key modulo n.
      // We pad s on signature verification, where we have access to n.
      return { read, signatureParams: { s } };
    }
    // Algorithm-Specific Fields for DSA or ECDSA signatures:
    // -  MPI of DSA or ECDSA value r.
    // -  MPI of DSA or ECDSA value s.
    case enums.publicKey.dsa:
    case enums.publicKey.ecdsa:
    {
      // If the signature payload sizes are unexpected, we will throw on verification,
      // where we also have access to the OID curve from the key.
      const r = util.readMPI(signature.subarray(read)); read += r.length + 2;
      const s = util.readMPI(signature.subarray(read)); read += s.length + 2;
      return { read, signatureParams: { r, s } };
    }
    // Algorithm-Specific Fields for legacy EdDSA signatures:
    // -  MPI of an EC point r.
    // -  EdDSA value s, in MPI, in the little endian representation
    case enums.publicKey.eddsaLegacy: {
      // Only Curve25519Legacy is supported (no Curve448Legacy), but the relevant checks are done on key parsing and signature
      // verification: if the signature payload sizes are unexpected, we will throw on verification,
      // where we also have access to the OID curve from the key.
      const r = util.readMPI(signature.subarray(read)); read += r.length + 2;
      const s = util.readMPI(signature.subarray(read)); read += s.length + 2;
      return { read, signatureParams: { r, s } };
    }
    // Algorithm-Specific Fields for Ed25519 signatures:
    // - 64 octets of the native signature
    // Algorithm-Specific Fields for Ed448 signatures:
    // - 114 octets of the native signature
    case enums.publicKey.ed25519:
    case enums.publicKey.ed448: {
      const rsSize = 2 * getPayloadSize$1(algo);
      const RS = util.readExactSubarray(signature, read, read + rsSize); read += RS.length;
      return { read, signatureParams: { RS } };
    }

    default:
      throw new UnsupportedError('Unknown signature algorithm.');
  }
}

/**
 * Verifies the signature provided for data using specified algorithms and public key parameters.
 * See {@link https://tools.ietf.org/html/rfc4880#section-9.1|RFC 4880 9.1}
 * and {@link https://tools.ietf.org/html/rfc4880#section-9.4|RFC 4880 9.4}
 * for public key and hash algorithms.
 * @param {module:enums.publicKey} algo - Public key algorithm
 * @param {module:enums.hash} hashAlgo - Hash algorithm
 * @param {Object} signature - Named algorithm-specific signature parameters
 * @param {Object} publicParams - Algorithm-specific public key parameters
 * @param {Uint8Array} data - Data for which the signature was created
 * @param {Uint8Array} hashed - The hashed data
 * @returns {Promise<Boolean>} True if signature is valid.
 * @async
 */
async function verify$1(algo, hashAlgo, signature, publicParams, data, hashed) {
  switch (algo) {
    case enums.publicKey.rsaEncryptSign:
    case enums.publicKey.rsaEncrypt:
    case enums.publicKey.rsaSign: {
      const { n, e } = publicParams;
      const s = util.leftPad(signature.s, n.length); // padding needed for webcrypto and node crypto
      return verify$6(hashAlgo, data, s, n, e, hashed);
    }
    case enums.publicKey.dsa: {
      const { g, p, q, y } = publicParams;
      const { r, s } = signature; // no need to pad, since we always handle them as BigIntegers
      return verify$2(hashAlgo, r, s, hashed, g, p, q, y);
    }
    case enums.publicKey.ecdsa: {
      const { oid, Q } = publicParams;
      const curveSize = new CurveWithOID(oid).payloadSize;
      // padding needed for webcrypto
      const r = util.leftPad(signature.r, curveSize);
      const s = util.leftPad(signature.s, curveSize);
      return verify$4(oid, hashAlgo, { r, s }, data, Q, hashed);
    }
    case enums.publicKey.eddsaLegacy: {
      const { oid, Q } = publicParams;
      const curveSize = new CurveWithOID(oid).payloadSize;
      // When dealing little-endian MPI data, we always need to left-pad it, as done with big-endian values:
      // https://www.ietf.org/archive/id/draft-ietf-openpgp-rfc4880bis-10.html#section-3.2-9
      const r = util.leftPad(signature.r, curveSize);
      const s = util.leftPad(signature.s, curveSize);
      return verify$3(oid, hashAlgo, { r, s }, data, Q, hashed);
    }
    case enums.publicKey.ed25519:
    case enums.publicKey.ed448: {
      const { A } = publicParams;
      return verify$5(algo, hashAlgo, signature, data, A, hashed);
    }
    default:
      throw new Error('Unknown signature algorithm.');
  }
}

/**
 * Creates a signature on data using specified algorithms and private key parameters.
 * See {@link https://tools.ietf.org/html/rfc4880#section-9.1|RFC 4880 9.1}
 * and {@link https://tools.ietf.org/html/rfc4880#section-9.4|RFC 4880 9.4}
 * for public key and hash algorithms.
 * @param {module:enums.publicKey} algo - Public key algorithm
 * @param {module:enums.hash} hashAlgo - Hash algorithm
 * @param {Object} publicKeyParams - Algorithm-specific public and private key parameters
 * @param {Object} privateKeyParams - Algorithm-specific public and private key parameters
 * @param {Uint8Array} data - Data to be signed
 * @param {Uint8Array} hashed - The hashed data
 * @returns {Promise<Object>} Signature                      Object containing named signature parameters.
 * @async
 */
async function sign$1(algo, hashAlgo, publicKeyParams, privateKeyParams, data, hashed) {
  if (!publicKeyParams || !privateKeyParams) {
    throw new Error('Missing key parameters');
  }
  switch (algo) {
    case enums.publicKey.rsaEncryptSign:
    case enums.publicKey.rsaEncrypt:
    case enums.publicKey.rsaSign: {
      const { n, e } = publicKeyParams;
      const { d, p, q, u } = privateKeyParams;
      const s = await sign$6(hashAlgo, data, n, e, d, p, q, u, hashed);
      return { s };
    }
    case enums.publicKey.dsa: {
      const { g, p, q } = publicKeyParams;
      const { x } = privateKeyParams;
      return sign$2(hashAlgo, hashed, g, p, q, x);
    }
    case enums.publicKey.elgamal:
      throw new Error('Signing with Elgamal is not defined in the OpenPGP standard.');
    case enums.publicKey.ecdsa: {
      const { oid, Q } = publicKeyParams;
      const { d } = privateKeyParams;
      return sign$4(oid, hashAlgo, data, Q, d, hashed);
    }
    case enums.publicKey.eddsaLegacy: {
      const { oid, Q } = publicKeyParams;
      const { seed } = privateKeyParams;
      return sign$3(oid, hashAlgo, data, Q, seed, hashed);
    }
    case enums.publicKey.ed25519:
    case enums.publicKey.ed448: {
      const { A } = publicKeyParams;
      const { seed } = privateKeyParams;
      return sign$5(algo, hashAlgo, data, A, seed, hashed);
    }
    default:
      throw new Error('Unknown signature algorithm.');
  }
}

const ARGON2_TYPE = 0x02; // id
const ARGON2_VERSION = 0x13;
const ARGON2_SALT_SIZE = 16;

class Argon2OutOfMemoryError extends Error {
  constructor(...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, Argon2OutOfMemoryError);
    }

    this.name = 'Argon2OutOfMemoryError';
  }
}

// cache argon wasm module
let loadArgonWasmModule;
let argon2Promise;
// reload wasm module above this treshold, to deallocated used memory
const ARGON2_WASM_MEMORY_THRESHOLD_RELOAD = 2 << 19;

class Argon2S2K {
  /**
  * @param {Object} [config] - Full configuration, defaults to openpgp.config
  */
  constructor(config$1 = config) {
    const { passes, parallelism, memoryExponent } = config$1.s2kArgon2Params;

    this.type = 'argon2';
    /**
     * 16 bytes of salt
     * @type {Uint8Array}
     */
    this.salt = null;
    /**
     * number of passes
     * @type {Integer}
     */
    this.t = passes;
    /**
     * degree of parallelism (lanes)
     * @type {Integer}
     */
    this.p = parallelism;
    /**
     * exponent indicating memory size
     * @type {Integer}
     */
    this.encodedM = memoryExponent;
  }

  generateSalt() {
    this.salt = getRandomBytes(ARGON2_SALT_SIZE);
  }

  /**
  * Parsing function for argon2 string-to-key specifier.
  * @param {Uint8Array} bytes - Payload of argon2 string-to-key specifier
  * @returns {Integer} Actual length of the object.
  */
  read(bytes) {
    let i = 0;

    this.salt = bytes.subarray(i, i + 16);
    i += 16;

    this.t = bytes[i++];
    this.p = bytes[i++];
    this.encodedM = bytes[i++]; // memory size exponent, one-octect

    return i;
  }

  /**
  * Serializes s2k information
  * @returns {Uint8Array} Binary representation of s2k.
  */
  write() {
    const arr = [
      new Uint8Array([enums.write(enums.s2k, this.type)]),
      this.salt,
      new Uint8Array([this.t, this.p, this.encodedM])
    ];

    return util.concatUint8Array(arr);
  }

  /**
  * Produces a key using the specified passphrase and the defined
  * hashAlgorithm
  * @param {String} passphrase - Passphrase containing user input
  * @returns {Promise<Uint8Array>} Produced key with a length corresponding to `keySize`
  * @throws {Argon2OutOfMemoryError|Errors}
  * @async
  */
  async produceKey(passphrase, keySize) {
    const decodedM = 2 << (this.encodedM - 1);

    try {
      // on first load, the argon2 lib is imported and the WASM module is initialized.
      // the two steps need to be atomic to avoid race conditions causing multiple wasm modules
      // being loaded when `argon2Promise` is not initialized.
      loadArgonWasmModule = loadArgonWasmModule || (await import('./argon2id.mjs')).default;
      argon2Promise = argon2Promise || loadArgonWasmModule();

      // important to keep local ref to argon2 in case the module is reloaded by another instance
      const argon2 = await argon2Promise;

      const passwordBytes = util.encodeUTF8(passphrase);
      const hash = argon2({
        version: ARGON2_VERSION,
        type: ARGON2_TYPE,
        password: passwordBytes,
        salt: this.salt,
        tagLength: keySize,
        memorySize: decodedM,
        parallelism: this.p,
        passes: this.t
      });

      // a lot of memory was used, reload to deallocate
      if (decodedM > ARGON2_WASM_MEMORY_THRESHOLD_RELOAD) {
        // it will be awaited if needed at the next `produceKey` invocation
        argon2Promise = loadArgonWasmModule();
        argon2Promise.catch(() => {});
      }
      return hash;
    } catch (e) {
      if (e.message && (
        e.message.includes('Unable to grow instance memory') || // Chrome
        e.message.includes('failed to grow memory') || // Firefox
        e.message.includes('WebAssembly.Memory.grow') || // Safari
        e.message.includes('Out of memory') // Safari iOS
      )) {
        throw new Argon2OutOfMemoryError('Could not allocate required memory for Argon2');
      } else {
        throw e;
      }
    }
  }
}

// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


class GenericS2K {
  /**
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   */
  constructor(s2kType, config$1 = config) {
    /**
     * Hash function identifier, or 0 for gnu-dummy keys
     * @type {module:enums.hash | 0}
     */
    this.algorithm = enums.hash.sha256;
    /**
     * enums.s2k identifier or 'gnu-dummy'
     * @type {String}
     */
    this.type = enums.read(enums.s2k, s2kType);
    /** @type {Integer} */
    this.c = config$1.s2kIterationCountByte;
    /** Eight bytes of salt in a binary string.
     * @type {Uint8Array}
     */
    this.salt = null;
  }

  generateSalt() {
    switch (this.type) {
      case 'salted':
      case 'iterated':
        this.salt = getRandomBytes(8);
    }
  }

  getCount() {
    // Exponent bias, defined in RFC4880
    const expbias = 6;

    return (16 + (this.c & 15)) << ((this.c >> 4) + expbias);
  }

  /**
   * Parsing function for a string-to-key specifier ({@link https://tools.ietf.org/html/rfc4880#section-3.7|RFC 4880 3.7}).
   * @param {Uint8Array} bytes - Payload of string-to-key specifier
   * @returns {Integer} Actual length of the object.
   */
  read(bytes) {
    let i = 0;
    this.algorithm = bytes[i++];

    switch (this.type) {
      case 'simple':
        break;

      case 'salted':
        this.salt = bytes.subarray(i, i + 8);
        i += 8;
        break;

      case 'iterated':
        this.salt = bytes.subarray(i, i + 8);
        i += 8;

        // Octet 10: count, a one-octet, coded value
        this.c = bytes[i++];
        break;

      case 'gnu':
        if (util.uint8ArrayToString(bytes.subarray(i, i + 3)) === 'GNU') {
          i += 3; // GNU
          const gnuExtType = 1000 + bytes[i++];
          if (gnuExtType === 1001) {
            this.type = 'gnu-dummy';
            // GnuPG extension mode 1001 -- don't write secret key at all
          } else {
            throw new UnsupportedError('Unknown s2k gnu protection mode.');
          }
        } else {
          throw new UnsupportedError('Unknown s2k type.');
        }
        break;

      default:
        throw new UnsupportedError('Unknown s2k type.'); // unreachable
    }

    return i;
  }

  /**
   * Serializes s2k information
   * @returns {Uint8Array} Binary representation of s2k.
   */
  write() {
    if (this.type === 'gnu-dummy') {
      return new Uint8Array([101, 0, ...util.stringToUint8Array('GNU'), 1]);
    }
    const arr = [new Uint8Array([enums.write(enums.s2k, this.type), this.algorithm])];

    switch (this.type) {
      case 'simple':
        break;
      case 'salted':
        arr.push(this.salt);
        break;
      case 'iterated':
        arr.push(this.salt);
        arr.push(new Uint8Array([this.c]));
        break;
      case 'gnu':
        throw new Error('GNU s2k type not supported.');
      default:
        throw new Error('Unknown s2k type.');
    }

    return util.concatUint8Array(arr);
  }

  /**
   * Produces a key using the specified passphrase and the defined
   * hashAlgorithm
   * @param {String} passphrase - Passphrase containing user input
   * @returns {Promise<Uint8Array>} Produced key with a length corresponding to.
   * hashAlgorithm hash length
   * @async
   */
  async produceKey(passphrase, numBytes) {
    passphrase = util.encodeUTF8(passphrase);

    const arr = [];
    let rlength = 0;

    let prefixlen = 0;
    while (rlength < numBytes) {
      let toHash;
      switch (this.type) {
        case 'simple':
          toHash = util.concatUint8Array([new Uint8Array(prefixlen), passphrase]);
          break;
        case 'salted':
          toHash = util.concatUint8Array([new Uint8Array(prefixlen), this.salt, passphrase]);
          break;
        case 'iterated': {
          const data = util.concatUint8Array([this.salt, passphrase]);
          let datalen = data.length;
          const count = Math.max(this.getCount(), datalen);
          toHash = new Uint8Array(prefixlen + count);
          toHash.set(data, prefixlen);
          for (let pos = prefixlen + datalen; pos < count; pos += datalen, datalen *= 2) {
            toHash.copyWithin(pos, prefixlen, pos);
          }
          break;
        }
        case 'gnu':
          throw new Error('GNU s2k type not supported.');
        default:
          throw new Error('Unknown s2k type.');
      }
      const result = await computeDigest(this.algorithm, toHash);
      arr.push(result);
      rlength += result.length;
      prefixlen++;
    }

    return util.concatUint8Array(arr).subarray(0, numBytes);
  }
}

const allowedS2KTypesForEncryption = new Set([enums.s2k.argon2, enums.s2k.iterated]);

/**
 * Instantiate a new S2K instance of the given type
 * @param {module:enums.s2k} type
 * @oaram {Object} [config]
 * @returns {Object} New s2k object
 * @throws {Error} for unknown or unsupported types
 */
function newS2KFromType(type, config$1 = config) {
  switch (type) {
    case enums.s2k.argon2:
      return new Argon2S2K(config$1);
    case enums.s2k.iterated:
    case enums.s2k.gnu:
    case enums.s2k.salted:
    case enums.s2k.simple:
      return new GenericS2K(type, config$1);
    default:
      throw new UnsupportedError('Unsupported S2K type');
  }
}

/**
 * Instantiate a new S2K instance based on the config settings
 * @oaram {Object} config
 * @returns {Object} New s2k object
 * @throws {Error} for unknown or unsupported types
 */
function newS2KFromConfig(config) {
  const { s2kType } = config;

  if (!allowedS2KTypesForEncryption.has(s2kType)) {
    throw new Error('The provided `config.s2kType` value is not allowed');
  }

  return newS2KFromType(s2kType, config);
}

// DEFLATE is a complex format; to read this code, you should probably check the RFC first:
// https://tools.ietf.org/html/rfc1951
// You may also wish to take a look at the guide I made about this program:
// https://gist.github.com/101arrowz/253f31eb5abc3d9275ab943003ffecad
// Some of the following code is similar to that of UZIP.js:
// https://github.com/photopea/UZIP.js
// However, the vast majority of the codebase has diverged from UZIP.js to increase performance and reduce bundle size.
// Sometimes 0 will appear where -1 would be more appropriate. This is because using a uint
// is better for memory in most engines (I *think*).

// aliases for shorter compressed code (most minifers don't do this)
var u8 = Uint8Array, u16 = Uint16Array, u32 = Uint32Array;
// fixed length extra bits
var fleb = new u8([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, /* unused */ 0, 0, /* impossible */ 0]);
// fixed distance extra bits
// see fleb note
var fdeb = new u8([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, /* unused */ 0, 0]);
// code length index map
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
// get base, reverse index map from extra bits
var freb = function (eb, start) {
    var b = new u16(31);
    for (var i = 0; i < 31; ++i) {
        b[i] = start += 1 << eb[i - 1];
    }
    // numbers here are at max 18 bits
    var r = new u32(b[30]);
    for (var i = 1; i < 30; ++i) {
        for (var j = b[i]; j < b[i + 1]; ++j) {
            r[j] = ((j - b[i]) << 5) | i;
        }
    }
    return [b, r];
};
var _a = freb(fleb, 2), fl = _a[0], revfl = _a[1];
// we can ignore the fact that the other numbers are wrong; they never happen anyway
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0), fd = _b[0], revfd = _b[1];
// map of value to reverse (assuming 16 bits)
var rev = new u16(32768);
for (var i = 0; i < 32768; ++i) {
    // reverse table algorithm from SO
    var x = ((i & 0xAAAA) >>> 1) | ((i & 0x5555) << 1);
    x = ((x & 0xCCCC) >>> 2) | ((x & 0x3333) << 2);
    x = ((x & 0xF0F0) >>> 4) | ((x & 0x0F0F) << 4);
    rev[i] = (((x & 0xFF00) >>> 8) | ((x & 0x00FF) << 8)) >>> 1;
}
// create huffman tree from u8 "map": index -> code length for code index
// mb (max bits) must be at most 15
// TODO: optimize/split up?
var hMap = (function (cd, mb, r) {
    var s = cd.length;
    // index
    var i = 0;
    // u16 "map": index -> # of codes with bit length = index
    var l = new u16(mb);
    // length of cd must be 288 (total # of codes)
    for (; i < s; ++i) {
        if (cd[i])
            ++l[cd[i] - 1];
    }
    // u16 "map": index -> minimum code for bit length = index
    var le = new u16(mb);
    for (i = 0; i < mb; ++i) {
        le[i] = (le[i - 1] + l[i - 1]) << 1;
    }
    var co;
    if (r) {
        // u16 "map": index -> number of actual bits, symbol for code
        co = new u16(1 << mb);
        // bits to remove for reverser
        var rvb = 15 - mb;
        for (i = 0; i < s; ++i) {
            // ignore 0 lengths
            if (cd[i]) {
                // num encoding both symbol and bits read
                var sv = (i << 4) | cd[i];
                // free bits
                var r_1 = mb - cd[i];
                // start value
                var v = le[cd[i] - 1]++ << r_1;
                // m is end value
                for (var m = v | ((1 << r_1) - 1); v <= m; ++v) {
                    // every 16 bit value starting with the code yields the same result
                    co[rev[v] >>> rvb] = sv;
                }
            }
        }
    }
    else {
        co = new u16(s);
        for (i = 0; i < s; ++i) {
            if (cd[i]) {
                co[i] = rev[le[cd[i] - 1]++] >>> (15 - cd[i]);
            }
        }
    }
    return co;
});
// fixed length tree
var flt = new u8(288);
for (var i = 0; i < 144; ++i)
    flt[i] = 8;
for (var i = 144; i < 256; ++i)
    flt[i] = 9;
for (var i = 256; i < 280; ++i)
    flt[i] = 7;
for (var i = 280; i < 288; ++i)
    flt[i] = 8;
// fixed distance tree
var fdt = new u8(32);
for (var i = 0; i < 32; ++i)
    fdt[i] = 5;
// fixed length map
var flm = /*#__PURE__*/ hMap(flt, 9, 0), flrm = /*#__PURE__*/ hMap(flt, 9, 1);
// fixed distance map
var fdm = /*#__PURE__*/ hMap(fdt, 5, 0), fdrm = /*#__PURE__*/ hMap(fdt, 5, 1);
// find max of array
var max = function (a) {
    var m = a[0];
    for (var i = 1; i < a.length; ++i) {
        if (a[i] > m)
            m = a[i];
    }
    return m;
};
// read d, starting at bit p and mask with m
var bits = function (d, p, m) {
    var o = (p / 8) | 0;
    return ((d[o] | (d[o + 1] << 8)) >> (p & 7)) & m;
};
// read d, starting at bit p continuing for at least 16 bits
var bits16 = function (d, p) {
    var o = (p / 8) | 0;
    return ((d[o] | (d[o + 1] << 8) | (d[o + 2] << 16)) >> (p & 7));
};
// get end of byte
var shft = function (p) { return ((p + 7) / 8) | 0; };
// typed array slice - allows garbage collector to free original reference,
// while being more compatible than .slice
var slc = function (v, s, e) {
    if (s == null || s < 0)
        s = 0;
    if (e == null || e > v.length)
        e = v.length;
    // can't use .constructor in case user-supplied
    var n = new (v.BYTES_PER_ELEMENT == 2 ? u16 : v.BYTES_PER_ELEMENT == 4 ? u32 : u8)(e - s);
    n.set(v.subarray(s, e));
    return n;
};
// error codes
var ec = [
    'unexpected EOF',
    'invalid block type',
    'invalid length/literal',
    'invalid distance',
    'stream finished',
    'no stream handler',
    ,
    'no callback',
    'invalid UTF-8 data',
    'extra field too long',
    'date not in range 1980-2099',
    'filename too long',
    'stream finishing',
    'invalid zip data'
    // determined by unknown compression method
];
var err = function (ind, msg, nt) {
    var e = new Error(msg || ec[ind]);
    e.code = ind;
    if (Error.captureStackTrace)
        Error.captureStackTrace(e, err);
    if (!nt)
        throw e;
    return e;
};
// expands raw DEFLATE data
var inflt = function (dat, buf, st) {
    // source length
    var sl = dat.length;
    if (!sl || (st && st.f && !st.l))
        return buf || new u8(0);
    // have to estimate size
    var noBuf = !buf || st;
    // no state
    var noSt = !st || st.i;
    if (!st)
        st = {};
    // Assumes roughly 33% compression ratio average
    if (!buf)
        buf = new u8(sl * 3);
    // ensure buffer can fit at least l elements
    var cbuf = function (l) {
        var bl = buf.length;
        // need to increase size to fit
        if (l > bl) {
            // Double or set to necessary, whichever is greater
            var nbuf = new u8(Math.max(bl * 2, l));
            nbuf.set(buf);
            buf = nbuf;
        }
    };
    //  last chunk         bitpos           bytes
    var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
    // total bits
    var tbts = sl * 8;
    do {
        if (!lm) {
            // BFINAL - this is only 1 when last chunk is next
            final = bits(dat, pos, 1);
            // type: 0 = no compression, 1 = fixed huffman, 2 = dynamic huffman
            var type = bits(dat, pos + 1, 3);
            pos += 3;
            if (!type) {
                // go to end of byte boundary
                var s = shft(pos) + 4, l = dat[s - 4] | (dat[s - 3] << 8), t = s + l;
                if (t > sl) {
                    if (noSt)
                        err(0);
                    break;
                }
                // ensure size
                if (noBuf)
                    cbuf(bt + l);
                // Copy over uncompressed data
                buf.set(dat.subarray(s, t), bt);
                // Get new bitpos, update byte count
                st.b = bt += l, st.p = pos = t * 8, st.f = final;
                continue;
            }
            else if (type == 1)
                lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
            else if (type == 2) {
                //  literal                            lengths
                var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
                var tl = hLit + bits(dat, pos + 5, 31) + 1;
                pos += 14;
                // length+distance tree
                var ldt = new u8(tl);
                // code length tree
                var clt = new u8(19);
                for (var i = 0; i < hcLen; ++i) {
                    // use index map to get real code
                    clt[clim[i]] = bits(dat, pos + i * 3, 7);
                }
                pos += hcLen * 3;
                // code lengths bits
                var clb = max(clt), clbmsk = (1 << clb) - 1;
                // code lengths map
                var clm = hMap(clt, clb, 1);
                for (var i = 0; i < tl;) {
                    var r = clm[bits(dat, pos, clbmsk)];
                    // bits read
                    pos += r & 15;
                    // symbol
                    var s = r >>> 4;
                    // code length to copy
                    if (s < 16) {
                        ldt[i++] = s;
                    }
                    else {
                        //  copy   count
                        var c = 0, n = 0;
                        if (s == 16)
                            n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i - 1];
                        else if (s == 17)
                            n = 3 + bits(dat, pos, 7), pos += 3;
                        else if (s == 18)
                            n = 11 + bits(dat, pos, 127), pos += 7;
                        while (n--)
                            ldt[i++] = c;
                    }
                }
                //    length tree                 distance tree
                var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
                // max length bits
                lbt = max(lt);
                // max dist bits
                dbt = max(dt);
                lm = hMap(lt, lbt, 1);
                dm = hMap(dt, dbt, 1);
            }
            else
                err(1);
            if (pos > tbts) {
                if (noSt)
                    err(0);
                break;
            }
        }
        // Make sure the buffer can hold this + the largest possible addition
        // Maximum chunk size (practically, theoretically infinite) is 2^17;
        if (noBuf)
            cbuf(bt + 131072);
        var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
        var lpos = pos;
        for (;; lpos = pos) {
            // bits read, code
            var c = lm[bits16(dat, pos) & lms], sym = c >>> 4;
            pos += c & 15;
            if (pos > tbts) {
                if (noSt)
                    err(0);
                break;
            }
            if (!c)
                err(2);
            if (sym < 256)
                buf[bt++] = sym;
            else if (sym == 256) {
                lpos = pos, lm = null;
                break;
            }
            else {
                var add = sym - 254;
                // no extra bits needed if less
                if (sym > 264) {
                    // index
                    var i = sym - 257, b = fleb[i];
                    add = bits(dat, pos, (1 << b) - 1) + fl[i];
                    pos += b;
                }
                // dist
                var d = dm[bits16(dat, pos) & dms], dsym = d >>> 4;
                if (!d)
                    err(3);
                pos += d & 15;
                var dt = fd[dsym];
                if (dsym > 3) {
                    var b = fdeb[dsym];
                    dt += bits16(dat, pos) & ((1 << b) - 1), pos += b;
                }
                if (pos > tbts) {
                    if (noSt)
                        err(0);
                    break;
                }
                if (noBuf)
                    cbuf(bt + 131072);
                var end = bt + add;
                for (; bt < end; bt += 4) {
                    buf[bt] = buf[bt - dt];
                    buf[bt + 1] = buf[bt + 1 - dt];
                    buf[bt + 2] = buf[bt + 2 - dt];
                    buf[bt + 3] = buf[bt + 3 - dt];
                }
                bt = end;
            }
        }
        st.l = lm, st.p = lpos, st.b = bt, st.f = final;
        if (lm)
            final = 1, st.m = lbt, st.d = dm, st.n = dbt;
    } while (!final);
    return bt == buf.length ? buf : slc(buf, 0, bt);
};
// starting at p, write the minimum number of bits that can hold v to d
var wbits = function (d, p, v) {
    v <<= p & 7;
    var o = (p / 8) | 0;
    d[o] |= v;
    d[o + 1] |= v >>> 8;
};
// starting at p, write the minimum number of bits (>8) that can hold v to d
var wbits16 = function (d, p, v) {
    v <<= p & 7;
    var o = (p / 8) | 0;
    d[o] |= v;
    d[o + 1] |= v >>> 8;
    d[o + 2] |= v >>> 16;
};
// creates code lengths from a frequency table
var hTree = function (d, mb) {
    // Need extra info to make a tree
    var t = [];
    for (var i = 0; i < d.length; ++i) {
        if (d[i])
            t.push({ s: i, f: d[i] });
    }
    var s = t.length;
    var t2 = t.slice();
    if (!s)
        return [et, 0];
    if (s == 1) {
        var v = new u8(t[0].s + 1);
        v[t[0].s] = 1;
        return [v, 1];
    }
    t.sort(function (a, b) { return a.f - b.f; });
    // after i2 reaches last ind, will be stopped
    // freq must be greater than largest possible number of symbols
    t.push({ s: -1, f: 25001 });
    var l = t[0], r = t[1], i0 = 0, i1 = 1, i2 = 2;
    t[0] = { s: -1, f: l.f + r.f, l: l, r: r };
    // efficient algorithm from UZIP.js
    // i0 is lookbehind, i2 is lookahead - after processing two low-freq
    // symbols that combined have high freq, will start processing i2 (high-freq,
    // non-composite) symbols instead
    // see https://reddit.com/r/photopea/comments/ikekht/uzipjs_questions/
    while (i1 != s - 1) {
        l = t[t[i0].f < t[i2].f ? i0++ : i2++];
        r = t[i0 != i1 && t[i0].f < t[i2].f ? i0++ : i2++];
        t[i1++] = { s: -1, f: l.f + r.f, l: l, r: r };
    }
    var maxSym = t2[0].s;
    for (var i = 1; i < s; ++i) {
        if (t2[i].s > maxSym)
            maxSym = t2[i].s;
    }
    // code lengths
    var tr = new u16(maxSym + 1);
    // max bits in tree
    var mbt = ln(t[i1 - 1], tr, 0);
    if (mbt > mb) {
        // more algorithms from UZIP.js
        // TODO: find out how this code works (debt)
        //  ind    debt
        var i = 0, dt = 0;
        //    left            cost
        var lft = mbt - mb, cst = 1 << lft;
        t2.sort(function (a, b) { return tr[b.s] - tr[a.s] || a.f - b.f; });
        for (; i < s; ++i) {
            var i2_1 = t2[i].s;
            if (tr[i2_1] > mb) {
                dt += cst - (1 << (mbt - tr[i2_1]));
                tr[i2_1] = mb;
            }
            else
                break;
        }
        dt >>>= lft;
        while (dt > 0) {
            var i2_2 = t2[i].s;
            if (tr[i2_2] < mb)
                dt -= 1 << (mb - tr[i2_2]++ - 1);
            else
                ++i;
        }
        for (; i >= 0 && dt; --i) {
            var i2_3 = t2[i].s;
            if (tr[i2_3] == mb) {
                --tr[i2_3];
                ++dt;
            }
        }
        mbt = mb;
    }
    return [new u8(tr), mbt];
};
// get the max length and assign length codes
var ln = function (n, l, d) {
    return n.s == -1
        ? Math.max(ln(n.l, l, d + 1), ln(n.r, l, d + 1))
        : (l[n.s] = d);
};
// length codes generation
var lc = function (c) {
    var s = c.length;
    // Note that the semicolon was intentional
    while (s && !c[--s])
        ;
    var cl = new u16(++s);
    //  ind      num         streak
    var cli = 0, cln = c[0], cls = 1;
    var w = function (v) { cl[cli++] = v; };
    for (var i = 1; i <= s; ++i) {
        if (c[i] == cln && i != s)
            ++cls;
        else {
            if (!cln && cls > 2) {
                for (; cls > 138; cls -= 138)
                    w(32754);
                if (cls > 2) {
                    w(cls > 10 ? ((cls - 11) << 5) | 28690 : ((cls - 3) << 5) | 12305);
                    cls = 0;
                }
            }
            else if (cls > 3) {
                w(cln), --cls;
                for (; cls > 6; cls -= 6)
                    w(8304);
                if (cls > 2)
                    w(((cls - 3) << 5) | 8208), cls = 0;
            }
            while (cls--)
                w(cln);
            cls = 1;
            cln = c[i];
        }
    }
    return [cl.subarray(0, cli), s];
};
// calculate the length of output from tree, code lengths
var clen = function (cf, cl) {
    var l = 0;
    for (var i = 0; i < cl.length; ++i)
        l += cf[i] * cl[i];
    return l;
};
// writes a fixed block
// returns the new bit pos
var wfblk = function (out, pos, dat) {
    // no need to write 00 as type: TypedArray defaults to 0
    var s = dat.length;
    var o = shft(pos + 2);
    out[o] = s & 255;
    out[o + 1] = s >>> 8;
    out[o + 2] = out[o] ^ 255;
    out[o + 3] = out[o + 1] ^ 255;
    for (var i = 0; i < s; ++i)
        out[o + i + 4] = dat[i];
    return (o + 4 + s) * 8;
};
// writes a block
var wblk = function (dat, out, final, syms, lf, df, eb, li, bs, bl, p) {
    wbits(out, p++, final);
    ++lf[256];
    var _a = hTree(lf, 15), dlt = _a[0], mlb = _a[1];
    var _b = hTree(df, 15), ddt = _b[0], mdb = _b[1];
    var _c = lc(dlt), lclt = _c[0], nlc = _c[1];
    var _d = lc(ddt), lcdt = _d[0], ndc = _d[1];
    var lcfreq = new u16(19);
    for (var i = 0; i < lclt.length; ++i)
        lcfreq[lclt[i] & 31]++;
    for (var i = 0; i < lcdt.length; ++i)
        lcfreq[lcdt[i] & 31]++;
    var _e = hTree(lcfreq, 7), lct = _e[0], mlcb = _e[1];
    var nlcc = 19;
    for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc)
        ;
    var flen = (bl + 5) << 3;
    var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
    var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + (2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18]);
    if (flen <= ftlen && flen <= dtlen)
        return wfblk(out, p, dat.subarray(bs, bs + bl));
    var lm, ll, dm, dl;
    wbits(out, p, 1 + (dtlen < ftlen)), p += 2;
    if (dtlen < ftlen) {
        lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
        var llm = hMap(lct, mlcb, 0);
        wbits(out, p, nlc - 257);
        wbits(out, p + 5, ndc - 1);
        wbits(out, p + 10, nlcc - 4);
        p += 14;
        for (var i = 0; i < nlcc; ++i)
            wbits(out, p + 3 * i, lct[clim[i]]);
        p += 3 * nlcc;
        var lcts = [lclt, lcdt];
        for (var it = 0; it < 2; ++it) {
            var clct = lcts[it];
            for (var i = 0; i < clct.length; ++i) {
                var len = clct[i] & 31;
                wbits(out, p, llm[len]), p += lct[len];
                if (len > 15)
                    wbits(out, p, (clct[i] >>> 5) & 127), p += clct[i] >>> 12;
            }
        }
    }
    else {
        lm = flm, ll = flt, dm = fdm, dl = fdt;
    }
    for (var i = 0; i < li; ++i) {
        if (syms[i] > 255) {
            var len = (syms[i] >>> 18) & 31;
            wbits16(out, p, lm[len + 257]), p += ll[len + 257];
            if (len > 7)
                wbits(out, p, (syms[i] >>> 23) & 31), p += fleb[len];
            var dst = syms[i] & 31;
            wbits16(out, p, dm[dst]), p += dl[dst];
            if (dst > 3)
                wbits16(out, p, (syms[i] >>> 5) & 8191), p += fdeb[dst];
        }
        else {
            wbits16(out, p, lm[syms[i]]), p += ll[syms[i]];
        }
    }
    wbits16(out, p, lm[256]);
    return p + ll[256];
};
// deflate options (nice << 13) | chain
var deo = /*#__PURE__*/ new u32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
// empty
var et = /*#__PURE__*/ new u8(0);
// compresses data into a raw DEFLATE buffer
var dflt = function (dat, lvl, plvl, pre, post, lst) {
    var s = dat.length;
    var o = new u8(pre + s + 5 * (1 + Math.ceil(s / 7000)) + post);
    // writing to this writes to the output buffer
    var w = o.subarray(pre, o.length - post);
    var pos = 0;
    if (!lvl || s < 8) {
        for (var i = 0; i <= s; i += 65535) {
            // end
            var e = i + 65535;
            if (e >= s) {
                // write final block
                w[pos >> 3] = lst;
            }
            pos = wfblk(w, pos + 1, dat.subarray(i, e));
        }
    }
    else {
        var opt = deo[lvl - 1];
        var n = opt >>> 13, c = opt & 8191;
        var msk_1 = (1 << plvl) - 1;
        //    prev 2-byte val map    curr 2-byte val map
        var prev = new u16(32768), head = new u16(msk_1 + 1);
        var bs1_1 = Math.ceil(plvl / 3), bs2_1 = 2 * bs1_1;
        var hsh = function (i) { return (dat[i] ^ (dat[i + 1] << bs1_1) ^ (dat[i + 2] << bs2_1)) & msk_1; };
        // 24576 is an arbitrary number of maximum symbols per block
        // 424 buffer for last block
        var syms = new u32(25000);
        // length/literal freq   distance freq
        var lf = new u16(288), df = new u16(32);
        //  l/lcnt  exbits  index  l/lind  waitdx  bitpos
        var lc_1 = 0, eb = 0, i = 0, li = 0, wi = 0, bs = 0;
        for (; i < s; ++i) {
            // hash value
            // deopt when i > s - 3 - at end, deopt acceptable
            var hv = hsh(i);
            // index mod 32768    previous index mod
            var imod = i & 32767, pimod = head[hv];
            prev[imod] = pimod;
            head[hv] = imod;
            // We always should modify head and prev, but only add symbols if
            // this data is not yet processed ("wait" for wait index)
            if (wi <= i) {
                // bytes remaining
                var rem = s - i;
                if ((lc_1 > 7000 || li > 24576) && rem > 423) {
                    pos = wblk(dat, w, 0, syms, lf, df, eb, li, bs, i - bs, pos);
                    li = lc_1 = eb = 0, bs = i;
                    for (var j = 0; j < 286; ++j)
                        lf[j] = 0;
                    for (var j = 0; j < 30; ++j)
                        df[j] = 0;
                }
                //  len    dist   chain
                var l = 2, d = 0, ch_1 = c, dif = (imod - pimod) & 32767;
                if (rem > 2 && hv == hsh(i - dif)) {
                    var maxn = Math.min(n, rem) - 1;
                    var maxd = Math.min(32767, i);
                    // max possible length
                    // not capped at dif because decompressors implement "rolling" index population
                    var ml = Math.min(258, rem);
                    while (dif <= maxd && --ch_1 && imod != pimod) {
                        if (dat[i + l] == dat[i + l - dif]) {
                            var nl = 0;
                            for (; nl < ml && dat[i + nl] == dat[i + nl - dif]; ++nl)
                                ;
                            if (nl > l) {
                                l = nl, d = dif;
                                // break out early when we reach "nice" (we are satisfied enough)
                                if (nl > maxn)
                                    break;
                                // now, find the rarest 2-byte sequence within this
                                // length of literals and search for that instead.
                                // Much faster than just using the start
                                var mmd = Math.min(dif, nl - 2);
                                var md = 0;
                                for (var j = 0; j < mmd; ++j) {
                                    var ti = (i - dif + j + 32768) & 32767;
                                    var pti = prev[ti];
                                    var cd = (ti - pti + 32768) & 32767;
                                    if (cd > md)
                                        md = cd, pimod = ti;
                                }
                            }
                        }
                        // check the previous match
                        imod = pimod, pimod = prev[imod];
                        dif += (imod - pimod + 32768) & 32767;
                    }
                }
                // d will be nonzero only when a match was found
                if (d) {
                    // store both dist and len data in one Uint32
                    // Make sure this is recognized as a len/dist with 28th bit (2^28)
                    syms[li++] = 268435456 | (revfl[l] << 18) | revfd[d];
                    var lin = revfl[l] & 31, din = revfd[d] & 31;
                    eb += fleb[lin] + fdeb[din];
                    ++lf[257 + lin];
                    ++df[din];
                    wi = i + l;
                    ++lc_1;
                }
                else {
                    syms[li++] = dat[i];
                    ++lf[dat[i]];
                }
            }
        }
        pos = wblk(dat, w, lst, syms, lf, df, eb, li, bs, i - bs, pos);
        // this is the easiest way to avoid needing to maintain state
        if (!lst && pos & 7)
            pos = wfblk(w, pos + 1, et);
    }
    return slc(o, 0, pre + shft(pos) + post);
};
// Alder32
var adler = function () {
    var a = 1, b = 0;
    return {
        p: function (d) {
            // closures have awful performance
            var n = a, m = b;
            var l = d.length | 0;
            for (var i = 0; i != l;) {
                var e = Math.min(i + 2655, l);
                for (; i < e; ++i)
                    m += n += d[i];
                n = (n & 65535) + 15 * (n >> 16), m = (m & 65535) + 15 * (m >> 16);
            }
            a = n, b = m;
        },
        d: function () {
            a %= 65521, b %= 65521;
            return (a & 255) << 24 | (a >>> 8) << 16 | (b & 255) << 8 | (b >>> 8);
        }
    };
};
// deflate with opts
var dopt = function (dat, opt, pre, post, st) {
    return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : (12 + opt.mem), pre, post, !st);
};
// write bytes
var wbytes = function (d, b, v) {
    for (; v; ++b)
        d[b] = v, v >>>= 8;
};
// zlib header
var zlh = function (c, o) {
    var lv = o.level, fl = lv == 0 ? 0 : lv < 6 ? 1 : lv == 9 ? 3 : 2;
    c[0] = 120, c[1] = (fl << 6) | (fl ? (32 - 2 * fl) : 1);
};
// zlib footer: -4 to -0 is Adler32
/**
 * Streaming DEFLATE compression
 */
var Deflate = /*#__PURE__*/ (function () {
    function Deflate(opts, cb) {
        if (!cb && typeof opts == 'function')
            cb = opts, opts = {};
        this.ondata = cb;
        this.o = opts || {};
    }
    Deflate.prototype.p = function (c, f) {
        this.ondata(dopt(c, this.o, 0, 0, !f), f);
    };
    /**
     * Pushes a chunk to be deflated
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    Deflate.prototype.push = function (chunk, final) {
        if (!this.ondata)
            err(5);
        if (this.d)
            err(4);
        this.d = final;
        this.p(chunk, final || false);
    };
    return Deflate;
}());
/**
 * Streaming DEFLATE decompression
 */
var Inflate = /*#__PURE__*/ (function () {
    /**
     * Creates an inflation stream
     * @param cb The callback to call whenever data is inflated
     */
    function Inflate(cb) {
        this.s = {};
        this.p = new u8(0);
        this.ondata = cb;
    }
    Inflate.prototype.e = function (c) {
        if (!this.ondata)
            err(5);
        if (this.d)
            err(4);
        var l = this.p.length;
        var n = new u8(l + c.length);
        n.set(this.p), n.set(c, l), this.p = n;
    };
    Inflate.prototype.c = function (final) {
        this.d = this.s.i = final || false;
        var bts = this.s.b;
        var dt = inflt(this.p, this.o, this.s);
        this.ondata(slc(dt, bts, this.s.b), this.d);
        this.o = slc(dt, this.s.b - 32768), this.s.b = this.o.length;
        this.p = slc(this.p, (this.s.p / 8) | 0), this.s.p &= 7;
    };
    /**
     * Pushes a chunk to be inflated
     * @param chunk The chunk to push
     * @param final Whether this is the final chunk
     */
    Inflate.prototype.push = function (chunk, final) {
        this.e(chunk), this.c(final);
    };
    return Inflate;
}());
/**
 * Streaming Zlib compression
 */
var Zlib = /*#__PURE__*/ (function () {
    function Zlib(opts, cb) {
        this.c = adler();
        this.v = 1;
        Deflate.call(this, opts, cb);
    }
    /**
     * Pushes a chunk to be zlibbed
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    Zlib.prototype.push = function (chunk, final) {
        Deflate.prototype.push.call(this, chunk, final);
    };
    Zlib.prototype.p = function (c, f) {
        this.c.p(c);
        var raw = dopt(c, this.o, this.v && 2, f && 4, !f);
        if (this.v)
            zlh(raw, this.o), this.v = 0;
        if (f)
            wbytes(raw, raw.length - 4, this.c.d());
        this.ondata(raw, f);
    };
    return Zlib;
}());
/**
 * Streaming Zlib decompression
 */
var Unzlib = /*#__PURE__*/ (function () {
    /**
     * Creates a Zlib decompression stream
     * @param cb The callback to call whenever data is inflated
     */
    function Unzlib(cb) {
        this.v = 1;
        Inflate.call(this, cb);
    }
    /**
     * Pushes a chunk to be unzlibbed
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    Unzlib.prototype.push = function (chunk, final) {
        Inflate.prototype.e.call(this, chunk);
        if (this.v) {
            if (this.p.length < 2 && !final)
                return;
            this.p = this.p.subarray(2), this.v = 0;
        }
        if (final) {
            if (this.p.length < 4)
                err(6, 'invalid zlib data');
            this.p = this.p.subarray(0, -4);
        }
        // necessary to prevent TS from using the closure value
        // This allows for workerization to function correctly
        Inflate.prototype.c.call(this, final);
    };
    return Unzlib;
}());
// text decoder
var td = typeof TextDecoder != 'undefined' && /*#__PURE__*/ new TextDecoder();
// text decoder stream
var tds = 0;
try {
    td.decode(et, { stream: true });
    tds = 1;
}
catch (e) { }

// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


/**
 * Implementation of the Literal Data Packet (Tag 11)
 *
 * {@link https://tools.ietf.org/html/rfc4880#section-5.9|RFC4880 5.9}:
 * A Literal Data packet contains the body of a message; data that is not to be
 * further interpreted.
 */
class LiteralDataPacket {
  static get tag() {
    return enums.packet.literalData;
  }

  /**
   * @param {Date} date - The creation date of the literal package
   */
  constructor(date = new Date()) {
    this.format = enums.literal.utf8; // default format for literal data packets
    this.date = util.normalizeDate(date);
    this.text = null; // textual data representation
    this.data = null; // literal data representation
    this.filename = '';
  }

  /**
   * Set the packet data to a javascript native string, end of line
   * will be normalized to \r\n and by default text is converted to UTF8
   * @param {String | ReadableStream<String>} text - Any native javascript string
   * @param {enums.literal} [format] - The format of the string of bytes
   */
  setText(text, format = enums.literal.utf8) {
    this.format = format;
    this.text = text;
    this.data = null;
  }

  /**
   * Returns literal data packets as native JavaScript string
   * with normalized end of line to \n
   * @param {Boolean} [clone] - Whether to return a clone so that getBytes/getText can be called again
   * @returns {String | ReadableStream<String>} Literal data as text.
   */
  getText(clone = false) {
    if (this.text === null || util.isStream(this.text)) { // Assume that this.text has been read
      this.text = util.decodeUTF8(util.nativeEOL(this.getBytes(clone)));
    }
    return this.text;
  }

  /**
   * Set the packet data to value represented by the provided string of bytes.
   * @param {Uint8Array | ReadableStream<Uint8Array>} bytes - The string of bytes
   * @param {enums.literal} format - The format of the string of bytes
   */
  setBytes(bytes, format) {
    this.format = format;
    this.data = bytes;
    this.text = null;
  }


  /**
   * Get the byte sequence representing the literal packet data
   * @param {Boolean} [clone] - Whether to return a clone so that getBytes/getText can be called again
   * @returns {Uint8Array | ReadableStream<Uint8Array>} A sequence of bytes.
   */
  getBytes(clone = false) {
    if (this.data === null) {
      // encode UTF8 and normalize EOL to \r\n
      this.data = util.canonicalizeEOL(util.encodeUTF8(this.text));
    }
    if (clone) {
      return passiveClone(this.data);
    }
    return this.data;
  }


  /**
   * Sets the filename of the literal packet data
   * @param {String} filename - Any native javascript string
   */
  setFilename(filename) {
    this.filename = filename;
  }


  /**
   * Get the filename of the literal packet data
   * @returns {String} Filename.
   */
  getFilename() {
    return this.filename;
  }

  /**
   * Parsing function for a literal data packet (tag 11).
   *
   * @param {Uint8Array | ReadableStream<Uint8Array>} input - Payload of a tag 11 packet
   * @returns {Promise<LiteralDataPacket>} Object representation.
   * @async
   */
  async read(bytes) {
    await parse(bytes, async reader => {
      // - A one-octet field that describes how the data is formatted.
      const format = await reader.readByte(); // enums.literal

      const filename_len = await reader.readByte();
      this.filename = util.decodeUTF8(await reader.readBytes(filename_len));

      this.date = util.readDate(await reader.readBytes(4));

      let data = reader.remainder();
      if (isArrayStream(data)) data = await readToEnd(data);
      this.setBytes(data, format);
    });
  }

  /**
   * Creates a Uint8Array representation of the packet, excluding the data
   *
   * @returns {Uint8Array} Uint8Array representation of the packet.
   */
  writeHeader() {
    const filename = util.encodeUTF8(this.filename);
    const filename_length = new Uint8Array([filename.length]);

    const format = new Uint8Array([this.format]);
    const date = util.writeDate(this.date);

    return util.concatUint8Array([format, filename_length, filename, date]);
  }

  /**
   * Creates a Uint8Array representation of the packet
   *
   * @returns {Uint8Array | ReadableStream<Uint8Array>} Uint8Array representation of the packet.
   */
  write() {
    const header = this.writeHeader();
    const data = this.getBytes();

    return util.concat([header, data]);
  }
}

// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


/**
 * Implementation of type key id
 *
 * {@link https://tools.ietf.org/html/rfc4880#section-3.3|RFC4880 3.3}:
 * A Key ID is an eight-octet scalar that identifies a key.
 * Implementations SHOULD NOT assume that Key IDs are unique.  The
 * section "Enhanced Key Formats" below describes how Key IDs are
 * formed.
 */
class KeyID {
  constructor() {
    this.bytes = '';
  }

  /**
   * Parsing method for a key id
   * @param {Uint8Array} bytes - Input to read the key id from
   */
  read(bytes) {
    this.bytes = util.uint8ArrayToString(bytes.subarray(0, 8));
    return this.bytes.length;
  }

  /**
   * Serializes the Key ID
   * @returns {Uint8Array} Key ID as a Uint8Array.
   */
  write() {
    return util.stringToUint8Array(this.bytes);
  }

  /**
   * Returns the Key ID represented as a hexadecimal string
   * @returns {String} Key ID as a hexadecimal string.
   */
  toHex() {
    return util.uint8ArrayToHex(util.stringToUint8Array(this.bytes));
  }

  /**
   * Checks equality of Key ID's
   * @param {KeyID} keyID
   * @param {Boolean} matchWildcard - Indicates whether to check if either keyID is a wildcard
   */
  equals(keyID, matchWildcard = false) {
    return (matchWildcard && (keyID.isWildcard() || this.isWildcard())) || this.bytes === keyID.bytes;
  }

  /**
   * Checks to see if the Key ID is unset
   * @returns {Boolean} True if the Key ID is null.
   */
  isNull() {
    return this.bytes === '';
  }

  /**
   * Checks to see if the Key ID is a "wildcard" Key ID (all zeros)
   * @returns {Boolean} True if this is a wildcard Key ID.
   */
  isWildcard() {
    return /^0+$/.test(this.toHex());
  }

  static mapToHex(keyID) {
    return keyID.toHex();
  }

  static fromID(hex) {
    const keyID = new KeyID();
    keyID.read(util.hexToUint8Array(hex));
    return keyID;
  }

  static wildcard() {
    const keyID = new KeyID();
    keyID.read(new Uint8Array(8));
    return keyID;
  }
}

// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


// Symbol to store cryptographic validity of the signature, to avoid recomputing multiple times on verification.
const verified = Symbol('verified');

// A salt notation is used to randomize signatures.
// This is to protect EdDSA signatures in particular, which are known to be vulnerable to fault attacks
// leading to secret key extraction if two signatures over the same data can be collected (see https://github.com/jedisct1/libsodium/issues/170).
// For simplicity, we add the salt to all algos, as it may also serve as protection in case of weaknesses in the hash algo, potentially hindering e.g.
// some chosen-prefix attacks.
// v6 signatures do not need to rely on this notation, as they already include a separate, built-in salt.
const SALT_NOTATION_NAME = 'salt@notations.openpgpjs.org';

// GPG puts the Issuer and Signature subpackets in the unhashed area.
// Tampering with those invalidates the signature, so we still trust them and parse them.
// All other unhashed subpackets are ignored.
const allowedUnhashedSubpackets = new Set([
  enums.signatureSubpacket.issuerKeyID,
  enums.signatureSubpacket.issuerFingerprint,
  enums.signatureSubpacket.embeddedSignature
]);

/**
 * Implementation of the Signature Packet (Tag 2)
 *
 * {@link https://tools.ietf.org/html/rfc4880#section-5.2|RFC4480 5.2}:
 * A Signature packet describes a binding between some public key and
 * some data.  The most common signatures are a signature of a file or a
 * block of text, and a signature that is a certification of a User ID.
 */
class SignaturePacket {
  static get tag() {
    return enums.packet.signature;
  }

  constructor() {
    this.version = null;
    /** @type {enums.signature} */
    this.signatureType = null;
    /** @type {enums.hash} */
    this.hashAlgorithm = null;
    /** @type {enums.publicKey} */
    this.publicKeyAlgorithm = null;

    this.signatureData = null;
    this.unhashedSubpackets = [];
    this.unknownSubpackets = [];
    this.signedHashValue = null;
    this.salt = null;

    this.created = null;
    this.signatureExpirationTime = null;
    this.signatureNeverExpires = true;
    this.exportable = null;
    this.trustLevel = null;
    this.trustAmount = null;
    this.regularExpression = null;
    this.revocable = null;
    this.keyExpirationTime = null;
    this.keyNeverExpires = null;
    this.preferredSymmetricAlgorithms = null;
    this.revocationKeyClass = null;
    this.revocationKeyAlgorithm = null;
    this.revocationKeyFingerprint = null;
    this.issuerKeyID = new KeyID();
    this.rawNotations = [];
    this.notations = {};
    this.preferredHashAlgorithms = null;
    this.preferredCompressionAlgorithms = null;
    this.keyServerPreferences = null;
    this.preferredKeyServer = null;
    this.isPrimaryUserID = null;
    this.policyURI = null;
    this.keyFlags = null;
    this.signersUserID = null;
    this.reasonForRevocationFlag = null;
    this.reasonForRevocationString = null;
    this.features = null;
    this.signatureTargetPublicKeyAlgorithm = null;
    this.signatureTargetHashAlgorithm = null;
    this.signatureTargetHash = null;
    this.embeddedSignature = null;
    this.issuerKeyVersion = null;
    this.issuerFingerprint = null;
    this.preferredAEADAlgorithms = null;
    this.preferredCipherSuites = null;

    this.revoked = null;
    this[verified] = null;
  }

  /**
   * parsing function for a signature packet (tag 2).
   * @param {String} bytes - Payload of a tag 2 packet
   * @returns {SignaturePacket} Object representation.
   */
  read(bytes, config$1 = config) {
    let i = 0;
    this.version = bytes[i++];
    if (this.version === 5 && !config$1.enableParsingV5Entities) {
      throw new UnsupportedError('Support for v5 entities is disabled; turn on `config.enableParsingV5Entities` if needed');
    }

    if (this.version !== 4 && this.version !== 5 && this.version !== 6) {
      throw new UnsupportedError(`Version ${this.version} of the signature packet is unsupported.`);
    }

    this.signatureType = bytes[i++];
    this.publicKeyAlgorithm = bytes[i++];
    this.hashAlgorithm = bytes[i++];

    // hashed subpackets
    i += this.readSubPackets(bytes.subarray(i, bytes.length), true);
    if (!this.created) {
      throw new Error('Missing signature creation time subpacket.');
    }

    // A V4 signature hashes the packet body
    // starting from its first field, the version number, through the end
    // of the hashed subpacket data.  Thus, the fields hashed are the
    // signature version, the signature type, the public-key algorithm, the
    // hash algorithm, the hashed subpacket length, and the hashed
    // subpacket body.
    this.signatureData = bytes.subarray(0, i);

    // unhashed subpackets
    i += this.readSubPackets(bytes.subarray(i, bytes.length), false);

    // Two-octet field holding left 16 bits of signed hash value.
    this.signedHashValue = bytes.subarray(i, i + 2);
    i += 2;

    // Only for v6 signatures, a variable-length field containing:
    if (this.version === 6) {
      // A one-octet salt size. The value MUST match the value defined
      // for the hash algorithm as specified in Table 23 (Hash algorithm registry).
      // To allow parsing unknown hash algos, we only check the expected salt length when verifying.
      const saltLength = bytes[i++];

      // The salt; a random value value of the specified size.
      this.salt = bytes.subarray(i, i + saltLength);
      i += saltLength;
    }

    const signatureMaterial = bytes.subarray(i, bytes.length);
    const { read, signatureParams } = parseSignatureParams(this.publicKeyAlgorithm, signatureMaterial);
    if (read < signatureMaterial.length) {
      throw new Error('Error reading MPIs');
    }
    this.params = signatureParams;
  }

  /**
   * @returns {Uint8Array | ReadableStream<Uint8Array>}
   */
  writeParams() {
    if (this.params instanceof Promise) {
      return fromAsync(
        async () => serializeParams(this.publicKeyAlgorithm, await this.params)
      );
    }
    return serializeParams(this.publicKeyAlgorithm, this.params);
  }

  write() {
    const arr = [];
    arr.push(this.signatureData);
    arr.push(this.writeUnhashedSubPackets());
    arr.push(this.signedHashValue);
    if (this.version === 6) {
      arr.push(new Uint8Array([this.salt.length]));
      arr.push(this.salt);
    }
    arr.push(this.writeParams());
    return util.concat(arr);
  }

  /**
   * Signs provided data. This needs to be done prior to serialization.
   * @param {SecretKeyPacket} key - Private key used to sign the message.
   * @param {Object} data - Contains packets to be signed.
   * @param {Date} [date] - The signature creation time.
   * @param {Boolean} [detached] - Whether to create a detached signature
   * @throws {Error} if signing failed
   * @async
   */
  async sign(key, data, date = new Date(), detached = false, config) {
    this.version = key.version;

    this.created = util.normalizeDate(date);
    this.issuerKeyVersion = key.version;
    this.issuerFingerprint = key.getFingerprintBytes();
    this.issuerKeyID = key.getKeyID();

    const arr = [new Uint8Array([this.version, this.signatureType, this.publicKeyAlgorithm, this.hashAlgorithm])];

    // add randomness to the signature
    if (this.version === 6) {
      const saltLength = saltLengthForHash(this.hashAlgorithm);
      if (this.salt === null) {
        this.salt = getRandomBytes(saltLength);
      } else if (saltLength !== this.salt.length) {
        throw new Error('Provided salt does not have the required length');
      }
    } else if (config.nonDeterministicSignaturesViaNotation) {
      const saltNotations = this.rawNotations.filter(({ name }) => (name === SALT_NOTATION_NAME));
      // since re-signing the same object is not supported, it's not expected to have multiple salt notations,
      // but we guard against it as a sanity check
      if (saltNotations.length === 0) {
        const saltValue = getRandomBytes(saltLengthForHash(this.hashAlgorithm));
        this.rawNotations.push({
          name: SALT_NOTATION_NAME,
          value: saltValue,
          humanReadable: false,
          critical: false
        });
      } else {
        throw new Error('Unexpected existing salt notation');
      }
    }

    // Add hashed subpackets
    arr.push(this.writeHashedSubPackets());

    // Remove unhashed subpackets, in case some allowed unhashed
    // subpackets existed, in order not to duplicate them (in both
    // the hashed and unhashed subpackets) when re-signing.
    this.unhashedSubpackets = [];

    this.signatureData = util.concat(arr);

    const toHash = this.toHash(this.signatureType, data, detached);
    const hash = await this.hash(this.signatureType, data, toHash, detached);

    this.signedHashValue = slice(clone(hash), 0, 2);
    const signed = async () => sign$1(
      this.publicKeyAlgorithm, this.hashAlgorithm, key.publicParams, key.privateParams, toHash, await readToEnd(hash)
    );
    if (util.isStream(hash)) {
      this.params = signed();
    } else {
      this.params = await signed();

      // Store the fact that this signature is valid, e.g. for when we call `await
      // getLatestValidSignature(this.revocationSignatures, key, data)` later.
      // Note that this only holds up if the key and data passed to verify are the
      // same as the ones passed to sign.
      this[verified] = true;
    }
  }

  /**
   * Creates Uint8Array of bytes of all subpacket data except Issuer and Embedded Signature subpackets
   * @returns {Uint8Array} Subpacket data.
   */
  writeHashedSubPackets() {
    const sub = enums.signatureSubpacket;
    const arr = [];
    let bytes;
    if (this.created === null) {
      throw new Error('Missing signature creation time');
    }
    arr.push(writeSubPacket(sub.signatureCreationTime, true, util.writeDate(this.created)));
    if (this.signatureExpirationTime !== null) {
      arr.push(writeSubPacket(sub.signatureExpirationTime, true, util.writeNumber(this.signatureExpirationTime, 4)));
    }
    if (this.exportable !== null) {
      arr.push(writeSubPacket(sub.exportableCertification, true, new Uint8Array([this.exportable ? 1 : 0])));
    }
    if (this.trustLevel !== null) {
      bytes = new Uint8Array([this.trustLevel, this.trustAmount]);
      arr.push(writeSubPacket(sub.trustSignature, true, bytes));
    }
    if (this.regularExpression !== null) {
      arr.push(writeSubPacket(sub.regularExpression, true, this.regularExpression));
    }
    if (this.revocable !== null) {
      arr.push(writeSubPacket(sub.revocable, true, new Uint8Array([this.revocable ? 1 : 0])));
    }
    if (this.keyExpirationTime !== null) {
      arr.push(writeSubPacket(sub.keyExpirationTime, true, util.writeNumber(this.keyExpirationTime, 4)));
    }
    if (this.preferredSymmetricAlgorithms !== null) {
      bytes = util.stringToUint8Array(util.uint8ArrayToString(this.preferredSymmetricAlgorithms));
      arr.push(writeSubPacket(sub.preferredSymmetricAlgorithms, false, bytes));
    }
    if (this.revocationKeyClass !== null) {
      bytes = new Uint8Array([this.revocationKeyClass, this.revocationKeyAlgorithm]);
      bytes = util.concat([bytes, this.revocationKeyFingerprint]);
      arr.push(writeSubPacket(sub.revocationKey, false, bytes));
    }
    if (!this.issuerKeyID.isNull() && this.issuerKeyVersion < 5) {
      // If the version of [the] key is greater than 4, this subpacket
      // MUST NOT be included in the signature.
      arr.push(writeSubPacket(sub.issuerKeyID, true, this.issuerKeyID.write()));
    }
    this.rawNotations.forEach(({ name, value, humanReadable, critical }) => {
      bytes = [new Uint8Array([humanReadable ? 0x80 : 0, 0, 0, 0])];
      const encodedName = util.encodeUTF8(name);
      // 2 octets of name length
      bytes.push(util.writeNumber(encodedName.length, 2));
      // 2 octets of value length
      bytes.push(util.writeNumber(value.length, 2));
      bytes.push(encodedName);
      bytes.push(value);
      bytes = util.concat(bytes);
      arr.push(writeSubPacket(sub.notationData, critical, bytes));
    });
    if (this.preferredHashAlgorithms !== null) {
      bytes = util.stringToUint8Array(util.uint8ArrayToString(this.preferredHashAlgorithms));
      arr.push(writeSubPacket(sub.preferredHashAlgorithms, false, bytes));
    }
    if (this.preferredCompressionAlgorithms !== null) {
      bytes = util.stringToUint8Array(util.uint8ArrayToString(this.preferredCompressionAlgorithms));
      arr.push(writeSubPacket(sub.preferredCompressionAlgorithms, false, bytes));
    }
    if (this.keyServerPreferences !== null) {
      bytes = util.stringToUint8Array(util.uint8ArrayToString(this.keyServerPreferences));
      arr.push(writeSubPacket(sub.keyServerPreferences, false, bytes));
    }
    if (this.preferredKeyServer !== null) {
      arr.push(writeSubPacket(sub.preferredKeyServer, false, util.encodeUTF8(this.preferredKeyServer)));
    }
    if (this.isPrimaryUserID !== null) {
      arr.push(writeSubPacket(sub.primaryUserID, false, new Uint8Array([this.isPrimaryUserID ? 1 : 0])));
    }
    if (this.policyURI !== null) {
      arr.push(writeSubPacket(sub.policyURI, false, util.encodeUTF8(this.policyURI)));
    }
    if (this.keyFlags !== null) {
      bytes = util.stringToUint8Array(util.uint8ArrayToString(this.keyFlags));
      arr.push(writeSubPacket(sub.keyFlags, true, bytes));
    }
    if (this.signersUserID !== null) {
      arr.push(writeSubPacket(sub.signersUserID, false, util.encodeUTF8(this.signersUserID)));
    }
    if (this.reasonForRevocationFlag !== null) {
      bytes = util.stringToUint8Array(String.fromCharCode(this.reasonForRevocationFlag) + this.reasonForRevocationString);
      arr.push(writeSubPacket(sub.reasonForRevocation, true, bytes));
    }
    if (this.features !== null) {
      bytes = util.stringToUint8Array(util.uint8ArrayToString(this.features));
      arr.push(writeSubPacket(sub.features, false, bytes));
    }
    if (this.signatureTargetPublicKeyAlgorithm !== null) {
      bytes = [new Uint8Array([this.signatureTargetPublicKeyAlgorithm, this.signatureTargetHashAlgorithm])];
      bytes.push(util.stringToUint8Array(this.signatureTargetHash));
      bytes = util.concat(bytes);
      arr.push(writeSubPacket(sub.signatureTarget, true, bytes));
    }
    if (this.embeddedSignature !== null) {
      arr.push(writeSubPacket(sub.embeddedSignature, true, this.embeddedSignature.write()));
    }
    if (this.issuerFingerprint !== null) {
      bytes = [new Uint8Array([this.issuerKeyVersion]), this.issuerFingerprint];
      bytes = util.concat(bytes);
      arr.push(writeSubPacket(sub.issuerFingerprint, this.version >= 5, bytes));
    }
    if (this.preferredAEADAlgorithms !== null) {
      bytes = util.stringToUint8Array(util.uint8ArrayToString(this.preferredAEADAlgorithms));
      arr.push(writeSubPacket(sub.preferredAEADAlgorithms, false, bytes));
    }
    if (this.preferredCipherSuites !== null) {
      bytes = new Uint8Array([].concat(...this.preferredCipherSuites));
      arr.push(writeSubPacket(sub.preferredCipherSuites, false, bytes));
    }

    const result = util.concat(arr);
    const length = util.writeNumber(result.length, this.version === 6 ? 4 : 2);

    return util.concat([length, result]);
  }

  /**
   * Creates an Uint8Array containing the unhashed subpackets
   * @returns {Uint8Array} Subpacket data.
   */
  writeUnhashedSubPackets() {
    const arr = this.unhashedSubpackets.map(({ type, critical, body }) => {
      return writeSubPacket(type, critical, body);
    });

    const result = util.concat(arr);
    const length = util.writeNumber(result.length, this.version === 6 ? 4 : 2);

    return util.concat([length, result]);
  }

  // Signature subpackets
  readSubPacket(bytes, hashed = true) {
    let mypos = 0;

    // The leftmost bit denotes a "critical" packet
    const critical = !!(bytes[mypos] & 0x80);
    const type = bytes[mypos] & 0x7F;

    mypos++;

    if (!hashed) {
      this.unhashedSubpackets.push({
        type,
        critical,
        body: bytes.subarray(mypos, bytes.length)
      });
      if (!allowedUnhashedSubpackets.has(type)) {
        return;
      }
    }

    // subpacket type
    switch (type) {
      case enums.signatureSubpacket.signatureCreationTime:
        // Signature Creation Time
        this.created = util.readDate(bytes.subarray(mypos, bytes.length));
        break;
      case enums.signatureSubpacket.signatureExpirationTime: {
        // Signature Expiration Time in seconds
        const seconds = util.readNumber(bytes.subarray(mypos, bytes.length));

        this.signatureNeverExpires = seconds === 0;
        this.signatureExpirationTime = seconds;

        break;
      }
      case enums.signatureSubpacket.exportableCertification:
        // Exportable Certification
        this.exportable = bytes[mypos++] === 1;
        break;
      case enums.signatureSubpacket.trustSignature:
        // Trust Signature
        this.trustLevel = bytes[mypos++];
        this.trustAmount = bytes[mypos++];
        break;
      case enums.signatureSubpacket.regularExpression:
        // Regular Expression
        this.regularExpression = bytes[mypos];
        break;
      case enums.signatureSubpacket.revocable:
        // Revocable
        this.revocable = bytes[mypos++] === 1;
        break;
      case enums.signatureSubpacket.keyExpirationTime: {
        // Key Expiration Time in seconds
        const seconds = util.readNumber(bytes.subarray(mypos, bytes.length));

        this.keyExpirationTime = seconds;
        this.keyNeverExpires = seconds === 0;

        break;
      }
      case enums.signatureSubpacket.preferredSymmetricAlgorithms:
        // Preferred Symmetric Algorithms
        this.preferredSymmetricAlgorithms = [...bytes.subarray(mypos, bytes.length)];
        break;
      case enums.signatureSubpacket.revocationKey:
        // Revocation Key
        // (1 octet of class, 1 octet of public-key algorithm ID, 20
        // octets of
        // fingerprint)
        this.revocationKeyClass = bytes[mypos++];
        this.revocationKeyAlgorithm = bytes[mypos++];
        this.revocationKeyFingerprint = bytes.subarray(mypos, mypos + 20);
        break;

      case enums.signatureSubpacket.issuerKeyID:
        // Issuer
        if (this.version === 4) {
          this.issuerKeyID.read(bytes.subarray(mypos, bytes.length));
        } else if (hashed) {
          // If the version of the key is greater than 4, this subpacket MUST NOT be included in the signature,
          // since the Issuer Fingerprint subpacket is to be used instead.
          // The `issuerKeyID` value will be set when reading the issuerFingerprint packet.
          // For this reason, if the issuer Key ID packet is present but unhashed, we simply ignore it,
          // to avoid situations where `.getSigningKeyIDs()` returns a keyID potentially different from the (signed)
          // issuerFingerprint.
          // If the packet is hashed, then we reject the signature, to avoid verifying data different from
          // what was parsed.
          throw new Error('Unexpected Issuer Key ID subpacket');
        }
        break;

      case enums.signatureSubpacket.notationData: {
        // Notation Data
        const humanReadable = !!(bytes[mypos] & 0x80);

        // We extract key/value tuple from the byte stream.
        mypos += 4;
        const m = util.readNumber(bytes.subarray(mypos, mypos + 2));
        mypos += 2;
        const n = util.readNumber(bytes.subarray(mypos, mypos + 2));
        mypos += 2;

        const name = util.decodeUTF8(bytes.subarray(mypos, mypos + m));
        const value = bytes.subarray(mypos + m, mypos + m + n);

        this.rawNotations.push({ name, humanReadable, value, critical });

        if (humanReadable) {
          this.notations[name] = util.decodeUTF8(value);
        }
        break;
      }
      case enums.signatureSubpacket.preferredHashAlgorithms:
        // Preferred Hash Algorithms
        this.preferredHashAlgorithms = [...bytes.subarray(mypos, bytes.length)];
        break;
      case enums.signatureSubpacket.preferredCompressionAlgorithms:
        // Preferred Compression Algorithms
        this.preferredCompressionAlgorithms = [...bytes.subarray(mypos, bytes.length)];
        break;
      case enums.signatureSubpacket.keyServerPreferences:
        // Key Server Preferences
        this.keyServerPreferences = [...bytes.subarray(mypos, bytes.length)];
        break;
      case enums.signatureSubpacket.preferredKeyServer:
        // Preferred Key Server
        this.preferredKeyServer = util.decodeUTF8(bytes.subarray(mypos, bytes.length));
        break;
      case enums.signatureSubpacket.primaryUserID:
        // Primary User ID
        this.isPrimaryUserID = bytes[mypos++] !== 0;
        break;
      case enums.signatureSubpacket.policyURI:
        // Policy URI
        this.policyURI = util.decodeUTF8(bytes.subarray(mypos, bytes.length));
        break;
      case enums.signatureSubpacket.keyFlags:
        // Key Flags
        this.keyFlags = [...bytes.subarray(mypos, bytes.length)];
        break;
      case enums.signatureSubpacket.signersUserID:
        // Signer's User ID
        this.signersUserID = util.decodeUTF8(bytes.subarray(mypos, bytes.length));
        break;
      case enums.signatureSubpacket.reasonForRevocation:
        // Reason for Revocation
        this.reasonForRevocationFlag = bytes[mypos++];
        this.reasonForRevocationString = util.decodeUTF8(bytes.subarray(mypos, bytes.length));
        break;
      case enums.signatureSubpacket.features:
        // Features
        this.features = [...bytes.subarray(mypos, bytes.length)];
        break;
      case enums.signatureSubpacket.signatureTarget: {
        // Signature Target
        // (1 octet public-key algorithm, 1 octet hash algorithm, N octets hash)
        this.signatureTargetPublicKeyAlgorithm = bytes[mypos++];
        this.signatureTargetHashAlgorithm = bytes[mypos++];

        const len = getHashByteLength(this.signatureTargetHashAlgorithm);

        this.signatureTargetHash = util.uint8ArrayToString(bytes.subarray(mypos, mypos + len));
        break;
      }
      case enums.signatureSubpacket.embeddedSignature:
        // Embedded Signature
        this.embeddedSignature = new SignaturePacket();
        this.embeddedSignature.read(bytes.subarray(mypos, bytes.length));
        break;
      case enums.signatureSubpacket.issuerFingerprint:
        // Issuer Fingerprint
        this.issuerKeyVersion = bytes[mypos++];
        this.issuerFingerprint = bytes.subarray(mypos, bytes.length);
        if (this.issuerKeyVersion >= 5) {
          this.issuerKeyID.read(this.issuerFingerprint);
        } else {
          this.issuerKeyID.read(this.issuerFingerprint.subarray(-8));
        }
        break;
      case enums.signatureSubpacket.preferredAEADAlgorithms:
        // Preferred AEAD Algorithms
        this.preferredAEADAlgorithms = [...bytes.subarray(mypos, bytes.length)];
        break;
      case enums.signatureSubpacket.preferredCipherSuites:
        // Preferred AEAD Cipher Suites
        this.preferredCipherSuites = [];
        for (let i = mypos; i < bytes.length; i += 2) {
          this.preferredCipherSuites.push([bytes[i], bytes[i + 1]]);
        }
        break;
      default:
        this.unknownSubpackets.push({
          type,
          critical,
          body: bytes.subarray(mypos, bytes.length)
        });
        break;
    }
  }

  readSubPackets(bytes, trusted = true, config) {
    const subpacketLengthBytes = this.version === 6 ? 4 : 2;

    // Two-octet scalar octet count for following subpacket data.
    const subpacketLength = util.readNumber(bytes.subarray(0, subpacketLengthBytes));

    let i = subpacketLengthBytes;

    // subpacket data set (zero or more subpackets)
    while (i < 2 + subpacketLength) {
      const len = readSimpleLength(bytes.subarray(i, bytes.length));
      i += len.offset;

      this.readSubPacket(bytes.subarray(i, i + len.len), trusted, config);

      i += len.len;
    }

    return i;
  }

  // Produces data to produce signature on
  toSign(type, data) {
    const t = enums.signature;

    switch (type) {
      case t.binary:
        if (data.text !== null) {
          return util.encodeUTF8(data.getText(true));
        }
        return data.getBytes(true);

      case t.text: {
        const bytes = data.getBytes(true);
        // normalize EOL to \r\n
        return util.canonicalizeEOL(bytes);
      }
      case t.standalone:
        return new Uint8Array(0);

      case t.certGeneric:
      case t.certPersona:
      case t.certCasual:
      case t.certPositive:
      case t.certRevocation: {
        let packet;
        let tag;

        if (data.userID) {
          tag = 0xB4;
          packet = data.userID;
        } else if (data.userAttribute) {
          tag = 0xD1;
          packet = data.userAttribute;
        } else {
          throw new Error('Either a userID or userAttribute packet needs to be ' +
            'supplied for certification.');
        }

        const bytes = packet.write();

        return util.concat([this.toSign(t.key, data),
          new Uint8Array([tag]),
          util.writeNumber(bytes.length, 4),
          bytes]);
      }
      case t.subkeyBinding:
      case t.subkeyRevocation:
      case t.keyBinding:
        return util.concat([this.toSign(t.key, data), this.toSign(t.key, {
          key: data.bind
        })]);

      case t.key:
        if (data.key === undefined) {
          throw new Error('Key packet is required for this signature.');
        }
        return data.key.writeForHash(this.version);

      case t.keyRevocation:
        return this.toSign(t.key, data);
      case t.timestamp:
        return new Uint8Array(0);
      case t.thirdParty:
        throw new Error('Not implemented');
      default:
        throw new Error('Unknown signature type.');
    }
  }

  calculateTrailer(data, detached) {
    let length = 0;
    return transform(clone(this.signatureData), value => {
      length += value.length;
    }, () => {
      const arr = [];
      if (this.version === 5 && (this.signatureType === enums.signature.binary || this.signatureType === enums.signature.text)) {
        if (detached) {
          arr.push(new Uint8Array(6));
        } else {
          arr.push(data.writeHeader());
        }
      }
      arr.push(new Uint8Array([this.version, 0xFF]));
      if (this.version === 5) {
        arr.push(new Uint8Array(4));
      }
      arr.push(util.writeNumber(length, 4));
      // For v5, this should really be writeNumber(length, 8) rather than the
      // hardcoded 4 zero bytes above
      return util.concat(arr);
    });
  }

  toHash(signatureType, data, detached = false) {
    const bytes = this.toSign(signatureType, data);

    return util.concat([this.salt || new Uint8Array(), bytes, this.signatureData, this.calculateTrailer(data, detached)]);
  }

  async hash(signatureType, data, toHash, detached = false) {
    if (this.version === 6 && this.salt.length !== saltLengthForHash(this.hashAlgorithm)) {
      // avoid hashing unexpected salt size
      throw new Error('Signature salt does not have the expected length');
    }

    if (!toHash) toHash = this.toHash(signatureType, data, detached);
    return computeDigest(this.hashAlgorithm, toHash);
  }

  /**
   * verifies the signature packet. Note: not all signature types are implemented
   * @param {PublicSubkeyPacket|PublicKeyPacket|
   *         SecretSubkeyPacket|SecretKeyPacket} key - the public key to verify the signature
   * @param {module:enums.signature} signatureType - Expected signature type
   * @param {Uint8Array|Object} data - Data which on the signature applies
   * @param {Date} [date] - Use the given date instead of the current time to check for signature validity and expiration
   * @param {Boolean} [detached] - Whether to verify a detached signature
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @throws {Error} if signature validation failed
   * @async
   */
  async verify(key, signatureType, data, date = new Date(), detached = false, config$1 = config) {
    if (!this.issuerKeyID.equals(key.getKeyID())) {
      throw new Error('Signature was not issued by the given public key');
    }
    if (this.publicKeyAlgorithm !== key.algorithm) {
      throw new Error('Public key algorithm used to sign signature does not match issuer key algorithm.');
    }

    const isMessageSignature = signatureType === enums.signature.binary || signatureType === enums.signature.text;
    // Cryptographic validity is cached after one successful verification.
    // However, for message signatures, we always re-verify, since the passed `data` can change
    const skipVerify = this[verified] && !isMessageSignature;
    if (!skipVerify) {
      let toHash;
      let hash;
      if (this.hashed) {
        hash = await this.hashed;
      } else {
        toHash = this.toHash(signatureType, data, detached);
        hash = await this.hash(signatureType, data, toHash);
      }
      hash = await readToEnd(hash);
      if (this.signedHashValue[0] !== hash[0] ||
          this.signedHashValue[1] !== hash[1]) {
        throw new Error('Signed digest did not match');
      }

      this.params = await this.params;

      this[verified] = await verify$1(
        this.publicKeyAlgorithm, this.hashAlgorithm, this.params, key.publicParams,
        toHash, hash
      );

      if (!this[verified]) {
        throw new Error('Signature verification failed');
      }
    }

    const normDate = util.normalizeDate(date);
    if (normDate && this.created > normDate) {
      throw new Error('Signature creation time is in the future');
    }
    if (normDate && normDate >= this.getExpirationTime()) {
      throw new Error('Signature is expired');
    }
    if (config$1.rejectHashAlgorithms.has(this.hashAlgorithm)) {
      throw new Error('Insecure hash algorithm: ' + enums.read(enums.hash, this.hashAlgorithm).toUpperCase());
    }
    if (config$1.rejectMessageHashAlgorithms.has(this.hashAlgorithm) &&
      [enums.signature.binary, enums.signature.text].includes(this.signatureType)) {
      throw new Error('Insecure message hash algorithm: ' + enums.read(enums.hash, this.hashAlgorithm).toUpperCase());
    }
    this.unknownSubpackets.forEach(({ type, critical }) => {
      if (critical) {
        throw new Error(`Unknown critical signature subpacket type ${type}`);
      }
    });
    this.rawNotations.forEach(({ name, critical }) => {
      if (critical && (config$1.knownNotations.indexOf(name) < 0)) {
        throw new Error(`Unknown critical notation: ${name}`);
      }
    });
    if (this.revocationKeyClass !== null) {
      throw new Error('This key is intended to be revoked with an authorized key, which OpenPGP.js does not support.');
    }
  }

  /**
   * Verifies signature expiration date
   * @param {Date} [date] - Use the given date for verification instead of the current time
   * @returns {Boolean} True if expired.
   */
  isExpired(date = new Date()) {
    const normDate = util.normalizeDate(date);
    if (normDate !== null) {
      return !(this.created <= normDate && normDate < this.getExpirationTime());
    }
    return false;
  }

  /**
   * Returns the expiration time of the signature or Infinity if signature does not expire
   * @returns {Date | Infinity} Expiration time.
   */
  getExpirationTime() {
    return this.signatureNeverExpires ? Infinity : new Date(this.created.getTime() + this.signatureExpirationTime * 1000);
  }
}

/**
 * Creates a Uint8Array representation of a sub signature packet
 * @see {@link https://tools.ietf.org/html/rfc4880#section-5.2.3.1|RFC4880 5.2.3.1}
 * @see {@link https://tools.ietf.org/html/rfc4880#section-5.2.3.2|RFC4880 5.2.3.2}
 * @param {Integer} type - Subpacket signature type.
 * @param {Boolean} critical - Whether the subpacket should be critical.
 * @param {String} data - Data to be included
 * @returns {Uint8Array} The signature subpacket.
 * @private
 */
function writeSubPacket(type, critical, data) {
  const arr = [];
  arr.push(writeSimpleLength(data.length + 1));
  arr.push(new Uint8Array([(critical ? 0x80 : 0) | type]));
  arr.push(data);
  return util.concat(arr);
}

/**
 * Select the required salt length for the given hash algorithm, as per Table 23 (Hash algorithm registry) of the crypto refresh.
 * @see {@link https://datatracker.ietf.org/doc/html/draft-ietf-openpgp-crypto-refresh#section-9.5|Crypto Refresh Section 9.5}
 * @param {enums.hash} hashAlgorithm - Hash algorithm.
 * @returns {Integer} Salt length.
 * @private
 */
function saltLengthForHash(hashAlgorithm) {
  switch (hashAlgorithm) {
    case enums.hash.sha256: return 16;
    case enums.hash.sha384: return 24;
    case enums.hash.sha512: return 32;
    case enums.hash.sha224: return 16;
    case enums.hash.sha3_256: return 16;
    case enums.hash.sha3_512: return 32;
    default: throw new Error('Unsupported hash function');
  }
}

// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


/**
 * Implementation of the One-Pass Signature Packets (Tag 4)
 *
 * {@link https://tools.ietf.org/html/rfc4880#section-5.4|RFC4880 5.4}:
 * The One-Pass Signature packet precedes the signed data and contains
 * enough information to allow the receiver to begin calculating any
 * hashes needed to verify the signature.  It allows the Signature
 * packet to be placed at the end of the message, so that the signer
 * can compute the entire signed message in one pass.
 */
class OnePassSignaturePacket {
  static get tag() {
    return enums.packet.onePassSignature;
  }

  static fromSignaturePacket(signaturePacket, isLast) {
    const onePassSig = new OnePassSignaturePacket();
    onePassSig.version = signaturePacket.version === 6 ? 6 : 3;
    onePassSig.signatureType = signaturePacket.signatureType;
    onePassSig.hashAlgorithm = signaturePacket.hashAlgorithm;
    onePassSig.publicKeyAlgorithm = signaturePacket.publicKeyAlgorithm;
    onePassSig.issuerKeyID = signaturePacket.issuerKeyID;
    onePassSig.salt = signaturePacket.salt; // v6 only
    onePassSig.issuerFingerprint = signaturePacket.issuerFingerprint; // v6 only

    onePassSig.flags = isLast ? 1 : 0;
    return onePassSig;
  }

  constructor() {
    /** A one-octet version number.  The current versions are 3 and 6. */
    this.version = null;
    /**
     * A one-octet signature type.
     * Signature types are described in
     * {@link https://tools.ietf.org/html/rfc4880#section-5.2.1|RFC4880 Section 5.2.1}.
     * @type {enums.signature}

     */
    this.signatureType = null;
    /**
     * A one-octet number describing the hash algorithm used.
     * @see {@link https://tools.ietf.org/html/rfc4880#section-9.4|RFC4880 9.4}
     * @type {enums.hash}
     */
    this.hashAlgorithm = null;
    /**
     * A one-octet number describing the public-key algorithm used.
     * @see {@link https://tools.ietf.org/html/rfc4880#section-9.1|RFC4880 9.1}
     * @type {enums.publicKey}
     */
    this.publicKeyAlgorithm = null;
    /** Only for v6, a variable-length field containing the salt. */
    this.salt = null;
    /** Only for v3 packets, an eight-octet number holding the Key ID of the signing key. */
    this.issuerKeyID = null;
    /** Only for v6 packets, 32 octets of the fingerprint of the signing key. */
    this.issuerFingerprint = null;
    /**
     * A one-octet number holding a flag showing whether the signature is nested.
     * A zero value indicates that the next packet is another One-Pass Signature packet
     * that describes another signature to be applied to the same message data.
     */
    this.flags = null;
  }

  /**
   * parsing function for a one-pass signature packet (tag 4).
   * @param {Uint8Array} bytes - Payload of a tag 4 packet
   * @returns {OnePassSignaturePacket} Object representation.
   */
  read(bytes) {
    let mypos = 0;
    // A one-octet version number.  The current versions are 3 or 6.
    this.version = bytes[mypos++];
    if (this.version !== 3 && this.version !== 6) {
      throw new UnsupportedError(`Version ${this.version} of the one-pass signature packet is unsupported.`);
    }

    // A one-octet signature type.  Signature types are described in
    //   Section 5.2.1.
    this.signatureType = bytes[mypos++];

    // A one-octet number describing the hash algorithm used.
    this.hashAlgorithm = bytes[mypos++];

    // A one-octet number describing the public-key algorithm used.
    this.publicKeyAlgorithm = bytes[mypos++];

    if (this.version === 6) {
      // Only for v6 signatures, a variable-length field containing:

      // A one-octet salt size. The value MUST match the value defined
      // for the hash algorithm as specified in Table 23 (Hash algorithm registry).
      // To allow parsing unknown hash algos, we only check the expected salt length when verifying.
      const saltLength = bytes[mypos++];

      // The salt; a random value value of the specified size.
      this.salt = bytes.subarray(mypos, mypos + saltLength);
      mypos += saltLength;

      // Only for v6 packets, 32 octets of the fingerprint of the signing key.
      this.issuerFingerprint = bytes.subarray(mypos, mypos + 32);
      mypos += 32;
      this.issuerKeyID = new KeyID();
      // For v6 the Key ID is the high-order 64 bits of the fingerprint.
      this.issuerKeyID.read(this.issuerFingerprint);
    } else {
      // Only for v3 packets, an eight-octet number holding the Key ID of the signing key.
      this.issuerKeyID = new KeyID();
      this.issuerKeyID.read(bytes.subarray(mypos, mypos + 8));
      mypos += 8;
    }

    // A one-octet number holding a flag showing whether the signature
    //   is nested.  A zero value indicates that the next packet is
    //   another One-Pass Signature packet that describes another
    //   signature to be applied to the same message data.
    this.flags = bytes[mypos++];
    return this;
  }

  /**
   * creates a string representation of a one-pass signature packet
   * @returns {Uint8Array} A Uint8Array representation of a one-pass signature packet.
   */
  write() {
    const arr = [new Uint8Array([
      this.version,
      this.signatureType,
      this.hashAlgorithm,
      this.publicKeyAlgorithm
    ])];
    if (this.version === 6) {
      arr.push(
        new Uint8Array([this.salt.length]),
        this.salt,
        this.issuerFingerprint
      );
    } else {
      arr.push(this.issuerKeyID.write());
    }
    arr.push(new Uint8Array([this.flags]));
    return util.concatUint8Array(arr);
  }

  calculateTrailer(...args) {
    return fromAsync(async () => SignaturePacket.prototype.calculateTrailer.apply(await this.correspondingSig, args));
  }

  async verify() {
    const correspondingSig = await this.correspondingSig;
    if (!correspondingSig || correspondingSig.constructor.tag !== enums.packet.signature) {
      throw new Error('Corresponding signature packet missing');
    }
    if (
      correspondingSig.signatureType !== this.signatureType ||
      correspondingSig.hashAlgorithm !== this.hashAlgorithm ||
      correspondingSig.publicKeyAlgorithm !== this.publicKeyAlgorithm ||
      !correspondingSig.issuerKeyID.equals(this.issuerKeyID) ||
      (this.version === 3 && correspondingSig.version === 6) ||
      (this.version === 6 && correspondingSig.version !== 6) ||
      (this.version === 6 && !util.equalsUint8Array(correspondingSig.issuerFingerprint, this.issuerFingerprint)) ||
      (this.version === 6 && !util.equalsUint8Array(correspondingSig.salt, this.salt))
    ) {
      throw new Error('Corresponding signature packet does not match one-pass signature packet');
    }
    correspondingSig.hashed = this.hashed;
    return correspondingSig.verify.apply(correspondingSig, arguments);
  }
}

OnePassSignaturePacket.prototype.hash = SignaturePacket.prototype.hash;
OnePassSignaturePacket.prototype.toHash = SignaturePacket.prototype.toHash;
OnePassSignaturePacket.prototype.toSign = SignaturePacket.prototype.toSign;

/**
 * Instantiate a new packet given its tag
 * @function newPacketFromTag
 * @param {module:enums.packet} tag - Property value from {@link module:enums.packet}
 * @param {Object} allowedPackets - mapping where keys are allowed packet tags, pointing to their Packet class
 * @returns {Object} New packet object with type based on tag
 * @throws {Error|UnsupportedError} for disallowed or unknown packets
 */
function newPacketFromTag(tag, allowedPackets) {
  if (!allowedPackets[tag]) {
    // distinguish between disallowed packets and unknown ones
    let packetType;
    try {
      packetType = enums.read(enums.packet, tag);
    } catch (e) {
      throw new UnknownPacketError(`Unknown packet type with tag: ${tag}`);
    }
    throw new Error(`Packet not allowed in this context: ${packetType}`);
  }
  return new allowedPackets[tag]();
}

/**
 * This class represents a list of openpgp packets.
 * Take care when iterating over it - the packets themselves
 * are stored as numerical indices.
 * @extends Array
 */
class PacketList extends Array {
  /**
   * Parses the given binary data and returns a list of packets.
   * Equivalent to calling `read` on an empty PacketList instance.
   * @param {Uint8Array | ReadableStream<Uint8Array>} bytes - binary data to parse
   * @param {Object} allowedPackets - mapping where keys are allowed packet tags, pointing to their Packet class
   * @param {Object} [config] - full configuration, defaults to openpgp.config
   * @returns {PacketList} parsed list of packets
   * @throws on parsing errors
   * @async
   */
  static async fromBinary(bytes, allowedPackets, config$1 = config) {
    const packets = new PacketList();
    await packets.read(bytes, allowedPackets, config$1);
    return packets;
  }

  /**
   * Reads a stream of binary data and interprets it as a list of packets.
   * @param {Uint8Array | ReadableStream<Uint8Array>} bytes - binary data to parse
   * @param {Object} allowedPackets - mapping where keys are allowed packet tags, pointing to their Packet class
   * @param {Object} [config] - full configuration, defaults to openpgp.config
   * @throws on parsing errors
   * @async
   */
  async read(bytes, allowedPackets, config$1 = config) {
    if (config$1.additionalAllowedPackets.length) {
      allowedPackets = { ...allowedPackets, ...util.constructAllowedPackets(config$1.additionalAllowedPackets) };
    }
    this.stream = transformPair(bytes, async (readable, writable) => {
      const writer = getWriter(writable);
      try {
        while (true) {
          await writer.ready;
          const done = await readPackets(readable, async parsed => {
            try {
              if (parsed.tag === enums.packet.marker || parsed.tag === enums.packet.trust || parsed.tag === enums.packet.padding) {
                // According to the spec, these packet types should be ignored and not cause parsing errors, even if not esplicitly allowed:
                // - Marker packets MUST be ignored when received: https://github.com/openpgpjs/openpgpjs/issues/1145
                // - Trust packets SHOULD be ignored outside of keyrings (unsupported): https://datatracker.ietf.org/doc/html/rfc4880#section-5.10
                // - [Padding Packets] MUST be ignored when received: https://datatracker.ietf.org/doc/html/draft-ietf-openpgp-crypto-refresh#name-padding-packet-tag-21
                return;
              }
              const packet = newPacketFromTag(parsed.tag, allowedPackets);
              packet.packets = new PacketList();
              packet.fromStream = util.isStream(parsed.packet);
              await packet.read(parsed.packet, config$1);
              await writer.write(packet);
            } catch (e) {
              // If an implementation encounters a critical packet where the packet type is unknown in a packet sequence,
              // it MUST reject the whole packet sequence. On the other hand, an unknown non-critical packet MUST be ignored.
              // Packet Tags from 0 to 39 are critical. Packet Tags from 40 to 63 are non-critical.
              if (e instanceof UnknownPacketError) {
                if (parsed.tag <= 39) {
                  await writer.abort(e);
                } else {
                  return;
                }
              }

              const throwUnsupportedError = !config$1.ignoreUnsupportedPackets && e instanceof UnsupportedError;
              const throwMalformedError = !config$1.ignoreMalformedPackets && !(e instanceof UnsupportedError);
              if (throwUnsupportedError || throwMalformedError || supportsStreaming(parsed.tag)) {
                // The packets that support streaming are the ones that contain message data.
                // Those are also the ones we want to be more strict about and throw on parse errors
                // (since we likely cannot process the message without these packets anyway).
                await writer.abort(e);
              } else {
                const unparsedPacket = new UnparseablePacket(parsed.tag, parsed.packet);
                await writer.write(unparsedPacket);
              }
              util.printDebugError(e);
            }
          });
          if (done) {
            await writer.ready;
            await writer.close();
            return;
          }
        }
      } catch (e) {
        await writer.abort(e);
      }
    });

    // Wait until first few packets have been read
    const reader = getReader(this.stream);
    while (true) {
      const { done, value } = await reader.read();
      if (!done) {
        this.push(value);
      } else {
        this.stream = null;
      }
      if (done || supportsStreaming(value.constructor.tag)) {
        break;
      }
    }
    reader.releaseLock();
  }

  /**
   * Creates a binary representation of openpgp objects contained within the
   * class instance.
   * @returns {Uint8Array} A Uint8Array containing valid openpgp packets.
   */
  write() {
    const arr = [];

    for (let i = 0; i < this.length; i++) {
      const tag = this[i] instanceof UnparseablePacket ? this[i].tag : this[i].constructor.tag;
      const packetbytes = this[i].write();
      if (util.isStream(packetbytes) && supportsStreaming(this[i].constructor.tag)) {
        let buffer = [];
        let bufferLength = 0;
        const minLength = 512;
        arr.push(writeTag(tag));
        arr.push(transform(packetbytes, value => {
          buffer.push(value);
          bufferLength += value.length;
          if (bufferLength >= minLength) {
            const powerOf2 = Math.min(Math.log(bufferLength) / Math.LN2 | 0, 30);
            const chunkSize = 2 ** powerOf2;
            const bufferConcat = util.concat([writePartialLength(powerOf2)].concat(buffer));
            buffer = [bufferConcat.subarray(1 + chunkSize)];
            bufferLength = buffer[0].length;
            return bufferConcat.subarray(0, 1 + chunkSize);
          }
        }, () => util.concat([writeSimpleLength(bufferLength)].concat(buffer))));
      } else {
        if (util.isStream(packetbytes)) {
          let length = 0;
          arr.push(transform(clone(packetbytes), value => {
            length += value.length;
          }, () => writeHeader(tag, length)));
        } else {
          arr.push(writeHeader(tag, packetbytes.length));
        }
        arr.push(packetbytes);
      }
    }

    return util.concat(arr);
  }

  /**
   * Creates a new PacketList with all packets matching the given tag(s)
   * @param {...module:enums.packet} tags - packet tags to look for
   * @returns {PacketList}
   */
  filterByTag(...tags) {
    const filtered = new PacketList();

    const handle = tag => packetType => tag === packetType;

    for (let i = 0; i < this.length; i++) {
      if (tags.some(handle(this[i].constructor.tag))) {
        filtered.push(this[i]);
      }
    }

    return filtered;
  }

  /**
   * Traverses packet list and returns first packet with matching tag
   * @param {module:enums.packet} tag - The packet tag
   * @returns {Packet|undefined}
   */
  findPacket(tag) {
    return this.find(packet => packet.constructor.tag === tag);
  }

  /**
   * Find indices of packets with the given tag(s)
   * @param {...module:enums.packet} tags - packet tags to look for
   * @returns {Integer[]} packet indices
   */
  indexOfTag(...tags) {
    const tagIndex = [];
    const that = this;

    const handle = tag => packetType => tag === packetType;

    for (let i = 0; i < this.length; i++) {
      if (tags.some(handle(that[i].constructor.tag))) {
        tagIndex.push(i);
      }
    }
    return tagIndex;
  }
}

// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


// A Compressed Data packet can contain the following packet types
const allowedPackets$5 = /*#__PURE__*/ util.constructAllowedPackets([
  LiteralDataPacket,
  OnePassSignaturePacket,
  SignaturePacket
]);

/**
 * Implementation of the Compressed Data Packet (Tag 8)
 *
 * {@link https://tools.ietf.org/html/rfc4880#section-5.6|RFC4880 5.6}:
 * The Compressed Data packet contains compressed data.  Typically,
 * this packet is found as the contents of an encrypted packet, or following
 * a Signature or One-Pass Signature packet, and contains a literal data packet.
 */
class CompressedDataPacket {
  static get tag() {
    return enums.packet.compressedData;
  }

  /**
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   */
  constructor(config$1 = config) {
    /**
     * List of packets
     * @type {PacketList}
     */
    this.packets = null;
    /**
     * Compression algorithm
     * @type {enums.compression}
     */
    this.algorithm = config$1.preferredCompressionAlgorithm;

    /**
     * Compressed packet data
     * @type {Uint8Array | ReadableStream<Uint8Array>}
     */
    this.compressed = null;
  }

  /**
   * Parsing function for the packet.
   * @param {Uint8Array | ReadableStream<Uint8Array>} bytes - Payload of a tag 8 packet
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   */
  async read(bytes, config$1 = config) {
    await parse(bytes, async reader => {

      // One octet that gives the algorithm used to compress the packet.
      this.algorithm = await reader.readByte();

      // Compressed data, which makes up the remainder of the packet.
      this.compressed = reader.remainder();

      await this.decompress(config$1);
    });
  }


  /**
   * Return the compressed packet.
   * @returns {Uint8Array | ReadableStream<Uint8Array>} Binary compressed packet.
   */
  write() {
    if (this.compressed === null) {
      this.compress();
    }

    return util.concat([new Uint8Array([this.algorithm]), this.compressed]);
  }


  /**
   * Decompression method for decompressing the compressed data
   * read by read_packet
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   */
  async decompress(config$1 = config) {
    const compressionName = enums.read(enums.compression, this.algorithm);
    const decompressionFn = decompress_fns[compressionName]; // bzip decompression is async
    if (!decompressionFn) {
      throw new Error(`${compressionName} decompression not supported`);
    }

    this.packets = await PacketList.fromBinary(await decompressionFn(this.compressed), allowedPackets$5, config$1);
  }

  /**
   * Compress the packet data (member decompressedData)
   */
  compress() {
    const compressionName = enums.read(enums.compression, this.algorithm);
    const compressionFn = compress_fns[compressionName];
    if (!compressionFn) {
      throw new Error(`${compressionName} compression not supported`);
    }

    this.compressed = compressionFn(this.packets.write());
  }
}

//////////////////////////
//                      //
//   Helper functions   //
//                      //
//////////////////////////

/**
 * Zlib processor relying on Compression Stream API if available, or falling back to fflate otherwise.
 * @param {function(): CompressionStream|function(): DecompressionStream} compressionStreamInstantiator
 * @param {FunctionConstructor} ZlibStreamedConstructor - fflate constructor
 * @returns {ReadableStream<Uint8Array>} compressed or decompressed data
 */
function zlib(compressionStreamInstantiator, ZlibStreamedConstructor) {
  return data => {
    if (!util.isStream(data) || isArrayStream(data)) {
      return fromAsync(() => readToEnd(data).then(inputData => {
        return new Promise((resolve, reject) => {
          const zlibStream = new ZlibStreamedConstructor();
          zlibStream.ondata = processedData => {
            resolve(processedData);
          };
          try {
            zlibStream.push(inputData, true); // only one chunk to push
          } catch (err) {
            reject(err);
          }
        });
      }));
    }

    // Use Compression Streams API if available (see https://developer.mozilla.org/en-US/docs/Web/API/Compression_Streams_API)
    if (compressionStreamInstantiator) {
      try {
        const compressorOrDecompressor = compressionStreamInstantiator();
        return data.pipeThrough(compressorOrDecompressor);
      } catch (err) {
        // If format is unsupported in Compression/DecompressionStream, then a TypeError in thrown, and we fallback to fflate.
        if (err.name !== 'TypeError') {
          throw err;
        }
      }
    }

    // JS fallback
    const inputReader = data.getReader();
    const zlibStream = new ZlibStreamedConstructor();

    return new ReadableStream({
      async start(controller) {
        zlibStream.ondata = async (value, isLast) => {
          controller.enqueue(value);
          if (isLast) {
            controller.close();
          }
        };

        while (true) {
          const { done, value } = await inputReader.read();
          if (done) {
            zlibStream.push(new Uint8Array(), true);
            return;
          } else if (value.length) {
            zlibStream.push(value);
          }
        }
      }
    });
  };
}

function bzip2Decompress() {
  return async function(data) {
    const { decode: bunzipDecode } = await import('./seek-bzip.mjs').then(function (n) { return n.i; });
    return fromAsync(async () => bunzipDecode(await readToEnd(data)));
  };
}

/**
 * Get Compression Stream API instatiators if the constructors are implemented.
 * NB: the return instatiator functions will throw when called if the provided `compressionFormat` is not supported
 * (supported formats cannot be determined in advance).
 * @param {'deflate-raw'|'deflate'|'gzip'|string} compressionFormat
 * @returns {{ compressor: function(): CompressionStream | false, decompressor: function(): DecompressionStream | false }}
 */
const getCompressionStreamInstantiators = compressionFormat => ({
  compressor: typeof CompressionStream !== 'undefined' && (() => new CompressionStream(compressionFormat)),
  decompressor: typeof DecompressionStream !== 'undefined' && (() => new DecompressionStream(compressionFormat))
});

const compress_fns = {
  zip: /*#__PURE__*/ zlib(getCompressionStreamInstantiators('deflate-raw').compressor, Deflate),
  zlib: /*#__PURE__*/ zlib(getCompressionStreamInstantiators('deflate').compressor, Zlib)
};

const decompress_fns = {
  uncompressed: data => data,
  zip: /*#__PURE__*/ zlib(getCompressionStreamInstantiators('deflate-raw').decompressor, Inflate),
  zlib: /*#__PURE__*/ zlib(getCompressionStreamInstantiators('deflate').decompressor, Unzlib),
  bzip2: /*#__PURE__*/ bzip2Decompress() // NB: async due to dynamic lib import
};

// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


// A SEIP packet can contain the following packet types
const allowedPackets$4 = /*#__PURE__*/ util.constructAllowedPackets([
  LiteralDataPacket,
  CompressedDataPacket,
  OnePassSignaturePacket,
  SignaturePacket
]);

/**
 * Implementation of the Sym. Encrypted Integrity Protected Data Packet (Tag 18)
 *
 * {@link https://tools.ietf.org/html/rfc4880#section-5.13|RFC4880 5.13}:
 * The Symmetrically Encrypted Integrity Protected Data packet is
 * a variant of the Symmetrically Encrypted Data packet. It is a new feature
 * created for OpenPGP that addresses the problem of detecting a modification to
 * encrypted data. It is used in combination with a Modification Detection Code
 * packet.
 */
class SymEncryptedIntegrityProtectedDataPacket {
  static get tag() {
    return enums.packet.symEncryptedIntegrityProtectedData;
  }

  static fromObject({ version, aeadAlgorithm }) {
    if (version !== 1 && version !== 2) {
      throw new Error('Unsupported SEIPD version');
    }

    const seip = new SymEncryptedIntegrityProtectedDataPacket();
    seip.version = version;
    if (version === 2) {
      seip.aeadAlgorithm = aeadAlgorithm;
    }

    return seip;
  }

  constructor() {
    this.version = null;

    // The following 4 fields are for V2 only.
    /** @type {enums.symmetric} */
    this.cipherAlgorithm = null;
    /** @type {enums.aead} */
    this.aeadAlgorithm = null;
    this.chunkSizeByte = null;
    this.salt = null;

    this.encrypted = null;
    this.packets = null;
  }

  async read(bytes) {
    await parse(bytes, async reader => {
      this.version = await reader.readByte();
      // - A one-octet version number with value 1 or 2.
      if (this.version !== 1 && this.version !== 2) {
        throw new UnsupportedError(`Version ${this.version} of the SEIP packet is unsupported.`);
      }

      if (this.version === 2) {
        // - A one-octet cipher algorithm.
        this.cipherAlgorithm = await reader.readByte();
        // - A one-octet AEAD algorithm.
        this.aeadAlgorithm = await reader.readByte();
        // - A one-octet chunk size.
        this.chunkSizeByte = await reader.readByte();
        // - Thirty-two octets of salt. The salt is used to derive the message key and must be unique.
        this.salt = await reader.readBytes(32);
      }

      // For V1:
      // - Encrypted data, the output of the selected symmetric-key cipher
      //   operating in Cipher Feedback mode with shift amount equal to the
      //   block size of the cipher (CFB-n where n is the block size).
      // For V2:
      // - Encrypted data, the output of the selected symmetric-key cipher operating in the given AEAD mode.
      // - A final, summary authentication tag for the AEAD mode.
      this.encrypted = reader.remainder();
    });
  }

  write() {
    if (this.version === 2) {
      return util.concat([new Uint8Array([this.version, this.cipherAlgorithm, this.aeadAlgorithm, this.chunkSizeByte]), this.salt, this.encrypted]);
    }
    return util.concat([new Uint8Array([this.version]), this.encrypted]);
  }

  /**
   * Encrypt the payload in the packet.
   * @param {enums.symmetric} sessionKeyAlgorithm - The symmetric encryption algorithm to use
   * @param {Uint8Array} key - The key of cipher blocksize length to be used
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Promise<Boolean>}
   * @throws {Error} on encryption failure
   * @async
   */
  async encrypt(sessionKeyAlgorithm, key, config$1 = config) {
    // We check that the session key size matches the one expected by the symmetric algorithm.
    // This is especially important for SEIPDv2 session keys, as a key derivation step is run where the resulting key will always match the expected cipher size,
    // but we want to ensure that the input key isn't e.g. too short.
    // The check is done here, instead of on encrypted session key (ESK) encryption, because v6 ESK packets do not store the session key algorithm,
    // which is instead included in the SEIPDv2 data.
    const { blockSize, keySize } = getCipherParams(sessionKeyAlgorithm);
    if (key.length !== keySize) {
      throw new Error('Unexpected session key size');
    }

    let bytes = this.packets.write();
    if (isArrayStream(bytes)) bytes = await readToEnd(bytes);

    if (this.version === 2) {
      this.cipherAlgorithm = sessionKeyAlgorithm;

      this.salt = getRandomBytes(32);
      this.chunkSizeByte = config$1.aeadChunkSizeByte;
      this.encrypted = await runAEAD(this, 'encrypt', key, bytes);
    } else {
      const prefix = await getPrefixRandom(sessionKeyAlgorithm);
      const mdc = new Uint8Array([0xD3, 0x14]); // modification detection code packet

      const tohash = util.concat([prefix, bytes, mdc]);
      const hash = await computeDigest(enums.hash.sha1, passiveClone(tohash));
      const plaintext = util.concat([tohash, hash]);

      this.encrypted = await encrypt$1(sessionKeyAlgorithm, key, plaintext, new Uint8Array(blockSize));
    }
    return true;
  }

  /**
   * Decrypts the encrypted data contained in the packet.
   * @param {enums.symmetric} sessionKeyAlgorithm - The selected symmetric encryption algorithm to be used
   * @param {Uint8Array} key - The key of cipher blocksize length to be used
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Promise<Boolean>}
   * @throws {Error} on decryption failure
   * @async
   */
  async decrypt(sessionKeyAlgorithm, key, config$1 = config) {
    // We check that the session key size matches the one expected by the symmetric algorithm.
    // This is especially important for SEIPDv2 session keys, as a key derivation step is run where the resulting key will always match the expected cipher size,
    // but we want to ensure that the input key isn't e.g. too short.
    // The check is done here, instead of on encrypted session key (ESK) decryption, because v6 ESK packets do not store the session key algorithm,
    // which is instead included in the SEIPDv2 data.
    if (key.length !== getCipherParams(sessionKeyAlgorithm).keySize) {
      throw new Error('Unexpected session key size');
    }

    let encrypted = clone(this.encrypted);
    if (isArrayStream(encrypted)) encrypted = await readToEnd(encrypted);

    let packetbytes;
    if (this.version === 2) {
      if (this.cipherAlgorithm !== sessionKeyAlgorithm) {
        // sanity check
        throw new Error('Unexpected session key algorithm');
      }
      packetbytes = await runAEAD(this, 'decrypt', key, encrypted);
    } else {
      const { blockSize } = getCipherParams(sessionKeyAlgorithm);
      const decrypted = await decrypt$1(sessionKeyAlgorithm, key, encrypted, new Uint8Array(blockSize));

      // there must be a modification detection code packet as the
      // last packet and everything gets hashed except the hash itself
      const realHash = slice(passiveClone(decrypted), -20);
      const tohash = slice(decrypted, 0, -20);
      const verifyHash = Promise.all([
        readToEnd(await computeDigest(enums.hash.sha1, passiveClone(tohash))),
        readToEnd(realHash)
      ]).then(([hash, mdc]) => {
        if (!util.equalsUint8Array(hash, mdc)) {
          throw new Error('Modification detected.');
        }
        return new Uint8Array();
      });
      const bytes = slice(tohash, blockSize + 2); // Remove random prefix
      packetbytes = slice(bytes, 0, -2); // Remove MDC packet
      packetbytes = concat([packetbytes, fromAsync(() => verifyHash)]);
      if (!util.isStream(encrypted) || !config$1.allowUnauthenticatedStream) {
        packetbytes = await readToEnd(packetbytes);
      }
    }

    this.packets = await PacketList.fromBinary(packetbytes, allowedPackets$4, config$1);
    return true;
  }
}

/**
 * En/decrypt the payload.
 * @param {encrypt|decrypt} fn - Whether to encrypt or decrypt
 * @param {Uint8Array} key - The session key used to en/decrypt the payload
 * @param {Uint8Array | ReadableStream<Uint8Array>} data - The data to en/decrypt
 * @returns {Promise<Uint8Array | ReadableStream<Uint8Array>>}
 * @async
 */
async function runAEAD(packet, fn, key, data) {
  const isSEIPDv2 = packet instanceof SymEncryptedIntegrityProtectedDataPacket && packet.version === 2;
  const isAEADP = !isSEIPDv2 && packet.constructor.tag === enums.packet.aeadEncryptedData; // no `instanceof` to avoid importing the corresponding class (circular import)
  if (!isSEIPDv2 && !isAEADP) throw new Error('Unexpected packet type');

  // we allow `experimentalGCM` for AEADP for backwards compatibility, since v5 keys from OpenPGP.js v5 might be declaring
  // that preference, as the `gcm` ID had not been standardized at the time.
  // NB: AEADP are never automatically generate as part of message encryption by OpenPGP.js, the packet must be manually created.
  const mode = getAEADMode(packet.aeadAlgorithm, isAEADP);
  const tagLengthIfDecrypting = fn === 'decrypt' ? mode.tagLength : 0;
  const tagLengthIfEncrypting = fn === 'encrypt' ? mode.tagLength : 0;
  const chunkSize = 2 ** (packet.chunkSizeByte + 6) + tagLengthIfDecrypting; // ((uint64_t)1 << (c + 6))
  const chunkIndexSizeIfAEADEP = isAEADP ? 8 : 0;
  const adataBuffer = new ArrayBuffer(13 + chunkIndexSizeIfAEADEP);
  const adataArray = new Uint8Array(adataBuffer, 0, 5 + chunkIndexSizeIfAEADEP);
  const adataTagArray = new Uint8Array(adataBuffer);
  const adataView = new DataView(adataBuffer);
  const chunkIndexArray = new Uint8Array(adataBuffer, 5, 8);
  adataArray.set([0xC0 | packet.constructor.tag, packet.version, packet.cipherAlgorithm, packet.aeadAlgorithm, packet.chunkSizeByte], 0);
  let chunkIndex = 0;
  let latestPromise = Promise.resolve();
  let cryptedBytes = 0;
  let queuedBytes = 0;
  let iv;
  let ivView;
  if (isSEIPDv2) {
    const { keySize } = getCipherParams(packet.cipherAlgorithm);
    const { ivLength } = mode;
    const info = new Uint8Array(adataBuffer, 0, 5);
    const derived = await computeHKDF(enums.hash.sha256, key, packet.salt, info, keySize + ivLength);
    key = derived.subarray(0, keySize);
    iv = derived.subarray(keySize); // The last 8 bytes of HKDF output are unneeded, but this avoids one copy.
    iv.fill(0, iv.length - 8);
    ivView = new DataView(iv.buffer, iv.byteOffset, iv.byteLength);
  } else { // AEADEncryptedDataPacket
    iv = packet.iv;
    // ivView is unused in this case
  }
  const modeInstance = await mode(packet.cipherAlgorithm, key);
  return transformPair(data, async (readable, writable) => {
    if (util.isStream(readable) !== 'array') {
      const buffer = new TransformStream({}, {
        highWaterMark: util.getHardwareConcurrency() * 2 ** (packet.chunkSizeByte + 6),
        size: array => array.length
      });
      pipe(buffer.readable, writable);
      writable = buffer.writable;
    }
    const reader = getReader(readable);
    const writer = getWriter(writable);
    try {
      while (true) {
        let chunk = await reader.readBytes(chunkSize + tagLengthIfDecrypting) || new Uint8Array();
        const finalChunk = chunk.subarray(chunk.length - tagLengthIfDecrypting);
        chunk = chunk.subarray(0, chunk.length - tagLengthIfDecrypting);
        let cryptedPromise;
        let done;
        let nonce;
        if (isSEIPDv2) { // SEIPD V2
          nonce = iv;
        } else { // AEADEncryptedDataPacket
          nonce = iv.slice();
          for (let i = 0; i < 8; i++) {
            nonce[iv.length - 8 + i] ^= chunkIndexArray[i];
          }
        }
        if (!chunkIndex || chunk.length) {
          reader.unshift(finalChunk);
          cryptedPromise = modeInstance[fn](chunk, nonce, adataArray);
          cryptedPromise.catch(() => {});
          queuedBytes += chunk.length - tagLengthIfDecrypting + tagLengthIfEncrypting;
        } else {
          // After the last chunk, we either encrypt a final, empty
          // data chunk to get the final authentication tag or
          // validate that final authentication tag.
          adataView.setInt32(5 + chunkIndexSizeIfAEADEP + 4, cryptedBytes); // Should be setInt64(5 + chunkIndexSizeIfAEADEP, ...)
          cryptedPromise = modeInstance[fn](finalChunk, nonce, adataTagArray);
          cryptedPromise.catch(() => {});
          queuedBytes += tagLengthIfEncrypting;
          done = true;
        }
        cryptedBytes += chunk.length - tagLengthIfDecrypting;
        // eslint-disable-next-line @typescript-eslint/no-loop-func
        latestPromise = latestPromise.then(() => cryptedPromise).then(async crypted => {
          await writer.ready;
          await writer.write(crypted);
          queuedBytes -= crypted.length;
        }).catch(err => writer.abort(err));
        if (done || queuedBytes > writer.desiredSize) {
          await latestPromise; // Respect backpressure
        }
        if (!done) {
          if (isSEIPDv2) { // SEIPD V2
            ivView.setInt32(iv.length - 4, ++chunkIndex); // Should be setInt64(iv.length - 8, ...)
          } else { // AEADEncryptedDataPacket
            adataView.setInt32(5 + 4, ++chunkIndex); // Should be setInt64(5, ...)
          }
        } else {
          await writer.close();
          break;
        }
      }
    } catch (e) {
      await writer.ready.catch(() => {});
      await writer.abort(e);
    }
  });
}

// OpenPGP.js - An OpenPGP implementation in javascript
// Copyright (C) 2016 Tankred Hase
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


// An AEAD-encrypted Data packet can contain the following packet types
const allowedPackets$3 = /*#__PURE__*/ util.constructAllowedPackets([
  LiteralDataPacket,
  CompressedDataPacket,
  OnePassSignaturePacket,
  SignaturePacket
]);

const VERSION = 1; // A one-octet version number of the data packet.

/**
 * Implementation of the Symmetrically Encrypted Authenticated Encryption with
 * Additional Data (AEAD) Protected Data Packet
 *
 * {@link https://tools.ietf.org/html/draft-ford-openpgp-format-00#section-2.1}:
 * AEAD Protected Data Packet
 */
class AEADEncryptedDataPacket {
  static get tag() {
    return enums.packet.aeadEncryptedData;
  }

  constructor() {
    this.version = VERSION;
    /** @type {enums.symmetric} */
    this.cipherAlgorithm = null;
    /** @type {enums.aead} */
    this.aeadAlgorithm = enums.aead.eax;
    this.chunkSizeByte = null;
    this.iv = null;
    this.encrypted = null;
    this.packets = null;
  }

  /**
   * Parse an encrypted payload of bytes in the order: version, IV, ciphertext (see specification)
   * @param {Uint8Array | ReadableStream<Uint8Array>} bytes
   * @throws {Error} on parsing failure
   */
  async read(bytes) {
    await parse(bytes, async reader => {
      const version = await reader.readByte();
      if (version !== VERSION) { // The only currently defined value is 1.
        throw new UnsupportedError(`Version ${version} of the AEAD-encrypted data packet is not supported.`);
      }
      this.cipherAlgorithm = await reader.readByte();
      this.aeadAlgorithm = await reader.readByte();
      this.chunkSizeByte = await reader.readByte();

      const mode = getAEADMode(this.aeadAlgorithm, true);
      this.iv = await reader.readBytes(mode.ivLength);
      this.encrypted = reader.remainder();
    });
  }

  /**
   * Write the encrypted payload of bytes in the order: version, IV, ciphertext (see specification)
   * @returns {Uint8Array | ReadableStream<Uint8Array>} The encrypted payload.
   */
  write() {
    return util.concat([new Uint8Array([this.version, this.cipherAlgorithm, this.aeadAlgorithm, this.chunkSizeByte]), this.iv, this.encrypted]);
  }

  /**
   * Decrypt the encrypted payload.
   * @param {enums.symmetric} sessionKeyAlgorithm - The session key's cipher algorithm
   * @param {Uint8Array} key - The session key used to encrypt the payload
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @throws {Error} if decryption was not successful
   * @async
   */
  async decrypt(sessionKeyAlgorithm, key, config$1 = config) {
    this.packets = await PacketList.fromBinary(
      await runAEAD(this, 'decrypt', key, clone(this.encrypted)),
      allowedPackets$3,
      config$1
    );
  }

  /**
   * Encrypt the packet payload.
   * @param {enums.symmetric} sessionKeyAlgorithm - The session key's cipher algorithm
   * @param {Uint8Array} key - The session key used to encrypt the payload
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @throws {Error} if encryption was not successful
   * @async
   */
  async encrypt(sessionKeyAlgorithm, key, config$1 = config) {
    this.cipherAlgorithm = sessionKeyAlgorithm;

    const { ivLength } = getAEADMode(this.aeadAlgorithm, true);
    this.iv = getRandomBytes(ivLength); // generate new random IV
    this.chunkSizeByte = config$1.aeadChunkSizeByte;
    const data = this.packets.write();
    this.encrypted = await runAEAD(this, 'encrypt', key, data);
  }
}

// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


/**
 * Public-Key Encrypted Session Key Packets (Tag 1)
 *
 * {@link https://tools.ietf.org/html/rfc4880#section-5.1|RFC4880 5.1}:
 * A Public-Key Encrypted Session Key packet holds the session key
 * used to encrypt a message. Zero or more Public-Key Encrypted Session Key
 * packets and/or Symmetric-Key Encrypted Session Key packets may precede a
 * Symmetrically Encrypted Data Packet, which holds an encrypted message. The
 * message is encrypted with the session key, and the session key is itself
 * encrypted and stored in the Encrypted Session Key packet(s). The
 * Symmetrically Encrypted Data Packet is preceded by one Public-Key Encrypted
 * Session Key packet for each OpenPGP key to which the message is encrypted.
 * The recipient of the message finds a session key that is encrypted to their
 * public key, decrypts the session key, and then uses the session key to
 * decrypt the message.
 */
class PublicKeyEncryptedSessionKeyPacket {
  static get tag() {
    return enums.packet.publicKeyEncryptedSessionKey;
  }

  constructor() {
    this.version = null;

    // For version 3, but also used internally by v6 in e.g. `getEncryptionKeyIDs()`
    this.publicKeyID = new KeyID();

    // For version 6:
    this.publicKeyVersion = null;
    this.publicKeyFingerprint = null;

    // For all versions:
    this.publicKeyAlgorithm = null;

    this.sessionKey = null;
    /**
     * Algorithm to encrypt the message with
     * @type {enums.symmetric}
     */
    this.sessionKeyAlgorithm = null;

    /** @type {Object} */
    this.encrypted = {};
  }

  static fromObject({
    version, encryptionKeyPacket, anonymousRecipient, sessionKey, sessionKeyAlgorithm
  }) {
    const pkesk = new PublicKeyEncryptedSessionKeyPacket();

    if (version !== 3 && version !== 6) {
      throw new Error('Unsupported PKESK version');
    }

    pkesk.version = version;

    if (version === 6) {
      pkesk.publicKeyVersion = anonymousRecipient ? null : encryptionKeyPacket.version;
      pkesk.publicKeyFingerprint = anonymousRecipient ? null : encryptionKeyPacket.getFingerprintBytes();
    }

    pkesk.publicKeyID = anonymousRecipient ? KeyID.wildcard() : encryptionKeyPacket.getKeyID();
    pkesk.publicKeyAlgorithm = encryptionKeyPacket.algorithm;
    pkesk.sessionKey = sessionKey;
    pkesk.sessionKeyAlgorithm = sessionKeyAlgorithm;

    return pkesk;
  }

  /**
   * Parsing function for a publickey encrypted session key packet (tag 1).
   *
   * @param {Uint8Array} bytes - Payload of a tag 1 packet
   */
  read(bytes) {
    let offset = 0;
    this.version = bytes[offset++];
    if (this.version !== 3 && this.version !== 6) {
      throw new UnsupportedError(`Version ${this.version} of the PKESK packet is unsupported.`);
    }
    if (this.version === 6) {
      // A one-octet size of the following two fields:
      // - A one octet key version number.
      // - The fingerprint of the public key or subkey to which the session key is encrypted.
      // The size may also be zero.
      const versionAndFingerprintLength = bytes[offset++];
      if (versionAndFingerprintLength) {
        this.publicKeyVersion = bytes[offset++];
        const fingerprintLength = versionAndFingerprintLength - 1;
        this.publicKeyFingerprint = bytes.subarray(offset, offset + fingerprintLength); offset += fingerprintLength;
        if (this.publicKeyVersion >= 5) {
          // For v5/6 the Key ID is the high-order 64 bits of the fingerprint.
          this.publicKeyID.read(this.publicKeyFingerprint);
        } else {
          // For v4 The Key ID is the low-order 64 bits of the fingerprint.
          this.publicKeyID.read(this.publicKeyFingerprint.subarray(-8));
        }
      } else {
        // The size may also be zero, and the key version and
        // fingerprint omitted for an "anonymous recipient"
        this.publicKeyID = KeyID.wildcard();
      }
    } else {
      offset += this.publicKeyID.read(bytes.subarray(offset, offset + 8));
    }
    this.publicKeyAlgorithm = bytes[offset++];
    this.encrypted = parseEncSessionKeyParams(this.publicKeyAlgorithm, bytes.subarray(offset));
    if (this.publicKeyAlgorithm === enums.publicKey.x25519 || this.publicKeyAlgorithm === enums.publicKey.x448) {
      if (this.version === 3) {
        this.sessionKeyAlgorithm = enums.write(enums.symmetric, this.encrypted.C.algorithm);
      } else if (this.encrypted.C.algorithm !== null) {
        throw new Error('Unexpected cleartext symmetric algorithm');
      }
    }
  }

  /**
   * Create a binary representation of a tag 1 packet
   *
   * @returns {Uint8Array} The Uint8Array representation.
   */
  write() {
    const arr = [
      new Uint8Array([this.version])
    ];

    if (this.version === 6) {
      if (this.publicKeyFingerprint !== null) {
        arr.push(new Uint8Array([
          this.publicKeyFingerprint.length + 1,
          this.publicKeyVersion]
        ));
        arr.push(this.publicKeyFingerprint);
      } else {
        arr.push(new Uint8Array([0]));
      }
    } else {
      arr.push(this.publicKeyID.write());
    }

    arr.push(
      new Uint8Array([this.publicKeyAlgorithm]),
      serializeParams(this.publicKeyAlgorithm, this.encrypted)
    );

    return util.concatUint8Array(arr);
  }

  /**
   * Encrypt session key packet
   * @param {PublicKeyPacket} key - Public key
   * @throws {Error} if encryption failed
   * @async
   */
  async encrypt(key) {
    const algo = enums.write(enums.publicKey, this.publicKeyAlgorithm);
    // No symmetric encryption algorithm identifier is passed to the public-key algorithm for a
    // v6 PKESK packet, as it is included in the v2 SEIPD packet.
    const sessionKeyAlgorithm = this.version === 3 ? this.sessionKeyAlgorithm : null;
    const fingerprint = key.version === 5 ? key.getFingerprintBytes().subarray(0, 20) : key.getFingerprintBytes();
    const encoded = encodeSessionKey(this.version, algo, sessionKeyAlgorithm, this.sessionKey);
    this.encrypted = await publicKeyEncrypt(
      algo, sessionKeyAlgorithm, key.publicParams, encoded, fingerprint);
  }

  /**
   * Decrypts the session key (only for public key encrypted session key packets (tag 1)
   * @param {SecretKeyPacket} key - decrypted private key
   * @param {Object} [randomSessionKey] - Bogus session key to use in case of sensitive decryption error, or if the decrypted session key is of a different type/size.
   *                                      This is needed for constant-time processing. Expected object of the form: { sessionKey: Uint8Array, sessionKeyAlgorithm: enums.symmetric }
   * @throws {Error} if decryption failed, unless `randomSessionKey` is given
   * @async
   */
  async decrypt(key, randomSessionKey) {
    // check that session key algo matches the secret key algo
    if (this.publicKeyAlgorithm !== key.algorithm) {
      throw new Error('Decryption error');
    }

    const randomPayload = randomSessionKey ?
      encodeSessionKey(this.version, this.publicKeyAlgorithm, randomSessionKey.sessionKeyAlgorithm, randomSessionKey.sessionKey) :
      null;
    const fingerprint = key.version === 5 ? key.getFingerprintBytes().subarray(0, 20) : key.getFingerprintBytes();
    const decryptedData = await publicKeyDecrypt(this.publicKeyAlgorithm, key.publicParams, key.privateParams, this.encrypted, fingerprint, randomPayload);

    const { sessionKey, sessionKeyAlgorithm } = decodeSessionKey(this.version, this.publicKeyAlgorithm, decryptedData, randomSessionKey);

    if (this.version === 3) {
      // v3 Montgomery curves have cleartext cipher algo
      const hasEncryptedAlgo = this.publicKeyAlgorithm !== enums.publicKey.x25519 && this.publicKeyAlgorithm !== enums.publicKey.x448;
      this.sessionKeyAlgorithm = hasEncryptedAlgo ? sessionKeyAlgorithm : this.sessionKeyAlgorithm;

      if (sessionKey.length !== getCipherParams(this.sessionKeyAlgorithm).keySize) {
        throw new Error('Unexpected session key size');
      }
    }
    this.sessionKey = sessionKey;
  }
}


function encodeSessionKey(version, keyAlgo, cipherAlgo, sessionKeyData) {
  switch (keyAlgo) {
    case enums.publicKey.rsaEncrypt:
    case enums.publicKey.rsaEncryptSign:
    case enums.publicKey.elgamal:
    case enums.publicKey.ecdh:
      // add checksum
      return util.concatUint8Array([
        new Uint8Array(version === 6 ? [] : [cipherAlgo]),
        sessionKeyData,
        util.writeChecksum(sessionKeyData.subarray(sessionKeyData.length % 8))
      ]);
    case enums.publicKey.x25519:
    case enums.publicKey.x448:
      return sessionKeyData;
    default:
      throw new Error('Unsupported public key algorithm');
  }
}


function decodeSessionKey(version, keyAlgo, decryptedData, randomSessionKey) {
  switch (keyAlgo) {
    case enums.publicKey.rsaEncrypt:
    case enums.publicKey.rsaEncryptSign:
    case enums.publicKey.elgamal:
    case enums.publicKey.ecdh: {
      // verify checksum in constant time
      const result = decryptedData.subarray(0, decryptedData.length - 2);
      const checksum = decryptedData.subarray(decryptedData.length - 2);
      const computedChecksum = util.writeChecksum(result.subarray(result.length % 8));
      const isValidChecksum = computedChecksum[0] === checksum[0] & computedChecksum[1] === checksum[1];
      const decryptedSessionKey = version === 6 ?
        { sessionKeyAlgorithm: null, sessionKey: result } :
        { sessionKeyAlgorithm: result[0], sessionKey: result.subarray(1) };
      if (randomSessionKey) {
        // We must not leak info about the validity of the decrypted checksum or cipher algo.
        // The decrypted session key must be of the same algo and size as the random session key, otherwise we discard it and use the random data.
        const isValidPayload = isValidChecksum &
          decryptedSessionKey.sessionKeyAlgorithm === randomSessionKey.sessionKeyAlgorithm &
          decryptedSessionKey.sessionKey.length === randomSessionKey.sessionKey.length;
        return {
          sessionKey: util.selectUint8Array(isValidPayload, decryptedSessionKey.sessionKey, randomSessionKey.sessionKey),
          sessionKeyAlgorithm: version === 6 ? null : util.selectUint8(
            isValidPayload,
            decryptedSessionKey.sessionKeyAlgorithm,
            randomSessionKey.sessionKeyAlgorithm
          )
        };
      } else {
        const isValidPayload = isValidChecksum && (
          version === 6 || enums.read(enums.symmetric, decryptedSessionKey.sessionKeyAlgorithm));
        if (isValidPayload) {
          return decryptedSessionKey;
        } else {
          throw new Error('Decryption error');
        }
      }
    }
    case enums.publicKey.x25519:
    case enums.publicKey.x448:
      return {
        sessionKeyAlgorithm: null,
        sessionKey: decryptedData
      };
    default:
      throw new Error('Unsupported public key algorithm');
  }
}

// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


/**
 * Symmetric-Key Encrypted Session Key Packets (Tag 3)
 *
 * {@link https://tools.ietf.org/html/rfc4880#section-5.3|RFC4880 5.3}:
 * The Symmetric-Key Encrypted Session Key packet holds the
 * symmetric-key encryption of a session key used to encrypt a message.
 * Zero or more Public-Key Encrypted Session Key packets and/or
 * Symmetric-Key Encrypted Session Key packets may precede a
 * Symmetrically Encrypted Data packet that holds an encrypted message.
 * The message is encrypted with a session key, and the session key is
 * itself encrypted and stored in the Encrypted Session Key packet or
 * the Symmetric-Key Encrypted Session Key packet.
 */
class SymEncryptedSessionKeyPacket {
  static get tag() {
    return enums.packet.symEncryptedSessionKey;
  }

  /**
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   */
  constructor(config$1 = config) {
    this.version = config$1.aeadProtect ? 6 : 4;
    this.sessionKey = null;
    /**
     * Algorithm to encrypt the session key with
     * @type {enums.symmetric}
     */
    this.sessionKeyEncryptionAlgorithm = null;
    /**
     * Algorithm to encrypt the message with
     * @type {enums.symmetric}
     */
    this.sessionKeyAlgorithm = null;
    /**
     * AEAD mode to encrypt the session key with (if AEAD protection is enabled)
     * @type {enums.aead}
     */
    this.aeadAlgorithm = enums.write(enums.aead, config$1.preferredAEADAlgorithm);
    this.encrypted = null;
    this.s2k = null;
    this.iv = null;
  }

  /**
   * Parsing function for a symmetric encrypted session key packet (tag 3).
   *
   * @param {Uint8Array} bytes - Payload of a tag 3 packet
   */
  read(bytes) {
    let offset = 0;

    // A one-octet version number with value 4, 5 or 6.
    this.version = bytes[offset++];
    if (this.version !== 4 && this.version !== 5 && this.version !== 6) {
      throw new UnsupportedError(`Version ${this.version} of the SKESK packet is unsupported.`);
    }

    if (this.version === 6) {
      // A one-octet scalar octet count of the following 5 fields.
      offset++;
    }

    // A one-octet number describing the symmetric algorithm used.
    const algo = bytes[offset++];

    if (this.version >= 5) {
      // A one-octet AEAD algorithm.
      this.aeadAlgorithm = bytes[offset++];

      if (this.version === 6) {
        // A one-octet scalar octet count of the following field.
        offset++;
      }
    }

    // A string-to-key (S2K) specifier, length as defined above.
    const s2kType = bytes[offset++];
    this.s2k = newS2KFromType(s2kType);
    offset += this.s2k.read(bytes.subarray(offset, bytes.length));

    if (this.version >= 5) {
      const mode = getAEADMode(this.aeadAlgorithm, true);

      // A starting initialization vector of size specified by the AEAD
      // algorithm.
      this.iv = bytes.subarray(offset, offset += mode.ivLength);
    }

    // The encrypted session key itself, which is decrypted with the
    // string-to-key object. This is optional in version 4.
    if (this.version >= 5 || offset < bytes.length) {
      this.encrypted = bytes.subarray(offset, bytes.length);
      this.sessionKeyEncryptionAlgorithm = algo;
    } else {
      this.sessionKeyAlgorithm = algo;
    }
  }

  /**
   * Create a binary representation of a tag 3 packet
   *
   * @returns {Uint8Array} The Uint8Array representation.
  */
  write() {
    const algo = this.encrypted === null ?
      this.sessionKeyAlgorithm :
      this.sessionKeyEncryptionAlgorithm;

    let bytes;

    const s2k = this.s2k.write();
    if (this.version === 6) {
      const s2kLen = s2k.length;
      const fieldsLen = 3 + s2kLen + this.iv.length;
      bytes = util.concatUint8Array([new Uint8Array([this.version, fieldsLen, algo, this.aeadAlgorithm, s2kLen]), s2k, this.iv, this.encrypted]);
    } else if (this.version === 5) {
      bytes = util.concatUint8Array([new Uint8Array([this.version, algo, this.aeadAlgorithm]), s2k, this.iv, this.encrypted]);
    } else {
      bytes = util.concatUint8Array([new Uint8Array([this.version, algo]), s2k]);

      if (this.encrypted !== null) {
        bytes = util.concatUint8Array([bytes, this.encrypted]);
      }
    }

    return bytes;
  }

  /**
   * Decrypts the session key with the given passphrase
   * @param {String} passphrase - The passphrase in string form
   * @throws {Error} if decryption was not successful
   * @async
   */
  async decrypt(passphrase) {
    const algo = this.sessionKeyEncryptionAlgorithm !== null ?
      this.sessionKeyEncryptionAlgorithm :
      this.sessionKeyAlgorithm;

    const { blockSize, keySize } = getCipherParams(algo);
    const key = await this.s2k.produceKey(passphrase, keySize);

    if (this.version >= 5) {
      const mode = getAEADMode(this.aeadAlgorithm, true);
      const adata = new Uint8Array([0xC0 | SymEncryptedSessionKeyPacket.tag, this.version, this.sessionKeyEncryptionAlgorithm, this.aeadAlgorithm]);
      const encryptionKey = this.version === 6 ? await computeHKDF(enums.hash.sha256, key, new Uint8Array(), adata, keySize) : key;
      const modeInstance = await mode(algo, encryptionKey);
      this.sessionKey = await modeInstance.decrypt(this.encrypted, this.iv, adata);
    } else if (this.encrypted !== null) {
      const decrypted = await decrypt$1(algo, key, this.encrypted, new Uint8Array(blockSize));

      this.sessionKeyAlgorithm = enums.write(enums.symmetric, decrypted[0]);
      this.sessionKey = decrypted.subarray(1, decrypted.length);
      if (this.sessionKey.length !== getCipherParams(this.sessionKeyAlgorithm).keySize) {
        throw new Error('Unexpected session key size');
      }
    } else {
      // session key size is checked as part of SEIPDv2 decryption, where we know the expected symmetric algo
      this.sessionKey = key;
    }
  }

  /**
   * Encrypts the session key with the given passphrase
   * @param {String} passphrase - The passphrase in string form
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @throws {Error} if encryption was not successful
   * @async
   */
  async encrypt(passphrase, config$1 = config) {
    const algo = this.sessionKeyEncryptionAlgorithm !== null ?
      this.sessionKeyEncryptionAlgorithm :
      this.sessionKeyAlgorithm;

    this.sessionKeyEncryptionAlgorithm = algo;

    this.s2k = newS2KFromConfig(config$1);
    this.s2k.generateSalt();

    const { blockSize, keySize } = getCipherParams(algo);
    const key = await this.s2k.produceKey(passphrase, keySize);

    if (this.sessionKey === null) {
      this.sessionKey = generateSessionKey$1(this.sessionKeyAlgorithm);
    }

    if (this.version >= 5) {
      const mode = getAEADMode(this.aeadAlgorithm);
      this.iv = getRandomBytes(mode.ivLength); // generate new random IV
      const adata = new Uint8Array([0xC0 | SymEncryptedSessionKeyPacket.tag, this.version, this.sessionKeyEncryptionAlgorithm, this.aeadAlgorithm]);
      const encryptionKey = this.version === 6 ? await computeHKDF(enums.hash.sha256, key, new Uint8Array(), adata, keySize) : key;
      const modeInstance = await mode(algo, encryptionKey);
      this.encrypted = await modeInstance.encrypt(this.sessionKey, this.iv, adata);
    } else {
      const toEncrypt = util.concatUint8Array([
        new Uint8Array([this.sessionKeyAlgorithm]),
        this.sessionKey
      ]);
      this.encrypted = await encrypt$1(algo, key, toEncrypt, new Uint8Array(blockSize));
    }
  }
}

// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


/**
 * Implementation of the Key Material Packet (Tag 5,6,7,14)
 *
 * {@link https://tools.ietf.org/html/rfc4880#section-5.5|RFC4480 5.5}:
 * A key material packet contains all the information about a public or
 * private key.  There are four variants of this packet type, and two
 * major versions.
 *
 * A Public-Key packet starts a series of packets that forms an OpenPGP
 * key (sometimes called an OpenPGP certificate).
 */
class PublicKeyPacket {
  static get tag() {
    return enums.packet.publicKey;
  }

  /**
   * @param {Date} [date] - Creation date
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   */
  constructor(date = new Date(), config$1 = config) {
    /**
     * Packet version
     * @type {Integer}
     */
    this.version = config$1.v6Keys ? 6 : 4;
    /**
     * Key creation date.
     * @type {Date}
     */
    this.created = util.normalizeDate(date);
    /**
     * Public key algorithm.
     * @type {enums.publicKey}
     */
    this.algorithm = null;
    /**
     * Algorithm specific public params
     * @type {Object}
     */
    this.publicParams = null;
    /**
     * Time until expiration in days (V3 only)
     * @type {Integer}
     */
    this.expirationTimeV3 = 0;
    /**
     * Fingerprint bytes
     * @type {Uint8Array}
     */
    this.fingerprint = null;
    /**
     * KeyID
     * @type {module:type/keyid~KeyID}
     */
    this.keyID = null;
  }

  /**
   * Create a PublicKeyPacket from a SecretKeyPacket
   * @param {SecretKeyPacket} secretKeyPacket - key packet to convert
   * @returns {PublicKeyPacket} public key packet
   * @static
   */
  static fromSecretKeyPacket(secretKeyPacket) {
    const keyPacket = new PublicKeyPacket();
    const { version, created, algorithm, publicParams, keyID, fingerprint } = secretKeyPacket;
    keyPacket.version = version;
    keyPacket.created = created;
    keyPacket.algorithm = algorithm;
    keyPacket.publicParams = publicParams;
    keyPacket.keyID = keyID;
    keyPacket.fingerprint = fingerprint;
    return keyPacket;
  }

  /**
   * Internal Parser for public keys as specified in {@link https://tools.ietf.org/html/rfc4880#section-5.5.2|RFC 4880 section 5.5.2 Public-Key Packet Formats}
   * @param {Uint8Array} bytes - Input array to read the packet from
   * @returns {Object} This object with attributes set by the parser
   * @async
   */
  async read(bytes, config$1 = config) {
    let pos = 0;
    // A one-octet version number (4, 5 or 6).
    this.version = bytes[pos++];
    if (this.version === 5 && !config$1.enableParsingV5Entities) {
      throw new UnsupportedError('Support for parsing v5 entities is disabled; turn on `config.enableParsingV5Entities` if needed');
    }

    if (this.version === 4 || this.version === 5 || this.version === 6) {
      // - A four-octet number denoting the time that the key was created.
      this.created = util.readDate(bytes.subarray(pos, pos + 4));
      pos += 4;

      // - A one-octet number denoting the public-key algorithm of this key.
      this.algorithm = bytes[pos++];

      if (this.version >= 5) {
        // - A four-octet scalar octet count for the following key material.
        pos += 4;
      }

      // - A series of values comprising the key material.
      const { read, publicParams } = parsePublicKeyParams(this.algorithm, bytes.subarray(pos));
      // The deprecated OIDs for Ed25519Legacy and Curve25519Legacy are used in legacy version 4 keys and signatures.
      // Implementations MUST NOT accept or generate v6 key material using the deprecated OIDs.
      if (
        this.version === 6 &&
        publicParams.oid && (
          publicParams.oid.getName() === enums.curve.curve25519Legacy ||
          publicParams.oid.getName() === enums.curve.ed25519Legacy
        )
      ) {
        throw new Error('Legacy curve25519 cannot be used with v6 keys');
      }
      this.publicParams = publicParams;
      pos += read;

      // we set the fingerprint and keyID already to make it possible to put together the key packets directly in the Key constructor
      await this.computeFingerprintAndKeyID();
      return pos;
    }
    throw new UnsupportedError(`Version ${this.version} of the key packet is unsupported.`);
  }

  /**
   * Creates an OpenPGP public key packet for the given key.
   * @returns {Uint8Array} Bytes encoding the public key OpenPGP packet.
   */
  write() {
    const arr = [];
    // Version
    arr.push(new Uint8Array([this.version]));
    arr.push(util.writeDate(this.created));
    // A one-octet number denoting the public-key algorithm of this key
    arr.push(new Uint8Array([this.algorithm]));

    const params = serializeParams(this.algorithm, this.publicParams);
    if (this.version >= 5) {
      // A four-octet scalar octet count for the following key material
      arr.push(util.writeNumber(params.length, 4));
    }
    // Algorithm-specific params
    arr.push(params);
    return util.concatUint8Array(arr);
  }

  /**
   * Write packet in order to be hashed; either for a signature or a fingerprint
   * @param {Integer} version - target version of signature or key
   */
  writeForHash(version) {
    const bytes = this.writePublicKey();

    const versionOctet = 0x95 + version;
    const lengthOctets = version >= 5 ? 4 : 2;
    return util.concatUint8Array([new Uint8Array([versionOctet]), util.writeNumber(bytes.length, lengthOctets), bytes]);
  }

  /**
   * Check whether secret-key data is available in decrypted form. Returns null for public keys.
   * @returns {Boolean|null}
   */
  isDecrypted() {
    return null;
  }

  /**
   * Returns the creation time of the key
   * @returns {Date}
   */
  getCreationTime() {
    return this.created;
  }

  /**
   * Return the key ID of the key
   * @returns {module:type/keyid~KeyID} The 8-byte key ID
   */
  getKeyID() {
    return this.keyID;
  }

  /**
   * Computes and set the key ID and fingerprint of the key
   * @async
   */
  async computeFingerprintAndKeyID() {
    await this.computeFingerprint();
    this.keyID = new KeyID();

    if (this.version >= 5) {
      this.keyID.read(this.fingerprint.subarray(0, 8));
    } else if (this.version === 4) {
      this.keyID.read(this.fingerprint.subarray(12, 20));
    } else {
      throw new Error('Unsupported key version');
    }
  }

  /**
   * Computes and set the fingerprint of the key
   */
  async computeFingerprint() {
    const toHash = this.writeForHash(this.version);

    if (this.version >= 5) {
      this.fingerprint = await computeDigest(enums.hash.sha256, toHash);
    } else if (this.version === 4) {
      this.fingerprint = await computeDigest(enums.hash.sha1, toHash);
    } else {
      throw new Error('Unsupported key version');
    }
  }

  /**
   * Returns the fingerprint of the key, as an array of bytes
   * @returns {Uint8Array} A Uint8Array containing the fingerprint
   */
  getFingerprintBytes() {
    return this.fingerprint;
  }

  /**
   * Calculates and returns the fingerprint of the key, as a string
   * @returns {String} A string containing the fingerprint in lowercase hex
   */
  getFingerprint() {
    return util.uint8ArrayToHex(this.getFingerprintBytes());
  }

  /**
   * Calculates whether two keys have the same fingerprint without actually calculating the fingerprint
   * @returns {Boolean} Whether the two keys have the same version and public key data.
   */
  hasSameFingerprintAs(other) {
    return this.version === other.version && util.equalsUint8Array(this.writePublicKey(), other.writePublicKey());
  }

  /**
   * Returns algorithm information
   * @returns {Object} An object of the form {algorithm: String, bits:int, curve:String}.
   */
  getAlgorithmInfo() {
    const result = {};
    result.algorithm = enums.read(enums.publicKey, this.algorithm);
    // RSA, DSA or ElGamal public modulo
    const modulo = this.publicParams.n || this.publicParams.p;
    if (modulo) {
      result.bits = util.uint8ArrayBitLength(modulo);
    } else if (this.publicParams.oid) {
      result.curve = this.publicParams.oid.getName();
    }
    return result;
  }
}

/**
 * Alias of read()
 * @see PublicKeyPacket#read
 */
PublicKeyPacket.prototype.readPublicKey = PublicKeyPacket.prototype.read;

/**
 * Alias of write()
 * @see PublicKeyPacket#write
 */
PublicKeyPacket.prototype.writePublicKey = PublicKeyPacket.prototype.write;

// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


// A SE packet can contain the following packet types
const allowedPackets$2 = /*#__PURE__*/ util.constructAllowedPackets([
  LiteralDataPacket,
  CompressedDataPacket,
  OnePassSignaturePacket,
  SignaturePacket
]);

/**
 * Implementation of the Symmetrically Encrypted Data Packet (Tag 9)
 *
 * {@link https://tools.ietf.org/html/rfc4880#section-5.7|RFC4880 5.7}:
 * The Symmetrically Encrypted Data packet contains data encrypted with a
 * symmetric-key algorithm. When it has been decrypted, it contains other
 * packets (usually a literal data packet or compressed data packet, but in
 * theory other Symmetrically Encrypted Data packets or sequences of packets
 * that form whole OpenPGP messages).
 */
class SymmetricallyEncryptedDataPacket {
  static get tag() {
    return enums.packet.symmetricallyEncryptedData;
  }

  constructor() {
    /**
     * Encrypted secret-key data
     */
    this.encrypted = null;
    /**
     * Decrypted packets contained within.
     * @type {PacketList}
     */
    this.packets = null;
  }

  read(bytes) {
    this.encrypted = bytes;
  }

  write() {
    return this.encrypted;
  }

  /**
   * Decrypt the symmetrically-encrypted packet data
   * See {@link https://tools.ietf.org/html/rfc4880#section-9.2|RFC 4880 9.2} for algorithms.
   * @param {module:enums.symmetric} sessionKeyAlgorithm - Symmetric key algorithm to use
   * @param {Uint8Array} key - The key of cipher blocksize length to be used
   * @param {Object} [config] - Full configuration, defaults to openpgp.config

   * @throws {Error} if decryption was not successful
   * @async
   */
  async decrypt(sessionKeyAlgorithm, key, config$1 = config) {
    // If MDC errors are not being ignored, all missing MDC packets in symmetrically encrypted data should throw an error
    if (!config$1.allowUnauthenticatedMessages) {
      throw new Error('Message is not authenticated.');
    }

    const { blockSize } = getCipherParams(sessionKeyAlgorithm);
    const encrypted = await readToEnd(clone(this.encrypted));
    const decrypted = await decrypt$1(sessionKeyAlgorithm, key,
      encrypted.subarray(blockSize + 2),
      encrypted.subarray(2, blockSize + 2)
    );

    this.packets = await PacketList.fromBinary(decrypted, allowedPackets$2, config$1);
  }

  /**
   * Encrypt the symmetrically-encrypted packet data
   * See {@link https://tools.ietf.org/html/rfc4880#section-9.2|RFC 4880 9.2} for algorithms.
   * @param {module:enums.symmetric} sessionKeyAlgorithm - Symmetric key algorithm to use
   * @param {Uint8Array} key - The key of cipher blocksize length to be used
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @throws {Error} if encryption was not successful
   * @async
   */
  async encrypt(sessionKeyAlgorithm, key, config$1 = config) {
    const data = this.packets.write();
    const { blockSize } = getCipherParams(sessionKeyAlgorithm);

    const prefix = await getPrefixRandom(sessionKeyAlgorithm);
    const FRE = await encrypt$1(sessionKeyAlgorithm, key, prefix, new Uint8Array(blockSize));
    const ciphertext = await encrypt$1(sessionKeyAlgorithm, key, data, FRE.subarray(2));
    this.encrypted = util.concat([FRE, ciphertext]);
  }
}

// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


/**
 * Implementation of the strange "Marker packet" (Tag 10)
 *
 * {@link https://tools.ietf.org/html/rfc4880#section-5.8|RFC4880 5.8}:
 * An experimental version of PGP used this packet as the Literal
 * packet, but no released version of PGP generated Literal packets with this
 * tag. With PGP 5.x, this packet has been reassigned and is reserved for use as
 * the Marker packet.
 *
 * The body of this packet consists of:
 *   The three octets 0x50, 0x47, 0x50 (which spell "PGP" in UTF-8).
 *
 * Such a packet MUST be ignored when received. It may be placed at the
 * beginning of a message that uses features not available in PGP
 * version 2.6 in order to cause that version to report that newer
 * software is necessary to process the message.
 */
class MarkerPacket {
  static get tag() {
    return enums.packet.marker;
  }

  /**
   * Parsing function for a marker data packet (tag 10).
   * @param {Uint8Array} bytes - Payload of a tag 10 packet
   * @returns {Boolean} whether the packet payload contains "PGP"
   */
  read(bytes) {
    if (bytes[0] === 0x50 && // P
        bytes[1] === 0x47 && // G
        bytes[2] === 0x50) { // P
      return true;
    }
    return false;
  }

  write() {
    return new Uint8Array([0x50, 0x47, 0x50]);
  }
}

// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


/**
 * A Public-Subkey packet (tag 14) has exactly the same format as a
 * Public-Key packet, but denotes a subkey.  One or more subkeys may be
 * associated with a top-level key.  By convention, the top-level key
 * provides signature services, and the subkeys provide encryption
 * services.
 * @extends PublicKeyPacket
 */
class PublicSubkeyPacket extends PublicKeyPacket {
  static get tag() {
    return enums.packet.publicSubkey;
  }

  /**
   * @param {Date} [date] - Creation date
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   */
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(date, config) {
    super(date, config);
  }

  /**
   * Create a PublicSubkeyPacket from a SecretSubkeyPacket
   * @param {SecretSubkeyPacket} secretSubkeyPacket - subkey packet to convert
   * @returns {SecretSubkeyPacket} public key packet
   * @static
   */
  static fromSecretSubkeyPacket(secretSubkeyPacket) {
    const keyPacket = new PublicSubkeyPacket();
    const { version, created, algorithm, publicParams, keyID, fingerprint } = secretSubkeyPacket;
    keyPacket.version = version;
    keyPacket.created = created;
    keyPacket.algorithm = algorithm;
    keyPacket.publicParams = publicParams;
    keyPacket.keyID = keyID;
    keyPacket.fingerprint = fingerprint;
    return keyPacket;
  }
}

// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


/**
 * Implementation of the User Attribute Packet (Tag 17)
 *
 * The User Attribute packet is a variation of the User ID packet.  It
 * is capable of storing more types of data than the User ID packet,
 * which is limited to text.  Like the User ID packet, a User Attribute
 * packet may be certified by the key owner ("self-signed") or any other
 * key owner who cares to certify it.  Except as noted, a User Attribute
 * packet may be used anywhere that a User ID packet may be used.
 *
 * While User Attribute packets are not a required part of the OpenPGP
 * standard, implementations SHOULD provide at least enough
 * compatibility to properly handle a certification signature on the
 * User Attribute packet.  A simple way to do this is by treating the
 * User Attribute packet as a User ID packet with opaque contents, but
 * an implementation may use any method desired.
 */
class UserAttributePacket {
  static get tag() {
    return enums.packet.userAttribute;
  }

  constructor() {
    this.attributes = [];
  }

  /**
   * parsing function for a user attribute packet (tag 17).
   * @param {Uint8Array} input - Payload of a tag 17 packet
   */
  read(bytes) {
    let i = 0;
    while (i < bytes.length) {
      const len = readSimpleLength(bytes.subarray(i, bytes.length));
      i += len.offset;

      this.attributes.push(util.uint8ArrayToString(bytes.subarray(i, i + len.len)));
      i += len.len;
    }
  }

  /**
   * Creates a binary representation of the user attribute packet
   * @returns {Uint8Array} String representation.
   */
  write() {
    const arr = [];
    for (let i = 0; i < this.attributes.length; i++) {
      arr.push(writeSimpleLength(this.attributes[i].length));
      arr.push(util.stringToUint8Array(this.attributes[i]));
    }
    return util.concatUint8Array(arr);
  }

  /**
   * Compare for equality
   * @param {UserAttributePacket} usrAttr
   * @returns {Boolean} True if equal.
   */
  equals(usrAttr) {
    if (!usrAttr || !(usrAttr instanceof UserAttributePacket)) {
      return false;
    }
    return this.attributes.every(function(attr, index) {
      return attr === usrAttr.attributes[index];
    });
  }
}

// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


/**
 * A Secret-Key packet contains all the information that is found in a
 * Public-Key packet, including the public-key material, but also
 * includes the secret-key material after all the public-key fields.
 * @extends PublicKeyPacket
 */
class SecretKeyPacket extends PublicKeyPacket {
  static get tag() {
    return enums.packet.secretKey;
  }

  /**
   * @param {Date} [date] - Creation date
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   */
  constructor(date = new Date(), config$1 = config) {
    super(date, config$1);
    /**
     * Secret-key data
     */
    this.keyMaterial = null;
    /**
     * Indicates whether secret-key data is encrypted. `this.isEncrypted === false` means data is available in decrypted form.
     */
    this.isEncrypted = null;
    /**
     * S2K usage
     * @type {enums.symmetric}
     */
    this.s2kUsage = 0;
    /**
     * S2K object
     * @type {type/s2k}
     */
    this.s2k = null;
    /**
     * Symmetric algorithm to encrypt the key with
     * @type {enums.symmetric}
     */
    this.symmetric = null;
    /**
     * AEAD algorithm to encrypt the key with (if AEAD protection is enabled)
     * @type {enums.aead}
     */
    this.aead = null;
    /**
     * Whether the key is encrypted using the legacy AEAD format proposal from RFC4880bis
     * (i.e. it was encrypted with the flag `config.aeadProtect` in OpenPGP.js v5 or older).
     * This value is only relevant to know how to decrypt the key:
     * if AEAD is enabled, a v4 key is always re-encrypted using the standard AEAD mechanism.
     * @type {Boolean}
     * @private
     */
    this.isLegacyAEAD = null;
    /**
     * Decrypted private parameters, referenced by name
     * @type {Object}
     */
    this.privateParams = null;
    /**
     * `true` for keys whose integrity is already confirmed, based on
     * the AEAD encryption mechanism
     * @type {Boolean}
     * @private
     */
    this.usedModernAEAD = null;
  }

  // 5.5.3.  Secret-Key Packet Formats

  /**
   * Internal parser for private keys as specified in
   * {@link https://tools.ietf.org/html/draft-ietf-openpgp-rfc4880bis-04#section-5.5.3|RFC4880bis-04 section 5.5.3}
   * @param {Uint8Array} bytes - Input string to read the packet from
   * @async
   */
  async read(bytes, config$1 = config) {
    // - A Public-Key or Public-Subkey packet, as described above.
    let i = await this.readPublicKey(bytes, config$1);
    const startOfSecretKeyData = i;

    // - One octet indicating string-to-key usage conventions.  Zero
    //   indicates that the secret-key data is not encrypted.  255 or 254
    //   indicates that a string-to-key specifier is being given.  Any
    //   other value is a symmetric-key encryption algorithm identifier.
    this.s2kUsage = bytes[i++];

    // - Only for a version 5 packet, a one-octet scalar octet count of
    //   the next 4 optional fields.
    if (this.version === 5) {
      i++;
    }

    // - Only for a version 6 packet where the secret key material is
    //   encrypted (that is, where the previous octet is not zero), a one-
    //   octet scalar octet count of the cumulative length of all the
    //   following optional string-to-key parameter fields.
    if (this.version === 6 && this.s2kUsage) {
      i++;
    }

    try {
      // - [Optional] If string-to-key usage octet was 255, 254, or 253, a
      //   one-octet symmetric encryption algorithm.
      if (this.s2kUsage === 255 || this.s2kUsage === 254 || this.s2kUsage === 253) {
        this.symmetric = bytes[i++];

        // - [Optional] If string-to-key usage octet was 253, a one-octet
        //   AEAD algorithm.
        if (this.s2kUsage === 253) {
          this.aead = bytes[i++];
        }

        // - [Optional] Only for a version 6 packet, and if string-to-key usage
        //   octet was 255, 254, or 253, an one-octet count of the following field.
        if (this.version === 6) {
          i++;
        }

        // - [Optional] If string-to-key usage octet was 255, 254, or 253, a
        //   string-to-key specifier.  The length of the string-to-key
        //   specifier is implied by its type, as described above.
        const s2kType = bytes[i++];
        this.s2k = newS2KFromType(s2kType);
        i += this.s2k.read(bytes.subarray(i, bytes.length));

        if (this.s2k.type === 'gnu-dummy') {
          return;
        }
      } else if (this.s2kUsage) {
        this.symmetric = this.s2kUsage;
      }


      if (this.s2kUsage) {
        // OpenPGP.js up to v5 used to support encrypting v4 keys using AEAD as specified by draft RFC4880bis (https://www.ietf.org/archive/id/draft-ietf-openpgp-rfc4880bis-10.html#section-5.5.3-3.5).
        // This legacy format is incompatible, but fundamentally indistinguishable, from that of the crypto-refresh for v4 keys (v5 keys are always in legacy format).
        // While parsing the key may succeed (if IV and AES block sizes match), key decryption will always
        // fail if the key was parsed according to the wrong format, since the keys are processed differently.
        // Thus, for v4 keys, we rely on the caller to instruct us to process the key as legacy, via config flag.
        this.isLegacyAEAD = this.s2kUsage === 253 && (
          this.version === 5 || (this.version === 4 && config$1.parseAEADEncryptedV4KeysAsLegacy));
        // - crypto-refresh: If string-to-key usage octet was 255, 254 [..], an initialization vector (IV)
        // of the same length as the cipher's block size.
        // - RFC4880bis (v5 keys, regardless of AEAD): an Initial Vector (IV) of the same length as the
        //   cipher's block size. If string-to-key usage octet was 253 the IV is used as the nonce for the AEAD algorithm.
        // If the AEAD algorithm requires a shorter nonce, the high-order bits of the IV are used and the remaining bits MUST be zero
        if (this.s2kUsage !== 253 || this.isLegacyAEAD) {
          this.iv = bytes.subarray(
            i,
            i + getCipherParams(this.symmetric).blockSize
          );
          this.usedModernAEAD = false;
        } else {
          // crypto-refresh: If string-to-key usage octet was 253 (that is, the secret data is AEAD-encrypted),
          // an initialization vector (IV) of size specified by the AEAD algorithm (see Section 5.13.2), which
          // is used as the nonce for the AEAD algorithm.
          this.iv = bytes.subarray(
            i,
            i + getAEADMode(this.aead).ivLength
          );
          // the non-legacy AEAD encryption mechanism also authenticates public key params; no need for manual validation.
          this.usedModernAEAD = true;
        }

        i += this.iv.length;
      }
    } catch (e) {
      // if the s2k is unsupported, we still want to support encrypting and verifying with the given key
      if (!this.s2kUsage) throw e; // always throw for decrypted keys
      this.unparseableKeyMaterial = bytes.subarray(startOfSecretKeyData);
      this.isEncrypted = true;
    }

    // - Only for a version 5 packet, a four-octet scalar octet count for
    //   the following key material.
    if (this.version === 5) {
      i += 4;
    }

    // - Plain or encrypted multiprecision integers comprising the secret
    //   key data.  These algorithm-specific fields are as described
    //   below.
    this.keyMaterial = bytes.subarray(i);
    this.isEncrypted = !!this.s2kUsage;

    if (!this.isEncrypted) {
      let cleartext;
      if (this.version === 6) {
        cleartext = this.keyMaterial;
      } else {
        cleartext = this.keyMaterial.subarray(0, -2);
        if (!util.equalsUint8Array(util.writeChecksum(cleartext), this.keyMaterial.subarray(-2))) {
          throw new Error('Key checksum mismatch');
        }
      }
      try {
        const { read, privateParams } = parsePrivateKeyParams(this.algorithm, cleartext, this.publicParams);
        if (read < cleartext.length) {
          throw new Error('Error reading MPIs');
        }
        this.privateParams = privateParams;
      } catch (err) {
        if (err instanceof UnsupportedError) throw err;
        // avoid throwing potentially sensitive errors
        throw new Error('Error reading MPIs');
      }
    }
  }

  /**
   * Creates an OpenPGP key packet for the given key.
   * @returns {Uint8Array} A string of bytes containing the secret key OpenPGP packet.
   */
  write() {
    const serializedPublicKey = this.writePublicKey();
    if (this.unparseableKeyMaterial) {
      return util.concatUint8Array([
        serializedPublicKey,
        this.unparseableKeyMaterial
      ]);
    }

    const arr = [serializedPublicKey];
    arr.push(new Uint8Array([this.s2kUsage]));

    const optionalFieldsArr = [];
    // - [Optional] If string-to-key usage octet was 255, 254, or 253, a
    //   one- octet symmetric encryption algorithm.
    if (this.s2kUsage === 255 || this.s2kUsage === 254 || this.s2kUsage === 253) {
      optionalFieldsArr.push(this.symmetric);

      // - [Optional] If string-to-key usage octet was 253, a one-octet
      //   AEAD algorithm.
      if (this.s2kUsage === 253) {
        optionalFieldsArr.push(this.aead);
      }

      const s2k = this.s2k.write();

      // - [Optional] Only for a version 6 packet, and if string-to-key usage
      //   octet was 255, 254, or 253, an one-octet count of the following field.
      if (this.version === 6) {
        optionalFieldsArr.push(s2k.length);
      }

      // - [Optional] If string-to-key usage octet was 255, 254, or 253, a
      //   string-to-key specifier.  The length of the string-to-key
      //   specifier is implied by its type, as described above.
      optionalFieldsArr.push(...s2k);
    }

    // - [Optional] If secret data is encrypted (string-to-key usage octet
    //   not zero), an Initial Vector (IV) of the same length as the
    //   cipher's block size.
    if (this.s2kUsage && this.s2k.type !== 'gnu-dummy') {
      optionalFieldsArr.push(...this.iv);
    }

    if (this.version === 5 || (this.version === 6 && this.s2kUsage)) {
      arr.push(new Uint8Array([optionalFieldsArr.length]));
    }
    arr.push(new Uint8Array(optionalFieldsArr));

    if (!this.isDummy()) {
      if (!this.s2kUsage) {
        this.keyMaterial = serializeParams(this.algorithm, this.privateParams);
      }

      if (this.version === 5) {
        arr.push(util.writeNumber(this.keyMaterial.length, 4));
      }
      arr.push(this.keyMaterial);

      if (!this.s2kUsage && this.version !== 6) {
        arr.push(util.writeChecksum(this.keyMaterial));
      }
    }

    return util.concatUint8Array(arr);
  }

  /**
   * Check whether secret-key data is available in decrypted form.
   * Returns false for gnu-dummy keys and null for public keys.
   * @returns {Boolean|null}
   */
  isDecrypted() {
    return this.isEncrypted === false;
  }

  /**
   * Check whether the key includes secret key material.
   * Some secret keys do not include it, and can thus only be used
   * for public-key operations (encryption and verification).
   * Such keys are:
   * - GNU-dummy keys, where the secret material has been stripped away
   * - encrypted keys with unsupported S2K or cipher
   */
  isMissingSecretKeyMaterial() {
    return this.unparseableKeyMaterial !== undefined || this.isDummy();
  }

  /**
   * Check whether this is a gnu-dummy key
   * @returns {Boolean}
   */
  isDummy() {
    return !!(this.s2k && this.s2k.type === 'gnu-dummy');
  }

  /**
   * Remove private key material, converting the key to a dummy one.
   * The resulting key cannot be used for signing/decrypting but can still verify signatures.
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   */
  makeDummy(config$1 = config) {
    if (this.isDummy()) {
      return;
    }
    if (this.isDecrypted()) {
      this.clearPrivateParams();
    }
    delete this.unparseableKeyMaterial;
    this.isEncrypted = null;
    this.keyMaterial = null;
    this.s2k = newS2KFromType(enums.s2k.gnu, config$1);
    this.s2k.algorithm = 0;
    this.s2k.c = 0;
    this.s2k.type = 'gnu-dummy';
    this.s2kUsage = 254;
    this.symmetric = enums.symmetric.aes256;
    this.isLegacyAEAD = null;
    this.usedModernAEAD = null;
  }

  /**
   * Encrypt the payload. By default, we use aes256 and iterated, salted string
   * to key specifier. If the key is in a decrypted state (isEncrypted === false)
   * and the passphrase is empty or undefined, the key will be set as not encrypted.
   * This can be used to remove passphrase protection after calling decrypt().
   * @param {String} passphrase
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @throws {Error} if encryption was not successful
   * @async
   */
  async encrypt(passphrase, config$1 = config) {
    if (this.isDummy()) {
      return;
    }

    if (!this.isDecrypted()) {
      throw new Error('Key packet is already encrypted');
    }

    if (!passphrase) {
      throw new Error('A non-empty passphrase is required for key encryption.');
    }

    this.s2k = newS2KFromConfig(config$1);
    this.s2k.generateSalt();
    const cleartext = serializeParams(this.algorithm, this.privateParams);
    this.symmetric = enums.symmetric.aes256;

    const { blockSize } = getCipherParams(this.symmetric);

    if (config$1.aeadProtect) {
      this.s2kUsage = 253;
      this.aead = config$1.preferredAEADAlgorithm;
      const mode = getAEADMode(this.aead);
      this.isLegacyAEAD = this.version === 5; // v4 is always re-encrypted with standard format instead.
      this.usedModernAEAD = !this.isLegacyAEAD; // legacy AEAD does not guarantee integrity of public key material

      const serializedPacketTag = writeTag(this.constructor.tag);
      const key = await produceEncryptionKey(this.version, this.s2k, passphrase, this.symmetric, this.aead, serializedPacketTag, this.isLegacyAEAD);

      const modeInstance = await mode(this.symmetric, key);
      this.iv = this.isLegacyAEAD ? getRandomBytes(blockSize) : getRandomBytes(mode.ivLength);
      const associateData = this.isLegacyAEAD ?
        new Uint8Array() :
        util.concatUint8Array([serializedPacketTag, this.writePublicKey()]);

      this.keyMaterial = await modeInstance.encrypt(cleartext, this.iv.subarray(0, mode.ivLength), associateData);
    } else {
      this.s2kUsage = 254;
      this.usedModernAEAD = false;
      const key = await produceEncryptionKey(this.version, this.s2k, passphrase, this.symmetric);
      this.iv = getRandomBytes(blockSize);
      this.keyMaterial = await encrypt$1(this.symmetric, key, util.concatUint8Array([
        cleartext,
        await computeDigest(enums.hash.sha1, cleartext)
      ]), this.iv);
    }
  }

  /**
   * Decrypts the private key params which are needed to use the key.
   * Successful decryption does not imply key integrity, call validate() to confirm that.
   * {@link SecretKeyPacket.isDecrypted} should be false, as
   * otherwise calls to this function will throw an error.
   * @param {String} passphrase - The passphrase for this private key as string
   * @throws {Error} if the key is already decrypted, or if decryption was not successful
   * @async
   */
  async decrypt(passphrase) {
    if (this.isDummy()) {
      return false;
    }

    if (this.unparseableKeyMaterial) {
      throw new Error('Key packet cannot be decrypted: unsupported S2K or cipher algo');
    }

    if (this.isDecrypted()) {
      throw new Error('Key packet is already decrypted.');
    }

    let key;
    const serializedPacketTag = writeTag(this.constructor.tag); // relevant for AEAD only
    if (this.s2kUsage === 254 || this.s2kUsage === 253) {
      key = await produceEncryptionKey(
        this.version, this.s2k, passphrase, this.symmetric, this.aead, serializedPacketTag, this.isLegacyAEAD);
    } else if (this.s2kUsage === 255) {
      throw new Error('Encrypted private key is authenticated using an insecure two-byte hash');
    } else {
      throw new Error('Private key is encrypted using an insecure S2K function: unsalted MD5');
    }

    let cleartext;
    if (this.s2kUsage === 253) {
      const mode = getAEADMode(this.aead, true);
      const modeInstance = await mode(this.symmetric, key);
      try {
        const associateData = this.isLegacyAEAD ?
          new Uint8Array() :
          util.concatUint8Array([serializedPacketTag, this.writePublicKey()]);
        cleartext = await modeInstance.decrypt(this.keyMaterial, this.iv.subarray(0, mode.ivLength), associateData);
      } catch (err) {
        if (err.message === 'Authentication tag mismatch') {
          throw new Error('Incorrect key passphrase: ' + err.message);
        }
        throw err;
      }
    } else {
      const cleartextWithHash = await decrypt$1(this.symmetric, key, this.keyMaterial, this.iv);

      cleartext = cleartextWithHash.subarray(0, -20);
      const hash = await computeDigest(enums.hash.sha1, cleartext);

      if (!util.equalsUint8Array(hash, cleartextWithHash.subarray(-20))) {
        throw new Error('Incorrect key passphrase');
      }
    }

    try {
      const { privateParams } = parsePrivateKeyParams(this.algorithm, cleartext, this.publicParams);
      this.privateParams = privateParams;
    } catch (err) {
      throw new Error('Error reading MPIs');
    }
    this.isEncrypted = false;
    this.keyMaterial = null;
    this.s2kUsage = 0;
    this.aead = null;
    this.symmetric = null;
    this.isLegacyAEAD = null;
  }

  /**
   * Checks that the key parameters are consistent
   * @throws {Error} if validation was not successful
   * @async
   */
  async validate() {
    if (this.isDummy()) {
      return;
    }

    if (!this.isDecrypted()) {
      throw new Error('Key is not decrypted');
    }

    if (this.usedModernAEAD) {
      // key integrity confirmed by successful AEAD decryption
      return;
    }

    let validParams;
    try {
      // this can throw if some parameters are undefined
      validParams = await validateParams(this.algorithm, this.publicParams, this.privateParams);
    } catch (_) {
      validParams = false;
    }
    if (!validParams) {
      throw new Error('Key is invalid');
    }
  }

  async generate(bits, curve) {
    // The deprecated OIDs for Ed25519Legacy and Curve25519Legacy are used in legacy version 4 keys and signatures.
    // Implementations MUST NOT accept or generate v6 key material using the deprecated OIDs.
    if (this.version === 6 && (
      (this.algorithm === enums.publicKey.ecdh && curve === enums.curve.curve25519Legacy) ||
      this.algorithm === enums.publicKey.eddsaLegacy
    )) {
      throw new Error(`Cannot generate v6 keys of type 'ecc' with curve ${curve}. Generate a key of type 'curve25519' instead`);
    }
    const { privateParams, publicParams } = await generateParams(this.algorithm, bits, curve);
    this.privateParams = privateParams;
    this.publicParams = publicParams;
    this.isEncrypted = false;
  }

  /**
   * Clear private key parameters
   */
  clearPrivateParams() {
    if (this.isMissingSecretKeyMaterial()) {
      return;
    }

    Object.keys(this.privateParams).forEach(name => {
      const param = this.privateParams[name];
      param.fill(0);
      delete this.privateParams[name];
    });
    this.privateParams = null;
    this.isEncrypted = true;
  }
}

/**
 * Derive encryption key
 * @param {Number} keyVersion - key derivation differs for v5 keys
 * @param {module:type/s2k} s2k
 * @param {String} passphrase
 * @param {module:enums.symmetric} cipherAlgo
 * @param {module:enums.aead} [aeadMode] - for AEAD-encrypted keys only (excluding v5)
 * @param {Uint8Array} [serializedPacketTag] - for AEAD-encrypted keys only (excluding v5)
 * @param {Boolean} [isLegacyAEAD] - for AEAD-encrypted keys from RFC4880bis (v4 and v5 only)
 * @returns encryption key
 */
async function produceEncryptionKey(keyVersion, s2k, passphrase, cipherAlgo, aeadMode, serializedPacketTag, isLegacyAEAD) {
  if (s2k.type === 'argon2' && !aeadMode) {
    throw new Error('Using Argon2 S2K without AEAD is not allowed');
  }
  if (s2k.type === 'simple' && keyVersion === 6) {
    throw new Error('Using Simple S2K with version 6 keys is not allowed');
  }
  const { keySize } = getCipherParams(cipherAlgo);
  const derivedKey = await s2k.produceKey(passphrase, keySize);
  if (!aeadMode || keyVersion === 5 || isLegacyAEAD) {
    return derivedKey;
  }
  const info = util.concatUint8Array([
    serializedPacketTag,
    new Uint8Array([keyVersion, cipherAlgo, aeadMode])
  ]);
  return computeHKDF(enums.hash.sha256, derivedKey, new Uint8Array(), info, keySize);
}

// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


/**
 * Implementation of the User ID Packet (Tag 13)
 *
 * A User ID packet consists of UTF-8 text that is intended to represent
 * the name and email address of the key holder.  By convention, it
 * includes an RFC 2822 [RFC2822] mail name-addr, but there are no
 * restrictions on its content.  The packet length in the header
 * specifies the length of the User ID.
 */
class UserIDPacket {
  static get tag() {
    return enums.packet.userID;
  }

  constructor() {
    /** A string containing the user id. Usually in the form
     * John Doe <john@example.com>
     * @type {String}
     */
    this.userID = '';

    this.name = '';
    this.email = '';
    this.comment = '';
  }

  /**
   * Create UserIDPacket instance from object
   * @param {Object} userID - Object specifying userID name, email and comment
   * @returns {UserIDPacket}
   * @static
   */
  static fromObject(userID) {
    if (util.isString(userID) ||
      (userID.name && !util.isString(userID.name)) ||
      (userID.email && !util.isEmailAddress(userID.email)) ||
      (userID.comment && !util.isString(userID.comment))) {
      throw new Error('Invalid user ID format');
    }
    const packet = new UserIDPacket();
    Object.assign(packet, userID);
    const components = [];
    if (packet.name) components.push(packet.name);
    if (packet.comment) components.push(`(${packet.comment})`);
    if (packet.email) components.push(`<${packet.email}>`);
    packet.userID = components.join(' ');
    return packet;
  }

  /**
   * Parsing function for a user id packet (tag 13).
   * @param {Uint8Array} input - Payload of a tag 13 packet
   */
  read(bytes, config$1 = config) {
    const userID = util.decodeUTF8(bytes);
    if (userID.length > config$1.maxUserIDLength) {
      throw new Error('User ID string is too long');
    }

    /**
     * We support the conventional cases described in https://www.ietf.org/id/draft-dkg-openpgp-userid-conventions-00.html#section-4.1,
     * as well comments placed between the name (if present) and the bracketed email address:
     * - name (comment) <email>
     * - email
     * In the first case, the `email` is the only required part, and it must contain the `@` symbol.
     * The `name` and `comment` parts can include any letters, whitespace, and symbols, except for `(` and `)`,
     * since they interfere with `comment` parsing.
     */
    const re = /^(?<name>[^()]+\s+)?(?<comment>\([^()]+\)\s+)?(?<email><\S+@\S+>)$/;
    const matches = re.exec(userID);
    if (matches !== null) {
      const { name, comment, email } = matches.groups;
      this.comment = comment?.replace(/^\(|\)|\s$/g, '').trim() || ''; // remove parenthesis and separating whiltespace
      this.name = name?.trim() || '';
      this.email = email.substring(1, email.length - 1); // remove brackets
    } else if (/^[^\s@]+@[^\s@]+$/.test(userID)) { // unbracketed email: enforce single @ and no whitespace
      this.email = userID;
    }

    this.userID = userID;
  }

  /**
   * Creates a binary representation of the user id packet
   * @returns {Uint8Array} Binary representation.
   */
  write() {
    return util.encodeUTF8(this.userID);
  }

  equals(otherUserID) {
    return otherUserID && otherUserID.userID === this.userID;
  }
}

// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


/**
 * A Secret-Subkey packet (tag 7) is the subkey analog of the Secret
 * Key packet and has exactly the same format.
 * @extends SecretKeyPacket
 */
class SecretSubkeyPacket extends SecretKeyPacket {
  static get tag() {
    return enums.packet.secretSubkey;
  }

  /**
   * @param {Date} [date] - Creation date
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   */
  constructor(date = new Date(), config$1 = config) {
    super(date, config$1);
  }
}

/**
 * Implementation of the Trust Packet (Tag 12)
 *
 * {@link https://tools.ietf.org/html/rfc4880#section-5.10|RFC4880 5.10}:
 * The Trust packet is used only within keyrings and is not normally
 * exported.  Trust packets contain data that record the user's
 * specifications of which key holders are trustworthy introducers,
 * along with other information that implementing software uses for
 * trust information.  The format of Trust packets is defined by a given
 * implementation.
 *
 * Trust packets SHOULD NOT be emitted to output streams that are
 * transferred to other users, and they SHOULD be ignored on any input
 * other than local keyring files.
 */
class TrustPacket {
  static get tag() {
    return enums.packet.trust;
  }

  /**
   * Parsing function for a trust packet (tag 12).
   * Currently not implemented as we ignore trust packets
   */
  read() {
    throw new UnsupportedError('Trust packets are not supported');
  }

  write() {
    throw new UnsupportedError('Trust packets are not supported');
  }
}

// OpenPGP.js - An OpenPGP implementation in javascript
// Copyright (C) 2022 Proton AG
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


/**
 * Implementation of the Padding Packet
 *
 * {@link https://datatracker.ietf.org/doc/html/draft-ietf-openpgp-crypto-refresh#name-padding-packet-tag-21}:
 * Padding Packet
 */
class PaddingPacket {
  static get tag() {
    return enums.packet.padding;
  }

  constructor() {
    this.padding = null;
  }

  /**
   * Read a padding packet
   * @param {Uint8Array | ReadableStream<Uint8Array>} bytes
   */
  read(bytes) { // eslint-disable-line @typescript-eslint/no-unused-vars
    // Padding packets are ignored, so this function is never called.
  }

  /**
   * Write the padding packet
   * @returns {Uint8Array} The padding packet.
   */
  write() {
    return this.padding;
  }

  /**
   * Create random padding.
   * @param {Number} length - The length of padding to be generated.
   * @throws {Error} if padding generation was not successful
   * @async
   */
  async createPadding(length) {
    this.padding = await getRandomBytes(length);
  }
}

// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


// A Signature can contain the following packets
const allowedPackets$1 = /*#__PURE__*/ util.constructAllowedPackets([SignaturePacket]);

/**
 * Class that represents an OpenPGP signature.
 */
class Signature {
  /**
   * @param {PacketList} packetlist - The signature packets
   */
  constructor(packetlist) {
    this.packets = packetlist || new PacketList();
  }

  /**
   * Returns binary encoded signature
   * @returns {ReadableStream<Uint8Array>} Binary signature.
   */
  write() {
    return this.packets.write();
  }

  /**
   * Returns ASCII armored text of signature
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {ReadableStream<String>} ASCII armor.
   */
  armor(config$1 = config) {
    // An ASCII-armored sequence of Signature packets that only includes v6 Signature packets MUST NOT contain a CRC24 footer.
    const emitChecksum = this.packets.some(packet => packet.constructor.tag === SignaturePacket.tag && packet.version !== 6);
    return armor(enums.armor.signature, this.write(), undefined, undefined, undefined, emitChecksum, config$1);
  }

  /**
   * Returns an array of KeyIDs of all of the issuers who created this signature
   * @returns {Array<KeyID>} The Key IDs of the signing keys
   */
  getSigningKeyIDs() {
    return this.packets.map(packet => packet.issuerKeyID);
  }
}

/**
 * reads an (optionally armored) OpenPGP signature and returns a signature object
 * @param {Object} options
 * @param {String} [options.armoredSignature] - Armored signature to be parsed
 * @param {Uint8Array} [options.binarySignature] - Binary signature to be parsed
 * @param {Object} [options.config] - Custom configuration settings to overwrite those in [config]{@link module:config}
 * @returns {Promise<Signature>} New signature object.
 * @async
 * @static
 */
async function readSignature({ armoredSignature, binarySignature, config: config$1, ...rest }) {
  config$1 = { ...config, ...config$1 };
  let input = armoredSignature || binarySignature;
  if (!input) {
    throw new Error('readSignature: must pass options object containing `armoredSignature` or `binarySignature`');
  }
  if (armoredSignature && !util.isString(armoredSignature)) {
    throw new Error('readSignature: options.armoredSignature must be a string');
  }
  if (binarySignature && !util.isUint8Array(binarySignature)) {
    throw new Error('readSignature: options.binarySignature must be a Uint8Array');
  }
  const unknownOptions = Object.keys(rest); if (unknownOptions.length > 0) throw new Error(`Unknown option: ${unknownOptions.join(', ')}`);

  if (armoredSignature) {
    const { type, data } = await unarmor(input);
    if (type !== enums.armor.signature) {
      throw new Error('Armored text not of type signature');
    }
    input = data;
  }
  const packetlist = await PacketList.fromBinary(input, allowedPackets$1, config$1);
  return new Signature(packetlist);
}

/**
 * @fileoverview Provides helpers methods for key module
 * @module key/helper
 */


async function generateSecretSubkey(options, config) {
  const secretSubkeyPacket = new SecretSubkeyPacket(options.date, config);
  secretSubkeyPacket.packets = null;
  secretSubkeyPacket.algorithm = enums.write(enums.publicKey, options.algorithm);
  await secretSubkeyPacket.generate(options.rsaBits, options.curve);
  await secretSubkeyPacket.computeFingerprintAndKeyID();
  return secretSubkeyPacket;
}

async function generateSecretKey(options, config) {
  const secretKeyPacket = new SecretKeyPacket(options.date, config);
  secretKeyPacket.packets = null;
  secretKeyPacket.algorithm = enums.write(enums.publicKey, options.algorithm);
  await secretKeyPacket.generate(options.rsaBits, options.curve, options.config);
  await secretKeyPacket.computeFingerprintAndKeyID();
  return secretKeyPacket;
}

/**
 * Returns the valid and non-expired signature that has the latest creation date, while ignoring signatures created in the future.
 * @param {Array<SignaturePacket>} signatures - List of signatures
 * @param {PublicKeyPacket|PublicSubkeyPacket} publicKey - Public key packet to verify the signature
 * @param {module:enums.signature} signatureType - Signature type to determine how to hash the data (NB: for userID signatures,
 *                          `enums.signatures.certGeneric` should be given regardless of the actual trust level)
 * @param {Date} date - Use the given date instead of the current time
 * @param {Object} config - full configuration
 * @returns {Promise<SignaturePacket>} The latest valid signature.
 * @async
 */
async function getLatestValidSignature(signatures, publicKey, signatureType, dataToVerify, date = new Date(), config) {
  let latestValid;
  let exception;
  for (let i = signatures.length - 1; i >= 0; i--) {
    try {
      if (
        (!latestValid || signatures[i].created >= latestValid.created)
      ) {
        await signatures[i].verify(publicKey, signatureType, dataToVerify, date, undefined, config);
        latestValid = signatures[i];
      }
    } catch (e) {
      exception = e;
    }
  }
  if (!latestValid) {
    throw util.wrapError(
      `Could not find valid ${enums.read(enums.signature, signatureType)} signature in key ${publicKey.getKeyID().toHex()}`
        .replace('certGeneric ', 'self-')
        .replace(/([a-z])([A-Z])/g, (_, $1, $2) => $1 + ' ' + $2.toLowerCase()),
      exception);
  }
  return latestValid;
}

function isDataExpired(keyPacket, signature, date = new Date()) {
  const normDate = util.normalizeDate(date);
  if (normDate !== null) {
    const expirationTime = getKeyExpirationTime(keyPacket, signature);
    return !(keyPacket.created <= normDate && normDate < expirationTime);
  }
  return false;
}

/**
 * Create Binding signature to the key according to the {@link https://tools.ietf.org/html/rfc4880#section-5.2.1}
 * @param {SecretSubkeyPacket} subkey - Subkey key packet
 * @param {SecretKeyPacket} primaryKey - Primary key packet
 * @param {Object} options
 * @param {Object} config - Full configuration
 */
async function createBindingSignature(subkey, primaryKey, options, config) {
  const dataToSign = {};
  dataToSign.key = primaryKey;
  dataToSign.bind = subkey;
  const signatureProperties = { signatureType: enums.signature.subkeyBinding };
  if (options.sign) {
    signatureProperties.keyFlags = [enums.keyFlags.signData];
    signatureProperties.embeddedSignature = await createSignaturePacket(dataToSign, [], subkey, {
      signatureType: enums.signature.keyBinding
    }, options.date, undefined, undefined, undefined, config);
  } else {
    signatureProperties.keyFlags = [enums.keyFlags.encryptCommunication | enums.keyFlags.encryptStorage];
  }
  if (options.keyExpirationTime > 0) {
    signatureProperties.keyExpirationTime = options.keyExpirationTime;
    signatureProperties.keyNeverExpires = false;
  }
  const subkeySignaturePacket = await createSignaturePacket(dataToSign, [], primaryKey, signatureProperties, options.date, undefined, undefined, undefined, config);
  return subkeySignaturePacket;
}

/**
 * Returns the preferred signature hash algorithm for a set of keys.
 * @param {Array<Key>} [targetKeys] - The keys to get preferences from
 * @param {SecretKeyPacket|SecretSubkeyPacket} signingKeyPacket - key packet used for signing
 * @param {Date} [date] - Use the given date for verification instead of the current time
 * @param {Object} [targetUserID] - User IDs corresponding to `targetKeys` to get preferences from
 * @param {Object} config - full configuration
 * @returns {Promise<enums.hash>}
 * @async
 */
async function getPreferredHashAlgo(targetKeys, signingKeyPacket, date = new Date(), targetUserIDs = [], config) {
  /**
   * If `preferredSenderAlgo` appears in the prefs of all recipients, we pick it; otherwise, we use the
   * strongest supported algo (`defaultAlgo` is always implicitly supported by all keys).
   * if no keys are available, `preferredSenderAlgo` is returned.
   * For ECC signing key, the curve preferred hash is taken into account as well (see logic below).
   */
  const defaultAlgo = enums.hash.sha256; // MUST implement
  const preferredSenderAlgo = config.preferredHashAlgorithm;

  const supportedAlgosPerTarget = await Promise.all(targetKeys.map(async (key, i) => {
    const selfCertification = await key.getPrimarySelfSignature(date, targetUserIDs[i], config);
    const targetPrefs = selfCertification.preferredHashAlgorithms;
    return targetPrefs || [];
  }));
  const supportedAlgosMap = new Map(); // use Map over object to preserve numeric keys
  for (const supportedAlgos of supportedAlgosPerTarget) {
    for (const hashAlgo of supportedAlgos) {
      try {
        // ensure that `hashAlgo` is recognized/implemented by us, otherwise e.g. `getHashByteLength` will throw later on
        const supportedAlgo = enums.write(enums.hash, hashAlgo);
        supportedAlgosMap.set(
          supportedAlgo,
          supportedAlgosMap.has(supportedAlgo) ? supportedAlgosMap.get(supportedAlgo) + 1 : 1
        );
      } catch {}
    }
  }
  const isSupportedHashAlgo = hashAlgo => targetKeys.length === 0 || supportedAlgosMap.get(hashAlgo) === targetKeys.length || hashAlgo === defaultAlgo;
  const getStrongestSupportedHashAlgo = () => {
    if (supportedAlgosMap.size === 0) {
      return defaultAlgo;
    }
    const sortedHashAlgos = Array.from(supportedAlgosMap.keys())
      .filter(hashAlgo => isSupportedHashAlgo(hashAlgo))
      .sort((algoA, algoB) => getHashByteLength(algoA) - getHashByteLength(algoB));
    const strongestHashAlgo = sortedHashAlgos[0];
    // defaultAlgo is always implicitly supported, and might be stronger than the rest
    return getHashByteLength(strongestHashAlgo) >= getHashByteLength(defaultAlgo) ? strongestHashAlgo : defaultAlgo;
  };

  const eccAlgos = new Set([
    enums.publicKey.ecdsa,
    enums.publicKey.eddsaLegacy,
    enums.publicKey.ed25519,
    enums.publicKey.ed448
  ]);

  if (eccAlgos.has(signingKeyPacket.algorithm)) {
    // For ECC, the returned hash algo MUST be at least as strong as `preferredCurveHashAlgo`, see:
    // - ECDSA: https://www.rfc-editor.org/rfc/rfc9580.html#section-5.2.3.2-5
    // - EdDSALegacy: https://www.rfc-editor.org/rfc/rfc9580.html#section-5.2.3.3-3
    // - Ed25519: https://www.rfc-editor.org/rfc/rfc9580.html#section-5.2.3.4-4
    // - Ed448: https://www.rfc-editor.org/rfc/rfc9580.html#section-5.2.3.5-4
    // Hence, we return the `preferredHashAlgo` as long as it's supported and strong enough;
    // Otherwise, we look at the strongest supported algo, and ultimately fallback to the curve
    // preferred algo, even if not supported by all targets.
    const preferredCurveAlgo = getPreferredCurveHashAlgo(signingKeyPacket.algorithm, signingKeyPacket.publicParams.oid);

    const preferredSenderAlgoIsSupported = isSupportedHashAlgo(preferredSenderAlgo);
    const preferredSenderAlgoStrongerThanCurveAlgo = getHashByteLength(preferredSenderAlgo) >= getHashByteLength(preferredCurveAlgo);

    if (preferredSenderAlgoIsSupported && preferredSenderAlgoStrongerThanCurveAlgo) {
      return preferredSenderAlgo;
    } else {
      const strongestSupportedAlgo = getStrongestSupportedHashAlgo();
      return getHashByteLength(strongestSupportedAlgo) >= getHashByteLength(preferredCurveAlgo) ?
        strongestSupportedAlgo :
        preferredCurveAlgo;
    }
  }

  // `preferredSenderAlgo` may be weaker than the default, but we do not guard against this,
  // since it was manually set by the sender.
  return isSupportedHashAlgo(preferredSenderAlgo) ? preferredSenderAlgo : getStrongestSupportedHashAlgo();
}

/**
 * Returns the preferred compression algorithm for a set of keys
 * @param {Array<Key>} [keys] - Set of keys
 * @param {Date} [date] - Use the given date for verification instead of the current time
 * @param {Array} [userIDs] - User IDs
 * @param {Object} [config] - Full configuration, defaults to openpgp.config
 * @returns {Promise<module:enums.compression>} Preferred compression algorithm
 * @async
 */
async function getPreferredCompressionAlgo(keys = [], date = new Date(), userIDs = [], config$1 = config) {
  const defaultAlgo = enums.compression.uncompressed;
  const preferredSenderAlgo = config$1.preferredCompressionAlgorithm;

  // if preferredSenderAlgo appears in the prefs of all recipients, we pick it
  // otherwise we use the default algo
  // if no keys are available, preferredSenderAlgo is returned
  const senderAlgoSupport = await Promise.all(keys.map(async function(key, i) {
    const selfCertification = await key.getPrimarySelfSignature(date, userIDs[i], config$1);
    const recipientPrefs = selfCertification.preferredCompressionAlgorithms;
    return !!recipientPrefs && recipientPrefs.indexOf(preferredSenderAlgo) >= 0;
  }));
  return senderAlgoSupport.every(Boolean) ? preferredSenderAlgo : defaultAlgo;
}

/**
 * Returns the preferred symmetric and AEAD algorithm (if any) for a set of keys
 * @param {Array<Key>} [keys] - Set of keys
 * @param {Date} [date] - Use the given date for verification instead of the current time
 * @param {Array} [userIDs] - User IDs
 * @param {Object} [config] - Full configuration, defaults to openpgp.config
 * @returns {Promise<{ symmetricAlgo: module:enums.symmetric, aeadAlgo: module:enums.aead | undefined }>} Object containing the preferred symmetric algorithm, and the preferred AEAD algorithm, or undefined if CFB is preferred
 * @async
 */
async function getPreferredCipherSuite(keys = [], date = new Date(), userIDs = [], config$1 = config) {
  const selfSigs = await Promise.all(keys.map((key, i) => key.getPrimarySelfSignature(date, userIDs[i], config$1)));
  const withAEAD = keys.length ?
    selfSigs.every(selfSig => selfSig.features && (selfSig.features[0] & enums.features.seipdv2)) :
    config$1.aeadProtect;

  if (withAEAD) {
    const defaultCipherSuite = { symmetricAlgo: enums.symmetric.aes128, aeadAlgo: enums.aead.ocb };
    const desiredCipherSuites = [
      { symmetricAlgo: config$1.preferredSymmetricAlgorithm, aeadAlgo: config$1.preferredAEADAlgorithm },
      { symmetricAlgo: config$1.preferredSymmetricAlgorithm, aeadAlgo: enums.aead.ocb },
      { symmetricAlgo: enums.symmetric.aes128, aeadAlgo: config$1.preferredAEADAlgorithm }
    ];
    for (const desiredCipherSuite of desiredCipherSuites) {
      if (selfSigs.every(selfSig => selfSig.preferredCipherSuites && selfSig.preferredCipherSuites.some(
        cipherSuite => cipherSuite[0] === desiredCipherSuite.symmetricAlgo && cipherSuite[1] === desiredCipherSuite.aeadAlgo
      ))) {
        return desiredCipherSuite;
      }
    }
    return defaultCipherSuite;
  }
  const defaultSymAlgo = enums.symmetric.aes128;
  const desiredSymAlgo = config$1.preferredSymmetricAlgorithm;
  return {
    symmetricAlgo: selfSigs.every(selfSig => selfSig.preferredSymmetricAlgorithms && selfSig.preferredSymmetricAlgorithms.includes(desiredSymAlgo)) ?
      desiredSymAlgo :
      defaultSymAlgo,
    aeadAlgo: undefined
  };
}

/**
 * Create signature packet
 * @param {Object} dataToSign - Contains packets to be signed
 * @param {Array<Key>} recipientKeys - keys to get preferences from
 * @param  {SecretKeyPacket|
 *          SecretSubkeyPacket}              signingKeyPacket secret key packet for signing
 * @param {Object} [signatureProperties] - Properties to write on the signature packet before signing
 * @param {Date} [date] - Override the creationtime of the signature
 * @param {Object} [userID] - User ID
 * @param {Array} [notations] - Notation Data to add to the signature, e.g. [{ name: 'test@example.org', value: new TextEncoder().encode('test'), humanReadable: true, critical: false }]
 * @param {Object} [detached] - Whether to create a detached signature packet
 * @param {Object} config - full configuration
 * @returns {Promise<SignaturePacket>} Signature packet.
 */
async function createSignaturePacket(dataToSign, recipientKeys, signingKeyPacket, signatureProperties, date, recipientUserIDs, notations = [], detached = false, config) {
  if (signingKeyPacket.isDummy()) {
    throw new Error('Cannot sign with a gnu-dummy key.');
  }
  if (!signingKeyPacket.isDecrypted()) {
    throw new Error('Signing key is not decrypted.');
  }
  const signaturePacket = new SignaturePacket();
  Object.assign(signaturePacket, signatureProperties);
  signaturePacket.publicKeyAlgorithm = signingKeyPacket.algorithm;
  signaturePacket.hashAlgorithm = await getPreferredHashAlgo(recipientKeys, signingKeyPacket, date, recipientUserIDs, config);
  signaturePacket.rawNotations = [...notations];
  await signaturePacket.sign(signingKeyPacket, dataToSign, date, detached, config);
  return signaturePacket;
}

/**
 * Merges signatures from source[attr] to dest[attr]
 * @param {Object} source
 * @param {Object} dest
 * @param {String} attr
 * @param {Date} [date] - date to use for signature expiration check, instead of the current time
 * @param {Function} [checkFn] - signature only merged if true
 */
async function mergeSignatures(source, dest, attr, date = new Date(), checkFn) {
  source = source[attr];
  if (source) {
    if (!dest[attr].length) {
      dest[attr] = source;
    } else {
      await Promise.all(source.map(async function(sourceSig) {
        if (!sourceSig.isExpired(date) && (!checkFn || await checkFn(sourceSig)) &&
            !dest[attr].some(function(destSig) {
              return util.equalsUint8Array(destSig.writeParams(), sourceSig.writeParams());
            })) {
          dest[attr].push(sourceSig);
        }
      }));
    }
  }
}

/**
 * Checks if a given certificate or binding signature is revoked
 * @param  {SecretKeyPacket|
 *          PublicKeyPacket}        primaryKey   The primary key packet
 * @param {Object} dataToVerify - The data to check
 * @param {Array<SignaturePacket>} revocations - The revocation signatures to check
 * @param {SignaturePacket} signature - The certificate or signature to check
 * @param  {PublicSubkeyPacket|
 *          SecretSubkeyPacket|
 *          PublicKeyPacket|
 *          SecretKeyPacket} key, optional The key packet to verify the signature, instead of the primary key
 * @param {Date} date - Use the given date instead of the current time
 * @param {Object} config - Full configuration
 * @returns {Promise<Boolean>} True if the signature revokes the data.
 * @async
 */
async function isDataRevoked(primaryKey, signatureType, dataToVerify, revocations, signature, key, date = new Date(), config) {
  key = key || primaryKey;
  const revocationKeyIDs = [];
  await Promise.all(revocations.map(async function(revocationSignature) {
    try {
      if (
        // Note: a third-party revocation signature could legitimately revoke a
        // self-signature if the signature has an authorized revocation key.
        // However, we don't support passing authorized revocation keys, nor
        // verifying such revocation signatures. Instead, we indicate an error
        // when parsing a key with an authorized revocation key, and ignore
        // third-party revocation signatures here. (It could also be revoking a
        // third-party key certification, which should only affect
        // `verifyAllCertifications`.)
        !signature || revocationSignature.issuerKeyID.equals(signature.issuerKeyID)
      ) {
        const isHardRevocation = ![
          enums.reasonForRevocation.keyRetired,
          enums.reasonForRevocation.keySuperseded,
          enums.reasonForRevocation.userIDInvalid
        ].includes(revocationSignature.reasonForRevocationFlag);

        await revocationSignature.verify(
          key, signatureType, dataToVerify, isHardRevocation ? null : date, false, config
        );

        // TODO get an identifier of the revoked object instead
        revocationKeyIDs.push(revocationSignature.issuerKeyID);
      }
    } catch (e) {}
  }));
  // TODO further verify that this is the signature that should be revoked
  if (signature) {
    signature.revoked = revocationKeyIDs.some(keyID => keyID.equals(signature.issuerKeyID)) ? true :
      signature.revoked || false;
    return signature.revoked;
  }
  return revocationKeyIDs.length > 0;
}

/**
 * Returns key expiration time based on the given certification signature.
 * The expiration time of the signature is ignored.
 * @param {PublicSubkeyPacket|PublicKeyPacket} keyPacket - key to check
 * @param {SignaturePacket} signature - signature to process
 * @returns {Date|Infinity} expiration time or infinity if the key does not expire
 */
function getKeyExpirationTime(keyPacket, signature) {
  let expirationTime;
  // check V4 expiration time
  if (signature.keyNeverExpires === false) {
    expirationTime = keyPacket.created.getTime() + signature.keyExpirationTime * 1000;
  }
  return expirationTime ? new Date(expirationTime) : Infinity;
}

function sanitizeKeyOptions(options, subkeyDefaults = {}) {
  options.type = options.type || subkeyDefaults.type;
  options.curve = options.curve || subkeyDefaults.curve;
  options.rsaBits = options.rsaBits || subkeyDefaults.rsaBits;
  options.keyExpirationTime = options.keyExpirationTime !== undefined ? options.keyExpirationTime : subkeyDefaults.keyExpirationTime;
  options.passphrase = util.isString(options.passphrase) ? options.passphrase : subkeyDefaults.passphrase;
  options.date = options.date || subkeyDefaults.date;

  options.sign = options.sign || false;

  switch (options.type) {
    case 'ecc': // NB: this case also handles legacy eddsa and x25519 keys, based on `options.curve`
      try {
        options.curve = enums.write(enums.curve, options.curve);
      } catch (e) {
        throw new Error('Unknown curve');
      }
      if (options.curve === enums.curve.ed25519Legacy || options.curve === enums.curve.curve25519Legacy ||
        options.curve === 'ed25519' || options.curve === 'curve25519') { // keep support for curve names without 'Legacy' addition, for now
        options.curve = options.sign ? enums.curve.ed25519Legacy : enums.curve.curve25519Legacy;
      }
      if (options.sign) {
        options.algorithm = options.curve === enums.curve.ed25519Legacy ? enums.publicKey.eddsaLegacy : enums.publicKey.ecdsa;
      } else {
        options.algorithm = enums.publicKey.ecdh;
      }
      break;
    case 'curve25519':
      options.algorithm = options.sign ? enums.publicKey.ed25519 : enums.publicKey.x25519;
      break;
    case 'curve448':
      options.algorithm = options.sign ? enums.publicKey.ed448 : enums.publicKey.x448;
      break;
    case 'rsa':
      options.algorithm = enums.publicKey.rsaEncryptSign;
      break;
    default:
      throw new Error(`Unsupported key type ${options.type}`);
  }
  return options;
}

function validateSigningKeyPacket(keyPacket, signature, config) {
  switch (keyPacket.algorithm) {
    case enums.publicKey.rsaEncryptSign:
    case enums.publicKey.rsaSign:
    case enums.publicKey.dsa:
    case enums.publicKey.ecdsa:
    case enums.publicKey.eddsaLegacy:
    case enums.publicKey.ed25519:
    case enums.publicKey.ed448:
      if (!signature.keyFlags && !config.allowMissingKeyFlags) {
        throw new Error('None of the key flags is set: consider passing `config.allowMissingKeyFlags`');
      }
      return !signature.keyFlags ||
        (signature.keyFlags[0] & enums.keyFlags.signData) !== 0;
    default:
      return false;
  }
}

function validateEncryptionKeyPacket(keyPacket, signature, config) {
  switch (keyPacket.algorithm) {
    case enums.publicKey.rsaEncryptSign:
    case enums.publicKey.rsaEncrypt:
    case enums.publicKey.elgamal:
    case enums.publicKey.ecdh:
    case enums.publicKey.x25519:
    case enums.publicKey.x448:
      if (!signature.keyFlags && !config.allowMissingKeyFlags) {
        throw new Error('None of the key flags is set: consider passing `config.allowMissingKeyFlags`');
      }
      return !signature.keyFlags ||
        (signature.keyFlags[0] & enums.keyFlags.encryptCommunication) !== 0 ||
        (signature.keyFlags[0] & enums.keyFlags.encryptStorage) !== 0;
    default:
      return false;
  }
}

function validateDecryptionKeyPacket(keyPacket, signature, config) {
  if (!signature.keyFlags && !config.allowMissingKeyFlags) {
    throw new Error('None of the key flags is set: consider passing `config.allowMissingKeyFlags`');
  }

  switch (keyPacket.algorithm) {
    case enums.publicKey.rsaEncryptSign:
    case enums.publicKey.rsaEncrypt:
    case enums.publicKey.elgamal:
    case enums.publicKey.ecdh:
    case enums.publicKey.x25519:
    case enums.publicKey.x448: {
      const isValidSigningKeyPacket = !signature.keyFlags || (signature.keyFlags[0] & enums.keyFlags.signData) !== 0;
      if (isValidSigningKeyPacket && config.allowInsecureDecryptionWithSigningKeys) {
        // This is only relevant for RSA keys, all other signing algorithms cannot decrypt
        return true;
      }

      return !signature.keyFlags ||
      (signature.keyFlags[0] & enums.keyFlags.encryptCommunication) !== 0 ||
      (signature.keyFlags[0] & enums.keyFlags.encryptStorage) !== 0;
    }
    default:
      return false;
  }
}

/**
 * Check key against blacklisted algorithms and minimum strength requirements.
 * @param {SecretKeyPacket|PublicKeyPacket|
 *        SecretSubkeyPacket|PublicSubkeyPacket} keyPacket
 * @param {Config} config
 * @throws {Error} if the key packet does not meet the requirements
 */
function checkKeyRequirements(keyPacket, config) {
  const keyAlgo = enums.write(enums.publicKey, keyPacket.algorithm);
  const algoInfo = keyPacket.getAlgorithmInfo();
  if (config.rejectPublicKeyAlgorithms.has(keyAlgo)) {
    throw new Error(`${algoInfo.algorithm} keys are considered too weak.`);
  }
  switch (keyAlgo) {
    case enums.publicKey.rsaEncryptSign:
    case enums.publicKey.rsaSign:
    case enums.publicKey.rsaEncrypt:
      if (algoInfo.bits < config.minRSABits) {
        throw new Error(`RSA keys shorter than ${config.minRSABits} bits are considered too weak.`);
      }
      break;
    case enums.publicKey.ecdsa:
    case enums.publicKey.eddsaLegacy:
    case enums.publicKey.ecdh:
      if (config.rejectCurves.has(algoInfo.curve)) {
        throw new Error(`Support for ${algoInfo.algorithm} keys using curve ${algoInfo.curve} is disabled.`);
      }
      break;
  }
}

/**
 * @module key/User
 */


/**
 * Class that represents an user ID or attribute packet and the relevant signatures.
  * @param {UserIDPacket|UserAttributePacket} userPacket - packet containing the user info
  * @param {Key} mainKey - reference to main Key object containing the primary key and subkeys that the user is associated with
 */
class User {
  constructor(userPacket, mainKey) {
    this.userID = userPacket.constructor.tag === enums.packet.userID ? userPacket : null;
    this.userAttribute = userPacket.constructor.tag === enums.packet.userAttribute ? userPacket : null;
    this.selfCertifications = [];
    this.otherCertifications = [];
    this.revocationSignatures = [];
    this.mainKey = mainKey;
  }

  /**
   * Transforms structured user data to packetlist
   * @returns {PacketList}
   */
  toPacketList() {
    const packetlist = new PacketList();
    packetlist.push(this.userID || this.userAttribute);
    packetlist.push(...this.revocationSignatures);
    packetlist.push(...this.selfCertifications);
    packetlist.push(...this.otherCertifications);
    return packetlist;
  }

  /**
   * Shallow clone
   * @returns {User}
   */
  clone() {
    const user = new User(this.userID || this.userAttribute, this.mainKey);
    user.selfCertifications = [...this.selfCertifications];
    user.otherCertifications = [...this.otherCertifications];
    user.revocationSignatures = [...this.revocationSignatures];
    return user;
  }

  /**
   * Generate third-party certifications over this user and its primary key
   * @param {Array<PrivateKey>} signingKeys - Decrypted private keys for signing
   * @param {Date} [date] - Date to use as creation date of the certificate, instead of the current time
   * @param {Object} config - Full configuration
   * @returns {Promise<User>} New user with new certifications.
   * @async
   */
  async certify(signingKeys, date, config) {
    const primaryKey = this.mainKey.keyPacket;
    const dataToSign = {
      userID: this.userID,
      userAttribute: this.userAttribute,
      key: primaryKey
    };
    const user = new User(dataToSign.userID || dataToSign.userAttribute, this.mainKey);
    user.otherCertifications = await Promise.all(signingKeys.map(async function(privateKey) {
      if (!privateKey.isPrivate()) {
        throw new Error('Need private key for signing');
      }
      if (privateKey.hasSameFingerprintAs(primaryKey)) {
        throw new Error("The user's own key can only be used for self-certifications");
      }
      const signingKey = await privateKey.getSigningKey(undefined, date, undefined, config);
      return createSignaturePacket(dataToSign, [privateKey], signingKey.keyPacket, {
        // Most OpenPGP implementations use generic certification (0x10)
        signatureType: enums.signature.certGeneric,
        keyFlags: [enums.keyFlags.certifyKeys | enums.keyFlags.signData]
      }, date, undefined, undefined, undefined, config);
    }));
    await user.update(this, date, config);
    return user;
  }

  /**
   * Checks if a given certificate of the user is revoked
   * @param {SignaturePacket} certificate - The certificate to verify
   * @param  {PublicSubkeyPacket|
   *          SecretSubkeyPacket|
   *          PublicKeyPacket|
   *          SecretKeyPacket} [keyPacket] The key packet to verify the signature, instead of the primary key
   * @param {Date} [date] - Use the given date for verification instead of the current time
   * @param {Object} config - Full configuration
   * @returns {Promise<Boolean>} True if the certificate is revoked.
   * @async
   */
  async isRevoked(certificate, keyPacket, date = new Date(), config$1 = config) {
    const primaryKey = this.mainKey.keyPacket;
    return isDataRevoked(primaryKey, enums.signature.certRevocation, {
      key: primaryKey,
      userID: this.userID,
      userAttribute: this.userAttribute
    }, this.revocationSignatures, certificate, keyPacket, date, config$1);
  }

  /**
   * Verifies the user certificate.
   * @param {SignaturePacket} certificate - A certificate of this user
   * @param {Array<PublicKey>} verificationKeys - Array of keys to verify certificate signatures
   * @param {Date} [date] - Use the given date instead of the current time
   * @param {Object} config - Full configuration
   * @returns {Promise<true|null>} true if the certificate could be verified, or null if the verification keys do not correspond to the certificate
   * @throws if the user certificate is invalid.
   * @async
   */
  async verifyCertificate(certificate, verificationKeys, date = new Date(), config) {
    const that = this;
    const primaryKey = this.mainKey.keyPacket;
    const dataToVerify = {
      userID: this.userID,
      userAttribute: this.userAttribute,
      key: primaryKey
    };
    const { issuerKeyID } = certificate;
    const issuerKeys = verificationKeys.filter(key => key.getKeys(issuerKeyID).length > 0);
    if (issuerKeys.length === 0) {
      return null;
    }
    await Promise.all(issuerKeys.map(async key => {
      const signingKey = await key.getSigningKey(issuerKeyID, certificate.created, undefined, config);
      if (certificate.revoked || await that.isRevoked(certificate, signingKey.keyPacket, date, config)) {
        throw new Error('User certificate is revoked');
      }
      try {
        await certificate.verify(signingKey.keyPacket, enums.signature.certGeneric, dataToVerify, date, undefined, config);
      } catch (e) {
        throw util.wrapError('User certificate is invalid', e);
      }
    }));
    return true;
  }

  /**
   * Verifies all user certificates
   * @param {Array<PublicKey>} verificationKeys - Array of keys to verify certificate signatures
   * @param {Date} [date] - Use the given date instead of the current time
   * @param {Object} config - Full configuration
   * @returns {Promise<Array<{
   *   keyID: module:type/keyid~KeyID,
   *   valid: Boolean | null
   * }>>} List of signer's keyID and validity of signature.
   *      Signature validity is null if the verification keys do not correspond to the certificate.
   * @async
   */
  async verifyAllCertifications(verificationKeys, date = new Date(), config) {
    const that = this;
    const certifications = this.selfCertifications.concat(this.otherCertifications);
    return Promise.all(certifications.map(async certification => ({
      keyID: certification.issuerKeyID,
      valid: await that.verifyCertificate(certification, verificationKeys, date, config).catch(() => false)
    })));
  }

  /**
   * Verify User. Checks for existence of self signatures, revocation signatures
   * and validity of self signature.
   * @param {Date} date - Use the given date instead of the current time
   * @param {Object} config - Full configuration
   * @returns {Promise<true>} Status of user.
   * @throws {Error} if there are no valid self signatures.
   * @async
   */
  async verify(date = new Date(), config) {
    if (!this.selfCertifications.length) {
      throw new Error('No self-certifications found');
    }
    const that = this;
    const primaryKey = this.mainKey.keyPacket;
    const dataToVerify = {
      userID: this.userID,
      userAttribute: this.userAttribute,
      key: primaryKey
    };
    // TODO replace when Promise.some or Promise.any are implemented
    let exception;
    for (let i = this.selfCertifications.length - 1; i >= 0; i--) {
      try {
        const selfCertification = this.selfCertifications[i];
        if (selfCertification.revoked || await that.isRevoked(selfCertification, undefined, date, config)) {
          throw new Error('Self-certification is revoked');
        }
        try {
          await selfCertification.verify(primaryKey, enums.signature.certGeneric, dataToVerify, date, undefined, config);
        } catch (e) {
          throw util.wrapError('Self-certification is invalid', e);
        }
        return true;
      } catch (e) {
        exception = e;
      }
    }
    throw exception;
  }

  /**
   * Update user with new components from specified user
   * @param {User} sourceUser - Source user to merge
   * @param {Date} date - Date to verify the validity of signatures
   * @param {Object} config - Full configuration
   * @returns {Promise<undefined>}
   * @async
   */
  async update(sourceUser, date, config) {
    const primaryKey = this.mainKey.keyPacket;
    const dataToVerify = {
      userID: this.userID,
      userAttribute: this.userAttribute,
      key: primaryKey
    };
    // self signatures
    await mergeSignatures(sourceUser, this, 'selfCertifications', date, async function(srcSelfSig) {
      try {
        await srcSelfSig.verify(primaryKey, enums.signature.certGeneric, dataToVerify, date, false, config);
        return true;
      } catch (e) {
        return false;
      }
    });
    // other signatures
    await mergeSignatures(sourceUser, this, 'otherCertifications', date);
    // revocation signatures
    await mergeSignatures(sourceUser, this, 'revocationSignatures', date, function(srcRevSig) {
      return isDataRevoked(primaryKey, enums.signature.certRevocation, dataToVerify, [srcRevSig], undefined, undefined, date, config);
    });
  }

  /**
   * Revokes the user
   * @param {SecretKeyPacket} primaryKey - decrypted private primary key for revocation
   * @param {Object} reasonForRevocation - optional, object indicating the reason for revocation
   * @param  {module:enums.reasonForRevocation} reasonForRevocation.flag optional, flag indicating the reason for revocation
   * @param  {String} reasonForRevocation.string optional, string explaining the reason for revocation
   * @param {Date} date - optional, override the creationtime of the revocation signature
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Promise<User>} New user with revocation signature.
   * @async
   */
  async revoke(
    primaryKey,
    {
      flag: reasonForRevocationFlag = enums.reasonForRevocation.noReason,
      string: reasonForRevocationString = ''
    } = {},
    date = new Date(),
    config$1 = config
  ) {
    const dataToSign = {
      userID: this.userID,
      userAttribute: this.userAttribute,
      key: primaryKey
    };
    const user = new User(dataToSign.userID || dataToSign.userAttribute, this.mainKey);
    user.revocationSignatures.push(await createSignaturePacket(dataToSign, [], primaryKey, {
      signatureType: enums.signature.certRevocation,
      reasonForRevocationFlag: enums.write(enums.reasonForRevocation, reasonForRevocationFlag),
      reasonForRevocationString
    }, date, undefined, undefined, false, config$1));
    await user.update(this);
    return user;
  }
}

/**
 * @module key/Subkey
 */


/**
 * Class that represents a subkey packet and the relevant signatures.
 * @borrows PublicSubkeyPacket#getKeyID as Subkey#getKeyID
 * @borrows PublicSubkeyPacket#getFingerprint as Subkey#getFingerprint
 * @borrows PublicSubkeyPacket#hasSameFingerprintAs as Subkey#hasSameFingerprintAs
 * @borrows PublicSubkeyPacket#getAlgorithmInfo as Subkey#getAlgorithmInfo
 * @borrows PublicSubkeyPacket#getCreationTime as Subkey#getCreationTime
 * @borrows PublicSubkeyPacket#isDecrypted as Subkey#isDecrypted
 */
class Subkey {
  /**
   * @param {SecretSubkeyPacket|PublicSubkeyPacket} subkeyPacket - subkey packet to hold in the Subkey
   * @param {Key} mainKey - reference to main Key object, containing the primary key packet corresponding to the subkey
   */
  constructor(subkeyPacket, mainKey) {
    this.keyPacket = subkeyPacket;
    this.bindingSignatures = [];
    this.revocationSignatures = [];
    this.mainKey = mainKey;
  }

  /**
   * Transforms structured subkey data to packetlist
   * @returns {PacketList}
   */
  toPacketList() {
    const packetlist = new PacketList();
    packetlist.push(this.keyPacket);
    packetlist.push(...this.revocationSignatures);
    packetlist.push(...this.bindingSignatures);
    return packetlist;
  }

  /**
   * Shallow clone
   * @return {Subkey}
   */
  clone() {
    const subkey = new Subkey(this.keyPacket, this.mainKey);
    subkey.bindingSignatures = [...this.bindingSignatures];
    subkey.revocationSignatures = [...this.revocationSignatures];
    return subkey;
  }

  /**
   * Checks if a binding signature of a subkey is revoked
   * @param {SignaturePacket} signature - The binding signature to verify
   * @param  {PublicSubkeyPacket|
   *          SecretSubkeyPacket|
   *          PublicKeyPacket|
   *          SecretKeyPacket} key, optional The key to verify the signature
   * @param {Date} [date] - Use the given date for verification instead of the current time
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Promise<Boolean>} True if the binding signature is revoked.
   * @async
   */
  async isRevoked(signature, key, date = new Date(), config$1 = config) {
    const primaryKey = this.mainKey.keyPacket;
    return isDataRevoked(
      primaryKey, enums.signature.subkeyRevocation, {
        key: primaryKey,
        bind: this.keyPacket
      }, this.revocationSignatures, signature, key, date, config$1
    );
  }

  /**
   * Verify subkey. Checks for revocation signatures, expiration time
   * and valid binding signature.
   * @param {Date} date - Use the given date instead of the current time
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Promise<SignaturePacket>}
   * @throws {Error}           if the subkey is invalid.
   * @async
   */
  async verify(date = new Date(), config$1 = config) {
    const primaryKey = this.mainKey.keyPacket;
    const dataToVerify = { key: primaryKey, bind: this.keyPacket };
    // check subkey binding signatures
    const bindingSignature = await getLatestValidSignature(this.bindingSignatures, primaryKey, enums.signature.subkeyBinding, dataToVerify, date, config$1);
    // check binding signature is not revoked
    if (bindingSignature.revoked || await this.isRevoked(bindingSignature, null, date, config$1)) {
      throw new Error('Subkey is revoked');
    }
    // check for expiration time
    if (isDataExpired(this.keyPacket, bindingSignature, date)) {
      throw new Error('Subkey is expired');
    }
    return bindingSignature;
  }

  /**
   * Returns the expiration time of the subkey or Infinity if key does not expire.
   * Returns null if the subkey is invalid.
   * @param {Date} date - Use the given date instead of the current time
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Promise<Date | Infinity | null>}
   * @async
   */
  async getExpirationTime(date = new Date(), config$1 = config) {
    const primaryKey = this.mainKey.keyPacket;
    const dataToVerify = { key: primaryKey, bind: this.keyPacket };
    let bindingSignature;
    try {
      bindingSignature = await getLatestValidSignature(this.bindingSignatures, primaryKey, enums.signature.subkeyBinding, dataToVerify, date, config$1);
    } catch (e) {
      return null;
    }
    const keyExpiry = getKeyExpirationTime(this.keyPacket, bindingSignature);
    const sigExpiry = bindingSignature.getExpirationTime();
    return keyExpiry < sigExpiry ? keyExpiry : sigExpiry;
  }

  /**
   * Update subkey with new components from specified subkey
   * @param {Subkey} subkey - Source subkey to merge
   * @param {Date} [date] - Date to verify validity of signatures
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @throws {Error} if update failed
   * @async
   */
  async update(subkey, date = new Date(), config$1 = config) {
    const primaryKey = this.mainKey.keyPacket;
    if (!this.hasSameFingerprintAs(subkey)) {
      throw new Error('Subkey update method: fingerprints of subkeys not equal');
    }
    // key packet
    if (this.keyPacket.constructor.tag === enums.packet.publicSubkey &&
        subkey.keyPacket.constructor.tag === enums.packet.secretSubkey) {
      this.keyPacket = subkey.keyPacket;
    }
    // update missing binding signatures
    const that = this;
    const dataToVerify = { key: primaryKey, bind: that.keyPacket };
    await mergeSignatures(subkey, this, 'bindingSignatures', date, async function(srcBindSig) {
      for (let i = 0; i < that.bindingSignatures.length; i++) {
        if (that.bindingSignatures[i].issuerKeyID.equals(srcBindSig.issuerKeyID)) {
          if (srcBindSig.created > that.bindingSignatures[i].created) {
            that.bindingSignatures[i] = srcBindSig;
          }
          return false;
        }
      }
      try {
        await srcBindSig.verify(primaryKey, enums.signature.subkeyBinding, dataToVerify, date, undefined, config$1);
        return true;
      } catch (e) {
        return false;
      }
    });
    // revocation signatures
    await mergeSignatures(subkey, this, 'revocationSignatures', date, function(srcRevSig) {
      return isDataRevoked(primaryKey, enums.signature.subkeyRevocation, dataToVerify, [srcRevSig], undefined, undefined, date, config$1);
    });
  }

  /**
   * Revokes the subkey
   * @param {SecretKeyPacket} primaryKey - decrypted private primary key for revocation
   * @param {Object} reasonForRevocation - optional, object indicating the reason for revocation
   * @param  {module:enums.reasonForRevocation} reasonForRevocation.flag optional, flag indicating the reason for revocation
   * @param  {String} reasonForRevocation.string optional, string explaining the reason for revocation
   * @param {Date} date - optional, override the creationtime of the revocation signature
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Promise<Subkey>} New subkey with revocation signature.
   * @async
   */
  async revoke(
    primaryKey,
    {
      flag: reasonForRevocationFlag = enums.reasonForRevocation.noReason,
      string: reasonForRevocationString = ''
    } = {},
    date = new Date(),
    config$1 = config
  ) {
    const dataToSign = { key: primaryKey, bind: this.keyPacket };
    const subkey = new Subkey(this.keyPacket, this.mainKey);
    subkey.revocationSignatures.push(await createSignaturePacket(dataToSign, [], primaryKey, {
      signatureType: enums.signature.subkeyRevocation,
      reasonForRevocationFlag: enums.write(enums.reasonForRevocation, reasonForRevocationFlag),
      reasonForRevocationString
    }, date, undefined, undefined, false, config$1));
    await subkey.update(this);
    return subkey;
  }

  hasSameFingerprintAs(other) {
    return this.keyPacket.hasSameFingerprintAs(other.keyPacket || other);
  }
}

['getKeyID', 'getFingerprint', 'getAlgorithmInfo', 'getCreationTime', 'isDecrypted'].forEach(name => {
  Subkey.prototype[name] =
    function() {
      return this.keyPacket[name]();
    };
});

// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


// A key revocation certificate can contain the following packets
const allowedRevocationPackets = /*#__PURE__*/ util.constructAllowedPackets([SignaturePacket]);
const mainKeyPacketTags = new Set([enums.packet.publicKey, enums.packet.privateKey]);
const keyPacketTags = new Set([
  enums.packet.publicKey, enums.packet.privateKey,
  enums.packet.publicSubkey, enums.packet.privateSubkey
]);

/**
 * Abstract class that represents an OpenPGP key. Must contain a primary key.
 * Can contain additional subkeys, signatures, user ids, user attributes.
 * @borrows PublicKeyPacket#getKeyID as Key#getKeyID
 * @borrows PublicKeyPacket#getFingerprint as Key#getFingerprint
 * @borrows PublicKeyPacket#hasSameFingerprintAs as Key#hasSameFingerprintAs
 * @borrows PublicKeyPacket#getAlgorithmInfo as Key#getAlgorithmInfo
 * @borrows PublicKeyPacket#getCreationTime as Key#getCreationTime
 */
class Key {
  /**
   * Transforms packetlist to structured key data
   * @param {PacketList} packetlist - The packets that form a key
   * @param {Set<enums.packet>} disallowedPackets - disallowed packet tags
   */
  packetListToStructure(packetlist, disallowedPackets = new Set()) {
    let user;
    let primaryKeyID;
    let subkey;
    let ignoreUntil;

    for (const packet of packetlist) {

      if (packet instanceof UnparseablePacket) {
        const isUnparseableKeyPacket = keyPacketTags.has(packet.tag);
        if (isUnparseableKeyPacket && !ignoreUntil) {
          // Since non-key packets apply to the preceding key packet, if a (sub)key is Unparseable we must
          // discard all non-key packets that follow, until another (sub)key packet is found.
          if (mainKeyPacketTags.has(packet.tag)) {
            ignoreUntil = mainKeyPacketTags;
          } else {
            ignoreUntil = keyPacketTags;
          }
        }
        continue;
      }

      const tag = packet.constructor.tag;
      if (ignoreUntil) {
        if (!ignoreUntil.has(tag)) continue;
        ignoreUntil = null;
      }
      if (disallowedPackets.has(tag)) {
        throw new Error(`Unexpected packet type: ${tag}`);
      }
      switch (tag) {
        case enums.packet.publicKey:
        case enums.packet.secretKey:
          if (this.keyPacket) {
            throw new Error('Key block contains multiple keys');
          }
          this.keyPacket = packet;
          primaryKeyID = this.getKeyID();
          if (!primaryKeyID) {
            throw new Error('Missing Key ID');
          }
          break;
        case enums.packet.userID:
        case enums.packet.userAttribute:
          user = new User(packet, this);
          this.users.push(user);
          break;
        case enums.packet.publicSubkey:
        case enums.packet.secretSubkey:
          user = null;
          subkey = new Subkey(packet, this);
          this.subkeys.push(subkey);
          break;
        case enums.packet.signature:
          switch (packet.signatureType) {
            case enums.signature.certGeneric:
            case enums.signature.certPersona:
            case enums.signature.certCasual:
            case enums.signature.certPositive:
              if (!user) {
                util.printDebug('Dropping certification signatures without preceding user packet');
                continue;
              }
              if (packet.issuerKeyID.equals(primaryKeyID)) {
                user.selfCertifications.push(packet);
              } else {
                user.otherCertifications.push(packet);
              }
              break;
            case enums.signature.certRevocation:
              if (user) {
                user.revocationSignatures.push(packet);
              } else {
                this.directSignatures.push(packet);
              }
              break;
            case enums.signature.key:
              this.directSignatures.push(packet);
              break;
            case enums.signature.subkeyBinding:
              if (!subkey) {
                util.printDebug('Dropping subkey binding signature without preceding subkey packet');
                continue;
              }
              subkey.bindingSignatures.push(packet);
              break;
            case enums.signature.keyRevocation:
              this.revocationSignatures.push(packet);
              break;
            case enums.signature.subkeyRevocation:
              if (!subkey) {
                util.printDebug('Dropping subkey revocation signature without preceding subkey packet');
                continue;
              }
              subkey.revocationSignatures.push(packet);
              break;
          }
          break;
      }
    }
  }

  /**
   * Transforms structured key data to packetlist
   * @returns {PacketList} The packets that form a key.
   */
  toPacketList() {
    const packetlist = new PacketList();
    packetlist.push(this.keyPacket);
    packetlist.push(...this.revocationSignatures);
    packetlist.push(...this.directSignatures);
    this.users.map(user => packetlist.push(...user.toPacketList()));
    this.subkeys.map(subkey => packetlist.push(...subkey.toPacketList()));
    return packetlist;
  }

  /**
   * Clones the key object. The copy is shallow, as it references the same packet objects as the original. However, if the top-level API is used, the two key instances are effectively independent.
   * @param {Boolean} [clonePrivateParams=false] Only relevant for private keys: whether the secret key paramenters should be deeply copied. This is needed if e.g. `encrypt()` is to be called either on the clone or the original key.
   * @returns {Promise<Key>} Clone of the key.
   */
  clone(clonePrivateParams = false) {
    const key = new this.constructor(this.toPacketList());
    if (clonePrivateParams) {
      key.getKeys().forEach(k => {
        // shallow clone the key packets
        k.keyPacket = Object.create(
          Object.getPrototypeOf(k.keyPacket),
          Object.getOwnPropertyDescriptors(k.keyPacket)
        );
        if (!k.keyPacket.isDecrypted()) return;
        // deep clone the private params, which are cleared during encryption
        const privateParams = {};
        Object.keys(k.keyPacket.privateParams).forEach(name => {
          privateParams[name] = new Uint8Array(k.keyPacket.privateParams[name]);
        });
        k.keyPacket.privateParams = privateParams;
      });
    }
    return key;
  }

  /**
   * Returns an array containing all public or private subkeys matching keyID;
   * If no keyID is given, returns all subkeys.
   * @param {type/keyID} [keyID] - key ID to look for
   * @returns {Array<Subkey>} array of subkeys
   */
  getSubkeys(keyID = null) {
    const subkeys = this.subkeys.filter(subkey => (
      !keyID || subkey.getKeyID().equals(keyID, true)
    ));
    return subkeys;
  }

  /**
   * Returns an array containing all public or private keys matching keyID.
   * If no keyID is given, returns all keys, starting with the primary key.
   * @param {type/keyid~KeyID} [keyID] - key ID to look for
   * @returns {Array<Key|Subkey>} array of keys
   */
  getKeys(keyID = null) {
    const keys = [];
    if (!keyID || this.getKeyID().equals(keyID, true)) {
      keys.push(this);
    }
    return keys.concat(this.getSubkeys(keyID));
  }

  /**
   * Returns key IDs of all keys
   * @returns {Array<module:type/keyid~KeyID>}
   */
  getKeyIDs() {
    return this.getKeys().map(key => key.getKeyID());
  }

  /**
   * Returns userIDs
   * @returns {Array<string>} Array of userIDs.
   */
  getUserIDs() {
    return this.users.map(user => {
      return user.userID ? user.userID.userID : null;
    }).filter(userID => userID !== null);
  }

  /**
   * Returns binary encoded key
   * @returns {Uint8Array} Binary key.
   */
  write() {
    return this.toPacketList().write();
  }

  /**
   * Returns last created key or key by given keyID that is available for signing and verification
   * @param  {module:type/keyid~KeyID} [keyID] - key ID of a specific key to retrieve
   * @param  {Date} [date] - use the fiven date date to  to check key validity instead of the current date
   * @param  {Object} [userID] - filter keys for the given user ID
   * @param  {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Promise<Key|Subkey>} signing key
   * @throws if no valid signing key was found
   * @async
   */
  async getSigningKey(keyID = null, date = new Date(), userID = {}, config$1 = config) {
    await this.verifyPrimaryKey(date, userID, config$1);
    const primaryKey = this.keyPacket;
    try {
      checkKeyRequirements(primaryKey, config$1);
    } catch (err) {
      throw util.wrapError('Could not verify primary key', err);
    }
    const subkeys = this.subkeys.slice().sort((a, b) => b.keyPacket.created - a.keyPacket.created);
    let exception;
    for (const subkey of subkeys) {
      if (!keyID || subkey.getKeyID().equals(keyID)) {
        try {
          await subkey.verify(date, config$1);
          const dataToVerify = { key: primaryKey, bind: subkey.keyPacket };
          const bindingSignature = await getLatestValidSignature(
            subkey.bindingSignatures, primaryKey, enums.signature.subkeyBinding, dataToVerify, date, config$1
          );
          if (!validateSigningKeyPacket(subkey.keyPacket, bindingSignature, config$1)) {
            continue;
          }
          if (!bindingSignature.embeddedSignature) {
            throw new Error('Missing embedded signature');
          }
          // verify embedded signature
          await getLatestValidSignature(
            [bindingSignature.embeddedSignature], subkey.keyPacket, enums.signature.keyBinding, dataToVerify, date, config$1
          );
          checkKeyRequirements(subkey.keyPacket, config$1);
          return subkey;
        } catch (e) {
          exception = e;
        }
      }
    }

    try {
      const selfCertification = await this.getPrimarySelfSignature(date, userID, config$1);
      if ((!keyID || primaryKey.getKeyID().equals(keyID)) &&
          validateSigningKeyPacket(primaryKey, selfCertification, config$1)) {
        checkKeyRequirements(primaryKey, config$1);
        return this;
      }
    } catch (e) {
      exception = e;
    }
    throw util.wrapError('Could not find valid signing key packet in key ' + this.getKeyID().toHex(), exception);
  }

  /**
   * Returns last created key or key by given keyID that is available for encryption or decryption
   * @param  {module:type/keyid~KeyID} [keyID] - key ID of a specific key to retrieve
   * @param  {Date}   [date] - use the fiven date date to  to check key validity instead of the current date
   * @param  {Object} [userID] - filter keys for the given user ID
   * @param  {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Promise<Key|Subkey>} encryption key
   * @throws if no valid encryption key was found
   * @async
   */
  async getEncryptionKey(keyID, date = new Date(), userID = {}, config$1 = config) {
    await this.verifyPrimaryKey(date, userID, config$1);
    const primaryKey = this.keyPacket;
    try {
      checkKeyRequirements(primaryKey, config$1);
    } catch (err) {
      throw util.wrapError('Could not verify primary key', err);
    }
    // V4: by convention subkeys are preferred for encryption service
    const subkeys = this.subkeys.slice().sort((a, b) => b.keyPacket.created - a.keyPacket.created);
    let exception;
    for (const subkey of subkeys) {
      if (!keyID || subkey.getKeyID().equals(keyID)) {
        try {
          await subkey.verify(date, config$1);
          const dataToVerify = { key: primaryKey, bind: subkey.keyPacket };
          const bindingSignature = await getLatestValidSignature(subkey.bindingSignatures, primaryKey, enums.signature.subkeyBinding, dataToVerify, date, config$1);
          if (validateEncryptionKeyPacket(subkey.keyPacket, bindingSignature, config$1)) {
            checkKeyRequirements(subkey.keyPacket, config$1);
            return subkey;
          }
        } catch (e) {
          exception = e;
        }
      }
    }

    try {
      // if no valid subkey for encryption, evaluate primary key
      const selfCertification = await this.getPrimarySelfSignature(date, userID, config$1);
      if ((!keyID || primaryKey.getKeyID().equals(keyID)) &&
          validateEncryptionKeyPacket(primaryKey, selfCertification, config$1)) {
        checkKeyRequirements(primaryKey, config$1);
        return this;
      }
    } catch (e) {
      exception = e;
    }
    throw util.wrapError('Could not find valid encryption key packet in key ' + this.getKeyID().toHex(), exception);
  }

  /**
   * Checks if a signature on a key is revoked
   * @param {SignaturePacket} signature - The signature to verify
   * @param  {PublicSubkeyPacket|
   *          SecretSubkeyPacket|
   *          PublicKeyPacket|
   *          SecretKeyPacket} key, optional The key to verify the signature
   * @param {Date} [date] - Use the given date for verification, instead of the current time
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Promise<Boolean>} True if the certificate is revoked.
   * @async
   */
  async isRevoked(signature, key, date = new Date(), config$1 = config) {
    return isDataRevoked(
      this.keyPacket, enums.signature.keyRevocation, { key: this.keyPacket }, this.revocationSignatures, signature, key, date, config$1
    );
  }

  /**
   * Verify primary key. Checks for revocation signatures, expiration time
   * and valid self signature. Throws if the primary key is invalid.
   * @param {Date} [date] - Use the given date for verification instead of the current time
   * @param {Object} [userID] - User ID
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @throws {Error} If key verification failed
   * @async
   */
  async verifyPrimaryKey(date = new Date(), userID = {}, config$1 = config) {
    const primaryKey = this.keyPacket;
    // check for key revocation signatures
    if (await this.isRevoked(null, null, date, config$1)) {
      throw new Error('Primary key is revoked');
    }
    // check for valid, unrevoked, unexpired self signature
    const selfCertification = await this.getPrimarySelfSignature(date, userID, config$1);
    // check for expiration time in binding signatures
    if (isDataExpired(primaryKey, selfCertification, date)) {
      throw new Error('Primary key is expired');
    }
    if (primaryKey.version !== 6) {
      // check for expiration time in direct signatures (for V6 keys, the above already did so)
      const directSignature = await getLatestValidSignature(
        this.directSignatures, primaryKey, enums.signature.key, { key: primaryKey }, date, config$1
      ).catch(() => {}); // invalid signatures are discarded, to avoid breaking the key

      if (directSignature && isDataExpired(primaryKey, directSignature, date)) {
        throw new Error('Primary key is expired');
      }
    }
  }

  /**
   * Returns the expiration date of the primary key, considering self-certifications and direct-key signatures.
   * Returns `Infinity` if the key doesn't expire, or `null` if the key is revoked or invalid.
   * @param  {Object} [userID] - User ID to consider instead of the primary user
   * @param  {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Promise<Date | Infinity | null>}
   * @async
   */
  async getExpirationTime(userID, config$1 = config) {
    let primaryKeyExpiry;
    try {
      const selfCertification = await this.getPrimarySelfSignature(null, userID, config$1);
      const selfSigKeyExpiry = getKeyExpirationTime(this.keyPacket, selfCertification);
      const selfSigExpiry = selfCertification.getExpirationTime();
      const directSignature = this.keyPacket.version !== 6 && // For V6 keys, the above already returns the direct-key signature.
        await getLatestValidSignature(
          this.directSignatures, this.keyPacket, enums.signature.key, { key: this.keyPacket }, null, config$1
        ).catch(() => {});
      if (directSignature) {
        const directSigKeyExpiry = getKeyExpirationTime(this.keyPacket, directSignature);
        // We do not support the edge case where the direct signature expires, since it would invalidate the corresponding key expiration,
        // causing a discountinous validy period for the key
        primaryKeyExpiry = Math.min(selfSigKeyExpiry, selfSigExpiry, directSigKeyExpiry);
      } else {
        primaryKeyExpiry = selfSigKeyExpiry < selfSigExpiry ? selfSigKeyExpiry : selfSigExpiry;
      }
    } catch (e) {
      primaryKeyExpiry = null;
    }

    return util.normalizeDate(primaryKeyExpiry);
  }


  /**
   * For V4 keys, returns the self-signature of the primary user.
   * For V5 keys, returns the latest valid direct-key self-signature.
   * This self-signature is to be used to check the key expiration,
   * algorithm preferences, and so on.
   * @param {Date} [date] - Use the given date for verification instead of the current time
   * @param {Object} [userID] - User ID to get instead of the primary user for V4 keys, if it exists
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Promise<SignaturePacket>} The primary self-signature
   * @async
   */
  async getPrimarySelfSignature(date = new Date(), userID = {}, config$1 = config) {
    const primaryKey = this.keyPacket;
    if (primaryKey.version === 6) {
      return getLatestValidSignature(
        this.directSignatures, primaryKey, enums.signature.key, { key: primaryKey }, date, config$1
      );
    }
    const { selfCertification } = await this.getPrimaryUser(date, userID, config$1);
    return selfCertification;
  }

  /**
   * Returns primary user and most significant (latest valid) self signature
   * - if multiple primary users exist, returns the one with the latest self signature
   * - otherwise, returns the user with the latest self signature
   * @param {Date} [date] - Use the given date for verification instead of the current time
   * @param {Object} [userID] - User ID to get instead of the primary user, if it exists
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Promise<{
   *   user: User,
   *   selfCertification: SignaturePacket
   * }>} The primary user and the self signature
   * @async
   */
  async getPrimaryUser(date = new Date(), userID = {}, config$1 = config) {
    const primaryKey = this.keyPacket;
    const users = [];
    let exception;
    for (let i = 0; i < this.users.length; i++) {
      try {
        const user = this.users[i];
        if (!user.userID) {
          continue;
        }
        if (
          (userID.name !== undefined && user.userID.name !== userID.name) ||
          (userID.email !== undefined && user.userID.email !== userID.email) ||
          (userID.comment !== undefined && user.userID.comment !== userID.comment)
        ) {
          throw new Error('Could not find user that matches that user ID');
        }
        const dataToVerify = { userID: user.userID, key: primaryKey };
        const selfCertification = await getLatestValidSignature(user.selfCertifications, primaryKey, enums.signature.certGeneric, dataToVerify, date, config$1);
        users.push({ index: i, user, selfCertification });
      } catch (e) {
        exception = e;
      }
    }
    if (!users.length) {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw exception || new Error('Could not find primary user');
    }
    await Promise.all(users.map(async function (a) {
      return a.selfCertification.revoked || a.user.isRevoked(a.selfCertification, null, date, config$1);
    }));
    // sort by primary user flag and signature creation time
    const primaryUser = users.sort(function(a, b) {
      const A = a.selfCertification;
      const B = b.selfCertification;
      return B.revoked - A.revoked || A.isPrimaryUserID - B.isPrimaryUserID || A.created - B.created;
    }).pop();
    const { user, selfCertification: cert } = primaryUser;
    if (cert.revoked || await user.isRevoked(cert, null, date, config$1)) {
      throw new Error('Primary user is revoked');
    }
    return primaryUser;
  }

  /**
   * Update key with new components from specified key with same key ID:
   * users, subkeys, certificates are merged into the destination key,
   * duplicates and expired signatures are ignored.
   *
   * If the source key is a private key and the destination key is public,
   * a private key is returned.
   * @param {Key} sourceKey - Source key to merge
   * @param {Date} [date] - Date to verify validity of signatures and keys
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Promise<Key>} updated key
   * @async
   */
  async update(sourceKey, date = new Date(), config$1 = config) {
    if (!this.hasSameFingerprintAs(sourceKey)) {
      throw new Error('Primary key fingerprints must be equal to update the key');
    }
    if (!this.isPrivate() && sourceKey.isPrivate()) {
      // check for equal subkey packets
      const equal = (this.subkeys.length === sourceKey.subkeys.length) &&
            (this.subkeys.every(destSubkey => {
              return sourceKey.subkeys.some(srcSubkey => {
                return destSubkey.hasSameFingerprintAs(srcSubkey);
              });
            }));
      if (!equal) {
        throw new Error('Cannot update public key with private key if subkeys mismatch');
      }

      return sourceKey.update(this, config$1);
    }
    // from here on, either:
    // - destination key is private, source key is public
    // - the keys are of the same type
    // hence we don't need to convert the destination key type
    const updatedKey = this.clone();
    // revocation signatures
    await mergeSignatures(sourceKey, updatedKey, 'revocationSignatures', date, srcRevSig => {
      return isDataRevoked(updatedKey.keyPacket, enums.signature.keyRevocation, updatedKey, [srcRevSig], null, sourceKey.keyPacket, date, config$1);
    });
    // direct signatures
    await mergeSignatures(sourceKey, updatedKey, 'directSignatures', date);
    // update users
    await Promise.all(sourceKey.users.map(async srcUser => {
      // multiple users with the same ID/attribute are not explicitly disallowed by the spec
      // hence we support them, just in case
      const usersToUpdate = updatedKey.users.filter(dstUser => (
        (srcUser.userID && srcUser.userID.equals(dstUser.userID)) ||
        (srcUser.userAttribute && srcUser.userAttribute.equals(dstUser.userAttribute))
      ));
      if (usersToUpdate.length > 0) {
        await Promise.all(
          usersToUpdate.map(userToUpdate => userToUpdate.update(srcUser, date, config$1))
        );
      } else {
        const newUser = srcUser.clone();
        newUser.mainKey = updatedKey;
        updatedKey.users.push(newUser);
      }
    }));
    // update subkeys
    await Promise.all(sourceKey.subkeys.map(async srcSubkey => {
      // multiple subkeys with same fingerprint might be preset
      const subkeysToUpdate = updatedKey.subkeys.filter(dstSubkey => (
        dstSubkey.hasSameFingerprintAs(srcSubkey)
      ));
      if (subkeysToUpdate.length > 0) {
        await Promise.all(
          subkeysToUpdate.map(subkeyToUpdate => subkeyToUpdate.update(srcSubkey, date, config$1))
        );
      } else {
        const newSubkey = srcSubkey.clone();
        newSubkey.mainKey = updatedKey;
        updatedKey.subkeys.push(newSubkey);
      }
    }));

    return updatedKey;
  }

  /**
   * Get revocation certificate from a revoked key.
   *   (To get a revocation certificate for an unrevoked key, call revoke() first.)
   * @param {Date} date - Use the given date instead of the current time
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Promise<String>} Armored revocation certificate.
   * @async
   */
  async getRevocationCertificate(date = new Date(), config$1 = config) {
    const dataToVerify = { key: this.keyPacket };
    const revocationSignature = await getLatestValidSignature(this.revocationSignatures, this.keyPacket, enums.signature.keyRevocation, dataToVerify, date, config$1);
    const packetlist = new PacketList();
    packetlist.push(revocationSignature);
    // An ASCII-armored Transferable Public Key packet sequence of a v6 key MUST NOT contain a CRC24 footer.
    const emitChecksum = this.keyPacket.version !== 6;
    return armor(enums.armor.publicKey, packetlist.write(), null, null, 'This is a revocation certificate', emitChecksum, config$1);
  }

  /**
   * Applies a revocation certificate to a key
   * This adds the first signature packet in the armored text to the key,
   * if it is a valid revocation signature.
   * @param {String} revocationCertificate - armored revocation certificate
   * @param {Date} [date] - Date to verify the certificate
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Promise<Key>} Revoked key.
   * @async
   */
  async applyRevocationCertificate(revocationCertificate, date = new Date(), config$1 = config) {
    const input = await unarmor(revocationCertificate);
    const packetlist = await PacketList.fromBinary(input.data, allowedRevocationPackets, config$1);
    const revocationSignature = packetlist.findPacket(enums.packet.signature);
    if (!revocationSignature || revocationSignature.signatureType !== enums.signature.keyRevocation) {
      throw new Error('Could not find revocation signature packet');
    }
    if (!revocationSignature.issuerKeyID.equals(this.getKeyID())) {
      throw new Error('Revocation signature does not match key');
    }
    try {
      await revocationSignature.verify(this.keyPacket, enums.signature.keyRevocation, { key: this.keyPacket }, date, undefined, config$1);
    } catch (e) {
      throw util.wrapError('Could not verify revocation signature', e);
    }
    const key = this.clone();
    key.revocationSignatures.push(revocationSignature);
    return key;
  }

  /**
   * Signs primary user of key
   * @param {Array<PrivateKey>} privateKeys - decrypted private keys for signing
   * @param {Date} [date] - Use the given date for verification instead of the current time
   * @param {Object} [userID] - User ID to get instead of the primary user, if it exists
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Promise<Key>} Key with new certificate signature.
   * @async
   */
  async signPrimaryUser(privateKeys, date, userID, config$1 = config) {
    const { index, user } = await this.getPrimaryUser(date, userID, config$1);
    const userSign = await user.certify(privateKeys, date, config$1);
    const key = this.clone();
    key.users[index] = userSign;
    return key;
  }

  /**
   * Signs all users of key
   * @param {Array<PrivateKey>} privateKeys - decrypted private keys for signing
   * @param {Date} [date] - Use the given date for signing, instead of the current time
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Promise<Key>} Key with new certificate signature.
   * @async
   */
  async signAllUsers(privateKeys, date = new Date(), config$1 = config) {
    const key = this.clone();
    key.users = await Promise.all(this.users.map(function(user) {
      return user.certify(privateKeys, date, config$1);
    }));
    return key;
  }

  /**
   * Verifies primary user of key
   * - if no arguments are given, verifies the self certificates;
   * - otherwise, verifies all certificates signed with given keys.
   * @param {Array<PublicKey>} [verificationKeys] - array of keys to verify certificate signatures, instead of the primary key
   * @param {Date} [date] - Use the given date for verification instead of the current time
   * @param {Object} [userID] - User ID to get instead of the primary user, if it exists
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Promise<Array<{
   *   keyID: module:type/keyid~KeyID,
   *   valid: Boolean|null
   * }>>} List of signer's keyID and validity of signature.
   *      Signature validity is null if the verification keys do not correspond to the certificate.
   * @async
   */
  async verifyPrimaryUser(verificationKeys, date = new Date(), userID, config$1 = config) {
    const primaryKey = this.keyPacket;
    const { user } = await this.getPrimaryUser(date, userID, config$1);
    const results = verificationKeys ?
      await user.verifyAllCertifications(verificationKeys, date, config$1) :
      [{ keyID: primaryKey.getKeyID(), valid: await user.verify(date, config$1).catch(() => false) }];
    return results;
  }

  /**
   * Verifies all users of key
   * - if no arguments are given, verifies the self certificates;
   * - otherwise, verifies all certificates signed with given keys.
   * @param {Array<PublicKey>} [verificationKeys] - array of keys to verify certificate signatures
   * @param {Date} [date] - Use the given date for verification instead of the current time
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Promise<Array<{
   *   userID: String,
   *   keyID: module:type/keyid~KeyID,
   *   valid: Boolean|null
   * }>>} List of userID, signer's keyID and validity of signature.
   *      Signature validity is null if the verification keys do not correspond to the certificate.
   * @async
   */
  async verifyAllUsers(verificationKeys, date = new Date(), config$1 = config) {
    const primaryKey = this.keyPacket;
    const results = [];
    await Promise.all(this.users.map(async user => {
      const signatures = verificationKeys ?
        await user.verifyAllCertifications(verificationKeys, date, config$1) :
        [{ keyID: primaryKey.getKeyID(), valid: await user.verify(date, config$1).catch(() => false) }];

      results.push(...signatures.map(
        signature => ({
          userID: user.userID ? user.userID.userID : null,
          userAttribute: user.userAttribute,
          keyID: signature.keyID,
          valid: signature.valid
        }))
      );
    }));
    return results;
  }
}

['getKeyID', 'getFingerprint', 'getAlgorithmInfo', 'getCreationTime', 'hasSameFingerprintAs'].forEach(name => {
  Key.prototype[name] =
  Subkey.prototype[name];
});

// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


/**
 * Class that represents an OpenPGP Public Key
 */
class PublicKey extends Key {
  /**
   * @param {PacketList} packetlist - The packets that form this key
   */
  constructor(packetlist) {
    super();
    this.keyPacket = null;
    this.revocationSignatures = [];
    this.directSignatures = [];
    this.users = [];
    this.subkeys = [];
    if (packetlist) {
      this.packetListToStructure(packetlist, new Set([enums.packet.secretKey, enums.packet.secretSubkey]));
      if (!this.keyPacket) {
        throw new Error('Invalid key: missing public-key packet');
      }
    }
  }

  /**
   * Returns true if this is a private key
   * @returns {false}
   */
  isPrivate() {
    return false;
  }

  /**
   * Returns key as public key (shallow copy)
   * @returns {PublicKey} New public Key
   */
  toPublic() {
    return this;
  }

  /**
   * Returns ASCII armored text of key
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {ReadableStream<String>} ASCII armor.
   */
  armor(config$1 = config) {
    // An ASCII-armored Transferable Public Key packet sequence of a v6 key MUST NOT contain a CRC24 footer.
    const emitChecksum = this.keyPacket.version !== 6;
    return armor(enums.armor.publicKey, this.toPacketList().write(), undefined, undefined, undefined, emitChecksum, config$1);
  }
}

/**
 * Class that represents an OpenPGP Private key
 */
class PrivateKey extends PublicKey {
  /**
 * @param {PacketList} packetlist - The packets that form this key
 */
  constructor(packetlist) {
    super();
    this.packetListToStructure(packetlist, new Set([enums.packet.publicKey, enums.packet.publicSubkey]));
    if (!this.keyPacket) {
      throw new Error('Invalid key: missing private-key packet');
    }
  }

  /**
   * Returns true if this is a private key
   * @returns {Boolean}
   */
  isPrivate() {
    return true;
  }

  /**
   * Returns key as public key (shallow copy)
   * @returns {PublicKey} New public Key
   */
  toPublic() {
    const packetlist = new PacketList();
    const keyPackets = this.toPacketList();
    for (const keyPacket of keyPackets) {
      switch (keyPacket.constructor.tag) {
        case enums.packet.secretKey: {
          const pubKeyPacket = PublicKeyPacket.fromSecretKeyPacket(keyPacket);
          packetlist.push(pubKeyPacket);
          break;
        }
        case enums.packet.secretSubkey: {
          const pubSubkeyPacket = PublicSubkeyPacket.fromSecretSubkeyPacket(keyPacket);
          packetlist.push(pubSubkeyPacket);
          break;
        }
        default:
          packetlist.push(keyPacket);
      }
    }
    return new PublicKey(packetlist);
  }

  /**
   * Returns ASCII armored text of key
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {ReadableStream<String>} ASCII armor.
   */
  armor(config$1 = config) {
    // An ASCII-armored Transferable Public Key packet sequence of a v6 key MUST NOT contain a CRC24 footer.
    const emitChecksum = this.keyPacket.version !== 6;
    return armor(enums.armor.privateKey, this.toPacketList().write(), undefined, undefined, undefined, emitChecksum, config$1);
  }

  /**
   * Returns all keys that are available for decryption, matching the keyID when given
   * This is useful to retrieve keys for session key decryption
   * @param  {module:type/keyid~KeyID} keyID, optional
   * @param  {Date}              date, optional
   * @param  {String}            userID, optional
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Promise<Array<Key|Subkey>>} Array of decryption keys.
   * @throws {Error} if no decryption key is found
   * @async
   */
  async getDecryptionKeys(keyID, date = new Date(), userID = {}, config$1 = config) {
    const primaryKey = this.keyPacket;
    const keys = [];
    let exception = null;
    for (let i = 0; i < this.subkeys.length; i++) {
      if (!keyID || this.subkeys[i].getKeyID().equals(keyID, true)) {
        if (this.subkeys[i].keyPacket.isDummy()) {
          exception = exception || new Error('Gnu-dummy key packets cannot be used for decryption');
          continue;
        }

        try {
          const dataToVerify = { key: primaryKey, bind: this.subkeys[i].keyPacket };
          const bindingSignature = await getLatestValidSignature(this.subkeys[i].bindingSignatures, primaryKey, enums.signature.subkeyBinding, dataToVerify, date, config$1);
          if (validateDecryptionKeyPacket(this.subkeys[i].keyPacket, bindingSignature, config$1)) {
            keys.push(this.subkeys[i]);
          }
        } catch (e) {
          exception = e;
        }
      }
    }

    // evaluate primary key
    const selfCertification = await this.getPrimarySelfSignature(date, userID, config$1);
    if ((!keyID || primaryKey.getKeyID().equals(keyID, true)) && validateDecryptionKeyPacket(primaryKey, selfCertification, config$1)) {
      if (primaryKey.isDummy()) {
        exception = exception || new Error('Gnu-dummy key packets cannot be used for decryption');
      } else {
        keys.push(this);
      }
    }

    if (keys.length === 0) {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw exception || new Error('No decryption key packets found');
    }

    return keys;
  }

  /**
   * Returns true if the primary key or any subkey is decrypted.
   * A dummy key is considered encrypted.
   */
  isDecrypted() {
    return this.getKeys().some(({ keyPacket }) => keyPacket.isDecrypted());
  }

  /**
   * Check whether the private and public primary key parameters correspond
   * Together with verification of binding signatures, this guarantees key integrity
   * In case of gnu-dummy primary key, it is enough to validate any signing subkeys
   *   otherwise all encryption subkeys are validated
   * If only gnu-dummy keys are found, we cannot properly validate so we throw an error
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @throws {Error} if validation was not successful and the key cannot be trusted
   * @async
   */
  async validate(config$1 = config) {
    if (!this.isPrivate()) {
      throw new Error('Cannot validate a public key');
    }

    let signingKeyPacket;
    if (!this.keyPacket.isDummy()) {
      signingKeyPacket = this.keyPacket;
    } else {
      /**
       * It is enough to validate any signing keys
       * since its binding signatures are also checked
       */
      const signingKey = await this.getSigningKey(null, null, undefined, { ...config$1, rejectPublicKeyAlgorithms: new Set(), minRSABits: 0 });
      // This could again be a dummy key
      if (signingKey && !signingKey.keyPacket.isDummy()) {
        signingKeyPacket = signingKey.keyPacket;
      }
    }

    if (signingKeyPacket) {
      return signingKeyPacket.validate();
    } else {
      const keys = this.getKeys();
      const allDummies = keys.map(key => key.keyPacket.isDummy()).every(Boolean);
      if (allDummies) {
        throw new Error('Cannot validate an all-gnu-dummy key');
      }

      return Promise.all(keys.map(async key => key.keyPacket.validate()));
    }
  }

  /**
   * Clear private key parameters
   */
  clearPrivateParams() {
    this.getKeys().forEach(({ keyPacket }) => {
      if (keyPacket.isDecrypted()) {
        keyPacket.clearPrivateParams();
      }
    });
  }

  /**
   * Revokes the key
   * @param {Object} reasonForRevocation - optional, object indicating the reason for revocation
   * @param  {module:enums.reasonForRevocation} reasonForRevocation.flag optional, flag indicating the reason for revocation
   * @param  {String} reasonForRevocation.string optional, string explaining the reason for revocation
   * @param {Date} date - optional, override the creationtime of the revocation signature
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Promise<PrivateKey>} New key with revocation signature.
   * @async
   */
  async revoke(
    {
      flag: reasonForRevocationFlag = enums.reasonForRevocation.noReason,
      string: reasonForRevocationString = ''
    } = {},
    date = new Date(),
    config$1 = config
  ) {
    if (!this.isPrivate()) {
      throw new Error('Need private key for revoking');
    }
    const dataToSign = { key: this.keyPacket };
    const key = this.clone();
    key.revocationSignatures.push(await createSignaturePacket(dataToSign, [], this.keyPacket, {
      signatureType: enums.signature.keyRevocation,
      reasonForRevocationFlag: enums.write(enums.reasonForRevocation, reasonForRevocationFlag),
      reasonForRevocationString
    }, date, undefined, undefined, undefined, config$1));
    return key;
  }


  /**
   * Generates a new OpenPGP subkey, and returns a clone of the Key object with the new subkey added.
   * Supports RSA and ECC keys, as well as the newer Curve448 and Curve25519.
   * Defaults to the algorithm and bit size/curve of the primary key. DSA primary keys default to RSA subkeys.
   * @param {ecc|rsa|curve25519|curve448} options.type The subkey algorithm: ECC, RSA, Curve448 or Curve25519 (new format).
   *                                                   Note: Curve448 and Curve25519 are not widely supported yet.
   * @param {String}  options.curve      (optional) Elliptic curve for ECC keys
   * @param {Integer} options.rsaBits    (optional) Number of bits for RSA subkeys
   * @param {Number}  options.keyExpirationTime (optional) Number of seconds from the key creation time after which the key expires
   * @param {Date}    options.date       (optional) Override the creation date of the key and the key signatures
   * @param {Boolean} options.sign       (optional) Indicates whether the subkey should sign rather than encrypt. Defaults to false
   * @param {Object}  options.config     (optional) custom configuration settings to overwrite those in [config]{@link module:config}
   * @returns {Promise<PrivateKey>}
   * @async
   */
  async addSubkey(options = {}) {
    const config$1 = { ...config, ...options.config };
    if (options.passphrase) {
      throw new Error('Subkey could not be encrypted here, please encrypt whole key');
    }
    if (options.rsaBits < config$1.minRSABits) {
      throw new Error(`rsaBits should be at least ${config$1.minRSABits}, got: ${options.rsaBits}`);
    }
    const secretKeyPacket = this.keyPacket;
    if (secretKeyPacket.isDummy()) {
      throw new Error('Cannot add subkey to gnu-dummy primary key');
    }
    if (!secretKeyPacket.isDecrypted()) {
      throw new Error('Key is not decrypted');
    }
    const defaultOptions = secretKeyPacket.getAlgorithmInfo();
    defaultOptions.type = getDefaultSubkeyType(defaultOptions.algorithm);
    defaultOptions.rsaBits = defaultOptions.bits || 4096;
    defaultOptions.curve = defaultOptions.curve || 'curve25519Legacy';
    options = sanitizeKeyOptions(options, defaultOptions);
    // Every subkey for a v4 primary key MUST be a v4 subkey.
    // Every subkey for a v6 primary key MUST be a v6 subkey.
    // For v5 keys, since we dropped generation support, a v4 subkey is added.
    // The config is always overwritten since we cannot tell if the defaultConfig was changed by the user.
    const keyPacket = await generateSecretSubkey(options, { ...config$1, v6Keys: this.keyPacket.version === 6 });
    checkKeyRequirements(keyPacket, config$1);
    const bindingSignature = await createBindingSignature(keyPacket, secretKeyPacket, options, config$1);
    const packetList = this.toPacketList();
    packetList.push(keyPacket, bindingSignature);
    return new PrivateKey(packetList);
  }
}

function getDefaultSubkeyType(algoName) {
  const algo = enums.write(enums.publicKey, algoName);
  // NB: no encryption-only algos, since they cannot be in primary keys
  switch (algo) {
    case enums.publicKey.rsaEncrypt:
    case enums.publicKey.rsaEncryptSign:
    case enums.publicKey.rsaSign:
    case enums.publicKey.dsa:
      return 'rsa';
    case enums.publicKey.ecdsa:
    case enums.publicKey.eddsaLegacy:
      return 'ecc';
    case enums.publicKey.ed25519:
      return 'curve25519';
    case enums.publicKey.ed448:
      return 'curve448';
    default:
      throw new Error('Unsupported algorithm');
  }
}

// OpenPGP.js - An OpenPGP implementation in javascript
// Copyright (C) 2015-2016 Decentral
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


// A Key can contain the following packets
const allowedKeyPackets = /*#__PURE__*/ util.constructAllowedPackets([
  PublicKeyPacket,
  PublicSubkeyPacket,
  SecretKeyPacket,
  SecretSubkeyPacket,
  UserIDPacket,
  UserAttributePacket,
  SignaturePacket
]);

/**
 * Creates a PublicKey or PrivateKey depending on the packetlist in input
 * @param {PacketList} - packets to parse
 * @return {Key} parsed key
 * @throws if no key packet was found
 */
function createKey(packetlist) {
  for (const packet of packetlist) {
    switch (packet.constructor.tag) {
      case enums.packet.secretKey:
        return new PrivateKey(packetlist);
      case enums.packet.publicKey:
        return new PublicKey(packetlist);
    }
  }
  throw new Error('No key packet found');
}


/**
 * Generates a new OpenPGP key. Supports RSA and ECC keys, as well as the newer Curve448 and Curve25519 keys.
 * By default, primary and subkeys will be of same type.
 * @param {ecc|rsa|curve448|curve25519} options.type                  The primary key algorithm type: ECC, RSA, Curve448 or Curve25519 (new format).
 * @param {String}  options.curve                 Elliptic curve for ECC keys
 * @param {Integer} options.rsaBits               Number of bits for RSA keys
 * @param {Array<String|Object>} options.userIDs  User IDs as strings or objects: 'Jo Doe <info@jo.com>' or { name:'Jo Doe', email:'info@jo.com' }
 * @param {String}  options.passphrase            Passphrase used to encrypt the resulting private key
 * @param {Number}  options.keyExpirationTime     (optional) Number of seconds from the key creation time after which the key expires
 * @param {Date}    options.date                  Creation date of the key and the key signatures
 * @param {Object} config - Full configuration
 * @param {Array<Object>} options.subkeys         (optional) options for each subkey, default to main key options. e.g. [{sign: true, passphrase: '123'}]
 *                                                  sign parameter defaults to false, and indicates whether the subkey should sign rather than encrypt
 * @returns {Promise<{{ key: PrivateKey, revocationCertificate: String }}>}
 * @async
 * @static
 * @private
 */
async function generate(options, config) {
  options.sign = true; // primary key is always a signing key
  options = sanitizeKeyOptions(options);
  options.subkeys = options.subkeys.map((subkey, index) => sanitizeKeyOptions(options.subkeys[index], options));
  let promises = [generateSecretKey(options, config)];
  promises = promises.concat(options.subkeys.map(options => generateSecretSubkey(options, config)));
  const packets = await Promise.all(promises);

  const key = await wrapKeyObject(packets[0], packets.slice(1), options, config);
  const revocationCertificate = await key.getRevocationCertificate(options.date, config);
  key.revocationSignatures = [];
  return { key, revocationCertificate };
}

/**
 * Reformats and signs an OpenPGP key with a given User ID. Currently only supports RSA keys.
 * @param {PrivateKey} options.privateKey         The private key to reformat
 * @param {Array<String|Object>} options.userIDs  User IDs as strings or objects: 'Jo Doe <info@jo.com>' or { name:'Jo Doe', email:'info@jo.com' }
 * @param {String} options.passphrase             Passphrase used to encrypt the resulting private key
 * @param {Number} options.keyExpirationTime      Number of seconds from the key creation time after which the key expires
 * @param {Date}   options.date                   Override the creation date of the key signatures
 * @param {Array<Object>} options.subkeys         (optional) options for each subkey, default to main key options. e.g. [{sign: true, passphrase: '123'}]
 * @param {Object} config - Full configuration
 *
 * @returns {Promise<{{ key: PrivateKey, revocationCertificate: String }}>}
 * @async
 * @static
 * @private
 */
async function reformat(options, config) {
  options = sanitize(options);
  const { privateKey } = options;

  if (!privateKey.isPrivate()) {
    throw new Error('Cannot reformat a public key');
  }

  if (privateKey.keyPacket.isDummy()) {
    throw new Error('Cannot reformat a gnu-dummy primary key');
  }

  const isDecrypted = privateKey.getKeys().every(({ keyPacket }) => keyPacket.isDecrypted());
  if (!isDecrypted) {
    throw new Error('Key is not decrypted');
  }

  const secretKeyPacket = privateKey.keyPacket;

  if (!options.subkeys) {
    options.subkeys = await Promise.all(privateKey.subkeys.map(async subkey => {
      const secretSubkeyPacket = subkey.keyPacket;
      const dataToVerify = { key: secretKeyPacket, bind: secretSubkeyPacket };
      const bindingSignature = await (
        getLatestValidSignature(subkey.bindingSignatures, secretKeyPacket, enums.signature.subkeyBinding, dataToVerify, null, config)
      ).catch(() => ({}));
      return {
        sign: bindingSignature.keyFlags && (bindingSignature.keyFlags[0] & enums.keyFlags.signData)
      };
    }));
  }

  const secretSubkeyPackets = privateKey.subkeys.map(subkey => subkey.keyPacket);
  if (options.subkeys.length !== secretSubkeyPackets.length) {
    throw new Error('Number of subkey options does not match number of subkeys');
  }

  options.subkeys = options.subkeys.map(subkeyOptions => sanitize(subkeyOptions, options));

  const key = await wrapKeyObject(secretKeyPacket, secretSubkeyPackets, options, config);
  const revocationCertificate = await key.getRevocationCertificate(options.date, config);
  key.revocationSignatures = [];
  return { key, revocationCertificate };

  function sanitize(options, subkeyDefaults = {}) {
    options.keyExpirationTime = options.keyExpirationTime || subkeyDefaults.keyExpirationTime;
    options.passphrase = util.isString(options.passphrase) ? options.passphrase : subkeyDefaults.passphrase;
    options.date = options.date || subkeyDefaults.date;

    return options;
  }
}

/**
 * Construct PrivateKey object from the given key packets, add certification signatures and set passphrase protection
 * The new key includes a revocation certificate that must be removed before returning the key, otherwise the key is considered revoked.
 * @param {SecretKeyPacket} secretKeyPacket
 * @param {SecretSubkeyPacket} secretSubkeyPackets
 * @param {Object} options
 * @param {Object} config - Full configuration
 * @returns {PrivateKey}
 */
async function wrapKeyObject(secretKeyPacket, secretSubkeyPackets, options, config) {
  // set passphrase protection
  if (options.passphrase) {
    await secretKeyPacket.encrypt(options.passphrase, config);
  }

  await Promise.all(secretSubkeyPackets.map(async function(secretSubkeyPacket, index) {
    const subkeyPassphrase = options.subkeys[index].passphrase;
    if (subkeyPassphrase) {
      await secretSubkeyPacket.encrypt(subkeyPassphrase, config);
    }
  }));

  const packetlist = new PacketList();
  packetlist.push(secretKeyPacket);

  function createPreferredAlgos(algos, preferredAlgo) {
    return [preferredAlgo, ...algos.filter(algo => algo !== preferredAlgo)];
  }

  function getKeySignatureProperties() {
    const signatureProperties = {};
    signatureProperties.keyFlags = [enums.keyFlags.certifyKeys | enums.keyFlags.signData];
    const symmetricAlgorithms = createPreferredAlgos([
      // prefer aes256, aes128, no aes192 (no Web Crypto support in Chrome: https://www.chromium.org/blink/webcrypto#TOC-AES-support)
      enums.symmetric.aes256,
      enums.symmetric.aes128
    ], config.preferredSymmetricAlgorithm);
    signatureProperties.preferredSymmetricAlgorithms = symmetricAlgorithms;
    if (config.aeadProtect) {
      const aeadAlgorithms = createPreferredAlgos([
        enums.aead.gcm,
        enums.aead.eax,
        enums.aead.ocb
      ], config.preferredAEADAlgorithm);
      signatureProperties.preferredCipherSuites = aeadAlgorithms.flatMap(aeadAlgorithm => {
        return symmetricAlgorithms.map(symmetricAlgorithm => {
          return [symmetricAlgorithm, aeadAlgorithm];
        });
      });
    }
    signatureProperties.preferredHashAlgorithms = createPreferredAlgos([
      enums.hash.sha512,
      enums.hash.sha256,
      enums.hash.sha3_512,
      enums.hash.sha3_256
    ], config.preferredHashAlgorithm);
    signatureProperties.preferredCompressionAlgorithms = createPreferredAlgos([
      enums.compression.uncompressed,
      enums.compression.zlib,
      enums.compression.zip
    ], config.preferredCompressionAlgorithm);
    // integrity protection always enabled
    signatureProperties.features = [0];
    signatureProperties.features[0] |= enums.features.modificationDetection;
    if (config.aeadProtect) {
      signatureProperties.features[0] |= enums.features.seipdv2;
    }
    if (options.keyExpirationTime > 0) {
      signatureProperties.keyExpirationTime = options.keyExpirationTime;
      signatureProperties.keyNeverExpires = false;
    }
    return signatureProperties;
  }

  if (secretKeyPacket.version === 6) { // add direct key signature with key prefs
    const dataToSign = {
      key: secretKeyPacket
    };

    const signatureProperties = getKeySignatureProperties();
    signatureProperties.signatureType = enums.signature.key;

    const signaturePacket = await createSignaturePacket(dataToSign, [], secretKeyPacket, signatureProperties, options.date, undefined, undefined, undefined, config);
    packetlist.push(signaturePacket);
  }

  await Promise.all(options.userIDs.map(async function(userID, index) {
    const userIDPacket = UserIDPacket.fromObject(userID);
    const dataToSign = {
      userID: userIDPacket,
      key: secretKeyPacket
    };
    const signatureProperties = secretKeyPacket.version !== 6 ? getKeySignatureProperties() : {};
    signatureProperties.signatureType = enums.signature.certPositive;
    if (index === 0) {
      signatureProperties.isPrimaryUserID = true;
    }

    const signaturePacket = await createSignaturePacket(dataToSign, [], secretKeyPacket, signatureProperties, options.date, undefined, undefined, undefined, config);

    return { userIDPacket, signaturePacket };
  })).then(list => {
    list.forEach(({ userIDPacket, signaturePacket }) => {
      packetlist.push(userIDPacket);
      packetlist.push(signaturePacket);
    });
  });

  await Promise.all(secretSubkeyPackets.map(async function(secretSubkeyPacket, index) {
    const subkeyOptions = options.subkeys[index];
    const subkeySignaturePacket = await createBindingSignature(secretSubkeyPacket, secretKeyPacket, subkeyOptions, config);
    return { secretSubkeyPacket, subkeySignaturePacket };
  })).then(packets => {
    packets.forEach(({ secretSubkeyPacket, subkeySignaturePacket }) => {
      packetlist.push(secretSubkeyPacket);
      packetlist.push(subkeySignaturePacket);
    });
  });

  // Add revocation signature packet for creating a revocation certificate.
  // This packet should be removed before returning the key.
  const dataToSign = { key: secretKeyPacket };
  packetlist.push(await createSignaturePacket(dataToSign, [], secretKeyPacket, {
    signatureType: enums.signature.keyRevocation,
    reasonForRevocationFlag: enums.reasonForRevocation.noReason,
    reasonForRevocationString: ''
  }, options.date, undefined, undefined, undefined, config));

  if (options.passphrase) {
    secretKeyPacket.clearPrivateParams();
  }

  await Promise.all(secretSubkeyPackets.map(async function(secretSubkeyPacket, index) {
    const subkeyPassphrase = options.subkeys[index].passphrase;
    if (subkeyPassphrase) {
      secretSubkeyPacket.clearPrivateParams();
    }
  }));

  return new PrivateKey(packetlist);
}

/**
 * Reads an (optionally armored) OpenPGP key and returns a key object
 * @param {Object} options
 * @param {String} [options.armoredKey] - Armored key to be parsed
 * @param {Uint8Array} [options.binaryKey] - Binary key to be parsed
 * @param {Object} [options.config] - Custom configuration settings to overwrite those in [config]{@link module:config}
 * @returns {Promise<Key>} Key object.
 * @async
 * @static
 */
async function readKey({ armoredKey, binaryKey, config: config$1, ...rest }) {
  config$1 = { ...config, ...config$1 };
  if (!armoredKey && !binaryKey) {
    throw new Error('readKey: must pass options object containing `armoredKey` or `binaryKey`');
  }
  if (armoredKey && !util.isString(armoredKey)) {
    throw new Error('readKey: options.armoredKey must be a string');
  }
  if (binaryKey && !util.isUint8Array(binaryKey)) {
    throw new Error('readKey: options.binaryKey must be a Uint8Array');
  }
  const unknownOptions = Object.keys(rest); if (unknownOptions.length > 0) throw new Error(`Unknown option: ${unknownOptions.join(', ')}`);

  let input;
  if (armoredKey) {
    const { type, data } = await unarmor(armoredKey);
    if (!(type === enums.armor.publicKey || type === enums.armor.privateKey)) {
      throw new Error('Armored text not of type key');
    }
    input = data;
  } else {
    input = binaryKey;
  }
  const packetlist = await PacketList.fromBinary(input, allowedKeyPackets, config$1);
  const keyIndex = packetlist.indexOfTag(enums.packet.publicKey, enums.packet.secretKey);
  if (keyIndex.length === 0) {
    throw new Error('No key packet found');
  }
  const firstKeyPacketList = packetlist.slice(keyIndex[0], keyIndex[1]);
  return createKey(firstKeyPacketList);
}

/**
 * Reads an (optionally armored) OpenPGP private key and returns a PrivateKey object
 * @param {Object} options
 * @param {String} [options.armoredKey] - Armored key to be parsed
 * @param {Uint8Array} [options.binaryKey] - Binary key to be parsed
 * @param {Object} [options.config] - Custom configuration settings to overwrite those in [config]{@link module:config}
 * @returns {Promise<PrivateKey>} Key object.
 * @async
 * @static
 */
async function readPrivateKey({ armoredKey, binaryKey, config: config$1, ...rest }) {
  config$1 = { ...config, ...config$1 };
  if (!armoredKey && !binaryKey) {
    throw new Error('readPrivateKey: must pass options object containing `armoredKey` or `binaryKey`');
  }
  if (armoredKey && !util.isString(armoredKey)) {
    throw new Error('readPrivateKey: options.armoredKey must be a string');
  }
  if (binaryKey && !util.isUint8Array(binaryKey)) {
    throw new Error('readPrivateKey: options.binaryKey must be a Uint8Array');
  }
  const unknownOptions = Object.keys(rest); if (unknownOptions.length > 0) throw new Error(`Unknown option: ${unknownOptions.join(', ')}`);

  let input;
  if (armoredKey) {
    const { type, data } = await unarmor(armoredKey);
    if (!(type === enums.armor.privateKey)) {
      throw new Error('Armored text not of type private key');
    }
    input = data;
  } else {
    input = binaryKey;
  }
  const packetlist = await PacketList.fromBinary(input, allowedKeyPackets, config$1);
  const keyIndex = packetlist.indexOfTag(enums.packet.publicKey, enums.packet.secretKey);
  for (let i = 0; i < keyIndex.length; i++) {
    if (packetlist[keyIndex[i]].constructor.tag === enums.packet.publicKey) {
      continue;
    }
    const firstPrivateKeyList = packetlist.slice(keyIndex[i], keyIndex[i + 1]);
    return new PrivateKey(firstPrivateKeyList);
  }
  throw new Error('No secret key packet found');
}

/**
 * Reads an (optionally armored) OpenPGP key block and returns a list of key objects
 * @param {Object} options
 * @param {String} [options.armoredKeys] - Armored keys to be parsed
 * @param {Uint8Array} [options.binaryKeys] - Binary keys to be parsed
 * @param {Object} [options.config] - Custom configuration settings to overwrite those in [config]{@link module:config}
 * @returns {Promise<Array<Key>>} Key objects.
 * @async
 * @static
 */
async function readKeys({ armoredKeys, binaryKeys, config: config$1, ...rest }) {
  config$1 = { ...config, ...config$1 };
  let input = armoredKeys || binaryKeys;
  if (!input) {
    throw new Error('readKeys: must pass options object containing `armoredKeys` or `binaryKeys`');
  }
  if (armoredKeys && !util.isString(armoredKeys)) {
    throw new Error('readKeys: options.armoredKeys must be a string');
  }
  if (binaryKeys && !util.isUint8Array(binaryKeys)) {
    throw new Error('readKeys: options.binaryKeys must be a Uint8Array');
  }
  const unknownOptions = Object.keys(rest); if (unknownOptions.length > 0) throw new Error(`Unknown option: ${unknownOptions.join(', ')}`);

  if (armoredKeys) {
    const { type, data } = await unarmor(armoredKeys);
    if (type !== enums.armor.publicKey && type !== enums.armor.privateKey) {
      throw new Error('Armored text not of type key');
    }
    input = data;
  }
  const keys = [];
  const packetlist = await PacketList.fromBinary(input, allowedKeyPackets, config$1);
  const keyIndex = packetlist.indexOfTag(enums.packet.publicKey, enums.packet.secretKey);
  if (keyIndex.length === 0) {
    throw new Error('No key packet found');
  }
  for (let i = 0; i < keyIndex.length; i++) {
    const oneKeyList = packetlist.slice(keyIndex[i], keyIndex[i + 1]);
    const newKey = createKey(oneKeyList);
    keys.push(newKey);
  }
  return keys;
}

/**
 * Reads an (optionally armored) OpenPGP private key block and returns a list of PrivateKey objects
 * @param {Object} options
 * @param {String} [options.armoredKeys] - Armored keys to be parsed
 * @param {Uint8Array} [options.binaryKeys] - Binary keys to be parsed
 * @param {Object} [options.config] - Custom configuration settings to overwrite those in [config]{@link module:config}
 * @returns {Promise<Array<PrivateKey>>} Key objects.
 * @async
 * @static
 */
async function readPrivateKeys({ armoredKeys, binaryKeys, config: config$1 }) {
  config$1 = { ...config, ...config$1 };
  let input = armoredKeys || binaryKeys;
  if (!input) {
    throw new Error('readPrivateKeys: must pass options object containing `armoredKeys` or `binaryKeys`');
  }
  if (armoredKeys && !util.isString(armoredKeys)) {
    throw new Error('readPrivateKeys: options.armoredKeys must be a string');
  }
  if (binaryKeys && !util.isUint8Array(binaryKeys)) {
    throw new Error('readPrivateKeys: options.binaryKeys must be a Uint8Array');
  }
  if (armoredKeys) {
    const { type, data } = await unarmor(armoredKeys);
    if (type !== enums.armor.privateKey) {
      throw new Error('Armored text not of type private key');
    }
    input = data;
  }
  const keys = [];
  const packetlist = await PacketList.fromBinary(input, allowedKeyPackets, config$1);
  const keyIndex = packetlist.indexOfTag(enums.packet.publicKey, enums.packet.secretKey);
  for (let i = 0; i < keyIndex.length; i++) {
    if (packetlist[keyIndex[i]].constructor.tag === enums.packet.publicKey) {
      continue;
    }
    const oneKeyList = packetlist.slice(keyIndex[i], keyIndex[i + 1]);
    const newKey = new PrivateKey(oneKeyList);
    keys.push(newKey);
  }
  if (keys.length === 0) {
    throw new Error('No secret key packet found');
  }
  return keys;
}

// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


// A Message can contain the following packets
const allowedMessagePackets = /*#__PURE__*/ util.constructAllowedPackets([
  LiteralDataPacket,
  CompressedDataPacket,
  AEADEncryptedDataPacket,
  SymEncryptedIntegrityProtectedDataPacket,
  SymmetricallyEncryptedDataPacket,
  PublicKeyEncryptedSessionKeyPacket,
  SymEncryptedSessionKeyPacket,
  OnePassSignaturePacket,
  SignaturePacket
]);
// A SKESK packet can contain the following packets
const allowedSymSessionKeyPackets = /*#__PURE__*/ util.constructAllowedPackets([SymEncryptedSessionKeyPacket]);
// A detached signature can contain the following packets
const allowedDetachedSignaturePackets = /*#__PURE__*/ util.constructAllowedPackets([SignaturePacket]);

/**
 * Class that represents an OpenPGP message.
 * Can be an encrypted message, signed message, compressed message or literal message
 * See {@link https://tools.ietf.org/html/rfc4880#section-11.3}
 */
class Message {
  /**
   * @param {PacketList} packetlist - The packets that form this message
   */
  constructor(packetlist) {
    this.packets = packetlist || new PacketList();
  }

  /**
   * Returns the key IDs of the keys to which the session key is encrypted
   * @returns {Array<module:type/keyid~KeyID>} Array of keyID objects.
   */
  getEncryptionKeyIDs() {
    const keyIDs = [];
    const pkESKeyPacketlist = this.packets.filterByTag(enums.packet.publicKeyEncryptedSessionKey);
    pkESKeyPacketlist.forEach(function(packet) {
      keyIDs.push(packet.publicKeyID);
    });
    return keyIDs;
  }

  /**
   * Returns the key IDs of the keys that signed the message
   * @returns {Array<module:type/keyid~KeyID>} Array of keyID objects.
   */
  getSigningKeyIDs() {
    const msg = this.unwrapCompressed();
    // search for one pass signatures
    const onePassSigList = msg.packets.filterByTag(enums.packet.onePassSignature);
    if (onePassSigList.length > 0) {
      return onePassSigList.map(packet => packet.issuerKeyID);
    }
    // if nothing found look for signature packets
    const signatureList = msg.packets.filterByTag(enums.packet.signature);
    return signatureList.map(packet => packet.issuerKeyID);
  }

  /**
   * Decrypt the message. Either a private key, a session key, or a password must be specified.
   * @param {Array<PrivateKey>} [decryptionKeys] - Private keys with decrypted secret data
   * @param {Array<String>} [passwords] - Passwords used to decrypt
   * @param {Array<Object>} [sessionKeys] - Session keys in the form: { data:Uint8Array, algorithm:String, [aeadAlgorithm:String] }
   * @param {Date} [date] - Use the given date for key verification instead of the current time
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Promise<Message>} New message with decrypted content.
   * @async
   */
  async decrypt(decryptionKeys, passwords, sessionKeys, date = new Date(), config$1 = config) {
    const symEncryptedPacketlist = this.packets.filterByTag(
      enums.packet.symmetricallyEncryptedData,
      enums.packet.symEncryptedIntegrityProtectedData,
      enums.packet.aeadEncryptedData
    );

    if (symEncryptedPacketlist.length === 0) {
      throw new Error('No encrypted data found');
    }

    const symEncryptedPacket = symEncryptedPacketlist[0];
    const expectedSymmetricAlgorithm = symEncryptedPacket.cipherAlgorithm;

    const sessionKeyObjects = sessionKeys || await this.decryptSessionKeys(decryptionKeys, passwords, expectedSymmetricAlgorithm, date, config$1);

    let exception = null;
    const decryptedPromise = Promise.all(sessionKeyObjects.map(async ({ algorithm: algorithmName, data }) => {
      if (!util.isUint8Array(data) || (!symEncryptedPacket.cipherAlgorithm && !util.isString(algorithmName))) {
        throw new Error('Invalid session key for decryption.');
      }

      try {
        const algo = symEncryptedPacket.cipherAlgorithm || enums.write(enums.symmetric, algorithmName);
        await symEncryptedPacket.decrypt(algo, data, config$1);
      } catch (e) {
        util.printDebugError(e);
        exception = e;
      }
    }));
    // We don't await stream.cancel here because it only returns when the other copy is canceled too.
    cancel(symEncryptedPacket.encrypted); // Don't keep copy of encrypted data in memory.
    symEncryptedPacket.encrypted = null;
    await decryptedPromise;

    if (!symEncryptedPacket.packets || !symEncryptedPacket.packets.length) {
      throw exception || new Error('Decryption failed.');
    }

    const resultMsg = new Message(symEncryptedPacket.packets);
    symEncryptedPacket.packets = new PacketList(); // remove packets after decryption

    return resultMsg;
  }

  /**
   * Decrypt encrypted session keys either with private keys or passwords.
   * @param {Array<PrivateKey>} [decryptionKeys] - Private keys with decrypted secret data
   * @param {Array<String>} [passwords] - Passwords used to decrypt
   * @param {enums.symmetric} [expectedSymmetricAlgorithm] - The symmetric algorithm the SEIPDv2 / AEAD packet is encrypted with (if applicable)
   * @param {Date} [date] - Use the given date for key verification, instead of current time
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Promise<Array<{
   *   data: Uint8Array,
   *   algorithm: String
   * }>>} array of object with potential sessionKey, algorithm pairs
   * @async
   */
  async decryptSessionKeys(decryptionKeys, passwords, expectedSymmetricAlgorithm, date = new Date(), config$1 = config) {
    let decryptedSessionKeyPackets = [];

    let exception;
    if (passwords) {
      const skeskPackets = this.packets.filterByTag(enums.packet.symEncryptedSessionKey);
      if (skeskPackets.length === 0) {
        throw new Error('No symmetrically encrypted session key packet found.');
      }
      await Promise.all(passwords.map(async function(password, i) {
        let packets;
        if (i) {
          packets = await PacketList.fromBinary(skeskPackets.write(), allowedSymSessionKeyPackets, config$1);
        } else {
          packets = skeskPackets;
        }
        await Promise.all(packets.map(async function(skeskPacket) {
          try {
            await skeskPacket.decrypt(password);
            decryptedSessionKeyPackets.push(skeskPacket);
          } catch (err) {
            util.printDebugError(err);
            if (err instanceof Argon2OutOfMemoryError) {
              exception = err;
            }
          }
        }));
      }));
    } else if (decryptionKeys) {
      const pkeskPackets = this.packets.filterByTag(enums.packet.publicKeyEncryptedSessionKey);
      if (pkeskPackets.length === 0) {
        throw new Error('No public key encrypted session key packet found.');
      }
      await Promise.all(pkeskPackets.map(async function(pkeskPacket) {
        await Promise.all(decryptionKeys.map(async function(decryptionKey) {
          let decryptionKeyPackets;
          try {
            // do not check key expiration to allow decryption of old messages
            decryptionKeyPackets = (await decryptionKey.getDecryptionKeys(pkeskPacket.publicKeyID, null, undefined, config$1)).map(key => key.keyPacket);
          } catch (err) {
            exception = err;
            return;
          }

          let algos = [
            enums.symmetric.aes256, // Old OpenPGP.js default fallback
            enums.symmetric.aes128, // RFC4880bis fallback
            enums.symmetric.tripledes, // RFC4880 fallback
            enums.symmetric.cast5 // Golang OpenPGP fallback
          ];
          try {
            const selfCertification = await decryptionKey.getPrimarySelfSignature(date, undefined, config$1); // TODO: Pass userID from somewhere.
            if (selfCertification.preferredSymmetricAlgorithms) {
              algos = algos.concat(selfCertification.preferredSymmetricAlgorithms);
            }
          } catch (e) {}

          await Promise.all(decryptionKeyPackets.map(async function(decryptionKeyPacket) {
            if (!decryptionKeyPacket.isDecrypted()) {
              throw new Error('Decryption key is not decrypted.');
            }

            // To hinder CCA attacks against PKCS1, we carry out a constant-time decryption flow if the `constantTimePKCS1Decryption` config option is set.
            const doConstantTimeDecryption = config$1.constantTimePKCS1Decryption && (
              pkeskPacket.publicKeyAlgorithm === enums.publicKey.rsaEncrypt ||
              pkeskPacket.publicKeyAlgorithm === enums.publicKey.rsaEncryptSign ||
              pkeskPacket.publicKeyAlgorithm === enums.publicKey.rsaSign ||
              pkeskPacket.publicKeyAlgorithm === enums.publicKey.elgamal
            );

            if (doConstantTimeDecryption) {
              // The goal is to not reveal whether PKESK decryption (specifically the PKCS1 decoding step) failed, hence, we always proceed to decrypt the message,
              // either with the successfully decrypted session key, or with a randomly generated one.
              // Since the SEIP/AEAD's symmetric algorithm and key size are stored in the encrypted portion of the PKESK, and the execution flow cannot depend on
              // the decrypted payload, we always assume the message to be encrypted with one of the symmetric algorithms specified in `config.constantTimePKCS1DecryptionSupportedSymmetricAlgorithms`:
              // - If the PKESK decryption succeeds, and the session key cipher is in the supported set, then we try to decrypt the data with the decrypted session key as well as with the
              // randomly generated keys of the remaining key types.
              // - If the PKESK decryptions fails, or if it succeeds but support for the cipher is not enabled, then we discard the session key and try to decrypt the data using only the randomly
              // generated session keys.
              // NB: as a result, if the data is encrypted with a non-suported cipher, decryption will always fail.

              const serialisedPKESK = pkeskPacket.write(); // make copies to be able to decrypt the PKESK packet multiple times
              await Promise.all((
                expectedSymmetricAlgorithm ?
                  [expectedSymmetricAlgorithm] :
                  Array.from(config$1.constantTimePKCS1DecryptionSupportedSymmetricAlgorithms)
              ).map(async sessionKeyAlgorithm => {
                const pkeskPacketCopy = new PublicKeyEncryptedSessionKeyPacket();
                pkeskPacketCopy.read(serialisedPKESK);
                const randomSessionKey = {
                  sessionKeyAlgorithm,
                  sessionKey: generateSessionKey$1(sessionKeyAlgorithm)
                };
                try {
                  await pkeskPacketCopy.decrypt(decryptionKeyPacket, randomSessionKey);
                  decryptedSessionKeyPackets.push(pkeskPacketCopy);
                } catch (err) {
                  // `decrypt` can still throw some non-security-sensitive errors
                  util.printDebugError(err);
                  exception = err;
                }
              }));

            } else {
              try {
                await pkeskPacket.decrypt(decryptionKeyPacket);
                const symmetricAlgorithm = expectedSymmetricAlgorithm || pkeskPacket.sessionKeyAlgorithm;
                if (symmetricAlgorithm && !algos.includes(enums.write(enums.symmetric, symmetricAlgorithm))) {
                  throw new Error('A non-preferred symmetric algorithm was used.');
                }
                decryptedSessionKeyPackets.push(pkeskPacket);
              } catch (err) {
                util.printDebugError(err);
                exception = err;
              }
            }
          }));
        }));
        cancel(pkeskPacket.encrypted); // Don't keep copy of encrypted data in memory.
        pkeskPacket.encrypted = null;
      }));
    } else {
      throw new Error('No key or password specified.');
    }

    if (decryptedSessionKeyPackets.length > 0) {
      // Return only unique session keys
      if (decryptedSessionKeyPackets.length > 1) {
        const seen = new Set();
        decryptedSessionKeyPackets = decryptedSessionKeyPackets.filter(item => {
          const k = item.sessionKeyAlgorithm + util.uint8ArrayToString(item.sessionKey);
          if (seen.has(k)) {
            return false;
          }
          seen.add(k);
          return true;
        });
      }

      return decryptedSessionKeyPackets.map(packet => ({
        data: packet.sessionKey,
        algorithm: packet.sessionKeyAlgorithm && enums.read(enums.symmetric, packet.sessionKeyAlgorithm)
      }));
    }
    throw exception || new Error('Session key decryption failed.');
  }

  /**
   * Get literal data that is the body of the message
   * @returns {(Uint8Array|null)} Literal body of the message as Uint8Array.
   */
  getLiteralData() {
    const msg = this.unwrapCompressed();
    const literal = msg.packets.findPacket(enums.packet.literalData);
    return (literal && literal.getBytes()) || null;
  }

  /**
   * Get filename from literal data packet
   * @returns {(String|null)} Filename of literal data packet as string.
   */
  getFilename() {
    const msg = this.unwrapCompressed();
    const literal = msg.packets.findPacket(enums.packet.literalData);
    return (literal && literal.getFilename()) || null;
  }

  /**
   * Get literal data as text
   * @returns {(String|null)} Literal body of the message interpreted as text.
   */
  getText() {
    const msg = this.unwrapCompressed();
    const literal = msg.packets.findPacket(enums.packet.literalData);
    if (literal) {
      return literal.getText();
    }
    return null;
  }

  /**
   * Generate a new session key object, taking the algorithm preferences of the passed encryption keys into account, if any.
   * @param {Array<PublicKey>} [encryptionKeys] - Public key(s) to select algorithm preferences for
   * @param {Date} [date] - Date to select algorithm preferences at
   * @param {Array<Object>} [userIDs] - User IDs to select algorithm preferences for
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Promise<{ data: Uint8Array, algorithm: String, aeadAlgorithm: undefined|String }>} Object with session key data and algorithms.
   * @async
   */
  static async generateSessionKey(encryptionKeys = [], date = new Date(), userIDs = [], config$1 = config) {
    const { symmetricAlgo, aeadAlgo } = await getPreferredCipherSuite(encryptionKeys, date, userIDs, config$1);
    const symmetricAlgoName = enums.read(enums.symmetric, symmetricAlgo);
    const aeadAlgoName = aeadAlgo ? enums.read(enums.aead, aeadAlgo) : undefined;

    await Promise.all(encryptionKeys.map(key => key.getEncryptionKey()
      .catch(() => null) // ignore key strength requirements
      .then(maybeKey => {
        if (maybeKey && (maybeKey.keyPacket.algorithm === enums.publicKey.x25519 || maybeKey.keyPacket.algorithm === enums.publicKey.x448) &&
          !aeadAlgoName && !util.isAES(symmetricAlgo)) { // if AEAD is defined, then PKESK v6 are used, and the algo info is encrypted
          throw new Error('Could not generate a session key compatible with the given `encryptionKeys`: X22519 and X448 keys can only be used to encrypt AES session keys; change `config.preferredSymmetricAlgorithm` accordingly.');
        }
      })
    ));

    const sessionKeyData = generateSessionKey$1(symmetricAlgo);
    return { data: sessionKeyData, algorithm: symmetricAlgoName, aeadAlgorithm: aeadAlgoName };
  }

  /**
   * Encrypt the message either with public keys, passwords, or both at once.
   * @param {Array<PublicKey>} [encryptionKeys] - Public key(s) for message encryption
   * @param {Array<String>} [passwords] - Password(s) for message encryption
   * @param {Object} [sessionKey] - Session key in the form: { data:Uint8Array, algorithm:String, [aeadAlgorithm:String] }
   * @param {Boolean} [wildcard] - Use a key ID of 0 instead of the public key IDs
   * @param {Array<module:type/keyid~KeyID>} [encryptionKeyIDs] - Array of key IDs to use for encryption. Each encryptionKeyIDs[i] corresponds to keys[i]
   * @param {Date} [date] - Override the creation date of the literal package
   * @param {Array<Object>} [userIDs] - User IDs to encrypt for, e.g. [{ name:'Robert Receiver', email:'robert@openpgp.org' }]
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Promise<Message>} New message with encrypted content.
   * @async
   */
  async encrypt(encryptionKeys, passwords, sessionKey, wildcard = false, encryptionKeyIDs = [], date = new Date(), userIDs = [], config$1 = config) {
    if (sessionKey) {
      if (!util.isUint8Array(sessionKey.data) || !util.isString(sessionKey.algorithm)) {
        throw new Error('Invalid session key for encryption.');
      }
    } else if (encryptionKeys && encryptionKeys.length) {
      sessionKey = await Message.generateSessionKey(encryptionKeys, date, userIDs, config$1);
    } else if (passwords && passwords.length) {
      sessionKey = await Message.generateSessionKey(undefined, undefined, undefined, config$1);
    } else {
      throw new Error('No keys, passwords, or session key provided.');
    }

    const { data: sessionKeyData, algorithm: algorithmName, aeadAlgorithm: aeadAlgorithmName } = sessionKey;

    const msg = await Message.encryptSessionKey(sessionKeyData, algorithmName, aeadAlgorithmName, encryptionKeys, passwords, wildcard, encryptionKeyIDs, date, userIDs, config$1);

    const symEncryptedPacket = SymEncryptedIntegrityProtectedDataPacket.fromObject({
      version: aeadAlgorithmName ? 2 : 1,
      aeadAlgorithm: aeadAlgorithmName ? enums.write(enums.aead, aeadAlgorithmName) : null
    });
    symEncryptedPacket.packets = this.packets;

    const algorithm = enums.write(enums.symmetric, algorithmName);
    await symEncryptedPacket.encrypt(algorithm, sessionKeyData, config$1);

    msg.packets.push(symEncryptedPacket);
    symEncryptedPacket.packets = new PacketList(); // remove packets after encryption
    return msg;
  }

  /**
   * Encrypt a session key either with public keys, passwords, or both at once.
   * @param {Uint8Array} sessionKey - session key for encryption
   * @param {String} algorithmName - session key algorithm
   * @param {String} [aeadAlgorithmName] - AEAD algorithm, e.g. 'eax' or 'ocb'
   * @param {Array<PublicKey>} [encryptionKeys] - Public key(s) for message encryption
   * @param {Array<String>} [passwords] - For message encryption
   * @param {Boolean} [wildcard] - Use a key ID of 0 instead of the public key IDs
   * @param {Array<module:type/keyid~KeyID>} [encryptionKeyIDs] - Array of key IDs to use for encryption. Each encryptionKeyIDs[i] corresponds to encryptionKeys[i]
   * @param {Date} [date] - Override the date
   * @param {Array} [userIDs] - User IDs to encrypt for, e.g. [{ name:'Robert Receiver', email:'robert@openpgp.org' }]
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Promise<Message>} New message with encrypted content.
   * @async
   */
  static async encryptSessionKey(sessionKey, algorithmName, aeadAlgorithmName, encryptionKeys, passwords, wildcard = false, encryptionKeyIDs = [], date = new Date(), userIDs = [], config$1 = config) {
    const packetlist = new PacketList();
    const symmetricAlgorithm = enums.write(enums.symmetric, algorithmName);
    const aeadAlgorithm = aeadAlgorithmName && enums.write(enums.aead, aeadAlgorithmName);

    if (encryptionKeys) {
      const results = await Promise.all(encryptionKeys.map(async function(primaryKey, i) {
        const encryptionKey = await primaryKey.getEncryptionKey(encryptionKeyIDs[i], date, userIDs, config$1);

        const pkESKeyPacket = PublicKeyEncryptedSessionKeyPacket.fromObject({
          version: aeadAlgorithm ? 6 : 3,
          encryptionKeyPacket: encryptionKey.keyPacket,
          anonymousRecipient: wildcard,
          sessionKey,
          sessionKeyAlgorithm: symmetricAlgorithm
        });

        await pkESKeyPacket.encrypt(encryptionKey.keyPacket);
        delete pkESKeyPacket.sessionKey; // delete plaintext session key after encryption
        return pkESKeyPacket;
      }));
      packetlist.push(...results);
    }
    if (passwords) {
      const testDecrypt = async function(keyPacket, password) {
        try {
          await keyPacket.decrypt(password);
          return 1;
        } catch (e) {
          return 0;
        }
      };

      const sum = (accumulator, currentValue) => accumulator + currentValue;

      const encryptPassword = async function(sessionKey, algorithm, aeadAlgorithm, password) {
        const symEncryptedSessionKeyPacket = new SymEncryptedSessionKeyPacket(config$1);
        symEncryptedSessionKeyPacket.sessionKey = sessionKey;
        symEncryptedSessionKeyPacket.sessionKeyAlgorithm = algorithm;
        if (aeadAlgorithm) {
          symEncryptedSessionKeyPacket.aeadAlgorithm = aeadAlgorithm;
        }
        await symEncryptedSessionKeyPacket.encrypt(password, config$1);

        if (config$1.passwordCollisionCheck) {
          const results = await Promise.all(passwords.map(pwd => testDecrypt(symEncryptedSessionKeyPacket, pwd)));
          if (results.reduce(sum) !== 1) {
            return encryptPassword(sessionKey, algorithm, password);
          }
        }

        delete symEncryptedSessionKeyPacket.sessionKey; // delete plaintext session key after encryption
        return symEncryptedSessionKeyPacket;
      };

      const results = await Promise.all(passwords.map(pwd => encryptPassword(sessionKey, symmetricAlgorithm, aeadAlgorithm, pwd)));
      packetlist.push(...results);
    }

    return new Message(packetlist);
  }

  /**
   * Sign the message (the literal data packet of the message)
   * @param {Array<PrivateKey>} signingKeys - private keys with decrypted secret key data for signing
   * @param {Array<Key>} recipientKeys - recipient keys to get the signing preferences from
   * @param {Signature} [signature] - Any existing detached signature to add to the message
   * @param {Array<module:type/keyid~KeyID>} [signingKeyIDs] - Array of key IDs to use for signing. Each signingKeyIDs[i] corresponds to signingKeys[i]
   * @param {Date} [date] - Override the creation time of the signature
   * @param {Array<UserID>} [signingUserIDs] - User IDs to sign with, e.g. [{ name:'Steve Sender', email:'steve@openpgp.org' }]
   * @param {Array<UserID>} [recipientUserIDs] - User IDs associated with `recipientKeys` to get the signing preferences from
   * @param {Array} [notations] - Notation Data to add to the signatures, e.g. [{ name: 'test@example.org', value: new TextEncoder().encode('test'), humanReadable: true, critical: false }]
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Promise<Message>} New message with signed content.
   * @async
   */
  async sign(signingKeys = [], recipientKeys = [], signature = null, signingKeyIDs = [], date = new Date(), signingUserIDs = [], recipientUserIDs = [], notations = [], config$1 = config) {
    const packetlist = new PacketList();

    const literalDataPacket = this.packets.findPacket(enums.packet.literalData);
    if (!literalDataPacket) {
      throw new Error('No literal data packet to sign.');
    }

    const signaturePackets = await createSignaturePackets(literalDataPacket, signingKeys, recipientKeys, signature, signingKeyIDs, date, signingUserIDs, recipientUserIDs, notations, false, config$1); // this returns the existing signature packets as well
    const onePassSignaturePackets = signaturePackets.map(
      (signaturePacket, i) => OnePassSignaturePacket.fromSignaturePacket(signaturePacket, i === 0))
      .reverse(); // innermost OPS refers to the first signature packet

    packetlist.push(...onePassSignaturePackets);
    packetlist.push(literalDataPacket);
    packetlist.push(...signaturePackets);

    return new Message(packetlist);
  }

  /**
   * Compresses the message (the literal and -if signed- signature data packets of the message)
   * @param {module:enums.compression} algo - compression algorithm
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Message} New message with compressed content.
   */
  compress(algo, config$1 = config) {
    if (algo === enums.compression.uncompressed) {
      return this;
    }

    const compressed = new CompressedDataPacket(config$1);
    compressed.algorithm = algo;
    compressed.packets = this.packets;

    const packetList = new PacketList();
    packetList.push(compressed);

    return new Message(packetList);
  }

  /**
   * Create a detached signature for the message (the literal data packet of the message)
   * @param {Array<PrivateKey>} signingKeys - private keys with decrypted secret key data for signing
   * @param {Array<Key>} recipientKeys - recipient keys to get the signing preferences from
   * @param {Signature} [signature] - Any existing detached signature
   * @param {Array<module:type/keyid~KeyID>} [signingKeyIDs] - Array of key IDs to use for signing. Each signingKeyIDs[i] corresponds to signingKeys[i]
   * @param {Date} [date] - Override the creation time of the signature
   * @param {Array<UserID>} [signingUserIDs] - User IDs to sign with, e.g. [{ name:'Steve Sender', email:'steve@openpgp.org' }]
   * @param {Array<UserID>} [recipientUserIDs] - User IDs associated with `recipientKeys` to get the signing preferences from
   * @param {Array} [notations] - Notation Data to add to the signatures, e.g. [{ name: 'test@example.org', value: new TextEncoder().encode('test'), humanReadable: true, critical: false }]
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Promise<Signature>} New detached signature of message content.
   * @async
   */
  async signDetached(signingKeys = [], recipientKeys = [], signature = null, signingKeyIDs = [], recipientKeyIDs = [], date = new Date(), userIDs = [], notations = [], config$1 = config) {
    const literalDataPacket = this.packets.findPacket(enums.packet.literalData);
    if (!literalDataPacket) {
      throw new Error('No literal data packet to sign.');
    }
    return new Signature(await createSignaturePackets(literalDataPacket, signingKeys, recipientKeys, signature, signingKeyIDs, recipientKeyIDs, date, userIDs, notations, true, config$1));
  }

  /**
   * Verify message signatures
   * @param {Array<PublicKey>} verificationKeys - Array of public keys to verify signatures
   * @param {Date} [date] - Verify the signature against the given date, i.e. check signature creation time < date < expiration time
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Promise<Array<{
   *   keyID: module:type/keyid~KeyID,
   *   signature: Promise<Signature>,
   *   verified: Promise<true>
   * }>>} List of signer's keyID and validity of signatures.
   * @async
   */
  async verify(verificationKeys, date = new Date(), config$1 = config) {
    const msg = this.unwrapCompressed();
    const literalDataList = msg.packets.filterByTag(enums.packet.literalData);
    if (literalDataList.length !== 1) {
      throw new Error('Can only verify message with one literal data packet.');
    }
    if (isArrayStream(msg.packets.stream)) {
      msg.packets.push(...await readToEnd(msg.packets.stream, _ => _ || []));
    }
    const onePassSigList = msg.packets.filterByTag(enums.packet.onePassSignature).reverse();
    const signatureList = msg.packets.filterByTag(enums.packet.signature);
    if (onePassSigList.length && !signatureList.length && util.isStream(msg.packets.stream) && !isArrayStream(msg.packets.stream)) {
      await Promise.all(onePassSigList.map(async onePassSig => {
        onePassSig.correspondingSig = new Promise((resolve, reject) => {
          onePassSig.correspondingSigResolve = resolve;
          onePassSig.correspondingSigReject = reject;
        });
        onePassSig.signatureData = fromAsync(async () => (await onePassSig.correspondingSig).signatureData);
        onePassSig.hashed = readToEnd(await onePassSig.hash(onePassSig.signatureType, literalDataList[0], undefined, false));
        onePassSig.hashed.catch(() => {});
      }));
      msg.packets.stream = transformPair(msg.packets.stream, async (readable, writable) => {
        const reader = getReader(readable);
        const writer = getWriter(writable);
        try {
          for (let i = 0; i < onePassSigList.length; i++) {
            const { value: signature } = await reader.read();
            onePassSigList[i].correspondingSigResolve(signature);
          }
          await reader.readToEnd();
          await writer.ready;
          await writer.close();
        } catch (e) {
          onePassSigList.forEach(onePassSig => {
            onePassSig.correspondingSigReject(e);
          });
          await writer.abort(e);
        }
      });
      return createVerificationObjects(onePassSigList, literalDataList, verificationKeys, date, false, config$1);
    }
    return createVerificationObjects(signatureList, literalDataList, verificationKeys, date, false, config$1);
  }

  /**
   * Verify detached message signature
   * @param {Array<PublicKey>} verificationKeys - Array of public keys to verify signatures
   * @param {Signature} signature
   * @param {Date} date - Verify the signature against the given date, i.e. check signature creation time < date < expiration time
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Promise<Array<{
   *   keyID: module:type/keyid~KeyID,
   *   signature: Promise<Signature>,
   *   verified: Promise<true>
   * }>>} List of signer's keyID and validity of signature.
   * @async
   */
  verifyDetached(signature, verificationKeys, date = new Date(), config$1 = config) {
    const msg = this.unwrapCompressed();
    const literalDataList = msg.packets.filterByTag(enums.packet.literalData);
    if (literalDataList.length !== 1) {
      throw new Error('Can only verify message with one literal data packet.');
    }
    const signatureList = signature.packets.filterByTag(enums.packet.signature); // drop UnparsablePackets
    return createVerificationObjects(signatureList, literalDataList, verificationKeys, date, true, config$1);
  }

  /**
   * Unwrap compressed message
   * @returns {Message} Message Content of compressed message.
   */
  unwrapCompressed() {
    const compressed = this.packets.filterByTag(enums.packet.compressedData);
    if (compressed.length) {
      return new Message(compressed[0].packets);
    }
    return this;
  }

  /**
   * Append signature to unencrypted message object
   * @param {String|Uint8Array} detachedSignature - The detached ASCII-armored or Uint8Array PGP signature
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   */
  async appendSignature(detachedSignature, config$1 = config) {
    await this.packets.read(
      util.isUint8Array(detachedSignature) ? detachedSignature : (await unarmor(detachedSignature)).data,
      allowedDetachedSignaturePackets,
      config$1
    );
  }

  /**
   * Returns binary encoded message
   * @returns {ReadableStream<Uint8Array>} Binary message.
   */
  write() {
    return this.packets.write();
  }

  /**
   * Returns ASCII armored text of message
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {ReadableStream<String>} ASCII armor.
   */
  armor(config$1 = config) {
    const trailingPacket = this.packets[this.packets.length - 1];
    // An ASCII-armored Encrypted Message packet sequence that ends in an v2 SEIPD packet MUST NOT contain a CRC24 footer.
    // An ASCII-armored sequence of Signature packets that only includes v6 Signature packets MUST NOT contain a CRC24 footer.
    const emitChecksum = trailingPacket.constructor.tag === SymEncryptedIntegrityProtectedDataPacket.tag ?
      trailingPacket.version !== 2 :
      this.packets.some(packet => packet.constructor.tag === SignaturePacket.tag && packet.version !== 6);
    return armor(enums.armor.message, this.write(), null, null, null, emitChecksum, config$1);
  }
}

/**
 * Create signature packets for the message
 * @param {LiteralDataPacket} literalDataPacket - the literal data packet to sign
 * @param {Array<PrivateKey>} [signingKeys] - private keys with decrypted secret key data for signing
 * @param {Array<Key>} [recipientKeys] - recipient keys to get the signing preferences from
 * @param {Signature} [signature] - Any existing detached signature to append
 * @param {Array<module:type/keyid~KeyID>} [signingKeyIDs] - Array of key IDs to use for signing. Each signingKeyIDs[i] corresponds to signingKeys[i]
 * @param {Date} [date] - Override the creationtime of the signature
 * @param {Array<UserID>} [signingUserIDs] - User IDs to sign to, e.g. [{ name:'Steve Sender', email:'steve@openpgp.org' }]
 * @param {Array<UserID>} [recipientUserIDs] - User IDs associated with `recipientKeys` to get the signing preferences from
 * @param {Array} [notations] - Notation Data to add to the signatures, e.g. [{ name: 'test@example.org', value: new TextEncoder().encode('test'), humanReadable: true, critical: false }]
 * @param {Array} [signatureSalts] - A list of signature salts matching the number of signingKeys that should be used for v6 signatures
 * @param {Boolean} [detached] - Whether to create detached signature packets
 * @param {Object} [config] - Full configuration, defaults to openpgp.config
 * @returns {Promise<PacketList>} List of signature packets.
 * @async
 * @private
 */
async function createSignaturePackets(literalDataPacket, signingKeys, recipientKeys = [], signature = null, signingKeyIDs = [], date = new Date(), signingUserIDs = [], recipientUserIDs = [], notations = [], detached = false, config$1 = config) {
  const packetlist = new PacketList();

  // If data packet was created from Uint8Array, use binary, otherwise use text
  const signatureType = literalDataPacket.text === null ?
    enums.signature.binary : enums.signature.text;

  await Promise.all(signingKeys.map(async (primaryKey, i) => {
    const signingUserID = signingUserIDs[i];
    if (!primaryKey.isPrivate()) {
      throw new Error('Need private key for signing');
    }
    const signingKey = await primaryKey.getSigningKey(signingKeyIDs[i], date, signingUserID, config$1);
    return createSignaturePacket(literalDataPacket, recipientKeys.length ? recipientKeys : [primaryKey], signingKey.keyPacket, { signatureType }, date, recipientUserIDs, notations, detached, config$1);
  })).then(signatureList => {
    packetlist.push(...signatureList);
  });

  if (signature) {
    const existingSigPacketlist = signature.packets.filterByTag(enums.packet.signature);
    packetlist.push(...existingSigPacketlist);
  }
  return packetlist;
}

/**
 * Create object containing signer's keyID and validity of signature
 * @param {SignaturePacket} signature - Signature packet
 * @param {Array<LiteralDataPacket>} literalDataList - Array of literal data packets
 * @param {Array<PublicKey>} verificationKeys - Array of public keys to verify signatures
 * @param {Date} [date] - Check signature validity with respect to the given date
 * @param {Boolean} [detached] - Whether to verify detached signature packets
 * @param {Object} [config] - Full configuration, defaults to openpgp.config
 * @returns {Promise<{
 *   keyID: module:type/keyid~KeyID,
 *   signature: Promise<Signature>,
 *   verified: Promise<true>
 * }>} signer's keyID and validity of signature
 * @async
 * @private
 */
async function createVerificationObject(signature, literalDataList, verificationKeys, date = new Date(), detached = false, config$1 = config) {
  let primaryKey;
  let unverifiedSigningKey;

  for (const key of verificationKeys) {
    const issuerKeys = key.getKeys(signature.issuerKeyID);
    if (issuerKeys.length > 0) {
      primaryKey = key;
      unverifiedSigningKey = issuerKeys[0];
      break;
    }
  }

  const isOnePassSignature = signature instanceof OnePassSignaturePacket;
  const signaturePacketPromise = isOnePassSignature ? signature.correspondingSig : signature;

  const verifiedSig = {
    keyID: signature.issuerKeyID,
    verified: (async () => {
      if (!unverifiedSigningKey) {
        throw new Error(`Could not find signing key with key ID ${signature.issuerKeyID.toHex()}`);
      }

      await signature.verify(unverifiedSigningKey.keyPacket, signature.signatureType, literalDataList[0], date, detached, config$1);
      const signaturePacket = await signaturePacketPromise;
      if (unverifiedSigningKey.getCreationTime() > signaturePacket.created) {
        throw new Error('Key is newer than the signature');
      }
      // We pass the signature creation time to check whether the key was expired at the time of signing.
      // We check this after signature verification because for streamed one-pass signatures, the creation time is not available before
      try {
        await primaryKey.getSigningKey(unverifiedSigningKey.getKeyID(), signaturePacket.created, undefined, config$1);
      } catch (e) {
        // If a key was reformatted then the self-signatures of the signing key might be in the future compared to the message signature,
        // making the key invalid at the time of signing.
        // However, if the key is valid at the given `date`, we still allow using it provided the relevant `config` setting is enabled.
        // Note: we do not support the edge case of a key that was reformatted and it has expired.
        if (config$1.allowInsecureVerificationWithReformattedKeys && e.message.match(/Signature creation time is in the future/)) {
          await primaryKey.getSigningKey(unverifiedSigningKey.getKeyID(), date, undefined, config$1);
        } else {
          throw e;
        }
      }
      return true;
    })(),
    signature: (async () => {
      const signaturePacket = await signaturePacketPromise;
      const packetlist = new PacketList();
      signaturePacket && packetlist.push(signaturePacket);
      return new Signature(packetlist);
    })()
  };

  // Mark potential promise rejections as "handled". This is needed because in
  // some cases, we reject them before the user has a reasonable chance to
  // handle them (e.g. `await readToEnd(result.data); await result.verified` and
  // the data stream errors).
  verifiedSig.signature.catch(() => {});
  verifiedSig.verified.catch(() => {});

  return verifiedSig;
}

/**
 * Create list of objects containing signer's keyID and validity of signature
 * @param {Array<SignaturePacket>} signatureList - Array of signature packets
 * @param {Array<LiteralDataPacket>} literalDataList - Array of literal data packets
 * @param {Array<PublicKey>} verificationKeys - Array of public keys to verify signatures
 * @param {Date} date - Verify the signature against the given date,
 *                    i.e. check signature creation time < date < expiration time
 * @param {Boolean} [detached] - Whether to verify detached signature packets
 * @param {Object} [config] - Full configuration, defaults to openpgp.config
 * @returns {Promise<Array<{
 *   keyID: module:type/keyid~KeyID,
 *   signature: Promise<Signature>,
 *   verified: Promise<true>
 * }>>} list of signer's keyID and validity of signatures (one entry per signature packet in input)
 * @async
 * @private
 */
async function createVerificationObjects(signatureList, literalDataList, verificationKeys, date = new Date(), detached = false, config$1 = config) {
  return Promise.all(signatureList.filter(function(signature) {
    return ['text', 'binary'].includes(enums.read(enums.signature, signature.signatureType));
  }).map(async function(signature) {
    return createVerificationObject(signature, literalDataList, verificationKeys, date, detached, config$1);
  }));
}

/**
 * Reads an (optionally armored) OpenPGP message and returns a Message object
 * @param {Object} options
 * @param {String | ReadableStream<String>} [options.armoredMessage] - Armored message to be parsed
 * @param {Uint8Array | ReadableStream<Uint8Array>} [options.binaryMessage] - Binary to be parsed
 * @param {Object} [options.config] - Custom configuration settings to overwrite those in [config]{@link module:config}
 * @returns {Promise<Message>} New message object.
 * @async
 * @static
 */
async function readMessage({ armoredMessage, binaryMessage, config: config$1, ...rest }) {
  config$1 = { ...config, ...config$1 };
  let input = armoredMessage || binaryMessage;
  if (!input) {
    throw new Error('readMessage: must pass options object containing `armoredMessage` or `binaryMessage`');
  }
  if (armoredMessage && !util.isString(armoredMessage) && !util.isStream(armoredMessage)) {
    throw new Error('readMessage: options.armoredMessage must be a string or stream');
  }
  if (binaryMessage && !util.isUint8Array(binaryMessage) && !util.isStream(binaryMessage)) {
    throw new Error('readMessage: options.binaryMessage must be a Uint8Array or stream');
  }
  const unknownOptions = Object.keys(rest); if (unknownOptions.length > 0) throw new Error(`Unknown option: ${unknownOptions.join(', ')}`);

  const streamType = util.isStream(input);
  if (armoredMessage) {
    const { type, data } = await unarmor(input);
    if (type !== enums.armor.message) {
      throw new Error('Armored text not of type message');
    }
    input = data;
  }
  const packetlist = await PacketList.fromBinary(input, allowedMessagePackets, config$1);
  const message = new Message(packetlist);
  message.fromStream = streamType;
  return message;
}

/**
 * Creates new message object from text or binary data.
 * @param {Object} options
 * @param {String | ReadableStream<String>} [options.text] - The text message contents
 * @param {Uint8Array | ReadableStream<Uint8Array>} [options.binary] - The binary message contents
 * @param {String} [options.filename=""] - Name of the file (if any)
 * @param {Date} [options.date=current date] - Date of the message, or modification date of the file
 * @param {'utf8'|'binary'|'text'|'mime'} [options.format='utf8' if text is passed, 'binary' otherwise] - Data packet type
 * @returns {Promise<Message>} New message object.
 * @async
 * @static
 */
async function createMessage({ text, binary, filename, date = new Date(), format = text !== undefined ? 'utf8' : 'binary', ...rest }) {
  const input = text !== undefined ? text : binary;
  if (input === undefined) {
    throw new Error('createMessage: must pass options object containing `text` or `binary`');
  }
  if (text && !util.isString(text) && !util.isStream(text)) {
    throw new Error('createMessage: options.text must be a string or stream');
  }
  if (binary && !util.isUint8Array(binary) && !util.isStream(binary)) {
    throw new Error('createMessage: options.binary must be a Uint8Array or stream');
  }
  const unknownOptions = Object.keys(rest); if (unknownOptions.length > 0) throw new Error(`Unknown option: ${unknownOptions.join(', ')}`);

  const streamType = util.isStream(input);
  const literalDataPacket = new LiteralDataPacket(date);
  if (text !== undefined) {
    literalDataPacket.setText(input, enums.write(enums.literal, format));
  } else {
    literalDataPacket.setBytes(input, enums.write(enums.literal, format));
  }
  if (filename !== undefined) {
    literalDataPacket.setFilename(filename);
  }
  const literalDataPacketlist = new PacketList();
  literalDataPacketlist.push(literalDataPacket);
  const message = new Message(literalDataPacketlist);
  message.fromStream = streamType;
  return message;
}

// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


// A Cleartext message can contain the following packets
const allowedPackets = /*#__PURE__*/ util.constructAllowedPackets([SignaturePacket]);

/**
 * Class that represents an OpenPGP cleartext signed message.
 * See {@link https://tools.ietf.org/html/rfc4880#section-7}
 */
class CleartextMessage {
  /**
   * @param {String} text - The cleartext of the signed message
   * @param {Signature} signature - The detached signature or an empty signature for unsigned messages
   */
  constructor(text, signature) {
    // remove trailing whitespace and normalize EOL to canonical form <CR><LF>
    this.text = util.removeTrailingSpaces(text).replace(/\r?\n/g, '\r\n');
    if (signature && !(signature instanceof Signature)) {
      throw new Error('Invalid signature input');
    }
    this.signature = signature || new Signature(new PacketList());
  }

  /**
   * Returns the key IDs of the keys that signed the cleartext message
   * @returns {Array<module:type/keyid~KeyID>} Array of keyID objects.
   */
  getSigningKeyIDs() {
    const keyIDs = [];
    const signatureList = this.signature.packets;
    signatureList.forEach(function(packet) {
      keyIDs.push(packet.issuerKeyID);
    });
    return keyIDs;
  }

  /**
   * Sign the cleartext message
   * @param {Array<Key>} signingKeys - private keys with decrypted secret key data for signing
   * @param {Array<Key>} recipientKeys - recipient keys to get the signing preferences from
   * @param {Signature} [signature] - Any existing detached signature
   * @param {Array<module:type/keyid~KeyID>} [signingKeyIDs] - Array of key IDs to use for signing. Each signingKeyIDs[i] corresponds to privateKeys[i]
   * @param {Date} [date] - The creation time of the signature that should be created
   * @param {Array} [signingKeyIDs] - User IDs to sign with, e.g. [{ name:'Steve Sender', email:'steve@openpgp.org' }]
   * @param {Array} [recipientUserIDs] - User IDs associated with `recipientKeys` to get the signing preferences from
   * @param {Array} [notations] - Notation Data to add to the signatures, e.g. [{ name: 'test@example.org', value: new TextEncoder().encode('test'), humanReadable: true, critical: false }]
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Promise<CleartextMessage>} New cleartext message with signed content.
   * @async
   */
  async sign(signingKeys, recipientKeys = [], signature = null, signingKeyIDs = [], date = new Date(), signingUserIDs = [], recipientUserIDs = [], notations = [], config$1 = config) {
    const literalDataPacket = new LiteralDataPacket();
    literalDataPacket.setText(this.text);
    const newSignature = new Signature(await createSignaturePackets(literalDataPacket, signingKeys, recipientKeys, signature, signingKeyIDs, date, signingUserIDs, recipientUserIDs, notations, true, config$1));
    return new CleartextMessage(this.text, newSignature);
  }

  /**
   * Verify signatures of cleartext signed message
   * @param {Array<Key>} keys - Array of keys to verify signatures
   * @param {Date} [date] - Verify the signature against the given date, i.e. check signature creation time < date < expiration time
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {Promise<Array<{
   *   keyID: module:type/keyid~KeyID,
   *   signature: Promise<Signature>,
   *   verified: Promise<true>
   * }>>} List of signer's keyID and validity of signature.
   * @async
   */
  verify(keys, date = new Date(), config$1 = config) {
    const signatureList = this.signature.packets.filterByTag(enums.packet.signature); // drop UnparsablePackets
    const literalDataPacket = new LiteralDataPacket();
    // we assume that cleartext signature is generated based on UTF8 cleartext
    literalDataPacket.setText(this.text);
    return createVerificationObjects(signatureList, [literalDataPacket], keys, date, true, config$1);
  }

  /**
   * Get cleartext
   * @returns {String} Cleartext of message.
   */
  getText() {
    // normalize end of line to \n
    return this.text.replace(/\r\n/g, '\n');
  }

  /**
   * Returns ASCII armored text of cleartext signed message
   * @param {Object} [config] - Full configuration, defaults to openpgp.config
   * @returns {String | ReadableStream<String>} ASCII armor.
   */
  armor(config$1 = config) {
    // emit header and checksum if one of the signatures has a version not 6
    const emitHeaderAndChecksum = this.signature.packets.some(packet => packet.version !== 6);
    const hash = emitHeaderAndChecksum ?
      Array.from(new Set(this.signature.packets.map(
        packet => enums.read(enums.hash, packet.hashAlgorithm).toUpperCase()
      ))).join() :
      null;

    const body = {
      hash,
      text: this.text,
      data: this.signature.packets.write()
    };

    // An ASCII-armored sequence of Signature packets that only includes v6 Signature packets MUST NOT contain a CRC24 footer.
    return armor(enums.armor.signed, body, undefined, undefined, undefined, emitHeaderAndChecksum, config$1);
  }
}

/**
 * Reads an OpenPGP cleartext signed message and returns a CleartextMessage object
 * @param {Object} options
 * @param {String} options.cleartextMessage - Text to be parsed
 * @param {Object} [options.config] - Custom configuration settings to overwrite those in [config]{@link module:config}
 * @returns {Promise<CleartextMessage>} New cleartext message object.
 * @async
 * @static
 */
async function readCleartextMessage({ cleartextMessage, config: config$1, ...rest }) {
  config$1 = { ...config, ...config$1 };
  if (!cleartextMessage) {
    throw new Error('readCleartextMessage: must pass options object containing `cleartextMessage`');
  }
  if (!util.isString(cleartextMessage)) {
    throw new Error('readCleartextMessage: options.cleartextMessage must be a string');
  }
  const unknownOptions = Object.keys(rest); if (unknownOptions.length > 0) throw new Error(`Unknown option: ${unknownOptions.join(', ')}`);

  const input = await unarmor(cleartextMessage);
  if (input.type !== enums.armor.signed) {
    throw new Error('No cleartext signed message.');
  }
  const packetlist = await PacketList.fromBinary(input.data, allowedPackets, config$1);
  verifyHeaders(input.headers, packetlist);
  const signature = new Signature(packetlist);
  return new CleartextMessage(input.text, signature);
}

/**
 * Compare hash algorithm specified in the armor header with signatures
 * @param {Array<String>} headers - Armor headers
 * @param {PacketList} packetlist - The packetlist with signature packets
 * @private
 */
function verifyHeaders(headers, packetlist) {
  const checkHashAlgos = function(hashAlgos) {
    const check = packet => algo => packet.hashAlgorithm === algo;

    for (let i = 0; i < packetlist.length; i++) {
      if (packetlist[i].constructor.tag === enums.packet.signature && !hashAlgos.some(check(packetlist[i]))) {
        return false;
      }
    }
    return true;
  };

  const hashAlgos = [];
  headers.forEach(header => {
    const hashHeader = header.match(/^Hash: (.+)$/); // get header value
    if (hashHeader) {
      const parsedHashIDs = hashHeader[1]
        .replace(/\s/g, '') // remove whitespace
        .split(',')
        .map(hashName => {
          try {
            return enums.write(enums.hash, hashName.toLowerCase());
          } catch (e) {
            throw new Error('Unknown hash algorithm in armor header: ' + hashName.toLowerCase());
          }
        });
      hashAlgos.push(...parsedHashIDs);
    } else {
      throw new Error('Only "Hash" header allowed in cleartext signed message');
    }
  });

  if (hashAlgos.length && !checkHashAlgos(hashAlgos)) {
    throw new Error('Hash algorithm mismatch in armor header and signature');
  }
}

/**
 * Creates a new CleartextMessage object from text
 * @param {Object} options
 * @param {String} options.text
 * @static
 * @async
 */
async function createCleartextMessage({ text, ...rest }) {
  if (!text) {
    throw new Error('createCleartextMessage: must pass options object containing `text`');
  }
  if (!util.isString(text)) {
    throw new Error('createCleartextMessage: options.text must be a string');
  }
  const unknownOptions = Object.keys(rest); if (unknownOptions.length > 0) throw new Error(`Unknown option: ${unknownOptions.join(', ')}`);

  return new CleartextMessage(text);
}

// OpenPGP.js - An OpenPGP implementation in javascript
// Copyright (C) 2016 Tankred Hase
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA



//////////////////////
//                  //
//   Key handling   //
//                  //
//////////////////////


/**
 * Generates a new OpenPGP key pair. Supports RSA and ECC keys, as well as the newer Curve448 and Curve25519 keys.
 * By default, primary and subkeys will be of same type.
 * The generated primary key will have signing capabilities. By default, one subkey with encryption capabilities is also generated.
 * @param {Object} options
 * @param {Object|Array<Object>} options.userIDs - User IDs as objects: `{ name: 'Jo Doe', email: 'info@jo.com' }`
 * @param {'ecc'|'rsa'|'curve448'|'curve25519'} [options.type='ecc'] - The primary key algorithm type: ECC (default for v4 keys), RSA, Curve448 or Curve25519 (new format, default for v6 keys).
 *                                                                     Note: Curve448 and Curve25519 (new format) are not widely supported yet.
 * @param {String} [options.passphrase=(not protected)] - The passphrase used to encrypt the generated private key. If omitted or empty, the key won't be encrypted.
 * @param {Number} [options.rsaBits=4096] - Number of bits for RSA keys
 * @param {String} [options.curve='curve25519Legacy'] - Elliptic curve for ECC keys:
 *                                             curve25519Legacy (default), nistP256, nistP384, nistP521, secp256k1,
 *                                             brainpoolP256r1, brainpoolP384r1, or brainpoolP512r1
 * @param {Date} [options.date=current date] - Override the creation date of the key and the key signatures
 * @param {Number} [options.keyExpirationTime=0 (never expires)] - Number of seconds from the key creation time after which the key expires
 * @param {Array<Object>} [options.subkeys=a single encryption subkey] - Options for each subkey e.g. `[{sign: true, passphrase: '123'}]`
 *                                             default to main key options, except for `sign` parameter that defaults to false, and indicates whether the subkey should sign rather than encrypt
 * @param {'armored'|'binary'|'object'} [options.format='armored'] - format of the output keys
 * @param {Object} [options.config] - Custom configuration settings to overwrite those in [config]{@link module:config}
 * @returns {Promise<Object>} The generated key object in the form:
 *                                     { privateKey:PrivateKey|Uint8Array|String, publicKey:PublicKey|Uint8Array|String, revocationCertificate:String }
 * @async
 * @static
 */
async function generateKey({ userIDs = [], passphrase, type, curve, rsaBits = 4096, keyExpirationTime = 0, date = new Date(), subkeys = [{}], format = 'armored', config: config$1, ...rest }) {
  config$1 = { ...config, ...config$1 }; checkConfig(config$1);
  if (!type && !curve) {
    type = config$1.v6Keys ? 'curve25519' : 'ecc'; // default to new curve25519 for v6 keys (legacy curve25519 cannot be used with them)
    curve = 'curve25519Legacy'; // unused with type != 'ecc'
  } else {
    type = type || 'ecc';
    curve = curve || 'curve25519Legacy';
  }
  userIDs = toArray(userIDs);
  const unknownOptions = Object.keys(rest); if (unknownOptions.length > 0) throw new Error(`Unknown option: ${unknownOptions.join(', ')}`);

  if (userIDs.length === 0 && !config$1.v6Keys) {
    throw new Error('UserIDs are required for V4 keys');
  }
  if (type === 'rsa' && rsaBits < config$1.minRSABits) {
    throw new Error(`rsaBits should be at least ${config$1.minRSABits}, got: ${rsaBits}`);
  }

  const options = { userIDs, passphrase, type, rsaBits, curve, keyExpirationTime, date, subkeys };

  try {
    const { key, revocationCertificate } = await generate(options, config$1);
    key.getKeys().forEach(({ keyPacket }) => checkKeyRequirements(keyPacket, config$1));

    return {
      privateKey: formatObject(key, format, config$1),
      publicKey: formatObject(key.toPublic(), format, config$1),
      revocationCertificate
    };
  } catch (err) {
    throw util.wrapError('Error generating keypair', err);
  }
}

/**
 * Reformats signature packets for a key and rewraps key object.
 * @param {Object} options
 * @param {PrivateKey} options.privateKey - Private key to reformat
 * @param {Object|Array<Object>} options.userIDs - User IDs as objects: `{ name: 'Jo Doe', email: 'info@jo.com' }`
 * @param {String} [options.passphrase=(not protected)] - The passphrase used to encrypt the reformatted private key. If omitted or empty, the key won't be encrypted.
 * @param {Number} [options.keyExpirationTime=0 (never expires)] - Number of seconds from the key creation time after which the key expires
 * @param {Date}   [options.date] - Override the creation date of the key signatures. If the key was previously used to sign messages, it is recommended
 *                                  to set the same date as the key creation time to ensure that old message signatures will still be verifiable using the reformatted key.
 * @param {'armored'|'binary'|'object'} [options.format='armored'] - format of the output keys
 * @param {Object} [options.config] - Custom configuration settings to overwrite those in [config]{@link module:config}
 * @returns {Promise<Object>} The generated key object in the form:
 *                                     { privateKey:PrivateKey|Uint8Array|String, publicKey:PublicKey|Uint8Array|String, revocationCertificate:String }
 * @async
 * @static
 */
async function reformatKey({ privateKey, userIDs = [], passphrase, keyExpirationTime = 0, date, format = 'armored', config: config$1, ...rest }) {
  config$1 = { ...config, ...config$1 }; checkConfig(config$1);
  userIDs = toArray(userIDs);
  const unknownOptions = Object.keys(rest); if (unknownOptions.length > 0) throw new Error(`Unknown option: ${unknownOptions.join(', ')}`);

  if (userIDs.length === 0 && privateKey.keyPacket.version !== 6) {
    throw new Error('UserIDs are required for V4 keys');
  }
  const options = { privateKey, userIDs, passphrase, keyExpirationTime, date };

  try {
    const { key: reformattedKey, revocationCertificate } = await reformat(options, config$1);

    return {
      privateKey: formatObject(reformattedKey, format, config$1),
      publicKey: formatObject(reformattedKey.toPublic(), format, config$1),
      revocationCertificate
    };
  } catch (err) {
    throw util.wrapError('Error reformatting keypair', err);
  }
}

/**
 * Revokes a key. Requires either a private key or a revocation certificate.
 *   If a revocation certificate is passed, the reasonForRevocation parameter will be ignored.
 * @param {Object} options
 * @param {Key} options.key - Public or private key to revoke
 * @param {String} [options.revocationCertificate] - Revocation certificate to revoke the key with
 * @param {Object} [options.reasonForRevocation] - Object indicating the reason for revocation
 * @param {module:enums.reasonForRevocation} [options.reasonForRevocation.flag=[noReason]{@link module:enums.reasonForRevocation}] - Flag indicating the reason for revocation
 * @param {String} [options.reasonForRevocation.string=""] - String explaining the reason for revocation
 * @param {Date} [options.date] - Use the given date instead of the current time to verify validity of revocation certificate (if provided), or as creation time of the revocation signature
 * @param {'armored'|'binary'|'object'} [options.format='armored'] - format of the output key(s)
 * @param {Object} [options.config] - Custom configuration settings to overwrite those in [config]{@link module:config}
 * @returns {Promise<Object>} The revoked key in the form:
 *                              { privateKey:PrivateKey|Uint8Array|String, publicKey:PublicKey|Uint8Array|String } if private key is passed, or
 *                              { privateKey: null, publicKey:PublicKey|Uint8Array|String } otherwise
 * @async
 * @static
 */
async function revokeKey({ key, revocationCertificate, reasonForRevocation, date = new Date(), format = 'armored', config: config$1, ...rest }) {
  config$1 = { ...config, ...config$1 }; checkConfig(config$1);
  const unknownOptions = Object.keys(rest); if (unknownOptions.length > 0) throw new Error(`Unknown option: ${unknownOptions.join(', ')}`);

  try {
    const revokedKey = revocationCertificate ?
      await key.applyRevocationCertificate(revocationCertificate, date, config$1) :
      await key.revoke(reasonForRevocation, date, config$1);

    return revokedKey.isPrivate() ? {
      privateKey: formatObject(revokedKey, format, config$1),
      publicKey: formatObject(revokedKey.toPublic(), format, config$1)
    } : {
      privateKey: null,
      publicKey: formatObject(revokedKey, format, config$1)
    };
  } catch (err) {
    throw util.wrapError('Error revoking key', err);
  }
}

/**
 * Unlock a private key with the given passphrase.
 * This method does not change the original key.
 * @param {Object} options
 * @param {PrivateKey} options.privateKey - The private key to decrypt
 * @param {String|Array<String>} options.passphrase - The user's passphrase(s)
 * @param {Object} [options.config] - Custom configuration settings to overwrite those in [config]{@link module:config}
 * @returns {Promise<PrivateKey>} The unlocked key object.
 * @async
 */
async function decryptKey({ privateKey, passphrase, config: config$1, ...rest }) {
  config$1 = { ...config, ...config$1 }; checkConfig(config$1);
  const unknownOptions = Object.keys(rest); if (unknownOptions.length > 0) throw new Error(`Unknown option: ${unknownOptions.join(', ')}`);

  if (!privateKey.isPrivate()) {
    throw new Error('Cannot decrypt a public key');
  }
  const clonedPrivateKey = privateKey.clone(true);
  const passphrases = util.isArray(passphrase) ? passphrase : [passphrase];

  try {
    await Promise.all(clonedPrivateKey.getKeys().map(key => (
      // try to decrypt each key with any of the given passphrases
      util.anyPromise(passphrases.map(passphrase => key.keyPacket.decrypt(passphrase)))
    )));

    await clonedPrivateKey.validate(config$1);
    return clonedPrivateKey;
  } catch (err) {
    clonedPrivateKey.clearPrivateParams();
    throw util.wrapError('Error decrypting private key', err);
  }
}

/**
 * Lock a private key with the given passphrase.
 * This method does not change the original key.
 * @param {Object} options
 * @param {PrivateKey} options.privateKey - The private key to encrypt
 * @param {String|Array<String>} options.passphrase - If multiple passphrases, they should be in the same order as the packets each should encrypt
 * @param {Object} [options.config] - Custom configuration settings to overwrite those in [config]{@link module:config}
 * @returns {Promise<PrivateKey>} The locked key object.
 * @async
 */
async function encryptKey({ privateKey, passphrase, config: config$1, ...rest }) {
  config$1 = { ...config, ...config$1 }; checkConfig(config$1);
  const unknownOptions = Object.keys(rest); if (unknownOptions.length > 0) throw new Error(`Unknown option: ${unknownOptions.join(', ')}`);

  if (!privateKey.isPrivate()) {
    throw new Error('Cannot encrypt a public key');
  }
  const clonedPrivateKey = privateKey.clone(true);

  const keys = clonedPrivateKey.getKeys();
  const passphrases = util.isArray(passphrase) ? passphrase : new Array(keys.length).fill(passphrase);
  if (passphrases.length !== keys.length) {
    throw new Error('Invalid number of passphrases given for key encryption');
  }

  try {
    await Promise.all(keys.map(async (key, i) => {
      const { keyPacket } = key;
      await keyPacket.encrypt(passphrases[i], config$1);
      keyPacket.clearPrivateParams();
    }));
    return clonedPrivateKey;
  } catch (err) {
    clonedPrivateKey.clearPrivateParams();
    throw util.wrapError('Error encrypting private key', err);
  }
}


///////////////////////////////////////////
//                                       //
//   Message encryption and decryption   //
//                                       //
///////////////////////////////////////////


/**
 * Encrypts a message using public keys, passwords or both at once. At least one of `encryptionKeys`, `passwords` or `sessionKeys`
 *   must be specified. If signing keys are specified, those will be used to sign the message.
 * @param {Object} options
 * @param {Message} options.message - Message to be encrypted as created by {@link createMessage}
 * @param {PublicKey|PublicKey[]} [options.encryptionKeys] - Array of keys or single key, used to encrypt the message
 * @param {PrivateKey|PrivateKey[]} [options.signingKeys] - Private keys for signing. If omitted message will not be signed
 * @param {String|String[]} [options.passwords] - Array of passwords or a single password to encrypt the message
 * @param {Object} [options.sessionKey] - Session key in the form: `{ data:Uint8Array, algorithm:String }`
 * @param {'armored'|'binary'|'object'} [options.format='armored'] - Format of the returned message
 * @param {Signature} [options.signature] - A detached signature to add to the encrypted message
 * @param {Boolean} [options.wildcard=false] - Use a key ID of 0 instead of the public key IDs
 * @param {KeyID|KeyID[]} [options.signingKeyIDs=latest-created valid signing (sub)keys] - Array of key IDs to use for signing. Each `signingKeyIDs[i]` corresponds to `signingKeys[i]`
 * @param {KeyID|KeyID[]} [options.encryptionKeyIDs=latest-created valid encryption (sub)keys] - Array of key IDs to use for encryption. Each `encryptionKeyIDs[i]` corresponds to `encryptionKeys[i]`
 * @param {Date} [options.date=current date] - Override the creation date of the message signature
 * @param {Object|Object[]} [options.signingUserIDs=primary user IDs] - Array of user IDs to sign with, one per key in `signingKeys`, e.g. `[{ name: 'Steve Sender', email: 'steve@openpgp.org' }]`
 * @param {Object|Object[]} [options.encryptionUserIDs=primary user IDs] - Array of user IDs to encrypt for, one per key in `encryptionKeys`, e.g. `[{ name: 'Robert Receiver', email: 'robert@openpgp.org' }]`
 * @param {Object|Object[]} [options.signatureNotations=[]] - Array of notations to add to the signatures, e.g. `[{ name: 'test@example.org', value: new TextEncoder().encode('test'), humanReadable: true, critical: false }]`
 * @param {Object} [options.config] - Custom configuration settings to overwrite those in [config]{@link module:config}
 * @returns {Promise<MaybeStream<String>|MaybeStream<Uint8Array>>} Encrypted message (string if `armor` was true, the default; Uint8Array if `armor` was false).
 * @async
 * @static
 */
async function encrypt({ message, encryptionKeys, signingKeys, passwords, sessionKey, format = 'armored', signature = null, wildcard = false, signingKeyIDs = [], encryptionKeyIDs = [], date = new Date(), signingUserIDs = [], encryptionUserIDs = [], signatureNotations = [], config: config$1, ...rest }) {
  config$1 = { ...config, ...config$1 }; checkConfig(config$1);
  checkMessage(message); checkOutputMessageFormat(format);
  encryptionKeys = toArray(encryptionKeys); signingKeys = toArray(signingKeys); passwords = toArray(passwords);
  signingKeyIDs = toArray(signingKeyIDs); encryptionKeyIDs = toArray(encryptionKeyIDs); signingUserIDs = toArray(signingUserIDs); encryptionUserIDs = toArray(encryptionUserIDs); signatureNotations = toArray(signatureNotations);
  if (rest.detached) {
    throw new Error("The `detached` option has been removed from openpgp.encrypt, separately call openpgp.sign instead. Don't forget to remove the `privateKeys` option as well.");
  }
  if (rest.publicKeys) throw new Error('The `publicKeys` option has been removed from openpgp.encrypt, pass `encryptionKeys` instead');
  if (rest.privateKeys) throw new Error('The `privateKeys` option has been removed from openpgp.encrypt, pass `signingKeys` instead');
  if (rest.armor !== undefined) throw new Error('The `armor` option has been removed from openpgp.encrypt, pass `format` instead.');
  const unknownOptions = Object.keys(rest); if (unknownOptions.length > 0) throw new Error(`Unknown option: ${unknownOptions.join(', ')}`);

  if (!signingKeys) {
    signingKeys = [];
  }

  try {
    if (signingKeys.length || signature) { // sign the message only if signing keys or signature is specified
      message = await message.sign(signingKeys, encryptionKeys, signature, signingKeyIDs, date, signingUserIDs, encryptionKeyIDs, signatureNotations, config$1);
    }
    message = message.compress(
      await getPreferredCompressionAlgo(encryptionKeys, date, encryptionUserIDs, config$1),
      config$1
    );
    message = await message.encrypt(encryptionKeys, passwords, sessionKey, wildcard, encryptionKeyIDs, date, encryptionUserIDs, config$1);
    if (format === 'object') return message;
    // serialize data
    const armor = format === 'armored';
    const data = armor ? message.armor(config$1) : message.write();
    return await convertStream(data);
  } catch (err) {
    throw util.wrapError('Error encrypting message', err);
  }
}

/**
 * Decrypts a message with the user's private key, a session key or a password.
 * One of `decryptionKeys`, `sessionkeys` or `passwords` must be specified (passing a combination of these options is not supported).
 * @param {Object} options
 * @param {Message} options.message - The message object with the encrypted data
 * @param {PrivateKey|PrivateKey[]} [options.decryptionKeys] - Private keys with decrypted secret key data or session key
 * @param {String|String[]} [options.passwords] - Passwords to decrypt the message
 * @param {Object|Object[]} [options.sessionKeys] - Session keys in the form: { data:Uint8Array, algorithm:String }
 * @param {PublicKey|PublicKey[]} [options.verificationKeys] - Array of public keys or single key, to verify signatures
 * @param {Boolean} [options.expectSigned=false] - If true, data decryption fails if the message is not signed with the provided publicKeys
 * @param {'utf8'|'binary'} [options.format='utf8'] - Whether to return data as a string(Stream) or Uint8Array(Stream). If 'utf8' (the default), also normalize newlines.
 * @param {Signature} [options.signature] - Detached signature for verification
 * @param {Date} [options.date=current date] - Use the given date for verification instead of the current time
 * @param {Object} [options.config] - Custom configuration settings to overwrite those in [config]{@link module:config}
 * @returns {Promise<Object>} Object containing decrypted and verified message in the form:
 *
 *     {
 *       data: MaybeStream<String>, (if format was 'utf8', the default)
 *       data: MaybeStream<Uint8Array>, (if format was 'binary')
 *       filename: String,
 *       signatures: [
 *         {
 *           keyID: module:type/keyid~KeyID,
 *           verified: Promise<true>,
 *           signature: Promise<Signature>
 *         }, ...
 *       ]
 *     }
 *
 *     where `signatures` contains a separate entry for each signature packet found in the input message.
 * @async
 * @static
 */
async function decrypt({ message, decryptionKeys, passwords, sessionKeys, verificationKeys, expectSigned = false, format = 'utf8', signature = null, date = new Date(), config: config$1, ...rest }) {
  config$1 = { ...config, ...config$1 }; checkConfig(config$1);
  checkMessage(message); verificationKeys = toArray(verificationKeys); decryptionKeys = toArray(decryptionKeys); passwords = toArray(passwords); sessionKeys = toArray(sessionKeys);
  if (rest.privateKeys) throw new Error('The `privateKeys` option has been removed from openpgp.decrypt, pass `decryptionKeys` instead');
  if (rest.publicKeys) throw new Error('The `publicKeys` option has been removed from openpgp.decrypt, pass `verificationKeys` instead');
  const unknownOptions = Object.keys(rest); if (unknownOptions.length > 0) throw new Error(`Unknown option: ${unknownOptions.join(', ')}`);

  try {
    const decrypted = await message.decrypt(decryptionKeys, passwords, sessionKeys, date, config$1);
    if (!verificationKeys) {
      verificationKeys = [];
    }

    const result = {};
    result.signatures = signature ? await decrypted.verifyDetached(signature, verificationKeys, date, config$1) : await decrypted.verify(verificationKeys, date, config$1);
    result.data = format === 'binary' ? decrypted.getLiteralData() : decrypted.getText();
    result.filename = decrypted.getFilename();
    linkStreams(result, message);
    if (expectSigned) {
      if (verificationKeys.length === 0) {
        throw new Error('Verification keys are required to verify message signatures');
      }
      if (result.signatures.length === 0) {
        throw new Error('Message is not signed');
      }
      result.data = concat([
        result.data,
        fromAsync(async () => {
          await util.anyPromise(result.signatures.map(sig => sig.verified));
          return format === 'binary' ? new Uint8Array() : '';
        })
      ]);
    }
    result.data = await convertStream(result.data);
    return result;
  } catch (err) {
    throw util.wrapError('Error decrypting message', err);
  }
}


//////////////////////////////////////////
//                                      //
//   Message signing and verification   //
//                                      //
//////////////////////////////////////////


/**
 * Signs a message.
 * @param {Object} options
 * @param {CleartextMessage|Message} options.message - (cleartext) message to be signed
 * @param {PrivateKey|PrivateKey[]} options.signingKeys - Array of keys or single key with decrypted secret key data to sign cleartext
 * @param {Key|Key[]} options.recipientKeys - Array of keys or single to get the signing preferences from
 * @param {'armored'|'binary'|'object'} [options.format='armored'] - Format of the returned message
 * @param {Boolean} [options.detached=false] - If the return value should contain a detached signature
 * @param {KeyID|KeyID[]} [options.signingKeyIDs=latest-created valid signing (sub)keys] - Array of key IDs to use for signing. Each signingKeyIDs[i] corresponds to signingKeys[i]
 * @param {Date} [options.date=current date] - Override the creation date of the signature
 * @param {Object|Object[]} [options.signingUserIDs=primary user IDs] - Array of user IDs to sign with, one per key in `signingKeys`, e.g. `[{ name: 'Steve Sender', email: 'steve@openpgp.org' }]`
 * @param {Object|Object[]} [options.recipientUserIDs=primary user IDs] - Array of user IDs to get the signing preferences from, one per key in `recipientKeys`
 * @param {Object|Object[]} [options.signatureNotations=[]] - Array of notations to add to the signatures, e.g. `[{ name: 'test@example.org', value: new TextEncoder().encode('test'), humanReadable: true, critical: false }]`
 * @param {Object} [options.config] - Custom configuration settings to overwrite those in [config]{@link module:config}
 * @returns {Promise<MaybeStream<String|Uint8Array>>} Signed message (string if `armor` was true, the default; Uint8Array if `armor` was false).
 * @async
 * @static
 */
async function sign({ message, signingKeys, recipientKeys = [], format = 'armored', detached = false, signingKeyIDs = [], date = new Date(), signingUserIDs = [], recipientUserIDs = [], signatureNotations = [], config: config$1, ...rest }) {
  config$1 = { ...config, ...config$1 }; checkConfig(config$1);
  checkCleartextOrMessage(message); checkOutputMessageFormat(format);
  signingKeys = toArray(signingKeys); signingKeyIDs = toArray(signingKeyIDs); signingUserIDs = toArray(signingUserIDs); recipientKeys = toArray(recipientKeys); recipientUserIDs = toArray(recipientUserIDs); signatureNotations = toArray(signatureNotations);

  if (rest.privateKeys) throw new Error('The `privateKeys` option has been removed from openpgp.sign, pass `signingKeys` instead');
  if (rest.armor !== undefined) throw new Error('The `armor` option has been removed from openpgp.sign, pass `format` instead.');
  const unknownOptions = Object.keys(rest); if (unknownOptions.length > 0) throw new Error(`Unknown option: ${unknownOptions.join(', ')}`);

  if (message instanceof CleartextMessage && format === 'binary') throw new Error('Cannot return signed cleartext message in binary format');
  if (message instanceof CleartextMessage && detached) throw new Error('Cannot detach-sign a cleartext message');

  if (!signingKeys || signingKeys.length === 0) {
    throw new Error('No signing keys provided');
  }

  try {
    let signature;
    if (detached) {
      signature = await message.signDetached(signingKeys, recipientKeys, undefined, signingKeyIDs, date, signingUserIDs, recipientUserIDs, signatureNotations, config$1);
    } else {
      signature = await message.sign(signingKeys, recipientKeys, undefined, signingKeyIDs, date, signingUserIDs, recipientUserIDs, signatureNotations, config$1);
    }
    if (format === 'object') return signature;

    const armor = format === 'armored';
    signature = armor ? signature.armor(config$1) : signature.write();
    if (detached) {
      signature = transformPair(message.packets.write(), async (readable, writable) => {
        await Promise.all([
          pipe(signature, writable),
          readToEnd(readable).catch(() => {})
        ]);
      });
    }
    return await convertStream(signature);
  } catch (err) {
    throw util.wrapError('Error signing message', err);
  }
}

/**
 * Verifies signatures of cleartext signed message
 * @param {Object} options
 * @param {CleartextMessage|Message} options.message - (cleartext) message object with signatures
 * @param {PublicKey|PublicKey[]} options.verificationKeys - Array of publicKeys or single key, to verify signatures
 * @param {Boolean} [options.expectSigned=false] - If true, verification throws if the message is not signed with the provided publicKeys
 * @param {'utf8'|'binary'} [options.format='utf8'] - Whether to return data as a string(Stream) or Uint8Array(Stream). If 'utf8' (the default), also normalize newlines.
 * @param {Signature} [options.signature] - Detached signature for verification
 * @param {Date} [options.date=current date] - Use the given date for verification instead of the current time
 * @param {Object} [options.config] - Custom configuration settings to overwrite those in [config]{@link module:config}
 * @returns {Promise<Object>} Object containing verified message in the form:
 *
 *     {
 *       data: MaybeStream<String>, (if `message` was a CleartextMessage)
 *       data: MaybeStream<Uint8Array>, (if `message` was a Message)
 *       signatures: [
 *         {
 *           keyID: module:type/keyid~KeyID,
 *           verified: Promise<true>,
 *           signature: Promise<Signature>
 *         }, ...
 *       ]
 *     }
 *
 *     where `signatures` contains a separate entry for each signature packet found in the input message.
 * @async
 * @static
 */
async function verify({ message, verificationKeys, expectSigned = false, format = 'utf8', signature = null, date = new Date(), config: config$1, ...rest }) {
  config$1 = { ...config, ...config$1 }; checkConfig(config$1);
  checkCleartextOrMessage(message); verificationKeys = toArray(verificationKeys);
  if (rest.publicKeys) throw new Error('The `publicKeys` option has been removed from openpgp.verify, pass `verificationKeys` instead');
  const unknownOptions = Object.keys(rest); if (unknownOptions.length > 0) throw new Error(`Unknown option: ${unknownOptions.join(', ')}`);

  if (message instanceof CleartextMessage && format === 'binary') throw new Error("Can't return cleartext message data as binary");
  if (message instanceof CleartextMessage && signature) throw new Error("Can't verify detached cleartext signature");

  try {
    const result = {};
    if (signature) {
      result.signatures = await message.verifyDetached(signature, verificationKeys, date, config$1);
    } else {
      result.signatures = await message.verify(verificationKeys, date, config$1);
    }
    result.data = format === 'binary' ? message.getLiteralData() : message.getText();
    if (message.fromStream && !signature) linkStreams(result, message);
    if (expectSigned) {
      if (result.signatures.length === 0) {
        throw new Error('Message is not signed');
      }
      result.data = concat([
        result.data,
        fromAsync(async () => {
          await util.anyPromise(result.signatures.map(sig => sig.verified));
          return format === 'binary' ? new Uint8Array() : '';
        })
      ]);
    }
    result.data = await convertStream(result.data);
    return result;
  } catch (err) {
    throw util.wrapError('Error verifying signed message', err);
  }
}


///////////////////////////////////////////////
//                                           //
//   Session key encryption and decryption   //
//                                           //
///////////////////////////////////////////////

/**
 * Generate a new session key object, taking the algorithm preferences of the passed public keys into account, if any.
 * @param {Object} options
 * @param {PublicKey|PublicKey[]} [options.encryptionKeys] - Array of public keys or single key used to select algorithm preferences for. If no keys are given, the algorithm will be [config.preferredSymmetricAlgorithm]{@link module:config.preferredSymmetricAlgorithm}
 * @param {Date} [options.date=current date] - Date to select algorithm preferences at
 * @param {Object|Object[]} [options.encryptionUserIDs=primary user IDs] - User IDs to select algorithm preferences for
 * @param {Object} [options.config] - Custom configuration settings to overwrite those in [config]{@link module:config}
 * @returns {Promise<{ data: Uint8Array, algorithm: String }>} Object with session key data and algorithm.
 * @async
 * @static
 */
async function generateSessionKey({ encryptionKeys, date = new Date(), encryptionUserIDs = [], config: config$1, ...rest }) {
  config$1 = { ...config, ...config$1 }; checkConfig(config$1);
  encryptionKeys = toArray(encryptionKeys); encryptionUserIDs = toArray(encryptionUserIDs);
  if (rest.publicKeys) throw new Error('The `publicKeys` option has been removed from openpgp.generateSessionKey, pass `encryptionKeys` instead');
  const unknownOptions = Object.keys(rest); if (unknownOptions.length > 0) throw new Error(`Unknown option: ${unknownOptions.join(', ')}`);

  try {
    const sessionKeys = await Message.generateSessionKey(encryptionKeys, date, encryptionUserIDs, config$1);
    return sessionKeys;
  } catch (err) {
    throw util.wrapError('Error generating session key', err);
  }
}

/**
 * Encrypt a symmetric session key with public keys, passwords, or both at once.
 * At least one of `encryptionKeys` or `passwords` must be specified.
 * @param {Object} options
 * @param {Uint8Array} options.data - The session key to be encrypted e.g. 16 random bytes (for aes128)
 * @param {String} options.algorithm - Algorithm of the symmetric session key e.g. 'aes128' or 'aes256'
 * @param {String} [options.aeadAlgorithm] - AEAD algorithm, e.g. 'eax' or 'ocb'
 * @param {PublicKey|PublicKey[]} [options.encryptionKeys] - Array of public keys or single key, used to encrypt the key
 * @param {String|String[]} [options.passwords] - Passwords for the message
 * @param {'armored'|'binary'} [options.format='armored'] - Format of the returned value
 * @param {Boolean} [options.wildcard=false] - Use a key ID of 0 instead of the public key IDs
 * @param {KeyID|KeyID[]} [options.encryptionKeyIDs=latest-created valid encryption (sub)keys] - Array of key IDs to use for encryption. Each encryptionKeyIDs[i] corresponds to encryptionKeys[i]
 * @param {Date} [options.date=current date] - Override the date
 * @param {Object|Object[]} [options.encryptionUserIDs=primary user IDs] - Array of user IDs to encrypt for, one per key in `encryptionKeys`, e.g. `[{ name: 'Phil Zimmermann', email: 'phil@openpgp.org' }]`
 * @param {Object} [options.config] - Custom configuration settings to overwrite those in [config]{@link module:config}
 * @returns {Promise<String|Uint8Array>} Encrypted session keys (string if `armor` was true, the default; Uint8Array if `armor` was false).
 * @async
 * @static
 */
async function encryptSessionKey({ data, algorithm, aeadAlgorithm, encryptionKeys, passwords, format = 'armored', wildcard = false, encryptionKeyIDs = [], date = new Date(), encryptionUserIDs = [], config: config$1, ...rest }) {
  config$1 = { ...config, ...config$1 }; checkConfig(config$1);
  checkBinary(data); checkString(algorithm, 'algorithm'); checkOutputMessageFormat(format);
  encryptionKeys = toArray(encryptionKeys); passwords = toArray(passwords); encryptionKeyIDs = toArray(encryptionKeyIDs); encryptionUserIDs = toArray(encryptionUserIDs);
  if (rest.publicKeys) throw new Error('The `publicKeys` option has been removed from openpgp.encryptSessionKey, pass `encryptionKeys` instead');
  const unknownOptions = Object.keys(rest); if (unknownOptions.length > 0) throw new Error(`Unknown option: ${unknownOptions.join(', ')}`);

  if ((!encryptionKeys || encryptionKeys.length === 0) && (!passwords || passwords.length === 0)) {
    throw new Error('No encryption keys or passwords provided.');
  }

  try {
    const message = await Message.encryptSessionKey(data, algorithm, aeadAlgorithm, encryptionKeys, passwords, wildcard, encryptionKeyIDs, date, encryptionUserIDs, config$1);
    return formatObject(message, format, config$1);
  } catch (err) {
    throw util.wrapError('Error encrypting session key', err);
  }
}

/**
 * Decrypt symmetric session keys using private keys or passwords (not both).
 * One of `decryptionKeys` or `passwords` must be specified.
 * @param {Object} options
 * @param {Message} options.message - A message object containing the encrypted session key packets
 * @param {PrivateKey|PrivateKey[]} [options.decryptionKeys] - Private keys with decrypted secret key data
 * @param {String|String[]} [options.passwords] - Passwords to decrypt the session key
 * @param {Date} [options.date] - Date to use for key verification instead of the current time
 * @param {Object} [options.config] - Custom configuration settings to overwrite those in [config]{@link module:config}
 * @returns {Promise<Object[]>} Array of decrypted session key, algorithm pairs in the form:
 *                                            { data:Uint8Array, algorithm:String }
 * @throws if no session key could be found or decrypted
 * @async
 * @static
 */
async function decryptSessionKeys({ message, decryptionKeys, passwords, date = new Date(), config: config$1, ...rest }) {
  config$1 = { ...config, ...config$1 }; checkConfig(config$1);
  checkMessage(message); decryptionKeys = toArray(decryptionKeys); passwords = toArray(passwords);
  if (rest.privateKeys) throw new Error('The `privateKeys` option has been removed from openpgp.decryptSessionKeys, pass `decryptionKeys` instead');
  const unknownOptions = Object.keys(rest); if (unknownOptions.length > 0) throw new Error(`Unknown option: ${unknownOptions.join(', ')}`);

  try {
    const sessionKeys = await message.decryptSessionKeys(decryptionKeys, passwords, undefined, date, config$1);
    return sessionKeys;
  } catch (err) {
    throw util.wrapError('Error decrypting session keys', err);
  }
}


//////////////////////////
//                      //
//   Helper functions   //
//                      //
//////////////////////////


/**
 * Input validation
 * @private
 */
function checkString(data, name) {
  if (!util.isString(data)) {
    throw new Error('Parameter [' + (name) + '] must be of type String');
  }
}
function checkBinary(data, name) {
  if (!util.isUint8Array(data)) {
    throw new Error('Parameter [' + ('data') + '] must be of type Uint8Array');
  }
}
function checkMessage(message) {
  if (!(message instanceof Message)) {
    throw new Error('Parameter [message] needs to be of type Message');
  }
}
function checkCleartextOrMessage(message) {
  if (!(message instanceof CleartextMessage) && !(message instanceof Message)) {
    throw new Error('Parameter [message] needs to be of type Message or CleartextMessage');
  }
}
function checkOutputMessageFormat(format) {
  if (format !== 'armored' && format !== 'binary' && format !== 'object') {
    throw new Error(`Unsupported format ${format}`);
  }
}
const defaultConfigPropsCount = Object.keys(config).length;
function checkConfig(config$1) {
  const inputConfigProps = Object.keys(config$1);
  if (inputConfigProps.length !== defaultConfigPropsCount) {
    for (const inputProp of inputConfigProps) {
      if (config[inputProp] === undefined) {
        throw new Error(`Unknown config property: ${inputProp}`);
      }
    }
  }
}

/**
 * Normalize parameter to an array if it is not undefined.
 * @param {Object} param - the parameter to be normalized
 * @returns {Array<Object>|undefined} The resulting array or undefined.
 * @private
 */
function toArray(param) {
  if (param && !util.isArray(param)) {
    param = [param];
  }
  return param;
}

/**
 * Convert data to or from Stream
 * @param {Object} data - the data to convert
 * @returns {Promise<Object>} The data in the respective format.
 * @async
 * @private
 */
async function convertStream(data) {
  const streamType = util.isStream(data);
  if (streamType === 'array') {
    return readToEnd(data);
  }
  return data;
}

/**
 * Link result.data to the message stream for cancellation.
 * Also, forward errors in the message to result.data.
 * @param {Object} result - the data to convert
 * @param {Message} message - message object
 * @returns {Object}
 * @private
 */
function linkStreams(result, message) {
  result.data = transformPair(message.packets.stream, async (readable, writable) => {
    await pipe(result.data, writable, {
      preventClose: true
    });
    const writer = getWriter(writable);
    try {
      // Forward errors in the message stream to result.data.
      await readToEnd(readable, _ => _);
      await writer.close();
    } catch (e) {
      await writer.abort(e);
    }
  });
}

/**
 * Convert the object to the given format
 * @param {Key|Message} object
 * @param {'armored'|'binary'|'object'} format
 * @param {Object} config - Full configuration
 * @returns {String|Uint8Array|Object}
 */
function formatObject(object, format, config) {
  switch (format) {
    case 'object':
      return object;
    case 'armored':
      return object.armor(config);
    case 'binary':
      return object.write();
    default:
      throw new Error(`Unsupported format ${format}`);
  }
}

export { AEADEncryptedDataPacket, CleartextMessage, CompressedDataPacket, LiteralDataPacket, MarkerPacket, Message, OnePassSignaturePacket, PacketList, PaddingPacket, PrivateKey, PublicKey, PublicKeyEncryptedSessionKeyPacket, PublicKeyPacket, PublicSubkeyPacket, SecretKeyPacket, SecretSubkeyPacket, Signature, SignaturePacket, Subkey, SymEncryptedIntegrityProtectedDataPacket, SymEncryptedSessionKeyPacket, SymmetricallyEncryptedDataPacket, TrustPacket, UnparseablePacket, UserAttributePacket, UserIDPacket, armor, config, createCleartextMessage, createMessage, decrypt, decryptKey, decryptSessionKeys, encrypt, encryptKey, encryptSessionKey, enums, generateKey, generateSessionKey, readCleartextMessage, readKey, readKeys, readMessage, readPrivateKey, readPrivateKeys, readSignature, reformatKey, revokeKey, sign, unarmor, verify };
