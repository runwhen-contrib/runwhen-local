// @flow
const token = /^[^\u0000-\u001F\u007F()<>@,;:\\"/?={}\[\]\u0020\u0009]+$/;

export const isToken = (str: mixed): %checks =>
  typeof str === 'string' && token.test(str);
export const isScheme = isToken;
export const quote = (str: string): string => `"${str.replace(/"/g, '\\"')}"`;
export const unquote = (str: string): string =>
  str.substr(1, str.length - 2).replace(/\\"/g, '"');
