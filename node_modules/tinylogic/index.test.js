const {parse, makeParser} = require(`./index`);

const parameters = new Map([
  [`true`, true],
  [`false`, false],
]);

const queries = [
  [`true`, true],
  [`false`, false],
  [`true | false`, true],
  [`true & false`, false],
  [`true ^ false`, true],
  [`false ^ false`, false],
  [`false & true | true`, true],
  [`!true`, false],
  [`!false`, true],
  [`!true | true`, true],
  [`!true & false`, false],
];

describe(`parse`, () => {
  const parse = makeParser();
  for (const [query, result] of queries) {
    it(query, () => expect(parse(query, name => parameters.get(name))).toEqual(result));
  }
});
