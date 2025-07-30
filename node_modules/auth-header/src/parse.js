// @flow
import {isScheme, unquote} from './util';

// lol dis
const body = /((?:[a-zA-Z0-9._~+\/-]+=*(?:\s+|$))|[^\u0000-\u001F\u007F()<>@,;:\\"/?={}\[\]\u0020\u0009]+)(?:=([^\\"=\s,]+|"(?:[^"\\]|\\.)*"))?/g; // eslint-disable-line

const normalize = (
  prev: ?(string | Array<string>),
  _cur: string,
): string | Array<string> => {
  // Fixup quoted strings and tokens with spaces around them
  const cur = _cur.charAt(0) === '"' ? unquote(_cur) : _cur.trim();

  // Marshal
  if (Array.isArray(prev)) {
    return prev.concat(cur);
  } else if (typeof prev === 'string') {
    return [prev, cur];
  }
  return cur;
};

type Result = {
  scheme: string,
  params: {[string]: string},
  token: ?(string | Array<string>),
};

const parseProperties = (scheme, string): Result => {
  let token = null;
  const params = {};

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res = body.exec(string);
    if (res === null) {
      break;
    }
    if (res[2]) {
      params[res[1]] = normalize(params[res[1]], res[2]);
    } else {
      token = normalize(token, res[1]);
    }
  }

  return {scheme, params, token};
};

export default (str: string): Result => {
  if (typeof str !== 'string') {
    throw new TypeError('Header value must be a string.');
  }

  const start = str.indexOf(' ');
  const scheme = str.substr(0, start);

  if (!isScheme(scheme)) {
    throw new TypeError(`Invalid scheme ${scheme}`);
  }

  return parseProperties(scheme, str.substr(start));
};
