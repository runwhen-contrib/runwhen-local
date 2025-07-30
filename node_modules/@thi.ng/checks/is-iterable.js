export const isIterable = (x) => x != null && typeof x[Symbol.iterator] === "function";
