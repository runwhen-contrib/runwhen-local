// @flow
import {quote, isToken, isScheme} from './util';

const xxx = (key: string) => (value: string): string =>
  `${key}=${value && !isToken(value) ? quote(value) : value}`;

const build = (
  params: Array<[string, string | Array<string>]>,
): Array<string> => {
  return params.reduce((prev, [key, values]) => {
    const transform = xxx(key);
    if (!isToken(key)) {
      throw new TypeError();
    }
    if (Array.isArray(values)) {
      return [...prev, ...values.map(transform)];
    }
    return [...prev, transform(values)];
  }, []);
};

type Params =
  | Array<[string, string | Array<string>]>
  | {[string]: string | Array<string>};

const challenge = (params: Params, options) => {
  if (Array.isArray(params)) {
    return build(params);
  } else if (typeof params === 'object') {
    const entries: {[string]: string | Array<string>} = params;
    return challenge(
      Object.keys(params).map((key) => [key, entries[key]]),
      options,
    );
  }
  throw new TypeError();
};

export default (scheme: string, token: ?string, params: Params): string => {
  const obj = typeof scheme === 'string' ? {scheme, token, params} : scheme;

  if (typeof obj !== 'object') {
    throw new TypeError();
  } else if (!isScheme(obj.scheme)) {
    throw new TypeError('Invalid scheme.');
  }

  return [
    obj.scheme,
    ...(typeof obj.token !== 'undefined' ? [obj.token] : []),
    ...(typeof obj.params !== 'undefined' ? challenge(obj.params) : []),
  ].join(' ');
};
