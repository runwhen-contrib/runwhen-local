const ANSI_SEQUENCE = /^(.*?)(\x1b\[[^m]+m|\x1b\]8;;.*?(\x1b\\|\u0007))/;

let splitGraphemes;

function getSplitter() {
  if (splitGraphemes)
    return splitGraphemes;

  // Intl.Segmenter is part of https://github.com/tc39/proposal-intl-segmenter
  // It got introduced in v8 8.8 (Node 16.0.0).
  // TODO: stop using grapheme-splitter after support for Node 14 is dropped.
  if (typeof Intl.Segmenter !== `undefined`) {
    const segmenter = new Intl.Segmenter(`en`, {granularity: `grapheme`});
    return splitGraphemes = text => Array.from(segmenter.segment(text), ({segment}) => segment);
  } else {
    const GraphemeSplitter = require(`grapheme-splitter`);
    const splitter = new GraphemeSplitter();
    return splitGraphemes = text => splitter.splitGraphemes(text);
  }
}

module.exports = (orig, at = 0, until = orig.length) => {
  // Because to do this we'd need to know the printable length of the string,
  // which would require to do two passes (or would complexify the main one)
  if (at < 0 || until < 0)
    throw new RangeError(`Negative indices aren't supported by this implementation`);

  const length = until - at;

  let output = ``;

  let skipped = 0;
  let visible = 0;

  while (orig.length > 0) {
    const lookup = orig.match(ANSI_SEQUENCE) || [orig, orig, undefined];
    let graphemes = getSplitter()(lookup[1]);

    const skipping = Math.min(at - skipped, graphemes.length);
    graphemes = graphemes.slice(skipping);

    const displaying = Math.min(length - visible, graphemes.length);
    output += graphemes.slice(0, displaying).join(``);

    skipped += skipping;
    visible += displaying;

    if (typeof lookup[2] !== `undefined`)
      output += lookup[2];

    orig = orig.slice(lookup[0].length);
  }

  return output;
};
