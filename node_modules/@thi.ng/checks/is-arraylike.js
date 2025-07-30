export const isArrayLike = (x) => x != null && typeof x !== "function" && x.length !== undefined;
