/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; };
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) });

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  define(IteratorPrototype, iteratorSymbol, function () {
    return this;
  });

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = GeneratorFunctionPrototype;
  defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: true });
  defineProperty(
    GeneratorFunctionPrototype,
    "constructor",
    { value: GeneratorFunction, configurable: true }
  );
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    defineProperty(this, "_invoke", { value: enqueue });
  }

  defineIteratorMethods(AsyncIterator.prototype);
  define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
    return this;
  });
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per GeneratorResume behavior specified since ES2015:
        // ES2015 spec, step 3: https://262.ecma-international.org/6.0/#sec-generatorresume
        // Latest spec, step 2: https://tc39.es/ecma262/#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var methodName = context.method;
    var method = delegate.iterator[methodName];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method, or a missing .next method, always terminate the
      // yield* loop.
      context.delegate = null;

      // Note: ["return"] must be used for ES3 parsing compatibility.
      if (methodName === "throw" && delegate.iterator["return"]) {
        // If the delegate iterator has a return method, give it a
        // chance to clean up.
        context.method = "return";
        context.arg = undefined;
        maybeInvokeDelegate(delegate, context);

        if (context.method === "throw") {
          // If maybeInvokeDelegate(context) changed context.method from
          // "return" to "throw", let that override the TypeError below.
          return ContinueSentinel;
        }
      }
      if (methodName !== "return") {
        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a '" + methodName + "' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  define(Gp, iteratorSymbol, function() {
    return this;
  });

  define(Gp, "toString", function() {
    return "[object Generator]";
  });

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(val) {
    var object = Object(val);
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable != null) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    throw new TypeError(typeof iterable + " is not iterable");
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  typeof module === "object" ? module.exports : {}
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, in modern engines
  // we can explicitly access globalThis. In older engines we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  if (typeof globalThis === "object") {
    globalThis.regeneratorRuntime = runtime;
  } else {
    Function("r", "regeneratorRuntime = r")(runtime);
  }
}

/**
 * © Copyright IBM Corp. 2018 All Rights Reserved
 *   Project name: JSONata
 *   This project is licensed under the MIT License, see LICENSE
 */

// This file contains polyfills (cut and pasted from MDN docs) required for the ES5 package

Number.isInteger = Number.isInteger || function (value) {
  return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
};
if (!String.fromCodePoint) (function (stringFromCharCode) {
  var fromCodePoint = function (_) {
    var codeUnits = [],
      codeLen = 0,
      result = "";
    for (var index = 0, len = arguments.length; index !== len; ++index) {
      var codePoint = +arguments[index];
      // correctly handles all cases including `NaN`, `-Infinity`, `+Infinity`
      // The surrounding `!(...)` is required to correctly handle `NaN` cases
      // The (codePoint>>>0) === codePoint clause handles decimals and negatives
      if (!(codePoint < 0x10FFFF && codePoint >>> 0 === codePoint)) throw RangeError("Invalid code point: " + codePoint);
      if (codePoint <= 0xFFFF) {
        // BMP code point
        codeLen = codeUnits.push(codePoint);
      } else {
        // Astral code point; split in surrogate halves
        // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        codePoint -= 0x10000;
        codeLen = codeUnits.push((codePoint >> 10) + 0xD800,
        // highSurrogate
        codePoint % 0x400 + 0xDC00 // lowSurrogate
        );
      }
      if (codeLen >= 0x3fff) {
        result += stringFromCharCode.apply(null, codeUnits);
        codeUnits.length = 0;
      }
    }
    return result + stringFromCharCode.apply(null, codeUnits);
  };
  try {
    // IE 8 only supports `Object.defineProperty` on DOM elements
    Object.defineProperty(String, "fromCodePoint", {
      "value": fromCodePoint,
      "configurable": true,
      "writable": true
    });
  } catch (e) {
    String.fromCodePoint = fromCodePoint;
  }
})(String.fromCharCode);
if (!Object.is) {
  Object.is = function (x, y) {
    // SameValue algorithm
    if (x === y) {
      // Steps 1-5, 7-10
      // Steps 6.b-6.e: +0 != -0
      return x !== 0 || 1 / x === 1 / y;
    } else {
      // Step 6.a: NaN == NaN
      return x !== x && y !== y;
    }
  };
}

/*! https://mths.be/codepointat v0.2.0 by @mathias */
if (!String.prototype.codePointAt) {
  (function () {
    'use strict';

    // needed to support `apply`/`call` with `undefined`/`null`
    var defineProperty = function () {
      // IE 8 only supports `Object.defineProperty` on DOM elements
      try {
        var object = {};
        var $defineProperty = Object.defineProperty;
        var result = $defineProperty(object, object, object) && $defineProperty;
      } catch (error) {}
      return result;
    }();
    var codePointAt = function (position) {
      if (this == null) {
        throw TypeError();
      }
      var string = String(this);
      var size = string.length;
      // `ToInteger`
      var index = position ? Number(position) : 0;
      if (index != index) {
        // better `isNaN`
        index = 0;
      }
      // Account for out-of-bounds indices:
      if (index < 0 || index >= size) {
        return undefined;
      }
      // Get the first code unit
      var first = string.charCodeAt(index);
      var second;
      if (
      // check if it’s the start of a surrogate pair
      first >= 0xD800 && first <= 0xDBFF &&
      // high surrogate
      size > index + 1 // there is a next code unit
      ) {
        second = string.charCodeAt(index + 1);
        if (second >= 0xDC00 && second <= 0xDFFF) {
          // low surrogate
          // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
          return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
        }
      }
      return first;
    };
    if (defineProperty) {
      defineProperty(String.prototype, 'codePointAt', {
        'value': codePointAt,
        'configurable': true,
        'writable': true
      });
    } else {
      String.prototype.codePointAt = codePointAt;
    }
  })();
}
Math.log10 = Math.log10 || function (x) {
  return Math.log(x) * Math.LOG10E;
};
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.jsonata = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

/**
 * © Copyright IBM Corp. 2018 All Rights Reserved
 *   Project name: JSONata
 *   This project is licensed under the MIT License, see LICENSE
 */

var utils = require('./utils');

/**
 * DateTime formatting and parsing functions
 * Implements the xpath-functions format-date-time specification
 * @type {{formatInteger, formatDateTime, parseInteger, parseDateTime}}
 */
