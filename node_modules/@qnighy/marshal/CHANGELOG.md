## Unreleased

## 0.1.3

- It no longer depends on `Buffer` from Node.js https://github.com/qnighy/marshal-js/pull/4
  - Note that you need the globally-defined `TextDecoder` to decode non-ASCII strings.

## 0.1.2

- `parse` is now available as `Marshal.parse` too https://github.com/qnighy/marshal-js/pull/2
- Misc
  - Promote `@types/node` to `dependencies` https://github.com/qnighy/marshal-js/pull/3
  - Refactor modules https://github.com/qnighy/marshal-js/pull/2

## 0.1.1

- Use `defineProperty` to construct hashes. https://github.com/qnighy/marshal-js/pull/1

## 0.1.0

Initial release.
