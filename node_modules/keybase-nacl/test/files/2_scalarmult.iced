crypto = require('crypto')
prng = crypto.prng
main = require('../..')
util = require('../../lib/util.js')

test_scalarmult_ecdh = (T, nacl_priv, nacl_pub, cb) ->
    x = prng(32) # priv key
    R = nacl_priv.scalarmult_base(x) # pub key

    v = prng(32)
    V = nacl_pub.scalarmult_base(v)
    S = nacl_pub.scalarmult(v, R)

    S2 = nacl_priv.scalarmult(x, V)

    T.assert(not util.bufeq_secure(x, v), "x == v, prng failure?")
    T.assert(not util.bufeq_secure(R, V), "R == V, same G*x for different x")
    T.assert(util.bufeq_secure(S, S2), "S != S2 after ecdh routine")
    cb()

exports.test_tweetnacl_ecdh = (T, cb) ->
    tweetnacl = main.alloc({force_js : true})
    test_scalarmult_ecdh T, tweetnacl, tweetnacl, cb

exports.test_sodium_ecdh = (T, cb) ->
    sodium = main.alloc({force_js : false})
    test_scalarmult_ecdh T, sodium, sodium, cb

exports.test_cross_ecdh = (T, cb) ->
    tweetnacl = main.alloc({force_js : true})
    sodium = main.alloc({force_js : false})
    await test_scalarmult_ecdh T, tweetnacl, sodium, defer()
    await test_scalarmult_ecdh T, sodium, tweetnacl, defer()
    cb()

