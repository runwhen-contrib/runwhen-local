
{decode,clearsign_header} = require('../../lib/main').armor

#===========================================================================

exports.test_clearsign_header = (T, cb) ->
  C = {}
  data = "this is the data\n"
  hasher_name = "SHA512"
  b = clearsign_header C, data, hasher_name
  expected = "-----BEGIN PGP SIGNED MESSAGE-----\nHash: SHA512\n\nthis is the data\n"
  T.equal b, expected, "got the right output"
  cb()

#===========================================================================

exports.test_parse_clearsign = (T,cb) ->
  msg = """
-----BEGIN PGP SIGNED MESSAGE-----
Hash: SHA512

hi
-----BEGIN PGP SIGNATURE-----
Version: GnuPG/MacGPG2 v2.0.22 (Darwin)
Comment: GPGTools - https://gpgtools.org

iQIcBAEBCgAGBQJS+lEMAAoJEC/gHEVDSNo5fPQP/26TTyQNn0/cJ0Tq09/9fPxx
I9whHgo7fVae/MQlIFU/tjpv0ytPZf1lyJG2wkqiGf0lj30WdjpqkmJ4yPBx1H5U
MPuWTOfomXv7WHQlEfGNKRS5kDlEgrhS25P0AD9DA+vDGKooPwmDt2oAZGfAKU/c
80NSINj+Uv0qNv1YJKoJGmGdZ5yNVs0jeNYKwwpzAyIxmZoBc8FOE4R93/vU/4P8
IGLQ1v+7HGoeeKob3VTYpghAOl22+6N2A/Pf5eZYW/WU/S/+B6YxkTjYjm1CV9am
pOyYfTV2+h8UVuX179nvFmwopXlcndorCnMP3MdfTL7SmxgQ09vpP1kIXrkCFaEk
CSeJARYSepIgi39ByasKk62wT0Ifh5HY+8zCl9+wQLwUr13M4KM2QNCeGA94hkE8
6HTsAl0H9g8XUTdrKd5PC+DJXFWEEpMUxyk1t6Iu2cxokk/pD209O0re1l70j0vG
fWifTgNgDVtJ25LG/QEIuazrzGWyr9oolIXnqn2t1Ik5kq+lkN+rXjrzgtoeyGIT
YC0UW99E+Vo7361LcmDe1GmZbPA8YaQHivAlj9JjPgTqyauF+NxqHvfRmO2gV/Mo
bW5l52fDecwu4quUxls+5t8Uxu/Uotp7yuwqkHVdNGrRMfHL29WwhTTH+YI/9hpA
8Gt19y4yuMXbs/Cmv74H
=CoJG
-----END PGP SIGNATURE-----
"""
  [err,m2] = decode(msg)
  T.no_error err
  T.assert m2.clearsign?, "got a clearsign portion"
  T.assert (msg.indexOf(m2.payload) >= 0), "found the payload"
  T.equal m2?.clearsign?.headers?.hash, "SHA512", "hash was right"
  T.assert (msg.indexOf(m2.clearsign.lines.join("\n")) >=0),  "found the clearsign portion"
  cb()

#===========================================================================