var dateTime = function () {
  'use strict';

  var stringToArray = utils.stringToArray;
  var few = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  var ordinals = ['Zeroth', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth', 'Eighteenth', 'Nineteenth'];
  var decades = ['Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety', 'Hundred'];
  var magnitudes = ['Thousand', 'Million', 'Billion', 'Trillion'];

  /**
   * converts a number into english words
   * @param {string} value - the value to format
   * @param {boolean} ordinal - ordinal or cardinal form
   * @returns {string} - representation in words
   */
  function numberToWords(value, ordinal) {
    var _lookup = function lookup(num, prev, ord) {
      var words = '';
      if (num <= 19) {
        words = (prev ? ' and ' : '') + (ord ? ordinals[num] : few[num]);
      } else if (num < 100) {
        var tens = Math.floor(num / 10);
        var remainder = num % 10;
        words = (prev ? ' and ' : '') + decades[tens - 2];
        if (remainder > 0) {
          words += '-' + _lookup(remainder, false, ord);
        } else if (ord) {
          words = words.substring(0, words.length - 1) + 'ieth';
        }
      } else if (num < 1000) {
        var hundreds = Math.floor(num / 100);
        var _remainder = num % 100;
        words = (prev ? ', ' : '') + few[hundreds] + ' Hundred';
        if (_remainder > 0) {
          words += _lookup(_remainder, true, ord);
        } else if (ord) {
          words += 'th';
        }
      } else {
        var mag = Math.floor(Math.log10(num) / 3);
        if (mag > magnitudes.length) {
          mag = magnitudes.length; // the largest word
        }
        var factor = Math.pow(10, mag * 3);
        var mant = Math.floor(num / factor);
        var _remainder2 = num - mant * factor;
        words = (prev ? ', ' : '') + _lookup(mant, false, false) + ' ' + magnitudes[mag - 1];
        if (_remainder2 > 0) {
          words += _lookup(_remainder2, true, ord);
        } else if (ord) {
          words += 'th';
        }
      }
      return words;
    };
    var words = _lookup(value, false, ordinal);
    return words;
  }
  var wordValues = {};
  few.forEach(function (word, index) {
    wordValues[word.toLowerCase()] = index;
  });
  ordinals.forEach(function (word, index) {
    wordValues[word.toLowerCase()] = index;
  });
  decades.forEach(function (word, index) {
    var lword = word.toLowerCase();
    wordValues[lword] = (index + 2) * 10;
    wordValues[lword.substring(0, word.length - 1) + 'ieth'] = wordValues[lword];
  });
  wordValues.hundredth = 100;
  magnitudes.forEach(function (word, index) {
    var lword = word.toLowerCase();
    var val = Math.pow(10, (index + 1) * 3);
    wordValues[lword] = val;
    wordValues[lword + 'th'] = val;
  });

  /**
   * Converts a number in english words to numeric value
   * @param {string} text - the number in words
   * @returns {number} - the numeric value
   */
  function wordsToNumber(text) {
    var parts = text.split(/,\s|\sand\s|[\s\\-]/);
    var values = parts.map(function (part) {
      return wordValues[part];
    });
    var segs = [0];
    values.forEach(function (value) {
      if (value < 100) {
        var top = segs.pop();
        if (top >= 1000) {
          segs.push(top);
          top = 0;
        }
        segs.push(top + value);
      } else {
        segs.push(segs.pop() * value);
      }
    });
    var result = segs.reduce(function (a, b) {
      return a + b;
    }, 0);
    return result;
  }
  var romanNumerals = [[1000, 'm'], [900, 'cm'], [500, 'd'], [400, 'cd'], [100, 'c'], [90, 'xc'], [50, 'l'], [40, 'xl'], [10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i']];
  var romanValues = {
    'M': 1000,
    'D': 500,
    'C': 100,
    'L': 50,
    'X': 10,
    'V': 5,
    'I': 1
  };

  /**
   * converts a number to roman numerals
   * @param {number} value - the number
   * @returns {string} - the number in roman numerals
   */
  function decimalToRoman(value) {
    for (var index = 0; index < romanNumerals.length; index++) {
      var numeral = romanNumerals[index];
      if (value >= numeral[0]) {
        return numeral[1] + decimalToRoman(value - numeral[0]);
      }
    }
    return '';
  }

  /**
   * converts roman numerals to a number
   * @param {string} roman - roman number
   * @returns {number} - the numeric value
   */
  function romanToDecimal(roman) {
    var decimal = 0;
    var max = 1;
    for (var i = roman.length - 1; i >= 0; i--) {
      var digit = roman[i];
      var value = romanValues[digit];
      if (value < max) {
        decimal -= value;
      } else {
        max = value;
        decimal += value;
      }
    }
    return decimal;
  }

  /**
   * converts a number to spreadsheet style letters
   * @param {number} value - the number
   * @param {string} aChar - the character representing the start of the sequence, e.g. 'A'
   * @returns {string} - the letters
   */
  function decimalToLetters(value, aChar) {
    var letters = [];
    var aCode = aChar.charCodeAt(0);
    while (value > 0) {
      letters.unshift(String.fromCharCode((value - 1) % 26 + aCode));
      value = Math.floor((value - 1) / 26);
    }
    return letters.join('');
  }

  /**
   * converts spreadsheet style letters to a number
   * @param {string} letters - the letters
   * @param {string} aChar - the character representing the start of the sequence, e.g. 'A'
   * @returns {number} - the numeric value
   */
  function lettersToDecimal(letters, aChar) {
    var aCode = aChar.charCodeAt(0);
    var decimal = 0;
    for (var i = 0; i < letters.length; i++) {
      decimal += (letters.charCodeAt(letters.length - i - 1) - aCode + 1) * Math.pow(26, i);
    }
    return decimal;
  }

  /**
   * Formats an integer as specified by the XPath fn:format-integer function
   * See https://www.w3.org/TR/xpath-functions-31/#func-format-integer
   * @param {number} value - the number to be formatted
   * @param {string} picture - the picture string that specifies the format
   * @returns {string} - the formatted number
   */
  function formatInteger(value, picture) {
    if (typeof value === 'undefined') {
      return undefined;
    }
    value = Math.floor(value);
    var format = analyseIntegerPicture(picture);
    return _formatInteger(value, format);
  }
  var formats = {
    DECIMAL: 'decimal',
    LETTERS: 'letters',
    ROMAN: 'roman',
    WORDS: 'words',
    SEQUENCE: 'sequence'
  };
  var tcase = {
    UPPER: 'upper',
    LOWER: 'lower',
    TITLE: 'title'
  };

  /**
   * formats an integer using a preprocessed representation of the picture string
   * @param {number} value - the number to be formatted
   * @param {object} format - the preprocessed representation of the pucture string
   * @returns {string} - the formatted number
   * @private
   */
  function _formatInteger(value, format) {
    var formattedInteger;
    var negative = value < 0;
    value = Math.abs(value);
    switch (format.primary) {
      case formats.LETTERS:
        formattedInteger = decimalToLetters(value, format["case"] === tcase.UPPER ? 'A' : 'a');
        break;
      case formats.ROMAN:
        formattedInteger = decimalToRoman(value);
        if (format["case"] === tcase.UPPER) {
          formattedInteger = formattedInteger.toUpperCase();
        }
        break;
      case formats.WORDS:
        formattedInteger = numberToWords(value, format.ordinal);
        if (format["case"] === tcase.UPPER) {
          formattedInteger = formattedInteger.toUpperCase();
        } else if (format["case"] === tcase.LOWER) {
          formattedInteger = formattedInteger.toLowerCase();
        }
        break;
      case formats.DECIMAL:
        formattedInteger = '' + value;
        // TODO use functionPad
        var padLength = format.mandatoryDigits - formattedInteger.length;
        if (padLength > 0) {
          var padding = new Array(padLength + 1).join('0');
          formattedInteger = padding + formattedInteger;
        }
        if (format.zeroCode !== 0x30) {
          formattedInteger = stringToArray(formattedInteger).map(function (code) {
            return String.fromCodePoint(code.codePointAt(0) + format.zeroCode - 0x30);
          }).join('');
        }
        // insert the grouping-separator-signs, if any
        if (format.regular) {
          var n = Math.floor((formattedInteger.length - 1) / format.groupingSeparators.position);
          for (var ii = n; ii > 0; ii--) {
            var pos = formattedInteger.length - ii * format.groupingSeparators.position;
            formattedInteger = formattedInteger.substr(0, pos) + format.groupingSeparators.character + formattedInteger.substr(pos);
          }
        } else {
          format.groupingSeparators.reverse().forEach(function (separator) {
            var pos = formattedInteger.length - separator.position;
            formattedInteger = formattedInteger.substr(0, pos) + separator.character + formattedInteger.substr(pos);
          });
        }
        if (format.ordinal) {
          var suffix123 = {
            '1': 'st',
            '2': 'nd',
            '3': 'rd'
          };
          var lastDigit = formattedInteger[formattedInteger.length - 1];
          var suffix = suffix123[lastDigit];
          if (!suffix || formattedInteger.length > 1 && formattedInteger[formattedInteger.length - 2] === '1') {
            suffix = 'th';
          }
          formattedInteger = formattedInteger + suffix;
        }
        break;
      case formats.SEQUENCE:
        throw {
          code: 'D3130',
          value: format.token
        };
    }
    if (negative) {
      formattedInteger = '-' + formattedInteger;
    }
    return formattedInteger;
  }

  //TODO what about decimal groups in the unicode supplementary planes (surrogate pairs) ???
  var decimalGroups = [0x30, 0x0660, 0x06F0, 0x07C0, 0x0966, 0x09E6, 0x0A66, 0x0AE6, 0x0B66, 0x0BE6, 0x0C66, 0x0CE6, 0x0D66, 0x0DE6, 0x0E50, 0x0ED0, 0x0F20, 0x1040, 0x1090, 0x17E0, 0x1810, 0x1946, 0x19D0, 0x1A80, 0x1A90, 0x1B50, 0x1BB0, 0x1C40, 0x1C50, 0xA620, 0xA8D0, 0xA900, 0xA9D0, 0xA9F0, 0xAA50, 0xABF0, 0xFF10];

  /**
   * preprocesses the picture string
   * @param {string} picture - picture string
   * @returns {{type: string, primary: string, case: string, ordinal: boolean}} - analysed picture
   */
  function analyseIntegerPicture(picture) {
    var format = {
      type: 'integer',
      primary: formats.DECIMAL,
      "case": tcase.LOWER,
      ordinal: false
    };
    var primaryFormat, formatModifier;
    var semicolon = picture.lastIndexOf(';');
    if (semicolon === -1) {
      primaryFormat = picture;
    } else {
      primaryFormat = picture.substring(0, semicolon);
      formatModifier = picture.substring(semicolon + 1);
      if (formatModifier[0] === 'o') {
        format.ordinal = true;
      }
    }

    /* eslnt-disable-next no-fallthrough */
    switch (primaryFormat) {
      case 'A':
        format["case"] = tcase.UPPER;
      /* eslnt-disable-next-line no-fallthrough */
      case 'a':
        format.primary = formats.LETTERS;
        break;
      case 'I':
        format["case"] = tcase.UPPER;
      /* eslnt-disable-next-line no-fallthrough */
      case 'i':
        format.primary = formats.ROMAN;
        break;
      case 'W':
        format["case"] = tcase.UPPER;
        format.primary = formats.WORDS;
        break;
      case 'Ww':
        format["case"] = tcase.TITLE;
        format.primary = formats.WORDS;
        break;
      case 'w':
        format.primary = formats.WORDS;
        break;
      default:
        {
          // this is a decimal-digit-pattern if it contains a decimal digit (from any unicode decimal digit group)
          var zeroCode = null;
          var mandatoryDigits = 0;
          var optionalDigits = 0;
          var groupingSeparators = [];
          var separatorPosition = 0;
          var formatCodepoints = stringToArray(primaryFormat).map(function (c) {
            return c.codePointAt(0);
          }).reverse(); // reverse the array to determine positions of grouping-separator-signs
          formatCodepoints.forEach(function (codePoint) {
            // step though each char in the picture to determine the digit group
            var digit = false;
            for (var ii = 0; ii < decimalGroups.length; ii++) {
              var group = decimalGroups[ii];
              if (codePoint >= group && codePoint <= group + 9) {
                // codepoint is part of this decimal group
                digit = true;
                mandatoryDigits++;
                separatorPosition++;
                if (zeroCode === null) {
                  zeroCode = group;
                } else if (group !== zeroCode) {
                  // error! different decimal groups in the same pattern
                  throw {
                    code: 'D3131'
                  };
                }
                break;
              }
            }
            if (!digit) {
              if (codePoint === 0x23) {
                // # - optional-digit-sign
                separatorPosition++;
                optionalDigits++;
              } else {
                // neither a decimal-digit-sign ot optional-digit-sign, assume it is a grouping-separator-sign
                groupingSeparators.push({
                  position: separatorPosition,
                  character: String.fromCodePoint(codePoint)
                });
              }
            }
          });
          if (mandatoryDigits > 0) {
            format.primary = formats.DECIMAL;
            // TODO validate decimal-digit-pattern

            // the decimal digit family (codepoint offset)
            format.zeroCode = zeroCode;
            // the number of mandatory digits
            format.mandatoryDigits = mandatoryDigits;
            // the number of optional digits
            format.optionalDigits = optionalDigits;
            // grouping separator template
            // are the grouping-separator-signs 'regular'?
            var regularRepeat = function regularRepeat(separators) {
              // are the grouping positions regular? i.e. same interval between each of them
              // is there at least one separator?
              if (separators.length === 0) {
                return 0;
              }
              // are all the characters the same?
              var sepChar = separators[0].character;
              for (var ii = 1; ii < separators.length; ii++) {
                if (separators[ii].character !== sepChar) {
                  return 0;
                }
              }
              // are they equally spaced?
              var indexes = separators.map(function (separator) {
                return separator.position;
              });
              var _gcd = function gcd(a, b) {
                return b === 0 ? a : _gcd(b, a % b);
              };
              // find the greatest common divisor of all the positions
              var factor = indexes.reduce(_gcd);
              // is every position separated by this divisor? If so, it's regular
              for (var index = 1; index <= indexes.length; index++) {
                if (indexes.indexOf(index * factor) === -1) {
                  return 0;
                }
              }
              return factor;
            };
            var regular = regularRepeat(groupingSeparators);
            if (regular > 0) {
              format.regular = true;
              format.groupingSeparators = {
                position: regular,
                character: groupingSeparators[0].character
              };
            } else {
              format.regular = false;
              format.groupingSeparators = groupingSeparators;
            }
          } else {
            // this is a 'numbering sequence' which the spec says is implementation-defined
            // this implementation doesn't support any numbering sequences at the moment.
            format.primary = formats.SEQUENCE;
            format.token = primaryFormat;
          }
        }
    }
    return format;
  }
  var defaultPresentationModifiers = {
    Y: '1',
    M: '1',
    D: '1',
    d: '1',
    F: 'n',
    W: '1',
    w: '1',
    X: '1',
    x: '1',
    H: '1',
    h: '1',
    P: 'n',
    m: '01',
    s: '01',
    f: '1',
    Z: '01:01',
    z: '01:01',
    C: 'n',
    E: 'n'
  };

  // §9.8.4.1 the format specifier is an array of string literals and variable markers
  /**
   * analyse the date-time picture string
   * @param {string} picture - picture string
   * @returns {{type: string, parts: Array}} - the analysed string
   */
  function analyseDateTimePicture(picture) {
    var spec = [];
    var format = {
      type: 'datetime',
      parts: spec
    };
    var addLiteral = function addLiteral(start, end) {
      if (end > start) {
        var literal = picture.substring(start, end);
        // replace any doubled ]] with single ]
        // what if there are instances of single ']' ? - the spec doesn't say
        literal = literal.split(']]').join(']');
        spec.push({
          type: 'literal',
          value: literal
        });
      }
    };
    var start = 0,
      pos = 0;
    while (pos < picture.length) {
      if (picture.charAt(pos) === '[') {
        // check it's not a doubled [[
        if (picture.charAt(pos + 1) === '[') {
          // literal [
          addLiteral(start, pos);
          spec.push({
            type: 'literal',
            value: '['
          });
          pos += 2;
          start = pos;
          continue;
        }
        // start of variable marker
        // push the string literal (if there is one) onto the array
        addLiteral(start, pos);
        start = pos;
        // search forward to closing ]
        pos = picture.indexOf(']', start);
        // TODO handle error case if pos === -1
        if (pos === -1) {
          // error - no closing bracket
          throw {
            code: 'D3135'
          };
        }
        var marker = picture.substring(start + 1, pos);
        // whitespace within a variable marker is ignored (i.e. remove it)
        marker = marker.split(/\s+/).join('');
        var def = {
          type: 'marker',
          component: marker.charAt(0) // 1. The component specifier is always present and is always a single letter.
        };
        var comma = marker.lastIndexOf(','); // 2. The width modifier may be recognized by the presence of a comma
        var presMod; // the presentation modifiers
        if (comma !== -1) {
          // §9.8.4.2 The Width Modifier
          var widthMod = marker.substring(comma + 1);
          var dash = widthMod.indexOf('-');
          var min = void 0,
            max = void 0;
          var parseWidth = function parseWidth(wm) {
            if (typeof wm === 'undefined' || wm === '*') {
              return undefined;
            } else {
              // TODO validate wm is an unsigned int
              return parseInt(wm);
            }
          };
          if (dash === -1) {
            min = widthMod;
          } else {
            min = widthMod.substring(0, dash);
            max = widthMod.substring(dash + 1);
          }
          var widthDef = {
            min: parseWidth(min),
            max: parseWidth(max)
          };
          def.width = widthDef;
          presMod = marker.substring(1, comma);
        } else {
          presMod = marker.substring(1);
        }
        if (presMod.length === 1) {
          def.presentation1 = presMod; // first presentation modifier
          //TODO validate the first presentation modifier - it's either N, n, Nn or it passes analyseIntegerPicture
        } else if (presMod.length > 1) {
          var lastChar = presMod.charAt(presMod.length - 1);
          if ('atco'.indexOf(lastChar) !== -1) {
            def.presentation2 = lastChar;
            if (lastChar === 'o') {
              def.ordinal = true;
            }
            // 'c' means 'cardinal' and is the default (i.e. not 'ordinal')
            // 'a' & 't' are ignored (not sure of their relevance to English numbering)
            def.presentation1 = presMod.substring(0, presMod.length - 1);
          } else {
            def.presentation1 = presMod;
            //TODO validate the first presentation modifier - it's either N, n, Nn or it passes analyseIntegerPicture,
            // doesn't use ] as grouping separator, and if grouping separator is , then must have width modifier
          }
        } else {
          // no presentation modifier specified - apply the default;
          def.presentation1 = defaultPresentationModifiers[def.component];
        }
        if (typeof def.presentation1 === 'undefined') {
          // unknown component specifier
          throw {
            code: 'D3132',
            value: def.component
          };
        }
        if (def.presentation1[0] === 'n') {
          def.names = tcase.LOWER;
        } else if (def.presentation1[0] === 'N') {
          if (def.presentation1[1] === 'n') {
            def.names = tcase.TITLE;
          } else {
            def.names = tcase.UPPER;
          }
        } else if ('YMDdFWwXxHhmsf'.indexOf(def.component) !== -1) {
          var integerPattern = def.presentation1;
          if (def.presentation2) {
            integerPattern += ';' + def.presentation2;
          }
          def.integerFormat = analyseIntegerPicture(integerPattern);
          if (def.width && def.width.min !== undefined) {
            if (def.integerFormat.mandatoryDigits < def.width.min) {
              def.integerFormat.mandatoryDigits = def.width.min;
            }
          }
          if ('YMD'.indexOf(def.component) !== -1) {
            // §9.8.4.4
            def.n = -1;
            if (def.width && def.width.max !== undefined) {
              def.n = def.width.max;
              def.integerFormat.mandatoryDigits = def.n;
            } else {
              var w = def.integerFormat.mandatoryDigits + def.integerFormat.optionalDigits;
              if (w >= 2) {
                def.n = w;
              }
            }
          }
        }
        if (def.component === 'Z' || def.component === 'z') {
          def.integerFormat = analyseIntegerPicture(def.presentation1);
        }
        spec.push(def);
        start = pos + 1;
      }
      pos++;
    }
    addLiteral(start, pos);
    return format;
  }
  var days = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var millisInADay = 1000 * 60 * 60 * 24;
  var startOfFirstWeek = function startOfFirstWeek(ym) {
    // ISO 8601 defines the first week of the year to be the week that contains the first Thursday
    // XPath F&O extends this same definition for the first week of a month
    // the week starts on a Monday - calculate the millis for the start of the first week
    // millis for given 1st Jan of that year (at 00:00 UTC)
    var jan1 = Date.UTC(ym.year, ym.month);
    var dayOfJan1 = new Date(jan1).getUTCDay();
    if (dayOfJan1 === 0) {
      dayOfJan1 = 7;
    }
    // if Jan 1 is Fri, Sat or Sun, then add the number of days (in millis) to jan1 to get the start of week 1
    return dayOfJan1 > 4 ? jan1 + (8 - dayOfJan1) * millisInADay : jan1 - (dayOfJan1 - 1) * millisInADay;
  };
  var _yearMonth = function yearMonth(year, month) {
    return {
      year: year,
      month: month,
      nextMonth: function nextMonth() {
        return month === 11 ? _yearMonth(year + 1, 0) : _yearMonth(year, month + 1);
      },
      previousMonth: function previousMonth() {
        return month === 0 ? _yearMonth(year - 1, 11) : _yearMonth(year, month - 1);
      },
      nextYear: function nextYear() {
        return _yearMonth(year + 1, month);
      },
      previousYear: function previousYear() {
        return _yearMonth(year - 1, month);
      }
    };
  };
  var deltaWeeks = function deltaWeeks(start, end) {
    return (end - start) / (millisInADay * 7) + 1;
  };
  var getDateTimeFragment = function getDateTimeFragment(date, component) {
    var componentValue;
    switch (component) {
      case 'Y':
        // year
        componentValue = date.getUTCFullYear();
        break;
      case 'M':
        // month in year
        componentValue = date.getUTCMonth() + 1;
        break;
      case 'D':
        // day in month
        componentValue = date.getUTCDate();
        break;
      case 'd':
        {
          // day in year
          // millis for given date (at 00:00 UTC)
          var today = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
          // millis for given 1st Jan of that year (at 00:00 UTC)
          var firstJan = Date.UTC(date.getUTCFullYear(), 0);
          componentValue = (today - firstJan) / millisInADay + 1;
          break;
        }
      case 'F':
        // day of week
        componentValue = date.getUTCDay();
        if (componentValue === 0) {
          // ISO 8601 defines days 1-7: Mon-Sun
          componentValue = 7;
        }
        break;
      case 'W':
        {
          // week in year
          var thisYear = _yearMonth(date.getUTCFullYear(), 0);
          var startOfWeek1 = startOfFirstWeek(thisYear);
          var _today = Date.UTC(thisYear.year, date.getUTCMonth(), date.getUTCDate());
          var week = deltaWeeks(startOfWeek1, _today);
          if (week > 52) {
            // might be first week of the following year
            var startOfFollowingYear = startOfFirstWeek(thisYear.nextYear());
            if (_today >= startOfFollowingYear) {
              week = 1;
            }
          } else if (week < 1) {
            // must be end of the previous year
            var startOfPreviousYear = startOfFirstWeek(thisYear.previousYear());
            week = deltaWeeks(startOfPreviousYear, _today);
          }
          componentValue = Math.floor(week);
          break;
        }
      case 'w':
        {
          // week in month
          var thisMonth = _yearMonth(date.getUTCFullYear(), date.getUTCMonth());
          var _startOfWeek = startOfFirstWeek(thisMonth);
          var _today2 = Date.UTC(thisMonth.year, thisMonth.month, date.getUTCDate());
          var _week = deltaWeeks(_startOfWeek, _today2);
          if (_week > 4) {
            // might be first week of the following month
            var startOfFollowingMonth = startOfFirstWeek(thisMonth.nextMonth());
            if (_today2 >= startOfFollowingMonth) {
              _week = 1;
            }
          } else if (_week < 1) {
            // must be end of the previous month
            var startOfPreviousMonth = startOfFirstWeek(thisMonth.previousMonth());
            _week = deltaWeeks(startOfPreviousMonth, _today2);
          }
          componentValue = Math.floor(_week);
          break;
        }
      case 'X':
        {
          // ISO week-numbering year
          // Extension: The F&O spec says nothing about how to access the year associated with the week-of-the-year
          // e.g. Sat 1 Jan 2005 is in the 53rd week of 2004.
          // The 'W' component specifier gives 53, but 'Y' will give 2005.
          // I propose to add 'X' as the component specifier to give the ISO week-numbering year (2004 in this example)
          var _thisYear = _yearMonth(date.getUTCFullYear(), 0);
          var startOfISOYear = startOfFirstWeek(_thisYear);
          var endOfISOYear = startOfFirstWeek(_thisYear.nextYear());
          var now = date.getTime();
          if (now < startOfISOYear) {
            componentValue = _thisYear.year - 1;
          } else if (now >= endOfISOYear) {
            componentValue = _thisYear.year + 1;
          } else {
            componentValue = _thisYear.year;
          }
          break;
        }
      case 'x':
        {
          // ISO week-numbering month
          // Extension: The F&O spec says nothing about how to access the month associated with the week-of-the-month
          // e.g. Sat 1 Jan 2005 is in the 5th week of December 2004.
          // The 'w' component specifier gives 5, but 'W' will give January and 'Y' will give 2005.
          // I propose to add 'x' as the component specifier to give the 'week-numbering' month (December in this example)
          var _thisMonth = _yearMonth(date.getUTCFullYear(), date.getUTCMonth());
          var startOfISOMonth = startOfFirstWeek(_thisMonth);
          var nextMonth = _thisMonth.nextMonth();
          var endOfISOMonth = startOfFirstWeek(nextMonth);
          var _now = date.getTime();
          if (_now < startOfISOMonth) {
            componentValue = _thisMonth.previousMonth().month + 1;
          } else if (_now >= endOfISOMonth) {
            componentValue = nextMonth.month + 1;
          } else {
            componentValue = _thisMonth.month + 1;
          }
          break;
        }
      case 'H':
        // hour in day (24 hours)
        componentValue = date.getUTCHours();
        break;
      case 'h':
        // hour in half-day (12 hours)
        componentValue = date.getUTCHours();
        componentValue = componentValue % 12;
        if (componentValue === 0) {
          componentValue = 12;
        }
        break;
      case 'P':
        // am/pm marker
        componentValue = date.getUTCHours() >= 12 ? 'pm' : 'am';
        break;
      case 'm':
        // minute in hour
        componentValue = date.getUTCMinutes();
        break;
      case 's':
        // second in minute
        componentValue = date.getUTCSeconds();
        break;
      case 'f':
        // fractional seconds
        componentValue = date.getUTCMilliseconds();
        break;
      case 'Z': // timezone
      case 'z':
        // since the date object is constructed from epoch millis, the TZ component is always be UTC.
        break;
      case 'C':
        // calendar name
        componentValue = 'ISO';
        break;
      case 'E':
        // era
        componentValue = 'ISO';
        break;
    }
    return componentValue;
  };
  var iso8601Spec = null;

  /**
   * formats the date/time as specified by the XPath fn:format-dateTime function
   * @param {number} millis - the timestamp to be formatted, in millis since the epoch
   * @param {string} picture - the picture string that specifies the format
   * @param {string} timezone - the timezone to use
   * @returns {string} - the formatted timestamp
   */
  function formatDateTime(millis, picture, timezone) {
    var offsetHours = 0;
    var offsetMinutes = 0;
    if (typeof timezone !== 'undefined') {
      // parse the hour and minute offsets
      // assume for now the format supplied is +hhmm
      var offset = parseInt(timezone);
      offsetHours = Math.floor(offset / 100);
      offsetMinutes = offset % 100;
    }
    var formatComponent = function formatComponent(date, markerSpec) {
      var componentValue = getDateTimeFragment(date, markerSpec.component);

      // §9.8.4.3 Formatting Integer-Valued Date/Time Components
      if ('YMDdFWwXxHhms'.indexOf(markerSpec.component) !== -1) {
        if (markerSpec.component === 'Y') {
          // §9.8.4.4 Formatting the Year Component
          if (markerSpec.n !== -1) {
            componentValue = componentValue % Math.pow(10, markerSpec.n);
          }
        }
        if (markerSpec.names) {
          if (markerSpec.component === 'M' || markerSpec.component === 'x') {
            componentValue = months[componentValue - 1];
          } else if (markerSpec.component === 'F') {
            componentValue = days[componentValue];
          } else {
            throw {
              code: 'D3133',
              value: markerSpec.component
            };
          }
          if (markerSpec.names === tcase.UPPER) {
            componentValue = componentValue.toUpperCase();
          } else if (markerSpec.names === tcase.LOWER) {
            componentValue = componentValue.toLowerCase();
          }
          if (markerSpec.width && componentValue.length > markerSpec.width.max) {
            componentValue = componentValue.substring(0, markerSpec.width.max);
          }
        } else {
          componentValue = _formatInteger(componentValue, markerSpec.integerFormat);
        }
      } else if (markerSpec.component === 'f') {
        // TODO §9.8.4.5 Formatting Fractional Seconds
        componentValue = _formatInteger(componentValue, markerSpec.integerFormat);
      } else if (markerSpec.component === 'Z' || markerSpec.component === 'z') {
        // §9.8.4.6 Formatting timezones
        var _offset = offsetHours * 100 + offsetMinutes;
        if (markerSpec.integerFormat.regular) {
          componentValue = _formatInteger(_offset, markerSpec.integerFormat);
        } else {
          var numDigits = markerSpec.integerFormat.mandatoryDigits;
          if (numDigits === 1 || numDigits === 2) {
            componentValue = _formatInteger(offsetHours, markerSpec.integerFormat);
            if (offsetMinutes !== 0) {
              componentValue += ':' + formatInteger(offsetMinutes, '00');
            }
          } else if (numDigits === 3 || numDigits === 4) {
            componentValue = _formatInteger(_offset, markerSpec.integerFormat);
          } else {
            throw {
              code: 'D3134',
              value: numDigits
            };
          }
        }
        if (_offset >= 0) {
          componentValue = '+' + componentValue;
        }
        if (markerSpec.component === 'z') {
          componentValue = 'GMT' + componentValue;
        }
        if (_offset === 0 && markerSpec.presentation2 === 't') {
          componentValue = 'Z';
        }
      } else if (markerSpec.component === 'P') {
        // §9.8.4.7 Formatting Other Components
        // Formatting P for am/pm
        // getDateTimeFragment() always returns am/pm lower case so check for UPPER here
        if (markerSpec.names === tcase.UPPER) {
          componentValue = componentValue.toUpperCase();
        }
      }
      return componentValue;
    };
    var formatSpec;
    if (typeof picture === 'undefined') {
      // default to ISO 8601 format
      if (iso8601Spec === null) {
        iso8601Spec = analyseDateTimePicture('[Y0001]-[M01]-[D01]T[H01]:[m01]:[s01].[f001][Z01:01t]');
      }
      formatSpec = iso8601Spec;
    } else {
      formatSpec = analyseDateTimePicture(picture);
    }
    var offsetMillis = (60 * offsetHours + offsetMinutes) * 60 * 1000;
    var dateTime = new Date(millis + offsetMillis);
    var result = '';
    formatSpec.parts.forEach(function (part) {
      if (part.type === 'literal') {
        result += part.value;
      } else {
        result += formatComponent(dateTime, part);
      }
    });
    return result;
  }

  /**
   * Generate a regex to parse integers or timestamps
   * @param {object} formatSpec - object representing the format
   * @returns {object} - regex
   */
  function generateRegex(formatSpec) {
    var matcher = {};
    if (formatSpec.type === 'datetime') {
      matcher.type = 'datetime';
      matcher.parts = formatSpec.parts.map(function (part) {
        var res = {};
        if (part.type === 'literal') {
          res.regex = part.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        } else if (part.component === 'Z' || part.component === 'z') {
          // timezone
          var separator;
          if (!Array.isArray(part.integerFormat.groupingSeparators)) {
            separator = part.integerFormat.groupingSeparators;
          }
          res.regex = '';
          if (part.component === 'z') {
            res.regex = 'GMT';
          }
          res.regex += '[-+][0-9]+';
          if (separator) {
            res.regex += separator.character + '[0-9]+';
          }
          res.parse = function (value) {
            if (part.component === 'z') {
              value = value.substring(3); // remove the leading GMT
            }
            var offsetHours = 0,
              offsetMinutes = 0;
            if (separator) {
              offsetHours = Number.parseInt(value.substring(0, value.indexOf(separator.character)));
              offsetMinutes = Number.parseInt(value.substring(value.indexOf(separator.character) + 1));
            } else {
              // depends on number of digits
              var numdigits = value.length - 1;
              if (numdigits <= 2) {
                // just hour offset
                offsetHours = Number.parseInt(value);
              } else {
                offsetHours = Number.parseInt(value.substring(0, 3));
                offsetMinutes = Number.parseInt(value.substring(3));
              }
            }
            return offsetHours * 60 + offsetMinutes;
          };
        } else if (part.integerFormat) {
          part.integerFormat.n = part.n;
          res = generateRegex(part.integerFormat);
        } else {
          // must be a month or day name
          res.regex = '[a-zA-Z]+';
          var lookup = {};
          if (part.component === 'M' || part.component === 'x') {
            // months
            months.forEach(function (name, index) {
              if (part.width && part.width.max) {
                lookup[name.substring(0, part.width.max)] = index + 1;
              } else {
                lookup[name] = index + 1;
              }
            });
          } else if (part.component === 'F') {
            // days
            days.forEach(function (name, index) {
              if (index > 0) {
                if (part.width && part.width.max) {
                  lookup[name.substring(0, part.width.max)] = index;
                } else {
                  lookup[name] = index;
                }
              }
            });
          } else if (part.component === 'P') {
            lookup = {
              'am': 0,
              'AM': 0,
              'pm': 1,
              'PM': 1
            };
          } else {
            // unsupported 'name' option for this component
            throw {
              code: 'D3133',
              value: part.component
            };
          }
          res.parse = function (value) {
            return lookup[value];
          };
        }
        res.component = part.component;
        return res;
      });
    } else {
      // type === 'integer'
      matcher.type = 'integer';
      var isUpper = formatSpec["case"] === tcase.UPPER;
      var occurrences;
      if (formatSpec.n && formatSpec.n > 0) {
        if (formatSpec.optionalDigits === 0) {
          occurrences = "{".concat(formatSpec.n, "}");
        } else {
          occurrences = "{".concat(formatSpec.n - formatSpec.optionalDigits, ",").concat(formatSpec.n, "}");
        }
      } else {
        occurrences = '+';
      }
      switch (formatSpec.primary) {
        case formats.LETTERS:
          matcher.regex = isUpper ? '[A-Z]+' : '[a-z]+';
          matcher.parse = function (value) {
            return lettersToDecimal(value, isUpper ? 'A' : 'a');
          };
          break;
        case formats.ROMAN:
          matcher.regex = isUpper ? '[MDCLXVI]+' : '[mdclxvi]+';
          matcher.parse = function (value) {
            return romanToDecimal(isUpper ? value : value.toUpperCase());
          };
          break;
        case formats.WORDS:
          matcher.regex = '(?:' + Object.keys(wordValues).concat('and', '[\\-, ]').join('|') + ')+';
          matcher.parse = function (value) {
            return wordsToNumber(value.toLowerCase());
          };
          break;
        case formats.DECIMAL:
          matcher.regex = "[0-9]".concat(occurrences);
          if (formatSpec.ordinal) {
            // ordinals
            matcher.regex += '(?:th|st|nd|rd)';
          }
          matcher.parse = function (value) {
            var digits = value;
            if (formatSpec.ordinal) {
              // strip off the suffix
              digits = value.substring(0, value.length - 2);
            }
            // strip out the separators
            if (formatSpec.regular) {
              digits = digits.split(',').join('');
            } else {
              formatSpec.groupingSeparators.forEach(function (sep) {
                digits = digits.split(sep.character).join('');
              });
            }
            if (formatSpec.zeroCode !== 0x30) {
              // apply offset
              digits = digits.split('').map(function (_char) {
                return String.fromCodePoint(_char.codePointAt(0) - formatSpec.zeroCode + 0x30);
              }).join('');
            }
            return parseInt(digits);
          };
          break;
        case formats.SEQUENCE:
          throw {
            code: 'D3130',
            value: formatSpec.token
          };
      }
    }
    return matcher;
  }

  /**
   * parse a string containing an integer as specified by the picture string
   * @param {string} value - the string to parse
   * @param {string} picture - the picture string
   * @returns {number} - the parsed number
   */
  function parseInteger(value, picture) {
    if (typeof value === 'undefined') {
      return undefined;
    }
    var formatSpec = analyseIntegerPicture(picture);
    var matchSpec = generateRegex(formatSpec);
    //const fullRegex = '^' + matchSpec.regex + '$';
    //const matcher = new RegExp(fullRegex);
    // TODO validate input based on the matcher regex
    var result = matchSpec.parse(value);
    return result;
  }

  /**
   * parse a string containing a timestamp as specified by the picture string
   * @param {string} timestamp - the string to parse
   * @param {string} picture - the picture string
   * @returns {number} - the parsed timestamp in millis since the epoch
   */
  function parseDateTime(timestamp, picture) {
    var formatSpec = analyseDateTimePicture(picture);
    var matchSpec = generateRegex(formatSpec);
    var fullRegex = '^' + matchSpec.parts.map(function (part) {
      return '(' + part.regex + ')';
    }).join('') + '$';
    var matcher = new RegExp(fullRegex, 'i'); // TODO can cache this against the picture
    var info = matcher.exec(timestamp);
    if (info !== null) {
      // validate what we've just parsed - do we have enough information to create a timestamp?
      // rules:
      // The date is specified by one of:
      //    {Y, M, D}    (dateA)
      // or {Y, d}       (dateB)
      // or {Y, x, w, F} (dateC)
      // or {X, W, F}    (dateD)
      // The time is specified by one of:
      //    {H, m, s, f}    (timeA)
      // or {P, h, m, s, f} (timeB)
      // All sets can have an optional Z
      // To create a timestamp (epoch millis) we need both date and time, but we can default missing
      // information according to the following rules:
      // - line up one combination of the above from date, and one from time, most significant value (MSV) to least significant (LSV
      // - for the values that have been captured, if there are any gaps between MSV and LSV, then throw an error
      //     (e.g.) if hour and seconds, but not minutes is given - throw
      //     (e.g.) if month, hour and minutes, but not day-of-month is given - throw
      // - anything right of the LSV should be defaulted to zero
      //     (e.g.) if hour and minutes given, default seconds and fractional seconds to zero
      //     (e.g.) if date only given, default the time to 0:00:00.000 (midnight)
      // - anything left of the MSV should be defaulted to the value of that component returned by $now()
      //     (e.g.) if time only given, default the date to today
      //     (e.g.) if month and date given, default to this year (and midnight, by previous rule)
      //   -- default values for X, x, W, w, F will be derived from the values returned by $now()

      // implement the above rules
      // determine which of the above date/time combinations we have by using bit masks

      //        Y X M x W w d D F P H h m s f Z
      // dateA  1 0 1 0 0 0 0 1 ?                     0 - must not appear
      // dateB  1 0 0 0 0 0 1 0 ?                     1 - can appear - relevant
      // dateC  0 1 0 1 0 1 0 0 1                     ? - can appear - ignored
      // dateD  0 1 0 0 1 0 0 0 1
      // timeA                    0 1 0 1 1 1
      // timeB                    1 0 1 1 1 1

      // create bitmasks based on the above
      //    date mask             YXMxWwdD
      var dmA = 161; // binary 10100001
      var dmB = 130; // binary 10000010
      var dmC = 84; // binary 01010100
      var dmD = 72; // binary 01001000
      //    time mask             PHhmsf
      var tmA = 23; // binary 010111
      var tmB = 47; // binary 101111

      var components = {};
      for (var i = 1; i < info.length; i++) {
        var mpart = matchSpec.parts[i - 1];
        if (mpart.parse) {
          components[mpart.component] = mpart.parse(info[i]);
        }
      }
      if (Object.getOwnPropertyNames(components).length === 0) {
        // nothing specified
        return undefined;
      }
      var mask = 0;
      var shift = function shift(bit) {
        mask <<= 1;
        mask += bit ? 1 : 0;
      };
      var isType = function isType(type) {
        // shouldn't match any 0's, must match at least one 1
        return !(~type & mask) && !!(type & mask);
      };
      'YXMxWwdD'.split('').forEach(function (part) {
        return shift(components[part]);
      });
      var dateA = isType(dmA);
      var dateB = !dateA && isType(dmB);
      var dateC = isType(dmC);
      var dateD = !dateC && isType(dmD);
      mask = 0;
      'PHhmsf'.split('').forEach(function (part) {
        return shift(components[part]);
      });
      var timeA = isType(tmA);
      var timeB = !timeA && isType(tmB);

      // should only be zero or one date type and zero or one time type

      var dateComps = dateB ? 'YD' : dateC ? 'XxwF' : dateD ? 'XWF' : 'YMD';
      var timeComps = timeB ? 'Phmsf' : 'Hmsf';
      var comps = dateComps + timeComps;

      // step through the candidate parts from most significant to least significant
      // default the most significant unspecified parts to current timestamp component
      // default the least significant unspecified parts to zero
      // if any gaps in between the specified parts, throw an error

      var now = this.environment.timestamp; // must get the fixed timestamp from jsonata

      var startSpecified = false;
      var endSpecified = false;
      comps.split('').forEach(function (part) {
        if (typeof components[part] === 'undefined') {
          if (startSpecified) {
            // past the specified block - default to zero
            components[part] = 'MDd'.indexOf(part) !== -1 ? 1 : 0;
            endSpecified = true;
          } else {
            // haven't hit the specified block yet, default to current timestamp
            components[part] = getDateTimeFragment(now, part);
          }
        } else {
          startSpecified = true;
          if (endSpecified) {
            throw {
              code: 'D3136'
            };
          }
        }
      });

      // validate and fill in components
      if (components.M > 0) {
        components.M -= 1; // Date.UTC requires a zero-indexed month
      } else {
        components.M = 0; // default to January
      }
      if (dateB) {
        // millis for given 1st Jan of that year (at 00:00 UTC)
        var firstJan = Date.UTC(components.Y, 0);
        var offsetMillis = (components.d - 1) * 1000 * 60 * 60 * 24;
        var derivedDate = new Date(firstJan + offsetMillis);
        components.M = derivedDate.getUTCMonth();
        components.D = derivedDate.getUTCDate();
      }
      if (dateC) {
        // TODO implement this
        // parsing this format not currently supported
        throw {
          code: 'D3136'
        };
      }
      if (dateD) {
        // TODO implement this
        // parsing this format (ISO week date) not currently supported
        throw {
          code: 'D3136'
        };
      }
      if (timeB) {
        // 12hr to 24hr
        components.H = components.h === 12 ? 0 : components.h;
        if (components.P === 1) {
          components.H += 12;
        }
      }
      var millis = Date.UTC(components.Y, components.M, components.D, components.H, components.m, components.s, components.f);
      if (components.Z || components.z) {
        // adjust for timezone
        millis -= (components.Z || components.z) * 60 * 1000;
      }
      return millis;
    }
  }

  // Regular expression to match an ISO 8601 formatted timestamp
  var iso8601regex = new RegExp('^\\d{4}(-[01]\\d)*(-[0-3]\\d)*(T[0-2]\\d:[0-5]\\d:[0-5]\\d)*(\\.\\d+)?([+-][0-2]\\d:?[0-5]\\d|Z)?$');

  /**
   * Converts an ISO 8601 timestamp to milliseconds since the epoch
   *
   * @param {string} timestamp - the timestamp to be converted
   * @param {string} [picture] - the picture string defining the format of the timestamp (defaults to ISO 8601)
   * @returns {Number} - milliseconds since the epoch
   */
  function toMillis(timestamp, picture) {
    // undefined inputs always return undefined
    if (typeof timestamp === 'undefined') {
      return undefined;
    }
    if (typeof picture === 'undefined') {
      if (!iso8601regex.test(timestamp)) {
        throw {
          stack: new Error().stack,
          code: "D3110",
          value: timestamp
        };
      }
      return Date.parse(timestamp);
    } else {
      return parseDateTime.call(this, timestamp, picture);
    }
  }

  /**
   * Converts milliseconds since the epoch to an ISO 8601 timestamp
   * @param {Number} millis - milliseconds since the epoch to be converted
   * @param {string} [picture] - the picture string defining the format of the timestamp (defaults to ISO 8601)
   * @param {string} [timezone] - the timezone to format the timestamp in (defaults to UTC)
   * @returns {String} - the formatted timestamp
   */
  function fromMillis(millis, picture, timezone) {
    // undefined inputs always return undefined
    if (typeof millis === 'undefined') {
      return undefined;
    }
    return formatDateTime.call(this, millis, picture, timezone);
  }
  return {
    formatInteger: formatInteger,
    parseInteger: parseInteger,
    fromMillis: fromMillis,
    toMillis: toMillis
  };
}();
module.exports = dateTime;
},{"./utils":6}],2:[function(require,module,exports){
(function (global){(function (){
"use strict";

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/**
 * © Copyright IBM Corp. 2016, 2018 All Rights Reserved
 *   Project name: JSONata
 *   This project is licensed under the MIT License, see LICENSE
 */

var utils = require('./utils');
var functions = function () {
  'use strict';

  var isNumeric = utils.isNumeric;
  var isArrayOfStrings = utils.isArrayOfStrings;
  var isArrayOfNumbers = utils.isArrayOfNumbers;
  var createSequence = utils.createSequence;
  var isSequence = utils.isSequence;
  var isFunction = utils.isFunction;
  var isLambda = utils.isLambda;
  var isPromise = utils.isPromise;
  var getFunctionArity = utils.getFunctionArity;
  var deepEquals = utils.isDeepEqual;
  var stringToArray = utils.stringToArray;

  /**
   * Sum function
   * @param {Object} args - Arguments
   * @returns {number} Total value of arguments
   */
  function sum(args) {
    // undefined inputs always return undefined
    if (typeof args === 'undefined') {
      return undefined;
    }
    var total = 0;
    args.forEach(function (num) {
      total += num;
    });
    return total;
  }

  /**
   * Count function
   * @param {Object} args - Arguments
   * @returns {number} Number of elements in the array
   */
  function count(args) {
    // undefined inputs always return undefined
    if (typeof args === 'undefined') {
      return 0;
    }
    return args.length;
  }

  /**
   * Max function
   * @param {Object} args - Arguments
   * @returns {number} Max element in the array
   */
  function max(args) {
    // undefined inputs always return undefined
    if (typeof args === 'undefined' || args.length === 0) {
      return undefined;
    }
    return Math.max.apply(Math, args);
  }

  /**
   * Min function
   * @param {Object} args - Arguments
   * @returns {number} Min element in the array
   */
  function min(args) {
    // undefined inputs always return undefined
    if (typeof args === 'undefined' || args.length === 0) {
      return undefined;
    }
    return Math.min.apply(Math, args);
  }

  /**
   * Average function
   * @param {Object} args - Arguments
   * @returns {number} Average element in the array
   */
  function average(args) {
    // undefined inputs always return undefined
    if (typeof args === 'undefined' || args.length === 0) {
      return undefined;
    }
    var total = 0;
    args.forEach(function (num) {
      total += num;
    });
    return total / args.length;
  }

  /**
   * Stringify arguments
   * @param {Object} arg - Arguments
   * @param {boolean} [prettify] - Pretty print the result
   * @returns {String} String from arguments
   */
  function string(arg) {
    var prettify = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    // undefined inputs always return undefined
    if (typeof arg === 'undefined') {
      return undefined;
    }
    var str;
    if (typeof arg === 'string') {
      // already a string
      str = arg;
    } else if (isFunction(arg)) {
      // functions (built-in and lambda convert to empty string
      str = '';
    } else if (typeof arg === 'number' && !isFinite(arg)) {
      throw {
        code: "D3001",
        value: arg,
        stack: new Error().stack
      };
    } else {
      var space = prettify ? 2 : 0;
      if (Array.isArray(arg) && arg.outerWrapper) {
        arg = arg[0];
      }
      str = JSON.stringify(arg, function (key, val) {
        return typeof val !== 'undefined' && val !== null && val.toPrecision && isNumeric(val) ? Number(val.toPrecision(15)) : val && isFunction(val) ? '' : val;
      }, space);
    }
    return str;
  }

  /**
   * Create substring based on character number and length
   * @param {String} str - String to evaluate
   * @param {Integer} start - Character number to start substring
   * @param {Integer} [length] - Number of characters in substring
   * @returns {string|*} Substring
   */
  function substring(str, start, length) {
    // undefined inputs always return undefined
    if (typeof str === 'undefined') {
      return undefined;
    }
    var strArray = stringToArray(str);
    var strLength = strArray.length;
    if (strLength + start < 0) {
      start = 0;
    }
    if (typeof length !== 'undefined') {
      if (length <= 0) {
        return '';
      }
      var end = start >= 0 ? start + length : strLength + start + length;
      return strArray.slice(start, end).join('');
    }
    return strArray.slice(start).join('');
  }

  /**
   * Create substring up until a character
   * @param {String} str - String to evaluate
   * @param {String} chars - Character to define substring boundary
   * @returns {*} Substring
   */
  function substringBefore(str, chars) {
    // undefined inputs always return undefined
    if (typeof str === 'undefined') {
      return undefined;
    }
    var pos = str.indexOf(chars);
    if (pos > -1) {
      return str.substr(0, pos);
    } else {
      return str;
    }
  }

  /**
   * Create substring after a character
   * @param {String} str - String to evaluate
   * @param {String} chars - Character to define substring boundary
   * @returns {*} Substring
   */
  function substringAfter(str, chars) {
    // undefined inputs always return undefined
    if (typeof str === 'undefined') {
      return undefined;
    }
    var pos = str.indexOf(chars);
    if (pos > -1) {
      return str.substr(pos + chars.length);
    } else {
      return str;
    }
  }

  /**
   * Lowercase a string
   * @param {String} str - String to evaluate
   * @returns {string} Lowercase string
   */
  function lowercase(str) {
    // undefined inputs always return undefined
    if (typeof str === 'undefined') {
      return undefined;
    }
    return str.toLowerCase();
  }

  /**
   * Uppercase a string
   * @param {String} str - String to evaluate
   * @returns {string} Uppercase string
   */
  function uppercase(str) {
    // undefined inputs always return undefined
    if (typeof str === 'undefined') {
      return undefined;
    }
    return str.toUpperCase();
  }

  /**
   * length of a string
   * @param {String} str - string
   * @returns {Number} The number of characters in the string
   */
  function length(str) {
    // undefined inputs always return undefined
    if (typeof str === 'undefined') {
      return undefined;
    }
    return stringToArray(str).length;
  }

  /**
   * Normalize and trim whitespace within a string
   * @param {string} str - string to be trimmed
   * @returns {string} - trimmed string
   */
  function trim(str) {
    // undefined inputs always return undefined
    if (typeof str === 'undefined') {
      return undefined;
    }

    // normalize whitespace
    var result = str.replace(/[ \t\n\r]+/gm, ' ');
    if (result.charAt(0) === ' ') {
      // strip leading space
      result = result.substring(1);
    }
    if (result.charAt(result.length - 1) === ' ') {
      // strip trailing space
      result = result.substring(0, result.length - 1);
    }
    return result;
  }

  /**
   * Pad a string to a minimum width by adding characters to the start or end
   * @param {string} str - string to be padded
   * @param {number} width - the minimum width; +ve pads to the right, -ve pads to the left
   * @param {string} [char] - the pad character(s); defaults to ' '
   * @returns {string} - padded string
   */
  function pad(str, width, _char) {
    // undefined inputs always return undefined
    if (typeof str === 'undefined') {
      return undefined;
    }
    if (typeof _char === 'undefined' || _char.length === 0) {
      _char = ' ';
    }
    var result;
    var padLength = Math.abs(width) - length(str);
    if (padLength > 0) {
      var padding = new Array(padLength + 1).join(_char);
      if (_char.length > 1) {
        padding = substring(padding, 0, padLength);
      }
      if (width > 0) {
        result = str + padding;
      } else {
        result = padding + str;
      }
    } else {
      result = str;
    }
    return result;
  }

  /**
   * Evaluate the matcher function against the str arg
   *
   * @param {*} matcher - matching function (native or lambda)
   * @param {string} str - the string to match against
   * @returns {object} - structure that represents the match(es)
   */
  function evaluateMatcher(_x, _x2) {
    return _evaluateMatcher.apply(this, arguments);
  }
  /**
   * Tests if the str contains the token
   * @param {String} str - string to test
   * @param {String} token - substring or regex to find
   * @returns {Boolean} - true if str contains token
   */
  function _evaluateMatcher() {
    _evaluateMatcher = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(matcher, str) {
      var result;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            result = matcher.apply(this, [str]); // eslint-disable-line no-useless-call
            if (!isPromise(result)) {
              _context.next = 5;
              break;
            }
            _context.next = 4;
            return result;
          case 4:
            result = _context.sent;
          case 5:
            if (!(result && !(typeof result.start === 'number' || result.end === 'number' || Array.isArray(result.groups) || isFunction(result.next)))) {
              _context.next = 7;
              break;
            }
            throw {
              code: "T1010",
              stack: new Error().stack
            };
          case 7:
            return _context.abrupt("return", result);
          case 8:
          case "end":
            return _context.stop();
        }
      }, _callee, this);
    }));
    return _evaluateMatcher.apply(this, arguments);
  }
  function contains(_x3, _x4) {
    return _contains.apply(this, arguments);
  }
  /**
   * Match a string with a regex returning an array of object containing details of each match
   * @param {String} str - string
   * @param {String} regex - the regex applied to the string
   * @param {Integer} [limit] - max number of matches to return
   * @returns {Array} The array of match objects
   */
  function _contains() {
    _contains = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(str, token) {
      var result, matches;
      return _regeneratorRuntime().wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            if (!(typeof str === 'undefined')) {
              _context2.next = 2;
              break;
            }
            return _context2.abrupt("return", undefined);
          case 2:
            if (!(typeof token === 'string')) {
              _context2.next = 6;
              break;
            }
            result = str.indexOf(token) !== -1;
            _context2.next = 10;
            break;
          case 6:
            _context2.next = 8;
            return evaluateMatcher(token, str);
          case 8:
            matches = _context2.sent;
            result = typeof matches !== 'undefined';
          case 10:
            return _context2.abrupt("return", result);
          case 11:
          case "end":
            return _context2.stop();
        }
      }, _callee2);
    }));
    return _contains.apply(this, arguments);
  }
  function match(_x5, _x6, _x7) {
    return _match.apply(this, arguments);
  }
  /**
   * Match a string with a regex returning an array of object containing details of each match
   * @param {String} str - string
   * @param {String} pattern - the substring/regex applied to the string
   * @param {String} replacement - text to replace the matched substrings
   * @param {Integer} [limit] - max number of matches to return
   * @returns {Array} The array of match objects
   */
  function _match() {
    _match = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(str, regex, limit) {
      var result, count, matches;
      return _regeneratorRuntime().wrap(function _callee3$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            if (!(typeof str === 'undefined')) {
              _context3.next = 2;
              break;
            }
            return _context3.abrupt("return", undefined);
          case 2:
            if (!(limit < 0)) {
              _context3.next = 4;
              break;
            }
            throw {
              stack: new Error().stack,
              value: limit,
              code: 'D3040',
              index: 3
            };
          case 4:
            result = createSequence();
            if (!(typeof limit === 'undefined' || limit > 0)) {
              _context3.next = 19;
              break;
            }
            count = 0;
            _context3.next = 9;
            return evaluateMatcher(regex, str);
          case 9:
            matches = _context3.sent;
            if (!(typeof matches !== 'undefined')) {
              _context3.next = 19;
              break;
            }
          case 11:
            if (!(typeof matches !== 'undefined' && (typeof limit === 'undefined' || count < limit))) {
              _context3.next = 19;
              break;
            }
            result.push({
              match: matches.match,
              index: matches.start,
              groups: matches.groups
            });
            _context3.next = 15;
            return evaluateMatcher(matches.next);
          case 15:
            matches = _context3.sent;
            count++;
            _context3.next = 11;
            break;
          case 19:
            return _context3.abrupt("return", result);
          case 20:
          case "end":
            return _context3.stop();
        }
      }, _callee3);
    }));
    return _match.apply(this, arguments);
  }
  function replace(_x8, _x9, _x10, _x11) {
    return _replace.apply(this, arguments);
  }
  /**
   * Base64 encode a string
   * @param {String} str - string
   * @returns {String} Base 64 encoding of the binary data
   */
  function _replace() {
    _replace = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4(str, pattern, replacement, limit) {
      var self, replacer, result, position, count, index, matches, replacedWith;
      return _regeneratorRuntime().wrap(function _callee4$(_context4) {
        while (1) switch (_context4.prev = _context4.next) {
          case 0:
            if (!(typeof str === 'undefined')) {
              _context4.next = 2;
              break;
            }
            return _context4.abrupt("return", undefined);
          case 2:
            self = this; // pattern cannot be an empty string
            if (!(pattern === '')) {
              _context4.next = 5;
              break;
            }
            throw {
              code: "D3010",
              stack: new Error().stack,
              value: pattern,
              index: 2
            };
          case 5:
            if (!(limit < 0)) {
              _context4.next = 7;
              break;
            }
            throw {
              code: "D3011",
              stack: new Error().stack,
              value: limit,
              index: 4
            };
          case 7:
            if (typeof replacement === 'string') {
              replacer = function replacer(regexMatch) {
                var substitute = '';
                // scan forward, copying the replacement text into the substitute string
                // and replace any occurrence of $n with the values matched by the regex
                var position = 0;
                var index = replacement.indexOf('$', position);
                while (index !== -1 && position < replacement.length) {
                  substitute += replacement.substring(position, index);
                  position = index + 1;
                  var dollarVal = replacement.charAt(position);
                  if (dollarVal === '$') {
                    // literal $
                    substitute += '$';
                    position++;
                  } else if (dollarVal === '0') {
                    substitute += regexMatch.match;
                    position++;
                  } else {
                    var maxDigits;
                    if (regexMatch.groups.length === 0) {
                      // no sub-matches; any $ followed by a digit will be replaced by an empty string
                      maxDigits = 1;
                    } else {
                      // max number of digits to parse following the $
                      maxDigits = Math.floor(Math.log(regexMatch.groups.length) * Math.LOG10E) + 1;
                    }
                    index = parseInt(replacement.substring(position, position + maxDigits), 10);
                    if (maxDigits > 1 && index > regexMatch.groups.length) {
                      index = parseInt(replacement.substring(position, position + maxDigits - 1), 10);
                    }
                    if (!isNaN(index)) {
                      if (regexMatch.groups.length > 0) {
                        var submatch = regexMatch.groups[index - 1];
                        if (typeof submatch !== 'undefined') {
                          substitute += submatch;
                        }
                      }
                      position += index.toString().length;
                    } else {
                      // not a capture group, treat the $ as literal
                      substitute += '$';
                    }
                  }
                  index = replacement.indexOf('$', position);
                }
                substitute += replacement.substring(position);
                return substitute;
              };
            } else {
              replacer = replacement;
            }
            result = '';
            position = 0;
            if (!(typeof limit === 'undefined' || limit > 0)) {
              _context4.next = 47;
              break;
            }
            count = 0;
            if (!(typeof pattern === 'string')) {
              _context4.next = 18;
              break;
            }
            index = str.indexOf(pattern, position);
            while (index !== -1 && (typeof limit === 'undefined' || count < limit)) {
              result += str.substring(position, index);
              result += replacement;
              position = index + pattern.length;
              count++;
              index = str.indexOf(pattern, position);
            }
            result += str.substring(position);
            _context4.next = 45;
            break;
          case 18:
            _context4.next = 20;
            return evaluateMatcher(pattern, str);
          case 20:
            matches = _context4.sent;
            if (!(typeof matches !== 'undefined')) {
              _context4.next = 44;
              break;
            }
          case 22:
            if (!(typeof matches !== 'undefined' && (typeof limit === 'undefined' || count < limit))) {
              _context4.next = 41;
              break;
            }
            result += str.substring(position, matches.start);
            replacedWith = replacer.apply(self, [matches]);
            if (!isPromise(replacedWith)) {
              _context4.next = 29;
              break;
            }
            _context4.next = 28;
            return replacedWith;
          case 28:
            replacedWith = _context4.sent;
          case 29:
            if (!(typeof replacedWith === 'string')) {
              _context4.next = 33;
              break;
            }
            result += replacedWith;
            _context4.next = 34;
            break;
          case 33:
            throw {
              code: "D3012",
              stack: new Error().stack,
              value: replacedWith
            };
          case 34:
            position = matches.start + matches.match.length;
            count++;
            _context4.next = 38;
            return evaluateMatcher(matches.next);
          case 38:
            matches = _context4.sent;
            _context4.next = 22;
            break;
          case 41:
            result += str.substring(position);
            _context4.next = 45;
            break;
          case 44:
            result = str;
          case 45:
            _context4.next = 48;
            break;
          case 47:
            result = str;
          case 48:
            return _context4.abrupt("return", result);
          case 49:
          case "end":
            return _context4.stop();
        }
      }, _callee4, this);
    }));
    return _replace.apply(this, arguments);
  }
  function base64encode(str) {
    // undefined inputs always return undefined
    if (typeof str === 'undefined') {
      return undefined;
    }
    // Use btoa in a browser, or Buffer in Node.js

    var btoa = typeof window !== 'undefined' ? /* istanbul ignore next */window.btoa : function (str) {
      // Simply doing `new Buffer` at this point causes Browserify to pull
      // in the entire Buffer browser library, which is large and unnecessary.
      // Using `global.Buffer` defeats this.
      return new global.Buffer.from(str, 'binary').toString('base64'); // eslint-disable-line new-cap
    };
    return btoa(str);
  }

  /**
   * Base64 decode a string
   * @param {String} str - string
   * @returns {String} Base 64 encoding of the binary data
   */
  function base64decode(str) {
    // undefined inputs always return undefined
    if (typeof str === 'undefined') {
      return undefined;
    }
    // Use btoa in a browser, or Buffer in Node.js
    var atob = typeof window !== 'undefined' ? /* istanbul ignore next */window.atob : function (str) {
      // Simply doing `new Buffer` at this point causes Browserify to pull
      // in the entire Buffer browser library, which is large and unnecessary.
      // Using `global.Buffer` defeats this.
      return new global.Buffer.from(str, 'base64').toString('binary'); // eslint-disable-line new-cap
    };
    return atob(str);
  }

  /**
   * Encode a string into a component for a url
   * @param {String} str - String to encode
   * @returns {string} Encoded string
   */
  function encodeUrlComponent(str) {
    // undefined inputs always return undefined
    if (typeof str === 'undefined') {
      return undefined;
    }

    // Catch URIErrors when URI sequence is malformed
    var returnVal;
    try {
      returnVal = encodeURIComponent(str);
    } catch (e) {
      throw {
        code: "D3140",
        stack: new Error().stack,
        value: str,
        functionName: "encodeUrlComponent"
      };
    }
    return returnVal;
  }

  /**
   * Encode a string into a url
   * @param {String} str - String to encode
   * @returns {string} Encoded string
   */
  function encodeUrl(str) {
    // undefined inputs always return undefined
    if (typeof str === 'undefined') {
      return undefined;
    }

    // Catch URIErrors when URI sequence is malformed
    var returnVal;
    try {
      returnVal = encodeURI(str);
    } catch (e) {
      throw {
        code: "D3140",
        stack: new Error().stack,
        value: str,
        functionName: "encodeUrl"
      };
    }
    return returnVal;
  }

  /**
   * Decode a string from a component for a url
   * @param {String} str - String to decode
   * @returns {string} Decoded string
   */
  function decodeUrlComponent(str) {
    // undefined inputs always return undefined
    if (typeof str === 'undefined') {
      return undefined;
    }

    // Catch URIErrors when URI sequence is malformed
    var returnVal;
    try {
      returnVal = decodeURIComponent(str);
    } catch (e) {
      throw {
        code: "D3140",
        stack: new Error().stack,
        value: str,
        functionName: "decodeUrlComponent"
      };
    }
    return returnVal;
  }

  /**
   * Decode a string from a url
   * @param {String} str - String to decode
   * @returns {string} Decoded string
   */
  function decodeUrl(str) {
    // undefined inputs always return undefined
    if (typeof str === 'undefined') {
      return undefined;
    }

    // Catch URIErrors when URI sequence is malformed
    var returnVal;
    try {
      returnVal = decodeURI(str);
    } catch (e) {
      throw {
        code: "D3140",
        stack: new Error().stack,
        value: str,
        functionName: "decodeUrl"
      };
    }
    return returnVal;
  }

  /**
   * Split a string into an array of substrings
   * @param {String} str - string
   * @param {String} separator - the token or regex that splits the string
   * @param {Integer} [limit] - max number of substrings
   * @returns {Array} The array of string
   */
  function split(_x12, _x13, _x14) {
    return _split.apply(this, arguments);
  }
  /**
   * Join an array of strings
   * @param {Array} strs - array of string
   * @param {String} [separator] - the token that splits the string
   * @returns {String} The concatenated string
   */
  function _split() {
    _split = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5(str, separator, limit) {
      var result, count, matches, start;
      return _regeneratorRuntime().wrap(function _callee5$(_context5) {
        while (1) switch (_context5.prev = _context5.next) {
          case 0:
            if (!(typeof str === 'undefined')) {
              _context5.next = 2;
              break;
            }
            return _context5.abrupt("return", undefined);
          case 2:
            if (!(limit < 0)) {
              _context5.next = 4;
              break;
            }
            throw {
              code: "D3020",
              stack: new Error().stack,
              value: limit,
              index: 3
            };
          case 4:
            result = [];
            if (!(typeof limit === 'undefined' || limit > 0)) {
              _context5.next = 29;
              break;
            }
            if (!(typeof separator === 'string')) {
              _context5.next = 10;
              break;
            }
            result = str.split(separator, limit);
            _context5.next = 29;
            break;
          case 10:
            count = 0;
            _context5.next = 13;
            return evaluateMatcher(separator, str);
          case 13:
            matches = _context5.sent;
            if (!(typeof matches !== 'undefined')) {
              _context5.next = 28;
              break;
            }
            start = 0;
          case 16:
            if (!(typeof matches !== 'undefined' && (typeof limit === 'undefined' || count < limit))) {
              _context5.next = 25;
              break;
            }
            result.push(str.substring(start, matches.start));
            start = matches.end;
            _context5.next = 21;
            return evaluateMatcher(matches.next);
          case 21:
            matches = _context5.sent;
            count++;
            _context5.next = 16;
            break;
          case 25:
            if (typeof limit === 'undefined' || count < limit) {
              result.push(str.substring(start));
            }
            _context5.next = 29;
            break;
          case 28:
            result.push(str);
          case 29:
            return _context5.abrupt("return", result);
          case 30:
          case "end":
            return _context5.stop();
        }
      }, _callee5);
    }));
    return _split.apply(this, arguments);
  }
  function join(strs, separator) {
    // undefined inputs always return undefined
    if (typeof strs === 'undefined') {
      return undefined;
    }

    // if separator is not specified, default to empty string
    if (typeof separator === 'undefined') {
      separator = "";
    }
    return strs.join(separator);
  }

  /**
   * Formats a number into a decimal string representation using XPath 3.1 F&O fn:format-number spec
   * @param {number} value - number to format
   * @param {String} picture - picture string definition
   * @param {Object} [options] - override locale defaults
   * @returns {String} The formatted string
   */
  function formatNumber(value, picture, options) {
    // undefined inputs always return undefined
    if (typeof value === 'undefined') {
      return undefined;
    }
    var defaults = {
      "decimal-separator": ".",
      "grouping-separator": ",",
      "exponent-separator": "e",
      "infinity": "Infinity",
      "minus-sign": "-",
      "NaN": "NaN",
      "percent": "%",
      "per-mille": "\u2030",
      "zero-digit": "0",
      "digit": "#",
      "pattern-separator": ";"
    };

    // if `options` is specified, then its entries override defaults
    var properties = defaults;
    if (typeof options !== 'undefined') {
      Object.keys(options).forEach(function (key) {
        properties[key] = options[key];
      });
    }
    var decimalDigitFamily = [];
    var zeroCharCode = properties['zero-digit'].charCodeAt(0);
    for (var ii = zeroCharCode; ii < zeroCharCode + 10; ii++) {
      decimalDigitFamily.push(String.fromCharCode(ii));
    }
    var activeChars = decimalDigitFamily.concat([properties['decimal-separator'], properties['exponent-separator'], properties['grouping-separator'], properties.digit, properties['pattern-separator']]);
    var subPictures = picture.split(properties['pattern-separator']);
    if (subPictures.length > 2) {
      throw {
        code: 'D3080',
        stack: new Error().stack
      };
    }
    var splitParts = function splitParts(subpicture) {
      var prefix = function () {
        var ch;
        for (var ii = 0; ii < subpicture.length; ii++) {
          ch = subpicture.charAt(ii);
          if (activeChars.indexOf(ch) !== -1 && ch !== properties['exponent-separator']) {
            return subpicture.substring(0, ii);
          }
        }
      }();
      var suffix = function () {
        var ch;
        for (var ii = subpicture.length - 1; ii >= 0; ii--) {
          ch = subpicture.charAt(ii);
          if (activeChars.indexOf(ch) !== -1 && ch !== properties['exponent-separator']) {
            return subpicture.substring(ii + 1);
          }
        }
      }();
      var activePart = subpicture.substring(prefix.length, subpicture.length - suffix.length);
      var mantissaPart, exponentPart, integerPart, fractionalPart;
      var exponentPosition = subpicture.indexOf(properties['exponent-separator'], prefix.length);
      if (exponentPosition === -1 || exponentPosition > subpicture.length - suffix.length) {
        mantissaPart = activePart;
        exponentPart = undefined;
      } else {
        mantissaPart = activePart.substring(0, exponentPosition);
        exponentPart = activePart.substring(exponentPosition + 1);
      }
      var decimalPosition = mantissaPart.indexOf(properties['decimal-separator']);
      if (decimalPosition === -1) {
        integerPart = mantissaPart;
        fractionalPart = suffix;
      } else {
        integerPart = mantissaPart.substring(0, decimalPosition);
        fractionalPart = mantissaPart.substring(decimalPosition + 1);
      }
      return {
        prefix: prefix,
        suffix: suffix,
        activePart: activePart,
        mantissaPart: mantissaPart,
        exponentPart: exponentPart,
        integerPart: integerPart,
        fractionalPart: fractionalPart,
        subpicture: subpicture
      };
    };

    // validate the picture string, F&O 4.7.3
    var validate = function validate(parts) {
      var error;
      var ii;
      var subpicture = parts.subpicture;
      var decimalPos = subpicture.indexOf(properties['decimal-separator']);
      if (decimalPos !== subpicture.lastIndexOf(properties['decimal-separator'])) {
        error = 'D3081';
      }
      if (subpicture.indexOf(properties.percent) !== subpicture.lastIndexOf(properties.percent)) {
        error = 'D3082';
      }
      if (subpicture.indexOf(properties['per-mille']) !== subpicture.lastIndexOf(properties['per-mille'])) {
        error = 'D3083';
      }
      if (subpicture.indexOf(properties.percent) !== -1 && subpicture.indexOf(properties['per-mille']) !== -1) {
        error = 'D3084';
      }
      var valid = false;
      for (ii = 0; ii < parts.mantissaPart.length; ii++) {
        var ch = parts.mantissaPart.charAt(ii);
        if (decimalDigitFamily.indexOf(ch) !== -1 || ch === properties.digit) {
          valid = true;
          break;
        }
      }
      if (!valid) {
        error = 'D3085';
      }
      var charTypes = parts.activePart.split('').map(function (_char2) {
        return activeChars.indexOf(_char2) === -1 ? 'p' : 'a';
      }).join('');
      if (charTypes.indexOf('p') !== -1) {
        error = 'D3086';
      }
      if (decimalPos !== -1) {
        if (subpicture.charAt(decimalPos - 1) === properties['grouping-separator'] || subpicture.charAt(decimalPos + 1) === properties['grouping-separator']) {
          error = 'D3087';
        }
      } else if (parts.integerPart.charAt(parts.integerPart.length - 1) === properties['grouping-separator']) {
        error = 'D3088';
      }
      if (subpicture.indexOf(properties['grouping-separator'] + properties['grouping-separator']) !== -1) {
        error = 'D3089';
      }
      var optionalDigitPos = parts.integerPart.indexOf(properties.digit);
      if (optionalDigitPos !== -1 && parts.integerPart.substring(0, optionalDigitPos).split('').filter(function (_char3) {
        return decimalDigitFamily.indexOf(_char3) > -1;
      }).length > 0) {
        error = 'D3090';
      }
      optionalDigitPos = parts.fractionalPart.lastIndexOf(properties.digit);
      if (optionalDigitPos !== -1 && parts.fractionalPart.substring(optionalDigitPos).split('').filter(function (_char4) {
        return decimalDigitFamily.indexOf(_char4) > -1;
      }).length > 0) {
        error = 'D3091';
      }
      var exponentExists = typeof parts.exponentPart === 'string';
      if (exponentExists && parts.exponentPart.length > 0 && (subpicture.indexOf(properties.percent) !== -1 || subpicture.indexOf(properties['per-mille']) !== -1)) {
        error = 'D3092';
      }
      if (exponentExists && (parts.exponentPart.length === 0 || parts.exponentPart.split('').filter(function (_char5) {
        return decimalDigitFamily.indexOf(_char5) === -1;
      }).length > 0)) {
        error = 'D3093';
      }
      if (error) {
        throw {
          code: error,
          stack: new Error().stack
        };
      }
    };

    // analyse the picture string, F&O 4.7.4
    var analyse = function analyse(parts) {
      var getGroupingPositions = function getGroupingPositions(part, toLeft) {
        var positions = [];
        var groupingPosition = part.indexOf(properties['grouping-separator']);
        while (groupingPosition !== -1) {
          var charsToTheRight = (toLeft ? part.substring(0, groupingPosition) : part.substring(groupingPosition)).split('').filter(function (_char6) {
            return decimalDigitFamily.indexOf(_char6) !== -1 || _char6 === properties.digit;
          }).length;
          positions.push(charsToTheRight);
          groupingPosition = parts.integerPart.indexOf(properties['grouping-separator'], groupingPosition + 1);
        }
        return positions;
      };
      var integerPartGroupingPositions = getGroupingPositions(parts.integerPart);
      var regular = function regular(indexes) {
        // are the grouping positions regular? i.e. same interval between each of them
        if (indexes.length === 0) {
          return 0;
        }
        var _gcd = function gcd(a, b) {
          return b === 0 ? a : _gcd(b, a % b);
        };
        // find the greatest common divisor of all the positions
        var factor = indexes.reduce(_gcd);
        // is every position separated by this divisor? If so, it's regular
        for (var index = 1; index <= indexes.length; index++) {
          if (indexes.indexOf(index * factor) === -1) {
            return 0;
          }
        }
        return factor;
      };
      var regularGrouping = regular(integerPartGroupingPositions);
      var fractionalPartGroupingPositions = getGroupingPositions(parts.fractionalPart, true);
      var minimumIntegerPartSize = parts.integerPart.split('').filter(function (_char7) {
        return decimalDigitFamily.indexOf(_char7) !== -1;
      }).length;
      var scalingFactor = minimumIntegerPartSize;
      var fractionalPartArray = parts.fractionalPart.split('');
      var minimumFactionalPartSize = fractionalPartArray.filter(function (_char8) {
        return decimalDigitFamily.indexOf(_char8) !== -1;
      }).length;
      var maximumFactionalPartSize = fractionalPartArray.filter(function (_char9) {
        return decimalDigitFamily.indexOf(_char9) !== -1 || _char9 === properties.digit;
      }).length;
      var exponentPresent = typeof parts.exponentPart === 'string';
      if (minimumIntegerPartSize === 0 && maximumFactionalPartSize === 0) {
        if (exponentPresent) {
          minimumFactionalPartSize = 1;
          maximumFactionalPartSize = 1;
        } else {
          minimumIntegerPartSize = 1;
        }
      }
      if (exponentPresent && minimumIntegerPartSize === 0 && parts.integerPart.indexOf(properties.digit) !== -1) {
        minimumIntegerPartSize = 1;
      }
      if (minimumIntegerPartSize === 0 && minimumFactionalPartSize === 0) {
        minimumFactionalPartSize = 1;
      }
      var minimumExponentSize = 0;
      if (exponentPresent) {
        minimumExponentSize = parts.exponentPart.split('').filter(function (_char10) {
          return decimalDigitFamily.indexOf(_char10) !== -1;
        }).length;
      }
      return {
        integerPartGroupingPositions: integerPartGroupingPositions,
        regularGrouping: regularGrouping,
        minimumIntegerPartSize: minimumIntegerPartSize,
        scalingFactor: scalingFactor,
        prefix: parts.prefix,
        fractionalPartGroupingPositions: fractionalPartGroupingPositions,
        minimumFactionalPartSize: minimumFactionalPartSize,
        maximumFactionalPartSize: maximumFactionalPartSize,
        minimumExponentSize: minimumExponentSize,
        suffix: parts.suffix,
        picture: parts.subpicture
      };
    };
    var parts = subPictures.map(splitParts);
    parts.forEach(validate);
    var variables = parts.map(analyse);
    var minus_sign = properties['minus-sign'];
    var zero_digit = properties['zero-digit'];
    var decimal_separator = properties['decimal-separator'];
    var grouping_separator = properties['grouping-separator'];
    if (variables.length === 1) {
      variables.push(JSON.parse(JSON.stringify(variables[0])));
      variables[1].prefix = minus_sign + variables[1].prefix;
    }

    // TODO cache the result of the analysis

    // format the number
    // bullet 1: TODO: NaN - not sure we'd ever get this in JSON
    var pic;
    // bullet 2:
    if (value >= 0) {
      pic = variables[0];
    } else {
      pic = variables[1];
    }
    var adjustedNumber;
    // bullet 3:
    if (pic.picture.indexOf(properties.percent) !== -1) {
      adjustedNumber = value * 100;
    } else if (pic.picture.indexOf(properties['per-mille']) !== -1) {
      adjustedNumber = value * 1000;
    } else {
      adjustedNumber = value;
    }
    // bullet 4:
    // TODO: infinity - not sure we'd ever get this in JSON
    // bullet 5:
    var mantissa, exponent;
    if (pic.minimumExponentSize === 0) {
      mantissa = adjustedNumber;
    } else {
      // mantissa * 10^exponent = adjustedNumber
      var maxMantissa = Math.pow(10, pic.scalingFactor);
      var minMantissa = Math.pow(10, pic.scalingFactor - 1);
      mantissa = adjustedNumber;
      exponent = 0;
      while (mantissa < minMantissa) {
        mantissa *= 10;
        exponent -= 1;
      }
      while (mantissa > maxMantissa) {
        mantissa /= 10;
        exponent += 1;
      }
    }
    // bullet 6:
    var roundedNumber = round(mantissa, pic.maximumFactionalPartSize);
    // bullet 7:
    var makeString = function makeString(value, dp) {
      var str = Math.abs(value).toFixed(dp);
      if (zero_digit !== '0') {
        str = str.split('').map(function (digit) {
          if (digit >= '0' && digit <= '9') {
            return decimalDigitFamily[digit.charCodeAt(0) - 48];
          } else {
            return digit;
          }
        }).join('');
      }
      return str;
    };
    var stringValue = makeString(roundedNumber, pic.maximumFactionalPartSize);
    var decimalPos = stringValue.indexOf('.');
    if (decimalPos === -1) {
      stringValue = stringValue + decimal_separator;
    } else {
      stringValue = stringValue.replace('.', decimal_separator);
    }
    while (stringValue.charAt(0) === zero_digit) {
      stringValue = stringValue.substring(1);
    }
    while (stringValue.charAt(stringValue.length - 1) === zero_digit) {
      stringValue = stringValue.substring(0, stringValue.length - 1);
    }
    // bullets 8 & 9:
    decimalPos = stringValue.indexOf(decimal_separator);
    var padLeft = pic.minimumIntegerPartSize - decimalPos;
    var padRight = pic.minimumFactionalPartSize - (stringValue.length - decimalPos - 1);
    stringValue = (padLeft > 0 ? new Array(padLeft + 1).join(zero_digit) : '') + stringValue;
    stringValue = stringValue + (padRight > 0 ? new Array(padRight + 1).join(zero_digit) : '');
    decimalPos = stringValue.indexOf(decimal_separator);
    // bullet 10:
    if (pic.regularGrouping > 0) {
      var groupCount = Math.floor((decimalPos - 1) / pic.regularGrouping);
      for (var group = 1; group <= groupCount; group++) {
        stringValue = [stringValue.slice(0, decimalPos - group * pic.regularGrouping), grouping_separator, stringValue.slice(decimalPos - group * pic.regularGrouping)].join('');
      }
    } else {
      pic.integerPartGroupingPositions.forEach(function (pos) {
        stringValue = [stringValue.slice(0, decimalPos - pos), grouping_separator, stringValue.slice(decimalPos - pos)].join('');
        decimalPos++;
      });
    }
    // bullet 11:
    decimalPos = stringValue.indexOf(decimal_separator);
    pic.fractionalPartGroupingPositions.forEach(function (pos) {
      stringValue = [stringValue.slice(0, pos + decimalPos + 1), grouping_separator, stringValue.slice(pos + decimalPos + 1)].join('');
    });
    // bullet 12:
    decimalPos = stringValue.indexOf(decimal_separator);
    if (pic.picture.indexOf(decimal_separator) === -1 || decimalPos === stringValue.length - 1) {
      stringValue = stringValue.substring(0, stringValue.length - 1);
    }
    // bullet 13:
    if (typeof exponent !== 'undefined') {
      var stringExponent = makeString(exponent, 0);
      padLeft = pic.minimumExponentSize - stringExponent.length;
      if (padLeft > 0) {
        stringExponent = new Array(padLeft + 1).join(zero_digit) + stringExponent;
      }
      stringValue = stringValue + properties['exponent-separator'] + (exponent < 0 ? minus_sign : '') + stringExponent;
    }
    // bullet 14:
    stringValue = pic.prefix + stringValue + pic.suffix;
    return stringValue;
  }

  /**
   * Converts a number to a string using a specified number base
   * @param {number} value - the number to convert
   * @param {number} [radix] - the number base; must be between 2 and 36. Defaults to 10
   * @returns {string} - the converted string
   */
  function formatBase(value, radix) {
    // undefined inputs always return undefined
    if (typeof value === 'undefined') {
      return undefined;
    }
    value = round(value);
    if (typeof radix === 'undefined') {
      radix = 10;
    } else {
      radix = round(radix);
    }
    if (radix < 2 || radix > 36) {
      throw {
        code: 'D3100',
        stack: new Error().stack,
        value: radix
      };
    }
    var result = value.toString(radix);
    return result;
  }

  /**
   * Cast argument to number
   * @param {Object} arg - Argument
   * @returns {Number} numeric value of argument
   */
  function number(arg) {
    var result;

    // undefined inputs always return undefined
    if (typeof arg === 'undefined') {
      return undefined;
    }
    if (typeof arg === 'number') {
      // already a number
      result = arg;
    } else if (typeof arg === 'string' && /^-?[0-9]+(\.[0-9]+)?([Ee][-+]?[0-9]+)?$/.test(arg) && !isNaN(parseFloat(arg)) && isFinite(arg)) {
      result = parseFloat(arg);
    } else if (typeof arg === 'string' && /^(0[xX][0-9A-Fa-f]+)|(0[oO][0-7]+)|(0[bB][0-1]+)$/.test(arg)) {
      result = Number(arg);
    } else if (arg === true) {
      // boolean true casts to 1
      result = 1;
    } else if (arg === false) {
      // boolean false casts to 0
      result = 0;
    } else {
      throw {
        code: "D3030",
        value: arg,
        stack: new Error().stack,
        index: 1
      };
    }
    return result;
  }

  /**
   * Absolute value of a number
   * @param {Number} arg - Argument
   * @returns {Number} absolute value of argument
   */
  function abs(arg) {
    var result;

    // undefined inputs always return undefined
    if (typeof arg === 'undefined') {
      return undefined;
    }
    result = Math.abs(arg);
    return result;
  }

  /**
   * Rounds a number down to integer
   * @param {Number} arg - Argument
   * @returns {Number} rounded integer
   */
  function floor(arg) {
    var result;

    // undefined inputs always return undefined
    if (typeof arg === 'undefined') {
      return undefined;
    }
    result = Math.floor(arg);
    return result;
  }

  /**
   * Rounds a number up to integer
   * @param {Number} arg - Argument
   * @returns {Number} rounded integer
   */
  function ceil(arg) {
    var result;

    // undefined inputs always return undefined
    if (typeof arg === 'undefined') {
      return undefined;
    }
    result = Math.ceil(arg);
    return result;
  }

  /**
   * Round to half even
   * @param {Number} arg - Argument
   * @param {Number} [precision] - number of decimal places
   * @returns {Number} rounded integer
   */
  function round(arg, precision) {
    var result;

    // undefined inputs always return undefined
    if (typeof arg === 'undefined') {
      return undefined;
    }
    if (precision) {
      // shift the decimal place - this needs to be done in a string since multiplying
      // by a power of ten can introduce floating point precision errors which mess up
      // this rounding algorithm - See 'Decimal rounding' in
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
      // Shift
      var value = arg.toString().split('e');
      arg = +(value[0] + 'e' + (value[1] ? +value[1] + precision : precision));
    }

    // round up to nearest int
    result = Math.round(arg);
    var diff = result - arg;
    if (Math.abs(diff) === 0.5 && Math.abs(result % 2) === 1) {
      // rounded the wrong way - adjust to nearest even number
      result = result - 1;
    }
    if (precision) {
      // Shift back
      value = result.toString().split('e');
      /* istanbul ignore next */
      result = +(value[0] + 'e' + (value[1] ? +value[1] - precision : -precision));
    }
    if (Object.is(result, -0)) {
      // ESLint rule 'no-compare-neg-zero' suggests this way
      // JSON doesn't do -0
      result = 0;
    }
    return result;
  }

  /**
   * Square root of number
   * @param {Number} arg - Argument
   * @returns {Number} square root
   */
  function sqrt(arg) {
    var result;

    // undefined inputs always return undefined
    if (typeof arg === 'undefined') {
      return undefined;
    }
    if (arg < 0) {
      throw {
        stack: new Error().stack,
        code: "D3060",
        index: 1,
        value: arg
      };
    }
    result = Math.sqrt(arg);
    return result;
  }

  /**
   * Raises number to the power of the second number
   * @param {Number} arg - the base
   * @param {Number} exp - the exponent
   * @returns {Number} rounded integer
   */
  function power(arg, exp) {
    var result;

    // undefined inputs always return undefined
    if (typeof arg === 'undefined') {
      return undefined;
    }
    result = Math.pow(arg, exp);
    if (!isFinite(result)) {
      throw {
        stack: new Error().stack,
        code: "D3061",
        index: 1,
        value: arg,
        exp: exp
      };
    }
    return result;
  }

  /**
   * Returns a random number 0 <= n < 1
   * @returns {number} random number
   */
  function random() {
    return Math.random();
  }

  /**
   * Evaluate an input and return a boolean
   * @param {*} arg - Arguments
   * @returns {boolean} Boolean
   */
  function _boolean(arg) {
    // cast arg to its effective boolean value
    // boolean: unchanged
    // string: zero-length -> false; otherwise -> true
    // number: 0 -> false; otherwise -> true
    // null -> false
    // array: empty -> false; length > 1 -> true
    // object: empty -> false; non-empty -> true
    // function -> false

    // undefined inputs always return undefined
    if (typeof arg === 'undefined') {
      return undefined;
    }
    var result = false;
    if (Array.isArray(arg)) {
      if (arg.length === 1) {
        result = _boolean(arg[0]);
      } else if (arg.length > 1) {
        var trues = arg.filter(function (val) {
          return _boolean(val);
        });
        result = trues.length > 0;
      }
    } else if (typeof arg === 'string') {
      if (arg.length > 0) {
        result = true;
      }
    } else if (isNumeric(arg)) {
      if (arg !== 0) {
        result = true;
      }
    } else if (arg !== null && _typeof(arg) === 'object') {
      if (Object.keys(arg).length > 0) {
        result = true;
      }
    } else if (typeof arg === 'boolean' && arg === true) {
      result = true;
    }
    return result;
  }

  /**
   * returns the Boolean NOT of the arg
   * @param {*} arg - argument
   * @returns {boolean} - NOT arg
   */
  function not(arg) {
    // undefined inputs always return undefined
    if (typeof arg === 'undefined') {
      return undefined;
    }
    return !_boolean(arg);
  }

  /**
   * Helper function to build the arguments to be supplied to the function arg of the
   * HOFs map, filter, each, sift and single
   * @param {function} func - the function to be invoked
   * @param {*} arg1 - the first (required) arg - the value
   * @param {*} arg2 - the second (optional) arg - the position (index or key)
   * @param {*} arg3 - the third (optional) arg - the whole structure (array or object)
   * @returns {*[]} the argument list
   */
  function hofFuncArgs(func, arg1, arg2, arg3) {
    var func_args = [arg1]; // the first arg (the value) is required
    // the other two are optional - only supply it if the function can take it
    var length = getFunctionArity(func);
    if (length >= 2) {
      func_args.push(arg2);
    }
    if (length >= 3) {
      func_args.push(arg3);
    }
    return func_args;
  }

  /**
   * Create a map from an array of arguments
   * @param {Array} [arr] - array to map over
   * @param {Function} func - function to apply
   * @returns {Array} Map array
   */
  function map(_x15, _x16) {
    return _map.apply(this, arguments);
  }
  /**
   * Create a map from an array of arguments
   * @param {Array} [arr] - array to filter
   * @param {Function} func - predicate function
   * @returns {Array} Map array
   */
  function _map() {
    _map = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee6(arr, func) {
      var result, i, func_args, res;
      return _regeneratorRuntime().wrap(function _callee6$(_context6) {
        while (1) switch (_context6.prev = _context6.next) {
          case 0:
            if (!(typeof arr === 'undefined')) {
              _context6.next = 2;
              break;
            }
            return _context6.abrupt("return", undefined);
          case 2:
            result = createSequence(); // do the map - iterate over the arrays, and invoke func
            i = 0;
          case 4:
            if (!(i < arr.length)) {
              _context6.next = 13;
              break;
            }
            func_args = hofFuncArgs(func, arr[i], i, arr); // invoke func
            _context6.next = 8;
            return func.apply(this, func_args);
          case 8:
            res = _context6.sent;
            if (typeof res !== 'undefined') {
              result.push(res);
            }
          case 10:
            i++;
            _context6.next = 4;
            break;
          case 13:
            return _context6.abrupt("return", result);
          case 14:
          case "end":
            return _context6.stop();
        }
      }, _callee6, this);
    }));
    return _map.apply(this, arguments);
  }
  function filter(_x17, _x18) {
    return _filter.apply(this, arguments);
  }
  /**
   * Given an array, find the single element matching a specified condition
   * Throws an exception if the number of matching elements is not exactly one
   * @param {Array} [arr] - array to filter
   * @param {Function} [func] - predicate function
   * @returns {*} Matching element
   */
  function _filter() {
    _filter = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee7(arr, func) {
      var result, i, entry, func_args, res;
      return _regeneratorRuntime().wrap(function _callee7$(_context7) {
        while (1) switch (_context7.prev = _context7.next) {
          case 0:
            if (!(typeof arr === 'undefined')) {
              _context7.next = 2;
              break;
            }
            return _context7.abrupt("return", undefined);
          case 2:
            result = createSequence();
            i = 0;
          case 4:
            if (!(i < arr.length)) {
              _context7.next = 14;
              break;
            }
            entry = arr[i];
            func_args = hofFuncArgs(func, entry, i, arr); // invoke func
            _context7.next = 9;
            return func.apply(this, func_args);
          case 9:
            res = _context7.sent;
            if (_boolean(res)) {
              result.push(entry);
            }
          case 11:
            i++;
            _context7.next = 4;
            break;
          case 14:
            return _context7.abrupt("return", result);
          case 15:
          case "end":
            return _context7.stop();
        }
      }, _callee7, this);
    }));
    return _filter.apply(this, arguments);
  }
  function single(_x19, _x20) {
    return _single.apply(this, arguments);
  }
  /**
   * Convolves (zips) each value from a set of arrays
   * @param {Array} [args] - arrays to zip
   * @returns {Array} Zipped array
   */
  function _single() {
    _single = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee8(arr, func) {
      var hasFoundMatch, result, i, entry, positiveResult, func_args, res;
      return _regeneratorRuntime().wrap(function _callee8$(_context8) {
        while (1) switch (_context8.prev = _context8.next) {
          case 0:
            if (!(typeof arr === 'undefined')) {
              _context8.next = 2;
              break;
            }
            return _context8.abrupt("return", undefined);
          case 2:
            hasFoundMatch = false;
            i = 0;
          case 4:
            if (!(i < arr.length)) {
              _context8.next = 23;
              break;
            }
            entry = arr[i];
            positiveResult = true;
            if (!(typeof func !== 'undefined')) {
              _context8.next = 13;
              break;
            }
            func_args = hofFuncArgs(func, entry, i, arr); // invoke func
            _context8.next = 11;
            return func.apply(this, func_args);
          case 11:
            res = _context8.sent;
            positiveResult = _boolean(res);
          case 13:
            if (!positiveResult) {
              _context8.next = 20;
              break;
            }
            if (hasFoundMatch) {
              _context8.next = 19;
              break;
            }
            result = entry;
            hasFoundMatch = true;
            _context8.next = 20;
            break;
          case 19:
            throw {
              stack: new Error().stack,
              code: "D3138",
              index: i
            };
          case 20:
            i++;
            _context8.next = 4;
            break;
          case 23:
            if (hasFoundMatch) {
              _context8.next = 25;
              break;
            }
            throw {
              stack: new Error().stack,
              code: "D3139"
            };
          case 25:
            return _context8.abrupt("return", result);
          case 26:
          case "end":
            return _context8.stop();
        }
      }, _callee8, this);
    }));
    return _single.apply(this, arguments);
  }
  function zip() {
    // this can take a variable number of arguments
    var result = [];
    var args = Array.prototype.slice.call(arguments);
    // length of the shortest array
    var length = Math.min.apply(Math, args.map(function (arg) {
      if (Array.isArray(arg)) {
        return arg.length;
      }
      return 0;
    }));
    for (var i = 0; i < length; i++) {
      var tuple = args.map(function (arg) {
        return arg[i];
      });
      result.push(tuple);
    }
    return result;
  }

  /**
   * Fold left function
   * @param {Array} sequence - Sequence
   * @param {Function} func - Function
   * @param {Object} init - Initial value
   * @returns {*} Result
   */
  function foldLeft(_x21, _x22, _x23) {
    return _foldLeft.apply(this, arguments);
  }
  /**
   * Return keys for an object
   * @param {Object} arg - Object
   * @returns {Array} Array of keys
   */
  function _foldLeft() {
    _foldLeft = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee9(sequence, func, init) {
      var result, arity, index, args;
      return _regeneratorRuntime().wrap(function _callee9$(_context9) {
        while (1) switch (_context9.prev = _context9.next) {
          case 0:
            if (!(typeof sequence === 'undefined')) {
              _context9.next = 2;
              break;
            }
            return _context9.abrupt("return", undefined);
          case 2:
            arity = getFunctionArity(func);
            if (!(arity < 2)) {
              _context9.next = 5;
              break;
            }
            throw {
              stack: new Error().stack,
              code: "D3050",
              index: 1
            };
          case 5:
            if (typeof init === 'undefined' && sequence.length > 0) {
              result = sequence[0];
              index = 1;
            } else {
              result = init;
              index = 0;
            }
          case 6:
            if (!(index < sequence.length)) {
              _context9.next = 16;
              break;
            }
            args = [result, sequence[index]];
            if (arity >= 3) {
              args.push(index);
            }
            if (arity >= 4) {
              args.push(sequence);
            }
            _context9.next = 12;
            return func.apply(this, args);
          case 12:
            result = _context9.sent;
            index++;
            _context9.next = 6;
            break;
          case 16:
            return _context9.abrupt("return", result);
          case 17:
          case "end":
            return _context9.stop();
        }
      }, _callee9, this);
    }));
    return _foldLeft.apply(this, arguments);
  }
  function keys(arg) {
    var result = createSequence();
    if (Array.isArray(arg)) {
      // merge the keys of all of the items in the array
      var merge = {};
      arg.forEach(function (item) {
        var allkeys = keys(item);
        allkeys.forEach(function (key) {
          merge[key] = true;
        });
      });
      result = keys(merge);
    } else if (arg !== null && _typeof(arg) === 'object' && !isFunction(arg)) {
      Object.keys(arg).forEach(function (key) {
        return result.push(key);
      });
    }
    return result;
  }

  /**
   * Return value from an object for a given key
   * @param {Object} input - Object/Array
   * @param {String} key - Key in object
   * @returns {*} Value of key in object
   */
  function lookup(input, key) {
    // lookup the 'name' item in the input
    var result;
    if (Array.isArray(input)) {
      result = createSequence();
      for (var ii = 0; ii < input.length; ii++) {
        var res = lookup(input[ii], key);
        if (typeof res !== 'undefined') {
          if (Array.isArray(res)) {
            res.forEach(function (val) {
              return result.push(val);
            });
          } else {
            result.push(res);
          }
        }
      }
    } else if (input !== null && _typeof(input) === 'object' && !isFunction(input)) {
      result = input[key];
    }
    return result;
  }

  /**
   * Append second argument to first
   * @param {Array|Object} arg1 - First argument
   * @param {Array|Object} arg2 - Second argument
   * @returns {*} Appended arguments
   */
  function append(arg1, arg2) {
    // disregard undefined args
    if (typeof arg1 === 'undefined') {
      return arg2;
    }
    if (typeof arg2 === 'undefined') {
      return arg1;
    }
    // if either argument is not an array, make it so
    if (!Array.isArray(arg1)) {
      arg1 = createSequence(arg1);
    }
    if (!Array.isArray(arg2)) {
      arg2 = [arg2];
    }
    return arg1.concat(arg2);
  }

  /**
   * Determines if the argument is undefined
   * @param {*} arg - argument
   * @returns {boolean} False if argument undefined, otherwise true
   */
  function exists(arg) {
    if (typeof arg === 'undefined') {
      return false;
    } else {
      return true;
    }
  }

  /**
   * Splits an object into an array of object with one property each
   * @param {*} arg - the object to split
   * @returns {*} - the array
   */
  function spread(arg) {
    var result = createSequence();
    if (Array.isArray(arg)) {
      // spread all of the items in the array
      arg.forEach(function (item) {
        result = append(result, spread(item));
      });
    } else if (arg !== null && _typeof(arg) === 'object' && !isLambda(arg)) {
      for (var key in arg) {
        var obj = {};
        obj[key] = arg[key];
        result.push(obj);
      }
    } else {
      result = arg;
    }
    return result;
  }

  /**
   * Merges an array of objects into a single object.  Duplicate properties are
   * overridden by entries later in the array
   * @param {*} arg - the objects to merge
   * @returns {*} - the object
   */
  function merge(arg) {
    // undefined inputs always return undefined
    if (typeof arg === 'undefined') {
      return undefined;
    }
    var result = {};
    arg.forEach(function (obj) {
      for (var prop in obj) {
        result[prop] = obj[prop];
      }
    });
    return result;
  }

  /**
   * Reverses the order of items in an array
   * @param {Array} arr - the array to reverse
   * @returns {Array} - the reversed array
   */
  function reverse(arr) {
    // undefined inputs always return undefined
    if (typeof arr === 'undefined') {
      return undefined;
    }
    if (arr.length <= 1) {
      return arr;
    }
    var length = arr.length;
    var result = new Array(length);
    for (var i = 0; i < length; i++) {
      result[length - i - 1] = arr[i];
    }
    return result;
  }

  /**
   *
   * @param {*} obj - the input object to iterate over
   * @param {*} func - the function to apply to each key/value pair
   * @returns {Array} - the resultant array
   */
  function each(_x24, _x25) {
    return _each.apply(this, arguments);
  }
  /**
   *
   * @param {string} [message] - the message to attach to the error
   * @throws custom error with code 'D3137'
   */
  function _each() {
    _each = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee10(obj, func) {
      var result, key, func_args, val;
      return _regeneratorRuntime().wrap(function _callee10$(_context10) {
        while (1) switch (_context10.prev = _context10.next) {
          case 0:
            result = createSequence();
            _context10.t0 = _regeneratorRuntime().keys(obj);
          case 2:
            if ((_context10.t1 = _context10.t0()).done) {
              _context10.next = 11;
              break;
            }
            key = _context10.t1.value;
            func_args = hofFuncArgs(func, obj[key], key, obj); // invoke func
            _context10.next = 7;
            return func.apply(this, func_args);
          case 7:
            val = _context10.sent;
            if (typeof val !== 'undefined') {
              result.push(val);
            }
            _context10.next = 2;
            break;
          case 11:
            return _context10.abrupt("return", result);
          case 12:
          case "end":
            return _context10.stop();
        }
      }, _callee10, this);
    }));
    return _each.apply(this, arguments);
  }
  function error(message) {
    throw {
      code: "D3137",
      stack: new Error().stack,
      message: message || "$error() function evaluated"
    };
  }

  /**
   *
   * @param {boolean} condition - the condition to evaluate
   * @param {string} [message] - the message to attach to the error
   * @throws custom error with code 'D3137'
   * @returns {undefined}
   */
  function assert(condition, message) {
    if (!condition) {
      throw {
        code: "D3141",
        stack: new Error().stack,
        message: message || "$assert() statement failed"
      };
    }
    return undefined;
  }

  /**
   *
   * @param {*} [value] - the input to which the type will be checked
   * @returns {string} - the type of the input
   */
  function type(value) {
    if (value === undefined) {
      return undefined;
    }
    if (value === null) {
      return 'null';
    }
    if (isNumeric(value)) {
      return 'number';
    }
    if (typeof value === 'string') {
      return 'string';
    }
    if (typeof value === 'boolean') {
      return 'boolean';
    }
    if (Array.isArray(value)) {
      return 'array';
    }
    if (isFunction(value)) {
      return 'function';
    }
    return 'object';
  }

  /**
   * Implements the merge sort (stable) with optional comparator function
   *
   * @param {Array} arr - the array to sort
   * @param {*} comparator - comparator function
   * @returns {Array} - sorted array
   */
  function sort(_x26, _x27) {
    return _sort.apply(this, arguments);
  }
  /**
   * Randomly shuffles the contents of an array
   * @param {Array} arr - the input array
   * @returns {Array} the shuffled array
   */
  function _sort() {
    _sort = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee15(arr, comparator) {
      var comp, merge, _msort, result;
      return _regeneratorRuntime().wrap(function _callee15$(_context15) {
        while (1) switch (_context15.prev = _context15.next) {
          case 0:
            if (!(typeof arr === 'undefined')) {
              _context15.next = 2;
              break;
            }
            return _context15.abrupt("return", undefined);
          case 2:
            if (!(arr.length <= 1)) {
              _context15.next = 4;
              break;
            }
            return _context15.abrupt("return", arr);
          case 4:
            if (!(typeof comparator === 'undefined')) {
              _context15.next = 10;
              break;
            }
            if (!(!isArrayOfNumbers(arr) && !isArrayOfStrings(arr))) {
              _context15.next = 7;
              break;
            }
            throw {
              stack: new Error().stack,
              code: "D3070",
              index: 1
            };
          case 7:
            comp = /*#__PURE__*/function () {
              var _ref = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee11(a, b) {
                return _regeneratorRuntime().wrap(function _callee11$(_context11) {
                  while (1) switch (_context11.prev = _context11.next) {
                    case 0:
                      return _context11.abrupt("return", a > b);
                    case 1:
                    case "end":
                      return _context11.stop();
                  }
                }, _callee11);
              }));
              return function comp(_x30, _x31) {
                return _ref.apply(this, arguments);
              };
            }();
            _context15.next = 11;
            break;
          case 10:
            // for internal usage of functionSort (i.e. order-by syntax)
            comp = comparator;
          case 11:
            merge = /*#__PURE__*/function () {
              var _ref2 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee13(l, r) {
                var _merge_iter, merged;
                return _regeneratorRuntime().wrap(function _callee13$(_context13) {
                  while (1) switch (_context13.prev = _context13.next) {
                    case 0:
                      _merge_iter = /*#__PURE__*/function () {
                        var _ref3 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee12(result, left, right) {
                          return _regeneratorRuntime().wrap(function _callee12$(_context12) {
                            while (1) switch (_context12.prev = _context12.next) {
                              case 0:
                                if (!(left.length === 0)) {
                                  _context12.next = 4;
                                  break;
                                }
                                Array.prototype.push.apply(result, right);
                                _context12.next = 19;
                                break;
                              case 4:
                                if (!(right.length === 0)) {
                                  _context12.next = 8;
                                  break;
                                }
                                Array.prototype.push.apply(result, left);
                                _context12.next = 19;
                                break;
                              case 8:
                                _context12.next = 10;
                                return comp(left[0], right[0]);
                              case 10:
                                if (!_context12.sent) {
                                  _context12.next = 16;
                                  break;
                                }
                                // invoke the comparator function
                                // if it returns true - swap left and right
                                result.push(right[0]);
                                _context12.next = 14;
                                return _merge_iter(result, left, right.slice(1));
                              case 14:
                                _context12.next = 19;
                                break;
                              case 16:
                                // otherwise keep the same order
                                result.push(left[0]);
                                _context12.next = 19;
                                return _merge_iter(result, left.slice(1), right);
                              case 19:
                              case "end":
                                return _context12.stop();
                            }
                          }, _callee12);
                        }));
                        return function merge_iter(_x34, _x35, _x36) {
                          return _ref3.apply(this, arguments);
                        };
                      }();
                      merged = [];
                      _context13.next = 4;
                      return _merge_iter(merged, l, r);
                    case 4:
                      return _context13.abrupt("return", merged);
                    case 5:
                    case "end":
                      return _context13.stop();
                  }
                }, _callee13);
              }));
              return function merge(_x32, _x33) {
                return _ref2.apply(this, arguments);
              };
            }();
            _msort = /*#__PURE__*/function () {
              var _ref4 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee14(array) {
                var middle, left, right;
                return _regeneratorRuntime().wrap(function _callee14$(_context14) {
                  while (1) switch (_context14.prev = _context14.next) {
                    case 0:
                      if (!(!Array.isArray(array) || array.length <= 1)) {
                        _context14.next = 4;
                        break;
                      }
                      return _context14.abrupt("return", array);
                    case 4:
                      middle = Math.floor(array.length / 2);
                      left = array.slice(0, middle);
                      right = array.slice(middle);
                      _context14.next = 9;
                      return _msort(left);
                    case 9:
                      left = _context14.sent;
                      _context14.next = 12;
                      return _msort(right);
                    case 12:
                      right = _context14.sent;
                      _context14.next = 15;
                      return merge(left, right);
                    case 15:
                      return _context14.abrupt("return", _context14.sent);
                    case 16:
                    case "end":
                      return _context14.stop();
                  }
                }, _callee14);
              }));
              return function msort(_x37) {
                return _ref4.apply(this, arguments);
              };
            }();
            _context15.next = 15;
            return _msort(arr);
          case 15:
            result = _context15.sent;
            return _context15.abrupt("return", result);
          case 17:
          case "end":
            return _context15.stop();
        }
      }, _callee15);
    }));
    return _sort.apply(this, arguments);
  }
  function shuffle(arr) {
    // undefined inputs always return undefined
    if (typeof arr === 'undefined') {
      return undefined;
    }
    if (arr.length <= 1) {
      return arr;
    }

    // shuffle using the 'inside-out' variant of the Fisher-Yates algorithm
    var result = new Array(arr.length);
    for (var i = 0; i < arr.length; i++) {
      var j = Math.floor(Math.random() * (i + 1)); // random integer such that 0 ≤ j ≤ i
      if (i !== j) {
        result[i] = result[j];
      }
      result[j] = arr[i];
    }
    return result;
  }

  /**
   * Returns the values that appear in a sequence, with duplicates eliminated.
   * @param {Array} arr - An array or sequence of values
   * @returns {Array} - sequence of distinct values
   */
  function distinct(arr) {
    // undefined inputs always return undefined
    if (typeof arr === 'undefined') {
      return undefined;
    }
    if (!Array.isArray(arr) || arr.length <= 1) {
      return arr;
    }
    var results = isSequence(arr) ? createSequence() : [];
    for (var ii = 0; ii < arr.length; ii++) {
      var value = arr[ii];
      // is this value already in the result sequence?
      var includes = false;
      for (var jj = 0; jj < results.length; jj++) {
        if (deepEquals(value, results[jj])) {
          includes = true;
          break;
        }
      }
      if (!includes) {
        results.push(value);
      }
    }
    return results;
  }

  /**
   * Applies a predicate function to each key/value pair in an object, and returns an object containing
   * only the key/value pairs that passed the predicate
   *
   * @param {object} arg - the object to be sifted
   * @param {object} func - the predicate function (lambda or native)
   * @returns {object} - sifted object
   */
  function sift(_x28, _x29) {
    return _sift.apply(this, arguments);
  }
  function _sift() {
    _sift = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee16(arg, func) {
      var result, item, entry, func_args, res;
      return _regeneratorRuntime().wrap(function _callee16$(_context16) {
        while (1) switch (_context16.prev = _context16.next) {
          case 0:
            result = {};
            _context16.t0 = _regeneratorRuntime().keys(arg);
          case 2:
            if ((_context16.t1 = _context16.t0()).done) {
              _context16.next = 12;
              break;
            }
            item = _context16.t1.value;
            entry = arg[item];
            func_args = hofFuncArgs(func, entry, item, arg); // invoke func
            _context16.next = 8;
            return func.apply(this, func_args);
          case 8:
            res = _context16.sent;
            if (_boolean(res)) {
              result[item] = entry;
            }
            _context16.next = 2;
            break;
          case 12:
            // empty objects should be changed to undefined
            if (Object.keys(result).length === 0) {
              result = undefined;
            }
            return _context16.abrupt("return", result);
          case 14:
          case "end":
            return _context16.stop();
        }
      }, _callee16, this);
    }));
    return _sift.apply(this, arguments);
  }
  return {
    sum: sum,
    count: count,
    max: max,
    min: min,
    average: average,
    string: string,
    substring: substring,
    substringBefore: substringBefore,
    substringAfter: substringAfter,
    lowercase: lowercase,
    uppercase: uppercase,
    length: length,
    trim: trim,
    pad: pad,
    match: match,
    contains: contains,
    replace: replace,
    split: split,
    join: join,
    formatNumber: formatNumber,
    formatBase: formatBase,
    number: number,
    floor: floor,
    ceil: ceil,
    round: round,
    abs: abs,
    sqrt: sqrt,
    power: power,
    random: random,
    "boolean": _boolean,
    not: not,
    map: map,
    zip: zip,
    filter: filter,
    single: single,
    foldLeft: foldLeft,
    sift: sift,
    keys: keys,
    lookup: lookup,
    append: append,
    exists: exists,
    spread: spread,
    merge: merge,
    reverse: reverse,
    each: each,
    error: error,
    assert: assert,
    type: type,
    sort: sort,
    shuffle: shuffle,
    distinct: distinct,
    base64encode: base64encode,
    base64decode: base64decode,
    encodeUrlComponent: encodeUrlComponent,
    encodeUrl: encodeUrl,
    decodeUrlComponent: decodeUrlComponent,
    decodeUrl: decodeUrl
  };
}();
module.exports = functions;
}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./utils":6}],3:[function(require,module,exports){
"use strict";

