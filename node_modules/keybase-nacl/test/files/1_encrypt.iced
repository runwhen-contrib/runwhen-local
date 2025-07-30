crypto = require('crypto')
prng = crypto.prng
main = require('../..')
util = require('../../lib/util.js')

msg = Buffer.from("")
for i in [0..1024**2] by 65535
  msg = Buffer.concat([msg, prng(65535)])

test_encrypt_decrypt = (T, encryptor, decryptor, nonce, cb) ->
  ciphertext = encryptor.encrypt({plaintext : msg, nonce, pubkey : decryptor.publicKey})
  plaintext = decryptor.decrypt({ciphertext : ciphertext, nonce, pubkey : encryptor.publicKey})
  T.assert(util.bufeq_secure(msg, plaintext)?, "inconsistency detected: msg=#{msg}, ciphertext=#{ciphertext}, plaintext=#{plaintext}")
  cb()

test_encrypt_encrypt = (T, tweetnacl, sodium, nonce, recipient, cb) ->
  twncl_ctext = tweetnacl.encrypt({plaintext : msg, nonce, pubkey : recipient.publicKey})
  sodium_ctext = sodium.encrypt({plaintext : msg, nonce, pubkey : recipient.publicKey})
  T.assert(util.bufeq_secure(twncl_ctext, sodium_ctext)?, "ciphertexts differ: tweetnacl=#{twncl_ctext}, sodium=#{sodium_ctext}")
  cb()

test_sbox_open = (T, encryptor, decryptor, nonce, cb) ->
  ciphertext = encryptor.secretbox({plaintext : msg, nonce})
  plaintext = decryptor.secretbox_open({ciphertext, nonce})
  T.assert(util.bufeq_secure(msg, plaintext)?, "inconsistency detected: msg=#{msg}, ciphertext=#{ciphertext}, plaintext=#{plaintext}")
  cb()

test_precompute = (T, encryptor, decryptor, nonce, cb) ->
  secret = encryptor.box_beforenm({pubkey : decryptor.publicKey, seckey : encryptor.secretKey})
  ciphertext = encryptor.encrypt({plaintext : msg, nonce, pubkey : decryptor.publicKey})
  plaintext = decryptor.box_open_afternm({ciphertext, nonce, secret})
  T.assert(util.bufeq_secure(msg, plaintext)?, "inconsistency detected: msg=#{msg}, ciphertext=#{ciphertext}, plaintext=#{plaintext}")
  cb()

#===============================================================================

exports.test_tweetnacl_consistency = (T, cb) ->
  tweetnacl = main.alloc({force_js : true})
  tweetnacl.genBoxPair()
  await test_encrypt_decrypt(T, tweetnacl, tweetnacl, prng(24), defer())
  cb()

exports.test_libsodium_consistency = (T, cb) ->
  sodium = main.alloc({force_js : false})
  sodium.genBoxPair()
  await test_encrypt_decrypt(T, sodium, sodium, prng(24), defer())
  cb()

exports.test_cross_consistency = (T, cb) ->
  sodium = main.alloc({force_js : false})
  sodium.genBoxPair()
  tweetnacl = main.alloc({force_js : true})
  tweetnacl.genBoxPair()
  await test_encrypt_decrypt(T, sodium, tweetnacl, prng(24), defer())
  await test_encrypt_decrypt(T, tweetnacl, sodium, prng(24), defer())
  cb()

exports.test_ciphertext_output = (T, cb) ->
  tweetnacl = main.alloc({force_js : true})
  tweetnacl.genBoxPair()
  sodium = main.alloc({force_js : false})
  sodium.secretKey = tweetnacl.secretKey
  sodium.publicKey = tweetnacl.publicKey
  recipient = main.alloc({force_js : true})
  recipient.genBoxPair()
  await test_encrypt_encrypt(T, tweetnacl, sodium, prng(24), recipient, defer())
  cb()

exports.test_secretbox = (T, cb) ->
  tweetnacl = main.alloc({force_js : true})
  tweetnacl.genBoxPair()
  sodium = main.alloc({force_js : false})
  sodium.secretKey = tweetnacl.secretKey
  await test_sbox_open(T, tweetnacl, tweetnacl, prng(24), defer())
  await test_sbox_open(T, sodium, sodium, prng(24), defer())
  await test_sbox_open(T, tweetnacl, sodium, prng(24), defer())
  await test_sbox_open(T, sodium, tweetnacl, prng(24), defer())
  cb()

exports.test_before_after = (T, cb) ->
  tweetnacl = main.alloc({force_js : true})
  tweetnacl.genBoxPair()
  sodium = main.alloc({force_js : false})
  sodium.secretKey = tweetnacl.secretKey
  sodium.publicKey = tweetnacl.publicKey
  await test_precompute(T, tweetnacl, tweetnacl, prng(24), defer())
  await test_precompute(T, sodium, sodium, prng(24), defer())
  await test_precompute(T, tweetnacl, sodium, prng(24), defer())
  await test_precompute(T, sodium, tweetnacl, prng(24), defer())
  cb()
