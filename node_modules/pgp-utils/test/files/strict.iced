{decode,clearsign_header,Parser} = require('../../lib/main').armor
{katch} = require '../../lib/util'

decode_strict = (data) -> katch () -> (new Parser data, { strict: true }).parse()

global_msg = """-----BEGIN PGP PUBLIC KEY BLOCK-----

mI0EWcknrwEEAK2X5lKA76pf6i5D1aVcApUAH6NnZ4NkFeSxKT92soiSWkFn+I/G
VKJfTvx2dzxOAB4rvyFjUzjgAwhK3FblCnfXwgPAh6/vukF/YBwynCVyNxOVAVHY
gCkw/+7zIM24RUxzI3V9wzJ6i/SpfNnWKkKqJXIt4Xzv3Rs/UXk5DMY5ABEBAAG0
I01heCBUZXN0IDc3NyA8dGhlbWF4Kzc3N0BnbWFpbC5jb20+iLgEEwECACIFAlnJ
J68CGwMGCwkIBwMCBhUIAgkKCwQWAgMBAh4BAheAAAoJEM5jclcHa4v8ssQD/RJA
JTrfydAkLzffGgZyKafs/aTraVDNtDv1sF+5iBtZvOB0FFjzivl3BGlplEqnPquB
bg8/OQuxFLYM/f8+WgP5MDqBce8s6h5kGZPj73zP4GQLZWojS5/H3J1sDBmNTSnd
ByELhvVxJmJiHdz2jMb74+thB/ZK4xf+zAkRF4WZuI0EWcknrwEEALk0Bsp/xJ+4
75hswySLZmvNh79CyIC0K1gzXiEPDwqGy6xT1PbXLJ5HcXna4HJdNAgXf1T/n+zR
19xJMAB6NSv2zigRaYAyy4It2p2cRPHseWWTcP7lMUpwqtQsnqNKJ14RuAaMOQtG
xSaQMgMGZx6lxFWNaK40SxSnqFRtfRs9ABEBAAGInwQYAQIACQUCWcknrwIbDAAK
CRDOY3JXB2uL/PX/A/9HvpLPVDrEMr9+vzmS8Ez0br2kgeoPh7yOAlEotS7OBNWU
UzzykQlAfLl74336wrkSZfa2GnBBJQHvlnLosnmbGCzsd3KMkuJv90hxxt1rqjN6
3GFiwBVdsSuyEb3uQJ/ytAyVozwwxjMQZ+gJTYfK8syPdf2T1W6cv7lfHp8E8g==
=sJQD
-----END PGP PUBLIC KEY BLOCK-----"""

exports.test_bundle_no_newlines = (T, cb) ->
  msg = global_msg
  # Remove newlines from the base64 part
  k = msg.split '\n'
  mangled_key = k[0..1].join('\n') + '\n' + k[2..-2].join('') + '\n' + k[-1..].join('\n')
  [err, decoded] = decode_strict mangled_key
  T.assert err?, 'mangled key should not decode under strict mode'
  [err, decoded] = decode mangled_key
  T.assert not err?, 'mangled key should decode under normal mode'

  # Another case is where newlines are replaced with spaces, only
  # keeping last newline before crc line.
  k = msg.split '\n'
  mangled_key = k[0..1].join('\n') + '\n' + k[2..-3].join(' ') + '\n' + k[-2..].join('\n')
  [err, decoded] = decode_strict mangled_key
  T.assert err?, 'mangled key 2 should not decode under strict mode'
  [err, decoded] = decode mangled_key
  T.assert not err?, 'mangled key 2 should decode under normal mode'

  cb null

exports.clearsign_long_lines = (T, cb) ->
  # A really long line in clearsign section should not trip the
  # line limit in parser.
  message = """-----BEGIN PGP SIGNED MESSAGE-----
Hash: SHA256
Version: xf8AAAB3BFOsKbATCCqGSM49AwEHAgMEhEKmGdZix3AbyoAVe6Bd4WZE8jGVUbKhxf8AAAB3BFOsKbATCCqGSM49AwEHAgMEhEKmGdZix3AbyoAVe6Bd4WZE8jGVUbKhThisIsARealProgramISwear

Regardless of where you run it, a heavy math operation can be written with single-thread concurrency in mind. You just have to (1) do work in batches, (2) defer to the event loop periodically via setTimeout or process.nextTick, and (3) call back with an answer, instead of returning one.
-----BEGIN PGP SIGNATURE-----

iQEzBAEBCAAdFiEEoFFhUQ7mlmAboOx7P9U7SHFSjO8FAlnXtT8ACgkQP9U7SHFS
jO+NJAf+M7+hbUDVJ/T+iNyNzh3s0o4sK1Glk21bWlYN+cBOPLoTg8zeNDtz28zE
HZ69ln6WsirXfR1FuytLVjAsrW9fjGSgYOaVXGNNToi/UMZWqw60r4BV8MTrou9U
KWWAdjXAI7/2xwsX7MlEN4q4uzmetQ5kAeRzbBtKfPL115NsTh1fSPm0rN7OpZNE
F2YURWpHVJkcqL/49RWDFGHdmoghO5NNVpxKfGd0X1JXIRbjTIU5DDZ9dBe54/5X
PfAkUucuvxMEB6vXD58/M1vXp0bKCrEz7sJy0T1AHAvnOhJr5ET9xqzSckNnVn8I
PTfgSSzEioqv3qaunjwm0ZjRtPabMg==
=9ssu
-----END PGP SIGNATURE-----

"""

  # Both should decode - strict mode should not apply for clearsign section or header section.
  [err, decoded] = decode_strict message
  T.assert not err?, "clearsign armor should decode under strict mode"
  [err, decoded] = decode message
  T.assert not err?, "clearsign armor should decode under normal mode"

  cb null

exports.non_base64_characters = (T, cb) ->
  message = """-----BEGIN PGP MESSAGE-----
Version: GnuPG/MacGPG2 v2.0.22 (Darwin)
Comment: GPGTools - https://gpgtools.org

hQEMA+bZw3a+syp5AQf6A1kTq0lwT+L1WCr7N2twHbvOnAorb+PJiVHIp2hTW2gr
U3fm/0/SxTdTJRaZsAjbVLH4jYg6cXyNIxdE5uw2ywxQ9Zi8iWylD(((ixsPT5bD6Q7
xlFLhr4BTt7P/oTUMANybuFU6ntss8jbzKZ7SdHbylLrkaUylSWqH1d7bffMxCAl
JOOAHBOXowpcswAurwQpaDZGX3rGUXjAcMDS5ykr/tgHIwo25A+WbIdNCYMkYm0d
BT83PUMIZm351LJWIv/tBqraNc9kEyftAMbVlh5xC0EfPt+ipyRJDh5XKTvh0xQW
T6nM9Z0qLVwUhaG9RqRM1H6D083IE9fKF6sFdce7MtI/ARo3wPa7qll1hyY5vfaT
baAzKLJPcPDf1vu2+S1c1kt5ljvao8MCCebgK7E8CPT/ajLr1xU05G7Eg0zrkstk
=ni0M
-----END PGP MESSAGE-----"""

  [err, decoded] = decode_strict message
  T.assert err?, "should decode under strict mode"
  T.waypoint "decode_strict failed with error \"#{err.message}\""

  # Note - the checksum still matches, because only additional
  # characters were added, which are ignored during base64 reading. So
  # it should still decode properly.
  [err, decoded] = decode message
  T.assert not err?, "should decode under normal mode"

  cb null
