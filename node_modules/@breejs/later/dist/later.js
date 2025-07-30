(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.later = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports={
  "name": "@breejs/later",
  "description": "Maintained fork of later. Determine later (or previous) occurrences of recurring schedules",
  "version": "4.1.0",
  "author": "BunKat <bill@levelstory.com>",
  "bugs": {
    "url": "https://github.com/breejs/later/issues",
    "email": "niftylettuce@gmail.com"
  },
  "contributors": [
    "BunKat <bill@levelstory.com>",
    "Nick Baugh <niftylettuce@gmail.com> (http://niftylettuce.com/)",
    "yrambler2001 <yrambler2001@gmail.com> (https://yrambler2001.me/)"
  ],
  "devDependencies": {
    "@babel/cli": "^7.10.5",
    "@babel/core": "^7.11.1",
    "@babel/plugin-transform-runtime": "^7.11.0",
    "@babel/preset-env": "^7.11.0",
    "@commitlint/cli": "^18.4.3",
    "@commitlint/config-conventional": "^18.4.3",
    "babelify": "^10.0.0",
    "benchmark": "^2.1.4",
    "browserify": "^16.5.2",
    "cross-env": "^7.0.3",
    "eslint": "^7.7.0",
    "eslint-config-xo-lass": "^2.0.1",
    "eslint-plugin-compat": "^3.8.0",
    "eslint-plugin-node": "^11.1.0",
    "fixpack": "^4.0.0",
    "husky": "^8.0.3",
    "lint-staged": "^15.1.0",
    "mocha": "^10.2.0",
    "nyc": "^15.1.0",
    "remark-cli": "11",
    "remark-preset-github": "^4.0.4",
    "rimraf": "^5.0.5",
    "semver": "^7.3.2",
    "should": "^13.2.3",
    "sinon": "^11.1.2",
    "tinyify": "^3.0.0",
    "xo": "^0.33.0"
  },
  "engines": {
    "node": ">= 10"
  },
  "files": [
    "lib",
    "dist"
  ],
  "homepage": "https://github.com/breejs/later",
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "jsdelivr": "dist/later.min.js",
  "keywords": [
    "agenda",
    "async",
    "await",
    "bee",
    "bee",
    "bree",
    "bull",
    "bull",
    "callback",
    "cancel",
    "cancelable",
    "child",
    "clear",
    "cron",
    "cronjob",
    "crontab",
    "date",
    "dates",
    "day",
    "dayjs",
    "delay",
    "english",
    "express",
    "expression",
    "frequencies",
    "frequency",
    "frequent",
    "friendly",
    "graceful",
    "human",
    "humans",
    "interval",
    "job",
    "jobs",
    "js",
    "koa",
    "koatiming",
    "lad",
    "lass",
    "later",
    "moment",
    "momentjs",
    "mongo",
    "mongodb",
    "mongoose",
    "p-cancel",
    "p-cancelable",
    "p-retry",
    "parse",
    "parser",
    "pretty",
    "process",
    "processors",
    "promise",
    "promises",
    "queue",
    "queues",
    "readable",
    "recur",
    "recurring",
    "redis",
    "redis",
    "reload",
    "restart",
    "run",
    "runner",
    "schedule",
    "scheduler",
    "setup",
    "spawn",
    "tab",
    "task",
    "tasker",
    "time",
    "timeout",
    "timer",
    "timers",
    "translated",
    "universalify",
    "worker",
    "workers"
  ],
  "license": "MIT",
  "main": "lib/index.js",
  "publishConfig": {
    "access": "public"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/breejs/later"
  },
  "scripts": {
    "benchmark": "benchmark/constraint/next-bench.js && benchmark/core/schedule-bench.js",
    "browserify": "browserify src/index.js -o dist/later.js -s later -g [ babelify --configFile ./.dist.babelrc ]",
    "build": "npm run build:clean && npm run build:lib && npm run build:dist",
    "build:clean": "rimraf lib dist",
    "build:dist": "npm run browserify && npm run minify",
    "build:lib": "babel --config-file ./.lib.babelrc src --out-dir lib",
    "coverage": "nyc report --reporter=text-lcov > coverage.lcov",
    "lint": "npm run lint:js && npm run lint:md && npm run lint:lib && npm run lint:dist",
    "lint:dist": "eslint --no-inline-config -c .dist.eslintrc dist",
    "lint:js": "xo",
    "lint:lib": "eslint -c .lib.eslintrc lib",
    "lint:md": "remark . -qfo",
    "minify": "cross-env NODE_ENV=production browserify src/index.js -o dist/later.min.js -s later -g [ babelify --configFile ./.dist.babelrc ] -p tinyify",
    "nyc": "cross-env NODE_ENV=test nyc mocha test/**/*-test.js --reporter dot",
    "pretest": "npm run build && npm run lint",
    "test": "cross-env NODE_ENV=test mocha test/**/*-test.js --reporter dot --exit",
    "test-coverage": "cross-env NODE_ENV=test nyc npm run test"
  },
  "unpkg": "dist/later.min.js",
  "xo": {
    "prettier": true,
    "space": true,
    "extends": [
      "xo-lass"
    ],
    "rules": {
      "complexity": "warn",
      "default-case": "warn",
      "eqeqeq": "warn",
      "guard-for-in": "warn",
      "max-params": "warn",
      "new-cap": "warn",
      "no-case-declarations": "warn",
      "no-multi-assign": "warn",
      "no-negated-condition": "warn",
      "no-return-assign": "warn",
      "no-unused-vars": "warn",
      "no-var": "warn",
      "prefer-const": "warn",
      "prefer-rest-params": "warn",
      "unicorn/no-fn-reference-in-iterator": "warn",
      "unicorn/prefer-number-properties": "warn",
      "unicorn/prevent-abbreviations": "warn"
    },
    "overrides": [
      {
        "files": "example/**/*.js",
        "rules": {
          "no-unused-vars": "warn"
        }
      },
      {
        "files": "test/**/*.js",
        "env": [
          "mocha"
        ],
        "rules": {
          "new-cap": "warn",
          "no-unused-vars": "warn",
          "unicorn/prevent-abbreviations": "warn"
        }
      }
    ]
  }
}

},{}],2:[function(require,module,exports){
"use strict";

var pkg = require('../package.json');
var later = {
  version: pkg.version
};
later.array = {};
later.array.sort = function (array, zeroIsLast) {
  array.sort(function (a, b) {
    return Number(a) - Number(b);
  });
  if (zeroIsLast && array[0] === 0) {
    array.push(array.shift());
  }
};
later.array.next = function (value, values, extent) {
  var cur;
  var zeroIsLargest = extent[0] !== 0;
  var nextIdx = 0;
  for (var i = values.length - 1; i > -1; --i) {
    cur = values[i];
    if (cur === value) {
      return cur;
    }
    if (cur > value || cur === 0 && zeroIsLargest && extent[1] > value) {
      nextIdx = i;
      continue;
    }
    break;
  }
  return values[nextIdx];
};
later.array.nextInvalid = function (value, values, extent) {
  var min = extent[0];
  var max = extent[1];
  var length = values.length;
  var zeroValue = values[length - 1] === 0 && min !== 0 ? max : 0;
  var next = value;
  var i = values.indexOf(value);
  var start = next;
  while (next === (values[i] || zeroValue)) {
    next++;
    if (next > max) {
      next = min;
    }
    i++;
    if (i === length) {
      i = 0;
    }
    if (next === start) {
      return undefined;
    }
  }
  return next;
};
later.array.prev = function (value, values, extent) {
  var cur;
  var length = values.length;
  var zeroIsLargest = extent[0] !== 0;
  var previousIdx = length - 1;
  for (var i = 0; i < length; i++) {
    cur = values[i];
    if (cur === value) {
      return cur;
    }
    if (cur < value || cur === 0 && zeroIsLargest && extent[1] < value) {
      previousIdx = i;
      continue;
    }
    break;
  }
  return values[previousIdx];
};
later.array.prevInvalid = function (value, values, extent) {
  var min = extent[0];
  var max = extent[1];
  var length = values.length;
  var zeroValue = values[length - 1] === 0 && min !== 0 ? max : 0;
  var next = value;
  var i = values.indexOf(value);
  var start = next;
  while (next === (values[i] || zeroValue)) {
    next--;
    if (next < min) {
      next = max;
    }
    i--;
    if (i === -1) {
      i = length - 1;
    }
    if (next === start) {
      return undefined;
    }
  }
  return next;
};
later.day = later.D = {
  name: 'day',
  range: 86400,
  val: function val(d) {
    return d.D || (d.D = later.date.getDate.call(d));
  },
  isValid: function isValid(d, value) {
    return later.D.val(d) === (value || later.D.extent(d)[1]);
  },
  extent: function extent(d) {
    if (d.DExtent) return d.DExtent;
    var month = later.M.val(d);
    var max = later.DAYS_IN_MONTH[month - 1];
    if (month === 2 && later.dy.extent(d)[1] === 366) {
      max += 1;
    }
    return d.DExtent = [1, max];
  },
  start: function start(d) {
    return d.DStart || (d.DStart = later.date.next(later.Y.val(d), later.M.val(d), later.D.val(d)));
  },
  end: function end(d) {
    return d.DEnd || (d.DEnd = later.date.prev(later.Y.val(d), later.M.val(d), later.D.val(d)));
  },
  next: function next(d, value) {
    value = value > later.D.extent(d)[1] ? 1 : value;
    var month = later.date.nextRollover(d, value, later.D, later.M);
    var DMax = later.D.extent(month)[1];
    value = value > DMax ? 1 : value || DMax;
    return later.date.next(later.Y.val(month), later.M.val(month), value);
  },
  prev: function prev(d, value) {
    var month = later.date.prevRollover(d, value, later.D, later.M);
    var DMax = later.D.extent(month)[1];
    return later.date.prev(later.Y.val(month), later.M.val(month), value > DMax ? DMax : value || DMax);
  }
};
later.dayOfWeekCount = later.dc = {
  name: 'day of week count',
  range: 604800,
  val: function val(d) {
    return d.dc || (d.dc = Math.floor((later.D.val(d) - 1) / 7) + 1);
  },
  isValid: function isValid(d, value) {
    return later.dc.val(d) === value || value === 0 && later.D.val(d) > later.D.extent(d)[1] - 7;
  },
  extent: function extent(d) {
    return d.dcExtent || (d.dcExtent = [1, Math.ceil(later.D.extent(d)[1] / 7)]);
  },
  start: function start(d) {
    return d.dcStart || (d.dcStart = later.date.next(later.Y.val(d), later.M.val(d), Math.max(1, (later.dc.val(d) - 1) * 7 + 1 || 1)));
  },
  end: function end(d) {
    return d.dcEnd || (d.dcEnd = later.date.prev(later.Y.val(d), later.M.val(d), Math.min(later.dc.val(d) * 7, later.D.extent(d)[1])));
  },
  next: function next(d, value) {
    value = value > later.dc.extent(d)[1] ? 1 : value;
    var month = later.date.nextRollover(d, value, later.dc, later.M);
    var dcMax = later.dc.extent(month)[1];
    value = value > dcMax ? 1 : value;
    var next = later.date.next(later.Y.val(month), later.M.val(month), value === 0 ? later.D.extent(month)[1] - 6 : 1 + 7 * (value - 1));
    if (next.getTime() <= d.getTime()) {
      month = later.M.next(d, later.M.val(d) + 1);
      return later.date.next(later.Y.val(month), later.M.val(month), value === 0 ? later.D.extent(month)[1] - 6 : 1 + 7 * (value - 1));
    }
    return next;
  },
  prev: function prev(d, value) {
    var month = later.date.prevRollover(d, value, later.dc, later.M);
    var dcMax = later.dc.extent(month)[1];
    value = value > dcMax ? dcMax : value || dcMax;
    return later.dc.end(later.date.prev(later.Y.val(month), later.M.val(month), 1 + 7 * (value - 1)));
  }
};
later.dayOfWeek = later.dw = later.d = {
  name: 'day of week',
  range: 86400,
  val: function val(d) {
    return d.dw || (d.dw = later.date.getDay.call(d) + 1);
  },
  isValid: function isValid(d, value) {
    return later.dw.val(d) === (value || 7);
  },
  extent: function extent() {
    return [1, 7];
  },
  start: function start(d) {
    return later.D.start(d);
  },
  end: function end(d) {
    return later.D.end(d);
  },
  next: function next(d, value) {
    value = value > 7 ? 1 : value || 7;
    return later.date.next(later.Y.val(d), later.M.val(d), later.D.val(d) + (value - later.dw.val(d)) + (value <= later.dw.val(d) ? 7 : 0));
  },
  prev: function prev(d, value) {
    value = value > 7 ? 7 : value || 7;
    return later.date.prev(later.Y.val(d), later.M.val(d), later.D.val(d) + (value - later.dw.val(d)) + (value >= later.dw.val(d) ? -7 : 0));
  }
};
later.dayOfYear = later.dy = {
  name: 'day of year',
  range: 86400,
  val: function val(d) {
    return d.dy || (d.dy = Math.ceil(1 + (later.D.start(d).getTime() - later.Y.start(d).getTime()) / later.DAY));
  },
  isValid: function isValid(d, value) {
    return later.dy.val(d) === (value || later.dy.extent(d)[1]);
  },
  extent: function extent(d) {
    var year = later.Y.val(d);
    return d.dyExtent || (d.dyExtent = [1, year % 4 ? 365 : 366]);
  },
  start: function start(d) {
    return later.D.start(d);
  },
  end: function end(d) {
    return later.D.end(d);
  },
  next: function next(d, value) {
    value = value > later.dy.extent(d)[1] ? 1 : value;
    var year = later.date.nextRollover(d, value, later.dy, later.Y);
    var dyMax = later.dy.extent(year)[1];
    value = value > dyMax ? 1 : value || dyMax;
    return later.date.next(later.Y.val(year), later.M.val(year), value);
  },
  prev: function prev(d, value) {
    var year = later.date.prevRollover(d, value, later.dy, later.Y);
    var dyMax = later.dy.extent(year)[1];
    value = value > dyMax ? dyMax : value || dyMax;
    return later.date.prev(later.Y.val(year), later.M.val(year), value);
  }
};
later.hour = later.h = {
  name: 'hour',
  range: 3600,
  val: function val(d) {
    return d.h || (d.h = later.date.getHour.call(d));
  },
  isValid: function isValid(d, value) {
    return later.h.val(d) === value;
  },
  extent: function extent() {
    return [0, 23];
  },
  start: function start(d) {
    return d.hStart || (d.hStart = later.date.next(later.Y.val(d), later.M.val(d), later.D.val(d), later.h.val(d)));
  },
  end: function end(d) {
    return d.hEnd || (d.hEnd = later.date.prev(later.Y.val(d), later.M.val(d), later.D.val(d), later.h.val(d)));
  },
  next: function next(d, value) {
    value = value > 23 ? 0 : value;
    var next = later.date.next(later.Y.val(d), later.M.val(d), later.D.val(d) + (value <= later.h.val(d) ? 1 : 0), value);
    if (!later.date.isUTC && next.getTime() <= d.getTime()) {
      next = later.date.next(later.Y.val(next), later.M.val(next), later.D.val(next), value + 1);
    }
    return next;
  },
  prev: function prev(d, value) {
    value = value > 23 ? 23 : value;
    return later.date.prev(later.Y.val(d), later.M.val(d), later.D.val(d) + (value >= later.h.val(d) ? -1 : 0), value);
  }
};
later.minute = later.m = {
  name: 'minute',
  range: 60,
  val: function val(d) {
    return d.m || (d.m = later.date.getMin.call(d));
  },
  isValid: function isValid(d, value) {
    return later.m.val(d) === value;
  },
  extent: function extent(d) {
    return [0, 59];
  },
  start: function start(d) {
    return d.mStart || (d.mStart = later.date.next(later.Y.val(d), later.M.val(d), later.D.val(d), later.h.val(d), later.m.val(d)));
  },
  end: function end(d) {
    return d.mEnd || (d.mEnd = later.date.prev(later.Y.val(d), later.M.val(d), later.D.val(d), later.h.val(d), later.m.val(d)));
  },
  next: function next(d, value) {
    var m = later.m.val(d);
    var s = later.s.val(d);
    var inc = value > 59 ? 60 - m : value <= m ? 60 - m + value : value - m;
    var next = new Date(d.getTime() + inc * later.MIN - s * later.SEC);
    if (!later.date.isUTC && next.getTime() <= d.getTime()) {
      next = new Date(d.getTime() + (inc + 120) * later.MIN - s * later.SEC);
    }
    return next;
  },
  prev: function prev(d, value) {
    value = value > 59 ? 59 : value;
    return later.date.prev(later.Y.val(d), later.M.val(d), later.D.val(d), later.h.val(d) + (value >= later.m.val(d) ? -1 : 0), value);
  }
};
later.month = later.M = {
  name: 'month',
  range: 2629740,
  val: function val(d) {
    return d.M || (d.M = later.date.getMonth.call(d) + 1);
  },
  isValid: function isValid(d, value) {
    return later.M.val(d) === (value || 12);
  },
  extent: function extent() {
    return [1, 12];
  },
  start: function start(d) {
    return d.MStart || (d.MStart = later.date.next(later.Y.val(d), later.M.val(d)));
  },
  end: function end(d) {
    return d.MEnd || (d.MEnd = later.date.prev(later.Y.val(d), later.M.val(d)));
  },
  next: function next(d, value) {
    value = value > 12 ? 1 : value || 12;
    return later.date.next(later.Y.val(d) + (value > later.M.val(d) ? 0 : 1), value);
  },
  prev: function prev(d, value) {
    value = value > 12 ? 12 : value || 12;
    return later.date.prev(later.Y.val(d) - (value >= later.M.val(d) ? 1 : 0), value);
  }
};
later.second = later.s = {
  name: 'second',
  range: 1,
  val: function val(d) {
    return d.s || (d.s = later.date.getSec.call(d));
  },
  isValid: function isValid(d, value) {
    return later.s.val(d) === value;
  },
  extent: function extent() {
    return [0, 59];
  },
  start: function start(d) {
    return d;
  },
  end: function end(d) {
    return d;
  },
  next: function next(d, value) {
    var s = later.s.val(d);
    var inc = value > 59 ? 60 - s : value <= s ? 60 - s + value : value - s;
    var next = new Date(d.getTime() + inc * later.SEC);
    if (!later.date.isUTC && next.getTime() <= d.getTime()) {
      next = new Date(d.getTime() + (inc + 7200) * later.SEC);
    }
    return next;
  },
  prev: function prev(d, value, cache) {
    value = value > 59 ? 59 : value;
    return later.date.prev(later.Y.val(d), later.M.val(d), later.D.val(d), later.h.val(d), later.m.val(d) + (value >= later.s.val(d) ? -1 : 0), value);
  }
};
later.time = later.t = {
  name: 'time',
  range: 1,
  val: function val(d) {
    return d.t || (d.t = later.h.val(d) * 3600 + later.m.val(d) * 60 + later.s.val(d));
  },
  isValid: function isValid(d, value) {
    return later.t.val(d) === value;
  },
  extent: function extent() {
    return [0, 86399];
  },
  start: function start(d) {
    return d;
  },
  end: function end(d) {
    return d;
  },
  next: function next(d, value) {
    value = value > 86399 ? 0 : value;
    var next = later.date.next(later.Y.val(d), later.M.val(d), later.D.val(d) + (value <= later.t.val(d) ? 1 : 0), 0, 0, value);
    if (!later.date.isUTC && next.getTime() < d.getTime()) {
      next = later.date.next(later.Y.val(next), later.M.val(next), later.D.val(next), later.h.val(next), later.m.val(next), value + 7200);
    }
    return next;
  },
  prev: function prev(d, value) {
    value = value > 86399 ? 86399 : value;
    return later.date.next(later.Y.val(d), later.M.val(d), later.D.val(d) + (value >= later.t.val(d) ? -1 : 0), 0, 0, value);
  }
};
later.weekOfMonth = later.wm = {
  name: 'week of month',
  range: 604800,
  val: function val(d) {
    return d.wm || (d.wm = (later.D.val(d) + (later.dw.val(later.M.start(d)) - 1) + (7 - later.dw.val(d))) / 7);
  },
  isValid: function isValid(d, value) {
    return later.wm.val(d) === (value || later.wm.extent(d)[1]);
  },
  extent: function extent(d) {
    return d.wmExtent || (d.wmExtent = [1, (later.D.extent(d)[1] + (later.dw.val(later.M.start(d)) - 1) + (7 - later.dw.val(later.M.end(d)))) / 7]);
  },
  start: function start(d) {
    return d.wmStart || (d.wmStart = later.date.next(later.Y.val(d), later.M.val(d), Math.max(later.D.val(d) - later.dw.val(d) + 1, 1)));
  },
  end: function end(d) {
    return d.wmEnd || (d.wmEnd = later.date.prev(later.Y.val(d), later.M.val(d), Math.min(later.D.val(d) + (7 - later.dw.val(d)), later.D.extent(d)[1])));
  },
  next: function next(d, value) {
    value = value > later.wm.extent(d)[1] ? 1 : value;
    var month = later.date.nextRollover(d, value, later.wm, later.M);
    var wmMax = later.wm.extent(month)[1];
    value = value > wmMax ? 1 : value || wmMax;
    return later.date.next(later.Y.val(month), later.M.val(month), Math.max(1, (value - 1) * 7 - (later.dw.val(month) - 2)));
  },
  prev: function prev(d, value) {
    var month = later.date.prevRollover(d, value, later.wm, later.M);
    var wmMax = later.wm.extent(month)[1];
    value = value > wmMax ? wmMax : value || wmMax;
    return later.wm.end(later.date.next(later.Y.val(month), later.M.val(month), Math.max(1, (value - 1) * 7 - (later.dw.val(month) - 2))));
  }
};
later.weekOfYear = later.wy = {
  name: 'week of year (ISO)',
  range: 604800,
  val: function val(d) {
    if (d.wy) return d.wy;
    var wThur = later.dw.next(later.wy.start(d), 5);
    var YThur = later.dw.next(later.Y.prev(wThur, later.Y.val(wThur) - 1), 5);
    return d.wy = 1 + Math.ceil((wThur.getTime() - YThur.getTime()) / later.WEEK);
  },
  isValid: function isValid(d, value) {
    return later.wy.val(d) === (value || later.wy.extent(d)[1]);
  },
  extent: function extent(d) {
    if (d.wyExtent) return d.wyExtent;
    var year = later.dw.next(later.wy.start(d), 5);
    var dwFirst = later.dw.val(later.Y.start(year));
    var dwLast = later.dw.val(later.Y.end(year));
    return d.wyExtent = [1, dwFirst === 5 || dwLast === 5 ? 53 : 52];
  },
  start: function start(d) {
    return d.wyStart || (d.wyStart = later.date.next(later.Y.val(d), later.M.val(d), later.D.val(d) - (later.dw.val(d) > 1 ? later.dw.val(d) - 2 : 6)));
  },
  end: function end(d) {
    return d.wyEnd || (d.wyEnd = later.date.prev(later.Y.val(d), later.M.val(d), later.D.val(d) + (later.dw.val(d) > 1 ? 8 - later.dw.val(d) : 0)));
  },
  next: function next(d, value) {
    value = value > later.wy.extent(d)[1] ? 1 : value;
    var wyThur = later.dw.next(later.wy.start(d), 5);
    var year = later.date.nextRollover(wyThur, value, later.wy, later.Y);
    if (later.wy.val(year) !== 1) {
      year = later.dw.next(year, 2);
    }
    var wyMax = later.wy.extent(year)[1];
    var wyStart = later.wy.start(year);
    value = value > wyMax ? 1 : value || wyMax;
    return later.date.next(later.Y.val(wyStart), later.M.val(wyStart), later.D.val(wyStart) + 7 * (value - 1));
  },
  prev: function prev(d, value) {
    var wyThur = later.dw.next(later.wy.start(d), 5);
    var year = later.date.prevRollover(wyThur, value, later.wy, later.Y);
    if (later.wy.val(year) !== 1) {
      year = later.dw.next(year, 2);
    }
    var wyMax = later.wy.extent(year)[1];
    var wyEnd = later.wy.end(year);
    value = value > wyMax ? wyMax : value || wyMax;
    return later.wy.end(later.date.next(later.Y.val(wyEnd), later.M.val(wyEnd), later.D.val(wyEnd) + 7 * (value - 1)));
  }
};
later.year = later.Y = {
  name: 'year',
  range: 31556900,
  val: function val(d) {
    return d.Y || (d.Y = later.date.getYear.call(d));
  },
  isValid: function isValid(d, value) {
    return later.Y.val(d) === value;
  },
  extent: function extent() {
    return [1970, 2099];
  },
  start: function start(d) {
    return d.YStart || (d.YStart = later.date.next(later.Y.val(d)));
  },
  end: function end(d) {
    return d.YEnd || (d.YEnd = later.date.prev(later.Y.val(d)));
  },
  next: function next(d, value) {
    return value > later.Y.val(d) && value <= later.Y.extent()[1] ? later.date.next(value) : later.NEVER;
  },
  prev: function prev(d, value) {
    return value < later.Y.val(d) && value >= later.Y.extent()[0] ? later.date.prev(value) : later.NEVER;
  }
};
later.fullDate = later.fd = {
  name: 'full date',
  range: 1,
  val: function val(d) {
    return d.fd || (d.fd = d.getTime());
  },
  isValid: function isValid(d, value) {
    return later.fd.val(d) === value;
  },
  extent: function extent() {
    return [0, 3250368e7];
  },
  start: function start(d) {
    return d;
  },
  end: function end(d) {
    return d;
  },
  next: function next(d, value) {
    return later.fd.val(d) < value ? new Date(value) : later.NEVER;
  },
  prev: function prev(d, value) {
    return later.fd.val(d) > value ? new Date(value) : later.NEVER;
  }
};
later.modifier = {};
later.modifier.after = later.modifier.a = function (constraint, values) {
  var value = values[0];
  return {
    name: 'after ' + constraint.name,
    range: (constraint.extent(new Date())[1] - value) * constraint.range,
    val: constraint.val,
    isValid: function isValid(d, value_) {
      return this.val(d) >= value;
    },
    extent: constraint.extent,
    start: constraint.start,
    end: constraint.end,
    next: function next(startDate, value_) {
      if (value_ != value) value_ = constraint.extent(startDate)[0];
      return constraint.next(startDate, value_);
    },
    prev: function prev(startDate, value_) {
      value_ = value_ === value ? constraint.extent(startDate)[1] : value - 1;
      return constraint.prev(startDate, value_);
    }
  };
};
later.modifier.before = later.modifier.b = function (constraint, values) {
  var value = values[values.length - 1];
  return {
    name: 'before ' + constraint.name,
    range: constraint.range * (value - 1),
    val: constraint.val,
    isValid: function isValid(d, value_) {
      return this.val(d) < value;
    },
    extent: constraint.extent,
    start: constraint.start,
    end: constraint.end,
    next: function next(startDate, value_) {
      value_ = value_ === value ? constraint.extent(startDate)[0] : value;
      return constraint.next(startDate, value_);
    },
    prev: function prev(startDate, value_) {
      value_ = value_ === value ? value - 1 : constraint.extent(startDate)[1];
      return constraint.prev(startDate, value_);
    }
  };
};
later.compile = function (schedDef) {
  var constraints = [];
  var constraintsLength = 0;
  var tickConstraint;
  for (var key in schedDef) {
    var nameParts = key.split('_');
    var name = nameParts[0];
    var mod = nameParts[1];
    var vals = schedDef[key];
    var constraint = mod ? later.modifier[mod](later[name], vals) : later[name];
    constraints.push({
      constraint: constraint,
      vals: vals
    });
    constraintsLength++;
  }
  constraints.sort(function (a, b) {
    var ra = a.constraint.range;
    var rb = b.constraint.range;
    return rb < ra ? -1 : rb > ra ? 1 : 0;
  });
  tickConstraint = constraints[constraintsLength - 1].constraint;
  function compareFn(dir) {
    return dir === 'next' ? function (a, b) {
      if (!a || !b) return true;
      return a.getTime() > b.getTime();
    } : function (a, b) {
      if (!a || !b) return true;
      return b.getTime() > a.getTime();
    };
  }
  return {
    start: function start(dir, startDate) {
      var next = startDate;
      var nextValue = later.array[dir];
      var maxAttempts = 1e3;
      var done;
      while (maxAttempts-- && !done && next) {
        done = true;
        for (var i = 0; i < constraintsLength; i++) {
          var _constraint = constraints[i].constraint;
          var curValue = _constraint.val(next);
          var extent = _constraint.extent(next);
          var newValue = nextValue(curValue, constraints[i].vals, extent);
          if (!_constraint.isValid(next, newValue)) {
            next = _constraint[dir](next, newValue);
            done = false;
            break;
          }
        }
      }
      if (next !== later.NEVER) {
        next = dir === 'next' ? tickConstraint.start(next) : tickConstraint.end(next);
      }
      return next;
    },
    end: function end(dir, startDate) {
      var result;
      var nextValue = later.array[dir + 'Invalid'];
      var compare = compareFn(dir);
      for (var i = constraintsLength - 1; i >= 0; i--) {
        var _constraint2 = constraints[i].constraint;
        var curValue = _constraint2.val(startDate);
        var extent = _constraint2.extent(startDate);
        var newValue = nextValue(curValue, constraints[i].vals, extent);
        var next;
        if (newValue !== undefined) {
          next = _constraint2[dir](startDate, newValue);
          if (next && (!result || compare(result, next))) {
            result = next;
          }
        }
      }
      return result;
    },
    tick: function tick(dir, date) {
      return new Date(dir === 'next' ? tickConstraint.end(date).getTime() + later.SEC : tickConstraint.start(date).getTime() - later.SEC);
    },
    tickStart: function tickStart(date) {
      return tickConstraint.start(date);
    }
  };
};
later.schedule = function (sched) {
  if (!sched) throw new Error('Missing schedule definition.');
  if (!sched.schedules) throw new Error('Definition must include at least one schedule.');
  var schedules = [];
  var schedulesLength = sched.schedules.length;
  var exceptions = [];
  var exceptionsLength = sched.exceptions ? sched.exceptions.length : 0;
  for (var i = 0; i < schedulesLength; i++) {
    schedules.push(later.compile(sched.schedules[i]));
  }
  for (var j = 0; j < exceptionsLength; j++) {
    exceptions.push(later.compile(sched.exceptions[j]));
  }
  function getInstances(dir, count, startDate, endDate, isRange) {
    var compare = compareFn(dir);
    var loopCount = count;
    var maxAttempts = 1e3;
    var schedStarts = [];
    var exceptStarts = [];
    var next;
    var end;
    var results = [];
    var isForward = dir === 'next';
    var lastResult;
    var rStart = isForward ? 0 : 1;
    var rEnd = isForward ? 1 : 0;
    startDate = startDate ? new Date(startDate) : new Date();
    if (!startDate || !startDate.getTime()) throw new Error('Invalid start date.');
    setNextStarts(dir, schedules, schedStarts, startDate);
    setRangeStarts(dir, exceptions, exceptStarts, startDate);
    while (maxAttempts-- && loopCount && (next = findNext(schedStarts, compare))) {
      if (endDate && compare(next, endDate)) {
        break;
      }
      if (exceptionsLength) {
        updateRangeStarts(dir, exceptions, exceptStarts, next);
        if (end = calcRangeOverlap(dir, exceptStarts, next)) {
          updateNextStarts(dir, schedules, schedStarts, end);
          continue;
        }
      }
      if (isRange) {
        var maxEndDate = calcMaxEndDate(exceptStarts, compare);
        end = calcEnd(dir, schedules, schedStarts, next, maxEndDate);
        var r = isForward ? [new Date(Math.max(startDate, next)), end ? new Date(endDate ? Math.min(end, endDate) : end) : undefined] : [end ? new Date(endDate ? Math.max(endDate, end.getTime() + later.SEC) : end.getTime() + later.SEC) : undefined, new Date(Math.min(startDate, next.getTime() + later.SEC))];
        if (lastResult && r[rStart].getTime() === lastResult[rEnd].getTime()) {
          lastResult[rEnd] = r[rEnd];
          loopCount++;
        } else {
          lastResult = r;
          results.push(lastResult);
        }
        if (!end) break;
        updateNextStarts(dir, schedules, schedStarts, end);
      } else {
        results.push(isForward ? new Date(Math.max(startDate, next)) : getStart(schedules, schedStarts, next, endDate));
        tickStarts(dir, schedules, schedStarts, next);
      }
      loopCount--;
    }
    for (var _i = 0, length = results.length; _i < length; _i++) {
      var result = results[_i];
      results[_i] = Object.prototype.toString.call(result) === '[object Array]' ? [cleanDate(result[0]), cleanDate(result[1])] : cleanDate(result);
    }
    return results.length === 0 ? later.NEVER : count === 1 ? results[0] : results;
  }
  function cleanDate(d) {
    if (d instanceof Date && !isNaN(d.valueOf())) {
      return new Date(d);
    }
    return undefined;
  }
  function setNextStarts(dir, schedArray, startsArray, startDate) {
    for (var _i2 = 0, length = schedArray.length; _i2 < length; _i2++) {
      startsArray[_i2] = schedArray[_i2].start(dir, startDate);
    }
  }
  function updateNextStarts(dir, schedArray, startsArray, startDate) {
    var compare = compareFn(dir);
    for (var _i3 = 0, length = schedArray.length; _i3 < length; _i3++) {
      if (startsArray[_i3] && !compare(startsArray[_i3], startDate)) {
        startsArray[_i3] = schedArray[_i3].start(dir, startDate);
      }
    }
  }
  function setRangeStarts(dir, schedArray, rangesArray, startDate) {
    var compare = compareFn(dir);
    for (var _i4 = 0, length = schedArray.length; _i4 < length; _i4++) {
      var nextStart = schedArray[_i4].start(dir, startDate);
      if (!nextStart) {
        rangesArray[_i4] = later.NEVER;
      } else {
        rangesArray[_i4] = [nextStart, schedArray[_i4].end(dir, nextStart)];
      }
    }
  }
  function updateRangeStarts(dir, schedArray, rangesArray, startDate) {
    var compare = compareFn(dir);
    for (var _i5 = 0, length = schedArray.length; _i5 < length; _i5++) {
      if (rangesArray[_i5] && !compare(rangesArray[_i5][0], startDate)) {
        var nextStart = schedArray[_i5].start(dir, startDate);
        if (!nextStart) {
          rangesArray[_i5] = later.NEVER;
        } else {
          rangesArray[_i5] = [nextStart, schedArray[_i5].end(dir, nextStart)];
        }
      }
    }
  }
  function tickStarts(dir, schedArray, startsArray, startDate) {
    for (var _i6 = 0, length = schedArray.length; _i6 < length; _i6++) {
      if (startsArray[_i6] && startsArray[_i6].getTime() === startDate.getTime()) {
        startsArray[_i6] = schedArray[_i6].start(dir, schedArray[_i6].tick(dir, startDate));
      }
    }
  }
  function getStart(schedArray, startsArray, startDate, minEndDate) {
    var result;
    for (var _i7 = 0, length = startsArray.length; _i7 < length; _i7++) {
      if (startsArray[_i7] && startsArray[_i7].getTime() === startDate.getTime()) {
        var start = schedArray[_i7].tickStart(startDate);
        if (minEndDate && start < minEndDate) {
          return minEndDate;
        }
        if (!result || start > result) {
          result = start;
        }
      }
    }
    return result;
  }
  function calcRangeOverlap(dir, rangesArray, startDate) {
    var compare = compareFn(dir);
    var result;
    for (var _i8 = 0, length = rangesArray.length; _i8 < length; _i8++) {
      var range = rangesArray[_i8];
      if (range && !compare(range[0], startDate) && (!range[1] || compare(range[1], startDate))) {
        if (!result || compare(range[1], result)) {
          result = range[1];
        }
      }
    }
    return result;
  }
  function calcMaxEndDate(exceptsArray, compare) {
    var result;
    for (var _i9 = 0, length = exceptsArray.length; _i9 < length; _i9++) {
      if (exceptsArray[_i9] && (!result || compare(result, exceptsArray[_i9][0]))) {
        result = exceptsArray[_i9][0];
      }
    }
    return result;
  }
  function calcEnd(dir, schedArray, startsArray, startDate, maxEndDate) {
    var compare = compareFn(dir);
    var result;
    for (var _i10 = 0, length = schedArray.length; _i10 < length; _i10++) {
      var start = startsArray[_i10];
      if (start && start.getTime() === startDate.getTime()) {
        var end = schedArray[_i10].end(dir, start);
        if (maxEndDate && (!end || compare(end, maxEndDate))) {
          return maxEndDate;
        }
        if (!result || compare(end, result)) {
          result = end;
        }
      }
    }
    return result;
  }
  function compareFn(dir) {
    return dir === 'next' ? function (a, b) {
      if (!a || !b) return true;
      return a.getTime() > b.getTime();
    } : function (a, b) {
      if (!a || !b) return true;
      return b.getTime() > a.getTime();
    };
  }
  function findNext(array, compare) {
    var next = array[0];
    for (var _i11 = 1, length = array.length; _i11 < length; _i11++) {
      if (array[_i11] && compare(next, array[_i11])) {
        next = array[_i11];
      }
    }
    return next;
  }
  return {
    isValid: function isValid(d) {
      return getInstances('next', 1, d, d) !== later.NEVER;
    },
    next: function next(count, startDate, endDate) {
      return getInstances('next', count || 1, startDate, endDate);
    },
    prev: function prev(count, startDate, endDate) {
      return getInstances('prev', count || 1, startDate, endDate);
    },
    nextRange: function nextRange(count, startDate, endDate) {
      return getInstances('next', count || 1, startDate, endDate, true);
    },
    prevRange: function prevRange(count, startDate, endDate) {
      return getInstances('prev', count || 1, startDate, endDate, true);
    }
  };
};
later.setTimeout = function (fn, sched, timezone) {
  var s = later.schedule(sched);
  var t;
  if (fn) {
    scheduleTimeout();
  }
  function scheduleTimeout() {
    var date = new Date();
    var now = date.getTime();
    var next = function () {
      if (!timezone || ['local', 'system'].includes(timezone)) {
        return s.next(2, now);
      }
      var localOffsetMillis = date.getTimezoneOffset() * 6e4;
      var offsetMillis = getOffset(date, timezone);

      // Specified timezone has the same offset as local timezone.
      // ie. America/New_York = America/Nassau = GMT-4
      if (offsetMillis === localOffsetMillis) {
        return s.next(2, now);
      }

      // Offsets differ, adjust current time to match what
      // it should've been for the specified timezone.
      var adjustedNow = new Date(now + localOffsetMillis - offsetMillis);
      return (s.next(2, adjustedNow) || /* istanbul ignore next */[]).map(function (sched) {
        // adjust scheduled times to match their intended timezone
        // ie. scheduled = 2021-08-22T11:30:00.000-04:00 => America/New_York
        //     intended  = 2021-08-22T11:30:00.000-05:00 => America/Mexico_City
        return new Date(sched.getTime() + offsetMillis - localOffsetMillis);
      });
    }();
    if (!next[0]) {
      t = undefined;
      return;
    }
    var diff = next[0].getTime() - now;
    if (diff < 1e3) {
      diff = next[1] ? next[1].getTime() - now : 1e3;
    }
    t = diff < 2147483647 ? setTimeout(fn, diff) : setTimeout(scheduleTimeout, 2147483647);
  } // scheduleTimeout()

  return {
    isDone: function isDone() {
      return !t;
    },
    clear: function clear() {
      clearTimeout(t);
    }
  };
}; // setTimeout()

later.setInterval = function (fn, sched, timezone) {
  if (!fn) {
    return;
  }
  var t = later.setTimeout(scheduleTimeout, sched, timezone);
  var done = t.isDone();
  function scheduleTimeout() {
    /* istanbul ignore else */
    if (!done) {
      fn();
      t = later.setTimeout(scheduleTimeout, sched, timezone);
    }
  }
  return {
    isDone: function isDone() {
      return t.isDone();
    },
    clear: function clear() {
      done = true;
      t.clear();
    }
  };
}; // setInterval()

later.date = {};
later.date.timezone = function (useLocalTime) {
  later.date.build = useLocalTime ? function (Y, M, D, h, m, s) {
    return new Date(Y, M, D, h, m, s);
  } : function (Y, M, D, h, m, s) {
    return new Date(Date.UTC(Y, M, D, h, m, s));
  };
  var get = useLocalTime ? 'get' : 'getUTC';
  var d = Date.prototype;
  later.date.getYear = d[get + 'FullYear'];
  later.date.getMonth = d[get + 'Month'];
  later.date.getDate = d[get + 'Date'];
  later.date.getDay = d[get + 'Day'];
  later.date.getHour = d[get + 'Hours'];
  later.date.getMin = d[get + 'Minutes'];
  later.date.getSec = d[get + 'Seconds'];
  later.date.isUTC = !useLocalTime;
};
later.date.UTC = function () {
  later.date.timezone(false);
};
later.date.localTime = function () {
  later.date.timezone(true);
};
later.date.UTC();
later.SEC = 1e3;
later.MIN = later.SEC * 60;
later.HOUR = later.MIN * 60;
later.DAY = later.HOUR * 24;
later.WEEK = later.DAY * 7;
later.DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
later.NEVER = 0;
later.date.next = function (Y, M, D, h, m, s) {
  return later.date.build(Y, M !== undefined ? M - 1 : 0, D !== undefined ? D : 1, h || 0, m || 0, s || 0);
};
later.date.nextRollover = function (d, value, constraint, period) {
  var cur = constraint.val(d);
  var max = constraint.extent(d)[1];
  return (value || max) <= cur || value > max ? new Date(period.end(d).getTime() + later.SEC) : period.start(d);
};
later.date.prev = function (Y, M, D, h, m, s) {
  var length = arguments.length;
  M = length < 2 ? 11 : M - 1;
  D = length < 3 ? later.D.extent(later.date.next(Y, M + 1))[1] : D;
  h = length < 4 ? 23 : h;
  m = length < 5 ? 59 : m;
  s = length < 6 ? 59 : s;
  return later.date.build(Y, M, D, h, m, s);
};
later.date.prevRollover = function (d, value, constraint, period) {
  var cur = constraint.val(d);
  return value >= cur || !value ? period.start(period.prev(d, period.val(d) - 1)) : period.start(d);
};
later.parse = {};
later.parse.cron = function (expr, hasSeconds) {
  var NAMES = {
    JAN: 1,
    FEB: 2,
    MAR: 3,
    APR: 4,
    MAY: 5,
    JUN: 6,
    JUL: 7,
    AUG: 8,
    SEP: 9,
    OCT: 10,
    NOV: 11,
    DEC: 12,
    SUN: 1,
    MON: 2,
    TUE: 3,
    WED: 4,
    THU: 5,
    FRI: 6,
    SAT: 7
  };
  var REPLACEMENTS = {
    '* * * * * *': '0/1 * * * * *',
    '@YEARLY': '0 0 1 1 *',
    '@ANNUALLY': '0 0 1 1 *',
    '@MONTHLY': '0 0 1 * *',
    '@WEEKLY': '0 0 * * 0',
    '@DAILY': '0 0 * * *',
    '@HOURLY': '0 * * * *'
  };
  var FIELDS = {
    s: [0, 0, 59],
    m: [1, 0, 59],
    h: [2, 0, 23],
    D: [3, 1, 31],
    M: [4, 1, 12],
    Y: [6, 1970, 2099],
    d: [5, 1, 7, 1]
  };
  function getValue(value, offset, max) {
    return isNaN(value) ? NAMES[value] || null : Math.min(Number(value) + (offset || 0), max || 9999);
  }
  function cloneSchedule(sched) {
    var clone = {};
    var field;
    for (field in sched) {
      if (field !== 'dc' && field !== 'd') {
        clone[field] = sched[field].slice(0);
      }
    }
    return clone;
  }
  function add(sched, name, min, max, inc) {
    var i = min;
    if (!sched[name]) {
      sched[name] = [];
    }
    while (i <= max) {
      if (!sched[name].includes(i)) {
        sched[name].push(i);
      }
      i += inc || 1;
    }
    sched[name].sort(function (a, b) {
      return a - b;
    });
  }
  function addHash(schedules, curSched, value, hash) {
    if (curSched.d && !curSched.dc || curSched.dc && !curSched.dc.includes(hash)) {
      schedules.push(cloneSchedule(curSched));
      curSched = schedules[schedules.length - 1];
    }
    add(curSched, 'd', value, value);
    add(curSched, 'dc', hash, hash);
  }
  function addWeekday(s, curSched, value) {
    var except1 = {};
    var except2 = {};
    if (value === 1) {
      add(curSched, 'D', 1, 3);
      add(curSched, 'd', NAMES.MON, NAMES.FRI);
      add(except1, 'D', 2, 2);
      add(except1, 'd', NAMES.TUE, NAMES.FRI);
      add(except2, 'D', 3, 3);
      add(except2, 'd', NAMES.TUE, NAMES.FRI);
    } else {
      add(curSched, 'D', value - 1, value + 1);
      add(curSched, 'd', NAMES.MON, NAMES.FRI);
      add(except1, 'D', value - 1, value - 1);
      add(except1, 'd', NAMES.MON, NAMES.THU);
      add(except2, 'D', value + 1, value + 1);
      add(except2, 'd', NAMES.TUE, NAMES.FRI);
    }
    s.exceptions.push(except1);
    s.exceptions.push(except2);
  }
  function addRange(item, curSched, name, min, max, offset) {
    var incSplit = item.split('/');
    var inc = Number(incSplit[1]);
    var range = incSplit[0];
    if (range !== '*' && range !== '0') {
      var rangeSplit = range.split('-');
      min = getValue(rangeSplit[0], offset, max);
      max = getValue(rangeSplit[1], offset, max) || max;
    }
    add(curSched, name, min, max, inc);
  }
  function parse(item, s, name, min, max, offset) {
    var value;
    var split;
    var schedules = s.schedules;
    var curSched = schedules[schedules.length - 1];
    if (item === 'L') {
      item = min - 1;
    }
    if ((value = getValue(item, offset, max)) !== null) {
      add(curSched, name, value, value);
    } else if ((value = getValue(item.replace('W', ''), offset, max)) !== null) {
      addWeekday(s, curSched, value);
    } else if ((value = getValue(item.replace('L', ''), offset, max)) !== null) {
      addHash(schedules, curSched, value, min - 1);
    } else if ((split = item.split('#')).length === 2) {
      value = getValue(split[0], offset, max);
      addHash(schedules, curSched, value, getValue(split[1]));
    } else {
      addRange(item, curSched, name, min, max, offset);
    }
  }
  function isHash(item) {
    return item.includes('#') || item.indexOf('L') > 0;
  }
  function itemSorter(a, b) {
    return isHash(a) && !isHash(b) ? 1 : a - b;
  }
  function parseExpr(expr) {
    var schedule = {
      schedules: [{}],
      exceptions: []
    };
    var components = expr.replace(/(\s)+/g, ' ').split(' ');
    var field;
    var f;
    var component;
    var items;
    for (field in FIELDS) {
      f = FIELDS[field];
      component = components[f[0]];
      if (component && component !== '*' && component !== '?') {
        items = component.split(',').sort(itemSorter);
        var i;
        var _items = items,
          length = _items.length;
        for (i = 0; i < length; i++) {
          parse(items[i], schedule, field, f[1], f[2], f[3]);
        }
      }
    }
    return schedule;
  }
  function prepareExpr(expr) {
    var prepared = expr.toUpperCase();
    return REPLACEMENTS[prepared] || prepared;
  }
  var e = prepareExpr(expr);
  return parseExpr(hasSeconds ? e : '0 ' + e);
};
later.parse.recur = function () {
  var schedules = [];
  var exceptions = [];
  var cur;
  var curArray = schedules;
  var curName;
  var values;
  var _every;
  var modifier;
  var applyMin;
  var applyMax;
  var i;
  var last;
  function add(name, min, max) {
    name = modifier ? name + '_' + modifier : name;
    if (!cur) {
      curArray.push({});
      cur = curArray[0];
    }
    if (!cur[name]) {
      cur[name] = [];
    }
    curName = cur[name];
    if (_every) {
      values = [];
      for (i = min; i <= max; i += _every) {
        values.push(i);
      }
      last = {
        n: name,
        x: _every,
        c: curName.length,
        m: max
      };
    }
    values = applyMin ? [min] : applyMax ? [max] : values;
    var _values = values,
      length = _values.length;
    for (i = 0; i < length; i += 1) {
      var value = values[i];
      if (!curName.includes(value)) {
        curName.push(value);
      }
    }
    values = _every = modifier = applyMin = applyMax = 0;
  }
  return {
    schedules: schedules,
    exceptions: exceptions,
    on: function on() {
      values = Array.isArray(arguments[0]) ? arguments[0] : arguments;
      return this;
    },
    every: function every(x) {
      _every = x || 1;
      return this;
    },
    after: function after(x) {
      modifier = 'a';
      values = [x];
      return this;
    },
    before: function before(x) {
      modifier = 'b';
      values = [x];
      return this;
    },
    first: function first() {
      applyMin = 1;
      return this;
    },
    last: function last() {
      applyMax = 1;
      return this;
    },
    time: function time() {
      for (var _i12 = 0, _values2 = values, length = _values2.length; _i12 < length; _i12++) {
        var split = values[_i12].split(':');
        if (split.length < 3) split.push(0);
        values[_i12] = Number(split[0]) * 3600 + Number(split[1]) * 60 + Number(split[2]);
      }
      add('t');
      return this;
    },
    second: function second() {
      add('s', 0, 59);
      return this;
    },
    minute: function minute() {
      add('m', 0, 59);
      return this;
    },
    hour: function hour() {
      add('h', 0, 23);
      return this;
    },
    dayOfMonth: function dayOfMonth() {
      add('D', 1, applyMax ? 0 : 31);
      return this;
    },
    dayOfWeek: function dayOfWeek() {
      add('d', 1, 7);
      return this;
    },
    onWeekend: function onWeekend() {
      values = [1, 7];
      return this.dayOfWeek();
    },
    onWeekday: function onWeekday() {
      values = [2, 3, 4, 5, 6];
      return this.dayOfWeek();
    },
    dayOfWeekCount: function dayOfWeekCount() {
      add('dc', 1, applyMax ? 0 : 5);
      return this;
    },
    dayOfYear: function dayOfYear() {
      add('dy', 1, applyMax ? 0 : 366);
      return this;
    },
    weekOfMonth: function weekOfMonth() {
      add('wm', 1, applyMax ? 0 : 5);
      return this;
    },
    weekOfYear: function weekOfYear() {
      add('wy', 1, applyMax ? 0 : 53);
      return this;
    },
    month: function month() {
      add('M', 1, 12);
      return this;
    },
    year: function year() {
      add('Y', 1970, 2450);
      return this;
    },
    fullDate: function fullDate() {
      for (var _i13 = 0, _values3 = values, length = _values3.length; _i13 < length; _i13++) {
        values[_i13] = values[_i13].getTime();
      }
      add('fd');
      return this;
    },
    customModifier: function customModifier(id, vals) {
      var custom = later.modifier[id];
      if (!custom) throw new Error('Custom modifier ' + id + ' not recognized!');
      modifier = id;
      values = Array.isArray(arguments[1]) ? arguments[1] : [arguments[1]];
      return this;
    },
    customPeriod: function customPeriod(id) {
      var custom = later[id];
      if (!custom) throw new Error('Custom time period ' + id + ' not recognized!');
      add(id, custom.extent(new Date())[0], custom.extent(new Date())[1]);
      return this;
    },
    startingOn: function startingOn(start) {
      return this.between(start, last.m);
    },
    between: function between(start, end) {
      cur[last.n] = cur[last.n].splice(0, last.c);
      _every = last.x;
      add(last.n, start, end);
      return this;
    },
    and: function and() {
      cur = curArray[curArray.push({}) - 1];
      return this;
    },
    except: function except() {
      curArray = exceptions;
      cur = null;
      return this;
    }
  };
};
later.parse.text = function (string) {
  var recur = later.parse.recur;
  var pos = 0;
  var input = '';
  var error;
  var TOKENTYPES = {
    eof: /^$/,
    rank: /^((\d+)(st|nd|rd|th)?)\b/,
    time: /^(((0?[1-9]|1[0-2]):[0-5]\d(\s)?(am|pm))|((0?\d|1\d|2[0-3]):[0-5]\d))\b/,
    dayName: /^((sun|mon|tue(s)?|wed(nes)?|thu(r(s)?)?|fri|sat(ur)?)(day)?)\b/,
    monthName: /^(jan(uary)?|feb(ruary)?|ma((r(ch)?)?|y)|apr(il)?|ju(ly|ne)|aug(ust)?|oct(ober)?|(sept|nov|dec)(ember)?)\b/,
    yearIndex: /^(\d{4})\b/,
    every: /^every\b/,
    after: /^after\b/,
    before: /^before\b/,
    second: /^(s|sec(ond)?(s)?)\b/,
    minute: /^(m|min(ute)?(s)?)\b/,
    hour: /^(h|hour(s)?)\b/,
    day: /^(day(s)?( of the month)?)\b/,
    dayInstance: /^day instance\b/,
    dayOfWeek: /^day(s)? of the week\b/,
    dayOfYear: /^day(s)? of the year\b/,
    weekOfYear: /^week(s)?( of the year)?\b/,
    weekOfMonth: /^week(s)? of the month\b/,
    weekday: /^weekday\b/,
    weekend: /^weekend\b/,
    month: /^month(s)?\b/,
    year: /^year(s)?\b/,
    between: /^between (the)?\b/,
    start: /^(start(ing)? (at|on( the)?)?)\b/,
    at: /^(at|@)\b/,
    and: /^(,|and\b)/,
    except: /^(except\b)/,
    also: /(also)\b/,
    first: /^(first)\b/,
    last: /^last\b/,
    in: /^in\b/,
    of: /^of\b/,
    onthe: /^on the\b/,
    on: /^on\b/,
    through: /(-|^(to|through)\b)/
  };
  var NAMES = {
    jan: 1,
    feb: 2,
    mar: 3,
    apr: 4,
    may: 5,
    jun: 6,
    jul: 7,
    aug: 8,
    sep: 9,
    oct: 10,
    nov: 11,
    dec: 12,
    sun: 1,
    mon: 2,
    tue: 3,
    wed: 4,
    thu: 5,
    fri: 6,
    sat: 7,
    '1st': 1,
    fir: 1,
    '2nd': 2,
    sec: 2,
    '3rd': 3,
    thi: 3,
    '4th': 4,
    for: 4
  };
  function t(start, end, text, type) {
    return {
      startPos: start,
      endPos: end,
      text: text,
      type: type
    };
  }
  function peek(expected) {
    var scanTokens = Array.isArray(expected) ? expected : [expected];
    var whiteSpace = /\s+/;
    var token;
    var curInput;
    var m;
    var scanToken;
    var start;
    var length_;
    scanTokens.push(whiteSpace);
    start = pos;
    while (!token || token.type === whiteSpace) {
      length_ = -1;
      curInput = input.slice(Math.max(0, start));
      token = t(start, start, input.split(whiteSpace)[0]);
      var i;
      var length = scanTokens.length;
      for (i = 0; i < length; i++) {
        scanToken = scanTokens[i];
        m = scanToken.exec(curInput);
        if (m && m.index === 0 && m[0].length > length_) {
          length_ = m[0].length;
          token = t(start, start + length_, curInput.slice(0, Math.max(0, length_)), scanToken);
        }
      }
      if (token.type === whiteSpace) {
        start = token.endPos;
      }
    }
    return token;
  }
  function scan(expectedToken) {
    var token = peek(expectedToken);
    pos = token.endPos;
    return token;
  }
  function parseThroughExpr(tokenType) {
    var start = Number(parseTokenValue(tokenType));
    var end = checkAndParse(TOKENTYPES.through) ? Number(parseTokenValue(tokenType)) : start;
    var nums = [];
    for (var i = start; i <= end; i++) {
      nums.push(i);
    }
    return nums;
  }
  function parseRanges(tokenType) {
    var nums = parseThroughExpr(tokenType);
    while (checkAndParse(TOKENTYPES.and)) {
      nums = nums.concat(parseThroughExpr(tokenType));
    }
    return nums;
  }
  function parseEvery(r) {
    var number;
    var period;
    var start;
    var end;
    if (checkAndParse(TOKENTYPES.weekend)) {
      r.on(NAMES.sun, NAMES.sat).dayOfWeek();
    } else if (checkAndParse(TOKENTYPES.weekday)) {
      r.on(NAMES.mon, NAMES.tue, NAMES.wed, NAMES.thu, NAMES.fri).dayOfWeek();
    } else {
      number = parseTokenValue(TOKENTYPES.rank);
      r.every(number);
      period = parseTimePeriod(r);
      if (checkAndParse(TOKENTYPES.start)) {
        number = parseTokenValue(TOKENTYPES.rank);
        r.startingOn(number);
        parseToken(period.type);
      } else if (checkAndParse(TOKENTYPES.between)) {
        start = parseTokenValue(TOKENTYPES.rank);
        if (checkAndParse(TOKENTYPES.and)) {
          end = parseTokenValue(TOKENTYPES.rank);
          r.between(start, end);
        }
      }
    }
  }
  function parseOnThe(r) {
    if (checkAndParse(TOKENTYPES.first)) {
      r.first();
    } else if (checkAndParse(TOKENTYPES.last)) {
      r.last();
    } else {
      r.on(parseRanges(TOKENTYPES.rank));
    }
    parseTimePeriod(r);
  }
  function parseScheduleExpr(string_) {
    pos = 0;
    input = string_;
    error = -1;
    var r = recur();
    while (pos < input.length && error < 0) {
      var token = parseToken([TOKENTYPES.every, TOKENTYPES.after, TOKENTYPES.before, TOKENTYPES.onthe, TOKENTYPES.on, TOKENTYPES.of, TOKENTYPES.in, TOKENTYPES.at, TOKENTYPES.and, TOKENTYPES.except, TOKENTYPES.also]);
      switch (token.type) {
        case TOKENTYPES.every:
          parseEvery(r);
          break;
        case TOKENTYPES.after:
          if (peek(TOKENTYPES.time).type !== undefined) {
            r.after(parseTokenValue(TOKENTYPES.time));
            r.time();
          } else {
            r.after(parseTokenValue(TOKENTYPES.rank));
            parseTimePeriod(r);
          }
          break;
        case TOKENTYPES.before:
          if (peek(TOKENTYPES.time).type !== undefined) {
            r.before(parseTokenValue(TOKENTYPES.time));
            r.time();
          } else {
            r.before(parseTokenValue(TOKENTYPES.rank));
            parseTimePeriod(r);
          }
          break;
        case TOKENTYPES.onthe:
          parseOnThe(r);
          break;
        case TOKENTYPES.on:
          r.on(parseRanges(TOKENTYPES.dayName)).dayOfWeek();
          break;
        case TOKENTYPES.of:
          r.on(parseRanges(TOKENTYPES.monthName)).month();
          break;
        case TOKENTYPES.in:
          r.on(parseRanges(TOKENTYPES.yearIndex)).year();
          break;
        case TOKENTYPES.at:
          r.on(parseTokenValue(TOKENTYPES.time)).time();
          while (checkAndParse(TOKENTYPES.and)) {
            r.on(parseTokenValue(TOKENTYPES.time)).time();
          }
          break;
        case TOKENTYPES.and:
          break;
        case TOKENTYPES.also:
          r.and();
          break;
        case TOKENTYPES.except:
          r.except();
          break;
        default:
          error = pos;
      }
    }
    return {
      schedules: r.schedules,
      exceptions: r.exceptions,
      error: error
    };
  }
  function parseTimePeriod(r) {
    var timePeriod = parseToken([TOKENTYPES.second, TOKENTYPES.minute, TOKENTYPES.hour, TOKENTYPES.dayOfYear, TOKENTYPES.dayOfWeek, TOKENTYPES.dayInstance, TOKENTYPES.day, TOKENTYPES.month, TOKENTYPES.year, TOKENTYPES.weekOfMonth, TOKENTYPES.weekOfYear]);
    switch (timePeriod.type) {
      case TOKENTYPES.second:
        r.second();
        break;
      case TOKENTYPES.minute:
        r.minute();
        break;
      case TOKENTYPES.hour:
        r.hour();
        break;
      case TOKENTYPES.dayOfYear:
        r.dayOfYear();
        break;
      case TOKENTYPES.dayOfWeek:
        r.dayOfWeek();
        break;
      case TOKENTYPES.dayInstance:
        r.dayOfWeekCount();
        break;
      case TOKENTYPES.day:
        r.dayOfMonth();
        break;
      case TOKENTYPES.weekOfMonth:
        r.weekOfMonth();
        break;
      case TOKENTYPES.weekOfYear:
        r.weekOfYear();
        break;
      case TOKENTYPES.month:
        r.month();
        break;
      case TOKENTYPES.year:
        r.year();
        break;
      default:
        error = pos;
    }
    return timePeriod;
  }
  function checkAndParse(tokenType) {
    var found = peek(tokenType).type === tokenType;
    if (found) {
      scan(tokenType);
    }
    return found;
  }
  function parseToken(tokenType) {
    var t = scan(tokenType);
    if (t.type) {
      t.text = convertString(t.text, tokenType);
    } else {
      error = pos;
    }
    return t;
  }
  function parseTokenValue(tokenType) {
    return parseToken(tokenType).text;
  }
  function convertString(string_, tokenType) {
    var output = string_;
    switch (tokenType) {
      case TOKENTYPES.time:
        /*
        const parts = string_.split(/(:|am|pm)/);
        const hour =
          parts[3] === 'pm' && parts[0] < 12
            ? Number.parseInt(parts[0], 10) + 12
            : parts[0];
        const min = parts[2].trim();
        output = (hour.length === 1 ? '0' : '') + hour + ':' + min;
        */
        // <https://github.com/bunkat/later/pull/188>
        var parts = string_.split(/(:|am|pm)/);
        var hour = Number.parseInt(parts[0], 10);
        var min = parts[2].trim();
        if (parts[3] === 'pm' && hour < 12) {
          hour += 12;
        } else if (parts[3] === 'am' && hour === 12) {
          hour -= 12;
        }
        hour = String(hour);
        output = (hour.length === 1 ? '0' : '') + hour + ':' + min;
        break;
      case TOKENTYPES.rank:
        output = Number.parseInt(/^\d+/.exec(string_)[0], 10);
        break;
      case TOKENTYPES.monthName:
      case TOKENTYPES.dayName:
        output = NAMES[string_.slice(0, 3)];
        break;
    }
    return output;
  }
  return parseScheduleExpr(string.toLowerCase());
};
function getOffset(date, zone) {
  var d = date.toLocaleString('en-US', {
    hour12: false,
    timeZone: zone,
    timeZoneName: 'short'
  }) //=> ie. "8/22/2021, 24:30:00 EDT"
  .match(/(\d+)\/(\d+)\/(\d+),? (\d+):(\d+):(\d+)/).map(function (n) {
    return n.length === 1 ? '0' + n : n;
  });
  var zdate = new Date("".concat(d[3], "-").concat(d[1], "-").concat(d[2], "T").concat(d[4].replace('24', '00'), ":").concat(d[5], ":").concat(d[6], "Z"));
  return date.getTime() - zdate.getTime();
} // getOffset()

module.exports = later;

},{"../package.json":1}]},{},[2])(2)
});
