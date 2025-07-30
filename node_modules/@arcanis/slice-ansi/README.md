# `@arcanis/slice-ansi`

> Slice strings while preserving ansi characters

[![](https://img.shields.io/npm/v/@arcanis/slice-ansi.svg)]() [![](https://img.shields.io/npm/l/@arcanis/slice-ansi.svg)]() [![](https://img.shields.io/badge/developed%20with-Yarn%202-blue)](https://github.com/yarnpkg/berry)

## Installation

```
yarn add @arcanis/slice-ansi
```

## Why

Unlike the [Chalk version](https://github.com/chalk/slice-ansi), this completely different implementation:

- Supports terminal hyperlinks
- Leverages the native grapheme splitting API if available
- Doesn't require ESM, because it's an inane requirement for a library like this

## License (MIT)

> **Copyright © 2020 Mael Nison**
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
