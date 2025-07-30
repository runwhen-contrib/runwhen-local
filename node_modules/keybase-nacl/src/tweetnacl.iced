{bufeq_secure} = require './util'
{b2u,u2b,Base} = require './base'

#================================================================

# 
# @class TweetNaCl
#
#  A pure-JS implemenation using the TweetNaCl library.
#
exports.TweetNaCl = class TweetNaCl extends Base

  #
  # @method verify
  #
  # Verify a signature, given a public key, the signature, and the payload
  # (if it's not alread attached).
  #
  # @param {Bool} detached If this is a detached signature or not.
  # @param {Buffer} payload The payload to verify. Optional, might be attached.
  # @param {Buffer} sig The signature to verify.
  # @return {List<Error,Buffer>} error on a failure, or nil on success. On sucess,
  #   also return the payload from the buffer.
  #
  verify : ({payload, sig, detached}) ->
    # "Attached" signatures in NaCl are just a concatenation of the signature
    # in front of the message.
    err = null
    if detached
      payload = Buffer.alloc(0) if not payload?
      if not @lib.js.sign.detached.verify b2u(payload), b2u(sig), b2u(@publicKey)
        err = new Error "Signature failed to verify"
    else if not (r_payload = @lib.js.sign.open b2u(sig), b2u(@publicKey))?
      err = new Error "signature didn't verify"
    else if not (r_payload = u2b r_payload)?
      err = new Error "failed to convert from a Uint8Array to a buffer"
    else if payload? and not bufeq_secure(r_payload, payload)
      err = new Error "got unexpected payload"
    else
      payload = r_payload
    if err? then payload = null
    return [ err, payload ]
  
  #
  # @method sign
  #
  # Generate a signature for the given payload, either attached or 
  # unattached
  #
  # @param {Bool} detached If this is a detached signature or not.
  # @param {Buffer} payload The payload to sign
  # @return {Buffer} The signature
  #
  sign : ({payload, detached}) ->
    f = if detached then @lib.js.sign.detached else @lib.js.sign
    u2b(f(b2u(payload), b2u(@secretKey)))

  #
  # @method encrypt
  # Encrypt a given plaintext
  # @param {Buffer} plaintext The plaintext to encrypt
  # @param {Buffer} nonce The nonce 
  # @param {Buffer} pubkey The public key to encrypt for
  # @return {Buffer} The encrypted plaintext
  encrypt : ({plaintext, nonce, pubkey}) ->
    return u2b(@lib.js.box(plaintext, nonce, pubkey, @secretKey))

  #
  # @method secretbox
  # Secretbox a given plaintext
  # @param {Buffer} plaintext The plaintext to encrypt
  # @param {Buffer} nonce The nonce
  # @return {Buffer} The encrypted plaintext
  secretbox : ({plaintext, nonce}) ->
    return u2b(@lib.js.secretbox(plaintext, nonce, @secretKey))

  #
  # @method decrypt
  # 
  # @param {Buffer} ciphertext The ciphertext to decrypt
  # @param {Buffer} nonce The nonce 
  # @param {Buffer} pubkey The public key that was used for encryption
  # @return {Buffer} The decrypted ciphertext
  decrypt : ({ciphertext, nonce, pubkey}) ->
    opened = @lib.js.box.open(b2u(ciphertext), nonce, pubkey, @secretKey)
    if not opened then throw new Error('TweetNaCl box_open failed!')
    else return u2b(opened)

  #
  # @method secretbox_open
  # Decrypt a given secretbox
  # @param {Buffer} ciphertext The ciphertext to decrypt
  # @param {Buffer} nonce The nonce
  # @return {Buffer} The decrypted ciphertext
  secretbox_open : ({ciphertext, nonce}) ->
    opened = @lib.js.secretbox.open(b2u(ciphertext), nonce, @secretKey)
    if not opened then throw new Error('TweetNaCl secretbox_open failed!')
    else return u2b(opened)

  #
  # @method box_beforenm
  # Precopmute a shared secret
  # @param {Buffer} pubkey The public key to precompute with
  # @param {Buffer} seckey The secret key to precompute with
  # @return {Buffer} The precomputed shared secret key
  box_beforenm : ({pubkey, seckey}) ->
    return u2b(@lib.js.box.before(pubkey, seckey))

  #
  # @method box_open_afternm
  # Precopmute a shared secret
  # @param {Buffer} ciphertext The ciphertext to decrypt
  # @param {Buffer} nonce The nonce
  # @param {Buffer} secret The precomputed secret
  # @return {Buffer} The decrypted ciphertext
  box_open_afternm : ({ciphertext, nonce, secret}) ->
    opened = @lib.js.box.open.after(b2u(ciphertext), nonce, secret)
    if not opened then throw new Error('TweetNaCl box_open_afternm failed!')
    else return u2b(opened)

  #
  # @method scalarmult_base
  # Compute the scalar product of a standard group element G and
  # integer n on curve 25519. Returns resulting group element Q.
  # @param {Buffer} n Integer.
  # @return {Buffer} Resulting group element.
  scalarmult_base : (n) ->
    return Buffer.from @lib.js.scalarMult.base n

  #
  # @method scalarmult
  # Multiply a group element P by an integer n on curve 25519. Return
  # resulting group element Q.
  # @param {Buffer} n Integer.
  # @param {Buffer} P Group element.
  # @return {Buffer} Resulting group element.
  scalarmult : (n, P) ->
    return Buffer.from @lib.js.scalarMult n, P

#================================================================