msg = """
-----BEGIN PGP SIGNED MESSAGE-----
Hash: SHA512

When, in disgrace with fortune and men's eyes,
I all alone beweep my outcast state,
And trouble deaf heaven with my bootless cries,
And look upon myself, and curse my fate,
Wishing me like to one more rich in hope,
Featur'd like him, like him with friends possess'd,
Desiring this man's art and that man's scope,
With what I most enjoy contented least;
Yet in these thoughts myself almost despising,
Haply I think on thee, and then my state,
Like to the lark at break of day arising
- From sullen earth, sings hymns at heaven's gate;
For thy sweet love remember'd such wealth brings
That then I scorn to change my state with kings.
-----BEGIN PGP SIGNATURE-----
Version: GnuPG/MacGPG2 v2.0.22 (Darwin)
Comment: GPGTools - https://gpgtools.org

iQIcBAEBCgAGBQJS+ptgAAoJEC/gHEVDSNo5QfMQAK9xjGapMr+O4YSRl8i6Dc2C
Dy7+ccQZBV5wYjQkF6eg3VC8P0iqnV4NDJ/1bnn5K4lHsu+vPHm1GK/HVemHncSM
FIjwUjrhfqKRVlG8WcxgME9EjCeONZErENffnd1RVluDUdN0tS46mJtviLbg7yYQ
r2kVWObFzH+p9PvEKvoJGASuSrDrbBQ0rq+DO0tof4maI8loses7wMc7R2MBkJ+W
+Ph2LqLilJQ25WoOjixmFF+TC15MqKDTPB1Zx9RC+T16hkHDEvTcfxpFuLUOouYa
YnHQ2KN7/ojfgAhyO1BQwSSrGsKMqFw7lY/2mtJlWWV9I8D+cI9RWdjW8SoMKoY+
eeAKzjMKpOtYXvXiZoFivuFxyhclgnj2JbzCxwhgbrbCGkIQBof70K6Dfu0I6VpS
qq2ZaOto8LqcsaQ13KWNQwsotP4fSXsB72mPBQ46WKjXWoQYyheazCrAuzLuZqCJ
QBwrLwWdAWahf7kg5gOFlxLFgWLDcyTSj1/lmYtazWGHSVI0B/u699N3PhIGlaaT
4UT6qdHSjls+FmcL+66rSu5svMOlDdsuHFXvWPt7FhRM9ZXGwQP7LdpQ6UOeYTqf
Al9DZ/j7kPPbK2tEHdx9Kq4m4sniFlLt/kAMOtfNiu7zwnVEx2L9IPgjyXtshT6H
AtaeSVJvRwvf1PFes2er
=h/Au
-----END PGP SIGNATURE-----
"""

#===========================================================================

exports.test_parse_clearsign_2 = (T,cb) ->
  [err,m2] = decode(msg)
  T.no_error err
  T.assert m2.clearsign?, "got a clearsign portion"
  T.assert (msg.indexOf(m2.payload) >= 0), "found the payload"
  T.equal m2?.clearsign?.headers?.hash, "SHA512", "hash was right"
  T.assert (msg.indexOf(m2.clearsign.lines.join("\n")) >=0),  "found the clearsign portion"
  cb()

#===========================================================================

exports.test_bad_armor = (T,cb) ->
  msg = """-----BEGIN PGP MESSAGE-----
Version: GnuPG/MacGPG2 v2.0.22 (Darwin)
Comment: GPGTools - https://gpgtools.org
hQEMA+bZw3a+syp5AQf6A1kTq0lwT+L1WCr7N2twHbvOnAorb+PJiVHIp2hTW2gr
U3fm/0/SxTdTJRaZsAjbVLH4jYg6cXyNIxdE5uw2ywxQ9Zi8iWylDixsPT5bD6Q7
xlFLhr4BTt7P/oTUMANybuFU6ntss8jbzKZ7SdHbylLrkaUylSWqH1d7bffMxCAl
JOOAHBOXowpcswAurwQpaDZGX3rGUXjAcMDS5ykr/tgHIwo25A+WbIdNCYMkYm0d
BT83PUMIZm351LJWIv/tBqraNc9kEyftAMbVlh5xC0EfPt+ipyRJDh5XKTvh0xQW
T6nM9Z0qLVwUhaG9RqRM1H6D083IE9fKF6sFdce7MtI/ARo3wPa7qll1hyY5vfaT
baAzKLJPcPDf1vu2+S1c1kt5ljvao8MCCebgK7E8CPT/ajLr1xU05G7Eg0zrkstk
=ni0M
-----END PGP MESSAGE-----"""
  [err,_] = decode(msg)
  T.assert err?, "we got an error back"
  T.equal err.toString(), "Error: bad PGP armor found; expected a newline"
  cb()

#===========================================================================

