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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwa2ciLCJyZXF1aXJlIiwibGF0ZXIiLCJ2ZXJzaW9uIiwiYXJyYXkiLCJzb3J0IiwiemVyb0lzTGFzdCIsImEiLCJiIiwiTnVtYmVyIiwicHVzaCIsInNoaWZ0IiwibmV4dCIsInZhbHVlIiwidmFsdWVzIiwiZXh0ZW50IiwiY3VyIiwiemVyb0lzTGFyZ2VzdCIsIm5leHRJZHgiLCJpIiwibGVuZ3RoIiwibmV4dEludmFsaWQiLCJtaW4iLCJtYXgiLCJ6ZXJvVmFsdWUiLCJpbmRleE9mIiwic3RhcnQiLCJ1bmRlZmluZWQiLCJwcmV2IiwicHJldmlvdXNJZHgiLCJwcmV2SW52YWxpZCIsImRheSIsIkQiLCJuYW1lIiwicmFuZ2UiLCJ2YWwiLCJkIiwiZGF0ZSIsImdldERhdGUiLCJjYWxsIiwiaXNWYWxpZCIsIkRFeHRlbnQiLCJtb250aCIsIk0iLCJEQVlTX0lOX01PTlRIIiwiZHkiLCJEU3RhcnQiLCJZIiwiZW5kIiwiREVuZCIsIm5leHRSb2xsb3ZlciIsIkRNYXgiLCJwcmV2Um9sbG92ZXIiLCJkYXlPZldlZWtDb3VudCIsImRjIiwiTWF0aCIsImZsb29yIiwiZGNFeHRlbnQiLCJjZWlsIiwiZGNTdGFydCIsImRjRW5kIiwiZGNNYXgiLCJnZXRUaW1lIiwiZGF5T2ZXZWVrIiwiZHciLCJnZXREYXkiLCJkYXlPZlllYXIiLCJEQVkiLCJ5ZWFyIiwiZHlFeHRlbnQiLCJkeU1heCIsImhvdXIiLCJoIiwiZ2V0SG91ciIsImhTdGFydCIsImhFbmQiLCJpc1VUQyIsIm1pbnV0ZSIsIm0iLCJnZXRNaW4iLCJtU3RhcnQiLCJtRW5kIiwicyIsImluYyIsIkRhdGUiLCJNSU4iLCJTRUMiLCJnZXRNb250aCIsIk1TdGFydCIsIk1FbmQiLCJzZWNvbmQiLCJnZXRTZWMiLCJjYWNoZSIsInRpbWUiLCJ0Iiwid2Vla09mTW9udGgiLCJ3bSIsIndtRXh0ZW50Iiwid21TdGFydCIsIndtRW5kIiwid21NYXgiLCJ3ZWVrT2ZZZWFyIiwid3kiLCJ3VGh1ciIsIllUaHVyIiwiV0VFSyIsInd5RXh0ZW50IiwiZHdGaXJzdCIsImR3TGFzdCIsInd5U3RhcnQiLCJ3eUVuZCIsInd5VGh1ciIsInd5TWF4IiwiZ2V0WWVhciIsIllTdGFydCIsIllFbmQiLCJORVZFUiIsImZ1bGxEYXRlIiwiZmQiLCJtb2RpZmllciIsImFmdGVyIiwiY29uc3RyYWludCIsInZhbHVlXyIsInN0YXJ0RGF0ZSIsImJlZm9yZSIsImNvbXBpbGUiLCJzY2hlZERlZiIsImNvbnN0cmFpbnRzIiwiY29uc3RyYWludHNMZW5ndGgiLCJ0aWNrQ29uc3RyYWludCIsImtleSIsIm5hbWVQYXJ0cyIsInNwbGl0IiwibW9kIiwidmFscyIsInJhIiwicmIiLCJjb21wYXJlRm4iLCJkaXIiLCJuZXh0VmFsdWUiLCJtYXhBdHRlbXB0cyIsImRvbmUiLCJjdXJWYWx1ZSIsIm5ld1ZhbHVlIiwicmVzdWx0IiwiY29tcGFyZSIsInRpY2siLCJ0aWNrU3RhcnQiLCJzY2hlZHVsZSIsInNjaGVkIiwiRXJyb3IiLCJzY2hlZHVsZXMiLCJzY2hlZHVsZXNMZW5ndGgiLCJleGNlcHRpb25zIiwiZXhjZXB0aW9uc0xlbmd0aCIsImoiLCJnZXRJbnN0YW5jZXMiLCJjb3VudCIsImVuZERhdGUiLCJpc1JhbmdlIiwibG9vcENvdW50Iiwic2NoZWRTdGFydHMiLCJleGNlcHRTdGFydHMiLCJyZXN1bHRzIiwiaXNGb3J3YXJkIiwibGFzdFJlc3VsdCIsInJTdGFydCIsInJFbmQiLCJzZXROZXh0U3RhcnRzIiwic2V0UmFuZ2VTdGFydHMiLCJmaW5kTmV4dCIsInVwZGF0ZVJhbmdlU3RhcnRzIiwiY2FsY1JhbmdlT3ZlcmxhcCIsInVwZGF0ZU5leHRTdGFydHMiLCJtYXhFbmREYXRlIiwiY2FsY01heEVuZERhdGUiLCJjYWxjRW5kIiwiciIsImdldFN0YXJ0IiwidGlja1N0YXJ0cyIsIk9iamVjdCIsInByb3RvdHlwZSIsInRvU3RyaW5nIiwiY2xlYW5EYXRlIiwiaXNOYU4iLCJ2YWx1ZU9mIiwic2NoZWRBcnJheSIsInN0YXJ0c0FycmF5IiwicmFuZ2VzQXJyYXkiLCJuZXh0U3RhcnQiLCJtaW5FbmREYXRlIiwiZXhjZXB0c0FycmF5IiwibmV4dFJhbmdlIiwicHJldlJhbmdlIiwic2V0VGltZW91dCIsImZuIiwidGltZXpvbmUiLCJzY2hlZHVsZVRpbWVvdXQiLCJub3ciLCJpbmNsdWRlcyIsImxvY2FsT2Zmc2V0TWlsbGlzIiwiZ2V0VGltZXpvbmVPZmZzZXQiLCJvZmZzZXRNaWxsaXMiLCJnZXRPZmZzZXQiLCJhZGp1c3RlZE5vdyIsIm1hcCIsImRpZmYiLCJpc0RvbmUiLCJjbGVhciIsImNsZWFyVGltZW91dCIsInNldEludGVydmFsIiwidXNlTG9jYWxUaW1lIiwiYnVpbGQiLCJVVEMiLCJnZXQiLCJsb2NhbFRpbWUiLCJIT1VSIiwicGVyaW9kIiwiYXJndW1lbnRzIiwicGFyc2UiLCJjcm9uIiwiZXhwciIsImhhc1NlY29uZHMiLCJOQU1FUyIsIkpBTiIsIkZFQiIsIk1BUiIsIkFQUiIsIk1BWSIsIkpVTiIsIkpVTCIsIkFVRyIsIlNFUCIsIk9DVCIsIk5PViIsIkRFQyIsIlNVTiIsIk1PTiIsIlRVRSIsIldFRCIsIlRIVSIsIkZSSSIsIlNBVCIsIlJFUExBQ0VNRU5UUyIsIkZJRUxEUyIsImdldFZhbHVlIiwib2Zmc2V0IiwiY2xvbmVTY2hlZHVsZSIsImNsb25lIiwiZmllbGQiLCJzbGljZSIsImFkZCIsImFkZEhhc2giLCJjdXJTY2hlZCIsImhhc2giLCJhZGRXZWVrZGF5IiwiZXhjZXB0MSIsImV4Y2VwdDIiLCJhZGRSYW5nZSIsIml0ZW0iLCJpbmNTcGxpdCIsInJhbmdlU3BsaXQiLCJyZXBsYWNlIiwiaXNIYXNoIiwiaXRlbVNvcnRlciIsInBhcnNlRXhwciIsImNvbXBvbmVudHMiLCJmIiwiY29tcG9uZW50IiwiaXRlbXMiLCJfaXRlbXMiLCJwcmVwYXJlRXhwciIsInByZXBhcmVkIiwidG9VcHBlckNhc2UiLCJlIiwicmVjdXIiLCJjdXJBcnJheSIsImN1ck5hbWUiLCJldmVyeSIsImFwcGx5TWluIiwiYXBwbHlNYXgiLCJsYXN0IiwibiIsIngiLCJjIiwiX3ZhbHVlcyIsIm9uIiwiQXJyYXkiLCJpc0FycmF5IiwiZmlyc3QiLCJfdmFsdWVzMiIsImRheU9mTW9udGgiLCJvbldlZWtlbmQiLCJvbldlZWtkYXkiLCJfdmFsdWVzMyIsImN1c3RvbU1vZGlmaWVyIiwiaWQiLCJjdXN0b20iLCJjdXN0b21QZXJpb2QiLCJzdGFydGluZ09uIiwiYmV0d2VlbiIsInNwbGljZSIsImFuZCIsImV4Y2VwdCIsInRleHQiLCJzdHJpbmciLCJwb3MiLCJpbnB1dCIsImVycm9yIiwiVE9LRU5UWVBFUyIsImVvZiIsInJhbmsiLCJkYXlOYW1lIiwibW9udGhOYW1lIiwieWVhckluZGV4IiwiZGF5SW5zdGFuY2UiLCJ3ZWVrZGF5Iiwid2Vla2VuZCIsImF0IiwiYWxzbyIsImluIiwib2YiLCJvbnRoZSIsInRocm91Z2giLCJqYW4iLCJmZWIiLCJtYXIiLCJhcHIiLCJtYXkiLCJqdW4iLCJqdWwiLCJhdWciLCJzZXAiLCJvY3QiLCJub3YiLCJkZWMiLCJzdW4iLCJtb24iLCJ0dWUiLCJ3ZWQiLCJ0aHUiLCJmcmkiLCJzYXQiLCJmaXIiLCJzZWMiLCJ0aGkiLCJmb3IiLCJ0eXBlIiwic3RhcnRQb3MiLCJlbmRQb3MiLCJwZWVrIiwiZXhwZWN0ZWQiLCJzY2FuVG9rZW5zIiwid2hpdGVTcGFjZSIsInRva2VuIiwiY3VySW5wdXQiLCJzY2FuVG9rZW4iLCJsZW5ndGhfIiwiZXhlYyIsImluZGV4Iiwic2NhbiIsImV4cGVjdGVkVG9rZW4iLCJwYXJzZVRocm91Z2hFeHByIiwidG9rZW5UeXBlIiwicGFyc2VUb2tlblZhbHVlIiwiY2hlY2tBbmRQYXJzZSIsIm51bXMiLCJwYXJzZVJhbmdlcyIsImNvbmNhdCIsInBhcnNlRXZlcnkiLCJudW1iZXIiLCJwYXJzZVRpbWVQZXJpb2QiLCJwYXJzZVRva2VuIiwicGFyc2VPblRoZSIsInBhcnNlU2NoZWR1bGVFeHByIiwic3RyaW5nXyIsInRpbWVQZXJpb2QiLCJmb3VuZCIsImNvbnZlcnRTdHJpbmciLCJvdXRwdXQiLCJwYXJ0cyIsInBhcnNlSW50IiwidHJpbSIsIlN0cmluZyIsInRvTG93ZXJDYXNlIiwiem9uZSIsInRvTG9jYWxlU3RyaW5nIiwiaG91cjEyIiwidGltZVpvbmUiLCJ0aW1lWm9uZU5hbWUiLCJtYXRjaCIsInpkYXRlIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBwa2cgPSByZXF1aXJlKCcuLi9wYWNrYWdlLmpzb24nKTtcblxuY29uc3QgbGF0ZXIgPSB7XG4gIHZlcnNpb246IHBrZy52ZXJzaW9uXG59O1xuXG5sYXRlci5hcnJheSA9IHt9O1xubGF0ZXIuYXJyYXkuc29ydCA9IGZ1bmN0aW9uIChhcnJheSwgemVyb0lzTGFzdCkge1xuICBhcnJheS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgcmV0dXJuIE51bWJlcihhKSAtIE51bWJlcihiKTtcbiAgfSk7XG4gIGlmICh6ZXJvSXNMYXN0ICYmIGFycmF5WzBdID09PSAwKSB7XG4gICAgYXJyYXkucHVzaChhcnJheS5zaGlmdCgpKTtcbiAgfVxufTtcblxubGF0ZXIuYXJyYXkubmV4dCA9IGZ1bmN0aW9uICh2YWx1ZSwgdmFsdWVzLCBleHRlbnQpIHtcbiAgbGV0IGN1cjtcbiAgY29uc3QgemVyb0lzTGFyZ2VzdCA9IGV4dGVudFswXSAhPT0gMDtcbiAgbGV0IG5leHRJZHggPSAwO1xuICBmb3IgKGxldCBpID0gdmFsdWVzLmxlbmd0aCAtIDE7IGkgPiAtMTsgLS1pKSB7XG4gICAgY3VyID0gdmFsdWVzW2ldO1xuICAgIGlmIChjdXIgPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm4gY3VyO1xuICAgIH1cblxuICAgIGlmIChjdXIgPiB2YWx1ZSB8fCAoY3VyID09PSAwICYmIHplcm9Jc0xhcmdlc3QgJiYgZXh0ZW50WzFdID4gdmFsdWUpKSB7XG4gICAgICBuZXh0SWR4ID0gaTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGJyZWFrO1xuICB9XG5cbiAgcmV0dXJuIHZhbHVlc1tuZXh0SWR4XTtcbn07XG5cbmxhdGVyLmFycmF5Lm5leHRJbnZhbGlkID0gZnVuY3Rpb24gKHZhbHVlLCB2YWx1ZXMsIGV4dGVudCkge1xuICBjb25zdCBtaW4gPSBleHRlbnRbMF07XG4gIGNvbnN0IG1heCA9IGV4dGVudFsxXTtcbiAgY29uc3QgeyBsZW5ndGggfSA9IHZhbHVlcztcbiAgY29uc3QgemVyb1ZhbHVlID0gdmFsdWVzW2xlbmd0aCAtIDFdID09PSAwICYmIG1pbiAhPT0gMCA/IG1heCA6IDA7XG4gIGxldCBuZXh0ID0gdmFsdWU7XG4gIGxldCBpID0gdmFsdWVzLmluZGV4T2YodmFsdWUpO1xuICBjb25zdCBzdGFydCA9IG5leHQ7XG4gIHdoaWxlIChuZXh0ID09PSAodmFsdWVzW2ldIHx8IHplcm9WYWx1ZSkpIHtcbiAgICBuZXh0Kys7XG4gICAgaWYgKG5leHQgPiBtYXgpIHtcbiAgICAgIG5leHQgPSBtaW47XG4gICAgfVxuXG4gICAgaSsrO1xuICAgIGlmIChpID09PSBsZW5ndGgpIHtcbiAgICAgIGkgPSAwO1xuICAgIH1cblxuICAgIGlmIChuZXh0ID09PSBzdGFydCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV4dDtcbn07XG5cbmxhdGVyLmFycmF5LnByZXYgPSBmdW5jdGlvbiAodmFsdWUsIHZhbHVlcywgZXh0ZW50KSB7XG4gIGxldCBjdXI7XG4gIGNvbnN0IHsgbGVuZ3RoIH0gPSB2YWx1ZXM7XG4gIGNvbnN0IHplcm9Jc0xhcmdlc3QgPSBleHRlbnRbMF0gIT09IDA7XG4gIGxldCBwcmV2aW91c0lkeCA9IGxlbmd0aCAtIDE7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBjdXIgPSB2YWx1ZXNbaV07XG4gICAgaWYgKGN1ciA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybiBjdXI7XG4gICAgfVxuXG4gICAgaWYgKGN1ciA8IHZhbHVlIHx8IChjdXIgPT09IDAgJiYgemVyb0lzTGFyZ2VzdCAmJiBleHRlbnRbMV0gPCB2YWx1ZSkpIHtcbiAgICAgIHByZXZpb3VzSWR4ID0gaTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGJyZWFrO1xuICB9XG5cbiAgcmV0dXJuIHZhbHVlc1twcmV2aW91c0lkeF07XG59O1xuXG5sYXRlci5hcnJheS5wcmV2SW52YWxpZCA9IGZ1bmN0aW9uICh2YWx1ZSwgdmFsdWVzLCBleHRlbnQpIHtcbiAgY29uc3QgbWluID0gZXh0ZW50WzBdO1xuICBjb25zdCBtYXggPSBleHRlbnRbMV07XG4gIGNvbnN0IHsgbGVuZ3RoIH0gPSB2YWx1ZXM7XG4gIGNvbnN0IHplcm9WYWx1ZSA9IHZhbHVlc1tsZW5ndGggLSAxXSA9PT0gMCAmJiBtaW4gIT09IDAgPyBtYXggOiAwO1xuICBsZXQgbmV4dCA9IHZhbHVlO1xuICBsZXQgaSA9IHZhbHVlcy5pbmRleE9mKHZhbHVlKTtcbiAgY29uc3Qgc3RhcnQgPSBuZXh0O1xuICB3aGlsZSAobmV4dCA9PT0gKHZhbHVlc1tpXSB8fCB6ZXJvVmFsdWUpKSB7XG4gICAgbmV4dC0tO1xuICAgIGlmIChuZXh0IDwgbWluKSB7XG4gICAgICBuZXh0ID0gbWF4O1xuICAgIH1cblxuICAgIGktLTtcbiAgICBpZiAoaSA9PT0gLTEpIHtcbiAgICAgIGkgPSBsZW5ndGggLSAxO1xuICAgIH1cblxuICAgIGlmIChuZXh0ID09PSBzdGFydCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV4dDtcbn07XG5cbmxhdGVyLmRheSA9IGxhdGVyLkQgPSB7XG4gIG5hbWU6ICdkYXknLFxuICByYW5nZTogODY0MDAsXG4gIHZhbChkKSB7XG4gICAgcmV0dXJuIGQuRCB8fCAoZC5EID0gbGF0ZXIuZGF0ZS5nZXREYXRlLmNhbGwoZCkpO1xuICB9LFxuICBpc1ZhbGlkKGQsIHZhbHVlKSB7XG4gICAgcmV0dXJuIGxhdGVyLkQudmFsKGQpID09PSAodmFsdWUgfHwgbGF0ZXIuRC5leHRlbnQoZClbMV0pO1xuICB9LFxuICBleHRlbnQoZCkge1xuICAgIGlmIChkLkRFeHRlbnQpIHJldHVybiBkLkRFeHRlbnQ7XG4gICAgY29uc3QgbW9udGggPSBsYXRlci5NLnZhbChkKTtcbiAgICBsZXQgbWF4ID0gbGF0ZXIuREFZU19JTl9NT05USFttb250aCAtIDFdO1xuICAgIGlmIChtb250aCA9PT0gMiAmJiBsYXRlci5keS5leHRlbnQoZClbMV0gPT09IDM2Nikge1xuICAgICAgbWF4ICs9IDE7XG4gICAgfVxuXG4gICAgcmV0dXJuIChkLkRFeHRlbnQgPSBbMSwgbWF4XSk7XG4gIH0sXG4gIHN0YXJ0KGQpIHtcbiAgICByZXR1cm4gKFxuICAgICAgZC5EU3RhcnQgfHxcbiAgICAgIChkLkRTdGFydCA9IGxhdGVyLmRhdGUubmV4dChcbiAgICAgICAgbGF0ZXIuWS52YWwoZCksXG4gICAgICAgIGxhdGVyLk0udmFsKGQpLFxuICAgICAgICBsYXRlci5ELnZhbChkKVxuICAgICAgKSlcbiAgICApO1xuICB9LFxuICBlbmQoZCkge1xuICAgIHJldHVybiAoXG4gICAgICBkLkRFbmQgfHxcbiAgICAgIChkLkRFbmQgPSBsYXRlci5kYXRlLnByZXYobGF0ZXIuWS52YWwoZCksIGxhdGVyLk0udmFsKGQpLCBsYXRlci5ELnZhbChkKSkpXG4gICAgKTtcbiAgfSxcbiAgbmV4dChkLCB2YWx1ZSkge1xuICAgIHZhbHVlID0gdmFsdWUgPiBsYXRlci5ELmV4dGVudChkKVsxXSA/IDEgOiB2YWx1ZTtcbiAgICBjb25zdCBtb250aCA9IGxhdGVyLmRhdGUubmV4dFJvbGxvdmVyKGQsIHZhbHVlLCBsYXRlci5ELCBsYXRlci5NKTtcbiAgICBjb25zdCBETWF4ID0gbGF0ZXIuRC5leHRlbnQobW9udGgpWzFdO1xuICAgIHZhbHVlID0gdmFsdWUgPiBETWF4ID8gMSA6IHZhbHVlIHx8IERNYXg7XG4gICAgcmV0dXJuIGxhdGVyLmRhdGUubmV4dChsYXRlci5ZLnZhbChtb250aCksIGxhdGVyLk0udmFsKG1vbnRoKSwgdmFsdWUpO1xuICB9LFxuICBwcmV2KGQsIHZhbHVlKSB7XG4gICAgY29uc3QgbW9udGggPSBsYXRlci5kYXRlLnByZXZSb2xsb3ZlcihkLCB2YWx1ZSwgbGF0ZXIuRCwgbGF0ZXIuTSk7XG4gICAgY29uc3QgRE1heCA9IGxhdGVyLkQuZXh0ZW50KG1vbnRoKVsxXTtcbiAgICByZXR1cm4gbGF0ZXIuZGF0ZS5wcmV2KFxuICAgICAgbGF0ZXIuWS52YWwobW9udGgpLFxuICAgICAgbGF0ZXIuTS52YWwobW9udGgpLFxuICAgICAgdmFsdWUgPiBETWF4ID8gRE1heCA6IHZhbHVlIHx8IERNYXhcbiAgICApO1xuICB9XG59O1xubGF0ZXIuZGF5T2ZXZWVrQ291bnQgPSBsYXRlci5kYyA9IHtcbiAgbmFtZTogJ2RheSBvZiB3ZWVrIGNvdW50JyxcbiAgcmFuZ2U6IDYwNDgwMCxcbiAgdmFsKGQpIHtcbiAgICByZXR1cm4gZC5kYyB8fCAoZC5kYyA9IE1hdGguZmxvb3IoKGxhdGVyLkQudmFsKGQpIC0gMSkgLyA3KSArIDEpO1xuICB9LFxuICBpc1ZhbGlkKGQsIHZhbHVlKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIGxhdGVyLmRjLnZhbChkKSA9PT0gdmFsdWUgfHxcbiAgICAgICh2YWx1ZSA9PT0gMCAmJiBsYXRlci5ELnZhbChkKSA+IGxhdGVyLkQuZXh0ZW50KGQpWzFdIC0gNylcbiAgICApO1xuICB9LFxuICBleHRlbnQoZCkge1xuICAgIHJldHVybiAoXG4gICAgICBkLmRjRXh0ZW50IHx8IChkLmRjRXh0ZW50ID0gWzEsIE1hdGguY2VpbChsYXRlci5ELmV4dGVudChkKVsxXSAvIDcpXSlcbiAgICApO1xuICB9LFxuICBzdGFydChkKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIGQuZGNTdGFydCB8fFxuICAgICAgKGQuZGNTdGFydCA9IGxhdGVyLmRhdGUubmV4dChcbiAgICAgICAgbGF0ZXIuWS52YWwoZCksXG4gICAgICAgIGxhdGVyLk0udmFsKGQpLFxuICAgICAgICBNYXRoLm1heCgxLCAobGF0ZXIuZGMudmFsKGQpIC0gMSkgKiA3ICsgMSB8fCAxKVxuICAgICAgKSlcbiAgICApO1xuICB9LFxuICBlbmQoZCkge1xuICAgIHJldHVybiAoXG4gICAgICBkLmRjRW5kIHx8XG4gICAgICAoZC5kY0VuZCA9IGxhdGVyLmRhdGUucHJldihcbiAgICAgICAgbGF0ZXIuWS52YWwoZCksXG4gICAgICAgIGxhdGVyLk0udmFsKGQpLFxuICAgICAgICBNYXRoLm1pbihsYXRlci5kYy52YWwoZCkgKiA3LCBsYXRlci5ELmV4dGVudChkKVsxXSlcbiAgICAgICkpXG4gICAgKTtcbiAgfSxcbiAgbmV4dChkLCB2YWx1ZSkge1xuICAgIHZhbHVlID0gdmFsdWUgPiBsYXRlci5kYy5leHRlbnQoZClbMV0gPyAxIDogdmFsdWU7XG4gICAgbGV0IG1vbnRoID0gbGF0ZXIuZGF0ZS5uZXh0Um9sbG92ZXIoZCwgdmFsdWUsIGxhdGVyLmRjLCBsYXRlci5NKTtcbiAgICBjb25zdCBkY01heCA9IGxhdGVyLmRjLmV4dGVudChtb250aClbMV07XG4gICAgdmFsdWUgPSB2YWx1ZSA+IGRjTWF4ID8gMSA6IHZhbHVlO1xuICAgIGNvbnN0IG5leHQgPSBsYXRlci5kYXRlLm5leHQoXG4gICAgICBsYXRlci5ZLnZhbChtb250aCksXG4gICAgICBsYXRlci5NLnZhbChtb250aCksXG4gICAgICB2YWx1ZSA9PT0gMCA/IGxhdGVyLkQuZXh0ZW50KG1vbnRoKVsxXSAtIDYgOiAxICsgNyAqICh2YWx1ZSAtIDEpXG4gICAgKTtcbiAgICBpZiAobmV4dC5nZXRUaW1lKCkgPD0gZC5nZXRUaW1lKCkpIHtcbiAgICAgIG1vbnRoID0gbGF0ZXIuTS5uZXh0KGQsIGxhdGVyLk0udmFsKGQpICsgMSk7XG4gICAgICByZXR1cm4gbGF0ZXIuZGF0ZS5uZXh0KFxuICAgICAgICBsYXRlci5ZLnZhbChtb250aCksXG4gICAgICAgIGxhdGVyLk0udmFsKG1vbnRoKSxcbiAgICAgICAgdmFsdWUgPT09IDAgPyBsYXRlci5ELmV4dGVudChtb250aClbMV0gLSA2IDogMSArIDcgKiAodmFsdWUgLSAxKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV4dDtcbiAgfSxcbiAgcHJldihkLCB2YWx1ZSkge1xuICAgIGNvbnN0IG1vbnRoID0gbGF0ZXIuZGF0ZS5wcmV2Um9sbG92ZXIoZCwgdmFsdWUsIGxhdGVyLmRjLCBsYXRlci5NKTtcbiAgICBjb25zdCBkY01heCA9IGxhdGVyLmRjLmV4dGVudChtb250aClbMV07XG4gICAgdmFsdWUgPSB2YWx1ZSA+IGRjTWF4ID8gZGNNYXggOiB2YWx1ZSB8fCBkY01heDtcbiAgICByZXR1cm4gbGF0ZXIuZGMuZW5kKFxuICAgICAgbGF0ZXIuZGF0ZS5wcmV2KFxuICAgICAgICBsYXRlci5ZLnZhbChtb250aCksXG4gICAgICAgIGxhdGVyLk0udmFsKG1vbnRoKSxcbiAgICAgICAgMSArIDcgKiAodmFsdWUgLSAxKVxuICAgICAgKVxuICAgICk7XG4gIH1cbn07XG5sYXRlci5kYXlPZldlZWsgPSBsYXRlci5kdyA9IGxhdGVyLmQgPSB7XG4gIG5hbWU6ICdkYXkgb2Ygd2VlaycsXG4gIHJhbmdlOiA4NjQwMCxcbiAgdmFsKGQpIHtcbiAgICByZXR1cm4gZC5kdyB8fCAoZC5kdyA9IGxhdGVyLmRhdGUuZ2V0RGF5LmNhbGwoZCkgKyAxKTtcbiAgfSxcbiAgaXNWYWxpZChkLCB2YWx1ZSkge1xuICAgIHJldHVybiBsYXRlci5kdy52YWwoZCkgPT09ICh2YWx1ZSB8fCA3KTtcbiAgfSxcbiAgZXh0ZW50KCkge1xuICAgIHJldHVybiBbMSwgN107XG4gIH0sXG4gIHN0YXJ0KGQpIHtcbiAgICByZXR1cm4gbGF0ZXIuRC5zdGFydChkKTtcbiAgfSxcbiAgZW5kKGQpIHtcbiAgICByZXR1cm4gbGF0ZXIuRC5lbmQoZCk7XG4gIH0sXG4gIG5leHQoZCwgdmFsdWUpIHtcbiAgICB2YWx1ZSA9IHZhbHVlID4gNyA/IDEgOiB2YWx1ZSB8fCA3O1xuICAgIHJldHVybiBsYXRlci5kYXRlLm5leHQoXG4gICAgICBsYXRlci5ZLnZhbChkKSxcbiAgICAgIGxhdGVyLk0udmFsKGQpLFxuICAgICAgbGF0ZXIuRC52YWwoZCkgK1xuICAgICAgICAodmFsdWUgLSBsYXRlci5kdy52YWwoZCkpICtcbiAgICAgICAgKHZhbHVlIDw9IGxhdGVyLmR3LnZhbChkKSA/IDcgOiAwKVxuICAgICk7XG4gIH0sXG4gIHByZXYoZCwgdmFsdWUpIHtcbiAgICB2YWx1ZSA9IHZhbHVlID4gNyA/IDcgOiB2YWx1ZSB8fCA3O1xuICAgIHJldHVybiBsYXRlci5kYXRlLnByZXYoXG4gICAgICBsYXRlci5ZLnZhbChkKSxcbiAgICAgIGxhdGVyLk0udmFsKGQpLFxuICAgICAgbGF0ZXIuRC52YWwoZCkgK1xuICAgICAgICAodmFsdWUgLSBsYXRlci5kdy52YWwoZCkpICtcbiAgICAgICAgKHZhbHVlID49IGxhdGVyLmR3LnZhbChkKSA/IC03IDogMClcbiAgICApO1xuICB9XG59O1xubGF0ZXIuZGF5T2ZZZWFyID0gbGF0ZXIuZHkgPSB7XG4gIG5hbWU6ICdkYXkgb2YgeWVhcicsXG4gIHJhbmdlOiA4NjQwMCxcbiAgdmFsKGQpIHtcbiAgICByZXR1cm4gKFxuICAgICAgZC5keSB8fFxuICAgICAgKGQuZHkgPSBNYXRoLmNlaWwoXG4gICAgICAgIDEgK1xuICAgICAgICAgIChsYXRlci5ELnN0YXJ0KGQpLmdldFRpbWUoKSAtIGxhdGVyLlkuc3RhcnQoZCkuZ2V0VGltZSgpKSAvIGxhdGVyLkRBWVxuICAgICAgKSlcbiAgICApO1xuICB9LFxuICBpc1ZhbGlkKGQsIHZhbHVlKSB7XG4gICAgcmV0dXJuIGxhdGVyLmR5LnZhbChkKSA9PT0gKHZhbHVlIHx8IGxhdGVyLmR5LmV4dGVudChkKVsxXSk7XG4gIH0sXG4gIGV4dGVudChkKSB7XG4gICAgY29uc3QgeWVhciA9IGxhdGVyLlkudmFsKGQpO1xuICAgIHJldHVybiBkLmR5RXh0ZW50IHx8IChkLmR5RXh0ZW50ID0gWzEsIHllYXIgJSA0ID8gMzY1IDogMzY2XSk7XG4gIH0sXG4gIHN0YXJ0KGQpIHtcbiAgICByZXR1cm4gbGF0ZXIuRC5zdGFydChkKTtcbiAgfSxcbiAgZW5kKGQpIHtcbiAgICByZXR1cm4gbGF0ZXIuRC5lbmQoZCk7XG4gIH0sXG4gIG5leHQoZCwgdmFsdWUpIHtcbiAgICB2YWx1ZSA9IHZhbHVlID4gbGF0ZXIuZHkuZXh0ZW50KGQpWzFdID8gMSA6IHZhbHVlO1xuICAgIGNvbnN0IHllYXIgPSBsYXRlci5kYXRlLm5leHRSb2xsb3ZlcihkLCB2YWx1ZSwgbGF0ZXIuZHksIGxhdGVyLlkpO1xuICAgIGNvbnN0IGR5TWF4ID0gbGF0ZXIuZHkuZXh0ZW50KHllYXIpWzFdO1xuICAgIHZhbHVlID0gdmFsdWUgPiBkeU1heCA/IDEgOiB2YWx1ZSB8fCBkeU1heDtcbiAgICByZXR1cm4gbGF0ZXIuZGF0ZS5uZXh0KGxhdGVyLlkudmFsKHllYXIpLCBsYXRlci5NLnZhbCh5ZWFyKSwgdmFsdWUpO1xuICB9LFxuICBwcmV2KGQsIHZhbHVlKSB7XG4gICAgY29uc3QgeWVhciA9IGxhdGVyLmRhdGUucHJldlJvbGxvdmVyKGQsIHZhbHVlLCBsYXRlci5keSwgbGF0ZXIuWSk7XG4gICAgY29uc3QgZHlNYXggPSBsYXRlci5keS5leHRlbnQoeWVhcilbMV07XG4gICAgdmFsdWUgPSB2YWx1ZSA+IGR5TWF4ID8gZHlNYXggOiB2YWx1ZSB8fCBkeU1heDtcbiAgICByZXR1cm4gbGF0ZXIuZGF0ZS5wcmV2KGxhdGVyLlkudmFsKHllYXIpLCBsYXRlci5NLnZhbCh5ZWFyKSwgdmFsdWUpO1xuICB9XG59O1xubGF0ZXIuaG91ciA9IGxhdGVyLmggPSB7XG4gIG5hbWU6ICdob3VyJyxcbiAgcmFuZ2U6IDM2MDAsXG4gIHZhbChkKSB7XG4gICAgcmV0dXJuIGQuaCB8fCAoZC5oID0gbGF0ZXIuZGF0ZS5nZXRIb3VyLmNhbGwoZCkpO1xuICB9LFxuICBpc1ZhbGlkKGQsIHZhbHVlKSB7XG4gICAgcmV0dXJuIGxhdGVyLmgudmFsKGQpID09PSB2YWx1ZTtcbiAgfSxcbiAgZXh0ZW50KCkge1xuICAgIHJldHVybiBbMCwgMjNdO1xuICB9LFxuICBzdGFydChkKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIGQuaFN0YXJ0IHx8XG4gICAgICAoZC5oU3RhcnQgPSBsYXRlci5kYXRlLm5leHQoXG4gICAgICAgIGxhdGVyLlkudmFsKGQpLFxuICAgICAgICBsYXRlci5NLnZhbChkKSxcbiAgICAgICAgbGF0ZXIuRC52YWwoZCksXG4gICAgICAgIGxhdGVyLmgudmFsKGQpXG4gICAgICApKVxuICAgICk7XG4gIH0sXG4gIGVuZChkKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIGQuaEVuZCB8fFxuICAgICAgKGQuaEVuZCA9IGxhdGVyLmRhdGUucHJldihcbiAgICAgICAgbGF0ZXIuWS52YWwoZCksXG4gICAgICAgIGxhdGVyLk0udmFsKGQpLFxuICAgICAgICBsYXRlci5ELnZhbChkKSxcbiAgICAgICAgbGF0ZXIuaC52YWwoZClcbiAgICAgICkpXG4gICAgKTtcbiAgfSxcbiAgbmV4dChkLCB2YWx1ZSkge1xuICAgIHZhbHVlID0gdmFsdWUgPiAyMyA/IDAgOiB2YWx1ZTtcbiAgICBsZXQgbmV4dCA9IGxhdGVyLmRhdGUubmV4dChcbiAgICAgIGxhdGVyLlkudmFsKGQpLFxuICAgICAgbGF0ZXIuTS52YWwoZCksXG4gICAgICBsYXRlci5ELnZhbChkKSArICh2YWx1ZSA8PSBsYXRlci5oLnZhbChkKSA/IDEgOiAwKSxcbiAgICAgIHZhbHVlXG4gICAgKTtcbiAgICBpZiAoIWxhdGVyLmRhdGUuaXNVVEMgJiYgbmV4dC5nZXRUaW1lKCkgPD0gZC5nZXRUaW1lKCkpIHtcbiAgICAgIG5leHQgPSBsYXRlci5kYXRlLm5leHQoXG4gICAgICAgIGxhdGVyLlkudmFsKG5leHQpLFxuICAgICAgICBsYXRlci5NLnZhbChuZXh0KSxcbiAgICAgICAgbGF0ZXIuRC52YWwobmV4dCksXG4gICAgICAgIHZhbHVlICsgMVxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV4dDtcbiAgfSxcbiAgcHJldihkLCB2YWx1ZSkge1xuICAgIHZhbHVlID0gdmFsdWUgPiAyMyA/IDIzIDogdmFsdWU7XG4gICAgcmV0dXJuIGxhdGVyLmRhdGUucHJldihcbiAgICAgIGxhdGVyLlkudmFsKGQpLFxuICAgICAgbGF0ZXIuTS52YWwoZCksXG4gICAgICBsYXRlci5ELnZhbChkKSArICh2YWx1ZSA+PSBsYXRlci5oLnZhbChkKSA/IC0xIDogMCksXG4gICAgICB2YWx1ZVxuICAgICk7XG4gIH1cbn07XG5sYXRlci5taW51dGUgPSBsYXRlci5tID0ge1xuICBuYW1lOiAnbWludXRlJyxcbiAgcmFuZ2U6IDYwLFxuICB2YWwoZCkge1xuICAgIHJldHVybiBkLm0gfHwgKGQubSA9IGxhdGVyLmRhdGUuZ2V0TWluLmNhbGwoZCkpO1xuICB9LFxuICBpc1ZhbGlkKGQsIHZhbHVlKSB7XG4gICAgcmV0dXJuIGxhdGVyLm0udmFsKGQpID09PSB2YWx1ZTtcbiAgfSxcbiAgZXh0ZW50KGQpIHtcbiAgICByZXR1cm4gWzAsIDU5XTtcbiAgfSxcbiAgc3RhcnQoZCkge1xuICAgIHJldHVybiAoXG4gICAgICBkLm1TdGFydCB8fFxuICAgICAgKGQubVN0YXJ0ID0gbGF0ZXIuZGF0ZS5uZXh0KFxuICAgICAgICBsYXRlci5ZLnZhbChkKSxcbiAgICAgICAgbGF0ZXIuTS52YWwoZCksXG4gICAgICAgIGxhdGVyLkQudmFsKGQpLFxuICAgICAgICBsYXRlci5oLnZhbChkKSxcbiAgICAgICAgbGF0ZXIubS52YWwoZClcbiAgICAgICkpXG4gICAgKTtcbiAgfSxcbiAgZW5kKGQpIHtcbiAgICByZXR1cm4gKFxuICAgICAgZC5tRW5kIHx8XG4gICAgICAoZC5tRW5kID0gbGF0ZXIuZGF0ZS5wcmV2KFxuICAgICAgICBsYXRlci5ZLnZhbChkKSxcbiAgICAgICAgbGF0ZXIuTS52YWwoZCksXG4gICAgICAgIGxhdGVyLkQudmFsKGQpLFxuICAgICAgICBsYXRlci5oLnZhbChkKSxcbiAgICAgICAgbGF0ZXIubS52YWwoZClcbiAgICAgICkpXG4gICAgKTtcbiAgfSxcbiAgbmV4dChkLCB2YWx1ZSkge1xuICAgIGNvbnN0IG0gPSBsYXRlci5tLnZhbChkKTtcbiAgICBjb25zdCBzID0gbGF0ZXIucy52YWwoZCk7XG4gICAgY29uc3QgaW5jID0gdmFsdWUgPiA1OSA/IDYwIC0gbSA6IHZhbHVlIDw9IG0gPyA2MCAtIG0gKyB2YWx1ZSA6IHZhbHVlIC0gbTtcbiAgICBsZXQgbmV4dCA9IG5ldyBEYXRlKGQuZ2V0VGltZSgpICsgaW5jICogbGF0ZXIuTUlOIC0gcyAqIGxhdGVyLlNFQyk7XG4gICAgaWYgKCFsYXRlci5kYXRlLmlzVVRDICYmIG5leHQuZ2V0VGltZSgpIDw9IGQuZ2V0VGltZSgpKSB7XG4gICAgICBuZXh0ID0gbmV3IERhdGUoZC5nZXRUaW1lKCkgKyAoaW5jICsgMTIwKSAqIGxhdGVyLk1JTiAtIHMgKiBsYXRlci5TRUMpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXh0O1xuICB9LFxuICBwcmV2KGQsIHZhbHVlKSB7XG4gICAgdmFsdWUgPSB2YWx1ZSA+IDU5ID8gNTkgOiB2YWx1ZTtcbiAgICByZXR1cm4gbGF0ZXIuZGF0ZS5wcmV2KFxuICAgICAgbGF0ZXIuWS52YWwoZCksXG4gICAgICBsYXRlci5NLnZhbChkKSxcbiAgICAgIGxhdGVyLkQudmFsKGQpLFxuICAgICAgbGF0ZXIuaC52YWwoZCkgKyAodmFsdWUgPj0gbGF0ZXIubS52YWwoZCkgPyAtMSA6IDApLFxuICAgICAgdmFsdWVcbiAgICApO1xuICB9XG59O1xubGF0ZXIubW9udGggPSBsYXRlci5NID0ge1xuICBuYW1lOiAnbW9udGgnLFxuICByYW5nZTogMjYyOTc0MCxcbiAgdmFsKGQpIHtcbiAgICByZXR1cm4gZC5NIHx8IChkLk0gPSBsYXRlci5kYXRlLmdldE1vbnRoLmNhbGwoZCkgKyAxKTtcbiAgfSxcbiAgaXNWYWxpZChkLCB2YWx1ZSkge1xuICAgIHJldHVybiBsYXRlci5NLnZhbChkKSA9PT0gKHZhbHVlIHx8IDEyKTtcbiAgfSxcbiAgZXh0ZW50KCkge1xuICAgIHJldHVybiBbMSwgMTJdO1xuICB9LFxuICBzdGFydChkKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIGQuTVN0YXJ0IHx8IChkLk1TdGFydCA9IGxhdGVyLmRhdGUubmV4dChsYXRlci5ZLnZhbChkKSwgbGF0ZXIuTS52YWwoZCkpKVxuICAgICk7XG4gIH0sXG4gIGVuZChkKSB7XG4gICAgcmV0dXJuIGQuTUVuZCB8fCAoZC5NRW5kID0gbGF0ZXIuZGF0ZS5wcmV2KGxhdGVyLlkudmFsKGQpLCBsYXRlci5NLnZhbChkKSkpO1xuICB9LFxuICBuZXh0KGQsIHZhbHVlKSB7XG4gICAgdmFsdWUgPSB2YWx1ZSA+IDEyID8gMSA6IHZhbHVlIHx8IDEyO1xuICAgIHJldHVybiBsYXRlci5kYXRlLm5leHQoXG4gICAgICBsYXRlci5ZLnZhbChkKSArICh2YWx1ZSA+IGxhdGVyLk0udmFsKGQpID8gMCA6IDEpLFxuICAgICAgdmFsdWVcbiAgICApO1xuICB9LFxuICBwcmV2KGQsIHZhbHVlKSB7XG4gICAgdmFsdWUgPSB2YWx1ZSA+IDEyID8gMTIgOiB2YWx1ZSB8fCAxMjtcbiAgICByZXR1cm4gbGF0ZXIuZGF0ZS5wcmV2KFxuICAgICAgbGF0ZXIuWS52YWwoZCkgLSAodmFsdWUgPj0gbGF0ZXIuTS52YWwoZCkgPyAxIDogMCksXG4gICAgICB2YWx1ZVxuICAgICk7XG4gIH1cbn07XG5sYXRlci5zZWNvbmQgPSBsYXRlci5zID0ge1xuICBuYW1lOiAnc2Vjb25kJyxcbiAgcmFuZ2U6IDEsXG4gIHZhbChkKSB7XG4gICAgcmV0dXJuIGQucyB8fCAoZC5zID0gbGF0ZXIuZGF0ZS5nZXRTZWMuY2FsbChkKSk7XG4gIH0sXG4gIGlzVmFsaWQoZCwgdmFsdWUpIHtcbiAgICByZXR1cm4gbGF0ZXIucy52YWwoZCkgPT09IHZhbHVlO1xuICB9LFxuICBleHRlbnQoKSB7XG4gICAgcmV0dXJuIFswLCA1OV07XG4gIH0sXG4gIHN0YXJ0KGQpIHtcbiAgICByZXR1cm4gZDtcbiAgfSxcbiAgZW5kKGQpIHtcbiAgICByZXR1cm4gZDtcbiAgfSxcbiAgbmV4dChkLCB2YWx1ZSkge1xuICAgIGNvbnN0IHMgPSBsYXRlci5zLnZhbChkKTtcbiAgICBjb25zdCBpbmMgPSB2YWx1ZSA+IDU5ID8gNjAgLSBzIDogdmFsdWUgPD0gcyA/IDYwIC0gcyArIHZhbHVlIDogdmFsdWUgLSBzO1xuICAgIGxldCBuZXh0ID0gbmV3IERhdGUoZC5nZXRUaW1lKCkgKyBpbmMgKiBsYXRlci5TRUMpO1xuICAgIGlmICghbGF0ZXIuZGF0ZS5pc1VUQyAmJiBuZXh0LmdldFRpbWUoKSA8PSBkLmdldFRpbWUoKSkge1xuICAgICAgbmV4dCA9IG5ldyBEYXRlKGQuZ2V0VGltZSgpICsgKGluYyArIDcyMDApICogbGF0ZXIuU0VDKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV4dDtcbiAgfSxcbiAgcHJldihkLCB2YWx1ZSwgY2FjaGUpIHtcbiAgICB2YWx1ZSA9IHZhbHVlID4gNTkgPyA1OSA6IHZhbHVlO1xuICAgIHJldHVybiBsYXRlci5kYXRlLnByZXYoXG4gICAgICBsYXRlci5ZLnZhbChkKSxcbiAgICAgIGxhdGVyLk0udmFsKGQpLFxuICAgICAgbGF0ZXIuRC52YWwoZCksXG4gICAgICBsYXRlci5oLnZhbChkKSxcbiAgICAgIGxhdGVyLm0udmFsKGQpICsgKHZhbHVlID49IGxhdGVyLnMudmFsKGQpID8gLTEgOiAwKSxcbiAgICAgIHZhbHVlXG4gICAgKTtcbiAgfVxufTtcbmxhdGVyLnRpbWUgPSBsYXRlci50ID0ge1xuICBuYW1lOiAndGltZScsXG4gIHJhbmdlOiAxLFxuICB2YWwoZCkge1xuICAgIHJldHVybiAoXG4gICAgICBkLnQgfHxcbiAgICAgIChkLnQgPSBsYXRlci5oLnZhbChkKSAqIDM2MDAgKyBsYXRlci5tLnZhbChkKSAqIDYwICsgbGF0ZXIucy52YWwoZCkpXG4gICAgKTtcbiAgfSxcbiAgaXNWYWxpZChkLCB2YWx1ZSkge1xuICAgIHJldHVybiBsYXRlci50LnZhbChkKSA9PT0gdmFsdWU7XG4gIH0sXG4gIGV4dGVudCgpIHtcbiAgICByZXR1cm4gWzAsIDg2Mzk5XTtcbiAgfSxcbiAgc3RhcnQoZCkge1xuICAgIHJldHVybiBkO1xuICB9LFxuICBlbmQoZCkge1xuICAgIHJldHVybiBkO1xuICB9LFxuICBuZXh0KGQsIHZhbHVlKSB7XG4gICAgdmFsdWUgPSB2YWx1ZSA+IDg2Mzk5ID8gMCA6IHZhbHVlO1xuICAgIGxldCBuZXh0ID0gbGF0ZXIuZGF0ZS5uZXh0KFxuICAgICAgbGF0ZXIuWS52YWwoZCksXG4gICAgICBsYXRlci5NLnZhbChkKSxcbiAgICAgIGxhdGVyLkQudmFsKGQpICsgKHZhbHVlIDw9IGxhdGVyLnQudmFsKGQpID8gMSA6IDApLFxuICAgICAgMCxcbiAgICAgIDAsXG4gICAgICB2YWx1ZVxuICAgICk7XG4gICAgaWYgKCFsYXRlci5kYXRlLmlzVVRDICYmIG5leHQuZ2V0VGltZSgpIDwgZC5nZXRUaW1lKCkpIHtcbiAgICAgIG5leHQgPSBsYXRlci5kYXRlLm5leHQoXG4gICAgICAgIGxhdGVyLlkudmFsKG5leHQpLFxuICAgICAgICBsYXRlci5NLnZhbChuZXh0KSxcbiAgICAgICAgbGF0ZXIuRC52YWwobmV4dCksXG4gICAgICAgIGxhdGVyLmgudmFsKG5leHQpLFxuICAgICAgICBsYXRlci5tLnZhbChuZXh0KSxcbiAgICAgICAgdmFsdWUgKyA3MjAwXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiBuZXh0O1xuICB9LFxuICBwcmV2KGQsIHZhbHVlKSB7XG4gICAgdmFsdWUgPSB2YWx1ZSA+IDg2Mzk5ID8gODYzOTkgOiB2YWx1ZTtcbiAgICByZXR1cm4gbGF0ZXIuZGF0ZS5uZXh0KFxuICAgICAgbGF0ZXIuWS52YWwoZCksXG4gICAgICBsYXRlci5NLnZhbChkKSxcbiAgICAgIGxhdGVyLkQudmFsKGQpICsgKHZhbHVlID49IGxhdGVyLnQudmFsKGQpID8gLTEgOiAwKSxcbiAgICAgIDAsXG4gICAgICAwLFxuICAgICAgdmFsdWVcbiAgICApO1xuICB9XG59O1xubGF0ZXIud2Vla09mTW9udGggPSBsYXRlci53bSA9IHtcbiAgbmFtZTogJ3dlZWsgb2YgbW9udGgnLFxuICByYW5nZTogNjA0ODAwLFxuICB2YWwoZCkge1xuICAgIHJldHVybiAoXG4gICAgICBkLndtIHx8XG4gICAgICAoZC53bSA9XG4gICAgICAgIChsYXRlci5ELnZhbChkKSArXG4gICAgICAgICAgKGxhdGVyLmR3LnZhbChsYXRlci5NLnN0YXJ0KGQpKSAtIDEpICtcbiAgICAgICAgICAoNyAtIGxhdGVyLmR3LnZhbChkKSkpIC9cbiAgICAgICAgNylcbiAgICApO1xuICB9LFxuICBpc1ZhbGlkKGQsIHZhbHVlKSB7XG4gICAgcmV0dXJuIGxhdGVyLndtLnZhbChkKSA9PT0gKHZhbHVlIHx8IGxhdGVyLndtLmV4dGVudChkKVsxXSk7XG4gIH0sXG4gIGV4dGVudChkKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIGQud21FeHRlbnQgfHxcbiAgICAgIChkLndtRXh0ZW50ID0gW1xuICAgICAgICAxLFxuICAgICAgICAobGF0ZXIuRC5leHRlbnQoZClbMV0gK1xuICAgICAgICAgIChsYXRlci5kdy52YWwobGF0ZXIuTS5zdGFydChkKSkgLSAxKSArXG4gICAgICAgICAgKDcgLSBsYXRlci5kdy52YWwobGF0ZXIuTS5lbmQoZCkpKSkgL1xuICAgICAgICAgIDdcbiAgICAgIF0pXG4gICAgKTtcbiAgfSxcbiAgc3RhcnQoZCkge1xuICAgIHJldHVybiAoXG4gICAgICBkLndtU3RhcnQgfHxcbiAgICAgIChkLndtU3RhcnQgPSBsYXRlci5kYXRlLm5leHQoXG4gICAgICAgIGxhdGVyLlkudmFsKGQpLFxuICAgICAgICBsYXRlci5NLnZhbChkKSxcbiAgICAgICAgTWF0aC5tYXgobGF0ZXIuRC52YWwoZCkgLSBsYXRlci5kdy52YWwoZCkgKyAxLCAxKVxuICAgICAgKSlcbiAgICApO1xuICB9LFxuICBlbmQoZCkge1xuICAgIHJldHVybiAoXG4gICAgICBkLndtRW5kIHx8XG4gICAgICAoZC53bUVuZCA9IGxhdGVyLmRhdGUucHJldihcbiAgICAgICAgbGF0ZXIuWS52YWwoZCksXG4gICAgICAgIGxhdGVyLk0udmFsKGQpLFxuICAgICAgICBNYXRoLm1pbihsYXRlci5ELnZhbChkKSArICg3IC0gbGF0ZXIuZHcudmFsKGQpKSwgbGF0ZXIuRC5leHRlbnQoZClbMV0pXG4gICAgICApKVxuICAgICk7XG4gIH0sXG4gIG5leHQoZCwgdmFsdWUpIHtcbiAgICB2YWx1ZSA9IHZhbHVlID4gbGF0ZXIud20uZXh0ZW50KGQpWzFdID8gMSA6IHZhbHVlO1xuICAgIGNvbnN0IG1vbnRoID0gbGF0ZXIuZGF0ZS5uZXh0Um9sbG92ZXIoZCwgdmFsdWUsIGxhdGVyLndtLCBsYXRlci5NKTtcbiAgICBjb25zdCB3bU1heCA9IGxhdGVyLndtLmV4dGVudChtb250aClbMV07XG4gICAgdmFsdWUgPSB2YWx1ZSA+IHdtTWF4ID8gMSA6IHZhbHVlIHx8IHdtTWF4O1xuICAgIHJldHVybiBsYXRlci5kYXRlLm5leHQoXG4gICAgICBsYXRlci5ZLnZhbChtb250aCksXG4gICAgICBsYXRlci5NLnZhbChtb250aCksXG4gICAgICBNYXRoLm1heCgxLCAodmFsdWUgLSAxKSAqIDcgLSAobGF0ZXIuZHcudmFsKG1vbnRoKSAtIDIpKVxuICAgICk7XG4gIH0sXG4gIHByZXYoZCwgdmFsdWUpIHtcbiAgICBjb25zdCBtb250aCA9IGxhdGVyLmRhdGUucHJldlJvbGxvdmVyKGQsIHZhbHVlLCBsYXRlci53bSwgbGF0ZXIuTSk7XG4gICAgY29uc3Qgd21NYXggPSBsYXRlci53bS5leHRlbnQobW9udGgpWzFdO1xuICAgIHZhbHVlID0gdmFsdWUgPiB3bU1heCA/IHdtTWF4IDogdmFsdWUgfHwgd21NYXg7XG4gICAgcmV0dXJuIGxhdGVyLndtLmVuZChcbiAgICAgIGxhdGVyLmRhdGUubmV4dChcbiAgICAgICAgbGF0ZXIuWS52YWwobW9udGgpLFxuICAgICAgICBsYXRlci5NLnZhbChtb250aCksXG4gICAgICAgIE1hdGgubWF4KDEsICh2YWx1ZSAtIDEpICogNyAtIChsYXRlci5kdy52YWwobW9udGgpIC0gMikpXG4gICAgICApXG4gICAgKTtcbiAgfVxufTtcbmxhdGVyLndlZWtPZlllYXIgPSBsYXRlci53eSA9IHtcbiAgbmFtZTogJ3dlZWsgb2YgeWVhciAoSVNPKScsXG4gIHJhbmdlOiA2MDQ4MDAsXG4gIHZhbChkKSB7XG4gICAgaWYgKGQud3kpIHJldHVybiBkLnd5O1xuICAgIGNvbnN0IHdUaHVyID0gbGF0ZXIuZHcubmV4dChsYXRlci53eS5zdGFydChkKSwgNSk7XG4gICAgY29uc3QgWVRodXIgPSBsYXRlci5kdy5uZXh0KGxhdGVyLlkucHJldih3VGh1ciwgbGF0ZXIuWS52YWwod1RodXIpIC0gMSksIDUpO1xuICAgIHJldHVybiAoZC53eSA9XG4gICAgICAxICsgTWF0aC5jZWlsKCh3VGh1ci5nZXRUaW1lKCkgLSBZVGh1ci5nZXRUaW1lKCkpIC8gbGF0ZXIuV0VFSykpO1xuICB9LFxuICBpc1ZhbGlkKGQsIHZhbHVlKSB7XG4gICAgcmV0dXJuIGxhdGVyLnd5LnZhbChkKSA9PT0gKHZhbHVlIHx8IGxhdGVyLnd5LmV4dGVudChkKVsxXSk7XG4gIH0sXG4gIGV4dGVudChkKSB7XG4gICAgaWYgKGQud3lFeHRlbnQpIHJldHVybiBkLnd5RXh0ZW50O1xuICAgIGNvbnN0IHllYXIgPSBsYXRlci5kdy5uZXh0KGxhdGVyLnd5LnN0YXJ0KGQpLCA1KTtcbiAgICBjb25zdCBkd0ZpcnN0ID0gbGF0ZXIuZHcudmFsKGxhdGVyLlkuc3RhcnQoeWVhcikpO1xuICAgIGNvbnN0IGR3TGFzdCA9IGxhdGVyLmR3LnZhbChsYXRlci5ZLmVuZCh5ZWFyKSk7XG4gICAgcmV0dXJuIChkLnd5RXh0ZW50ID0gWzEsIGR3Rmlyc3QgPT09IDUgfHwgZHdMYXN0ID09PSA1ID8gNTMgOiA1Ml0pO1xuICB9LFxuICBzdGFydChkKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIGQud3lTdGFydCB8fFxuICAgICAgKGQud3lTdGFydCA9IGxhdGVyLmRhdGUubmV4dChcbiAgICAgICAgbGF0ZXIuWS52YWwoZCksXG4gICAgICAgIGxhdGVyLk0udmFsKGQpLFxuICAgICAgICBsYXRlci5ELnZhbChkKSAtIChsYXRlci5kdy52YWwoZCkgPiAxID8gbGF0ZXIuZHcudmFsKGQpIC0gMiA6IDYpXG4gICAgICApKVxuICAgICk7XG4gIH0sXG4gIGVuZChkKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIGQud3lFbmQgfHxcbiAgICAgIChkLnd5RW5kID0gbGF0ZXIuZGF0ZS5wcmV2KFxuICAgICAgICBsYXRlci5ZLnZhbChkKSxcbiAgICAgICAgbGF0ZXIuTS52YWwoZCksXG4gICAgICAgIGxhdGVyLkQudmFsKGQpICsgKGxhdGVyLmR3LnZhbChkKSA+IDEgPyA4IC0gbGF0ZXIuZHcudmFsKGQpIDogMClcbiAgICAgICkpXG4gICAgKTtcbiAgfSxcbiAgbmV4dChkLCB2YWx1ZSkge1xuICAgIHZhbHVlID0gdmFsdWUgPiBsYXRlci53eS5leHRlbnQoZClbMV0gPyAxIDogdmFsdWU7XG4gICAgY29uc3Qgd3lUaHVyID0gbGF0ZXIuZHcubmV4dChsYXRlci53eS5zdGFydChkKSwgNSk7XG4gICAgbGV0IHllYXIgPSBsYXRlci5kYXRlLm5leHRSb2xsb3Zlcih3eVRodXIsIHZhbHVlLCBsYXRlci53eSwgbGF0ZXIuWSk7XG4gICAgaWYgKGxhdGVyLnd5LnZhbCh5ZWFyKSAhPT0gMSkge1xuICAgICAgeWVhciA9IGxhdGVyLmR3Lm5leHQoeWVhciwgMik7XG4gICAgfVxuXG4gICAgY29uc3Qgd3lNYXggPSBsYXRlci53eS5leHRlbnQoeWVhcilbMV07XG4gICAgY29uc3Qgd3lTdGFydCA9IGxhdGVyLnd5LnN0YXJ0KHllYXIpO1xuICAgIHZhbHVlID0gdmFsdWUgPiB3eU1heCA/IDEgOiB2YWx1ZSB8fCB3eU1heDtcbiAgICByZXR1cm4gbGF0ZXIuZGF0ZS5uZXh0KFxuICAgICAgbGF0ZXIuWS52YWwod3lTdGFydCksXG4gICAgICBsYXRlci5NLnZhbCh3eVN0YXJ0KSxcbiAgICAgIGxhdGVyLkQudmFsKHd5U3RhcnQpICsgNyAqICh2YWx1ZSAtIDEpXG4gICAgKTtcbiAgfSxcbiAgcHJldihkLCB2YWx1ZSkge1xuICAgIGNvbnN0IHd5VGh1ciA9IGxhdGVyLmR3Lm5leHQobGF0ZXIud3kuc3RhcnQoZCksIDUpO1xuICAgIGxldCB5ZWFyID0gbGF0ZXIuZGF0ZS5wcmV2Um9sbG92ZXIod3lUaHVyLCB2YWx1ZSwgbGF0ZXIud3ksIGxhdGVyLlkpO1xuICAgIGlmIChsYXRlci53eS52YWwoeWVhcikgIT09IDEpIHtcbiAgICAgIHllYXIgPSBsYXRlci5kdy5uZXh0KHllYXIsIDIpO1xuICAgIH1cblxuICAgIGNvbnN0IHd5TWF4ID0gbGF0ZXIud3kuZXh0ZW50KHllYXIpWzFdO1xuICAgIGNvbnN0IHd5RW5kID0gbGF0ZXIud3kuZW5kKHllYXIpO1xuICAgIHZhbHVlID0gdmFsdWUgPiB3eU1heCA/IHd5TWF4IDogdmFsdWUgfHwgd3lNYXg7XG4gICAgcmV0dXJuIGxhdGVyLnd5LmVuZChcbiAgICAgIGxhdGVyLmRhdGUubmV4dChcbiAgICAgICAgbGF0ZXIuWS52YWwod3lFbmQpLFxuICAgICAgICBsYXRlci5NLnZhbCh3eUVuZCksXG4gICAgICAgIGxhdGVyLkQudmFsKHd5RW5kKSArIDcgKiAodmFsdWUgLSAxKVxuICAgICAgKVxuICAgICk7XG4gIH1cbn07XG5sYXRlci55ZWFyID0gbGF0ZXIuWSA9IHtcbiAgbmFtZTogJ3llYXInLFxuICByYW5nZTogMzE1NTY5MDAsXG4gIHZhbChkKSB7XG4gICAgcmV0dXJuIGQuWSB8fCAoZC5ZID0gbGF0ZXIuZGF0ZS5nZXRZZWFyLmNhbGwoZCkpO1xuICB9LFxuICBpc1ZhbGlkKGQsIHZhbHVlKSB7XG4gICAgcmV0dXJuIGxhdGVyLlkudmFsKGQpID09PSB2YWx1ZTtcbiAgfSxcbiAgZXh0ZW50KCkge1xuICAgIHJldHVybiBbMTk3MCwgMjA5OV07XG4gIH0sXG4gIHN0YXJ0KGQpIHtcbiAgICByZXR1cm4gZC5ZU3RhcnQgfHwgKGQuWVN0YXJ0ID0gbGF0ZXIuZGF0ZS5uZXh0KGxhdGVyLlkudmFsKGQpKSk7XG4gIH0sXG4gIGVuZChkKSB7XG4gICAgcmV0dXJuIGQuWUVuZCB8fCAoZC5ZRW5kID0gbGF0ZXIuZGF0ZS5wcmV2KGxhdGVyLlkudmFsKGQpKSk7XG4gIH0sXG4gIG5leHQoZCwgdmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgPiBsYXRlci5ZLnZhbChkKSAmJiB2YWx1ZSA8PSBsYXRlci5ZLmV4dGVudCgpWzFdXG4gICAgICA/IGxhdGVyLmRhdGUubmV4dCh2YWx1ZSlcbiAgICAgIDogbGF0ZXIuTkVWRVI7XG4gIH0sXG4gIHByZXYoZCwgdmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgPCBsYXRlci5ZLnZhbChkKSAmJiB2YWx1ZSA+PSBsYXRlci5ZLmV4dGVudCgpWzBdXG4gICAgICA/IGxhdGVyLmRhdGUucHJldih2YWx1ZSlcbiAgICAgIDogbGF0ZXIuTkVWRVI7XG4gIH1cbn07XG5sYXRlci5mdWxsRGF0ZSA9IGxhdGVyLmZkID0ge1xuICBuYW1lOiAnZnVsbCBkYXRlJyxcbiAgcmFuZ2U6IDEsXG4gIHZhbChkKSB7XG4gICAgcmV0dXJuIGQuZmQgfHwgKGQuZmQgPSBkLmdldFRpbWUoKSk7XG4gIH0sXG4gIGlzVmFsaWQoZCwgdmFsdWUpIHtcbiAgICByZXR1cm4gbGF0ZXIuZmQudmFsKGQpID09PSB2YWx1ZTtcbiAgfSxcbiAgZXh0ZW50KCkge1xuICAgIHJldHVybiBbMCwgMzI1MDM2OGU3XTtcbiAgfSxcbiAgc3RhcnQoZCkge1xuICAgIHJldHVybiBkO1xuICB9LFxuICBlbmQoZCkge1xuICAgIHJldHVybiBkO1xuICB9LFxuICBuZXh0KGQsIHZhbHVlKSB7XG4gICAgcmV0dXJuIGxhdGVyLmZkLnZhbChkKSA8IHZhbHVlID8gbmV3IERhdGUodmFsdWUpIDogbGF0ZXIuTkVWRVI7XG4gIH0sXG4gIHByZXYoZCwgdmFsdWUpIHtcbiAgICByZXR1cm4gbGF0ZXIuZmQudmFsKGQpID4gdmFsdWUgPyBuZXcgRGF0ZSh2YWx1ZSkgOiBsYXRlci5ORVZFUjtcbiAgfVxufTtcbmxhdGVyLm1vZGlmaWVyID0ge307XG5sYXRlci5tb2RpZmllci5hZnRlciA9IGxhdGVyLm1vZGlmaWVyLmEgPSBmdW5jdGlvbiAoY29uc3RyYWludCwgdmFsdWVzKSB7XG4gIGNvbnN0IHZhbHVlID0gdmFsdWVzWzBdO1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdhZnRlciAnICsgY29uc3RyYWludC5uYW1lLFxuICAgIHJhbmdlOiAoY29uc3RyYWludC5leHRlbnQobmV3IERhdGUoKSlbMV0gLSB2YWx1ZSkgKiBjb25zdHJhaW50LnJhbmdlLFxuICAgIHZhbDogY29uc3RyYWludC52YWwsXG4gICAgaXNWYWxpZChkLCB2YWx1ZV8pIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbChkKSA+PSB2YWx1ZTtcbiAgICB9LFxuICAgIGV4dGVudDogY29uc3RyYWludC5leHRlbnQsXG4gICAgc3RhcnQ6IGNvbnN0cmFpbnQuc3RhcnQsXG4gICAgZW5kOiBjb25zdHJhaW50LmVuZCxcbiAgICBuZXh0KHN0YXJ0RGF0ZSwgdmFsdWVfKSB7XG4gICAgICBpZiAodmFsdWVfICE9IHZhbHVlKSB2YWx1ZV8gPSBjb25zdHJhaW50LmV4dGVudChzdGFydERhdGUpWzBdO1xuICAgICAgcmV0dXJuIGNvbnN0cmFpbnQubmV4dChzdGFydERhdGUsIHZhbHVlXyk7XG4gICAgfSxcbiAgICBwcmV2KHN0YXJ0RGF0ZSwgdmFsdWVfKSB7XG4gICAgICB2YWx1ZV8gPSB2YWx1ZV8gPT09IHZhbHVlID8gY29uc3RyYWludC5leHRlbnQoc3RhcnREYXRlKVsxXSA6IHZhbHVlIC0gMTtcbiAgICAgIHJldHVybiBjb25zdHJhaW50LnByZXYoc3RhcnREYXRlLCB2YWx1ZV8pO1xuICAgIH1cbiAgfTtcbn07XG5cbmxhdGVyLm1vZGlmaWVyLmJlZm9yZSA9IGxhdGVyLm1vZGlmaWVyLmIgPSBmdW5jdGlvbiAoY29uc3RyYWludCwgdmFsdWVzKSB7XG4gIGNvbnN0IHZhbHVlID0gdmFsdWVzW3ZhbHVlcy5sZW5ndGggLSAxXTtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnYmVmb3JlICcgKyBjb25zdHJhaW50Lm5hbWUsXG4gICAgcmFuZ2U6IGNvbnN0cmFpbnQucmFuZ2UgKiAodmFsdWUgLSAxKSxcbiAgICB2YWw6IGNvbnN0cmFpbnQudmFsLFxuICAgIGlzVmFsaWQoZCwgdmFsdWVfKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWwoZCkgPCB2YWx1ZTtcbiAgICB9LFxuICAgIGV4dGVudDogY29uc3RyYWludC5leHRlbnQsXG4gICAgc3RhcnQ6IGNvbnN0cmFpbnQuc3RhcnQsXG4gICAgZW5kOiBjb25zdHJhaW50LmVuZCxcbiAgICBuZXh0KHN0YXJ0RGF0ZSwgdmFsdWVfKSB7XG4gICAgICB2YWx1ZV8gPSB2YWx1ZV8gPT09IHZhbHVlID8gY29uc3RyYWludC5leHRlbnQoc3RhcnREYXRlKVswXSA6IHZhbHVlO1xuICAgICAgcmV0dXJuIGNvbnN0cmFpbnQubmV4dChzdGFydERhdGUsIHZhbHVlXyk7XG4gICAgfSxcbiAgICBwcmV2KHN0YXJ0RGF0ZSwgdmFsdWVfKSB7XG4gICAgICB2YWx1ZV8gPSB2YWx1ZV8gPT09IHZhbHVlID8gdmFsdWUgLSAxIDogY29uc3RyYWludC5leHRlbnQoc3RhcnREYXRlKVsxXTtcbiAgICAgIHJldHVybiBjb25zdHJhaW50LnByZXYoc3RhcnREYXRlLCB2YWx1ZV8pO1xuICAgIH1cbiAgfTtcbn07XG5cbmxhdGVyLmNvbXBpbGUgPSBmdW5jdGlvbiAoc2NoZWREZWYpIHtcbiAgY29uc3QgY29uc3RyYWludHMgPSBbXTtcbiAgbGV0IGNvbnN0cmFpbnRzTGVuZ3RoID0gMDtcbiAgbGV0IHRpY2tDb25zdHJhaW50O1xuICBmb3IgKGNvbnN0IGtleSBpbiBzY2hlZERlZikge1xuICAgIGNvbnN0IG5hbWVQYXJ0cyA9IGtleS5zcGxpdCgnXycpO1xuICAgIGNvbnN0IG5hbWUgPSBuYW1lUGFydHNbMF07XG4gICAgY29uc3QgbW9kID0gbmFtZVBhcnRzWzFdO1xuICAgIGNvbnN0IHZhbHMgPSBzY2hlZERlZltrZXldO1xuICAgIGNvbnN0IGNvbnN0cmFpbnQgPSBtb2RcbiAgICAgID8gbGF0ZXIubW9kaWZpZXJbbW9kXShsYXRlcltuYW1lXSwgdmFscylcbiAgICAgIDogbGF0ZXJbbmFtZV07XG4gICAgY29uc3RyYWludHMucHVzaCh7XG4gICAgICBjb25zdHJhaW50LFxuICAgICAgdmFsc1xuICAgIH0pO1xuICAgIGNvbnN0cmFpbnRzTGVuZ3RoKys7XG4gIH1cblxuICBjb25zdHJhaW50cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgY29uc3QgcmEgPSBhLmNvbnN0cmFpbnQucmFuZ2U7XG4gICAgY29uc3QgcmIgPSBiLmNvbnN0cmFpbnQucmFuZ2U7XG4gICAgcmV0dXJuIHJiIDwgcmEgPyAtMSA6IHJiID4gcmEgPyAxIDogMDtcbiAgfSk7XG4gIHRpY2tDb25zdHJhaW50ID0gY29uc3RyYWludHNbY29uc3RyYWludHNMZW5ndGggLSAxXS5jb25zdHJhaW50O1xuICBmdW5jdGlvbiBjb21wYXJlRm4oZGlyKSB7XG4gICAgcmV0dXJuIGRpciA9PT0gJ25leHQnXG4gICAgICA/IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgaWYgKCFhIHx8ICFiKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICByZXR1cm4gYS5nZXRUaW1lKCkgPiBiLmdldFRpbWUoKTtcbiAgICAgICAgfVxuICAgICAgOiBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgIGlmICghYSB8fCAhYikgcmV0dXJuIHRydWU7XG4gICAgICAgICAgcmV0dXJuIGIuZ2V0VGltZSgpID4gYS5nZXRUaW1lKCk7XG4gICAgICAgIH07XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHN0YXJ0KGRpciwgc3RhcnREYXRlKSB7XG4gICAgICBsZXQgbmV4dCA9IHN0YXJ0RGF0ZTtcbiAgICAgIGNvbnN0IG5leHRWYWx1ZSA9IGxhdGVyLmFycmF5W2Rpcl07XG4gICAgICBsZXQgbWF4QXR0ZW1wdHMgPSAxZTM7XG4gICAgICBsZXQgZG9uZTtcbiAgICAgIHdoaWxlIChtYXhBdHRlbXB0cy0tICYmICFkb25lICYmIG5leHQpIHtcbiAgICAgICAgZG9uZSA9IHRydWU7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29uc3RyYWludHNMZW5ndGg7IGkrKykge1xuICAgICAgICAgIGNvbnN0IHsgY29uc3RyYWludCB9ID0gY29uc3RyYWludHNbaV07XG4gICAgICAgICAgY29uc3QgY3VyVmFsdWUgPSBjb25zdHJhaW50LnZhbChuZXh0KTtcbiAgICAgICAgICBjb25zdCBleHRlbnQgPSBjb25zdHJhaW50LmV4dGVudChuZXh0KTtcbiAgICAgICAgICBjb25zdCBuZXdWYWx1ZSA9IG5leHRWYWx1ZShjdXJWYWx1ZSwgY29uc3RyYWludHNbaV0udmFscywgZXh0ZW50KTtcbiAgICAgICAgICBpZiAoIWNvbnN0cmFpbnQuaXNWYWxpZChuZXh0LCBuZXdWYWx1ZSkpIHtcbiAgICAgICAgICAgIG5leHQgPSBjb25zdHJhaW50W2Rpcl0obmV4dCwgbmV3VmFsdWUpO1xuICAgICAgICAgICAgZG9uZSA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChuZXh0ICE9PSBsYXRlci5ORVZFUikge1xuICAgICAgICBuZXh0ID1cbiAgICAgICAgICBkaXIgPT09ICduZXh0J1xuICAgICAgICAgICAgPyB0aWNrQ29uc3RyYWludC5zdGFydChuZXh0KVxuICAgICAgICAgICAgOiB0aWNrQ29uc3RyYWludC5lbmQobmV4dCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXh0O1xuICAgIH0sXG4gICAgZW5kKGRpciwgc3RhcnREYXRlKSB7XG4gICAgICBsZXQgcmVzdWx0O1xuICAgICAgY29uc3QgbmV4dFZhbHVlID0gbGF0ZXIuYXJyYXlbZGlyICsgJ0ludmFsaWQnXTtcbiAgICAgIGNvbnN0IGNvbXBhcmUgPSBjb21wYXJlRm4oZGlyKTtcbiAgICAgIGZvciAobGV0IGkgPSBjb25zdHJhaW50c0xlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGNvbnN0IHsgY29uc3RyYWludCB9ID0gY29uc3RyYWludHNbaV07XG4gICAgICAgIGNvbnN0IGN1clZhbHVlID0gY29uc3RyYWludC52YWwoc3RhcnREYXRlKTtcbiAgICAgICAgY29uc3QgZXh0ZW50ID0gY29uc3RyYWludC5leHRlbnQoc3RhcnREYXRlKTtcbiAgICAgICAgY29uc3QgbmV3VmFsdWUgPSBuZXh0VmFsdWUoY3VyVmFsdWUsIGNvbnN0cmFpbnRzW2ldLnZhbHMsIGV4dGVudCk7XG4gICAgICAgIHZhciBuZXh0O1xuICAgICAgICBpZiAobmV3VmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIG5leHQgPSBjb25zdHJhaW50W2Rpcl0oc3RhcnREYXRlLCBuZXdWYWx1ZSk7XG4gICAgICAgICAgaWYgKG5leHQgJiYgKCFyZXN1bHQgfHwgY29tcGFyZShyZXN1bHQsIG5leHQpKSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gbmV4dDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuICAgIHRpY2soZGlyLCBkYXRlKSB7XG4gICAgICByZXR1cm4gbmV3IERhdGUoXG4gICAgICAgIGRpciA9PT0gJ25leHQnXG4gICAgICAgICAgPyB0aWNrQ29uc3RyYWludC5lbmQoZGF0ZSkuZ2V0VGltZSgpICsgbGF0ZXIuU0VDXG4gICAgICAgICAgOiB0aWNrQ29uc3RyYWludC5zdGFydChkYXRlKS5nZXRUaW1lKCkgLSBsYXRlci5TRUNcbiAgICAgICk7XG4gICAgfSxcbiAgICB0aWNrU3RhcnQoZGF0ZSkge1xuICAgICAgcmV0dXJuIHRpY2tDb25zdHJhaW50LnN0YXJ0KGRhdGUpO1xuICAgIH1cbiAgfTtcbn07XG5cbmxhdGVyLnNjaGVkdWxlID0gZnVuY3Rpb24gKHNjaGVkKSB7XG4gIGlmICghc2NoZWQpIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBzY2hlZHVsZSBkZWZpbml0aW9uLicpO1xuICBpZiAoIXNjaGVkLnNjaGVkdWxlcylcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0RlZmluaXRpb24gbXVzdCBpbmNsdWRlIGF0IGxlYXN0IG9uZSBzY2hlZHVsZS4nKTtcbiAgY29uc3Qgc2NoZWR1bGVzID0gW107XG4gIGNvbnN0IHNjaGVkdWxlc0xlbmd0aCA9IHNjaGVkLnNjaGVkdWxlcy5sZW5ndGg7XG4gIGNvbnN0IGV4Y2VwdGlvbnMgPSBbXTtcbiAgY29uc3QgZXhjZXB0aW9uc0xlbmd0aCA9IHNjaGVkLmV4Y2VwdGlvbnMgPyBzY2hlZC5leGNlcHRpb25zLmxlbmd0aCA6IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2NoZWR1bGVzTGVuZ3RoOyBpKyspIHtcbiAgICBzY2hlZHVsZXMucHVzaChsYXRlci5jb21waWxlKHNjaGVkLnNjaGVkdWxlc1tpXSkpO1xuICB9XG5cbiAgZm9yIChsZXQgaiA9IDA7IGogPCBleGNlcHRpb25zTGVuZ3RoOyBqKyspIHtcbiAgICBleGNlcHRpb25zLnB1c2gobGF0ZXIuY29tcGlsZShzY2hlZC5leGNlcHRpb25zW2pdKSk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRJbnN0YW5jZXMoZGlyLCBjb3VudCwgc3RhcnREYXRlLCBlbmREYXRlLCBpc1JhbmdlKSB7XG4gICAgY29uc3QgY29tcGFyZSA9IGNvbXBhcmVGbihkaXIpO1xuICAgIGxldCBsb29wQ291bnQgPSBjb3VudDtcbiAgICBsZXQgbWF4QXR0ZW1wdHMgPSAxZTM7XG4gICAgY29uc3Qgc2NoZWRTdGFydHMgPSBbXTtcbiAgICBjb25zdCBleGNlcHRTdGFydHMgPSBbXTtcbiAgICBsZXQgbmV4dDtcbiAgICBsZXQgZW5kO1xuICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICBjb25zdCBpc0ZvcndhcmQgPSBkaXIgPT09ICduZXh0JztcbiAgICBsZXQgbGFzdFJlc3VsdDtcbiAgICBjb25zdCByU3RhcnQgPSBpc0ZvcndhcmQgPyAwIDogMTtcbiAgICBjb25zdCByRW5kID0gaXNGb3J3YXJkID8gMSA6IDA7XG4gICAgc3RhcnREYXRlID0gc3RhcnREYXRlID8gbmV3IERhdGUoc3RhcnREYXRlKSA6IG5ldyBEYXRlKCk7XG4gICAgaWYgKCFzdGFydERhdGUgfHwgIXN0YXJ0RGF0ZS5nZXRUaW1lKCkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RhcnQgZGF0ZS4nKTtcbiAgICBzZXROZXh0U3RhcnRzKGRpciwgc2NoZWR1bGVzLCBzY2hlZFN0YXJ0cywgc3RhcnREYXRlKTtcbiAgICBzZXRSYW5nZVN0YXJ0cyhkaXIsIGV4Y2VwdGlvbnMsIGV4Y2VwdFN0YXJ0cywgc3RhcnREYXRlKTtcbiAgICB3aGlsZSAoXG4gICAgICBtYXhBdHRlbXB0cy0tICYmXG4gICAgICBsb29wQ291bnQgJiZcbiAgICAgIChuZXh0ID0gZmluZE5leHQoc2NoZWRTdGFydHMsIGNvbXBhcmUpKVxuICAgICkge1xuICAgICAgaWYgKGVuZERhdGUgJiYgY29tcGFyZShuZXh0LCBlbmREYXRlKSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgaWYgKGV4Y2VwdGlvbnNMZW5ndGgpIHtcbiAgICAgICAgdXBkYXRlUmFuZ2VTdGFydHMoZGlyLCBleGNlcHRpb25zLCBleGNlcHRTdGFydHMsIG5leHQpO1xuICAgICAgICBpZiAoKGVuZCA9IGNhbGNSYW5nZU92ZXJsYXAoZGlyLCBleGNlcHRTdGFydHMsIG5leHQpKSkge1xuICAgICAgICAgIHVwZGF0ZU5leHRTdGFydHMoZGlyLCBzY2hlZHVsZXMsIHNjaGVkU3RhcnRzLCBlbmQpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChpc1JhbmdlKSB7XG4gICAgICAgIGNvbnN0IG1heEVuZERhdGUgPSBjYWxjTWF4RW5kRGF0ZShleGNlcHRTdGFydHMsIGNvbXBhcmUpO1xuICAgICAgICBlbmQgPSBjYWxjRW5kKGRpciwgc2NoZWR1bGVzLCBzY2hlZFN0YXJ0cywgbmV4dCwgbWF4RW5kRGF0ZSk7XG4gICAgICAgIGNvbnN0IHIgPSBpc0ZvcndhcmRcbiAgICAgICAgICA/IFtcbiAgICAgICAgICAgICAgbmV3IERhdGUoTWF0aC5tYXgoc3RhcnREYXRlLCBuZXh0KSksXG4gICAgICAgICAgICAgIGVuZCA/IG5ldyBEYXRlKGVuZERhdGUgPyBNYXRoLm1pbihlbmQsIGVuZERhdGUpIDogZW5kKSA6IHVuZGVmaW5lZFxuICAgICAgICAgICAgXVxuICAgICAgICAgIDogW1xuICAgICAgICAgICAgICBlbmRcbiAgICAgICAgICAgICAgICA/IG5ldyBEYXRlKFxuICAgICAgICAgICAgICAgICAgICBlbmREYXRlXG4gICAgICAgICAgICAgICAgICAgICAgPyBNYXRoLm1heChlbmREYXRlLCBlbmQuZ2V0VGltZSgpICsgbGF0ZXIuU0VDKVxuICAgICAgICAgICAgICAgICAgICAgIDogZW5kLmdldFRpbWUoKSArIGxhdGVyLlNFQ1xuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICBuZXcgRGF0ZShNYXRoLm1pbihzdGFydERhdGUsIG5leHQuZ2V0VGltZSgpICsgbGF0ZXIuU0VDKSlcbiAgICAgICAgICAgIF07XG4gICAgICAgIGlmIChsYXN0UmVzdWx0ICYmIHJbclN0YXJ0XS5nZXRUaW1lKCkgPT09IGxhc3RSZXN1bHRbckVuZF0uZ2V0VGltZSgpKSB7XG4gICAgICAgICAgbGFzdFJlc3VsdFtyRW5kXSA9IHJbckVuZF07XG4gICAgICAgICAgbG9vcENvdW50Kys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGFzdFJlc3VsdCA9IHI7XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKGxhc3RSZXN1bHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFlbmQpIGJyZWFrO1xuICAgICAgICB1cGRhdGVOZXh0U3RhcnRzKGRpciwgc2NoZWR1bGVzLCBzY2hlZFN0YXJ0cywgZW5kKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdHMucHVzaChcbiAgICAgICAgICBpc0ZvcndhcmRcbiAgICAgICAgICAgID8gbmV3IERhdGUoTWF0aC5tYXgoc3RhcnREYXRlLCBuZXh0KSlcbiAgICAgICAgICAgIDogZ2V0U3RhcnQoc2NoZWR1bGVzLCBzY2hlZFN0YXJ0cywgbmV4dCwgZW5kRGF0ZSlcbiAgICAgICAgKTtcbiAgICAgICAgdGlja1N0YXJ0cyhkaXIsIHNjaGVkdWxlcywgc2NoZWRTdGFydHMsIG5leHQpO1xuICAgICAgfVxuXG4gICAgICBsb29wQ291bnQtLTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMCwgeyBsZW5ndGggfSA9IHJlc3VsdHM7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgcmVzdWx0ID0gcmVzdWx0c1tpXTtcbiAgICAgIHJlc3VsdHNbaV0gPVxuICAgICAgICBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocmVzdWx0KSA9PT0gJ1tvYmplY3QgQXJyYXldJ1xuICAgICAgICAgID8gW2NsZWFuRGF0ZShyZXN1bHRbMF0pLCBjbGVhbkRhdGUocmVzdWx0WzFdKV1cbiAgICAgICAgICA6IGNsZWFuRGF0ZShyZXN1bHQpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHRzLmxlbmd0aCA9PT0gMFxuICAgICAgPyBsYXRlci5ORVZFUlxuICAgICAgOiBjb3VudCA9PT0gMVxuICAgICAgPyByZXN1bHRzWzBdXG4gICAgICA6IHJlc3VsdHM7XG4gIH1cblxuICBmdW5jdGlvbiBjbGVhbkRhdGUoZCkge1xuICAgIGlmIChkIGluc3RhbmNlb2YgRGF0ZSAmJiAhaXNOYU4oZC52YWx1ZU9mKCkpKSB7XG4gICAgICByZXR1cm4gbmV3IERhdGUoZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldE5leHRTdGFydHMoZGlyLCBzY2hlZEFycmF5LCBzdGFydHNBcnJheSwgc3RhcnREYXRlKSB7XG4gICAgZm9yIChsZXQgaSA9IDAsIHsgbGVuZ3RoIH0gPSBzY2hlZEFycmF5OyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHN0YXJ0c0FycmF5W2ldID0gc2NoZWRBcnJheVtpXS5zdGFydChkaXIsIHN0YXJ0RGF0ZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlTmV4dFN0YXJ0cyhkaXIsIHNjaGVkQXJyYXksIHN0YXJ0c0FycmF5LCBzdGFydERhdGUpIHtcbiAgICBjb25zdCBjb21wYXJlID0gY29tcGFyZUZuKGRpcik7XG4gICAgZm9yIChsZXQgaSA9IDAsIHsgbGVuZ3RoIH0gPSBzY2hlZEFycmF5OyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChzdGFydHNBcnJheVtpXSAmJiAhY29tcGFyZShzdGFydHNBcnJheVtpXSwgc3RhcnREYXRlKSkge1xuICAgICAgICBzdGFydHNBcnJheVtpXSA9IHNjaGVkQXJyYXlbaV0uc3RhcnQoZGlyLCBzdGFydERhdGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNldFJhbmdlU3RhcnRzKGRpciwgc2NoZWRBcnJheSwgcmFuZ2VzQXJyYXksIHN0YXJ0RGF0ZSkge1xuICAgIGNvbnN0IGNvbXBhcmUgPSBjb21wYXJlRm4oZGlyKTtcbiAgICBmb3IgKGxldCBpID0gMCwgeyBsZW5ndGggfSA9IHNjaGVkQXJyYXk7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgbmV4dFN0YXJ0ID0gc2NoZWRBcnJheVtpXS5zdGFydChkaXIsIHN0YXJ0RGF0ZSk7XG4gICAgICBpZiAoIW5leHRTdGFydCkge1xuICAgICAgICByYW5nZXNBcnJheVtpXSA9IGxhdGVyLk5FVkVSO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmFuZ2VzQXJyYXlbaV0gPSBbbmV4dFN0YXJ0LCBzY2hlZEFycmF5W2ldLmVuZChkaXIsIG5leHRTdGFydCldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZVJhbmdlU3RhcnRzKGRpciwgc2NoZWRBcnJheSwgcmFuZ2VzQXJyYXksIHN0YXJ0RGF0ZSkge1xuICAgIGNvbnN0IGNvbXBhcmUgPSBjb21wYXJlRm4oZGlyKTtcbiAgICBmb3IgKGxldCBpID0gMCwgeyBsZW5ndGggfSA9IHNjaGVkQXJyYXk7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHJhbmdlc0FycmF5W2ldICYmICFjb21wYXJlKHJhbmdlc0FycmF5W2ldWzBdLCBzdGFydERhdGUpKSB7XG4gICAgICAgIGNvbnN0IG5leHRTdGFydCA9IHNjaGVkQXJyYXlbaV0uc3RhcnQoZGlyLCBzdGFydERhdGUpO1xuICAgICAgICBpZiAoIW5leHRTdGFydCkge1xuICAgICAgICAgIHJhbmdlc0FycmF5W2ldID0gbGF0ZXIuTkVWRVI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmFuZ2VzQXJyYXlbaV0gPSBbbmV4dFN0YXJ0LCBzY2hlZEFycmF5W2ldLmVuZChkaXIsIG5leHRTdGFydCldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdGlja1N0YXJ0cyhkaXIsIHNjaGVkQXJyYXksIHN0YXJ0c0FycmF5LCBzdGFydERhdGUpIHtcbiAgICBmb3IgKGxldCBpID0gMCwgeyBsZW5ndGggfSA9IHNjaGVkQXJyYXk7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHN0YXJ0c0FycmF5W2ldICYmIHN0YXJ0c0FycmF5W2ldLmdldFRpbWUoKSA9PT0gc3RhcnREYXRlLmdldFRpbWUoKSkge1xuICAgICAgICBzdGFydHNBcnJheVtpXSA9IHNjaGVkQXJyYXlbaV0uc3RhcnQoXG4gICAgICAgICAgZGlyLFxuICAgICAgICAgIHNjaGVkQXJyYXlbaV0udGljayhkaXIsIHN0YXJ0RGF0ZSlcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBnZXRTdGFydChzY2hlZEFycmF5LCBzdGFydHNBcnJheSwgc3RhcnREYXRlLCBtaW5FbmREYXRlKSB7XG4gICAgbGV0IHJlc3VsdDtcbiAgICBmb3IgKGxldCBpID0gMCwgeyBsZW5ndGggfSA9IHN0YXJ0c0FycmF5OyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChzdGFydHNBcnJheVtpXSAmJiBzdGFydHNBcnJheVtpXS5nZXRUaW1lKCkgPT09IHN0YXJ0RGF0ZS5nZXRUaW1lKCkpIHtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSBzY2hlZEFycmF5W2ldLnRpY2tTdGFydChzdGFydERhdGUpO1xuICAgICAgICBpZiAobWluRW5kRGF0ZSAmJiBzdGFydCA8IG1pbkVuZERhdGUpIHtcbiAgICAgICAgICByZXR1cm4gbWluRW5kRGF0ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcmVzdWx0IHx8IHN0YXJ0ID4gcmVzdWx0KSB7XG4gICAgICAgICAgcmVzdWx0ID0gc3RhcnQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gY2FsY1JhbmdlT3ZlcmxhcChkaXIsIHJhbmdlc0FycmF5LCBzdGFydERhdGUpIHtcbiAgICBjb25zdCBjb21wYXJlID0gY29tcGFyZUZuKGRpcik7XG4gICAgbGV0IHJlc3VsdDtcbiAgICBmb3IgKGxldCBpID0gMCwgeyBsZW5ndGggfSA9IHJhbmdlc0FycmF5OyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHJhbmdlID0gcmFuZ2VzQXJyYXlbaV07XG4gICAgICBpZiAoXG4gICAgICAgIHJhbmdlICYmXG4gICAgICAgICFjb21wYXJlKHJhbmdlWzBdLCBzdGFydERhdGUpICYmXG4gICAgICAgICghcmFuZ2VbMV0gfHwgY29tcGFyZShyYW5nZVsxXSwgc3RhcnREYXRlKSlcbiAgICAgICkge1xuICAgICAgICBpZiAoIXJlc3VsdCB8fCBjb21wYXJlKHJhbmdlWzFdLCByZXN1bHQpKSB7XG4gICAgICAgICAgcmVzdWx0ID0gcmFuZ2VbMV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gY2FsY01heEVuZERhdGUoZXhjZXB0c0FycmF5LCBjb21wYXJlKSB7XG4gICAgbGV0IHJlc3VsdDtcbiAgICBmb3IgKGxldCBpID0gMCwgeyBsZW5ndGggfSA9IGV4Y2VwdHNBcnJheTsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoZXhjZXB0c0FycmF5W2ldICYmICghcmVzdWx0IHx8IGNvbXBhcmUocmVzdWx0LCBleGNlcHRzQXJyYXlbaV1bMF0pKSkge1xuICAgICAgICByZXN1bHQgPSBleGNlcHRzQXJyYXlbaV1bMF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhbGNFbmQoZGlyLCBzY2hlZEFycmF5LCBzdGFydHNBcnJheSwgc3RhcnREYXRlLCBtYXhFbmREYXRlKSB7XG4gICAgY29uc3QgY29tcGFyZSA9IGNvbXBhcmVGbihkaXIpO1xuICAgIGxldCByZXN1bHQ7XG4gICAgZm9yIChsZXQgaSA9IDAsIHsgbGVuZ3RoIH0gPSBzY2hlZEFycmF5OyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHN0YXJ0ID0gc3RhcnRzQXJyYXlbaV07XG4gICAgICBpZiAoc3RhcnQgJiYgc3RhcnQuZ2V0VGltZSgpID09PSBzdGFydERhdGUuZ2V0VGltZSgpKSB7XG4gICAgICAgIGNvbnN0IGVuZCA9IHNjaGVkQXJyYXlbaV0uZW5kKGRpciwgc3RhcnQpO1xuICAgICAgICBpZiAobWF4RW5kRGF0ZSAmJiAoIWVuZCB8fCBjb21wYXJlKGVuZCwgbWF4RW5kRGF0ZSkpKSB7XG4gICAgICAgICAgcmV0dXJuIG1heEVuZERhdGU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXJlc3VsdCB8fCBjb21wYXJlKGVuZCwgcmVzdWx0KSkge1xuICAgICAgICAgIHJlc3VsdCA9IGVuZDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBjb21wYXJlRm4oZGlyKSB7XG4gICAgcmV0dXJuIGRpciA9PT0gJ25leHQnXG4gICAgICA/IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgaWYgKCFhIHx8ICFiKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICByZXR1cm4gYS5nZXRUaW1lKCkgPiBiLmdldFRpbWUoKTtcbiAgICAgICAgfVxuICAgICAgOiBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgIGlmICghYSB8fCAhYikgcmV0dXJuIHRydWU7XG4gICAgICAgICAgcmV0dXJuIGIuZ2V0VGltZSgpID4gYS5nZXRUaW1lKCk7XG4gICAgICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBmaW5kTmV4dChhcnJheSwgY29tcGFyZSkge1xuICAgIGxldCBuZXh0ID0gYXJyYXlbMF07XG4gICAgZm9yIChsZXQgaSA9IDEsIHsgbGVuZ3RoIH0gPSBhcnJheTsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoYXJyYXlbaV0gJiYgY29tcGFyZShuZXh0LCBhcnJheVtpXSkpIHtcbiAgICAgICAgbmV4dCA9IGFycmF5W2ldO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBuZXh0O1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBpc1ZhbGlkKGQpIHtcbiAgICAgIHJldHVybiBnZXRJbnN0YW5jZXMoJ25leHQnLCAxLCBkLCBkKSAhPT0gbGF0ZXIuTkVWRVI7XG4gICAgfSxcbiAgICBuZXh0KGNvdW50LCBzdGFydERhdGUsIGVuZERhdGUpIHtcbiAgICAgIHJldHVybiBnZXRJbnN0YW5jZXMoJ25leHQnLCBjb3VudCB8fCAxLCBzdGFydERhdGUsIGVuZERhdGUpO1xuICAgIH0sXG4gICAgcHJldihjb3VudCwgc3RhcnREYXRlLCBlbmREYXRlKSB7XG4gICAgICByZXR1cm4gZ2V0SW5zdGFuY2VzKCdwcmV2JywgY291bnQgfHwgMSwgc3RhcnREYXRlLCBlbmREYXRlKTtcbiAgICB9LFxuICAgIG5leHRSYW5nZShjb3VudCwgc3RhcnREYXRlLCBlbmREYXRlKSB7XG4gICAgICByZXR1cm4gZ2V0SW5zdGFuY2VzKCduZXh0JywgY291bnQgfHwgMSwgc3RhcnREYXRlLCBlbmREYXRlLCB0cnVlKTtcbiAgICB9LFxuICAgIHByZXZSYW5nZShjb3VudCwgc3RhcnREYXRlLCBlbmREYXRlKSB7XG4gICAgICByZXR1cm4gZ2V0SW5zdGFuY2VzKCdwcmV2JywgY291bnQgfHwgMSwgc3RhcnREYXRlLCBlbmREYXRlLCB0cnVlKTtcbiAgICB9XG4gIH07XG59O1xuXG5sYXRlci5zZXRUaW1lb3V0ID0gZnVuY3Rpb24gKGZuLCBzY2hlZCwgdGltZXpvbmUpIHtcbiAgY29uc3QgcyA9IGxhdGVyLnNjaGVkdWxlKHNjaGVkKTtcbiAgbGV0IHQ7XG4gIGlmIChmbikge1xuICAgIHNjaGVkdWxlVGltZW91dCgpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2NoZWR1bGVUaW1lb3V0KCkge1xuICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSgpO1xuICAgIGNvbnN0IG5vdyA9IGRhdGUuZ2V0VGltZSgpO1xuXG4gICAgY29uc3QgbmV4dCA9ICgoKSA9PiB7XG4gICAgICBpZiAoIXRpbWV6b25lIHx8IFsnbG9jYWwnLCAnc3lzdGVtJ10uaW5jbHVkZXModGltZXpvbmUpKSB7XG4gICAgICAgIHJldHVybiBzLm5leHQoMiwgbm93KTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbG9jYWxPZmZzZXRNaWxsaXMgPSBkYXRlLmdldFRpbWV6b25lT2Zmc2V0KCkgKiA2ZTQ7XG4gICAgICBjb25zdCBvZmZzZXRNaWxsaXMgPSBnZXRPZmZzZXQoZGF0ZSwgdGltZXpvbmUpO1xuXG4gICAgICAvLyBTcGVjaWZpZWQgdGltZXpvbmUgaGFzIHRoZSBzYW1lIG9mZnNldCBhcyBsb2NhbCB0aW1lem9uZS5cbiAgICAgIC8vIGllLiBBbWVyaWNhL05ld19Zb3JrID0gQW1lcmljYS9OYXNzYXUgPSBHTVQtNFxuICAgICAgaWYgKG9mZnNldE1pbGxpcyA9PT0gbG9jYWxPZmZzZXRNaWxsaXMpIHtcbiAgICAgICAgcmV0dXJuIHMubmV4dCgyLCBub3cpO1xuICAgICAgfVxuXG4gICAgICAvLyBPZmZzZXRzIGRpZmZlciwgYWRqdXN0IGN1cnJlbnQgdGltZSB0byBtYXRjaCB3aGF0XG4gICAgICAvLyBpdCBzaG91bGQndmUgYmVlbiBmb3IgdGhlIHNwZWNpZmllZCB0aW1lem9uZS5cbiAgICAgIGNvbnN0IGFkanVzdGVkTm93ID0gbmV3IERhdGUobm93ICsgbG9jYWxPZmZzZXRNaWxsaXMgLSBvZmZzZXRNaWxsaXMpO1xuXG4gICAgICByZXR1cm4gKHMubmV4dCgyLCBhZGp1c3RlZE5vdykgfHwgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi8gW10pLm1hcChcbiAgICAgICAgKHNjaGVkKSA9PiB7XG4gICAgICAgICAgLy8gYWRqdXN0IHNjaGVkdWxlZCB0aW1lcyB0byBtYXRjaCB0aGVpciBpbnRlbmRlZCB0aW1lem9uZVxuICAgICAgICAgIC8vIGllLiBzY2hlZHVsZWQgPSAyMDIxLTA4LTIyVDExOjMwOjAwLjAwMC0wNDowMCA9PiBBbWVyaWNhL05ld19Zb3JrXG4gICAgICAgICAgLy8gICAgIGludGVuZGVkICA9IDIwMjEtMDgtMjJUMTE6MzA6MDAuMDAwLTA1OjAwID0+IEFtZXJpY2EvTWV4aWNvX0NpdHlcbiAgICAgICAgICByZXR1cm4gbmV3IERhdGUoc2NoZWQuZ2V0VGltZSgpICsgb2Zmc2V0TWlsbGlzIC0gbG9jYWxPZmZzZXRNaWxsaXMpO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH0pKCk7XG5cbiAgICBpZiAoIW5leHRbMF0pIHtcbiAgICAgIHQgPSB1bmRlZmluZWQ7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGRpZmYgPSBuZXh0WzBdLmdldFRpbWUoKSAtIG5vdztcbiAgICBpZiAoZGlmZiA8IDFlMykge1xuICAgICAgZGlmZiA9IG5leHRbMV0gPyBuZXh0WzFdLmdldFRpbWUoKSAtIG5vdyA6IDFlMztcbiAgICB9XG5cbiAgICB0ID1cbiAgICAgIGRpZmYgPCAyMTQ3NDgzNjQ3XG4gICAgICAgID8gc2V0VGltZW91dChmbiwgZGlmZilcbiAgICAgICAgOiBzZXRUaW1lb3V0KHNjaGVkdWxlVGltZW91dCwgMjE0NzQ4MzY0Nyk7XG4gIH0gLy8gc2NoZWR1bGVUaW1lb3V0KClcblxuICByZXR1cm4ge1xuICAgIGlzRG9uZSgpIHtcbiAgICAgIHJldHVybiAhdDtcbiAgICB9LFxuICAgIGNsZWFyKCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHQpO1xuICAgIH1cbiAgfTtcbn07IC8vIHNldFRpbWVvdXQoKVxuXG5sYXRlci5zZXRJbnRlcnZhbCA9IGZ1bmN0aW9uIChmbiwgc2NoZWQsIHRpbWV6b25lKSB7XG4gIGlmICghZm4pIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBsZXQgdCA9IGxhdGVyLnNldFRpbWVvdXQoc2NoZWR1bGVUaW1lb3V0LCBzY2hlZCwgdGltZXpvbmUpO1xuICBsZXQgZG9uZSA9IHQuaXNEb25lKCk7XG4gIGZ1bmN0aW9uIHNjaGVkdWxlVGltZW91dCgpIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICAgIGlmICghZG9uZSkge1xuICAgICAgZm4oKTtcbiAgICAgIHQgPSBsYXRlci5zZXRUaW1lb3V0KHNjaGVkdWxlVGltZW91dCwgc2NoZWQsIHRpbWV6b25lKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGlzRG9uZSgpIHtcbiAgICAgIHJldHVybiB0LmlzRG9uZSgpO1xuICAgIH0sXG4gICAgY2xlYXIoKSB7XG4gICAgICBkb25lID0gdHJ1ZTtcbiAgICAgIHQuY2xlYXIoKTtcbiAgICB9XG4gIH07XG59OyAvLyBzZXRJbnRlcnZhbCgpXG5cbmxhdGVyLmRhdGUgPSB7fTtcbmxhdGVyLmRhdGUudGltZXpvbmUgPSBmdW5jdGlvbiAodXNlTG9jYWxUaW1lKSB7XG4gIGxhdGVyLmRhdGUuYnVpbGQgPSB1c2VMb2NhbFRpbWVcbiAgICA/IGZ1bmN0aW9uIChZLCBNLCBELCBoLCBtLCBzKSB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShZLCBNLCBELCBoLCBtLCBzKTtcbiAgICAgIH1cbiAgICA6IGZ1bmN0aW9uIChZLCBNLCBELCBoLCBtLCBzKSB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShEYXRlLlVUQyhZLCBNLCBELCBoLCBtLCBzKSk7XG4gICAgICB9O1xuXG4gIGNvbnN0IGdldCA9IHVzZUxvY2FsVGltZSA/ICdnZXQnIDogJ2dldFVUQyc7XG4gIGNvbnN0IGQgPSBEYXRlLnByb3RvdHlwZTtcbiAgbGF0ZXIuZGF0ZS5nZXRZZWFyID0gZFtnZXQgKyAnRnVsbFllYXInXTtcbiAgbGF0ZXIuZGF0ZS5nZXRNb250aCA9IGRbZ2V0ICsgJ01vbnRoJ107XG4gIGxhdGVyLmRhdGUuZ2V0RGF0ZSA9IGRbZ2V0ICsgJ0RhdGUnXTtcbiAgbGF0ZXIuZGF0ZS5nZXREYXkgPSBkW2dldCArICdEYXknXTtcbiAgbGF0ZXIuZGF0ZS5nZXRIb3VyID0gZFtnZXQgKyAnSG91cnMnXTtcbiAgbGF0ZXIuZGF0ZS5nZXRNaW4gPSBkW2dldCArICdNaW51dGVzJ107XG4gIGxhdGVyLmRhdGUuZ2V0U2VjID0gZFtnZXQgKyAnU2Vjb25kcyddO1xuICBsYXRlci5kYXRlLmlzVVRDID0gIXVzZUxvY2FsVGltZTtcbn07XG5cbmxhdGVyLmRhdGUuVVRDID0gZnVuY3Rpb24gKCkge1xuICBsYXRlci5kYXRlLnRpbWV6b25lKGZhbHNlKTtcbn07XG5cbmxhdGVyLmRhdGUubG9jYWxUaW1lID0gZnVuY3Rpb24gKCkge1xuICBsYXRlci5kYXRlLnRpbWV6b25lKHRydWUpO1xufTtcblxubGF0ZXIuZGF0ZS5VVEMoKTtcbmxhdGVyLlNFQyA9IDFlMztcbmxhdGVyLk1JTiA9IGxhdGVyLlNFQyAqIDYwO1xubGF0ZXIuSE9VUiA9IGxhdGVyLk1JTiAqIDYwO1xubGF0ZXIuREFZID0gbGF0ZXIuSE9VUiAqIDI0O1xubGF0ZXIuV0VFSyA9IGxhdGVyLkRBWSAqIDc7XG5sYXRlci5EQVlTX0lOX01PTlRIID0gWzMxLCAyOCwgMzEsIDMwLCAzMSwgMzAsIDMxLCAzMSwgMzAsIDMxLCAzMCwgMzFdO1xubGF0ZXIuTkVWRVIgPSAwO1xubGF0ZXIuZGF0ZS5uZXh0ID0gZnVuY3Rpb24gKFksIE0sIEQsIGgsIG0sIHMpIHtcbiAgcmV0dXJuIGxhdGVyLmRhdGUuYnVpbGQoXG4gICAgWSxcbiAgICBNICE9PSB1bmRlZmluZWQgPyBNIC0gMSA6IDAsXG4gICAgRCAhPT0gdW5kZWZpbmVkID8gRCA6IDEsXG4gICAgaCB8fCAwLFxuICAgIG0gfHwgMCxcbiAgICBzIHx8IDBcbiAgKTtcbn07XG5cbmxhdGVyLmRhdGUubmV4dFJvbGxvdmVyID0gZnVuY3Rpb24gKGQsIHZhbHVlLCBjb25zdHJhaW50LCBwZXJpb2QpIHtcbiAgY29uc3QgY3VyID0gY29uc3RyYWludC52YWwoZCk7XG4gIGNvbnN0IG1heCA9IGNvbnN0cmFpbnQuZXh0ZW50KGQpWzFdO1xuICByZXR1cm4gKHZhbHVlIHx8IG1heCkgPD0gY3VyIHx8IHZhbHVlID4gbWF4XG4gICAgPyBuZXcgRGF0ZShwZXJpb2QuZW5kKGQpLmdldFRpbWUoKSArIGxhdGVyLlNFQylcbiAgICA6IHBlcmlvZC5zdGFydChkKTtcbn07XG5cbmxhdGVyLmRhdGUucHJldiA9IGZ1bmN0aW9uIChZLCBNLCBELCBoLCBtLCBzKSB7XG4gIGNvbnN0IHsgbGVuZ3RoIH0gPSBhcmd1bWVudHM7XG4gIE0gPSBsZW5ndGggPCAyID8gMTEgOiBNIC0gMTtcbiAgRCA9IGxlbmd0aCA8IDMgPyBsYXRlci5ELmV4dGVudChsYXRlci5kYXRlLm5leHQoWSwgTSArIDEpKVsxXSA6IEQ7XG4gIGggPSBsZW5ndGggPCA0ID8gMjMgOiBoO1xuICBtID0gbGVuZ3RoIDwgNSA/IDU5IDogbTtcbiAgcyA9IGxlbmd0aCA8IDYgPyA1OSA6IHM7XG4gIHJldHVybiBsYXRlci5kYXRlLmJ1aWxkKFksIE0sIEQsIGgsIG0sIHMpO1xufTtcblxubGF0ZXIuZGF0ZS5wcmV2Um9sbG92ZXIgPSBmdW5jdGlvbiAoZCwgdmFsdWUsIGNvbnN0cmFpbnQsIHBlcmlvZCkge1xuICBjb25zdCBjdXIgPSBjb25zdHJhaW50LnZhbChkKTtcbiAgcmV0dXJuIHZhbHVlID49IGN1ciB8fCAhdmFsdWVcbiAgICA/IHBlcmlvZC5zdGFydChwZXJpb2QucHJldihkLCBwZXJpb2QudmFsKGQpIC0gMSkpXG4gICAgOiBwZXJpb2Quc3RhcnQoZCk7XG59O1xuXG5sYXRlci5wYXJzZSA9IHt9O1xubGF0ZXIucGFyc2UuY3JvbiA9IGZ1bmN0aW9uIChleHByLCBoYXNTZWNvbmRzKSB7XG4gIGNvbnN0IE5BTUVTID0ge1xuICAgIEpBTjogMSxcbiAgICBGRUI6IDIsXG4gICAgTUFSOiAzLFxuICAgIEFQUjogNCxcbiAgICBNQVk6IDUsXG4gICAgSlVOOiA2LFxuICAgIEpVTDogNyxcbiAgICBBVUc6IDgsXG4gICAgU0VQOiA5LFxuICAgIE9DVDogMTAsXG4gICAgTk9WOiAxMSxcbiAgICBERUM6IDEyLFxuICAgIFNVTjogMSxcbiAgICBNT046IDIsXG4gICAgVFVFOiAzLFxuICAgIFdFRDogNCxcbiAgICBUSFU6IDUsXG4gICAgRlJJOiA2LFxuICAgIFNBVDogN1xuICB9O1xuICBjb25zdCBSRVBMQUNFTUVOVFMgPSB7XG4gICAgJyogKiAqICogKiAqJzogJzAvMSAqICogKiAqIConLFxuICAgICdAWUVBUkxZJzogJzAgMCAxIDEgKicsXG4gICAgJ0BBTk5VQUxMWSc6ICcwIDAgMSAxIConLFxuICAgICdATU9OVEhMWSc6ICcwIDAgMSAqIConLFxuICAgICdAV0VFS0xZJzogJzAgMCAqICogMCcsXG4gICAgJ0BEQUlMWSc6ICcwIDAgKiAqIConLFxuICAgICdASE9VUkxZJzogJzAgKiAqICogKidcbiAgfTtcbiAgY29uc3QgRklFTERTID0ge1xuICAgIHM6IFswLCAwLCA1OV0sXG4gICAgbTogWzEsIDAsIDU5XSxcbiAgICBoOiBbMiwgMCwgMjNdLFxuICAgIEQ6IFszLCAxLCAzMV0sXG4gICAgTTogWzQsIDEsIDEyXSxcbiAgICBZOiBbNiwgMTk3MCwgMjA5OV0sXG4gICAgZDogWzUsIDEsIDcsIDFdXG4gIH07XG4gIGZ1bmN0aW9uIGdldFZhbHVlKHZhbHVlLCBvZmZzZXQsIG1heCkge1xuICAgIHJldHVybiBpc05hTih2YWx1ZSlcbiAgICAgID8gTkFNRVNbdmFsdWVdIHx8IG51bGxcbiAgICAgIDogTWF0aC5taW4oTnVtYmVyKHZhbHVlKSArIChvZmZzZXQgfHwgMCksIG1heCB8fCA5OTk5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsb25lU2NoZWR1bGUoc2NoZWQpIHtcbiAgICBjb25zdCBjbG9uZSA9IHt9O1xuICAgIGxldCBmaWVsZDtcbiAgICBmb3IgKGZpZWxkIGluIHNjaGVkKSB7XG4gICAgICBpZiAoZmllbGQgIT09ICdkYycgJiYgZmllbGQgIT09ICdkJykge1xuICAgICAgICBjbG9uZVtmaWVsZF0gPSBzY2hlZFtmaWVsZF0uc2xpY2UoMCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNsb25lO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkKHNjaGVkLCBuYW1lLCBtaW4sIG1heCwgaW5jKSB7XG4gICAgbGV0IGkgPSBtaW47XG4gICAgaWYgKCFzY2hlZFtuYW1lXSkge1xuICAgICAgc2NoZWRbbmFtZV0gPSBbXTtcbiAgICB9XG5cbiAgICB3aGlsZSAoaSA8PSBtYXgpIHtcbiAgICAgIGlmICghc2NoZWRbbmFtZV0uaW5jbHVkZXMoaSkpIHtcbiAgICAgICAgc2NoZWRbbmFtZV0ucHVzaChpKTtcbiAgICAgIH1cblxuICAgICAgaSArPSBpbmMgfHwgMTtcbiAgICB9XG5cbiAgICBzY2hlZFtuYW1lXS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICByZXR1cm4gYSAtIGI7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRIYXNoKHNjaGVkdWxlcywgY3VyU2NoZWQsIHZhbHVlLCBoYXNoKSB7XG4gICAgaWYgKFxuICAgICAgKGN1clNjaGVkLmQgJiYgIWN1clNjaGVkLmRjKSB8fFxuICAgICAgKGN1clNjaGVkLmRjICYmICFjdXJTY2hlZC5kYy5pbmNsdWRlcyhoYXNoKSlcbiAgICApIHtcbiAgICAgIHNjaGVkdWxlcy5wdXNoKGNsb25lU2NoZWR1bGUoY3VyU2NoZWQpKTtcbiAgICAgIGN1clNjaGVkID0gc2NoZWR1bGVzW3NjaGVkdWxlcy5sZW5ndGggLSAxXTtcbiAgICB9XG5cbiAgICBhZGQoY3VyU2NoZWQsICdkJywgdmFsdWUsIHZhbHVlKTtcbiAgICBhZGQoY3VyU2NoZWQsICdkYycsIGhhc2gsIGhhc2gpO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkV2Vla2RheShzLCBjdXJTY2hlZCwgdmFsdWUpIHtcbiAgICBjb25zdCBleGNlcHQxID0ge307XG4gICAgY29uc3QgZXhjZXB0MiA9IHt9O1xuICAgIGlmICh2YWx1ZSA9PT0gMSkge1xuICAgICAgYWRkKGN1clNjaGVkLCAnRCcsIDEsIDMpO1xuICAgICAgYWRkKGN1clNjaGVkLCAnZCcsIE5BTUVTLk1PTiwgTkFNRVMuRlJJKTtcbiAgICAgIGFkZChleGNlcHQxLCAnRCcsIDIsIDIpO1xuICAgICAgYWRkKGV4Y2VwdDEsICdkJywgTkFNRVMuVFVFLCBOQU1FUy5GUkkpO1xuICAgICAgYWRkKGV4Y2VwdDIsICdEJywgMywgMyk7XG4gICAgICBhZGQoZXhjZXB0MiwgJ2QnLCBOQU1FUy5UVUUsIE5BTUVTLkZSSSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFkZChjdXJTY2hlZCwgJ0QnLCB2YWx1ZSAtIDEsIHZhbHVlICsgMSk7XG4gICAgICBhZGQoY3VyU2NoZWQsICdkJywgTkFNRVMuTU9OLCBOQU1FUy5GUkkpO1xuICAgICAgYWRkKGV4Y2VwdDEsICdEJywgdmFsdWUgLSAxLCB2YWx1ZSAtIDEpO1xuICAgICAgYWRkKGV4Y2VwdDEsICdkJywgTkFNRVMuTU9OLCBOQU1FUy5USFUpO1xuICAgICAgYWRkKGV4Y2VwdDIsICdEJywgdmFsdWUgKyAxLCB2YWx1ZSArIDEpO1xuICAgICAgYWRkKGV4Y2VwdDIsICdkJywgTkFNRVMuVFVFLCBOQU1FUy5GUkkpO1xuICAgIH1cblxuICAgIHMuZXhjZXB0aW9ucy5wdXNoKGV4Y2VwdDEpO1xuICAgIHMuZXhjZXB0aW9ucy5wdXNoKGV4Y2VwdDIpO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkUmFuZ2UoaXRlbSwgY3VyU2NoZWQsIG5hbWUsIG1pbiwgbWF4LCBvZmZzZXQpIHtcbiAgICBjb25zdCBpbmNTcGxpdCA9IGl0ZW0uc3BsaXQoJy8nKTtcbiAgICBjb25zdCBpbmMgPSBOdW1iZXIoaW5jU3BsaXRbMV0pO1xuICAgIGNvbnN0IHJhbmdlID0gaW5jU3BsaXRbMF07XG4gICAgaWYgKHJhbmdlICE9PSAnKicgJiYgcmFuZ2UgIT09ICcwJykge1xuICAgICAgY29uc3QgcmFuZ2VTcGxpdCA9IHJhbmdlLnNwbGl0KCctJyk7XG4gICAgICBtaW4gPSBnZXRWYWx1ZShyYW5nZVNwbGl0WzBdLCBvZmZzZXQsIG1heCk7XG4gICAgICBtYXggPSBnZXRWYWx1ZShyYW5nZVNwbGl0WzFdLCBvZmZzZXQsIG1heCkgfHwgbWF4O1xuICAgIH1cblxuICAgIGFkZChjdXJTY2hlZCwgbmFtZSwgbWluLCBtYXgsIGluYyk7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZShpdGVtLCBzLCBuYW1lLCBtaW4sIG1heCwgb2Zmc2V0KSB7XG4gICAgbGV0IHZhbHVlO1xuICAgIGxldCBzcGxpdDtcbiAgICBjb25zdCB7IHNjaGVkdWxlcyB9ID0gcztcbiAgICBjb25zdCBjdXJTY2hlZCA9IHNjaGVkdWxlc1tzY2hlZHVsZXMubGVuZ3RoIC0gMV07XG4gICAgaWYgKGl0ZW0gPT09ICdMJykge1xuICAgICAgaXRlbSA9IG1pbiAtIDE7XG4gICAgfVxuXG4gICAgaWYgKCh2YWx1ZSA9IGdldFZhbHVlKGl0ZW0sIG9mZnNldCwgbWF4KSkgIT09IG51bGwpIHtcbiAgICAgIGFkZChjdXJTY2hlZCwgbmFtZSwgdmFsdWUsIHZhbHVlKTtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgKHZhbHVlID0gZ2V0VmFsdWUoaXRlbS5yZXBsYWNlKCdXJywgJycpLCBvZmZzZXQsIG1heCkpICE9PSBudWxsXG4gICAgKSB7XG4gICAgICBhZGRXZWVrZGF5KHMsIGN1clNjaGVkLCB2YWx1ZSk7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgICh2YWx1ZSA9IGdldFZhbHVlKGl0ZW0ucmVwbGFjZSgnTCcsICcnKSwgb2Zmc2V0LCBtYXgpKSAhPT0gbnVsbFxuICAgICkge1xuICAgICAgYWRkSGFzaChzY2hlZHVsZXMsIGN1clNjaGVkLCB2YWx1ZSwgbWluIC0gMSk7XG4gICAgfSBlbHNlIGlmICgoc3BsaXQgPSBpdGVtLnNwbGl0KCcjJykpLmxlbmd0aCA9PT0gMikge1xuICAgICAgdmFsdWUgPSBnZXRWYWx1ZShzcGxpdFswXSwgb2Zmc2V0LCBtYXgpO1xuICAgICAgYWRkSGFzaChzY2hlZHVsZXMsIGN1clNjaGVkLCB2YWx1ZSwgZ2V0VmFsdWUoc3BsaXRbMV0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWRkUmFuZ2UoaXRlbSwgY3VyU2NoZWQsIG5hbWUsIG1pbiwgbWF4LCBvZmZzZXQpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGlzSGFzaChpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0uaW5jbHVkZXMoJyMnKSB8fCBpdGVtLmluZGV4T2YoJ0wnKSA+IDA7XG4gIH1cblxuICBmdW5jdGlvbiBpdGVtU29ydGVyKGEsIGIpIHtcbiAgICByZXR1cm4gaXNIYXNoKGEpICYmICFpc0hhc2goYikgPyAxIDogYSAtIGI7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZUV4cHIoZXhwcikge1xuICAgIGNvbnN0IHNjaGVkdWxlID0ge1xuICAgICAgc2NoZWR1bGVzOiBbe31dLFxuICAgICAgZXhjZXB0aW9uczogW11cbiAgICB9O1xuICAgIGNvbnN0IGNvbXBvbmVudHMgPSBleHByLnJlcGxhY2UoLyhcXHMpKy9nLCAnICcpLnNwbGl0KCcgJyk7XG4gICAgbGV0IGZpZWxkO1xuICAgIGxldCBmO1xuICAgIGxldCBjb21wb25lbnQ7XG4gICAgbGV0IGl0ZW1zO1xuICAgIGZvciAoZmllbGQgaW4gRklFTERTKSB7XG4gICAgICBmID0gRklFTERTW2ZpZWxkXTtcbiAgICAgIGNvbXBvbmVudCA9IGNvbXBvbmVudHNbZlswXV07XG4gICAgICBpZiAoY29tcG9uZW50ICYmIGNvbXBvbmVudCAhPT0gJyonICYmIGNvbXBvbmVudCAhPT0gJz8nKSB7XG4gICAgICAgIGl0ZW1zID0gY29tcG9uZW50LnNwbGl0KCcsJykuc29ydChpdGVtU29ydGVyKTtcbiAgICAgICAgdmFyIGk7XG4gICAgICAgIGNvbnN0IHsgbGVuZ3RoIH0gPSBpdGVtcztcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgcGFyc2UoaXRlbXNbaV0sIHNjaGVkdWxlLCBmaWVsZCwgZlsxXSwgZlsyXSwgZlszXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc2NoZWR1bGU7XG4gIH1cblxuICBmdW5jdGlvbiBwcmVwYXJlRXhwcihleHByKSB7XG4gICAgY29uc3QgcHJlcGFyZWQgPSBleHByLnRvVXBwZXJDYXNlKCk7XG4gICAgcmV0dXJuIFJFUExBQ0VNRU5UU1twcmVwYXJlZF0gfHwgcHJlcGFyZWQ7XG4gIH1cblxuICBjb25zdCBlID0gcHJlcGFyZUV4cHIoZXhwcik7XG4gIHJldHVybiBwYXJzZUV4cHIoaGFzU2Vjb25kcyA/IGUgOiAnMCAnICsgZSk7XG59O1xuXG5sYXRlci5wYXJzZS5yZWN1ciA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc3Qgc2NoZWR1bGVzID0gW107XG4gIGNvbnN0IGV4Y2VwdGlvbnMgPSBbXTtcbiAgbGV0IGN1cjtcbiAgbGV0IGN1ckFycmF5ID0gc2NoZWR1bGVzO1xuICBsZXQgY3VyTmFtZTtcbiAgbGV0IHZhbHVlcztcbiAgbGV0IGV2ZXJ5O1xuICBsZXQgbW9kaWZpZXI7XG4gIGxldCBhcHBseU1pbjtcbiAgbGV0IGFwcGx5TWF4O1xuICBsZXQgaTtcbiAgbGV0IGxhc3Q7XG4gIGZ1bmN0aW9uIGFkZChuYW1lLCBtaW4sIG1heCkge1xuICAgIG5hbWUgPSBtb2RpZmllciA/IG5hbWUgKyAnXycgKyBtb2RpZmllciA6IG5hbWU7XG4gICAgaWYgKCFjdXIpIHtcbiAgICAgIGN1ckFycmF5LnB1c2goe30pO1xuICAgICAgY3VyID0gY3VyQXJyYXlbMF07XG4gICAgfVxuXG4gICAgaWYgKCFjdXJbbmFtZV0pIHtcbiAgICAgIGN1cltuYW1lXSA9IFtdO1xuICAgIH1cblxuICAgIGN1ck5hbWUgPSBjdXJbbmFtZV07XG4gICAgaWYgKGV2ZXJ5KSB7XG4gICAgICB2YWx1ZXMgPSBbXTtcbiAgICAgIGZvciAoaSA9IG1pbjsgaSA8PSBtYXg7IGkgKz0gZXZlcnkpIHtcbiAgICAgICAgdmFsdWVzLnB1c2goaSk7XG4gICAgICB9XG5cbiAgICAgIGxhc3QgPSB7XG4gICAgICAgIG46IG5hbWUsXG4gICAgICAgIHg6IGV2ZXJ5LFxuICAgICAgICBjOiBjdXJOYW1lLmxlbmd0aCxcbiAgICAgICAgbTogbWF4XG4gICAgICB9O1xuICAgIH1cblxuICAgIHZhbHVlcyA9IGFwcGx5TWluID8gW21pbl0gOiBhcHBseU1heCA/IFttYXhdIDogdmFsdWVzO1xuICAgIGNvbnN0IHsgbGVuZ3RoIH0gPSB2YWx1ZXM7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHZhbHVlc1tpXTtcbiAgICAgIGlmICghY3VyTmFtZS5pbmNsdWRlcyh2YWx1ZSkpIHtcbiAgICAgICAgY3VyTmFtZS5wdXNoKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YWx1ZXMgPSBldmVyeSA9IG1vZGlmaWVyID0gYXBwbHlNaW4gPSBhcHBseU1heCA9IDA7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHNjaGVkdWxlcyxcbiAgICBleGNlcHRpb25zLFxuICAgIG9uKCkge1xuICAgICAgdmFsdWVzID0gQXJyYXkuaXNBcnJheShhcmd1bWVudHNbMF0pID8gYXJndW1lbnRzWzBdIDogYXJndW1lbnRzO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBldmVyeSh4KSB7XG4gICAgICBldmVyeSA9IHggfHwgMTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgYWZ0ZXIoeCkge1xuICAgICAgbW9kaWZpZXIgPSAnYSc7XG4gICAgICB2YWx1ZXMgPSBbeF07XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGJlZm9yZSh4KSB7XG4gICAgICBtb2RpZmllciA9ICdiJztcbiAgICAgIHZhbHVlcyA9IFt4XTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgZmlyc3QoKSB7XG4gICAgICBhcHBseU1pbiA9IDE7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGxhc3QoKSB7XG4gICAgICBhcHBseU1heCA9IDE7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIHRpbWUoKSB7XG4gICAgICBmb3IgKGxldCBpID0gMCwgeyBsZW5ndGggfSA9IHZhbHVlczsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHNwbGl0ID0gdmFsdWVzW2ldLnNwbGl0KCc6Jyk7XG4gICAgICAgIGlmIChzcGxpdC5sZW5ndGggPCAzKSBzcGxpdC5wdXNoKDApO1xuICAgICAgICB2YWx1ZXNbaV0gPVxuICAgICAgICAgIE51bWJlcihzcGxpdFswXSkgKiAzNjAwICsgTnVtYmVyKHNwbGl0WzFdKSAqIDYwICsgTnVtYmVyKHNwbGl0WzJdKTtcbiAgICAgIH1cblxuICAgICAgYWRkKCd0Jyk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIHNlY29uZCgpIHtcbiAgICAgIGFkZCgncycsIDAsIDU5KTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgbWludXRlKCkge1xuICAgICAgYWRkKCdtJywgMCwgNTkpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBob3VyKCkge1xuICAgICAgYWRkKCdoJywgMCwgMjMpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBkYXlPZk1vbnRoKCkge1xuICAgICAgYWRkKCdEJywgMSwgYXBwbHlNYXggPyAwIDogMzEpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBkYXlPZldlZWsoKSB7XG4gICAgICBhZGQoJ2QnLCAxLCA3KTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgb25XZWVrZW5kKCkge1xuICAgICAgdmFsdWVzID0gWzEsIDddO1xuICAgICAgcmV0dXJuIHRoaXMuZGF5T2ZXZWVrKCk7XG4gICAgfSxcbiAgICBvbldlZWtkYXkoKSB7XG4gICAgICB2YWx1ZXMgPSBbMiwgMywgNCwgNSwgNl07XG4gICAgICByZXR1cm4gdGhpcy5kYXlPZldlZWsoKTtcbiAgICB9LFxuICAgIGRheU9mV2Vla0NvdW50KCkge1xuICAgICAgYWRkKCdkYycsIDEsIGFwcGx5TWF4ID8gMCA6IDUpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBkYXlPZlllYXIoKSB7XG4gICAgICBhZGQoJ2R5JywgMSwgYXBwbHlNYXggPyAwIDogMzY2KTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgd2Vla09mTW9udGgoKSB7XG4gICAgICBhZGQoJ3dtJywgMSwgYXBwbHlNYXggPyAwIDogNSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIHdlZWtPZlllYXIoKSB7XG4gICAgICBhZGQoJ3d5JywgMSwgYXBwbHlNYXggPyAwIDogNTMpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBtb250aCgpIHtcbiAgICAgIGFkZCgnTScsIDEsIDEyKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgeWVhcigpIHtcbiAgICAgIGFkZCgnWScsIDE5NzAsIDI0NTApO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBmdWxsRGF0ZSgpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwLCB7IGxlbmd0aCB9ID0gdmFsdWVzOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFsdWVzW2ldID0gdmFsdWVzW2ldLmdldFRpbWUoKTtcbiAgICAgIH1cblxuICAgICAgYWRkKCdmZCcpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBjdXN0b21Nb2RpZmllcihpZCwgdmFscykge1xuICAgICAgY29uc3QgY3VzdG9tID0gbGF0ZXIubW9kaWZpZXJbaWRdO1xuICAgICAgaWYgKCFjdXN0b20pXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ3VzdG9tIG1vZGlmaWVyICcgKyBpZCArICcgbm90IHJlY29nbml6ZWQhJyk7XG4gICAgICBtb2RpZmllciA9IGlkO1xuICAgICAgdmFsdWVzID0gQXJyYXkuaXNBcnJheShhcmd1bWVudHNbMV0pID8gYXJndW1lbnRzWzFdIDogW2FyZ3VtZW50c1sxXV07XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGN1c3RvbVBlcmlvZChpZCkge1xuICAgICAgY29uc3QgY3VzdG9tID0gbGF0ZXJbaWRdO1xuICAgICAgaWYgKCFjdXN0b20pXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ3VzdG9tIHRpbWUgcGVyaW9kICcgKyBpZCArICcgbm90IHJlY29nbml6ZWQhJyk7XG4gICAgICBhZGQoaWQsIGN1c3RvbS5leHRlbnQobmV3IERhdGUoKSlbMF0sIGN1c3RvbS5leHRlbnQobmV3IERhdGUoKSlbMV0pO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBzdGFydGluZ09uKHN0YXJ0KSB7XG4gICAgICByZXR1cm4gdGhpcy5iZXR3ZWVuKHN0YXJ0LCBsYXN0Lm0pO1xuICAgIH0sXG4gICAgYmV0d2VlbihzdGFydCwgZW5kKSB7XG4gICAgICBjdXJbbGFzdC5uXSA9IGN1cltsYXN0Lm5dLnNwbGljZSgwLCBsYXN0LmMpO1xuICAgICAgZXZlcnkgPSBsYXN0Lng7XG4gICAgICBhZGQobGFzdC5uLCBzdGFydCwgZW5kKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgYW5kKCkge1xuICAgICAgY3VyID0gY3VyQXJyYXlbY3VyQXJyYXkucHVzaCh7fSkgLSAxXTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgZXhjZXB0KCkge1xuICAgICAgY3VyQXJyYXkgPSBleGNlcHRpb25zO1xuICAgICAgY3VyID0gbnVsbDtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfTtcbn07XG5cbmxhdGVyLnBhcnNlLnRleHQgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gIGNvbnN0IHsgcmVjdXIgfSA9IGxhdGVyLnBhcnNlO1xuICBsZXQgcG9zID0gMDtcbiAgbGV0IGlucHV0ID0gJyc7XG4gIGxldCBlcnJvcjtcbiAgY29uc3QgVE9LRU5UWVBFUyA9IHtcbiAgICBlb2Y6IC9eJC8sXG4gICAgcmFuazogL14oKFxcZCspKHN0fG5kfHJkfHRoKT8pXFxiLyxcbiAgICB0aW1lOiAvXigoKDA/WzEtOV18MVswLTJdKTpbMC01XVxcZChcXHMpPyhhbXxwbSkpfCgoMD9cXGR8MVxcZHwyWzAtM10pOlswLTVdXFxkKSlcXGIvLFxuICAgIGRheU5hbWU6IC9eKChzdW58bW9ufHR1ZShzKT98d2VkKG5lcyk/fHRodShyKHMpPyk/fGZyaXxzYXQodXIpPykoZGF5KT8pXFxiLyxcbiAgICBtb250aE5hbWU6IC9eKGphbih1YXJ5KT98ZmViKHJ1YXJ5KT98bWEoKHIoY2gpPyk/fHkpfGFwcihpbCk/fGp1KGx5fG5lKXxhdWcodXN0KT98b2N0KG9iZXIpP3woc2VwdHxub3Z8ZGVjKShlbWJlcik/KVxcYi8sXG4gICAgeWVhckluZGV4OiAvXihcXGR7NH0pXFxiLyxcbiAgICBldmVyeTogL15ldmVyeVxcYi8sXG4gICAgYWZ0ZXI6IC9eYWZ0ZXJcXGIvLFxuICAgIGJlZm9yZTogL15iZWZvcmVcXGIvLFxuICAgIHNlY29uZDogL14oc3xzZWMob25kKT8ocyk/KVxcYi8sXG4gICAgbWludXRlOiAvXihtfG1pbih1dGUpPyhzKT8pXFxiLyxcbiAgICBob3VyOiAvXihofGhvdXIocyk/KVxcYi8sXG4gICAgZGF5OiAvXihkYXkocyk/KCBvZiB0aGUgbW9udGgpPylcXGIvLFxuICAgIGRheUluc3RhbmNlOiAvXmRheSBpbnN0YW5jZVxcYi8sXG4gICAgZGF5T2ZXZWVrOiAvXmRheShzKT8gb2YgdGhlIHdlZWtcXGIvLFxuICAgIGRheU9mWWVhcjogL15kYXkocyk/IG9mIHRoZSB5ZWFyXFxiLyxcbiAgICB3ZWVrT2ZZZWFyOiAvXndlZWsocyk/KCBvZiB0aGUgeWVhcik/XFxiLyxcbiAgICB3ZWVrT2ZNb250aDogL153ZWVrKHMpPyBvZiB0aGUgbW9udGhcXGIvLFxuICAgIHdlZWtkYXk6IC9ed2Vla2RheVxcYi8sXG4gICAgd2Vla2VuZDogL153ZWVrZW5kXFxiLyxcbiAgICBtb250aDogL15tb250aChzKT9cXGIvLFxuICAgIHllYXI6IC9eeWVhcihzKT9cXGIvLFxuICAgIGJldHdlZW46IC9eYmV0d2VlbiAodGhlKT9cXGIvLFxuICAgIHN0YXJ0OiAvXihzdGFydChpbmcpPyAoYXR8b24oIHRoZSk/KT8pXFxiLyxcbiAgICBhdDogL14oYXR8QClcXGIvLFxuICAgIGFuZDogL14oLHxhbmRcXGIpLyxcbiAgICBleGNlcHQ6IC9eKGV4Y2VwdFxcYikvLFxuICAgIGFsc286IC8oYWxzbylcXGIvLFxuICAgIGZpcnN0OiAvXihmaXJzdClcXGIvLFxuICAgIGxhc3Q6IC9ebGFzdFxcYi8sXG4gICAgaW46IC9eaW5cXGIvLFxuICAgIG9mOiAvXm9mXFxiLyxcbiAgICBvbnRoZTogL15vbiB0aGVcXGIvLFxuICAgIG9uOiAvXm9uXFxiLyxcbiAgICB0aHJvdWdoOiAvKC18Xih0b3x0aHJvdWdoKVxcYikvXG4gIH07XG4gIGNvbnN0IE5BTUVTID0ge1xuICAgIGphbjogMSxcbiAgICBmZWI6IDIsXG4gICAgbWFyOiAzLFxuICAgIGFwcjogNCxcbiAgICBtYXk6IDUsXG4gICAganVuOiA2LFxuICAgIGp1bDogNyxcbiAgICBhdWc6IDgsXG4gICAgc2VwOiA5LFxuICAgIG9jdDogMTAsXG4gICAgbm92OiAxMSxcbiAgICBkZWM6IDEyLFxuICAgIHN1bjogMSxcbiAgICBtb246IDIsXG4gICAgdHVlOiAzLFxuICAgIHdlZDogNCxcbiAgICB0aHU6IDUsXG4gICAgZnJpOiA2LFxuICAgIHNhdDogNyxcbiAgICAnMXN0JzogMSxcbiAgICBmaXI6IDEsXG4gICAgJzJuZCc6IDIsXG4gICAgc2VjOiAyLFxuICAgICczcmQnOiAzLFxuICAgIHRoaTogMyxcbiAgICAnNHRoJzogNCxcbiAgICBmb3I6IDRcbiAgfTtcbiAgZnVuY3Rpb24gdChzdGFydCwgZW5kLCB0ZXh0LCB0eXBlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXJ0UG9zOiBzdGFydCxcbiAgICAgIGVuZFBvczogZW5kLFxuICAgICAgdGV4dCxcbiAgICAgIHR5cGVcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gcGVlayhleHBlY3RlZCkge1xuICAgIGNvbnN0IHNjYW5Ub2tlbnMgPSBBcnJheS5pc0FycmF5KGV4cGVjdGVkKSA/IGV4cGVjdGVkIDogW2V4cGVjdGVkXTtcbiAgICBjb25zdCB3aGl0ZVNwYWNlID0gL1xccysvO1xuICAgIGxldCB0b2tlbjtcbiAgICBsZXQgY3VySW5wdXQ7XG4gICAgbGV0IG07XG4gICAgbGV0IHNjYW5Ub2tlbjtcbiAgICBsZXQgc3RhcnQ7XG4gICAgbGV0IGxlbmd0aF87XG4gICAgc2NhblRva2Vucy5wdXNoKHdoaXRlU3BhY2UpO1xuICAgIHN0YXJ0ID0gcG9zO1xuICAgIHdoaWxlICghdG9rZW4gfHwgdG9rZW4udHlwZSA9PT0gd2hpdGVTcGFjZSkge1xuICAgICAgbGVuZ3RoXyA9IC0xO1xuICAgICAgY3VySW5wdXQgPSBpbnB1dC5zbGljZShNYXRoLm1heCgwLCBzdGFydCkpO1xuICAgICAgdG9rZW4gPSB0KHN0YXJ0LCBzdGFydCwgaW5wdXQuc3BsaXQod2hpdGVTcGFjZSlbMF0pO1xuICAgICAgdmFyIGk7XG4gICAgICBjb25zdCB7IGxlbmd0aCB9ID0gc2NhblRva2VucztcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBzY2FuVG9rZW4gPSBzY2FuVG9rZW5zW2ldO1xuICAgICAgICBtID0gc2NhblRva2VuLmV4ZWMoY3VySW5wdXQpO1xuICAgICAgICBpZiAobSAmJiBtLmluZGV4ID09PSAwICYmIG1bMF0ubGVuZ3RoID4gbGVuZ3RoXykge1xuICAgICAgICAgIGxlbmd0aF8gPSBtWzBdLmxlbmd0aDtcbiAgICAgICAgICB0b2tlbiA9IHQoXG4gICAgICAgICAgICBzdGFydCxcbiAgICAgICAgICAgIHN0YXJ0ICsgbGVuZ3RoXyxcbiAgICAgICAgICAgIGN1cklucHV0LnNsaWNlKDAsIE1hdGgubWF4KDAsIGxlbmd0aF8pKSxcbiAgICAgICAgICAgIHNjYW5Ub2tlblxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHRva2VuLnR5cGUgPT09IHdoaXRlU3BhY2UpIHtcbiAgICAgICAgc3RhcnQgPSB0b2tlbi5lbmRQb3M7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRva2VuO1xuICB9XG5cbiAgZnVuY3Rpb24gc2NhbihleHBlY3RlZFRva2VuKSB7XG4gICAgY29uc3QgdG9rZW4gPSBwZWVrKGV4cGVjdGVkVG9rZW4pO1xuICAgIHBvcyA9IHRva2VuLmVuZFBvcztcbiAgICByZXR1cm4gdG9rZW47XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZVRocm91Z2hFeHByKHRva2VuVHlwZSkge1xuICAgIGNvbnN0IHN0YXJ0ID0gTnVtYmVyKHBhcnNlVG9rZW5WYWx1ZSh0b2tlblR5cGUpKTtcbiAgICBjb25zdCBlbmQgPSBjaGVja0FuZFBhcnNlKFRPS0VOVFlQRVMudGhyb3VnaClcbiAgICAgID8gTnVtYmVyKHBhcnNlVG9rZW5WYWx1ZSh0b2tlblR5cGUpKVxuICAgICAgOiBzdGFydDtcbiAgICBjb25zdCBudW1zID0gW107XG4gICAgZm9yIChsZXQgaSA9IHN0YXJ0OyBpIDw9IGVuZDsgaSsrKSB7XG4gICAgICBudW1zLnB1c2goaSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bXM7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZVJhbmdlcyh0b2tlblR5cGUpIHtcbiAgICBsZXQgbnVtcyA9IHBhcnNlVGhyb3VnaEV4cHIodG9rZW5UeXBlKTtcbiAgICB3aGlsZSAoY2hlY2tBbmRQYXJzZShUT0tFTlRZUEVTLmFuZCkpIHtcbiAgICAgIG51bXMgPSBudW1zLmNvbmNhdChwYXJzZVRocm91Z2hFeHByKHRva2VuVHlwZSkpO1xuICAgIH1cblxuICAgIHJldHVybiBudW1zO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VFdmVyeShyKSB7XG4gICAgbGV0IG51bWJlcjtcbiAgICBsZXQgcGVyaW9kO1xuICAgIGxldCBzdGFydDtcbiAgICBsZXQgZW5kO1xuICAgIGlmIChjaGVja0FuZFBhcnNlKFRPS0VOVFlQRVMud2Vla2VuZCkpIHtcbiAgICAgIHIub24oTkFNRVMuc3VuLCBOQU1FUy5zYXQpLmRheU9mV2VlaygpO1xuICAgIH0gZWxzZSBpZiAoY2hlY2tBbmRQYXJzZShUT0tFTlRZUEVTLndlZWtkYXkpKSB7XG4gICAgICByLm9uKE5BTUVTLm1vbiwgTkFNRVMudHVlLCBOQU1FUy53ZWQsIE5BTUVTLnRodSwgTkFNRVMuZnJpKS5kYXlPZldlZWsoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbnVtYmVyID0gcGFyc2VUb2tlblZhbHVlKFRPS0VOVFlQRVMucmFuayk7XG4gICAgICByLmV2ZXJ5KG51bWJlcik7XG4gICAgICBwZXJpb2QgPSBwYXJzZVRpbWVQZXJpb2Qocik7XG4gICAgICBpZiAoY2hlY2tBbmRQYXJzZShUT0tFTlRZUEVTLnN0YXJ0KSkge1xuICAgICAgICBudW1iZXIgPSBwYXJzZVRva2VuVmFsdWUoVE9LRU5UWVBFUy5yYW5rKTtcbiAgICAgICAgci5zdGFydGluZ09uKG51bWJlcik7XG4gICAgICAgIHBhcnNlVG9rZW4ocGVyaW9kLnR5cGUpO1xuICAgICAgfSBlbHNlIGlmIChjaGVja0FuZFBhcnNlKFRPS0VOVFlQRVMuYmV0d2VlbikpIHtcbiAgICAgICAgc3RhcnQgPSBwYXJzZVRva2VuVmFsdWUoVE9LRU5UWVBFUy5yYW5rKTtcbiAgICAgICAgaWYgKGNoZWNrQW5kUGFyc2UoVE9LRU5UWVBFUy5hbmQpKSB7XG4gICAgICAgICAgZW5kID0gcGFyc2VUb2tlblZhbHVlKFRPS0VOVFlQRVMucmFuayk7XG4gICAgICAgICAgci5iZXR3ZWVuKHN0YXJ0LCBlbmQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VPblRoZShyKSB7XG4gICAgaWYgKGNoZWNrQW5kUGFyc2UoVE9LRU5UWVBFUy5maXJzdCkpIHtcbiAgICAgIHIuZmlyc3QoKTtcbiAgICB9IGVsc2UgaWYgKGNoZWNrQW5kUGFyc2UoVE9LRU5UWVBFUy5sYXN0KSkge1xuICAgICAgci5sYXN0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHIub24ocGFyc2VSYW5nZXMoVE9LRU5UWVBFUy5yYW5rKSk7XG4gICAgfVxuXG4gICAgcGFyc2VUaW1lUGVyaW9kKHIpO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VTY2hlZHVsZUV4cHIoc3RyaW5nXykge1xuICAgIHBvcyA9IDA7XG4gICAgaW5wdXQgPSBzdHJpbmdfO1xuICAgIGVycm9yID0gLTE7XG4gICAgY29uc3QgciA9IHJlY3VyKCk7XG4gICAgd2hpbGUgKHBvcyA8IGlucHV0Lmxlbmd0aCAmJiBlcnJvciA8IDApIHtcbiAgICAgIGNvbnN0IHRva2VuID0gcGFyc2VUb2tlbihbXG4gICAgICAgIFRPS0VOVFlQRVMuZXZlcnksXG4gICAgICAgIFRPS0VOVFlQRVMuYWZ0ZXIsXG4gICAgICAgIFRPS0VOVFlQRVMuYmVmb3JlLFxuICAgICAgICBUT0tFTlRZUEVTLm9udGhlLFxuICAgICAgICBUT0tFTlRZUEVTLm9uLFxuICAgICAgICBUT0tFTlRZUEVTLm9mLFxuICAgICAgICBUT0tFTlRZUEVTLmluLFxuICAgICAgICBUT0tFTlRZUEVTLmF0LFxuICAgICAgICBUT0tFTlRZUEVTLmFuZCxcbiAgICAgICAgVE9LRU5UWVBFUy5leGNlcHQsXG4gICAgICAgIFRPS0VOVFlQRVMuYWxzb1xuICAgICAgXSk7XG4gICAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgICAgY2FzZSBUT0tFTlRZUEVTLmV2ZXJ5OlxuICAgICAgICAgIHBhcnNlRXZlcnkocik7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBUT0tFTlRZUEVTLmFmdGVyOlxuICAgICAgICAgIGlmIChwZWVrKFRPS0VOVFlQRVMudGltZSkudHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByLmFmdGVyKHBhcnNlVG9rZW5WYWx1ZShUT0tFTlRZUEVTLnRpbWUpKTtcbiAgICAgICAgICAgIHIudGltZSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByLmFmdGVyKHBhcnNlVG9rZW5WYWx1ZShUT0tFTlRZUEVTLnJhbmspKTtcbiAgICAgICAgICAgIHBhcnNlVGltZVBlcmlvZChyKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIFRPS0VOVFlQRVMuYmVmb3JlOlxuICAgICAgICAgIGlmIChwZWVrKFRPS0VOVFlQRVMudGltZSkudHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByLmJlZm9yZShwYXJzZVRva2VuVmFsdWUoVE9LRU5UWVBFUy50aW1lKSk7XG4gICAgICAgICAgICByLnRpbWUoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgci5iZWZvcmUocGFyc2VUb2tlblZhbHVlKFRPS0VOVFlQRVMucmFuaykpO1xuICAgICAgICAgICAgcGFyc2VUaW1lUGVyaW9kKHIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgVE9LRU5UWVBFUy5vbnRoZTpcbiAgICAgICAgICBwYXJzZU9uVGhlKHIpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgVE9LRU5UWVBFUy5vbjpcbiAgICAgICAgICByLm9uKHBhcnNlUmFuZ2VzKFRPS0VOVFlQRVMuZGF5TmFtZSkpLmRheU9mV2VlaygpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgVE9LRU5UWVBFUy5vZjpcbiAgICAgICAgICByLm9uKHBhcnNlUmFuZ2VzKFRPS0VOVFlQRVMubW9udGhOYW1lKSkubW9udGgoKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIFRPS0VOVFlQRVMuaW46XG4gICAgICAgICAgci5vbihwYXJzZVJhbmdlcyhUT0tFTlRZUEVTLnllYXJJbmRleCkpLnllYXIoKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIFRPS0VOVFlQRVMuYXQ6XG4gICAgICAgICAgci5vbihwYXJzZVRva2VuVmFsdWUoVE9LRU5UWVBFUy50aW1lKSkudGltZSgpO1xuICAgICAgICAgIHdoaWxlIChjaGVja0FuZFBhcnNlKFRPS0VOVFlQRVMuYW5kKSkge1xuICAgICAgICAgICAgci5vbihwYXJzZVRva2VuVmFsdWUoVE9LRU5UWVBFUy50aW1lKSkudGltZSgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgVE9LRU5UWVBFUy5hbmQ6XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBUT0tFTlRZUEVTLmFsc286XG4gICAgICAgICAgci5hbmQoKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIFRPS0VOVFlQRVMuZXhjZXB0OlxuICAgICAgICAgIHIuZXhjZXB0KCk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBlcnJvciA9IHBvcztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgc2NoZWR1bGVzOiByLnNjaGVkdWxlcyxcbiAgICAgIGV4Y2VwdGlvbnM6IHIuZXhjZXB0aW9ucyxcbiAgICAgIGVycm9yXG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlVGltZVBlcmlvZChyKSB7XG4gICAgY29uc3QgdGltZVBlcmlvZCA9IHBhcnNlVG9rZW4oW1xuICAgICAgVE9LRU5UWVBFUy5zZWNvbmQsXG4gICAgICBUT0tFTlRZUEVTLm1pbnV0ZSxcbiAgICAgIFRPS0VOVFlQRVMuaG91cixcbiAgICAgIFRPS0VOVFlQRVMuZGF5T2ZZZWFyLFxuICAgICAgVE9LRU5UWVBFUy5kYXlPZldlZWssXG4gICAgICBUT0tFTlRZUEVTLmRheUluc3RhbmNlLFxuICAgICAgVE9LRU5UWVBFUy5kYXksXG4gICAgICBUT0tFTlRZUEVTLm1vbnRoLFxuICAgICAgVE9LRU5UWVBFUy55ZWFyLFxuICAgICAgVE9LRU5UWVBFUy53ZWVrT2ZNb250aCxcbiAgICAgIFRPS0VOVFlQRVMud2Vla09mWWVhclxuICAgIF0pO1xuICAgIHN3aXRjaCAodGltZVBlcmlvZC50eXBlKSB7XG4gICAgICBjYXNlIFRPS0VOVFlQRVMuc2Vjb25kOlxuICAgICAgICByLnNlY29uZCgpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBUT0tFTlRZUEVTLm1pbnV0ZTpcbiAgICAgICAgci5taW51dGUoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgVE9LRU5UWVBFUy5ob3VyOlxuICAgICAgICByLmhvdXIoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgVE9LRU5UWVBFUy5kYXlPZlllYXI6XG4gICAgICAgIHIuZGF5T2ZZZWFyKCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFRPS0VOVFlQRVMuZGF5T2ZXZWVrOlxuICAgICAgICByLmRheU9mV2VlaygpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBUT0tFTlRZUEVTLmRheUluc3RhbmNlOlxuICAgICAgICByLmRheU9mV2Vla0NvdW50KCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFRPS0VOVFlQRVMuZGF5OlxuICAgICAgICByLmRheU9mTW9udGgoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgVE9LRU5UWVBFUy53ZWVrT2ZNb250aDpcbiAgICAgICAgci53ZWVrT2ZNb250aCgpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBUT0tFTlRZUEVTLndlZWtPZlllYXI6XG4gICAgICAgIHIud2Vla09mWWVhcigpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBUT0tFTlRZUEVTLm1vbnRoOlxuICAgICAgICByLm1vbnRoKCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFRPS0VOVFlQRVMueWVhcjpcbiAgICAgICAgci55ZWFyKCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBlcnJvciA9IHBvcztcbiAgICB9XG5cbiAgICByZXR1cm4gdGltZVBlcmlvZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNoZWNrQW5kUGFyc2UodG9rZW5UeXBlKSB7XG4gICAgY29uc3QgZm91bmQgPSBwZWVrKHRva2VuVHlwZSkudHlwZSA9PT0gdG9rZW5UeXBlO1xuICAgIGlmIChmb3VuZCkge1xuICAgICAgc2Nhbih0b2tlblR5cGUpO1xuICAgIH1cblxuICAgIHJldHVybiBmb3VuZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlVG9rZW4odG9rZW5UeXBlKSB7XG4gICAgY29uc3QgdCA9IHNjYW4odG9rZW5UeXBlKTtcbiAgICBpZiAodC50eXBlKSB7XG4gICAgICB0LnRleHQgPSBjb252ZXJ0U3RyaW5nKHQudGV4dCwgdG9rZW5UeXBlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXJyb3IgPSBwb3M7XG4gICAgfVxuXG4gICAgcmV0dXJuIHQ7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZVRva2VuVmFsdWUodG9rZW5UeXBlKSB7XG4gICAgcmV0dXJuIHBhcnNlVG9rZW4odG9rZW5UeXBlKS50ZXh0O1xuICB9XG5cbiAgZnVuY3Rpb24gY29udmVydFN0cmluZyhzdHJpbmdfLCB0b2tlblR5cGUpIHtcbiAgICBsZXQgb3V0cHV0ID0gc3RyaW5nXztcbiAgICBzd2l0Y2ggKHRva2VuVHlwZSkge1xuICAgICAgY2FzZSBUT0tFTlRZUEVTLnRpbWU6XG4gICAgICAgIC8qXG4gICAgICAgIGNvbnN0IHBhcnRzID0gc3RyaW5nXy5zcGxpdCgvKDp8YW18cG0pLyk7XG4gICAgICAgIGNvbnN0IGhvdXIgPVxuICAgICAgICAgIHBhcnRzWzNdID09PSAncG0nICYmIHBhcnRzWzBdIDwgMTJcbiAgICAgICAgICAgID8gTnVtYmVyLnBhcnNlSW50KHBhcnRzWzBdLCAxMCkgKyAxMlxuICAgICAgICAgICAgOiBwYXJ0c1swXTtcbiAgICAgICAgY29uc3QgbWluID0gcGFydHNbMl0udHJpbSgpO1xuICAgICAgICBvdXRwdXQgPSAoaG91ci5sZW5ndGggPT09IDEgPyAnMCcgOiAnJykgKyBob3VyICsgJzonICsgbWluO1xuICAgICAgICAqL1xuICAgICAgICAvLyA8aHR0cHM6Ly9naXRodWIuY29tL2J1bmthdC9sYXRlci9wdWxsLzE4OD5cbiAgICAgICAgY29uc3QgcGFydHMgPSBzdHJpbmdfLnNwbGl0KC8oOnxhbXxwbSkvKTtcbiAgICAgICAgbGV0IGhvdXIgPSBOdW1iZXIucGFyc2VJbnQocGFydHNbMF0sIDEwKTtcbiAgICAgICAgY29uc3QgbWluID0gcGFydHNbMl0udHJpbSgpO1xuICAgICAgICBpZiAocGFydHNbM10gPT09ICdwbScgJiYgaG91ciA8IDEyKSB7XG4gICAgICAgICAgaG91ciArPSAxMjtcbiAgICAgICAgfSBlbHNlIGlmIChwYXJ0c1szXSA9PT0gJ2FtJyAmJiBob3VyID09PSAxMikge1xuICAgICAgICAgIGhvdXIgLT0gMTI7XG4gICAgICAgIH1cblxuICAgICAgICBob3VyID0gU3RyaW5nKGhvdXIpO1xuICAgICAgICBvdXRwdXQgPSAoaG91ci5sZW5ndGggPT09IDEgPyAnMCcgOiAnJykgKyBob3VyICsgJzonICsgbWluO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBUT0tFTlRZUEVTLnJhbms6XG4gICAgICAgIG91dHB1dCA9IE51bWJlci5wYXJzZUludCgvXlxcZCsvLmV4ZWMoc3RyaW5nXylbMF0sIDEwKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgVE9LRU5UWVBFUy5tb250aE5hbWU6XG4gICAgICBjYXNlIFRPS0VOVFlQRVMuZGF5TmFtZTpcbiAgICAgICAgb3V0cHV0ID0gTkFNRVNbc3RyaW5nXy5zbGljZSgwLCAzKV07XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH1cblxuICByZXR1cm4gcGFyc2VTY2hlZHVsZUV4cHIoc3RyaW5nLnRvTG93ZXJDYXNlKCkpO1xufTtcblxuZnVuY3Rpb24gZ2V0T2Zmc2V0KGRhdGUsIHpvbmUpIHtcbiAgY29uc3QgZCA9IGRhdGVcbiAgICAudG9Mb2NhbGVTdHJpbmcoJ2VuLVVTJywge1xuICAgICAgaG91cjEyOiBmYWxzZSxcbiAgICAgIHRpbWVab25lOiB6b25lLFxuICAgICAgdGltZVpvbmVOYW1lOiAnc2hvcnQnXG4gICAgfSkgLy89PiBpZS4gXCI4LzIyLzIwMjEsIDI0OjMwOjAwIEVEVFwiXG4gICAgLm1hdGNoKC8oXFxkKylcXC8oXFxkKylcXC8oXFxkKyksPyAoXFxkKyk6KFxcZCspOihcXGQrKS8pXG4gICAgLm1hcCgobikgPT4gKG4ubGVuZ3RoID09PSAxID8gJzAnICsgbiA6IG4pKTtcblxuICBjb25zdCB6ZGF0ZSA9IG5ldyBEYXRlKFxuICAgIGAke2RbM119LSR7ZFsxXX0tJHtkWzJdfVQke2RbNF0ucmVwbGFjZSgnMjQnLCAnMDAnKX06JHtkWzVdfToke2RbNl19WmBcbiAgKTtcblxuICByZXR1cm4gZGF0ZS5nZXRUaW1lKCkgLSB6ZGF0ZS5nZXRUaW1lKCk7XG59IC8vIGdldE9mZnNldCgpXG5cbm1vZHVsZS5leHBvcnRzID0gbGF0ZXI7XG4iXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBTUEsR0FBRyxHQUFHQyxPQUFPLENBQUMsaUJBQWlCLENBQUM7QUFFdEMsSUFBTUMsS0FBSyxHQUFHO0VBQ1pDLE9BQU8sRUFBRUgsR0FBRyxDQUFDRztBQUNmLENBQUM7QUFFREQsS0FBSyxDQUFDRSxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ2hCRixLQUFLLENBQUNFLEtBQUssQ0FBQ0MsSUFBSSxHQUFHLFVBQVVELEtBQUssRUFBRUUsVUFBVSxFQUFFO0VBQzlDRixLQUFLLENBQUNDLElBQUksQ0FBQyxVQUFVRSxDQUFDLEVBQUVDLENBQUMsRUFBRTtJQUN6QixPQUFPQyxNQUFNLENBQUNGLENBQUMsQ0FBQyxHQUFHRSxNQUFNLENBQUNELENBQUMsQ0FBQztFQUM5QixDQUFDLENBQUM7RUFDRixJQUFJRixVQUFVLElBQUlGLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUU7SUFDaENBLEtBQUssQ0FBQ00sSUFBSSxDQUFDTixLQUFLLENBQUNPLEtBQUssQ0FBQyxDQUFDLENBQUM7RUFDM0I7QUFDRixDQUFDO0FBRURULEtBQUssQ0FBQ0UsS0FBSyxDQUFDUSxJQUFJLEdBQUcsVUFBVUMsS0FBSyxFQUFFQyxNQUFNLEVBQUVDLE1BQU0sRUFBRTtFQUNsRCxJQUFJQyxHQUFHO0VBQ1AsSUFBTUMsYUFBYSxHQUFHRixNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztFQUNyQyxJQUFJRyxPQUFPLEdBQUcsQ0FBQztFQUNmLEtBQUssSUFBSUMsQ0FBQyxHQUFHTCxNQUFNLENBQUNNLE1BQU0sR0FBRyxDQUFDLEVBQUVELENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFQSxDQUFDLEVBQUU7SUFDM0NILEdBQUcsR0FBR0YsTUFBTSxDQUFDSyxDQUFDLENBQUM7SUFDZixJQUFJSCxHQUFHLEtBQUtILEtBQUssRUFBRTtN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