export const isAsyncIterable = (x) => x != null && typeof x[Symbol.asyncIterator] === "function";