exports.test_armor_with_charset = (T,cb) ->
  msg = """-----BEGIN PGP PRIVATE KEY BLOCK-----
Charset: UTF-8
Version: End-To-End v0.3.1338

xf8AAAB3BFOsKbATCCqGSM49AwEHAgMEhEKmGdZix3AbyoAVe6Bd4WZE8jGVUbKh
NCaDyKaE7rKk5JZa2hIyaJN8wEOIJ3hWgPBTK13n+zvrllSNRz9+7gAA/iCIKxxK
M3Q81TyXQASN345AWSmjb/evQfwFBreq1M57D0DN/wAAABI8dGhlbWF4QGdtYWls
LmNvbT7C/wAAAGYEEBMIABj/AAAABYJTrCmw/wAAAAmQh6GhxI25BWcAAEphAQCY
dab0CXAU1JCEUDegFih6n1LJjlQ8rr9jkdkplfZKyAD/Z/204vz6ICHYB8rhHOC6
127D8KHdLYaR8KKNPEDw6m/H/wAAAHsEU6wpsBIIKoZIzj0DAQcCAwRiCoBfuydu
cp3FChW9Q4Yz6cXU2okTyGv2hHsnQ2P5tilLSBp2cv4TnV4LIawNsP+gsesoXSln
hFb+sAdaTvwxAwEIBwAA/AvHI+wsE9cFyxe6tHePCa+/KCrRia6Jz9VYMkTJKxcD
DyjC/wAAAGYEGBMIABj/AAAABYJTrCmw/wAAAAmQh6GhxI25BWcAAASlAP985Usk
lzOHK4VuqatRW35xBICiymeQX+aDXbU/6OL1cwD7Bj+TmwRDQe9b3yAV8ktaZM/L
3Uc+HTz2Cp9wtwSPXXfG/wAAAFIEU6wpsBMIKoZIzj0DAQcCAwSEQqYZ1mLHcBvK
gBV7oF3hZkTyMZVRsqE0JoPIpoTusqTkllraEjJok3zAQ4gneFaA8FMrXef7O+uW
VI1HP37uzf8AAAASPHRoZW1heEBnbWFpbC5jb20+wv8AAABmBBATCAAY/wAAAAWC
U6wpsP8AAAAJkIehocSNuQVnAABKYQEAmHWm9AlwFNSQhFA3oBYoep9SyY5UPK6/
Y5HZKZX2SsgA/2f9tOL8+iAh2AfK4Rzgutduw/Ch3S2GkfCijTxA8Opvzv8AAABW
BFOsKbASCCqGSM49AwEHAgMEYgqAX7snbnKdxQoVvUOGM+nF1NqJE8hr9oR7J0Nj
+bYpS0gadnL+E51eCyGsDbD/oLHrKF0pZ4RW/rAHWk78MQMBCAfC/wAAAGYEGBMI
ABj/AAAABYJTrCmw/wAAAAmQh6GhxI25BWcAAASlAPsFvd0AeDmF2wBJd4l1g0oV
TfplxTTTYO6DJP5McmTtKwD+P7WgGuy0IssdwD7bU//zlOvl9nyztxojitGtDtT2
CNU=
=TRLE
-----END PGP PRIVATE KEY BLOCK-----"""
  [err,_] = decode(msg)
  T.no_error err
  cb()

