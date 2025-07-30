'use strict';

const arrify = require(`arrify`);
const detectors = require(`./detectors`);

module.exports = commits => {
  const commitArray = arrify(commits);
  const tally = {};

  commitArray.forEach(commit => {
    const header = commit.split(`\n`)[0];

    for (const convention in detectors) {
      if (!Object.prototype.hasOwnProperty.call(detectors, convention)) {
        continue;
      }

      if (detectors[convention](header)) {
        let count = tally[convention];
        count = count ? ++count : 1;
        tally[convention] = count;
      }
    }
  });

  let max = 0;
  let ret = `unknown`;

  for (const prop in tally) {
    if (!Object.prototype.hasOwnProperty.call(tally, prop)) {
      continue;
    }

    const val = tally[prop];
    if (val > max) {
      max = val;
      ret = prop;
    } else if (val === max) {
      // Cheat
      if (prop === `ember` || prop === `jquery`) {
        ret = `jquery`;
      }
    }
  }

  return ret;
};
