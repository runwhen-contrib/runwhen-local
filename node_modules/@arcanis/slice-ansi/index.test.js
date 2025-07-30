const spliceAnsi = require(`./index`);

describe(`sliceAnsi`, () => {
  it(`should splice empty strings just fine`, () => {
    expect(spliceAnsi(``)).toEqual(``);
  });

  it(`should splice regular strings just fine`, () => {
    expect(spliceAnsi(`foo`)).toEqual(`foo`);
  });

  it(`should splice strings with parameters just fine`, () => {
    expect(spliceAnsi(`foobar`, 1, 3)).toEqual(`oo`);
  });

  it(`shouldn't care if the splice goes beyond the string length`, () => {
    expect(spliceAnsi(`foobar`, 0, 100)).toEqual(`foobar`);
  });

  it(`should preserve escape codes preceding the slice`, () => {
    expect(spliceAnsi(`\x1b[3mfoobar`, 1)).toEqual(`\x1b[3moobar`);
  });

  it(`should preserve escape codes following the slice`, () => {
    expect(spliceAnsi(`foobar\x1b[3m`, 0, 5)).toEqual(`fooba\x1b[3m`);
  });

  it(`should preserve escape codes inside a slice`, () => {
    expect(spliceAnsi(`hello wo\x1b[3mrld f\x1b[6moo bar`, 1, 18)).toEqual(`ello wo\x1b[3mrld f\x1b[6moo ba`);
  });

  it(`should slice across hyperlinks`, () => {
    expect(spliceAnsi(`foo\x1b]8;;https://example.org\x1b\\bar\x1b]8;;\x1b\\baz`, 1, 8)).toEqual(`oo\x1b]8;;https://example.org\x1b\\bar\x1b]8;;\x1b\\ba`);
    expect(spliceAnsi(`foo\x1b]8;;https://example.org\x07bar\x1b]8;;\x07baz`, 1, 8)).toEqual(`oo\x1b]8;;https://example.org\x07bar\x1b]8;;\x07ba`);
  });

  it(`should work with a variety of complexish cases`, () => {
    expect(spliceAnsi(`\x1b[93m➤\x1b[39m foo`, 0, 5)).toEqual(`\x1b[93m➤\x1b[39m foo`);
  });
});
