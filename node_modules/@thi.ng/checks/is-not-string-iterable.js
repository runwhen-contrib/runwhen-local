export const isNotStringAndIterable = (x) => x != null &&
    typeof x !== "string" &&
    typeof x[Symbol.iterator] === "function";
