'use strict';

const regex = {
  angular: /^(\w*)(?:\((.*)\))?: (.*)$/,
  atom: /^(:.*?:) (.*)$/,
  ember: /^\[(.*) (.*)] (.*)$/,
  eslint: /^(\w*): (.*?)(?:\((.*)\))?$/,
  jquery: /^(\w*): ([^(]*)$/,
  jshint: /^\[\[(.*)]] (.*)$/,
};

module.exports = {
  angular: commit => {
    const parts = commit.match(regex.angular);

    if (!parts) {
      return false;
    }

    if (isLowerCase(parts[0][0])) {
      return true;
    }
  },
  atom: commit => {
    const match = commit.match(regex.atom);

    if (match) {
      return true;
    }

    return commit.match(/^Prepare (.*?) release$/);
  },
  ember: commit => {
    return commit.match(regex.ember);
  },
  eslint: commit => {
    const parts = commit.match(regex.eslint);

    if (!parts) {
      return false;
    }

    if (isUpperCase(parts[0][0])) {
      return true;
    }
  },
  jquery: commit => {
    const parts = commit.match(regex.jquery);

    if (!parts) {
      return false;
    }

    if (isUpperCase(parts[0][0])) {
      return true;
    }
  },
  jshint: commit => {
    return commit.match(regex.jshint);
  },
};

function isUpperCase(str) {
  return str === str.toUpperCase();
}

function isLowerCase(str) {
  return str === str.toLowerCase();
}
