# Good enough parser

TypeScript library aiming to fill the gap between usage of ad-hoc regular expressions and generation of complete grammar descriptions.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/zharinov/good-enough-parser/blob/main/LICENSE)
[![Trunk](https://github.com/zharinov/good-enough-parser/actions/workflows/trunk.yml/badge.svg)](https://github.com/zharinov/good-enough-parser/actions/workflows/trunk.yml)

## Motivation

While most programming languages provide parser tooling for the language they're written in, sometimes we need a uniform way to deal with the variety of languages from JavaScript (or TypeScript).

### Goals

- _Be good enough for source code written well enough._
- Go much further than is possible with regular expressions.
- Respect location info. Once something interesting is found, it can be located in the source test via offset info. Once something is written, it should not affect the whole document formatting.
- Incorporate poorly recognized fragments into the output and continue parsing.
- Expressive API which helps you focus on syntactic structure, not the space or quote variations.
- Allow to define a language of interest quickly. Provide definitions for popular languages out-of-the-box.

### Non-goals

- Catch all syntactic edge-cases
- Compete with parsing tools with strict grammar definitions

## Details

The library is divided into multiple levels of abstraction, from the lowest to the highest one:

### [`lib/lexer`](https://github.com/zharinov/good-enough-parser/tree/main/lib/lexer)

Configures the [moo](https://github.com/no-context/moo) tokenizer for specific language features such as:

- Brackets: `()`, `{}`, `[]`, etc
- Strings: `'foo'`, `"bar"`, `"""baz"""`, etc
- Templates: `${foo}`, `{{bar}}`, `$(baz)`, etc
- Single-line comments: `#...`, `//...`, etc
- Multi-line comments: `/*...*/`, `(*...*)`, etc
- Identifiers: `foo`, `Bar`, `_baz123`, etc
- Line joins: if the line ends with `\`, the next one will be treated as its continuation

Refer to the `LexerConfig` interface for more details.
Also check out [our usage example for Python](https://github.com/zharinov/good-enough-parser/blob/main/lib/lang/python.ts).

### [`lib/parser`](https://github.com/zharinov/good-enough-parser/tree/main/lib/tree)

This layer is responsible for transforming the token sequence to the nested tree with the tokens as leafs.
Internally, we're using functional [zipper](<https://en.wikipedia.org/wiki/Zipper_(data_structure)>) data structure to perform queries on the tree.

### [`lib/query`](https://github.com/zharinov/good-enough-parser/tree/main/lib/query)

To understand `parser-utils` queries, it's useful to keep in mind the principle of how regular expressions work.
Each query represents sequence of adjacent tokens and tree elements.

For example, consider following query:

```ts
q.num('2').op('+').num('2').op('=').num('4');
```

It will match on the following fragments `2 + 2 = 4` or `2+2=4`, but won't match on `2+2==4` nor `4=2+2`.

Once brackets are defined, their inner contents will be wrapped into a tree node.
It's possible to query tree nodes:

```ts
q.tree({
  search: q.num('2').op('+').num('2'),
})
  .op('=')
  .num('4');
```

The above query will match these strings:

- `(2 + 2) = 4`
- `[2 + 2] = 4`
- `(1 + 2 + 2 - 1) = 4`
- `(1 + (2 + 2) - 1) = 4`

It won't match `2 + 2 = 4` because there is no any nesting.

## Contributing

Add link to CONTRIBUTING.md file that will explain how to get started developing for this package.
This can be done once things stabilize enough for us to accept external contributions.