function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/**
 * © Copyright IBM Corp. 2016, 2017 All Rights Reserved
 *   Project name: JSONata
 *   This project is licensed under the MIT License, see LICENSE
 */

/**
 * @module JSONata
 * @description JSON query and transformation language
 */

var datetime = require('./datetime');
var fn = require('./functions');
var utils = require('./utils');
var parser = require('./parser');
var parseSignature = require('./signature');

/**
 * jsonata
 * @function
 * @param {Object} expr - JSONata expression
 * @returns {{evaluate: evaluate, assign: assign}} Evaluated expression
 */
var jsonata = function () {
  'use strict';

  var isNumeric = utils.isNumeric;
  var isArrayOfStrings = utils.isArrayOfStrings;
  var isArrayOfNumbers = utils.isArrayOfNumbers;
  var createSequence = utils.createSequence;
  var isSequence = utils.isSequence;
  var isFunction = utils.isFunction;
  var isLambda = utils.isLambda;
  var isIterable = utils.isIterable;
  var isPromise = utils.isPromise;
  var getFunctionArity = utils.getFunctionArity;
  var isDeepEqual = utils.isDeepEqual;

  // Start of Evaluator code

  var staticFrame = createFrame(null);

  /**
   * Evaluate expression against input data
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @returns {*} Evaluated input data
   */
  function _evaluate2(_x, _x2, _x3) {
    return _evaluate.apply(this, arguments);
  }
  /**
   * Evaluate path expression against input data
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @returns {*} Evaluated input data
   */
  function _evaluate() {
    _evaluate = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4(expr, input, environment) {
      var result, entryCallback, ii, exitCallback;
      return _regeneratorRuntime().wrap(function _callee4$(_context4) {
        while (1) switch (_context4.prev = _context4.next) {
          case 0:
            entryCallback = environment.lookup(Symbol["for"]('jsonata.__evaluate_entry'));
            if (!entryCallback) {
              _context4.next = 4;
              break;
            }
            _context4.next = 4;
            return entryCallback(expr, input, environment);
          case 4:
            _context4.t0 = expr.type;
            _context4.next = _context4.t0 === 'path' ? 7 : _context4.t0 === 'binary' ? 11 : _context4.t0 === 'unary' ? 15 : _context4.t0 === 'name' ? 19 : _context4.t0 === 'string' ? 21 : _context4.t0 === 'number' ? 21 : _context4.t0 === 'value' ? 21 : _context4.t0 === 'wildcard' ? 23 : _context4.t0 === 'descendant' ? 25 : _context4.t0 === 'parent' ? 27 : _context4.t0 === 'condition' ? 29 : _context4.t0 === 'block' ? 33 : _context4.t0 === 'bind' ? 37 : _context4.t0 === 'regex' ? 41 : _context4.t0 === 'function' ? 43 : _context4.t0 === 'variable' ? 47 : _context4.t0 === 'lambda' ? 49 : _context4.t0 === 'partial' ? 51 : _context4.t0 === 'apply' ? 55 : _context4.t0 === 'transform' ? 59 : 61;
            break;
          case 7:
            _context4.next = 9;
            return evaluatePath(expr, input, environment);
          case 9:
            result = _context4.sent;
            return _context4.abrupt("break", 61);
          case 11:
            _context4.next = 13;
            return evaluateBinary(expr, input, environment);
          case 13:
            result = _context4.sent;
            return _context4.abrupt("break", 61);
          case 15:
            _context4.next = 17;
            return evaluateUnary(expr, input, environment);
          case 17:
            result = _context4.sent;
            return _context4.abrupt("break", 61);
          case 19:
            result = evaluateName(expr, input, environment);
            return _context4.abrupt("break", 61);
          case 21:
            result = evaluateLiteral(expr, input, environment);
            return _context4.abrupt("break", 61);
          case 23:
            result = evaluateWildcard(expr, input, environment);
            return _context4.abrupt("break", 61);
          case 25:
            result = evaluateDescendants(expr, input, environment);
            return _context4.abrupt("break", 61);
          case 27:
            result = environment.lookup(expr.slot.label);
            return _context4.abrupt("break", 61);
          case 29:
            _context4.next = 31;
            return evaluateCondition(expr, input, environment);
          case 31:
            result = _context4.sent;
            return _context4.abrupt("break", 61);
          case 33:
            _context4.next = 35;
            return evaluateBlock(expr, input, environment);
          case 35:
            result = _context4.sent;
            return _context4.abrupt("break", 61);
          case 37:
            _context4.next = 39;
            return evaluateBindExpression(expr, input, environment);
          case 39:
            result = _context4.sent;
            return _context4.abrupt("break", 61);
          case 41:
            result = evaluateRegex(expr, input, environment);
            return _context4.abrupt("break", 61);
          case 43:
            _context4.next = 45;
            return evaluateFunction(expr, input, environment);
          case 45:
            result = _context4.sent;
            return _context4.abrupt("break", 61);
          case 47:
            result = evaluateVariable(expr, input, environment);
            return _context4.abrupt("break", 61);
          case 49:
            result = evaluateLambda(expr, input, environment);
            return _context4.abrupt("break", 61);
          case 51:
            _context4.next = 53;
            return evaluatePartialApplication(expr, input, environment);
          case 53:
            result = _context4.sent;
            return _context4.abrupt("break", 61);
          case 55:
            _context4.next = 57;
            return evaluateApplyExpression(expr, input, environment);
          case 57:
            result = _context4.sent;
            return _context4.abrupt("break", 61);
          case 59:
            result = evaluateTransformExpression(expr, input, environment);
            return _context4.abrupt("break", 61);
          case 61:
            if (!Object.prototype.hasOwnProperty.call(expr, 'predicate')) {
              _context4.next = 70;
              break;
            }
            ii = 0;
          case 63:
            if (!(ii < expr.predicate.length)) {
              _context4.next = 70;
              break;
            }
            _context4.next = 66;
            return evaluateFilter(expr.predicate[ii].expr, result, environment);
          case 66:
            result = _context4.sent;
          case 67:
            ii++;
            _context4.next = 63;
            break;
          case 70:
            if (!(expr.type !== 'path' && Object.prototype.hasOwnProperty.call(expr, 'group'))) {
              _context4.next = 74;
              break;
            }
            _context4.next = 73;
            return evaluateGroupExpression(expr.group, result, environment);
          case 73:
            result = _context4.sent;
          case 74:
            exitCallback = environment.lookup(Symbol["for"]('jsonata.__evaluate_exit'));
            if (!exitCallback) {
              _context4.next = 78;
              break;
            }
            _context4.next = 78;
            return exitCallback(expr, input, environment, result);
          case 78:
            if (result && isSequence(result) && !result.tupleStream) {
              if (expr.keepArray) {
                result.keepSingleton = true;
              }
              if (result.length === 0) {
                result = undefined;
              } else if (result.length === 1) {
                result = result.keepSingleton ? result : result[0];
              }
            }
            return _context4.abrupt("return", result);
          case 80:
          case "end":
            return _context4.stop();
        }
      }, _callee4);
    }));
    return _evaluate.apply(this, arguments);
  }
  function evaluatePath(_x4, _x5, _x6) {
    return _evaluatePath.apply(this, arguments);
  }
  function _evaluatePath() {
    _evaluatePath = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5(expr, input, environment) {
      var inputSequence, resultSequence, isTupleStream, tupleBindings, ii, step;
      return _regeneratorRuntime().wrap(function _callee5$(_context5) {
        while (1) switch (_context5.prev = _context5.next) {
          case 0:
            // expr is an array of steps
            // if the first step is a variable reference ($...), including root reference ($$),
            //   then the path is absolute rather than relative
            if (Array.isArray(input) && expr.steps[0].type !== 'variable') {
              inputSequence = input;
            } else {
              // if input is not an array, make it so
              inputSequence = createSequence(input);
            }
            isTupleStream = false;
            tupleBindings = undefined; // evaluate each step in turn
            ii = 0;
          case 4:
            if (!(ii < expr.steps.length)) {
              _context5.next = 28;
              break;
            }
            step = expr.steps[ii];
            if (step.tuple) {
              isTupleStream = true;
            }

            // if the first step is an explicit array constructor, then just evaluate that (i.e. don't iterate over a context array)
            if (!(ii === 0 && step.consarray)) {
              _context5.next = 13;
              break;
            }
            _context5.next = 10;
            return _evaluate2(step, inputSequence, environment);
          case 10:
            resultSequence = _context5.sent;
            _context5.next = 22;
            break;
          case 13:
            if (!isTupleStream) {
              _context5.next = 19;
              break;
            }
            _context5.next = 16;
            return evaluateTupleStep(step, inputSequence, tupleBindings, environment);
          case 16:
            tupleBindings = _context5.sent;
            _context5.next = 22;
            break;
          case 19:
            _context5.next = 21;
            return evaluateStep(step, inputSequence, environment, ii === expr.steps.length - 1);
          case 21:
            resultSequence = _context5.sent;
          case 22:
            if (!(!isTupleStream && (typeof resultSequence === 'undefined' || resultSequence.length === 0))) {
              _context5.next = 24;
              break;
            }
            return _context5.abrupt("break", 28);
          case 24:
            if (typeof step.focus === 'undefined') {
              inputSequence = resultSequence;
            }
          case 25:
            ii++;
            _context5.next = 4;
            break;
          case 28:
            if (isTupleStream) {
              if (expr.tuple) {
                // tuple stream is carrying ancestry information - keep this
                resultSequence = tupleBindings;
              } else {
                resultSequence = createSequence();
                for (ii = 0; ii < tupleBindings.length; ii++) {
                  resultSequence.push(tupleBindings[ii]['@']);
                }
              }
            }
            if (expr.keepSingletonArray) {
              // if the array is explicitly constructed in the expression and marked to promote singleton sequences to array
              if (Array.isArray(resultSequence) && resultSequence.cons && !resultSequence.sequence) {
                resultSequence = createSequence(resultSequence);
              }
              resultSequence.keepSingleton = true;
            }
            if (!expr.hasOwnProperty('group')) {
              _context5.next = 34;
              break;
            }
            _context5.next = 33;
            return evaluateGroupExpression(expr.group, isTupleStream ? tupleBindings : resultSequence, environment);
          case 33:
            resultSequence = _context5.sent;
          case 34:
            return _context5.abrupt("return", resultSequence);
          case 35:
          case "end":
            return _context5.stop();
        }
      }, _callee5);
    }));
    return _evaluatePath.apply(this, arguments);
  }
  function createFrameFromTuple(environment, tuple) {
    var frame = createFrame(environment);
    for (var prop in tuple) {
      frame.bind(prop, tuple[prop]);
    }
    return frame;
  }

  /**
   * Evaluate a step within a path
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @param {boolean} lastStep - flag the last step in a path
   * @returns {*} Evaluated input data
   */
  function evaluateStep(_x7, _x8, _x9, _x10) {
    return _evaluateStep.apply(this, arguments);
  }
  function _evaluateStep() {
    _evaluateStep = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee6(expr, input, environment, lastStep) {
      var result, ii, res, ss, resultSequence;
      return _regeneratorRuntime().wrap(function _callee6$(_context6) {
        while (1) switch (_context6.prev = _context6.next) {
          case 0:
            if (!(expr.type === 'sort')) {
              _context6.next = 9;
              break;
            }
            _context6.next = 3;
            return evaluateSortExpression(expr, input, environment);
          case 3:
            result = _context6.sent;
            if (!expr.stages) {
              _context6.next = 8;
              break;
            }
            _context6.next = 7;
            return evaluateStages(expr.stages, result, environment);
          case 7:
            result = _context6.sent;
          case 8:
            return _context6.abrupt("return", result);
          case 9:
            result = createSequence();
            ii = 0;
          case 11:
            if (!(ii < input.length)) {
              _context6.next = 28;
              break;
            }
            _context6.next = 14;
            return _evaluate2(expr, input[ii], environment);
          case 14:
            res = _context6.sent;
            if (!expr.stages) {
              _context6.next = 24;
              break;
            }
            ss = 0;
          case 17:
            if (!(ss < expr.stages.length)) {
              _context6.next = 24;
              break;
            }
            _context6.next = 20;
            return evaluateFilter(expr.stages[ss].expr, res, environment);
          case 20:
            res = _context6.sent;
          case 21:
            ss++;
            _context6.next = 17;
            break;
          case 24:
            if (typeof res !== 'undefined') {
              result.push(res);
            }
          case 25:
            ii++;
            _context6.next = 11;
            break;
          case 28:
            resultSequence = createSequence();
            if (lastStep && result.length === 1 && Array.isArray(result[0]) && !isSequence(result[0])) {
              resultSequence = result[0];
            } else {
              // flatten the sequence
              result.forEach(function (res) {
                if (!Array.isArray(res) || res.cons) {
                  // it's not an array - just push into the result sequence
                  resultSequence.push(res);
                } else {
                  // res is a sequence - flatten it into the parent sequence
                  res.forEach(function (val) {
                    return resultSequence.push(val);
                  });
                }
              });
            }
            return _context6.abrupt("return", resultSequence);
          case 31:
          case "end":
            return _context6.stop();
        }
      }, _callee6);
    }));
    return _evaluateStep.apply(this, arguments);
  }
  function evaluateStages(_x11, _x12, _x13) {
    return _evaluateStages.apply(this, arguments);
  }
  /**
   * Evaluate a step within a path
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @param {Object} tupleBindings - The tuple stream
   * @param {Object} environment - Environment
   * @returns {*} Evaluated input data
   */
  function _evaluateStages() {
    _evaluateStages = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee7(stages, input, environment) {
      var result, ss, stage, ee, tuple;
      return _regeneratorRuntime().wrap(function _callee7$(_context7) {
        while (1) switch (_context7.prev = _context7.next) {
          case 0:
            result = input;
            ss = 0;
          case 2:
            if (!(ss < stages.length)) {
              _context7.next = 16;
              break;
            }
            stage = stages[ss];
            _context7.t0 = stage.type;
            _context7.next = _context7.t0 === 'filter' ? 7 : _context7.t0 === 'index' ? 11 : 13;
            break;
          case 7:
            _context7.next = 9;
            return evaluateFilter(stage.expr, result, environment);
          case 9:
            result = _context7.sent;
            return _context7.abrupt("break", 13);
          case 11:
            for (ee = 0; ee < result.length; ee++) {
              tuple = result[ee];
              tuple[stage.value] = ee;
            }
            return _context7.abrupt("break", 13);
          case 13:
            ss++;
            _context7.next = 2;
            break;
          case 16:
            return _context7.abrupt("return", result);
          case 17:
          case "end":
            return _context7.stop();
        }
      }, _callee7);
    }));
    return _evaluateStages.apply(this, arguments);
  }
  function evaluateTupleStep(_x14, _x15, _x16, _x17) {
    return _evaluateTupleStep.apply(this, arguments);
  }
  /**
   * Apply filter predicate to input data
   * @param {Object} predicate - filter expression
   * @param {Object} input - Input data to apply predicates against
   * @param {Object} environment - Environment
   * @returns {*} Result after applying predicates
   */
  function _evaluateTupleStep() {
    _evaluateTupleStep = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee8(expr, input, tupleBindings, environment) {
      var result, sorted, ss, tuple, stepEnv, ee, res, bb;
      return _regeneratorRuntime().wrap(function _callee8$(_context8) {
        while (1) switch (_context8.prev = _context8.next) {
          case 0:
            if (!(expr.type === 'sort')) {
              _context8.next = 18;
              break;
            }
            if (!tupleBindings) {
              _context8.next = 7;
              break;
            }
            _context8.next = 4;
            return evaluateSortExpression(expr, tupleBindings, environment);
          case 4:
            result = _context8.sent;
            _context8.next = 13;
            break;
          case 7:
            _context8.next = 9;
            return evaluateSortExpression(expr, input, environment);
          case 9:
            sorted = _context8.sent;
            result = createSequence();
            result.tupleStream = true;
            for (ss = 0; ss < sorted.length; ss++) {
              tuple = {
                '@': sorted[ss]
              };
              tuple[expr.index] = ss;
              result.push(tuple);
            }
          case 13:
            if (!expr.stages) {
              _context8.next = 17;
              break;
            }
            _context8.next = 16;
            return evaluateStages(expr.stages, result, environment);
          case 16:
            result = _context8.sent;
          case 17:
            return _context8.abrupt("return", result);
          case 18:
            result = createSequence();
            result.tupleStream = true;
            stepEnv = environment;
            if (tupleBindings === undefined) {
              tupleBindings = input.map(function (item) {
                return {
                  '@': item
                };
              });
            }
            ee = 0;
          case 23:
            if (!(ee < tupleBindings.length)) {
              _context8.next = 32;
              break;
            }
            stepEnv = createFrameFromTuple(environment, tupleBindings[ee]);
            _context8.next = 27;
            return _evaluate2(expr, tupleBindings[ee]['@'], stepEnv);
          case 27:
            res = _context8.sent;
            // res is the binding sequence for the output tuple stream
            if (typeof res !== 'undefined') {
              if (!Array.isArray(res)) {
                res = [res];
              }
              for (bb = 0; bb < res.length; bb++) {
                tuple = {};
                Object.assign(tuple, tupleBindings[ee]);
                if (res.tupleStream) {
                  Object.assign(tuple, res[bb]);
                } else {
                  if (expr.focus) {
                    tuple[expr.focus] = res[bb];
                    tuple['@'] = tupleBindings[ee]['@'];
                  } else {
                    tuple['@'] = res[bb];
                  }
                  if (expr.index) {
                    tuple[expr.index] = bb;
                  }
                  if (expr.ancestor) {
                    tuple[expr.ancestor.label] = tupleBindings[ee]['@'];
                  }
                }
                result.push(tuple);
              }
            }
          case 29:
            ee++;
            _context8.next = 23;
            break;
          case 32:
            if (!expr.stages) {
              _context8.next = 36;
              break;
            }
            _context8.next = 35;
            return evaluateStages(expr.stages, result, environment);
          case 35:
            result = _context8.sent;
          case 36:
            return _context8.abrupt("return", result);
          case 37:
          case "end":
            return _context8.stop();
        }
      }, _callee8);
    }));
    return _evaluateTupleStep.apply(this, arguments);
  }
  function evaluateFilter(_x18, _x19, _x20) {
    return _evaluateFilter.apply(this, arguments);
  }
  /**
   * Evaluate binary expression against input data
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @returns {*} Evaluated input data
   */
  function _evaluateFilter() {
    _evaluateFilter = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee9(predicate, input, environment) {
      var results, index, item, context, env, res;
      return _regeneratorRuntime().wrap(function _callee9$(_context9) {
        while (1) switch (_context9.prev = _context9.next) {
          case 0:
            results = createSequence();
            if (input && input.tupleStream) {
              results.tupleStream = true;
            }
            if (!Array.isArray(input)) {
              input = createSequence(input);
            }
            if (!(predicate.type === 'number')) {
              _context9.next = 10;
              break;
            }
            index = Math.floor(predicate.value); // round it down
            if (index < 0) {
              // count in from end of array
              index = input.length + index;
            }
            item = input[index];
            if (typeof item !== 'undefined') {
              if (Array.isArray(item)) {
                results = item;
              } else {
                results.push(item);
              }
            }
            _context9.next = 24;
            break;
          case 10:
            index = 0;
          case 11:
            if (!(index < input.length)) {
              _context9.next = 24;
              break;
            }
            item = input[index];
            context = item;
            env = environment;
            if (input.tupleStream) {
              context = item['@'];
              env = createFrameFromTuple(environment, item);
            }
            _context9.next = 18;
            return _evaluate2(predicate, context, env);
          case 18:
            res = _context9.sent;
            if (isNumeric(res)) {
              res = [res];
            }
            if (isArrayOfNumbers(res)) {
              res.forEach(function (ires) {
                // round it down
                var ii = Math.floor(ires);
                if (ii < 0) {
                  // count in from end of array
                  ii = input.length + ii;
                }
                if (ii === index) {
                  results.push(item);
                }
              });
            } else if (fn["boolean"](res)) {
              // truthy
              results.push(item);
            }
          case 21:
            index++;
            _context9.next = 11;
            break;
          case 24:
            return _context9.abrupt("return", results);
          case 25:
          case "end":
            return _context9.stop();
        }
      }, _callee9);
    }));
    return _evaluateFilter.apply(this, arguments);
  }
  function evaluateBinary(_x21, _x22, _x23) {
    return _evaluateBinary.apply(this, arguments);
  }
  /**
   * Evaluate unary expression against input data
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @returns {*} Evaluated input data
   */
  function _evaluateBinary() {
    _evaluateBinary = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee11(expr, input, environment) {
      var result, lhs, op, evalrhs, rhs;
      return _regeneratorRuntime().wrap(function _callee11$(_context11) {
        while (1) switch (_context11.prev = _context11.next) {
          case 0:
            _context11.next = 2;
            return _evaluate2(expr.lhs, input, environment);
          case 2:
            lhs = _context11.sent;
            op = expr.value; //defer evaluation of RHS to allow short-circuiting
            evalrhs = /*#__PURE__*/function () {
              var _ref3 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee10() {
                return _regeneratorRuntime().wrap(function _callee10$(_context10) {
                  while (1) switch (_context10.prev = _context10.next) {
                    case 0:
                      _context10.next = 2;
                      return _evaluate2(expr.rhs, input, environment);
                    case 2:
                      return _context10.abrupt("return", _context10.sent);
                    case 3:
                    case "end":
                      return _context10.stop();
                  }
                }, _callee10);
              }));
              return function evalrhs() {
                return _ref3.apply(this, arguments);
              };
            }();
            if (!(op === "and" || op === "or")) {
              _context11.next = 17;
              break;
            }
            _context11.prev = 6;
            _context11.next = 9;
            return evaluateBooleanExpression(lhs, evalrhs, op);
          case 9:
            return _context11.abrupt("return", _context11.sent);
          case 12:
            _context11.prev = 12;
            _context11.t0 = _context11["catch"](6);
            _context11.t0.position = expr.position;
            _context11.t0.token = op;
            throw _context11.t0;
          case 17:
            _context11.next = 19;
            return evalrhs();
          case 19:
            rhs = _context11.sent;
            _context11.prev = 20;
            _context11.t1 = op;
            _context11.next = _context11.t1 === '+' ? 24 : _context11.t1 === '-' ? 24 : _context11.t1 === '*' ? 24 : _context11.t1 === '/' ? 24 : _context11.t1 === '%' ? 24 : _context11.t1 === '=' ? 26 : _context11.t1 === '!=' ? 26 : _context11.t1 === '<' ? 28 : _context11.t1 === '<=' ? 28 : _context11.t1 === '>' ? 28 : _context11.t1 === '>=' ? 28 : _context11.t1 === '&' ? 30 : _context11.t1 === '..' ? 32 : _context11.t1 === 'in' ? 34 : 36;
            break;
          case 24:
            result = evaluateNumericExpression(lhs, rhs, op);
            return _context11.abrupt("break", 36);
          case 26:
            result = evaluateEqualityExpression(lhs, rhs, op);
            return _context11.abrupt("break", 36);
          case 28:
            result = evaluateComparisonExpression(lhs, rhs, op);
            return _context11.abrupt("break", 36);
          case 30:
            result = evaluateStringConcat(lhs, rhs);
            return _context11.abrupt("break", 36);
          case 32:
            result = evaluateRangeExpression(lhs, rhs);
            return _context11.abrupt("break", 36);
          case 34:
            result = evaluateIncludesExpression(lhs, rhs);
            return _context11.abrupt("break", 36);
          case 36:
            _context11.next = 43;
            break;
          case 38:
            _context11.prev = 38;
            _context11.t2 = _context11["catch"](20);
            _context11.t2.position = expr.position;
            _context11.t2.token = op;
            throw _context11.t2;
          case 43:
            return _context11.abrupt("return", result);
          case 44:
          case "end":
            return _context11.stop();
        }
      }, _callee11, null, [[6, 12], [20, 38]]);
    }));
    return _evaluateBinary.apply(this, arguments);
  }
  function evaluateUnary(_x24, _x25, _x26) {
    return _evaluateUnary.apply(this, arguments);
  }
  /**
   * Evaluate name object against input data
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @returns {*} Evaluated input data
   */
  function _evaluateUnary() {
    _evaluateUnary = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee13(expr, input, environment) {
      var result, generators, _iterator, _step, generator, _generator, item, value;
      return _regeneratorRuntime().wrap(function _callee13$(_context13) {
        while (1) switch (_context13.prev = _context13.next) {
          case 0:
            _context13.t0 = expr.value;
            _context13.next = _context13.t0 === '-' ? 3 : _context13.t0 === '[' ? 16 : _context13.t0 === '{' ? 24 : 28;
            break;
          case 3:
            _context13.next = 5;
            return _evaluate2(expr.expression, input, environment);
          case 5:
            result = _context13.sent;
            if (!(typeof result === 'undefined')) {
              _context13.next = 10;
              break;
            }
            result = undefined;
            _context13.next = 15;
            break;
          case 10:
            if (!isNumeric(result)) {
              _context13.next = 14;
              break;
            }
            result = -result;
            _context13.next = 15;
            break;
          case 14:
            throw {
              code: "D1002",
              stack: new Error().stack,
              position: expr.position,
              token: expr.value,
              value: result
            };
          case 15:
            return _context13.abrupt("break", 28);
          case 16:
            // array constructor - evaluate each item
            result = [];
            _context13.next = 19;
            return Promise.all(expr.expressions.map(/*#__PURE__*/function () {
              var _ref4 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee12(item, idx) {
                return _regeneratorRuntime().wrap(function _callee12$(_context12) {
                  while (1) switch (_context12.prev = _context12.next) {
                    case 0:
                      environment.isParallelCall = idx > 0;
                      _context12.t0 = item;
                      _context12.next = 4;
                      return _evaluate2(item, input, environment);
                    case 4:
                      _context12.t1 = _context12.sent;
                      return _context12.abrupt("return", [_context12.t0, _context12.t1]);
                    case 6:
                    case "end":
                      return _context12.stop();
                  }
                }, _callee12);
              }));
              return function (_x75, _x76) {
                return _ref4.apply(this, arguments);
              };
            }()));
          case 19:
            generators = _context13.sent;
            _iterator = _createForOfIteratorHelper(generators);
            try {
              for (_iterator.s(); !(_step = _iterator.n()).done;) {
                generator = _step.value;
                _generator = _slicedToArray(generator, 2), item = _generator[0], value = _generator[1];
                if (typeof value !== 'undefined') {
                  if (item.value === '[') {
                    result.push(value);
                  } else {
                    result = fn.append(result, value);
                  }
                }
              }
            } catch (err) {
              _iterator.e(err);
            } finally {
              _iterator.f();
            }
            if (expr.consarray) {
              Object.defineProperty(result, 'cons', {
                enumerable: false,
                configurable: false,
                value: true
              });
            }
            return _context13.abrupt("break", 28);
          case 24:
            _context13.next = 26;
            return evaluateGroupExpression(expr, input, environment);
          case 26:
            result = _context13.sent;
            return _context13.abrupt("break", 28);
          case 28:
            return _context13.abrupt("return", result);
          case 29:
          case "end":
            return _context13.stop();
        }
      }, _callee13);
    }));
    return _evaluateUnary.apply(this, arguments);
  }
  function evaluateName(expr, input, environment) {
    // lookup the 'name' item in the input
    return fn.lookup(input, expr.value);
  }

  /**
   * Evaluate literal against input data
   * @param {Object} expr - JSONata expression
   * @returns {*} Evaluated input data
   */
  function evaluateLiteral(expr) {
    return expr.value;
  }

  /**
   * Evaluate wildcard against input data
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @returns {*} Evaluated input data
   */
  function evaluateWildcard(expr, input) {
    var results = createSequence();
    if (Array.isArray(input) && input.outerWrapper && input.length > 0) {
      input = input[0];
    }
    if (input !== null && _typeof(input) === 'object') {
      Object.keys(input).forEach(function (key) {
        var value = input[key];
        if (Array.isArray(value)) {
          value = flatten(value);
          results = fn.append(results, value);
        } else {
          results.push(value);
        }
      });
    }

    //        result = normalizeSequence(results);
    return results;
  }

  /**
   * Returns a flattened array
   * @param {Array} arg - the array to be flatten
   * @param {Array} flattened - carries the flattened array - if not defined, will initialize to []
   * @returns {Array} - the flattened array
   */
  function flatten(arg, flattened) {
    if (typeof flattened === 'undefined') {
      flattened = [];
    }
    if (Array.isArray(arg)) {
      arg.forEach(function (item) {
        flatten(item, flattened);
      });
    } else {
      flattened.push(arg);
    }
    return flattened;
  }

  /**
   * Evaluate descendants against input data
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @returns {*} Evaluated input data
   */
  function evaluateDescendants(expr, input) {
    var result;
    var resultSequence = createSequence();
    if (typeof input !== 'undefined') {
      // traverse all descendants of this object/array
      recurseDescendants(input, resultSequence);
      if (resultSequence.length === 1) {
        result = resultSequence[0];
      } else {
        result = resultSequence;
      }
    }
    return result;
  }

  /**
   * Recurse through descendants
   * @param {Object} input - Input data
   * @param {Object} results - Results
   */
  function recurseDescendants(input, results) {
    // this is the equivalent of //* in XPath
    if (!Array.isArray(input)) {
      results.push(input);
    }
    if (Array.isArray(input)) {
      input.forEach(function (member) {
        recurseDescendants(member, results);
      });
    } else if (input !== null && _typeof(input) === 'object') {
      Object.keys(input).forEach(function (key) {
        recurseDescendants(input[key], results);
      });
    }
  }

  /**
   * Evaluate numeric expression against input data
   * @param {Object} lhs - LHS value
   * @param {Object} rhs - RHS value
   * @param {Object} op - opcode
   * @returns {*} Result
   */
  function evaluateNumericExpression(lhs, rhs, op) {
    var result;
    if (typeof lhs !== 'undefined' && !isNumeric(lhs)) {
      throw {
        code: "T2001",
        stack: new Error().stack,
        value: lhs
      };
    }
    if (typeof rhs !== 'undefined' && !isNumeric(rhs)) {
      throw {
        code: "T2002",
        stack: new Error().stack,
        value: rhs
      };
    }
    if (typeof lhs === 'undefined' || typeof rhs === 'undefined') {
      // if either side is undefined, the result is undefined
      return result;
    }
    switch (op) {
      case '+':
        result = lhs + rhs;
        break;
      case '-':
        result = lhs - rhs;
        break;
      case '*':
        result = lhs * rhs;
        break;
      case '/':
        result = lhs / rhs;
        break;
      case '%':
        result = lhs % rhs;
        break;
    }
    return result;
  }

  /**
   * Evaluate equality expression against input data
   * @param {Object} lhs - LHS value
   * @param {Object} rhs - RHS value
   * @param {Object} op - opcode
   * @returns {*} Result
   */
  function evaluateEqualityExpression(lhs, rhs, op) {
    var result;

    // type checks
    var ltype = _typeof(lhs);
    var rtype = _typeof(rhs);
    if (ltype === 'undefined' || rtype === 'undefined') {
      // if either side is undefined, the result is false
      return false;
    }
    switch (op) {
      case '=':
        result = isDeepEqual(lhs, rhs);
        break;
      case '!=':
        result = !isDeepEqual(lhs, rhs);
        break;
    }
    return result;
  }

  /**
   * Evaluate comparison expression against input data
   * @param {Object} lhs - LHS value
   * @param {Object} rhs - RHS value
   * @param {Object} op - opcode
   * @returns {*} Result
   */
  function evaluateComparisonExpression(lhs, rhs, op) {
    var result;

    // type checks
    var ltype = _typeof(lhs);
    var rtype = _typeof(rhs);
    var lcomparable = ltype === 'undefined' || ltype === 'string' || ltype === 'number';
    var rcomparable = rtype === 'undefined' || rtype === 'string' || rtype === 'number';

    // if either aa or bb are not comparable (string or numeric) values, then throw an error
    if (!lcomparable || !rcomparable) {
      throw {
        code: "T2010",
        stack: new Error().stack,
        value: !(ltype === 'string' || ltype === 'number') ? lhs : rhs
      };
    }

    // if either side is undefined, the result is undefined
    if (ltype === 'undefined' || rtype === 'undefined') {
      return undefined;
    }

    //if aa and bb are not of the same type
    if (ltype !== rtype) {
      throw {
        code: "T2009",
        stack: new Error().stack,
        value: lhs,
        value2: rhs
      };
    }
    switch (op) {
      case '<':
        result = lhs < rhs;
        break;
      case '<=':
        result = lhs <= rhs;
        break;
      case '>':
        result = lhs > rhs;
        break;
      case '>=':
        result = lhs >= rhs;
        break;
    }
    return result;
  }

  /**
   * Inclusion operator - in
   *
   * @param {Object} lhs - LHS value
   * @param {Object} rhs - RHS value
   * @returns {boolean} - true if lhs is a member of rhs
   */
  function evaluateIncludesExpression(lhs, rhs) {
    var result = false;
    if (typeof lhs === 'undefined' || typeof rhs === 'undefined') {
      // if either side is undefined, the result is false
      return false;
    }
    if (!Array.isArray(rhs)) {
      rhs = [rhs];
    }
    for (var i = 0; i < rhs.length; i++) {
      if (rhs[i] === lhs) {
        result = true;
        break;
      }
    }
    return result;
  }

  /**
   * Evaluate boolean expression against input data
   * @param {Object} lhs - LHS value
   * @param {Function} evalrhs - function to evaluate RHS value
   * @param {Object} op - opcode
   * @returns {*} Result
   */
  function evaluateBooleanExpression(_x27, _x28, _x29) {
    return _evaluateBooleanExpression.apply(this, arguments);
  }
  function _evaluateBooleanExpression() {
    _evaluateBooleanExpression = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee14(lhs, evalrhs, op) {
      var result, lBool;
      return _regeneratorRuntime().wrap(function _callee14$(_context14) {
        while (1) switch (_context14.prev = _context14.next) {
          case 0:
            lBool = boolize(lhs);
            _context14.t0 = op;
            _context14.next = _context14.t0 === 'and' ? 4 : _context14.t0 === 'or' ? 13 : 22;
            break;
          case 4:
            _context14.t1 = lBool;
            if (!_context14.t1) {
              _context14.next = 11;
              break;
            }
            _context14.t2 = boolize;
            _context14.next = 9;
            return evalrhs();
          case 9:
            _context14.t3 = _context14.sent;
            _context14.t1 = (0, _context14.t2)(_context14.t3);
          case 11:
            result = _context14.t1;
            return _context14.abrupt("break", 22);
          case 13:
            _context14.t4 = lBool;
            if (_context14.t4) {
              _context14.next = 20;
              break;
            }
            _context14.t5 = boolize;
            _context14.next = 18;
            return evalrhs();
          case 18:
            _context14.t6 = _context14.sent;
            _context14.t4 = (0, _context14.t5)(_context14.t6);
          case 20:
            result = _context14.t4;
            return _context14.abrupt("break", 22);
          case 22:
            return _context14.abrupt("return", result);
          case 23:
          case "end":
            return _context14.stop();
        }
      }, _callee14);
    }));
    return _evaluateBooleanExpression.apply(this, arguments);
  }
  function boolize(value) {
    var booledValue = fn["boolean"](value);
    return typeof booledValue === 'undefined' ? false : booledValue;
  }

  /**
   * Evaluate string concatenation against input data
   * @param {Object} lhs - LHS value
   * @param {Object} rhs - RHS value
   * @returns {string|*} Concatenated string
   */
  function evaluateStringConcat(lhs, rhs) {
    var result;
    var lstr = '';
    var rstr = '';
    if (typeof lhs !== 'undefined') {
      lstr = fn.string(lhs);
    }
    if (typeof rhs !== 'undefined') {
      rstr = fn.string(rhs);
    }
    result = lstr.concat(rstr);
    return result;
  }

  /**
   * Evaluate group expression against input data
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @returns {{}} Evaluated input data
   */
  function evaluateGroupExpression(_x30, _x31, _x32) {
    return _evaluateGroupExpression.apply(this, arguments);
  }
  function _evaluateGroupExpression() {
    _evaluateGroupExpression = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee16(expr, input, environment) {
      var result, groups, reduce, itemIndex, item, env, pairIndex, pair, key, entry, generators, _iterator2, _step2, generator, _yield$generator, _yield$generator2, value;
      return _regeneratorRuntime().wrap(function _callee16$(_context16) {
        while (1) switch (_context16.prev = _context16.next) {
          case 0:
            result = {};
            groups = {};
            reduce = input && input.tupleStream ? true : false; // group the input sequence by 'key' expression
            if (!Array.isArray(input)) {
              input = createSequence(input);
            }
            // if the array is empty, add an undefined entry to enable literal JSON object to be generated
            if (input.length === 0) {
              input.push(undefined);
            }
            itemIndex = 0;
          case 6:
            if (!(itemIndex < input.length)) {
              _context16.next = 32;
              break;
            }
            item = input[itemIndex];
            env = reduce ? createFrameFromTuple(environment, item) : environment;
            pairIndex = 0;
          case 10:
            if (!(pairIndex < expr.lhs.length)) {
              _context16.next = 29;
              break;
            }
            pair = expr.lhs[pairIndex];
            _context16.next = 14;
            return _evaluate2(pair[0], reduce ? item['@'] : item, env);
          case 14:
            key = _context16.sent;
            if (!(typeof key !== 'string' && key !== undefined)) {
              _context16.next = 17;
              break;
            }
            throw {
              code: "T1003",
              stack: new Error().stack,
              position: expr.position,
              value: key
            };
          case 17:
            if (!(key !== undefined)) {
              _context16.next = 26;
              break;
            }
            entry = {
              data: item,
              exprIndex: pairIndex
            };
            if (!groups.hasOwnProperty(key)) {
              _context16.next = 25;
              break;
            }
            if (!(groups[key].exprIndex !== pairIndex)) {
              _context16.next = 22;
              break;
            }
            throw {
              code: "D1009",
              stack: new Error().stack,
              position: expr.position,
              value: key
            };
          case 22:
            // append it as an array
            groups[key].data = fn.append(groups[key].data, item);
            _context16.next = 26;
            break;
          case 25:
            groups[key] = entry;
          case 26:
            pairIndex++;
            _context16.next = 10;
            break;
          case 29:
            itemIndex++;
            _context16.next = 6;
            break;
          case 32:
            _context16.next = 34;
            return Promise.all(Object.keys(groups).map(/*#__PURE__*/function () {
              var _ref5 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee15(key, idx) {
                var entry, context, env, tuple;
                return _regeneratorRuntime().wrap(function _callee15$(_context15) {
                  while (1) switch (_context15.prev = _context15.next) {
                    case 0:
                      entry = groups[key];
                      context = entry.data;
                      env = environment;
                      if (reduce) {
                        tuple = reduceTupleStream(entry.data);
                        context = tuple['@'];
                        delete tuple['@'];
                        env = createFrameFromTuple(environment, tuple);
                      }
                      environment.isParallelCall = idx > 0;
                      _context15.t0 = key;
                      _context15.next = 8;
                      return _evaluate2(expr.lhs[entry.exprIndex][1], context, env);
                    case 8:
                      _context15.t1 = _context15.sent;
                      return _context15.abrupt("return", [_context15.t0, _context15.t1]);
                    case 10:
                    case "end":
                      return _context15.stop();
                  }
                }, _callee15);
              }));
              return function (_x77, _x78) {
                return _ref5.apply(this, arguments);
              };
            }()));
          case 34:
            generators = _context16.sent;
            _iterator2 = _createForOfIteratorHelper(generators);
            _context16.prev = 36;
            _iterator2.s();
          case 38:
            if ((_step2 = _iterator2.n()).done) {
              _context16.next = 49;
              break;
            }
            generator = _step2.value;
            _context16.next = 42;
            return generator;
          case 42:
            _yield$generator = _context16.sent;
            _yield$generator2 = _slicedToArray(_yield$generator, 2);
            key = _yield$generator2[0];
            value = _yield$generator2[1];
            if (typeof value !== 'undefined') {
              result[key] = value;
            }
          case 47:
            _context16.next = 38;
            break;
          case 49:
            _context16.next = 54;
            break;
          case 51:
            _context16.prev = 51;
            _context16.t0 = _context16["catch"](36);
            _iterator2.e(_context16.t0);
          case 54:
            _context16.prev = 54;
            _iterator2.f();
            return _context16.finish(54);
          case 57:
            return _context16.abrupt("return", result);
          case 58:
          case "end":
            return _context16.stop();
        }
      }, _callee16, null, [[36, 51, 54, 57]]);
    }));
    return _evaluateGroupExpression.apply(this, arguments);
  }
  function reduceTupleStream(tupleStream) {
    if (!Array.isArray(tupleStream)) {
      return tupleStream;
    }
    var result = {};
    Object.assign(result, tupleStream[0]);
    for (var ii = 1; ii < tupleStream.length; ii++) {
      for (var prop in tupleStream[ii]) {
        result[prop] = fn.append(result[prop], tupleStream[ii][prop]);
      }
    }
    return result;
  }

  /**
   * Evaluate range expression against input data
   * @param {Object} lhs - LHS value
   * @param {Object} rhs - RHS value
   * @returns {Array} Resultant array
   */
  function evaluateRangeExpression(lhs, rhs) {
    var result;
    if (typeof lhs !== 'undefined' && !Number.isInteger(lhs)) {
      throw {
        code: "T2003",
        stack: new Error().stack,
        value: lhs
      };
    }
    if (typeof rhs !== 'undefined' && !Number.isInteger(rhs)) {
      throw {
        code: "T2004",
        stack: new Error().stack,
        value: rhs
      };
    }
    if (typeof lhs === 'undefined' || typeof rhs === 'undefined') {
      // if either side is undefined, the result is undefined
      return result;
    }
    if (lhs > rhs) {
      // if the lhs is greater than the rhs, return undefined
      return result;
    }

    // limit the size of the array to ten million entries (1e7)
    // this is an implementation defined limit to protect against
    // memory and performance issues.  This value may increase in the future.
    var size = rhs - lhs + 1;
    if (size > 1e7) {
      throw {
        code: "D2014",
        stack: new Error().stack,
        value: size
      };
    }
    result = new Array(size);
    for (var item = lhs, index = 0; item <= rhs; item++, index++) {
      result[index] = item;
    }
    result.sequence = true;
    return result;
  }

  /**
   * Evaluate bind expression against input data
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @returns {*} Evaluated input data
   */
  function evaluateBindExpression(_x33, _x34, _x35) {
    return _evaluateBindExpression.apply(this, arguments);
  }
  /**
   * Evaluate condition against input data
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @returns {*} Evaluated input data
   */
  function _evaluateBindExpression() {
    _evaluateBindExpression = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee17(expr, input, environment) {
      var value;
      return _regeneratorRuntime().wrap(function _callee17$(_context17) {
        while (1) switch (_context17.prev = _context17.next) {
          case 0:
            _context17.next = 2;
            return _evaluate2(expr.rhs, input, environment);
          case 2:
            value = _context17.sent;
            environment.bind(expr.lhs.value, value);
            return _context17.abrupt("return", value);
          case 5:
          case "end":
            return _context17.stop();
        }
      }, _callee17);
    }));
    return _evaluateBindExpression.apply(this, arguments);
  }
  function evaluateCondition(_x36, _x37, _x38) {
    return _evaluateCondition.apply(this, arguments);
  }
  /**
   * Evaluate block against input data
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @returns {*} Evaluated input data
   */
  function _evaluateCondition() {
    _evaluateCondition = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee18(expr, input, environment) {
      var result, condition;
      return _regeneratorRuntime().wrap(function _callee18$(_context18) {
        while (1) switch (_context18.prev = _context18.next) {
          case 0:
            _context18.next = 2;
            return _evaluate2(expr.condition, input, environment);
          case 2:
            condition = _context18.sent;
            if (!fn["boolean"](condition)) {
              _context18.next = 9;
              break;
            }
            _context18.next = 6;
            return _evaluate2(expr.then, input, environment);
          case 6:
            result = _context18.sent;
            _context18.next = 13;
            break;
          case 9:
            if (!(typeof expr["else"] !== 'undefined')) {
              _context18.next = 13;
              break;
            }
            _context18.next = 12;
            return _evaluate2(expr["else"], input, environment);
          case 12:
            result = _context18.sent;
          case 13:
            return _context18.abrupt("return", result);
          case 14:
          case "end":
            return _context18.stop();
        }
      }, _callee18);
    }));
    return _evaluateCondition.apply(this, arguments);
  }
  function evaluateBlock(_x39, _x40, _x41) {
    return _evaluateBlock.apply(this, arguments);
  }
  /**
   * Prepare a regex
   * @param {Object} expr - expression containing regex
   * @returns {Function} Higher order function representing prepared regex
   */
  function _evaluateBlock() {
    _evaluateBlock = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee19(expr, input, environment) {
      var result, frame, ii;
      return _regeneratorRuntime().wrap(function _callee19$(_context19) {
        while (1) switch (_context19.prev = _context19.next) {
          case 0:
            // create a new frame to limit the scope of variable assignments
            // TODO, only do this if the post-parse stage has flagged this as required
            frame = createFrame(environment); // invoke each expression in turn
            // only return the result of the last one
            ii = 0;
          case 2:
            if (!(ii < expr.expressions.length)) {
              _context19.next = 9;
              break;
            }
            _context19.next = 5;
            return _evaluate2(expr.expressions[ii], input, frame);
          case 5:
            result = _context19.sent;
          case 6:
            ii++;
            _context19.next = 2;
            break;
          case 9:
            return _context19.abrupt("return", result);
          case 10:
          case "end":
            return _context19.stop();
        }
      }, _callee19);
    }));
    return _evaluateBlock.apply(this, arguments);
  }
  function evaluateRegex(expr) {
    var re = new jsonata.RegexEngine(expr.value);
    var _closure = function closure(str, fromIndex) {
      var result;
      re.lastIndex = fromIndex || 0;
      var match = re.exec(str);
      if (match !== null) {
        result = {
          match: match[0],
          start: match.index,
          end: match.index + match[0].length,
          groups: []
        };
        if (match.length > 1) {
          for (var i = 1; i < match.length; i++) {
            result.groups.push(match[i]);
          }
        }
        result.next = function () {
          if (re.lastIndex >= str.length) {
            return undefined;
          } else {
            var next = _closure(str, re.lastIndex);
            if (next && next.match === '') {
              // matches zero length string; this will never progress
              throw {
                code: "D1004",
                stack: new Error().stack,
                position: expr.position,
                value: expr.value.source
              };
            }
            return next;
          }
        };
      }
      return result;
    };
    return _closure;
  }

  /**
   * Evaluate variable against input data
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @returns {*} Evaluated input data
   */
  function evaluateVariable(expr, input, environment) {
    // lookup the variable value in the environment
    var result;
    // if the variable name is empty string, then it refers to context value
    if (expr.value === '') {
      result = input && input.outerWrapper ? input[0] : input;
    } else {
      result = environment.lookup(expr.value);
    }
    return result;
  }

  /**
   * sort / order-by operator
   * @param {Object} expr - AST for operator
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @returns {*} Ordered sequence
   */
  function evaluateSortExpression(_x42, _x43, _x44) {
    return _evaluateSortExpression.apply(this, arguments);
  }
  /**
   * create a transformer function
   * @param {Object} expr - AST for operator
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @returns {*} tranformer function
   */
  function _evaluateSortExpression() {
    _evaluateSortExpression = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee21(expr, input, environment) {
      var result, lhs, isTupleSort, comparator, focus;
      return _regeneratorRuntime().wrap(function _callee21$(_context21) {
        while (1) switch (_context21.prev = _context21.next) {
          case 0:
            // evaluate the lhs, then sort the results in order according to rhs expression
            lhs = input;
            isTupleSort = input.tupleStream ? true : false; // sort the lhs array
            // use comparator function
            comparator = /*#__PURE__*/function () {
              var _ref6 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee20(a, b) {
                var comp, index, term, context, env, aa, bb, atype, btype;
                return _regeneratorRuntime().wrap(function _callee20$(_context20) {
                  while (1) switch (_context20.prev = _context20.next) {
                    case 0:
                      // expr.terms is an array of order-by in priority order
                      comp = 0;
                      index = 0;
                    case 2:
                      if (!(comp === 0 && index < expr.terms.length)) {
                        _context20.next = 37;
                        break;
                      }
                      term = expr.terms[index]; //evaluate the sort term in the context of a
                      context = a;
                      env = environment;
                      if (isTupleSort) {
                        context = a['@'];
                        env = createFrameFromTuple(environment, a);
                      }
                      _context20.next = 9;
                      return _evaluate2(term.expression, context, env);
                    case 9:
                      aa = _context20.sent;
                      //evaluate the sort term in the context of b
                      context = b;
                      env = environment;
                      if (isTupleSort) {
                        context = b['@'];
                        env = createFrameFromTuple(environment, b);
                      }
                      _context20.next = 15;
                      return _evaluate2(term.expression, context, env);
                    case 15:
                      bb = _context20.sent;
                      // type checks
                      atype = _typeof(aa);
                      btype = _typeof(bb); // undefined should be last in sort order
                      if (!(atype === 'undefined')) {
                        _context20.next = 21;
                        break;
                      }
                      // swap them, unless btype is also undefined
                      comp = btype === 'undefined' ? 0 : 1;
                      return _context20.abrupt("continue", 34);
                    case 21:
                      if (!(btype === 'undefined')) {
                        _context20.next = 24;
                        break;
                      }
                      comp = -1;
                      return _context20.abrupt("continue", 34);
                    case 24:
                      if (!(!(atype === 'string' || atype === 'number') || !(btype === 'string' || btype === 'number'))) {
                        _context20.next = 26;
                        break;
                      }
                      throw {
                        code: "T2008",
                        stack: new Error().stack,
                        position: expr.position,
                        value: !(atype === 'string' || atype === 'number') ? aa : bb
                      };
                    case 26:
                      if (!(atype !== btype)) {
                        _context20.next = 28;
                        break;
                      }
                      throw {
                        code: "T2007",
                        stack: new Error().stack,
                        position: expr.position,
                        value: aa,
                        value2: bb
                      };
                    case 28:
                      if (!(aa === bb)) {
                        _context20.next = 32;
                        break;
                      }
                      return _context20.abrupt("continue", 34);
                    case 32:
                      if (aa < bb) {
                        comp = -1;
                      } else {
                        comp = 1;
                      }
                    case 33:
                      if (term.descending === true) {
                        comp = -comp;
                      }
                    case 34:
                      index++;
                      _context20.next = 2;
                      break;
                    case 37:
                      return _context20.abrupt("return", comp === 1);
                    case 38:
                    case "end":
                      return _context20.stop();
                  }
                }, _callee20);
              }));
              return function comparator(_x79, _x80) {
                return _ref6.apply(this, arguments);
              };
            }();
            focus = {
              environment: environment,
              input: input
            }; // the `focus` is passed in as the `this` for the invoked function
            _context21.next = 6;
            return fn.sort.apply(focus, [lhs, comparator]);
          case 6:
            result = _context21.sent;
            return _context21.abrupt("return", result);
          case 8:
          case "end":
            return _context21.stop();
        }
      }, _callee21);
    }));
    return _evaluateSortExpression.apply(this, arguments);
  }
  function evaluateTransformExpression(expr, input, environment) {
    // create a function to implement the transform definition
    var transformer = /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(obj) {
        var cloneFunction, result, matches, ii, match, update, updateType, prop, deletions, val, jj;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              if (!(typeof obj === 'undefined')) {
                _context.next = 2;
                break;
              }
              return _context.abrupt("return", undefined);
            case 2:
              // this function returns a copy of obj with changes specified by the pattern/operation
              cloneFunction = environment.lookup('clone');
              if (isFunction(cloneFunction)) {
                _context.next = 5;
                break;
              }
              throw {
                code: "T2013",
                stack: new Error().stack,
                position: expr.position
              };
            case 5:
              _context.next = 7;
              return apply(cloneFunction, [obj], null, environment);
            case 7:
              result = _context.sent;
              _context.next = 10;
              return _evaluate2(expr.pattern, result, environment);
            case 10:
              matches = _context.sent;
              if (!(typeof matches !== 'undefined')) {
                _context.next = 39;
                break;
              }
              if (!Array.isArray(matches)) {
                matches = [matches];
              }
              ii = 0;
            case 14:
              if (!(ii < matches.length)) {
                _context.next = 39;
                break;
              }
              match = matches[ii];
              if (!(match && (match.isPrototypeOf(result) || match instanceof Object.constructor))) {
                _context.next = 18;
                break;
              }
              throw {
                code: "D1010",
                stack: new Error().stack,
                position: expr.position
              };
            case 18:
              _context.next = 20;
              return _evaluate2(expr.update, match, environment);
            case 20:
              update = _context.sent;
              // update must be an object
              updateType = _typeof(update);
              if (!(updateType !== 'undefined')) {
                _context.next = 26;
                break;
              }
              if (!(updateType !== 'object' || update === null || Array.isArray(update))) {
                _context.next = 25;
                break;
              }
              throw {
                code: "T2011",
                stack: new Error().stack,
                position: expr.update.position,
                value: update
              };
            case 25:
              // merge the update
              for (prop in update) {
                match[prop] = update[prop];
              }
            case 26:
              if (!(typeof expr["delete"] !== 'undefined')) {
                _context.next = 36;
                break;
              }
              _context.next = 29;
              return _evaluate2(expr["delete"], match, environment);
            case 29:
              deletions = _context.sent;
              if (!(typeof deletions !== 'undefined')) {
                _context.next = 36;
                break;
              }
              val = deletions;
              if (!Array.isArray(deletions)) {
                deletions = [deletions];
              }
              if (isArrayOfStrings(deletions)) {
                _context.next = 35;
                break;
              }
              throw {
                code: "T2012",
                stack: new Error().stack,
                position: expr["delete"].position,
                value: val
              };
            case 35:
              for (jj = 0; jj < deletions.length; jj++) {
                if (_typeof(match) === 'object' && match !== null) {
                  delete match[deletions[jj]];
                }
              }
            case 36:
              ii++;
              _context.next = 14;
              break;
            case 39:
              return _context.abrupt("return", result);
            case 40:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }));
      return function transformer(_x45) {
        return _ref.apply(this, arguments);
      };
    }();
    return defineFunction(transformer, '<(oa):o>');
  }
  var chainAST = parser('function($f, $g) { function($x){ $g($f($x)) } }');

  /**
   * Apply the function on the RHS using the sequence on the LHS as the first argument
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @returns {*} Evaluated input data
   */
  function evaluateApplyExpression(_x46, _x47, _x48) {
    return _evaluateApplyExpression.apply(this, arguments);
  }
  /**
   * Evaluate function against input data
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @returns {*} Evaluated input data
   */
  function _evaluateApplyExpression() {
    _evaluateApplyExpression = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee22(expr, input, environment) {
      var result, lhs, func, chain;
      return _regeneratorRuntime().wrap(function _callee22$(_context22) {
        while (1) switch (_context22.prev = _context22.next) {
          case 0:
            _context22.next = 2;
            return _evaluate2(expr.lhs, input, environment);
          case 2:
            lhs = _context22.sent;
            if (!(expr.rhs.type === 'function')) {
              _context22.next = 9;
              break;
            }
            _context22.next = 6;
            return evaluateFunction(expr.rhs, input, environment, {
              context: lhs
            });
          case 6:
            result = _context22.sent;
            _context22.next = 26;
            break;
          case 9:
            _context22.next = 11;
            return _evaluate2(expr.rhs, input, environment);
          case 11:
            func = _context22.sent;
            if (isFunction(func)) {
              _context22.next = 14;
              break;
            }
            throw {
              code: "T2006",
              stack: new Error().stack,
              position: expr.position,
              value: func
            };
          case 14:
            if (!isFunction(lhs)) {
              _context22.next = 23;
              break;
            }
            _context22.next = 17;
            return _evaluate2(chainAST, null, environment);
          case 17:
            chain = _context22.sent;
            _context22.next = 20;
            return apply(chain, [lhs, func], null, environment);
          case 20:
            result = _context22.sent;
            _context22.next = 26;
            break;
          case 23:
            _context22.next = 25;
            return apply(func, [lhs], null, environment);
          case 25:
            result = _context22.sent;
          case 26:
            return _context22.abrupt("return", result);
          case 27:
          case "end":
            return _context22.stop();
        }
      }, _callee22);
    }));
    return _evaluateApplyExpression.apply(this, arguments);
  }
  function evaluateFunction(_x49, _x50, _x51, _x52) {
    return _evaluateFunction.apply(this, arguments);
  }
  /**
   * Apply procedure or function
   * @param {Object} proc - Procedure
   * @param {Array} args - Arguments
   * @param {Object} input - input
   * @param {Object} environment - environment
   * @returns {*} Result of procedure
   */
  function _evaluateFunction() {
    _evaluateFunction = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee24(expr, input, environment, applyto) {
      var result, proc, evaluatedArgs, _loop, jj, procName;
      return _regeneratorRuntime().wrap(function _callee24$(_context25) {
        while (1) switch (_context25.prev = _context25.next) {
          case 0:
            _context25.next = 2;
            return _evaluate2(expr.procedure, input, environment);
          case 2:
            proc = _context25.sent;
            if (!(typeof proc === 'undefined' && expr.procedure.type === 'path' && environment.lookup(expr.procedure.steps[0].value))) {
              _context25.next = 5;
              break;
            }
            throw {
              code: "T1005",
              stack: new Error().stack,
              position: expr.position,
              token: expr.procedure.steps[0].value
            };
          case 5:
            evaluatedArgs = [];
            if (typeof applyto !== 'undefined') {
              evaluatedArgs.push(applyto.context);
            }
            // eager evaluation - evaluate the arguments
            _loop = /*#__PURE__*/_regeneratorRuntime().mark(function _loop() {
              var arg, closure;
              return _regeneratorRuntime().wrap(function _loop$(_context24) {
                while (1) switch (_context24.prev = _context24.next) {
                  case 0:
                    _context24.next = 2;
                    return _evaluate2(expr.arguments[jj], input, environment);
                  case 2:
                    arg = _context24.sent;
                    if (isFunction(arg)) {
                      // wrap this in a closure
                      closure = /*#__PURE__*/function () {
                        var _ref7 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee23() {
                          var _len,
                            params,
                            _key,
                            _args23 = arguments;
                          return _regeneratorRuntime().wrap(function _callee23$(_context23) {
                            while (1) switch (_context23.prev = _context23.next) {
                              case 0:
                                for (_len = _args23.length, params = new Array(_len), _key = 0; _key < _len; _key++) {
                                  params[_key] = _args23[_key];
                                }
                                _context23.next = 3;
                                return apply(arg, params, null, environment);
                              case 3:
                                return _context23.abrupt("return", _context23.sent);
                              case 4:
                              case "end":
                                return _context23.stop();
                            }
                          }, _callee23);
                        }));
                        return function closure() {
                          return _ref7.apply(this, arguments);
                        };
                      }();
                      closure.arity = getFunctionArity(arg);
                      evaluatedArgs.push(closure);
                    } else {
                      evaluatedArgs.push(arg);
                    }
                  case 4:
                  case "end":
                    return _context24.stop();
                }
              }, _loop);
            });
            jj = 0;
          case 9:
            if (!(jj < expr.arguments.length)) {
              _context25.next = 14;
              break;
            }
            return _context25.delegateYield(_loop(), "t0", 11);
          case 11:
            jj++;
            _context25.next = 9;
            break;
          case 14:
            // apply the procedure
            procName = expr.procedure.type === 'path' ? expr.procedure.steps[0].value : expr.procedure.value;
            _context25.prev = 15;
            if (_typeof(proc) === 'object') {
              proc.token = procName;
              proc.position = expr.position;
            }
            _context25.next = 19;
            return apply(proc, evaluatedArgs, input, environment);
          case 19:
            result = _context25.sent;
            _context25.next = 27;
            break;
          case 22:
            _context25.prev = 22;
            _context25.t1 = _context25["catch"](15);
            if (!_context25.t1.position) {
              // add the position field to the error
              _context25.t1.position = expr.position;
            }
            if (!_context25.t1.token) {
              // and the function identifier
              _context25.t1.token = procName;
            }
            throw _context25.t1;
          case 27:
            return _context25.abrupt("return", result);
          case 28:
          case "end":
            return _context25.stop();
        }
      }, _callee24, null, [[15, 22]]);
    }));
    return _evaluateFunction.apply(this, arguments);
  }
  function apply(_x53, _x54, _x55, _x56) {
    return _apply.apply(this, arguments);
  }
  /**
   * Apply procedure or function
   * @param {Object} proc - Procedure
   * @param {Array} args - Arguments
   * @param {Object} input - input
   * @param {Object} environment - environment
   * @returns {*} Result of procedure
   */
  function _apply() {
    _apply = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee25(proc, args, input, environment) {
      var result, next, evaluatedArgs, ii;
      return _regeneratorRuntime().wrap(function _callee25$(_context26) {
        while (1) switch (_context26.prev = _context26.next) {
          case 0:
            _context26.next = 2;
            return applyInner(proc, args, input, environment);
          case 2:
            result = _context26.sent;
          case 3:
            if (!(isLambda(result) && result.thunk === true)) {
              _context26.next = 25;
              break;
            }
            _context26.next = 6;
            return _evaluate2(result.body.procedure, result.input, result.environment);
          case 6:
            next = _context26.sent;
            if (result.body.procedure.type === 'variable') {
              next.token = result.body.procedure.value;
            }
            next.position = result.body.procedure.position;
            evaluatedArgs = [];
            ii = 0;
          case 11:
            if (!(ii < result.body.arguments.length)) {
              _context26.next = 20;
              break;
            }
            _context26.t0 = evaluatedArgs;
            _context26.next = 15;
            return _evaluate2(result.body.arguments[ii], result.input, result.environment);
          case 15:
            _context26.t1 = _context26.sent;
            _context26.t0.push.call(_context26.t0, _context26.t1);
          case 17:
            ii++;
            _context26.next = 11;
            break;
          case 20:
            _context26.next = 22;
            return applyInner(next, evaluatedArgs, input, environment);
          case 22:
            result = _context26.sent;
            _context26.next = 3;
            break;
          case 25:
            return _context26.abrupt("return", result);
          case 26:
          case "end":
            return _context26.stop();
        }
      }, _callee25);
    }));
    return _apply.apply(this, arguments);
  }
  function applyInner(_x57, _x58, _x59, _x60) {
    return _applyInner.apply(this, arguments);
  }
  /**
   * Evaluate lambda against input data
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @returns {{lambda: boolean, input: *, environment: *, arguments: *, body: *}} Evaluated input data
   */
  function _applyInner() {
    _applyInner = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee26(proc, args, input, environment) {
      var result, validatedArgs, focus;
      return _regeneratorRuntime().wrap(function _callee26$(_context27) {
        while (1) switch (_context27.prev = _context27.next) {
          case 0:
            _context27.prev = 0;
            validatedArgs = args;
            if (proc) {
              validatedArgs = validateArguments(proc.signature, args, input);
            }
            if (!isLambda(proc)) {
              _context27.next = 9;
              break;
            }
            _context27.next = 6;
            return applyProcedure(proc, validatedArgs);
          case 6:
            result = _context27.sent;
            _context27.next = 28;
            break;
          case 9:
            if (!(proc && proc._jsonata_function === true)) {
              _context27.next = 19;
              break;
            }
            focus = {
              environment: environment,
              input: input
            }; // the `focus` is passed in as the `this` for the invoked function
            result = proc.implementation.apply(focus, validatedArgs);
            // `proc.implementation` might be a generator function
            // and `result` might be a generator - if so, yield
            if (isIterable(result)) {
              result = result.next().value;
            }
            if (!isPromise(result)) {
              _context27.next = 17;
              break;
            }
            _context27.next = 16;
            return result;
          case 16:
            result = _context27.sent;
          case 17:
            _context27.next = 28;
            break;
          case 19:
            if (!(typeof proc === 'function')) {
              _context27.next = 27;
              break;
            }
            // typically these are functions that are returned by the invocation of plugin functions
            // the `input` is being passed in as the `this` for the invoked function
            // this is so that functions that return objects containing functions can chain
            // e.g. await (await $func())
            result = proc.apply(input, validatedArgs);
            if (!isPromise(result)) {
              _context27.next = 25;
              break;
            }
            _context27.next = 24;
            return result;
          case 24:
            result = _context27.sent;
          case 25:
            _context27.next = 28;
            break;
          case 27:
            throw {
              code: "T1006",
              stack: new Error().stack
            };
          case 28:
            _context27.next = 34;
            break;
          case 30:
            _context27.prev = 30;
            _context27.t0 = _context27["catch"](0);
            if (proc) {
              if (typeof _context27.t0.token == 'undefined' && typeof proc.token !== 'undefined') {
                _context27.t0.token = proc.token;
              }
              _context27.t0.position = proc.position || _context27.t0.position;
            }
            throw _context27.t0;
          case 34:
            return _context27.abrupt("return", result);
          case 35:
          case "end":
            return _context27.stop();
        }
      }, _callee26, null, [[0, 30]]);
    }));
    return _applyInner.apply(this, arguments);
  }
  function evaluateLambda(expr, input, environment) {
    // make a function (closure)
    var procedure = {
      _jsonata_lambda: true,
      input: input,
      environment: environment,
      arguments: expr.arguments,
      signature: expr.signature,
      body: expr.body
    };
    if (expr.thunk === true) {
      procedure.thunk = true;
    }
    procedure.apply = /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(self, args) {
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return apply(procedure, args, input, !!self ? self.environment : environment);
            case 2:
              return _context2.abrupt("return", _context2.sent);
            case 3:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      }));
      return function (_x61, _x62) {
        return _ref2.apply(this, arguments);
      };
    }();
    return procedure;
  }

  /**
   * Evaluate partial application
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @returns {*} Evaluated input data
   */
  function evaluatePartialApplication(_x63, _x64, _x65) {
    return _evaluatePartialApplication.apply(this, arguments);
  }
  /**
   * Validate the arguments against the signature validator (if it exists)
   * @param {Function} signature - validator function
   * @param {Array} args - function arguments
   * @param {*} context - context value
   * @returns {Array} - validated arguments
   */
  function _evaluatePartialApplication() {
    _evaluatePartialApplication = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee27(expr, input, environment) {
      var result, evaluatedArgs, ii, arg, proc;
      return _regeneratorRuntime().wrap(function _callee27$(_context28) {
        while (1) switch (_context28.prev = _context28.next) {
          case 0:
            // partially apply a function
            // evaluate the arguments
            evaluatedArgs = [];
            ii = 0;
          case 2:
            if (!(ii < expr.arguments.length)) {
              _context28.next = 16;
              break;
            }
            arg = expr.arguments[ii];
            if (!(arg.type === 'operator' && arg.value === '?')) {
              _context28.next = 8;
              break;
            }
            evaluatedArgs.push(arg);
            _context28.next = 13;
            break;
          case 8:
            _context28.t0 = evaluatedArgs;
            _context28.next = 11;
            return _evaluate2(arg, input, environment);
          case 11:
            _context28.t1 = _context28.sent;
            _context28.t0.push.call(_context28.t0, _context28.t1);
          case 13:
            ii++;
            _context28.next = 2;
            break;
          case 16:
            _context28.next = 18;
            return _evaluate2(expr.procedure, input, environment);
          case 18:
            proc = _context28.sent;
            if (!(typeof proc === 'undefined' && expr.procedure.type === 'path' && environment.lookup(expr.procedure.steps[0].value))) {
              _context28.next = 21;
              break;
            }
            throw {
              code: "T1007",
              stack: new Error().stack,
              position: expr.position,
              token: expr.procedure.steps[0].value
            };
          case 21:
            if (!isLambda(proc)) {
              _context28.next = 25;
              break;
            }
            result = partialApplyProcedure(proc, evaluatedArgs);
            _context28.next = 34;
            break;
          case 25:
            if (!(proc && proc._jsonata_function === true)) {
              _context28.next = 29;
              break;
            }
            result = partialApplyNativeFunction(proc.implementation, evaluatedArgs);
            _context28.next = 34;
            break;
          case 29:
            if (!(typeof proc === 'function')) {
              _context28.next = 33;
              break;
            }
            result = partialApplyNativeFunction(proc, evaluatedArgs);
            _context28.next = 34;
            break;
          case 33:
            throw {
              code: "T1008",
              stack: new Error().stack,
              position: expr.position,
              token: expr.procedure.type === 'path' ? expr.procedure.steps[0].value : expr.procedure.value
            };
          case 34:
            return _context28.abrupt("return", result);
          case 35:
          case "end":
            return _context28.stop();
        }
      }, _callee27);
    }));
    return _evaluatePartialApplication.apply(this, arguments);
  }
  function validateArguments(signature, args, context) {
    if (typeof signature === 'undefined') {
      // nothing to validate
      return args;
    }
    var validatedArgs = signature.validate(args, context);
    return validatedArgs;
  }

  /**
   * Apply procedure
   * @param {Object} proc - Procedure
   * @param {Array} args - Arguments
   * @returns {*} Result of procedure
   */
  function applyProcedure(_x66, _x67) {
    return _applyProcedure.apply(this, arguments);
  }
  /**
   * Partially apply procedure
   * @param {Object} proc - Procedure
   * @param {Array} args - Arguments
   * @returns {{lambda: boolean, input: *, environment: {bind, lookup}, arguments: Array, body: *}} Result of partially applied procedure
   */
  function _applyProcedure() {
    _applyProcedure = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee28(proc, args) {
      var result, env;
      return _regeneratorRuntime().wrap(function _callee28$(_context29) {
        while (1) switch (_context29.prev = _context29.next) {
          case 0:
            env = createFrame(proc.environment);
            proc.arguments.forEach(function (param, index) {
              env.bind(param.value, args[index]);
            });
            if (!(typeof proc.body === 'function')) {
              _context29.next = 8;
              break;
            }
            _context29.next = 5;
            return applyNativeFunction(proc.body, env);
          case 5:
            result = _context29.sent;
            _context29.next = 11;
            break;
          case 8:
            _context29.next = 10;
            return _evaluate2(proc.body, proc.input, env);
          case 10:
            result = _context29.sent;
          case 11:
            return _context29.abrupt("return", result);
          case 12:
          case "end":
            return _context29.stop();
        }
      }, _callee28);
    }));
    return _applyProcedure.apply(this, arguments);
  }
  function partialApplyProcedure(proc, args) {
    // create a closure, bind the supplied parameters and return a function that takes the remaining (?) parameters
    var env = createFrame(proc.environment);
    var unboundArgs = [];
    proc.arguments.forEach(function (param, index) {
      var arg = args[index];
      if (arg && arg.type === 'operator' && arg.value === '?') {
        unboundArgs.push(param);
      } else {
        env.bind(param.value, arg);
      }
    });
    var procedure = {
      _jsonata_lambda: true,
      input: proc.input,
      environment: env,
      arguments: unboundArgs,
      body: proc.body
    };
    return procedure;
  }

  /**
   * Partially apply native function
   * @param {Function} native - Native function
   * @param {Array} args - Arguments
   * @returns {{lambda: boolean, input: *, environment: {bind, lookup}, arguments: Array, body: *}} Result of partially applying native function
   */
  function partialApplyNativeFunction(_native, args) {
    // create a lambda function that wraps and invokes the native function
    // get the list of declared arguments from the native function
    // this has to be picked out from the toString() value
    var sigArgs = getNativeFunctionArguments(_native);
    sigArgs = sigArgs.map(function (sigArg) {
      return '$' + sigArg.trim();
    });
    var body = 'function(' + sigArgs.join(', ') + '){ _ }';
    var bodyAST = parser(body);
    bodyAST.body = _native;
    var partial = partialApplyProcedure(bodyAST, args);
    return partial;
  }

  /**
   * Apply native function
   * @param {Object} proc - Procedure
   * @param {Object} env - Environment
   * @returns {*} Result of applying native function
   */
  function applyNativeFunction(_x68, _x69) {
    return _applyNativeFunction.apply(this, arguments);
  }
  /**
   * Get native function arguments
   * @param {Function} func - Function
   * @returns {*|Array} Native function arguments
   */
  function _applyNativeFunction() {
    _applyNativeFunction = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee29(proc, env) {
      var sigArgs, args, focus, result;
      return _regeneratorRuntime().wrap(function _callee29$(_context30) {
        while (1) switch (_context30.prev = _context30.next) {
          case 0:
            sigArgs = getNativeFunctionArguments(proc); // generate the array of arguments for invoking the function - look them up in the environment
            args = sigArgs.map(function (sigArg) {
              return env.lookup(sigArg.trim());
            });
            focus = {
              environment: env
            };
            result = proc.apply(focus, args);
            if (!isPromise(result)) {
              _context30.next = 8;
              break;
            }
            _context30.next = 7;
            return result;
          case 7:
            result = _context30.sent;
          case 8:
            return _context30.abrupt("return", result);
          case 9:
          case "end":
            return _context30.stop();
        }
      }, _callee29);
    }));
    return _applyNativeFunction.apply(this, arguments);
  }
  function getNativeFunctionArguments(func) {
    var signature = func.toString();
    var sigParens = /\(([^)]*)\)/.exec(signature)[1]; // the contents of the parens
    var sigArgs = sigParens.split(',');
    return sigArgs;
  }

  /**
   * Creates a function definition
   * @param {Function} func - function implementation in Javascript
   * @param {string} signature - JSONata function signature definition
   * @returns {{implementation: *, signature: *}} function definition
   */
  function defineFunction(func, signature) {
    var definition = {
      _jsonata_function: true,
      implementation: func
    };
    if (typeof signature !== 'undefined') {
      definition.signature = parseSignature(signature);
    }
    return definition;
  }

  /**
   * parses and evaluates the supplied expression
   * @param {string} expr - expression to evaluate
   * @returns {*} - result of evaluating the expression
   */
  function functionEval(_x70, _x71) {
    return _functionEval.apply(this, arguments);
  }
  /**
   * Clones an object
   * @param {Object} arg - object to clone (deep copy)
   * @returns {*} - the cloned object
   */
  function _functionEval() {
    _functionEval = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee30(expr, focus) {
      var input, ast, result;
      return _regeneratorRuntime().wrap(function _callee30$(_context31) {
        while (1) switch (_context31.prev = _context31.next) {
          case 0:
            if (!(typeof expr === 'undefined')) {
              _context31.next = 2;
              break;
            }
            return _context31.abrupt("return", undefined);
          case 2:
            input = this.input;
            if (typeof focus !== 'undefined') {
              input = focus;
              // if the input is a JSON array, then wrap it in a singleton sequence so it gets treated as a single input
              if (Array.isArray(input) && !isSequence(input)) {
                input = createSequence(input);
                input.outerWrapper = true;
              }
            }
            _context31.prev = 4;
            ast = parser(expr, false);
            _context31.next = 12;
            break;
          case 8:
            _context31.prev = 8;
            _context31.t0 = _context31["catch"](4);
            // error parsing the expression passed to $eval
            populateMessage(_context31.t0);
            throw {
              stack: new Error().stack,
              code: "D3120",
              value: _context31.t0.message,
              error: _context31.t0
            };
          case 12:
            _context31.prev = 12;
            _context31.next = 15;
            return _evaluate2(ast, input, this.environment);
          case 15:
            result = _context31.sent;
            _context31.next = 22;
            break;
          case 18:
            _context31.prev = 18;
            _context31.t1 = _context31["catch"](12);
            // error evaluating the expression passed to $eval
            populateMessage(_context31.t1);
            throw {
              stack: new Error().stack,
              code: "D3121",
              value: _context31.t1.message,
              error: _context31.t1
            };
          case 22:
            return _context31.abrupt("return", result);
          case 23:
          case "end":
            return _context31.stop();
        }
      }, _callee30, this, [[4, 8], [12, 18]]);
    }));
    return _functionEval.apply(this, arguments);
  }
  function functionClone(arg) {
    // undefined inputs always return undefined
    if (typeof arg === 'undefined') {
      return undefined;
    }
    return JSON.parse(fn.string(arg));
  }

  /**
   * Create frame
   * @param {Object} enclosingEnvironment - Enclosing environment
   * @returns {{bind: bind, lookup: lookup}} Created frame
   */
  function createFrame(enclosingEnvironment) {
    var bindings = {};
    var newFrame = {
      bind: function bind(name, value) {
        bindings[name] = value;
      },
      lookup: function lookup(name) {
        var value;
        if (bindings.hasOwnProperty(name)) {
          value = bindings[name];
        } else if (enclosingEnvironment) {
          value = enclosingEnvironment.lookup(name);
        }
        return value;
      },
      timestamp: enclosingEnvironment ? enclosingEnvironment.timestamp : null,
      async: enclosingEnvironment ? enclosingEnvironment.async : false,
      isParallelCall: enclosingEnvironment ? enclosingEnvironment.isParallelCall : false,
      global: enclosingEnvironment ? enclosingEnvironment.global : {
        ancestry: [null]
      }
    };
    if (enclosingEnvironment) {
      var framePushCallback = enclosingEnvironment.lookup(Symbol["for"]('jsonata.__createFrame_push'));
      if (framePushCallback) {
        framePushCallback(enclosingEnvironment, newFrame);
      }
    }
    return newFrame;
  }

  // Function registration
  staticFrame.bind('sum', defineFunction(fn.sum, '<a<n>:n>'));
  staticFrame.bind('count', defineFunction(fn.count, '<a:n>'));
  staticFrame.bind('max', defineFunction(fn.max, '<a<n>:n>'));
  staticFrame.bind('min', defineFunction(fn.min, '<a<n>:n>'));
  staticFrame.bind('average', defineFunction(fn.average, '<a<n>:n>'));
  staticFrame.bind('string', defineFunction(fn.string, '<x-b?:s>'));
  staticFrame.bind('substring', defineFunction(fn.substring, '<s-nn?:s>'));
  staticFrame.bind('substringBefore', defineFunction(fn.substringBefore, '<s-s:s>'));
  staticFrame.bind('substringAfter', defineFunction(fn.substringAfter, '<s-s:s>'));
  staticFrame.bind('lowercase', defineFunction(fn.lowercase, '<s-:s>'));
  staticFrame.bind('uppercase', defineFunction(fn.uppercase, '<s-:s>'));
  staticFrame.bind('length', defineFunction(fn.length, '<s-:n>'));
  staticFrame.bind('trim', defineFunction(fn.trim, '<s-:s>'));
  staticFrame.bind('pad', defineFunction(fn.pad, '<s-ns?:s>'));
  staticFrame.bind('match', defineFunction(fn.match, '<s-f<s:o>n?:a<o>>'));
  staticFrame.bind('contains', defineFunction(fn.contains, '<s-(sf):b>')); // TODO <s-(sf<s:o>):b>
  staticFrame.bind('replace', defineFunction(fn.replace, '<s-(sf)(sf)n?:s>')); // TODO <s-(sf<s:o>)(sf<o:s>)n?:s>
  staticFrame.bind('split', defineFunction(fn.split, '<s-(sf)n?:a<s>>')); // TODO <s-(sf<s:o>)n?:a<s>>
  staticFrame.bind('join', defineFunction(fn.join, '<a<s>s?:s>'));
  staticFrame.bind('formatNumber', defineFunction(fn.formatNumber, '<n-so?:s>'));
  staticFrame.bind('formatBase', defineFunction(fn.formatBase, '<n-n?:s>'));
  staticFrame.bind('formatInteger', defineFunction(datetime.formatInteger, '<n-s:s>'));
  staticFrame.bind('parseInteger', defineFunction(datetime.parseInteger, '<s-s:n>'));
  staticFrame.bind('number', defineFunction(fn.number, '<(nsb)-:n>'));
  staticFrame.bind('floor', defineFunction(fn.floor, '<n-:n>'));
  staticFrame.bind('ceil', defineFunction(fn.ceil, '<n-:n>'));
  staticFrame.bind('round', defineFunction(fn.round, '<n-n?:n>'));
  staticFrame.bind('abs', defineFunction(fn.abs, '<n-:n>'));
  staticFrame.bind('sqrt', defineFunction(fn.sqrt, '<n-:n>'));
  staticFrame.bind('power', defineFunction(fn.power, '<n-n:n>'));
  staticFrame.bind('random', defineFunction(fn.random, '<:n>'));
  staticFrame.bind('boolean', defineFunction(fn["boolean"], '<x-:b>'));
  staticFrame.bind('not', defineFunction(fn.not, '<x-:b>'));
  staticFrame.bind('map', defineFunction(fn.map, '<af>'));
  staticFrame.bind('zip', defineFunction(fn.zip, '<a+>'));
  staticFrame.bind('filter', defineFunction(fn.filter, '<af>'));
  staticFrame.bind('single', defineFunction(fn.single, '<af?>'));
  staticFrame.bind('reduce', defineFunction(fn.foldLeft, '<afj?:j>')); // TODO <f<jj:j>a<j>j?:j>
  staticFrame.bind('sift', defineFunction(fn.sift, '<o-f?:o>'));
  staticFrame.bind('keys', defineFunction(fn.keys, '<x-:a<s>>'));
  staticFrame.bind('lookup', defineFunction(fn.lookup, '<x-s:x>'));
  staticFrame.bind('append', defineFunction(fn.append, '<xx:a>'));
  staticFrame.bind('exists', defineFunction(fn.exists, '<x:b>'));
  staticFrame.bind('spread', defineFunction(fn.spread, '<x-:a<o>>'));
  staticFrame.bind('merge', defineFunction(fn.merge, '<a<o>:o>'));
  staticFrame.bind('reverse', defineFunction(fn.reverse, '<a:a>'));
  staticFrame.bind('each', defineFunction(fn.each, '<o-f:a>'));
  staticFrame.bind('error', defineFunction(fn.error, '<s?:x>'));
  staticFrame.bind('assert', defineFunction(fn.assert, '<bs?:x>'));
  staticFrame.bind('type', defineFunction(fn.type, '<x:s>'));
  staticFrame.bind('sort', defineFunction(fn.sort, '<af?:a>'));
  staticFrame.bind('shuffle', defineFunction(fn.shuffle, '<a:a>'));
  staticFrame.bind('distinct', defineFunction(fn.distinct, '<x:x>'));
  staticFrame.bind('base64encode', defineFunction(fn.base64encode, '<s-:s>'));
  staticFrame.bind('base64decode', defineFunction(fn.base64decode, '<s-:s>'));
  staticFrame.bind('encodeUrlComponent', defineFunction(fn.encodeUrlComponent, '<s-:s>'));
  staticFrame.bind('encodeUrl', defineFunction(fn.encodeUrl, '<s-:s>'));
  staticFrame.bind('decodeUrlComponent', defineFunction(fn.decodeUrlComponent, '<s-:s>'));
  staticFrame.bind('decodeUrl', defineFunction(fn.decodeUrl, '<s-:s>'));
  staticFrame.bind('eval', defineFunction(functionEval, '<sx?:x>'));
  staticFrame.bind('toMillis', defineFunction(datetime.toMillis, '<s-s?:n>'));
  staticFrame.bind('fromMillis', defineFunction(datetime.fromMillis, '<n-s?s?:s>'));
  staticFrame.bind('clone', defineFunction(functionClone, '<(oa)-:o>'));

  /**
   * Error codes
   *
   * Sxxxx    - Static errors (compile time)
   * Txxxx    - Type errors
   * Dxxxx    - Dynamic errors (evaluate time)
   *  01xx    - tokenizer
   *  02xx    - parser
   *  03xx    - regex parser
   *  04xx    - function signature parser/evaluator
   *  10xx    - evaluator
   *  20xx    - operators
   *  3xxx    - functions (blocks of 10 for each function)
   */
  var errorCodes = {
    "S0101": "String literal must be terminated by a matching quote",
    "S0102": "Number out of range: {{token}}",
    "S0103": "Unsupported escape sequence: \\{{token}}",
    "S0104": "The escape sequence \\u must be followed by 4 hex digits",
    "S0105": "Quoted property name must be terminated with a backquote (`)",
    "S0106": "Comment has no closing tag",
    "S0201": "Syntax error: {{token}}",
    "S0202": "Expected {{value}}, got {{token}}",
    "S0203": "Expected {{value}} before end of expression",
    "S0204": "Unknown operator: {{token}}",
    "S0205": "Unexpected token: {{token}}",
    "S0206": "Unknown expression type: {{token}}",
    "S0207": "Unexpected end of expression",
    "S0208": "Parameter {{value}} of function definition must be a variable name (start with $)",
    "S0209": "A predicate cannot follow a grouping expression in a step",
    "S0210": "Each step can only have one grouping expression",
    "S0211": "The symbol {{token}} cannot be used as a unary operator",
    "S0212": "The left side of := must be a variable name (start with $)",
    "S0213": "The literal value {{value}} cannot be used as a step within a path expression",
    "S0214": "The right side of {{token}} must be a variable name (start with $)",
    "S0215": "A context variable binding must precede any predicates on a step",
    "S0216": "A context variable binding must precede the 'order-by' clause on a step",
    "S0217": "The object representing the 'parent' cannot be derived from this expression",
    "S0301": "Empty regular expressions are not allowed",
    "S0302": "No terminating / in regular expression",
    "S0402": "Choice groups containing parameterized types are not supported",
    "S0401": "Type parameters can only be applied to functions and arrays",
    "S0500": "Attempted to evaluate an expression containing syntax error(s)",
    "T0410": "Argument {{index}} of function {{token}} does not match function signature",
    "T0411": "Context value is not a compatible type with argument {{index}} of function {{token}}",
    "T0412": "Argument {{index}} of function {{token}} must be an array of {{type}}",
    "D1001": "Number out of range: {{value}}",
    "D1002": "Cannot negate a non-numeric value: {{value}}",
    "T1003": "Key in object structure must evaluate to a string; got: {{value}}",
    "D1004": "Regular expression matches zero length string",
    "T1005": "Attempted to invoke a non-function. Did you mean ${{{token}}}?",
    "T1006": "Attempted to invoke a non-function",
    "T1007": "Attempted to partially apply a non-function. Did you mean ${{{token}}}?",
    "T1008": "Attempted to partially apply a non-function",
    "D1009": "Multiple key definitions evaluate to same key: {{value}}",
    "D1010": "Attempted to access the Javascript object prototype",
    // Javascript specific 
    "T1010": "The matcher function argument passed to function {{token}} does not return the correct object structure",
    "T2001": "The left side of the {{token}} operator must evaluate to a number",
    "T2002": "The right side of the {{token}} operator must evaluate to a number",
    "T2003": "The left side of the range operator (..) must evaluate to an integer",
    "T2004": "The right side of the range operator (..) must evaluate to an integer",
    "D2005": "The left side of := must be a variable name (start with $)",
    // defunct - replaced by S0212 parser error
    "T2006": "The right side of the function application operator ~> must be a function",
    "T2007": "Type mismatch when comparing values {{value}} and {{value2}} in order-by clause",
    "T2008": "The expressions within an order-by clause must evaluate to numeric or string values",
    "T2009": "The values {{value}} and {{value2}} either side of operator {{token}} must be of the same data type",
    "T2010": "The expressions either side of operator {{token}} must evaluate to numeric or string values",
    "T2011": "The insert/update clause of the transform expression must evaluate to an object: {{value}}",
    "T2012": "The delete clause of the transform expression must evaluate to a string or array of strings: {{value}}",
    "T2013": "The transform expression clones the input object using the $clone() function.  This has been overridden in the current scope by a non-function.",
    "D2014": "The size of the sequence allocated by the range operator (..) must not exceed 1e6.  Attempted to allocate {{value}}.",
    "D3001": "Attempting to invoke string function on Infinity or NaN",
    "D3010": "Second argument of replace function cannot be an empty string",
    "D3011": "Fourth argument of replace function must evaluate to a positive number",
    "D3012": "Attempted to replace a matched string with a non-string value",
    "D3020": "Third argument of split function must evaluate to a positive number",
    "D3030": "Unable to cast value to a number: {{value}}",
    "D3040": "Third argument of match function must evaluate to a positive number",
    "D3050": "The second argument of reduce function must be a function with at least two arguments",
    "D3060": "The sqrt function cannot be applied to a negative number: {{value}}",
    "D3061": "The power function has resulted in a value that cannot be represented as a JSON number: base={{value}}, exponent={{exp}}",
    "D3070": "The single argument form of the sort function can only be applied to an array of strings or an array of numbers.  Use the second argument to specify a comparison function",
    "D3080": "The picture string must only contain a maximum of two sub-pictures",
    "D3081": "The sub-picture must not contain more than one instance of the 'decimal-separator' character",
    "D3082": "The sub-picture must not contain more than one instance of the 'percent' character",
    "D3083": "The sub-picture must not contain more than one instance of the 'per-mille' character",
    "D3084": "The sub-picture must not contain both a 'percent' and a 'per-mille' character",
    "D3085": "The mantissa part of a sub-picture must contain at least one character that is either an 'optional digit character' or a member of the 'decimal digit family'",
    "D3086": "The sub-picture must not contain a passive character that is preceded by an active character and that is followed by another active character",
    "D3087": "The sub-picture must not contain a 'grouping-separator' character that appears adjacent to a 'decimal-separator' character",
    "D3088": "The sub-picture must not contain a 'grouping-separator' at the end of the integer part",
    "D3089": "The sub-picture must not contain two adjacent instances of the 'grouping-separator' character",
    "D3090": "The integer part of the sub-picture must not contain a member of the 'decimal digit family' that is followed by an instance of the 'optional digit character'",
    "D3091": "The fractional part of the sub-picture must not contain an instance of the 'optional digit character' that is followed by a member of the 'decimal digit family'",
    "D3092": "A sub-picture that contains a 'percent' or 'per-mille' character must not contain a character treated as an 'exponent-separator'",
    "D3093": "The exponent part of the sub-picture must comprise only of one or more characters that are members of the 'decimal digit family'",
    "D3100": "The radix of the formatBase function must be between 2 and 36.  It was given {{value}}",
    "D3110": "The argument of the toMillis function must be an ISO 8601 formatted timestamp. Given {{value}}",
    "D3120": "Syntax error in expression passed to function eval: {{value}}",
    "D3121": "Dynamic error evaluating the expression passed to function eval: {{value}}",
    "D3130": "Formatting or parsing an integer as a sequence starting with {{value}} is not supported by this implementation",
    "D3131": "In a decimal digit pattern, all digits must be from the same decimal group",
    "D3132": "Unknown component specifier {{value}} in date/time picture string",
    "D3133": "The 'name' modifier can only be applied to months and days in the date/time picture string, not {{value}}",
    "D3134": "The timezone integer format specifier cannot have more than four digits",
    "D3135": "No matching closing bracket ']' in date/time picture string",
    "D3136": "The date/time picture string is missing specifiers required to parse the timestamp",
    "D3137": "{{{message}}}",
    "D3138": "The $single() function expected exactly 1 matching result.  Instead it matched more.",
    "D3139": "The $single() function expected exactly 1 matching result.  Instead it matched 0.",
    "D3140": "Malformed URL passed to ${{{functionName}}}(): {{value}}",
    "D3141": "{{{message}}}"
  };

  /**
   * lookup a message template from the catalog and substitute the inserts.
   * Populates `err.message` with the substituted message. Leaves `err.message`
   * untouched if code lookup fails.
   * @param {string} err - error code to lookup
   * @returns {undefined} - `err` is modified in place
   */
  function populateMessage(err) {
    var template = errorCodes[err.code];
    if (typeof template !== 'undefined') {
      // if there are any handlebars, replace them with the field references
      // triple braces - replace with value
      // double braces - replace with json stringified value
      var message = template.replace(/\{\{\{([^}]+)}}}/g, function () {
        return err[arguments[1]];
      });
      message = message.replace(/\{\{([^}]+)}}/g, function () {
        return JSON.stringify(err[arguments[1]]);
      });
      err.message = message;
    }
    // Otherwise retain the original `err.message`
  }

  /**
   * JSONata
   * @param {Object} expr - JSONata expression
   * @param {Object} options
   * @param {boolean} options.recover: attempt to recover on parse error
   * @param {Function} options.RegexEngine: RegEx class constructor to use
   * @returns {{evaluate: evaluate, assign: assign}} Evaluated expression
   */
  function jsonata(expr, options) {
    var _ast;
    var _errors;
    try {
      _ast = parser(expr, options && options.recover);
      _errors = _ast.errors;
      delete _ast.errors;
    } catch (err) {
      // insert error message into structure
      populateMessage(err); // possible side-effects on `err`
      throw err;
    }
    var environment = createFrame(staticFrame);
    var timestamp = new Date(); // will be overridden on each call to evalute()
    environment.bind('now', defineFunction(function (picture, timezone) {
      return datetime.fromMillis(timestamp.getTime(), picture, timezone);
    }, '<s?s?:s>'));
    environment.bind('millis', defineFunction(function () {
      return timestamp.getTime();
    }, '<:n>'));
    if (options && options.RegexEngine) {
      jsonata.RegexEngine = options.RegexEngine;
    } else {
      jsonata.RegexEngine = RegExp;
    }
    return {
      evaluate: function () {
        var _evaluate3 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(input, bindings, callback) {
          var err, exec_env, v, it;
          return _regeneratorRuntime().wrap(function _callee3$(_context3) {
            while (1) switch (_context3.prev = _context3.next) {
              case 0:
                if (!(typeof _errors !== 'undefined')) {
                  _context3.next = 4;
                  break;
                }
                err = {
                  code: 'S0500',
                  position: 0
                };
                populateMessage(err); // possible side-effects on `err`
                throw err;
              case 4:
                if (typeof bindings !== 'undefined') {
                  // the variable bindings have been passed in - create a frame to hold these
                  exec_env = createFrame(environment);
                  for (v in bindings) {
                    exec_env.bind(v, bindings[v]);
                  }
                } else {
                  exec_env = environment;
                }
                // put the input document into the environment as the root object
                exec_env.bind('$', input);

                // capture the timestamp and put it in the execution environment
                // the $now() and $millis() functions will return this value - whenever it is called
                timestamp = new Date();
                exec_env.timestamp = timestamp;

                // if the input is a JSON array, then wrap it in a singleton sequence so it gets treated as a single input
                if (Array.isArray(input) && !isSequence(input)) {
                  input = createSequence(input);
                  input.outerWrapper = true;
                }
                _context3.prev = 9;
                _context3.next = 12;
                return _evaluate2(_ast, input, exec_env);
              case 12:
                it = _context3.sent;
                if (typeof callback === "function") {
                  callback(null, it);
                }
                return _context3.abrupt("return", it);
              case 17:
                _context3.prev = 17;
                _context3.t0 = _context3["catch"](9);
                // insert error message into structure
                populateMessage(_context3.t0); // possible side-effects on `err`
                throw _context3.t0;
              case 21:
              case "end":
                return _context3.stop();
            }
          }, _callee3, null, [[9, 17]]);
        }));
        function evaluate(_x72, _x73, _x74) {
          return _evaluate3.apply(this, arguments);
        }
        return evaluate;
      }(),
      assign: function assign(name, value) {
        environment.bind(name, value);
      },
      registerFunction: function registerFunction(name, implementation, signature) {
        var func = defineFunction(implementation, signature);
        environment.bind(name, func);
      },
      ast: function ast() {
        return _ast;
      },
      errors: function errors() {
        return _errors;
      }
    };
  }
  jsonata.parser = parser; // TODO remove this in a future release - use ast() instead

  return jsonata;
}();
module.exports = jsonata;
},{"./datetime":1,"./functions":2,"./parser":4,"./signature":5,"./utils":6}],4:[function(require,module,exports){
"use strict";

/**
 * © Copyright IBM Corp. 2016, 2018 All Rights Reserved
 *   Project name: JSONata
 *   This project is licensed under the MIT License, see LICENSE
 */

var parseSignature = require('./signature');
var parser = function () {
  'use strict';

  var operators = {
    '.': 75,
    '[': 80,
    ']': 0,
    '{': 70,
    '}': 0,
    '(': 80,
    ')': 0,
    ',': 0,
    '@': 80,
    '#': 80,
    ';': 80,
    ':': 80,
    '?': 20,
    '+': 50,
    '-': 50,
    '*': 60,
    '/': 60,
    '%': 60,
    '|': 20,
    '=': 40,
    '<': 40,
    '>': 40,
    '^': 40,
    '**': 60,
    '..': 20,
    ':=': 10,
    '!=': 40,
    '<=': 40,
    '>=': 40,
    '~>': 40,
    'and': 30,
    'or': 25,
    'in': 40,
    '&': 50,
    '!': 0,
    // not an operator, but needed as a stop character for name tokens
    '~': 0 // not an operator, but needed as a stop character for name tokens
  };
  var escapes = {
    // JSON string escape sequences - see json.org
    '"': '"',
    '\\': '\\',
    '/': '/',
    'b': '\b',
    'f': '\f',
    'n': '\n',
    'r': '\r',
    't': '\t'
  };

  // Tokenizer (lexer) - invoked by the parser to return one token at a time
  var tokenizer = function tokenizer(path) {
    var position = 0;
    var length = path.length;
    var create = function create(type, value) {
      var obj = {
        type: type,
        value: value,
        position: position
      };
      return obj;
    };
    var scanRegex = function scanRegex() {
      // the prefix '/' will have been previously scanned. Find the end of the regex.
      // search for closing '/' ignoring any that are escaped, or within brackets
      var start = position;
      var depth = 0;
      var pattern;
      var flags;
      var isClosingSlash = function isClosingSlash(position) {
        if (path.charAt(position) === '/' && depth === 0) {
          var backslashCount = 0;
          while (path.charAt(position - (backslashCount + 1)) === '\\') {
            backslashCount++;
          }
          if (backslashCount % 2 === 0) {
            return true;
          }
        }
        return false;
      };
      while (position < length) {
        var currentChar = path.charAt(position);
        if (isClosingSlash(position)) {
          // end of regex found
          pattern = path.substring(start, position);
          if (pattern === '') {
            throw {
              code: "S0301",
              stack: new Error().stack,
              position: position
            };
          }
          position++;
          currentChar = path.charAt(position);
          // flags
          start = position;
          while (currentChar === 'i' || currentChar === 'm') {
            position++;
            currentChar = path.charAt(position);
          }
          flags = path.substring(start, position) + 'g';
          return new RegExp(pattern, flags);
        }
        if ((currentChar === '(' || currentChar === '[' || currentChar === '{') && path.charAt(position - 1) !== '\\') {
          depth++;
        }
        if ((currentChar === ')' || currentChar === ']' || currentChar === '}') && path.charAt(position - 1) !== '\\') {
          depth--;
        }
        position++;
      }
      throw {
        code: "S0302",
        stack: new Error().stack,
        position: position
      };
    };
    var _next = function next(prefix) {
      if (position >= length) return null;
      var currentChar = path.charAt(position);
      // skip whitespace
      while (position < length && ' \t\n\r\v'.indexOf(currentChar) > -1) {
        position++;
        currentChar = path.charAt(position);
      }
      // skip comments
      if (currentChar === '/' && path.charAt(position + 1) === '*') {
        var commentStart = position;
        position += 2;
        currentChar = path.charAt(position);
        while (!(currentChar === '*' && path.charAt(position + 1) === '/')) {
          currentChar = path.charAt(++position);
          if (position >= length) {
            // no closing tag
            throw {
              code: "S0106",
              stack: new Error().stack,
              position: commentStart
            };
          }
        }
        position += 2;
        currentChar = path.charAt(position);
        return _next(prefix); // need this to swallow any following whitespace
      }
      // test for regex
      if (prefix !== true && currentChar === '/') {
        position++;
        return create('regex', scanRegex());
      }
      // handle double-char operators
      if (currentChar === '.' && path.charAt(position + 1) === '.') {
        // double-dot .. range operator
        position += 2;
        return create('operator', '..');
      }
      if (currentChar === ':' && path.charAt(position + 1) === '=') {
        // := assignment
        position += 2;
        return create('operator', ':=');
      }
      if (currentChar === '!' && path.charAt(position + 1) === '=') {
        // !=
        position += 2;
        return create('operator', '!=');
      }
      if (currentChar === '>' && path.charAt(position + 1) === '=') {
        // >=
        position += 2;
        return create('operator', '>=');
      }
      if (currentChar === '<' && path.charAt(position + 1) === '=') {
        // <=
        position += 2;
        return create('operator', '<=');
      }
      if (currentChar === '*' && path.charAt(position + 1) === '*') {
        // **  descendant wildcard
        position += 2;
        return create('operator', '**');
      }
      if (currentChar === '~' && path.charAt(position + 1) === '>') {
        // ~>  chain function
        position += 2;
        return create('operator', '~>');
      }
      // test for single char operators
      if (Object.prototype.hasOwnProperty.call(operators, currentChar)) {
        position++;
        return create('operator', currentChar);
      }
      // test for string literals
      if (currentChar === '"' || currentChar === "'") {
        var quoteType = currentChar;
        // double quoted string literal - find end of string
        position++;
        var qstr = "";
        while (position < length) {
          currentChar = path.charAt(position);
          if (currentChar === '\\') {
            // escape sequence
            position++;
            currentChar = path.charAt(position);
            if (Object.prototype.hasOwnProperty.call(escapes, currentChar)) {
              qstr += escapes[currentChar];
            } else if (currentChar === 'u') {
              // \u should be followed by 4 hex digits
              var octets = path.substr(position + 1, 4);
              if (/^[0-9a-fA-F]+$/.test(octets)) {
                var codepoint = parseInt(octets, 16);
                qstr += String.fromCharCode(codepoint);
                position += 4;
              } else {
                throw {
                  code: "S0104",
                  stack: new Error().stack,
                  position: position
                };
              }
            } else {
              // illegal escape sequence
              throw {
                code: "S0103",
                stack: new Error().stack,
                position: position,
                token: currentChar
              };
            }
          } else if (currentChar === quoteType) {
            position++;
            return create('string', qstr);
          } else {
            qstr += currentChar;
          }
          position++;
        }
        throw {
          code: "S0101",
          stack: new Error().stack,
          position: position
        };
      }
      // test for numbers
      var numregex = /^-?(0|([1-9][0-9]*))(\.[0-9]+)?([Ee][-+]?[0-9]+)?/;
      var match = numregex.exec(path.substring(position));
      if (match !== null) {
        var num = parseFloat(match[0]);
        if (!isNaN(num) && isFinite(num)) {
          position += match[0].length;
          return create('number', num);
        } else {
          throw {
            code: "S0102",
            stack: new Error().stack,
            position: position,
            token: match[0]
          };
        }
      }
      // test for quoted names (backticks)
      var name;
      if (currentChar === '`') {
        // scan for closing quote
        position++;
        var end = path.indexOf('`', position);
        if (end !== -1) {
          name = path.substring(position, end);
          position = end + 1;
          return create('name', name);
        }
        position = length;
        throw {
          code: "S0105",
          stack: new Error().stack,
          position: position
        };
      }
      // test for names
      var i = position;
      var ch;
      for (;;) {
        ch = path.charAt(i);
        if (i === length || ' \t\n\r\v'.indexOf(ch) > -1 || Object.prototype.hasOwnProperty.call(operators, ch)) {
          if (path.charAt(position) === '$') {
            // variable reference
            name = path.substring(position + 1, i);
            position = i;
            return create('variable', name);
          } else {
            name = path.substring(position, i);
            position = i;
            switch (name) {
              case 'or':
              case 'in':
              case 'and':
                return create('operator', name);
              case 'true':
                return create('value', true);
              case 'false':
                return create('value', false);
              case 'null':
                return create('value', null);
              default:
                if (position === length && name === '') {
                  // whitespace at end of input
                  return null;
                }
                return create('name', name);
            }
          }
        } else {
          i++;
        }
      }
    };
    return _next;
  };

  // This parser implements the 'Top down operator precedence' algorithm developed by Vaughan R Pratt; http://dl.acm.org/citation.cfm?id=512931.
  // and builds on the Javascript framework described by Douglas Crockford at http://javascript.crockford.com/tdop/tdop.html
  // and in 'Beautiful Code', edited by Andy Oram and Greg Wilson, Copyright 2007 O'Reilly Media, Inc. 798-0-596-51004-6

  var parser = function parser(source, recover) {
    var node;
    var lexer;
    var symbol_table = {};
    var errors = [];
    var remainingTokens = function remainingTokens() {
      var remaining = [];
      if (node.id !== '(end)') {
        remaining.push({
          type: node.type,
          value: node.value,
          position: node.position
        });
      }
      var nxt = lexer();
      while (nxt !== null) {
        remaining.push(nxt);
        nxt = lexer();
      }
      return remaining;
    };
    var base_symbol = {
      nud: function nud() {
        // error - symbol has been invoked as a unary operator
        var err = {
          code: 'S0211',
          token: this.value,
          position: this.position
        };
        if (recover) {
          err.remaining = remainingTokens();
          err.type = 'error';
          errors.push(err);
          return err;
        } else {
          err.stack = new Error().stack;
          throw err;
        }
      }
    };
    var symbol = function symbol(id, bp) {
      var s = symbol_table[id];
      bp = bp || 0;
      if (s) {
        if (bp >= s.lbp) {
          s.lbp = bp;
        }
      } else {
        s = Object.create(base_symbol);
        s.id = s.value = id;
        s.lbp = bp;
        symbol_table[id] = s;
      }
      return s;
    };
    var handleError = function handleError(err) {
      if (recover) {
        // tokenize the rest of the buffer and add it to an error token
        err.remaining = remainingTokens();
        errors.push(err);
        var symbol = symbol_table["(error)"];
        node = Object.create(symbol);
        node.error = err;
        node.type = "(error)";
        return node;
      } else {
        err.stack = new Error().stack;
        throw err;
      }
    };
    var advance = function advance(id, infix) {
      if (id && node.id !== id) {
        var code;
        if (node.id === '(end)') {
          // unexpected end of buffer
          code = "S0203";
        } else {
          code = "S0202";
        }
        var err = {
          code: code,
          position: node.position,
          token: node.value,
          value: id
        };
        return handleError(err);
      }
      var next_token = lexer(infix);
      if (next_token === null) {
        node = symbol_table["(end)"];
        node.position = source.length;
        return node;
      }
      var value = next_token.value;
      var type = next_token.type;
      var symbol;
      switch (type) {
        case 'name':
        case 'variable':
          symbol = symbol_table["(name)"];
          break;
        case 'operator':
          symbol = symbol_table[value];
          if (!symbol) {
            return handleError({
              code: "S0204",
              stack: new Error().stack,
              position: next_token.position,
              token: value
            });
          }
          break;
        case 'string':
        case 'number':
        case 'value':
          symbol = symbol_table["(literal)"];
          break;
        case 'regex':
          type = "regex";
          symbol = symbol_table["(regex)"];
          break;
        /* istanbul ignore next */
        default:
          return handleError({
            code: "S0205",
            stack: new Error().stack,
            position: next_token.position,
            token: value
          });
      }
      node = Object.create(symbol);
      node.value = value;
      node.type = type;
      node.position = next_token.position;
      return node;
    };

    // Pratt's algorithm
    var expression = function expression(rbp) {
      var left;
      var t = node;
      advance(null, true);
      left = t.nud();
      while (rbp < node.lbp) {
        t = node;
        advance();
        left = t.led(left);
      }
      return left;
    };
    var terminal = function terminal(id) {
      var s = symbol(id, 0);
      s.nud = function () {
        return this;
      };
    };

    // match infix operators
    // <expression> <operator> <expression>
    // left associative
    var infix = function infix(id, bp, led) {
      var bindingPower = bp || operators[id];
      var s = symbol(id, bindingPower);
      s.led = led || function (left) {
        this.lhs = left;
        this.rhs = expression(bindingPower);
        this.type = "binary";
        return this;
      };
      return s;
    };

    // match infix operators
    // <expression> <operator> <expression>
    // right associative
    var infixr = function infixr(id, bp, led) {
      var s = symbol(id, bp);
      s.led = led;
      return s;
    };

    // match prefix operators
    // <operator> <expression>
    var prefix = function prefix(id, nud) {
      var s = symbol(id);
      s.nud = nud || function () {
        this.expression = expression(70);
        this.type = "unary";
        return this;
      };
      return s;
    };
    terminal("(end)");
    terminal("(name)");
    terminal("(literal)");
    terminal("(regex)");
    symbol(":");
    symbol(";");
    symbol(",");
    symbol(")");
    symbol("]");
    symbol("}");
    symbol(".."); // range operator
    infix("."); // map operator
    infix("+"); // numeric addition
    infix("-"); // numeric subtraction
    infix("*"); // numeric multiplication
    infix("/"); // numeric division
    infix("%"); // numeric modulus
    infix("="); // equality
    infix("<"); // less than
    infix(">"); // greater than
    infix("!="); // not equal to
    infix("<="); // less than or equal
    infix(">="); // greater than or equal
    infix("&"); // string concatenation
    infix("and"); // Boolean AND
    infix("or"); // Boolean OR
    infix("in"); // is member of array
    terminal("and"); // the 'keywords' can also be used as terminals (field names)
    terminal("or"); //
    terminal("in"); //
    prefix("-"); // unary numeric negation
    infix("~>"); // function application

    infixr("(error)", 10, function (left) {
      this.lhs = left;
      this.error = node.error;
      this.remaining = remainingTokens();
      this.type = 'error';
      return this;
    });

    // field wildcard (single level)
    prefix('*', function () {
      this.type = "wildcard";
      return this;
    });

    // descendant wildcard (multi-level)
    prefix('**', function () {
      this.type = "descendant";
      return this;
    });

    // parent operator
    prefix('%', function () {
      this.type = "parent";
      return this;
    });

    // function invocation
    infix("(", operators['('], function (left) {
      // left is is what we are trying to invoke
      this.procedure = left;
      this.type = 'function';
      this.arguments = [];
      if (node.id !== ')') {
        for (;;) {
          if (node.type === 'operator' && node.id === '?') {
            // partial function application
            this.type = 'partial';
            this.arguments.push(node);
            advance('?');
          } else {
            this.arguments.push(expression(0));
          }
          if (node.id !== ',') break;
          advance(',');
        }
      }
      advance(")", true);
      // if the name of the function is 'function' or λ, then this is function definition (lambda function)
      if (left.type === 'name' && (left.value === 'function' || left.value === "\u03BB")) {
        // all of the args must be VARIABLE tokens
        this.arguments.forEach(function (arg, index) {
          if (arg.type !== 'variable') {
            return handleError({
              code: "S0208",
              stack: new Error().stack,
              position: arg.position,
              token: arg.value,
              value: index + 1
            });
          }
        });
        this.type = 'lambda';
        // is the next token a '<' - if so, parse the function signature
        if (node.id === '<') {
          var sigPos = node.position;
          var depth = 1;
          var sig = '<';
          while (depth > 0 && node.id !== '{' && node.id !== '(end)') {
            var tok = advance();
            if (tok.id === '>') {
              depth--;
            } else if (tok.id === '<') {
              depth++;
            }
            sig += tok.value;
          }
          advance('>');
          try {
            this.signature = parseSignature(sig);
          } catch (err) {
            // insert the position into this error
            err.position = sigPos + err.offset;
            return handleError(err);
          }
        }
        // parse the function body
        advance('{');
        this.body = expression(0);
        advance('}');
      }
      return this;
    });

    // parenthesis - block expression
    prefix("(", function () {
      var expressions = [];
      while (node.id !== ")") {
        expressions.push(expression(0));
        if (node.id !== ";") {
          break;
        }
        advance(";");
      }
      advance(")", true);
      this.type = 'block';
      this.expressions = expressions;
      return this;
    });

    // array constructor
    prefix("[", function () {
      var a = [];
      if (node.id !== "]") {
        for (;;) {
          var item = expression(0);
          if (node.id === "..") {
            // range operator
            var range = {
              type: "binary",
              value: "..",
              position: node.position,
              lhs: item
            };
            advance("..");
            range.rhs = expression(0);
            item = range;
          }
          a.push(item);
          if (node.id !== ",") {
            break;
          }
          advance(",");
        }
      }
      advance("]", true);
      this.expressions = a;
      this.type = "unary";
      return this;
    });

    // filter - predicate or array index
    infix("[", operators['['], function (left) {
      if (node.id === "]") {
        // empty predicate means maintain singleton arrays in the output
        var step = left;
        while (step && step.type === 'binary' && step.value === '[') {
          step = step.lhs;
        }
        step.keepArray = true;
        advance("]");
        return left;
      } else {
        this.lhs = left;
        this.rhs = expression(operators[']']);
        this.type = 'binary';
        advance("]", true);
        return this;
      }
    });

    // order-by
    infix("^", operators['^'], function (left) {
      advance("(");
      var terms = [];
      for (;;) {
        var term = {
          descending: false
        };
        if (node.id === "<") {
          // ascending sort
          advance("<");
        } else if (node.id === ">") {
          // descending sort
          term.descending = true;
          advance(">");
        } else {
          //unspecified - default to ascending
        }
        term.expression = expression(0);
        terms.push(term);
        if (node.id !== ",") {
          break;
        }
        advance(",");
      }
      advance(")");
      this.lhs = left;
      this.rhs = terms;
      this.type = 'binary';
      return this;
    });
    var objectParser = function objectParser(left) {
      var a = [];
      if (node.id !== "}") {
        for (;;) {
          var n = expression(0);
          advance(":");
          var v = expression(0);
          a.push([n, v]); // holds an array of name/value expression pairs
          if (node.id !== ",") {
            break;
          }
          advance(",");
        }
      }
      advance("}", true);
      if (typeof left === 'undefined') {
        // NUD - unary prefix form
        this.lhs = a;
        this.type = "unary";
      } else {
        // LED - binary infix form
        this.lhs = left;
        this.rhs = a;
        this.type = 'binary';
      }
      return this;
    };

    // object constructor
    prefix("{", objectParser);

    // object grouping
    infix("{", operators['{'], objectParser);

    // bind variable
    infixr(":=", operators[':='], function (left) {
      if (left.type !== 'variable') {
        return handleError({
          code: "S0212",
          stack: new Error().stack,
          position: left.position,
          token: left.value
        });
      }
      this.lhs = left;
      this.rhs = expression(operators[':='] - 1); // subtract 1 from bindingPower for right associative operators
      this.type = "binary";
      return this;
    });

    // focus variable bind
    infix("@", operators['@'], function (left) {
      this.lhs = left;
      this.rhs = expression(operators['@']);
      if (this.rhs.type !== 'variable') {
        return handleError({
          code: "S0214",
          stack: new Error().stack,
          position: this.rhs.position,
          token: "@"
        });
      }
      this.type = "binary";
      return this;
    });

    // index (position) variable bind
    infix("#", operators['#'], function (left) {
      this.lhs = left;
      this.rhs = expression(operators['#']);
      if (this.rhs.type !== 'variable') {
        return handleError({
          code: "S0214",
          stack: new Error().stack,
          position: this.rhs.position,
          token: "#"
        });
      }
      this.type = "binary";
      return this;
    });

    // if/then/else ternary operator ?:
    infix("?", operators['?'], function (left) {
      this.type = 'condition';
      this.condition = left;
      this.then = expression(0);
      if (node.id === ':') {
        // else condition
        advance(":");
        this["else"] = expression(0);
      }
      return this;
    });

    // object transformer
    prefix("|", function () {
      this.type = 'transform';
      this.pattern = expression(0);
      advance('|');
      this.update = expression(0);
      if (node.id === ',') {
        advance(',');
        this["delete"] = expression(0);
      }
      advance('|');
      return this;
    });

    // tail call optimization
    // this is invoked by the post parser to analyse lambda functions to see
    // if they make a tail call.  If so, it is replaced by a thunk which will
    // be invoked by the trampoline loop during function application.
    // This enables tail-recursive functions to be written without growing the stack
    var _tailCallOptimize = function tailCallOptimize(expr) {
      var result;
      if (expr.type === 'function' && !expr.predicate) {
        var thunk = {
          type: 'lambda',
          thunk: true,
          arguments: [],
          position: expr.position
        };
        thunk.body = expr;
        result = thunk;
      } else if (expr.type === 'condition') {
        // analyse both branches
        expr.then = _tailCallOptimize(expr.then);
        if (typeof expr["else"] !== 'undefined') {
          expr["else"] = _tailCallOptimize(expr["else"]);
        }
        result = expr;
      } else if (expr.type === 'block') {
        // only the last expression in the block
        var length = expr.expressions.length;
        if (length > 0) {
          expr.expressions[length - 1] = _tailCallOptimize(expr.expressions[length - 1]);
        }
        result = expr;
      } else {
        result = expr;
      }
      return result;
    };
    var ancestorLabel = 0;
    var ancestorIndex = 0;
    var ancestry = [];
    var _seekParent = function seekParent(node, slot) {
      switch (node.type) {
        case 'name':
        case 'wildcard':
          slot.level--;
          if (slot.level === 0) {
            if (typeof node.ancestor === 'undefined') {
              node.ancestor = slot;
            } else {
              // reuse the existing label
              ancestry[slot.index].slot.label = node.ancestor.label;
              node.ancestor = slot;
            }
            node.tuple = true;
          }
          break;
        case 'parent':
          slot.level++;
          break;
        case 'block':
          // look in last expression in the block
          if (node.expressions.length > 0) {
            node.tuple = true;
            slot = _seekParent(node.expressions[node.expressions.length - 1], slot);
          }
          break;
        case 'path':
          // last step in path
          node.tuple = true;
          var index = node.steps.length - 1;
          slot = _seekParent(node.steps[index--], slot);
          while (slot.level > 0 && index >= 0) {
            // check previous steps
            slot = _seekParent(node.steps[index--], slot);
          }
          break;
        default:
          // error - can't derive ancestor
          throw {
            code: "S0217",
            token: node.type,
            position: node.position
          };
      }
      return slot;
    };
    var pushAncestry = function pushAncestry(result, value) {
      if (typeof value.seekingParent !== 'undefined' || value.type === 'parent') {
        var slots = typeof value.seekingParent !== 'undefined' ? value.seekingParent : [];
        if (value.type === 'parent') {
          slots.push(value.slot);
        }
        if (typeof result.seekingParent === 'undefined') {
          result.seekingParent = slots;
        } else {
          Array.prototype.push.apply(result.seekingParent, slots);
        }
      }
    };
    var resolveAncestry = function resolveAncestry(path) {
      var index = path.steps.length - 1;
      var laststep = path.steps[index];
      var slots = typeof laststep.seekingParent !== 'undefined' ? laststep.seekingParent : [];
      if (laststep.type === 'parent') {
        slots.push(laststep.slot);
      }
      for (var is = 0; is < slots.length; is++) {
        var slot = slots[is];
        index = path.steps.length - 2;
        while (slot.level > 0) {
          if (index < 0) {
            if (typeof path.seekingParent === 'undefined') {
              path.seekingParent = [slot];
            } else {
              path.seekingParent.push(slot);
            }
            break;
          }
          // try previous step
          var step = path.steps[index--];
          // multiple contiguous steps that bind the focus should be skipped
          while (index >= 0 && step.focus && path.steps[index].focus) {
            step = path.steps[index--];
          }
          slot = _seekParent(step, slot);
        }
      }
    };

    // post-parse stage
    // the purpose of this is to add as much semantic value to the parse tree as possible
    // in order to simplify the work of the evaluator.
    // This includes flattening the parts of the AST representing location paths,
    // converting them to arrays of steps which in turn may contain arrays of predicates.
    // following this, nodes containing '.' and '[' should be eliminated from the AST.
    var _processAST = function processAST(expr) {
      var result;
      switch (expr.type) {
        case 'binary':
          switch (expr.value) {
            case '.':
              var lstep = _processAST(expr.lhs);
              if (lstep.type === 'path') {
                result = lstep;
              } else {
                result = {
                  type: 'path',
                  steps: [lstep]
                };
              }
              if (lstep.type === 'parent') {
                result.seekingParent = [lstep.slot];
              }
              var rest = _processAST(expr.rhs);
              if (rest.type === 'function' && rest.procedure.type === 'path' && rest.procedure.steps.length === 1 && rest.procedure.steps[0].type === 'name' && result.steps[result.steps.length - 1].type === 'function') {
                // next function in chain of functions - will override a thenable
                result.steps[result.steps.length - 1].nextFunction = rest.procedure.steps[0].value;
              }
              if (rest.type === 'path') {
                Array.prototype.push.apply(result.steps, rest.steps);
              } else {
                if (typeof rest.predicate !== 'undefined') {
                  rest.stages = rest.predicate;
                  delete rest.predicate;
                }
                result.steps.push(rest);
              }
              // any steps within a path that are string literals, should be changed to 'name'
              result.steps.filter(function (step) {
                if (step.type === 'number' || step.type === 'value') {
                  // don't allow steps to be numbers or the values true/false/null
                  throw {
                    code: "S0213",
                    stack: new Error().stack,
                    position: step.position,
                    value: step.value
                  };
                }
                return step.type === 'string';
              }).forEach(function (lit) {
                lit.type = 'name';
              });
              // any step that signals keeping a singleton array, should be flagged on the path
              if (result.steps.filter(function (step) {
                return step.keepArray === true;
              }).length > 0) {
                result.keepSingletonArray = true;
              }
              // if first step is a path constructor, flag it for special handling
              var firststep = result.steps[0];
              if (firststep.type === 'unary' && firststep.value === '[') {
                firststep.consarray = true;
              }
              // if the last step is an array constructor, flag it so it doesn't flatten
              var laststep = result.steps[result.steps.length - 1];
              if (laststep.type === 'unary' && laststep.value === '[') {
                laststep.consarray = true;
              }
              resolveAncestry(result);
              break;
            case '[':
              // predicated step
              // LHS is a step or a predicated step
              // RHS is the predicate expr
              result = _processAST(expr.lhs);
              var step = result;
              var type = 'predicate';
              if (result.type === 'path') {
                step = result.steps[result.steps.length - 1];
                type = 'stages';
              }
              if (typeof step.group !== 'undefined') {
                throw {
                  code: "S0209",
                  stack: new Error().stack,
                  position: expr.position
                };
              }
              if (typeof step[type] === 'undefined') {
                step[type] = [];
              }
              var predicate = _processAST(expr.rhs);
              if (typeof predicate.seekingParent !== 'undefined') {
                predicate.seekingParent.forEach(function (slot) {
                  if (slot.level === 1) {
                    _seekParent(step, slot);
                  } else {
                    slot.level--;
                  }
                });
                pushAncestry(step, predicate);
              }
              step[type].push({
                type: 'filter',
                expr: predicate,
                position: expr.position
              });
              break;
            case '{':
              // group-by
              // LHS is a step or a predicated step
              // RHS is the object constructor expr
              result = _processAST(expr.lhs);
              if (typeof result.group !== 'undefined') {
                throw {
                  code: "S0210",
                  stack: new Error().stack,
                  position: expr.position
                };
              }
              // object constructor - process each pair
              result.group = {
                lhs: expr.rhs.map(function (pair) {
                  return [_processAST(pair[0]), _processAST(pair[1])];
                }),
                position: expr.position
              };
              break;
            case '^':
              // order-by
              // LHS is the array to be ordered
              // RHS defines the terms
              result = _processAST(expr.lhs);
              if (result.type !== 'path') {
                result = {
                  type: 'path',
                  steps: [result]
                };
              }
              var sortStep = {
                type: 'sort',
                position: expr.position
              };
              sortStep.terms = expr.rhs.map(function (terms) {
                var expression = _processAST(terms.expression);
                pushAncestry(sortStep, expression);
                return {
                  descending: terms.descending,
                  expression: expression
                };
              });
              result.steps.push(sortStep);
              resolveAncestry(result);
              break;
            case ':=':
              result = {
                type: 'bind',
                value: expr.value,
                position: expr.position
              };
              result.lhs = _processAST(expr.lhs);
              result.rhs = _processAST(expr.rhs);
              pushAncestry(result, result.rhs);
              break;
            case '@':
              result = _processAST(expr.lhs);
              step = result;
              if (result.type === 'path') {
                step = result.steps[result.steps.length - 1];
              }
              // throw error if there are any predicates defined at this point
              // at this point the only type of stages can be predicates
              if (typeof step.stages !== 'undefined' || typeof step.predicate !== 'undefined') {
                throw {
                  code: "S0215",
                  stack: new Error().stack,
                  position: expr.position
                };
              }
              // also throw if this is applied after an 'order-by' clause
              if (step.type === 'sort') {
                throw {
                  code: "S0216",
                  stack: new Error().stack,
                  position: expr.position
                };
              }
              if (expr.keepArray) {
                step.keepArray = true;
              }
              step.focus = expr.rhs.value;
              step.tuple = true;
              break;
            case '#':
              result = _processAST(expr.lhs);
              step = result;
              if (result.type === 'path') {
                step = result.steps[result.steps.length - 1];
              } else {
                result = {
                  type: 'path',
                  steps: [result]
                };
                if (typeof step.predicate !== 'undefined') {
                  step.stages = step.predicate;
                  delete step.predicate;
                }
              }
              if (typeof step.stages === 'undefined') {
                step.index = expr.rhs.value;
              } else {
                step.stages.push({
                  type: 'index',
                  value: expr.rhs.value,
                  position: expr.position
                });
              }
              step.tuple = true;
              break;
            case '~>':
              result = {
                type: 'apply',
                value: expr.value,
                position: expr.position
              };
              result.lhs = _processAST(expr.lhs);
              result.rhs = _processAST(expr.rhs);
              result.keepArray = result.lhs.keepArray || result.rhs.keepArray;
              break;
            default:
              result = {
                type: expr.type,
                value: expr.value,
                position: expr.position
              };
              result.lhs = _processAST(expr.lhs);
              result.rhs = _processAST(expr.rhs);
              pushAncestry(result, result.lhs);
              pushAncestry(result, result.rhs);
          }
          break;
        case 'unary':
          result = {
            type: expr.type,
            value: expr.value,
            position: expr.position
          };
          if (expr.value === '[') {
            // array constructor - process each item
            result.expressions = expr.expressions.map(function (item) {
              var value = _processAST(item);
              pushAncestry(result, value);
              return value;
            });
          } else if (expr.value === '{') {
            // object constructor - process each pair
            result.lhs = expr.lhs.map(function (pair) {
              var key = _processAST(pair[0]);
              pushAncestry(result, key);
              var value = _processAST(pair[1]);
              pushAncestry(result, value);
              return [key, value];
            });
          } else {
            // all other unary expressions - just process the expression
            result.expression = _processAST(expr.expression);
            // if unary minus on a number, then pre-process
            if (expr.value === '-' && result.expression.type === 'number') {
              result = result.expression;
              result.value = -result.value;
            } else {
              pushAncestry(result, result.expression);
            }
          }
          break;
        case 'function':
        case 'partial':
          result = {
            type: expr.type,
            name: expr.name,
            value: expr.value,
            position: expr.position
          };
          result.arguments = expr.arguments.map(function (arg) {
            var argAST = _processAST(arg);
            pushAncestry(result, argAST);
            return argAST;
          });
          result.procedure = _processAST(expr.procedure);
          break;
        case 'lambda':
          result = {
            type: expr.type,
            arguments: expr.arguments,
            signature: expr.signature,
            position: expr.position
          };
          var body = _processAST(expr.body);
          result.body = _tailCallOptimize(body);
          break;
        case 'condition':
          result = {
            type: expr.type,
            position: expr.position
          };
          result.condition = _processAST(expr.condition);
          pushAncestry(result, result.condition);
          result.then = _processAST(expr.then);
          pushAncestry(result, result.then);
          if (typeof expr["else"] !== 'undefined') {
            result["else"] = _processAST(expr["else"]);
            pushAncestry(result, result["else"]);
          }
          break;
        case 'transform':
          result = {
            type: expr.type,
            position: expr.position
          };
          result.pattern = _processAST(expr.pattern);
          result.update = _processAST(expr.update);
          if (typeof expr["delete"] !== 'undefined') {
            result["delete"] = _processAST(expr["delete"]);
          }
          break;
        case 'block':
          result = {
            type: expr.type,
            position: expr.position
          };
          // array of expressions - process each one
          result.expressions = expr.expressions.map(function (item) {
            var part = _processAST(item);
            pushAncestry(result, part);
            if (part.consarray || part.type === 'path' && part.steps[0].consarray) {
              result.consarray = true;
            }
            return part;
          });
          // TODO scan the array of expressions to see if any of them assign variables
          // if so, need to mark the block as one that needs to create a new frame
          break;
        case 'name':
          result = {
            type: 'path',
            steps: [expr]
          };
          if (expr.keepArray) {
            result.keepSingletonArray = true;
          }
          break;
        case 'parent':
          result = {
            type: 'parent',
            slot: {
              label: '!' + ancestorLabel++,
              level: 1,
              index: ancestorIndex++
            }
          };
          ancestry.push(result);
          break;
        case 'string':
        case 'number':
        case 'value':
        case 'wildcard':
        case 'descendant':
        case 'variable':
        case 'regex':
          result = expr;
          break;
        case 'operator':
          // the tokens 'and' and 'or' might have been used as a name rather than an operator
          if (expr.value === 'and' || expr.value === 'or' || expr.value === 'in') {
            expr.type = 'name';
            result = _processAST(expr);
          } else /* istanbul ignore else */if (expr.value === '?') {
              // partial application
              result = expr;
            } else {
              throw {
                code: "S0201",
                stack: new Error().stack,
                position: expr.position,
                token: expr.value
              };
            }
          break;
        case 'error':
          result = expr;
          if (expr.lhs) {
            result = _processAST(expr.lhs);
          }
          break;
        default:
          var code = "S0206";
          /* istanbul ignore else */
          if (expr.id === '(end)') {
            code = "S0207";
          }
          var err = {
            code: code,
            position: expr.position,
            token: expr.value
          };
          if (recover) {
            errors.push(err);
            return {
              type: 'error',
              error: err
            };
          } else {
            err.stack = new Error().stack;
            throw err;
          }
      }
      if (expr.keepArray) {
        result.keepArray = true;
      }
      return result;
    };

    // now invoke the tokenizer and the parser and return the syntax tree
    lexer = tokenizer(source);
    advance();
    // parse the tokens
    var expr = expression(0);
    if (node.id !== '(end)') {
      var err = {
        code: "S0201",
        position: node.position,
        token: node.value
      };
      handleError(err);
    }
    expr = _processAST(expr);
    if (expr.type === 'parent' || typeof expr.seekingParent !== 'undefined') {
      // error - trying to derive ancestor at top level
      throw {
        code: "S0217",
        token: expr.type,
        position: expr.position
      };
    }
    if (errors.length > 0) {
      expr.errors = errors;
    }
    return expr;
  };
  return parser;
}();
module.exports = parser;
},{"./signature":5}],5:[function(require,module,exports){
"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
/**
 * © Copyright IBM Corp. 2016, 2018 All Rights Reserved
 *   Project name: JSONata
 *   This project is licensed under the MIT License, see LICENSE
 */

var utils = require('./utils');
var signature = function () {
  'use strict';

  // A mapping between the function signature symbols and the full plural of the type
  // Expected to be used in error messages
  var arraySignatureMapping = {
    "a": "arrays",
    "b": "booleans",
    "f": "functions",
    "n": "numbers",
    "o": "objects",
    "s": "strings"
  };

  /**
   * Parses a function signature definition and returns a validation function
   * @param {string} signature - the signature between the <angle brackets>
   * @returns {Function} validation function
   */
  function parseSignature(signature) {
    // create a Regex that represents this signature and return a function that when invoked,
    // returns the validated (possibly fixed-up) arguments, or throws a validation error
    // step through the signature, one symbol at a time
    var position = 1;
    var params = [];
    var param = {};
    var prevParam = param;
    while (position < signature.length) {
      var symbol = signature.charAt(position);
      if (symbol === ':') {
        // TODO figure out what to do with the return type
        // ignore it for now
        break;
      }
      var next = function next() {
        params.push(param);
        prevParam = param;
        param = {};
      };
      var findClosingBracket = function findClosingBracket(str, start, openSymbol, closeSymbol) {
        // returns the position of the closing symbol (e.g. bracket) in a string
        // that balances the opening symbol at position start
        var depth = 1;
        var position = start;
        while (position < str.length) {
          position++;
          symbol = str.charAt(position);
          if (symbol === closeSymbol) {
            depth--;
            if (depth === 0) {
              // we're done
              break; // out of while loop
            }
          } else if (symbol === openSymbol) {
            depth++;
          }
        }
        return position;
      };
      switch (symbol) {
        case 's': // string
        case 'n': // number
        case 'b': // boolean
        case 'l': // not so sure about expecting null?
        case 'o':
          // object
          param.regex = '[' + symbol + 'm]';
          param.type = symbol;
          next();
          break;
        case 'a':
          // array
          //  normally treat any value as singleton array
          param.regex = '[asnblfom]';
          param.type = symbol;
          param.array = true;
          next();
          break;
        case 'f':
          // function
          param.regex = 'f';
          param.type = symbol;
          next();
          break;
        case 'j':
          // any JSON type
          param.regex = '[asnblom]';
          param.type = symbol;
          next();
          break;
        case 'x':
          // any type
          param.regex = '[asnblfom]';
          param.type = symbol;
          next();
          break;
        case '-':
          // use context if param not supplied
          prevParam.context = true;
          prevParam.contextRegex = new RegExp(prevParam.regex); // pre-compiled to test the context type at runtime
          prevParam.regex += '?';
          break;
        case '?': // optional param
        case '+':
          // one or more
          prevParam.regex += symbol;
          break;
        case '(':
          // choice of types
          // search forward for matching ')'
          var endParen = findClosingBracket(signature, position, '(', ')');
          var choice = signature.substring(position + 1, endParen);
          if (choice.indexOf('<') === -1) {
            // no parameterized types, simple regex
            param.regex = '[' + choice + 'm]';
          } else {
            // TODO harder
            throw {
              code: "S0402",
              stack: new Error().stack,
              value: choice,
              offset: position
            };
          }
          param.type = '(' + choice + ')';
          position = endParen;
          next();
          break;
        case '<':
          // type parameter - can only be applied to 'a' and 'f'
          if (prevParam.type === 'a' || prevParam.type === 'f') {
            // search forward for matching '>'
            var endPos = findClosingBracket(signature, position, '<', '>');
            prevParam.subtype = signature.substring(position + 1, endPos);
            position = endPos;
          } else {
            throw {
              code: "S0401",
              stack: new Error().stack,
              value: prevParam.type,
              offset: position
            };
          }
          break;
      }
      position++;
    }
    var regexStr = '^' + params.map(function (param) {
      return '(' + param.regex + ')';
    }).join('') + '$';
    var regex = new RegExp(regexStr);
    var getSymbol = function getSymbol(value) {
      var symbol;
      if (utils.isFunction(value)) {
        symbol = 'f';
      } else {
        var type = _typeof(value);
        switch (type) {
          case 'string':
            symbol = 's';
            break;
          case 'number':
            symbol = 'n';
            break;
          case 'boolean':
            symbol = 'b';
            break;
          case 'object':
            if (value === null) {
              symbol = 'l';
            } else if (Array.isArray(value)) {
              symbol = 'a';
            } else {
              symbol = 'o';
            }
            break;
          case 'undefined':
          default:
            // any value can be undefined, but should be allowed to match
            symbol = 'm';
          // m for missing
        }
      }
      return symbol;
    };
    var throwValidationError = function throwValidationError(badArgs, badSig) {
      // to figure out where this went wrong we need apply each component of the
      // regex to each argument until we get to the one that fails to match
      var partialPattern = '^';
      var goodTo = 0;
      for (var index = 0; index < params.length; index++) {
        partialPattern += params[index].regex;
        var match = badSig.match(partialPattern);
        if (match === null) {
          // failed here
          throw {
            code: "T0410",
            stack: new Error().stack,
            value: badArgs[goodTo],
            index: goodTo + 1
          };
        }
        goodTo = match[0].length;
      }
      // if it got this far, it's probably because of extraneous arguments (we
      // haven't added the trailing '$' in the regex yet.
      throw {
        code: "T0410",
        stack: new Error().stack,
        value: badArgs[goodTo],
        index: goodTo + 1
      };
    };
    return {
      definition: signature,
      validate: function validate(args, context) {
        var suppliedSig = '';
        args.forEach(function (arg) {
          suppliedSig += getSymbol(arg);
        });
        var isValid = regex.exec(suppliedSig);
        if (isValid) {
          var validatedArgs = [];
          var argIndex = 0;
          params.forEach(function (param, index) {
            var arg = args[argIndex];
            var match = isValid[index + 1];
            if (match === '') {
              if (param.context && param.contextRegex) {
                // substitute context value for missing arg
                // first check that the context value is the right type
                var contextType = getSymbol(context);
                // test contextType against the regex for this arg (without the trailing ?)
                if (param.contextRegex.test(contextType)) {
                  validatedArgs.push(context);
                } else {
                  // context value not compatible with this argument
                  throw {
                    code: "T0411",
                    stack: new Error().stack,
                    value: context,
                    index: argIndex + 1
                  };
                }
              } else {
                validatedArgs.push(arg);
                argIndex++;
              }
            } else {
              // may have matched multiple args (if the regex ends with a '+'
              // split into single tokens
              match.split('').forEach(function (single) {
                if (param.type === 'a') {
                  if (single === 'm') {
                    // missing (undefined)
                    arg = undefined;
                  } else {
                    arg = args[argIndex];
                    var arrayOK = true;
                    // is there type information on the contents of the array?
                    if (typeof param.subtype !== 'undefined') {
                      if (single !== 'a' && match !== param.subtype) {
                        arrayOK = false;
                      } else if (single === 'a') {
                        if (arg.length > 0) {
                          var itemType = getSymbol(arg[0]);
                          if (itemType !== param.subtype.charAt(0)) {
                            // TODO recurse further
                            arrayOK = false;
                          } else {
                            // make sure every item in the array is this type
                            var differentItems = arg.filter(function (val) {
                              return getSymbol(val) !== itemType;
                            });
                            arrayOK = differentItems.length === 0;
                          }
                        }
                      }
                    }
                    if (!arrayOK) {
                      throw {
                        code: "T0412",
                        stack: new Error().stack,
                        value: arg,
                        index: argIndex + 1,
                        type: arraySignatureMapping[param.subtype]
                      };
                    }
                    // the function expects an array. If it's not one, make it so
                    if (single !== 'a') {
                      arg = [arg];
                    }
                  }
                  validatedArgs.push(arg);
                  argIndex++;
                } else {
                  validatedArgs.push(arg);
                  argIndex++;
                }
              });
            }
          });
          return validatedArgs;
        }
        throwValidationError(args, suppliedSig);
      }
    };
  }
  return parseSignature;
}();
module.exports = signature;
},{"./utils":6}],6:[function(require,module,exports){
"use strict";

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
/**
 * © Copyright IBM Corp. 2016, 2018 All Rights Reserved
 *   Project name: JSONata
 *   This project is licensed under the MIT License, see LICENSE
 */

var utils = function () {
  'use strict';

  /**
   * Check if value is a finite number
   * @param {float} n - number to evaluate
   * @returns {boolean} True if n is a finite number
   */
  function isNumeric(n) {
    var isNum = false;
    if (typeof n === 'number') {
      isNum = !isNaN(n);
      if (isNum && !isFinite(n)) {
        throw {
          code: "D1001",
          value: n,
          stack: new Error().stack
        };
      }
    }
    return isNum;
  }

  /**
   * Returns true if the arg is an array of strings
   * @param {*} arg - the item to test
   * @returns {boolean} True if arg is an array of strings
   */
  function isArrayOfStrings(arg) {
    var result = false;
    /* istanbul ignore else */
    if (Array.isArray(arg)) {
      result = arg.filter(function (item) {
        return typeof item !== 'string';
      }).length === 0;
    }
    return result;
  }

  /**
   * Returns true if the arg is an array of numbers
   * @param {*} arg - the item to test
   * @returns {boolean} True if arg is an array of numbers
   */
  function isArrayOfNumbers(arg) {
    var result = false;
    if (Array.isArray(arg)) {
      result = arg.filter(function (item) {
        return !isNumeric(item);
      }).length === 0;
    }
    return result;
  }

  /**
   * Create an empty sequence to contain query results
   * @returns {Array} - empty sequence
   */
  function createSequence() {
    var sequence = [];
    sequence.sequence = true;
    if (arguments.length === 1) {
      sequence.push(arguments[0]);
    }
    return sequence;
  }

  /**
   * Tests if a value is a sequence
   * @param {*} value the value to test
   * @returns {boolean} true if it's a sequence
   */
  function isSequence(value) {
    return value.sequence === true && Array.isArray(value);
  }

  /**
   *
   * @param {Object} arg - expression to test
   * @returns {boolean} - true if it is a function (lambda or built-in)
   */
  function isFunction(arg) {
    return arg && (arg._jsonata_function === true || arg._jsonata_lambda === true) || typeof arg === 'function';
  }

  /**
   * Returns the arity (number of arguments) of the function
   * @param {*} func - the function
   * @returns {*} - the arity
   */
  function getFunctionArity(func) {
    var arity = typeof func.arity === 'number' ? func.arity : typeof func.implementation === 'function' ? func.implementation.length : typeof func.length === 'number' ? func.length : func.arguments.length;
    return arity;
  }

  /**
   * Tests whether arg is a lambda function
   * @param {*} arg - the value to test
   * @returns {boolean} - true if it is a lambda function
   */
  function isLambda(arg) {
    return arg && arg._jsonata_lambda === true;
  }

  // istanbul ignore next
  var iteratorSymbol = (typeof Symbol === "function" ? Symbol : {}).iterator || "@@iterator";

  /**
   * @param {Object} arg - expression to test
   * @returns {boolean} - true if it is iterable
   */
  function isIterable(arg) {
    return _typeof(arg) === 'object' && arg !== null && iteratorSymbol in arg && 'next' in arg && typeof arg.next === 'function';
  }

  /**
   * Compares two values for equality
   * @param {*} lhs first value
   * @param {*} rhs second value
   * @returns {boolean} true if they are deep equal
   */
  function isDeepEqual(lhs, rhs) {
    if (lhs === rhs) {
      return true;
    }
    if (_typeof(lhs) === 'object' && _typeof(rhs) === 'object' && lhs !== null && rhs !== null) {
      if (Array.isArray(lhs) && Array.isArray(rhs)) {
        // both arrays (or sequences)
        // must be the same length
        if (lhs.length !== rhs.length) {
          return false;
        }
        // must contain same values in same order
        for (var ii = 0; ii < lhs.length; ii++) {
          if (!isDeepEqual(lhs[ii], rhs[ii])) {
            return false;
          }
        }
        return true;
      }
      // both objects
      // must have the same set of keys (in any order)
      var lkeys = Object.getOwnPropertyNames(lhs);
      var rkeys = Object.getOwnPropertyNames(rhs);
      if (lkeys.length !== rkeys.length) {
        return false;
      }
      lkeys = lkeys.sort();
      rkeys = rkeys.sort();
      for (ii = 0; ii < lkeys.length; ii++) {
        if (lkeys[ii] !== rkeys[ii]) {
          return false;
        }
      }
      // must have the same values
      for (ii = 0; ii < lkeys.length; ii++) {
        var key = lkeys[ii];
        if (!isDeepEqual(lhs[key], rhs[key])) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  /**
   * @param {Object} arg - expression to test
   * @returns {boolean} - true if it is a promise
   */
  function isPromise(arg) {
    return _typeof(arg) === 'object' && arg !== null && 'then' in arg && typeof arg.then === 'function';
  }

  /**
   * converts a string to an array of characters
   * @param {string} str - the input string
   * @returns {Array} - the array of characters
   */
  function stringToArray(str) {
    var arr = [];
    var _iterator = _createForOfIteratorHelper(str),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var _char = _step.value;
        arr.push(_char);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    return arr;
  }
  return {
    isNumeric: isNumeric,
    isArrayOfStrings: isArrayOfStrings,
    isArrayOfNumbers: isArrayOfNumbers,
    createSequence: createSequence,
    isSequence: isSequence,
    isFunction: isFunction,
    isLambda: isLambda,
    isIterable: isIterable,
    getFunctionArity: getFunctionArity,
    isDeepEqual: isDeepEqual,
    stringToArray: stringToArray,
    isPromise: isPromise
  };
}();
module.exports = utils;
},{}]},{},[3])(3)
});
