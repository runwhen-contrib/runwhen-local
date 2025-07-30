## 0.0.35 (2019-02-01)

- Upgrade (new Buffer) to Buffer.from and Buffer.alloc

## 0.0.34 (2017-10-10)

Feature:
  - Add strict mode to Parser that will refuse armors with non-base64
    characters or lines longer than 80 characters.

## 0.0.33 (2017-09-25)

- Only allow whitespace after the end of the --BEGIN PGP-- block, not
  any characters.

## 0.0.32 (2017-01-19)

Bugfix:
  - Allow non-ASCII in cleartext messages.

## 0.0.31 (2016-12-19)

Bugfix:
  - Only allow low printable characters in incoming armor.

## 0.0.30 (2016-03-30)

Bugfix:
  - Better regex for the below
  - new test case

## 0.0.29 (2016-03-30)

Bugfix:
  - error out on malformed headers

## 0.0.28 (2015-02-18)

Features:

  - As below, but add a "pad" flag
  - Improved fingerprint formatter

## 0.0.27 (2014-07-19)

Features:

  - Expose crc24_to_base64 one-liner

## 0.0.26 (2014-07-17)

Features:

  - export armor.compute_crc24 for streaming armoring in kbpgp

## 0.0.25 (2014-07-08)

Features:

  - xxd debug output, like the Unix filter

## 0.0.24 (2014-07-08)

Bugfixes:

  - Be more strict in matching BEGIN and END PGP blocks.  Must be
    at the beginning of the line
     - See keybase/keybase-issues#844

## 0.0.23 (2014-06-19)

Bugfixes:

  - strcmp_secure can handle nulls

## 0.0.22 (2014-06-04)

Bugfixes:

  - Recompile needed in last upgrade

## 0.0.21 (2014-06-04)

Features:

  - Upgrade to ICS v1.7.1-c w/ factored out runtime

## 0.0.20 (2014-04-07)

Bugfixes:

  - Slight improvements to PGP clearsign header decoding

## 0.0.19 (2014-03-29)

Bugfixes:

  - Allow userIDs with no space between the name and userid.

## 0.0.18 (2014-03-17)

Bugfixes:

  - Workaround a bug in browserify; seems like spaces in the middle of base64-decoding
    yields the wrong answer on a decode.  Works fine in node.

## 0.0.17 (2014-03-17)

Bugfixes:

  - Close #3: handle newlines and spaces at the end of a message block

## 0.0.16 

  - Better bufeq_secure, which does not use floating point math
  - Make the decoder more robust for messages that have spurious whitespace
    See keybase/keybase-issues#219

## 0.0.14 (2014-2-21)

Bugfixes:

  - Fix line splitting on windows, have to split on \r?\n.
    See keybase/node-client#106

Features:

  - Inaugural changelog
