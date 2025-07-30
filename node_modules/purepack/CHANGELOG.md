## 1.0.06 (2020-01-27)

- Some simple types

## 1.0.5 (2019-02-01)

- Migrate from (new Buffer) to Buffer.from

## 1.0.4 (2015-09-02)

Features:
  - Don't allow repeated keys in the same dictionary; throw on unpack in that case
  - A strict mode in which we throw if you don't encode in exactly the right way.

## 1.0.3 (2015-08-06)

Bugfix:
  - For travis CI, update dev deps

## 1.0.2 (2015-08-06)

Bugfix:
  - If an array is at the last byte of buffer, throw an error.