exports.test_high_char = (T,cb) ->
  msg = """-----BEGIN PGP PRIVATE KEY BLOCK-----
Comment: GPGTools - but wait unicode! ->\u{1F525}<-
Version: End-To-End v0.3.1338

xf8AAAB3BFOsKbATCCqGSM49AwEHAgMEhEKmGdZix3AbyoAVe6Bd4WZE8jGVUbKh
NCaDyKaE7rKk5JZa2hIyaJN8wEOIJ3hWgPBTK13n+zvrllSNRz9+7gAA/iCIKxxK
M3Q81TyXQASN345AWSmjb/evQfwFBreq1M57D0DN/wAAABI8dGhlbWF4QGdtYWls
LmNvbT7C/wAAAGYEEBMIABj/AAAABYJTrCmw/wAAAAmQh6GhxI25BWcAAEphAQCY
dab0CXAU1JCEUDegFih6n1LJjlQ8rr9jkdkplfZKyAD/Z/204vz6ICHYB8rhHOC6
127D8KHdLYaR8KKNPEDw6m/H/wAAAHsEU6wpsBIIKoZIzj0DAQcCAwRiCoBfuydu
cp3FChW9Q4Yz6cXU2okTyGv2hHsnQ2P5tilLSBp2cv4TnV4LIawNsP+gsesoXSln
hFb+sAdaTvwxAwEIBwAA/AvHI+wsE9cFyxe6tHePCa+/KCrRia6Jz9VYMkTJKxcD
DyjC/wAAAGYEGBMIABj/AAAABYJTrCmw/wAAAAmQh6GhxI25BWcAAASlAP985Usk
lzOHK4VuqatRW35xBICiymeQX+aDXbU/6OL1cwD7Bj+TmwRDQe9b3yAV8ktaZM/L
3Uc+HTz2Cp9wtwSPXXfG/wAAAFIEU6wpsBMIKoZIzj0DAQcCAwSEQqYZ1mLHcBvK
gBV7oF3hZkTyMZVRsqE0JoPIpoTusqTkllraEjJok3zAQ4gneFaA8FMrXef7O+uW
VI1HP37uzf8AAAASPHRoZW1heEBnbWFpbC5jb20+wv8AAABmBBATCAAY/wAAAAWC
U6wpsP8AAAAJkIehocSNuQVnAABKYQEAmHWm9AlwFNSQhFA3oBYoep9SyY5UPK6/
Y5HZKZX2SsgA/2f9tOL8+iAh2AfK4Rzgutduw/Ch3S2GkfCijTxA8Opvzv8AAABW
BFOsKbASCCqGSM49AwEHAgMEYgqAX7snbnKdxQoVvUOGM+nF1NqJE8hr9oR7J0Nj
+bYpS0gadnL+E51eCyGsDbD/oLHrKF0pZ4RW/rAHWk78MQMBCAfC/wAAAGYEGBMI
ABj/AAAABYJTrCmw/wAAAAmQh6GhxI25BWcAAASlAPsFvd0AeDmF2wBJd4l1g0oV
TfplxTTTYO6DJP5McmTtKwD+P7WgGuy0IssdwD7bU//zlOvl9nyztxojitGtDtT2
CNU=
=TRLE
-----END PGP PRIVATE KEY BLOCK-----"""
  [err,_] = decode(msg)
  T.assert err?, "we got an error back"
  T.equal err.toString(), "Error: invalid character in armor"
  cb()

exports.test_high_char_clearsigned = (T,cb) ->
  msg = """-----BEGIN PGP SIGNED MESSAGE-----
Hash: SHA256

clearsign works \u{1f4a9}
-----BEGIN PGP SIGNATURE-----

iQEzBAEBCAAdFiEEWKJF09iyXBX2zj//cYdraK1ILTIFAliA9I4ACgkQcYdraK1I
LTI/Egf/RRhKMRTuYoGab7MWKdDzgpFCl/oBGbxb6FyZT2gbWH+ZHY6C7Q+XGl75
2hIQhtqb6h/9not0i8NRBoZBhXaB3UNVjYXViznXUCFHraxVB3Jw/9RO+ngpOySJ
zg5aI+NLpx64TDmr0OBJyoodcvwtGqyACLflhC/iHmy8bOCAYfhQ2PaGWEB5dPOh
XAZ7l7hzXBc8NFfqUVFjEDS6Ze9qciDYpHrGdbk1uAzdpTyLbj1oQUZnHSjfmRIc
f2/zCEeRz+f5ziqjlI6XtniWNR6PWDq/cMfKeVpLPTDN8p22dP/6/rw/kl9QHkqE
kL/gpzhxmthXleUat8zNkK/xrgzjxA==
=FQwn
-----END PGP SIGNATURE-----
"""
  [err, decoded] = decode(msg)
  T.no_error err
  T.equal decoded.clearsign.body, "clearsign works \u{1f4a9}\n"
  cb()

exports.test_header_white_space = (T,cb) ->
  msg = """-----BEGIN PGP PUBLIC KEY BLOCK-----

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
  k = msg.split('\n')
  line0 = k[0]
  k1 = [(line0 + "       " )].concat(k[1...]).join("\n")
  [err, decoded] = decode(k1)
  T.no_error err
  k2 = [(line0 + "       [10/20]" )].concat(k[1...]).join("\n")
  [err, decoded] = decode(k2)
  T.assert err?, "error found!"
  cb()
