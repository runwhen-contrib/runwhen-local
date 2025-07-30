const RE = /^(?:[-+]?(?:0|[1-9][0-9]*))$/;
export const isIntString = (x) => RE.test(x);
