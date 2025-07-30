## `@qnighy/marshal`

Parses data exported by Ruby's `Marshal.dump`.

## Quickstart

```
npm install --save @qnighy/marshal
# OR
yarn add @qnighy/marshal
```

```javascript
import { Marshal } from "@qnighy/marshal";
// OR
const { Marshal } = require("@qnighy/marshal");

const buf = Uint8Array.from([
  4, 8, 123, 7, 58, 9, 110, 97, 109, 101, 73, 34, 8, 102, 111, 111, 6, 58, 6,
  69, 84, 58, 12, 110, 117, 109, 98, 101, 114, 115, 91, 8, 105, 6, 105, 7, 105,
  8,
]);
const data = Marshal.parse(buf);
// => { name: 'foo', numbers: [ 1, 2, 3 ] }
```

## API

### `Marshal.parse`

Parses a data exported by Ruby's `Marshal.load`.

- Parameters
  - `buf`: `Uint8Array` <br>
    a binary data to parse
- Returns
  - `unknown` <br>
    the decoded value
- Throws
  - `MarshalError` <br>
    when the data contains an invalid format.

### `parse`

Same as `Marshal.parse`.

### `MarshalError`

An exception raised when `loadMarshal` encountered an invalid format.

- Superclass
  - `Error`

## Notes on conversion

Ruby's value structure doesn't correspond to that of JavaScript. Here is how `@qnighy/marshal` converts values:

- `Fixnum`s, `Bignum`s, and `Float`s are all converted to `number`s.
- `String`s and `Symbol`s are all converted to `string`s.
  - Encoding specifications are ignored and all strings are interpreted in UTF-8.
  - Bytes invalid as UTF-8 are replaced by U+FFFD.
- `Hash`es are converted to `object`s.
  - Only keys that are a `number` or a `string` (including ones that were `Symbol`s) are picked.
  - Any other keys (`nil`, `[1, 2]`, etc.) are discarded.
  - If it has default value, it's replaced as the special `__ruby_default` key.
- `Struct`s are converted to `object`s.
- `Regexp`s are converted to `RegExp`s.
  - Flags are ignored in the current version.
  - Syntax errors in `new RegExp(...)` are propagated in the current version.
- Plain `Object`s are converted to empty objects.
- Classes and modules are converted to empty objects.
- All instance variables and class information are discarded.
  Even instances of subclasses of `String`, `Array`, `Hash`, and `Regexp` will be
  recognized the same as instances of their base classes.
- If two occurrences of objects pointed to the identical object in Ruby, they will be identical in JS.
  - This rule doesn't apply when the object was parsed as a primitive value in JS.
    Examples include `Bignum`, `Float`, and `String`.
- Cyclic references are kept as-is.

## License

MIT
