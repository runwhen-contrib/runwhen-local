{bufeq_secure} = require './util'
{Base} = require './base'

#================================================================

# 
# @class Sodium
#
#  A C-based implemenation using the libsodium library
#
exports.Sodium = class Sodium extends Base

  #------

  _detach : (sig) ->
    l = @lib.c.crypto_sign_BYTES
    { sig: sig[0...l], payload : sig[l...] }

  _pad : (x) -> Buffer.concat([Buffer.alloc(16), x])
  _unpad : (x) -> x[16...]

  #------
  
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
    if detached and not payload?
      err = new Error "in detached mode, you must supply a payload"
      return [ err, null ]
    msg = if detached then Buffer.concat([sig, payload]) else sig

    r_payload = @lib.c.crypto_sign_open msg, @publicKey

    if not r_payload?
      err = new Error "Signature failed to verify"
    else if detached then # noop
    else if not payload? then payload = r_payload
    else if not bufeq_secure r_payload, payload
      err = new Error "got unexpected payload"
    if err? then payload = null
    return [ err, payload ]

  #
  # @method sign
  #
  # Generate a signature
  #
  # @param {Buffer} payload The message to sign
  # @param {Boolean} detached Whether this is a detached message or not
  #
  sign : ({detached, payload}) ->
    sig = @lib.c.crypto_sign payload, @secretKey
    if detached then @_detach(sig).sig else sig

  #
  # @method encrypt
  # Encrypt a given plaintext
  # @param {Buffer} plaintext The plaintext to encrypt
  # @param {Buffer} nonce The nonce
  # @param {Buffer} pubkey The public key to encrypt for
  # @return {Buffer} The encrypted plaintext
  encrypt : ({plaintext, nonce, pubkey}) ->
    return @_unpad(@lib.c.crypto_box(plaintext, nonce, pubkey, @secretKey))

  #
  # @method secretbox
  # Secretbox a given plaintext
  # @param {Buffer} plaintext The plaintext to encrypt
  # @param {Buffer} nonce The nonce
  # @return {Buffer} The encrypted plaintext
  secretbox : ({plaintext, nonce}) ->
    return @_unpad(@lib.c.crypto_secretbox(plaintext, nonce, @secretKey))

  #
  # @method decrypt
  # @param {Buffer} ciphertext The ciphertext to decrypt
  # @param {Buffer} nonce The nonce 
  # @param {Buffer} pubkey The public key that was used for encryption
  # @return {Buffer} The decrypted ciphertext
  decrypt : ({ciphertext, nonce, pubkey}) ->
    opened = @lib.c.crypto_box_open(@_pad(ciphertext), nonce, pubkey, @secretKey)
    if not opened then throw new Error('Sodium decrypt failed!')
    else return opened

  #
  # @method secretbox_open
  # Decrypt a given secretbox
  # @param {Buffer} ciphertext The ciphertext to decrypt
  # @param {Buffer} nonce The nonce
  # @return {Buffer} The decrypted ciphertext
  secretbox_open : ({ciphertext, nonce}) ->
    opened = @lib.c.crypto_secretbox_open(@_pad(ciphertext), nonce, @secretKey)
    if not opened then throw new Error('Sodium secretbox_open failed!')
    else return opened

  #
  # @method box_beforenm
  # Precopmute a shared secret
  # @param {Buffer} pubkey The public key to precompute with
  # @param {Buffer} seckey The secret key to precompute with
  # @return {Buffer} The precomputed shared secret key
  box_beforenm : ({pubkey, seckey}) ->
    return @lib.c.crypto_box_beforenm(pubkey, seckey)

  #
  # @method box_open_afternm
  # Precopmute a shared secret
  # @param {Buffer} ciphertext The ciphertext to decrypt
  # @param {Buffer} nonce The nonce
  # @param {Buffer} secret The precomputed secret
  # @return {Buffer} The decrypted ciphertext
  box_open_afternm : ({ciphertext, nonce, secret}) ->
    opened = @lib.c.crypto_box_open_afternm(@_pad(ciphertext), nonce, secret)
    if not opened then throw new Error('Sodium box_open_afternm failed!')
    else return opened

  #
  # @method scalarmult_base
  # Compute the scalar product of a standard group element G and
  # integer n on curve 25519. Returns resulting group element Q.
  # @param {Buffer} n Integer.
  # @return {Buffer} Resulting group element.
  scalarmult_base : (n) ->
    return Buffer.from @lib.c.crypto_scalarmult_base n

  #
  # @method scalarmult
  # Multiply a group element P by an integer n on curve 25519. Return
  # resulting group element Q.
  # @param {Buffer} n Integer.
  # @param {Buffer} P Group element.
  # @return {Buffer} Resulting group element.
  scalarmult : (n, P) ->
    return Buffer.from @lib.c.crypto_scalarmult n, P

#================================================================
