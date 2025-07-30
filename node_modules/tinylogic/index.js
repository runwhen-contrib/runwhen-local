const {parse} = require(`./grammar`);

exports.makeParser = (queryPattern = /[a-z]+/) => {
  return (str, checkFn) => parse(str, {queryPattern, checkFn});
};

exports.parse = exports.makeParser();
