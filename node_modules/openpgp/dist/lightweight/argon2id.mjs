/*! OpenPGP.js v6.1.0 - 2025-01-30 - this is LGPL licensed code, see LICENSE/our website https://openpgpjs.org/ for more information. */
const globalThis = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

// Adapted from the reference implementation in RFC7693
// Initial port to Javascript by https://github.com/dcposch and https://github.com/emilbayes

// Uint64 values are represented using two Uint32s, stored as little endian
// NB: Uint32Arrays endianness depends on the underlying system, so for interoperability, conversions between Uint8Array and Uint32Arrays
// need to be manually handled

// 64-bit unsigned addition (little endian, in place)
// Sets a[i,i+1] += b[j,j+1]
// `a` and `b` must be Uint32Array(2)
function ADD64 (a, i, b, j) {
  a[i] += b[j];
  a[i+1] += b[j+1] + (a[i] < b[j]); // add carry
}

// Increment 64-bit little-endian unsigned value by `c` (in place)
// `a` must be Uint32Array(2)
function INC64 (a, c) {
  a[0] += c;
  a[1] += (a[0] < c);
}

// G Mixing function
// The ROTRs are inlined for speed
function G$1 (v, m, a, b, c, d, ix, iy) {
  ADD64(v, a, v, b); // v[a,a+1] += v[b,b+1]
  ADD64(v, a, m, ix); // v[a, a+1] += x ... x0

  // v[d,d+1] = (v[d,d+1] xor v[a,a+1]) rotated to the right by 32 bits
  let xor0 = v[d] ^ v[a];
  let xor1 = v[d + 1] ^ v[a + 1];
  v[d] = xor1;
  v[d + 1] = xor0;

  ADD64(v, c, v, d);

  // v[b,b+1] = (v[b,b+1] xor v[c,c+1]) rotated right by 24 bits
  xor0 = v[b] ^ v[c];
  xor1 = v[b + 1] ^ v[c + 1];
  v[b] = (xor0 >>> 24) ^ (xor1 << 8);
  v[b + 1] = (xor1 >>> 24) ^ (xor0 << 8);

  ADD64(v, a, v, b);
  ADD64(v, a, m, iy);

  // v[d,d+1] = (v[d,d+1] xor v[a,a+1]) rotated right by 16 bits
  xor0 = v[d] ^ v[a];
  xor1 = v[d + 1] ^ v[a + 1];
  v[d] = (xor0 >>> 16) ^ (xor1 << 16);
  v[d + 1] = (xor1 >>> 16) ^ (xor0 << 16);

  ADD64(v, c, v, d);

  // v[b,b+1] = (v[b,b+1] xor v[c,c+1]) rotated right by 63 bits
  xor0 = v[b] ^ v[c];
  xor1 = v[b + 1] ^ v[c + 1];
  v[b] = (xor1 >>> 31) ^ (xor0 << 1);
  v[b + 1] = (xor0 >>> 31) ^ (xor1 << 1);
}

// Initialization Vector
const BLAKE2B_IV32 = new Uint32Array([
  0xF3BCC908, 0x6A09E667, 0x84CAA73B, 0xBB67AE85,
  0xFE94F82B, 0x3C6EF372, 0x5F1D36F1, 0xA54FF53A,
  0xADE682D1, 0x510E527F, 0x2B3E6C1F, 0x9B05688C,
  0xFB41BD6B, 0x1F83D9AB, 0x137E2179, 0x5BE0CD19
]);

// These are offsets into a Uint64 buffer.
// Multiply them all by 2 to make them offsets into a Uint32 buffer
const SIGMA = new Uint8Array([
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3,
  11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4,
  7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8,
  9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13,
  2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9,
  12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11,
  13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10,
  6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5,
  10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0,
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3
].map(x => x * 2));

// Compression function. 'last' flag indicates last block.
// Note: we're representing 16 uint64s as 32 uint32s
function compress(S, last) {
  const v = new Uint32Array(32);
  const m = new Uint32Array(S.b.buffer, S.b.byteOffset, 32);

  // init work variables
  for (let i = 0; i < 16; i++) {
    v[i] = S.h[i];
    v[i + 16] = BLAKE2B_IV32[i];
  }

  // low 64 bits of offset
  v[24] ^= S.t0[0];
  v[25] ^= S.t0[1];
  // high 64 bits not supported (`t1`), offset may not be higher than 2**53-1

  // if last block
  const f0 = last ? 0xFFFFFFFF : 0;
  v[28] ^= f0;
  v[29] ^= f0;

  // twelve rounds of mixing
  for (let i = 0; i < 12; i++) {
    // ROUND(r)
    const i16 = i << 4;
    G$1(v, m, 0, 8, 16, 24,  SIGMA[i16 + 0], SIGMA[i16 + 1]);
    G$1(v, m, 2, 10, 18, 26, SIGMA[i16 + 2], SIGMA[i16 + 3]);
    G$1(v, m, 4, 12, 20, 28, SIGMA[i16 + 4], SIGMA[i16 + 5]);
    G$1(v, m, 6, 14, 22, 30, SIGMA[i16 + 6], SIGMA[i16 + 7]);
    G$1(v, m, 0, 10, 20, 30, SIGMA[i16 + 8], SIGMA[i16 + 9]);
    G$1(v, m, 2, 12, 22, 24, SIGMA[i16 + 10], SIGMA[i16 + 11]);
    G$1(v, m, 4, 14, 16, 26, SIGMA[i16 + 12], SIGMA[i16 + 13]);
    G$1(v, m, 6, 8, 18, 28,  SIGMA[i16 + 14], SIGMA[i16 + 15]);
  }

  for (let i = 0; i < 16; i++) {
    S.h[i] ^= v[i] ^ v[i + 16];
  }
}

// Creates a BLAKE2b hashing context
// Requires an output length between 1 and 64 bytes
// Takes an optional Uint8Array key
class Blake2b {
  constructor(outlen, key, salt, personal) {
    const params = new Uint8Array(64);
    //  0: outlen, keylen, fanout, depth
    //  4: leaf length, sequential mode
    //  8: node offset
    // 12: node offset
    // 16: node depth, inner length, rfu
    // 20: rfu
    // 24: rfu
    // 28: rfu
    // 32: salt
    // 36: salt
    // 40: salt
    // 44: salt
    // 48: personal
    // 52: personal
    // 56: personal
    // 60: personal

    // init internal state
    this.S = {
      b: new Uint8Array(BLOCKBYTES),
      h: new Uint32Array(OUTBYTES_MAX / 4),
      t0: new Uint32Array(2), // input counter `t`, lower 64-bits only
      c: 0, // `fill`, pointer within buffer, up to `BLOCKBYTES`
      outlen // output length in bytes
    };

    // init parameter block
    params[0] = outlen;
    if (key) params[1] = key.length;
    params[2] = 1; // fanout
    params[3] = 1; // depth
    if (salt) params.set(salt, 32);
    if (personal) params.set(personal, 48);
    const params32 = new Uint32Array(params.buffer, params.byteOffset, params.length / Uint32Array.BYTES_PER_ELEMENT);

    // initialize hash state
    for (let i = 0; i < 16; i++) {
      this.S.h[i] = BLAKE2B_IV32[i] ^ params32[i];
    }

    // key the hash, if applicable
    if (key) {
      const block = new Uint8Array(BLOCKBYTES);
      block.set(key);
      this.update(block);
    }
  }

  // Updates a BLAKE2b streaming hash
  // Requires Uint8Array (byte array)
  update(input) {
    if (!(input instanceof Uint8Array)) throw new Error('Input must be Uint8Array or Buffer')
    // for (let i = 0; i < input.length; i++) {
    //   if (this.S.c === BLOCKBYTES) { // buffer full
    //     INC64(this.S.t0, this.S.c) // add counters
    //     compress(this.S, false)
    //     this.S.c = 0 // empty buffer
    //   }
    //   this.S.b[this.S.c++] = input[i]
    // }
    let i = 0;
    while(i < input.length) {
      if (this.S.c === BLOCKBYTES) { // buffer full
        INC64(this.S.t0, this.S.c); // add counters
        compress(this.S, false);
        this.S.c = 0; // empty buffer
      }
      let left = BLOCKBYTES - this.S.c;
      this.S.b.set(input.subarray(i, i + left), this.S.c); // end index can be out of bounds
      const fill = Math.min(left, input.length - i);
      this.S.c += fill;
      i += fill;
    }
    return this
  }

  /**
   * Return a BLAKE2b hash, either filling the given Uint8Array or allocating a new one
   * @param {Uint8Array} [prealloc] - optional preallocated buffer
   * @returns {ArrayBuffer} message digest
   */
  digest(prealloc) {
    INC64(this.S.t0, this.S.c); // mark last block offset

    // final block, padded
    this.S.b.fill(0, this.S.c);
    this.S.c = BLOCKBYTES;
    compress(this.S, true);

    const out = prealloc || new Uint8Array(this.S.outlen);
    for (let i = 0; i < this.S.outlen; i++) {
      // must be loaded individually since default Uint32 endianness is platform dependant
      out[i] = this.S.h[i >> 2] >> (8 * (i & 3));
    }
    this.S.h = null; // prevent calling `update` after `digest`
    return out.buffer;
  }
}


function createHash(outlen, key, salt, personal) {
  if (outlen > OUTBYTES_MAX) throw new Error(`outlen must be at most ${OUTBYTES_MAX} (given: ${outlen})`)

  return new Blake2b(outlen, key, salt, personal)
}

const OUTBYTES_MAX = 64;
const BLOCKBYTES = 128;

const TYPE = 2;  // Argon2id
const VERSION = 0x13;
const TAGBYTES_MAX = 0xFFFFFFFF; // Math.pow(2, 32) - 1;
const TAGBYTES_MIN = 4; // Math.pow(2, 32) - 1;
const SALTBYTES_MAX = 0xFFFFFFFF; // Math.pow(2, 32) - 1;
const SALTBYTES_MIN = 8;
const passwordBYTES_MAX = 0xFFFFFFFF;// Math.pow(2, 32) - 1;
const passwordBYTES_MIN = 8;
const MEMBYTES_MAX = 0xFFFFFFFF;// Math.pow(2, 32) - 1;
const ADBYTES_MAX = 0xFFFFFFFF; // Math.pow(2, 32) - 1; // associated data (optional)
const SECRETBYTES_MAX = 32; // key (optional)

const ARGON2_BLOCK_SIZE = 1024;
const ARGON2_PREHASH_DIGEST_LENGTH = 64;

const isLittleEndian = new Uint8Array(new Uint16Array([0xabcd]).buffer)[0] === 0xcd;

// store n as a little-endian 32-bit Uint8Array inside buf (at buf[i:i+3])
function LE32(buf, n, i) {
  buf[i+0] = n;
  buf[i+1] = n >>  8;
  buf[i+2] = n >> 16;
  buf[i+3] = n >> 24;
  return buf;
}

/**
 * Store n as a 64-bit LE number in the given buffer (from buf[i] to buf[i+7])
 * @param {Uint8Array} buf
 * @param {Number} n
 * @param {Number} i
 */
function LE64(buf, n, i) {
  if (n > Number.MAX_SAFE_INTEGER) throw new Error("LE64: large numbers unsupported");
  // ECMAScript standard has engines convert numbers to 32-bit integers for bitwise operations
  // shifting by 32 or more bits is not supported (https://stackoverflow.com/questions/6729122/javascript-bit-shift-number-wraps)
  // so we manually extract each byte
  let remainder = n;
  for (let offset = i; offset < i+7; offset++) { // last byte can be ignored as it would overflow MAX_SAFE_INTEGER
    buf[offset] = remainder; // implicit & 0xff
    remainder = (remainder - buf[offset]) / 256;
  }
  return buf;
}

/**
 * Variable-Length Hash Function H'
 * @param {Number} outlen - T
 * @param {Uint8Array} X - value to hash
 * @param {Uint8Array} res - output buffer, of length `outlength` or larger
 */
function H_(outlen, X, res) {
  const V = new Uint8Array(64); // no need to keep around all V_i

  const V1_in = new Uint8Array(4 + X.length);
  LE32(V1_in, outlen, 0);
  V1_in.set(X, 4);
  if (outlen <= 64) {
    // H'^T(A) = H^T(LE32(T)||A)
    createHash(outlen).update(V1_in).digest(res);
    return res
  }

  const r = Math.ceil(outlen / 32) - 2;

  // Let V_i be a 64-byte block and W_i be its first 32 bytes.
  // V_1 = H^(64)(LE32(T)||A)
  // V_2 = H^(64)(V_1)
  // ...
  // V_r = H^(64)(V_{r-1})
  // V_{r+1} = H^(T-32*r)(V_{r})
  // H'^T(X) = W_1 || W_2 || ... || W_r || V_{r+1}
  for (let i = 0; i < r; i++) {
    createHash(64).update(i === 0 ? V1_in : V).digest(V);
    // store W_i in result buffer already
    res.set(V.subarray(0, 32), i*32);
  }
  // V_{r+1}
  const V_r1 = new Uint8Array(createHash(outlen - 32*r).update(V).digest());
  res.set(V_r1, r*32);

  return res;
}

// compute buf = xs ^ ys
function XOR(wasmContext, buf, xs, ys) {
  wasmContext.fn.XOR(
    buf.byteOffset,
    xs.byteOffset,
    ys.byteOffset,
  );
  return buf
}

/**
 * @param {Uint8Array} X (read-only)
 * @param {Uint8Array} Y (read-only)
 * @param {Uint8Array} R - output buffer
 * @returns
 */
function G(wasmContext, X, Y, R) {
  wasmContext.fn.G(
    X.byteOffset,
    Y.byteOffset,
    R.byteOffset,
    wasmContext.refs.gZ.byteOffset
  );
  return R;
}

function G2(wasmContext, X, Y, R) {
  wasmContext.fn.G2(
    X.byteOffset,
    Y.byteOffset,
    R.byteOffset,
    wasmContext.refs.gZ.byteOffset
  );
  return R;
}

// Generator for data-independent J1, J2. Each `next()` invocation returns a new pair of values.
function* makePRNG(wasmContext, pass, lane, slice, m_, totalPasses, segmentLength, segmentOffset) {
  // For each segment, we do the following. First, we compute the value Z as:
  // Z= ( LE64(r) || LE64(l) || LE64(sl) || LE64(m') || LE64(t) || LE64(y) )
  wasmContext.refs.prngTmp.fill(0);
  const Z = wasmContext.refs.prngTmp.subarray(0, 6 * 8);
  LE64(Z, pass, 0);
  LE64(Z, lane, 8);
  LE64(Z, slice, 16);
  LE64(Z, m_, 24);
  LE64(Z, totalPasses, 32);
  LE64(Z, TYPE, 40);

  // Then we compute q/(128*SL) 1024-byte values
  // G( ZERO(1024),
  //    G( ZERO(1024), Z || LE64(1) || ZERO(968) ) ),
  // ...,
  // G( ZERO(1024),
  //    G( ZERO(1024), Z || LE64(q/(128*SL)) || ZERO(968) )),
  for(let i = 1; i <= segmentLength; i++) {
    // tmp.set(Z); // no need to re-copy
    LE64(wasmContext.refs.prngTmp, i, Z.length); // tmp.set(ZER0968) not necessary, memory already zeroed
    const g2 = G2(wasmContext, wasmContext.refs.ZERO1024, wasmContext.refs.prngTmp, wasmContext.refs.prngR );

    // each invocation of G^2 outputs 1024 bytes that are to be partitioned into 8-bytes values, take as X1 || X2
    // NB: the first generated pair must be used for the first block of the segment, and so on.
    // Hence, if some blocks are skipped (e.g. during the first pass), the corresponding J1J2 are discarded based on the given segmentOffset.
    for(let k = i === 1 ? segmentOffset*8 : 0; k < g2.length; k += 8) {
       yield g2.subarray(k, k+8);
    }
  }
  return [];
}

function validateParams({ type, version, tagLength, password, salt, ad, secret, parallelism, memorySize, passes }) {
  const assertLength = (name, value, min, max) => {
    if (value < min || value > max) { throw new Error(`${name} size should be between ${min} and ${max} bytes`); }
  };

  if (type !== TYPE || version !== VERSION) throw new Error('Unsupported type or version');
  assertLength('password', password, passwordBYTES_MIN, passwordBYTES_MAX);
  assertLength('salt', salt, SALTBYTES_MIN, SALTBYTES_MAX);
  assertLength('tag', tagLength, TAGBYTES_MIN, TAGBYTES_MAX);
  assertLength('memory', memorySize, 8*parallelism, MEMBYTES_MAX);
  // optional fields
  ad && assertLength('associated data', ad, 0, ADBYTES_MAX);
  secret && assertLength('secret', secret, 0, SECRETBYTES_MAX);

  return { type, version, tagLength, password, salt, ad, secret, lanes: parallelism, memorySize, passes };
}

const KB = 1024;
const WASM_PAGE_SIZE = 64 * KB;

function argon2id(params, { memory, instance: wasmInstance }) {
  if (!isLittleEndian) throw new Error('BigEndian system not supported'); // optmisations assume LE system

  const ctx = validateParams({ type: TYPE, version: VERSION, ...params });

  const { G:wasmG, G2:wasmG2, xor:wasmXOR, getLZ:wasmLZ } = wasmInstance.exports;
  const wasmRefs = {};
  const wasmFn = {};
  wasmFn.G = wasmG;
  wasmFn.G2 = wasmG2;
  wasmFn.XOR = wasmXOR;

  // The actual number of blocks is m', which is m rounded down to the nearest multiple of 4*p.
  const m_ = 4 * ctx.lanes * Math.floor(ctx.memorySize / (4 * ctx.lanes));
  const requiredMemory = m_ * ARGON2_BLOCK_SIZE + 10 * KB; // Additional KBs for utility references
  if (memory.buffer.byteLength < requiredMemory) {
    const missing = Math.ceil((requiredMemory - memory.buffer.byteLength) / WASM_PAGE_SIZE);
    // If enough memory is available, the `memory.buffer` is internally detached and the reference updated.
    // Otherwise, the operation fails, and the original memory can still be used.
    memory.grow(missing);
  }

  let offset = 0;
  // Init wasm memory needed in other functions
  wasmRefs.gZ = new Uint8Array(memory.buffer, offset, ARGON2_BLOCK_SIZE); offset+= wasmRefs.gZ.length;
  wasmRefs.prngR = new Uint8Array(memory.buffer, offset, ARGON2_BLOCK_SIZE); offset+=wasmRefs.prngR.length;
  wasmRefs.prngTmp = new Uint8Array(memory.buffer, offset, ARGON2_BLOCK_SIZE); offset+=wasmRefs.prngTmp.length;
  wasmRefs.ZERO1024 = new Uint8Array(memory.buffer, offset, 1024); offset+=wasmRefs.ZERO1024.length;
  // Init wasm memory needed locally
  const lz = new Uint32Array(memory.buffer, offset, 2); offset+=lz.length * Uint32Array.BYTES_PER_ELEMENT;
  const wasmContext = { fn: wasmFn, refs: wasmRefs };
  const newBlock = new Uint8Array(memory.buffer, offset, ARGON2_BLOCK_SIZE); offset+=newBlock.length;
  const blockMemory = new Uint8Array(memory.buffer, offset, ctx.memorySize * ARGON2_BLOCK_SIZE);
  const allocatedMemory = new Uint8Array(memory.buffer, 0, offset);

  // 1. Establish H_0
  const H0 = getH0(ctx);

  // 2. Allocate the memory as m' 1024-byte blocks
  // For p lanes, the memory is organized in a matrix B[i][j] of blocks with p rows (lanes) and q = m' / p columns.
  const q = m_ / ctx.lanes;
  const B = new Array(ctx.lanes).fill(null).map(() => new Array(q));
  const initBlock = (i, j) => {
    B[i][j] = blockMemory.subarray(i*q*1024 + j*1024, (i*q*1024 + j*1024) + ARGON2_BLOCK_SIZE);
    return B[i][j];
  };

  for (let i = 0; i < ctx.lanes; i++) {
    // const LEi = LE0; //  since p = 1 for us
    const tmp = new Uint8Array(H0.length + 8);
    // 3. Compute B[i][0] for all i ranging from (and including) 0 to (not including) p
    // B[i][0] = H'^(1024)(H_0 || LE32(0) || LE32(i))
    tmp.set(H0); LE32(tmp, 0, H0.length); LE32(tmp, i, H0.length + 4);
    H_(ARGON2_BLOCK_SIZE, tmp, initBlock(i, 0));
    // 4. Compute B[i][1] for all i ranging from (and including) 0 to (not including) p
    // B[i][1] = H'^(1024)(H_0 || LE32(1) || LE32(i))
    LE32(tmp, 1, H0.length);
    H_(ARGON2_BLOCK_SIZE, tmp, initBlock(i, 1));
  }

    // 5. Compute B[i][j] for all i ranging from (and including) 0 to (not including) p and for all j ranging from (and including) 2
    // to (not including) q. The computation MUST proceed slicewise (Section 3.4) : first, blocks from slice 0 are computed for all lanes
    // (in an arbitrary order of lanes), then blocks from slice 1 are computed, etc.
  const SL = 4; // vertical slices
  const segmentLength = q / SL;
  for (let pass = 0; pass < ctx.passes; pass++) {
      // The intersection of a slice and a lane is called a segment, which has a length of q/SL. Segments of the same slice can be computed in parallel
    for (let sl = 0; sl < SL; sl++) {
      const isDataIndependent = pass === 0 && sl <= 1;
      for (let i = 0; i < ctx.lanes; i++) { // lane
        // On the first slice of the first pass, blocks 0 and 1 are already filled
        let segmentOffset = sl === 0 && pass === 0 ? 2 : 0;
        // no need to generate all J1J2s, use iterator/generator that creates the value on the fly (to save memory)
        const PRNG = isDataIndependent ? makePRNG(wasmContext, pass, i, sl, m_, ctx.passes, segmentLength, segmentOffset) : null;
        for (segmentOffset; segmentOffset < segmentLength; segmentOffset++) {
          const j = sl * segmentLength + segmentOffset;
          const prevBlock = j > 0 ? B[i][j-1] : B[i][q-1]; // B[i][(j-1) mod q]

          // we can assume the PRNG is never done
          const J1J2 = isDataIndependent ? PRNG.next().value : prevBlock; // .subarray(0, 8) not required since we only pass the byteOffset to wasm
          // The block indices l and z are determined for each i, j differently for Argon2d, Argon2i, and Argon2id.
          wasmLZ(lz.byteOffset, J1J2.byteOffset, i, ctx.lanes, pass, sl, segmentOffset, SL, segmentLength);
          const l = lz[0]; const z = lz[1];
          // for (let i = 0; i < p; i++ )
          // B[i][j] = G(B[i][j-1], B[l][z])
          // The block indices l and z are determined for each i, j differently for Argon2d, Argon2i, and Argon2id.
          if (pass === 0) initBlock(i, j);
          G(wasmContext, prevBlock, B[l][z], pass > 0 ? newBlock : B[i][j]);

          // 6. If the number of passes t is larger than 1, we repeat step 5. However, blocks are computed differently as the old value is XORed with the new one
          if (pass > 0) XOR(wasmContext, B[i][j], newBlock, B[i][j]);
        }
      }
    }
  }

  // 7. After t steps have been iterated, the final block C is computed as the XOR of the last column:
  // C = B[0][q-1] XOR B[1][q-1] XOR ... XOR B[p-1][q-1]
  const C = B[0][q-1];
  for(let i = 1; i < ctx.lanes; i++) {
    XOR(wasmContext, C, C, B[i][q-1]);
  }

  const tag = H_(ctx.tagLength, C, new Uint8Array(ctx.tagLength));
  // clear memory since the module might be cached
  allocatedMemory.fill(0); // clear sensitive contents
  memory.grow(0); // allow deallocation
  // 8. The output tag is computed as H'^T(C).
  return tag;

}

function getH0(ctx) {
  const H = createHash(ARGON2_PREHASH_DIGEST_LENGTH);
  const ZERO32 = new Uint8Array(4);
  const params = new Uint8Array(24);
  LE32(params, ctx.lanes, 0);
  LE32(params, ctx.tagLength, 4);
  LE32(params, ctx.memorySize, 8);
  LE32(params, ctx.passes, 12);
  LE32(params, ctx.version, 16);
  LE32(params, ctx.type, 20);

  const toHash = [params];
  if (ctx.password) {
    toHash.push(LE32(new Uint8Array(4), ctx.password.length, 0));
    toHash.push(ctx.password);
  } else {
    toHash.push(ZERO32); // context.password.length
  }

  if (ctx.salt) {
    toHash.push(LE32(new Uint8Array(4), ctx.salt.length, 0));
    toHash.push(ctx.salt);
  } else {
    toHash.push(ZERO32); // context.salt.length
  }

  if (ctx.secret) {
    toHash.push(LE32(new Uint8Array(4), ctx.secret.length, 0));
    toHash.push(ctx.secret);
    // todo clear secret?
  } else {
    toHash.push(ZERO32); // context.secret.length
  }

  if (ctx.ad) {
    toHash.push(LE32(new Uint8Array(4), ctx.ad.length, 0));
    toHash.push(ctx.ad);
  } else {
    toHash.push(ZERO32); // context.ad.length
  }
  H.update(concatArrays(toHash));

  const outputBuffer = H.digest();
  return new Uint8Array(outputBuffer);
}

function concatArrays(arrays) {
  if (arrays.length === 1) return arrays[0];

  let totalLength = 0;
  for (let i = 0; i < arrays.length; i++) {
      if (!(arrays[i] instanceof Uint8Array)) {
          throw new Error('concatArrays: Data must be in the form of a Uint8Array');
      }

      totalLength += arrays[i].length;
  }

  const result = new Uint8Array(totalLength);
  let pos = 0;
  arrays.forEach((element) => {
      result.set(element, pos);
      pos += element.length;
  });

  return result;
}

let isSIMDSupported;
async function wasmLoader(memory, getSIMD, getNonSIMD) {
  const importObject = { env: { memory } };
  if (isSIMDSupported === undefined) {
    try {
      const loaded = await getSIMD(importObject);
      isSIMDSupported = true;
      return loaded;
    } catch(e) {
      isSIMDSupported = false;
    }
  }

  const loader = isSIMDSupported ? getSIMD : getNonSIMD;
  return loader(importObject);
}

async function setupWasm(getSIMD, getNonSIMD) {
  const memory = new WebAssembly.Memory({
    // in pages of 64KiB each
    // these values need to be compatible with those declared when building in `build-wasm`
    initial: 1040,  // 65MB
    maximum: 65536, // 4GB
  });
  const wasmModule = await wasmLoader(memory, getSIMD, getNonSIMD);

  /**
   * Argon2id hash function
   * @callback computeHash
   * @param {Object} params
   * @param {Uint8Array} params.password - password
   * @param {Uint8Array} params.salt - salt
   * @param {Integer} params.parallelism
   * @param {Integer} params.passes
   * @param {Integer} params.memorySize - in kibibytes
   * @param {Integer} params.tagLength - output tag length
   * @param {Uint8Array} [params.ad] - associated data (optional)
   * @param {Uint8Array} [params.secret] - secret data (optional)
   * @return {Uint8Array} argon2id hash
   */
  const computeHash = (params) => argon2id(params, { instance: wasmModule.instance, memory });

  return computeHash;
}

function _loadWasmModule (sync, filepath, src, imports) {
  function _instantiateOrCompile(source, imports, stream) {
    var instantiateFunc = WebAssembly.instantiate;
    var compileFunc = WebAssembly.compile;

    if (imports) {
      return instantiateFunc(source, imports)
    } else {
      return compileFunc(source)
    }
  }

  
var buf = null;


var raw = globalThis.atob(src);
var rawLength = raw.length;
buf = new Uint8Array(new ArrayBuffer(rawLength));
for(var i = 0; i < rawLength; i++) {
   buf[i] = raw.charCodeAt(i);
}



  {
    return _instantiateOrCompile(buf, imports)
  }
}

function wasmSIMD(imports){return _loadWasmModule(0, null, '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', imports)}

function wasmNonSIMD(imports){return _loadWasmModule(0, null, 'AGFzbQEAAAABPwhgBH9/f38AYAABf2AAAGADf39/AGARf39/f39/f39/f39/f39/f38AYAl/f39/f39/f38Bf2ABfwBgAX8BfwITAQNlbnYGbWVtb3J5AgGQCICABAMLCgIDBAAABQEGBwEEBQFwAQICBgkBfwFBkIjAAgsHfQoDeG9yAAEBRwADAkcyAAQFZ2V0TFoABRlfX2luZGlyZWN0X2Z1bmN0aW9uX3RhYmxlAQALX2luaXRpYWxpemUAABBfX2Vycm5vX2xvY2F0aW9uAAkJc3RhY2tTYXZlAAYMc3RhY2tSZXN0b3JlAAcKc3RhY2tBbGxvYwAICQcBAEEBCwEACssaCgMAAQtQAQJ/A0AgACAEQQN0IgNqIAIgA2opAwAgASADaikDAIU3AwAgACADQQhyIgNqIAIgA2opAwAgASADaikDAIU3AwAgBEECaiIEQYABRw0ACwveDwICfgF/IAAgAUEDdGoiEyATKQMAIhEgACAFQQN0aiIBKQMAIhJ8IBFCAYZC/v///x+DIBJC/////w+DfnwiETcDACAAIA1BA3RqIgUgESAFKQMAhUIgiSIRNwMAIAAgCUEDdGoiCSARIAkpAwAiEnwgEUL/////D4MgEkIBhkL+////H4N+fCIRNwMAIAEgESABKQMAhUIoiSIRNwMAIBMgESATKQMAIhJ8IBFC/////w+DIBJCAYZC/v///x+DfnwiETcDACAFIBEgBSkDAIVCMIkiETcDACAJIBEgCSkDACISfCARQv////8PgyASQgGGQv7///8fg358IhE3AwAgASARIAEpAwCFQgGJNwMAIAAgAkEDdGoiDSANKQMAIhEgACAGQQN0aiICKQMAIhJ8IBFCAYZC/v///x+DIBJC/////w+DfnwiETcDACAAIA5BA3RqIgYgESAGKQMAhUIgiSIRNwMAIAAgCkEDdGoiCiARIAopAwAiEnwgEUL/////D4MgEkIBhkL+////H4N+fCIRNwMAIAIgESACKQMAhUIoiSIRNwMAIA0gESANKQMAIhJ8IBFC/////w+DIBJCAYZC/v///x+DfnwiETcDACAGIBEgBikDAIVCMIkiETcDACAKIBEgCikDACISfCARQv////8PgyASQgGGQv7///8fg358IhE3AwAgAiARIAIpAwCFQgGJNwMAIAAgA0EDdGoiDiAOKQMAIhEgACAHQQN0aiIDKQMAIhJ8IBFCAYZC/v///x+DIBJC/////w+DfnwiETcDACAAIA9BA3RqIgcgESAHKQMAhUIgiSIRNwMAIAAgC0EDdGoiCyARIAspAwAiEnwgEUL/////D4MgEkIBhkL+////H4N+fCIRNwMAIAMgESADKQMAhUIoiSIRNwMAIA4gESAOKQMAIhJ8IBFC/////w+DIBJCAYZC/v///x+DfnwiETcDACAHIBEgBykDAIVCMIkiETcDACALIBEgCykDACISfCARQv////8PgyASQgGGQv7///8fg358IhE3AwAgAyARIAMpAwCFQgGJNwMAIAAgBEEDdGoiDyAPKQMAIhEgACAIQQN0aiIEKQMAIhJ8IBFCAYZC/v///x+DIBJC/////w+DfnwiETcDACAAIBBBA3RqIgggESAIKQMAhUIgiSIRNwMAIAAgDEEDdGoiACARIAApAwAiEnwgEUL/////D4MgEkIBhkL+////H4N+fCIRNwMAIAQgESAEKQMAhUIoiSIRNwMAIA8gESAPKQMAIhJ8IBFC/////w+DIBJCAYZC/v///x+DfnwiETcDACAIIBEgCCkDAIVCMIkiETcDACAAIBEgACkDACISfCARQv////8PgyASQgGGQv7///8fg358IhE3AwAgBCARIAQpAwCFQgGJNwMAIBMgEykDACIRIAIpAwAiEnwgEUIBhkL+////H4MgEkL/////D4N+fCIRNwMAIAggESAIKQMAhUIgiSIRNwMAIAsgESALKQMAIhJ8IBFC/////w+DIBJCAYZC/v///x+DfnwiETcDACACIBEgAikDAIVCKIkiETcDACATIBEgEykDACISfCARQv////8PgyASQgGGQv7///8fg358IhE3AwAgCCARIAgpAwCFQjCJIhE3AwAgCyARIAspAwAiEnwgEUL/////D4MgEkIBhkL+////H4N+fCIRNwMAIAIgESACKQMAhUIBiTcDACANIA0pAwAiESADKQMAIhJ8IBFCAYZC/v///x+DIBJC/////w+DfnwiETcDACAFIBEgBSkDAIVCIIkiETcDACAAIBEgACkDACISfCARQv////8PgyASQgGGQv7///8fg358IhE3AwAgAyARIAMpAwCFQiiJIhE3AwAgDSARIA0pAwAiEnwgEUL/////D4MgEkIBhkL+////H4N+fCIRNwMAIAUgESAFKQMAhUIwiSIRNwMAIAAgESAAKQMAIhJ8IBFC/////w+DIBJCAYZC/v///x+DfnwiETcDACADIBEgAykDAIVCAYk3AwAgDiAOKQMAIhEgBCkDACISfCARQgGGQv7///8fgyASQv////8Pg358IhE3AwAgBiARIAYpAwCFQiCJIhE3AwAgCSARIAkpAwAiEnwgEUL/////D4MgEkIBhkL+////H4N+fCIRNwMAIAQgESAEKQMAhUIoiSIRNwMAIA4gESAOKQMAIhJ8IBFC/////w+DIBJCAYZC/v///x+DfnwiETcDACAGIBEgBikDAIVCMIkiETcDACAJIBEgCSkDACISfCARQv////8PgyASQgGGQv7///8fg358IhE3AwAgBCARIAQpAwCFQgGJNwMAIA8gDykDACIRIAEpAwAiEnwgEUIBhkL+////H4MgEkL/////D4N+fCIRNwMAIAcgESAHKQMAhUIgiSIRNwMAIAogESAKKQMAIhJ8IBFC/////w+DIBJCAYZC/v///x+DfnwiETcDACABIBEgASkDAIVCKIkiETcDACAPIBEgDykDACISfCARQv////8PgyASQgGGQv7///8fg358IhE3AwAgByARIAcpAwCFQjCJIhE3AwAgCiARIAopAwAiEnwgEUL/////D4MgEkIBhkL+////H4N+fCIRNwMAIAEgESABKQMAhUIBiTcDAAvdCAEPfwNAIAIgBUEDdCIGaiABIAZqKQMAIAAgBmopAwCFNwMAIAIgBkEIciIGaiABIAZqKQMAIAAgBmopAwCFNwMAIAVBAmoiBUGAAUcNAAsDQCADIARBA3QiAGogACACaikDADcDACADIARBAXIiAEEDdCIBaiABIAJqKQMANwMAIAMgBEECciIBQQN0IgVqIAIgBWopAwA3AwAgAyAEQQNyIgVBA3QiBmogAiAGaikDADcDACADIARBBHIiBkEDdCIHaiACIAdqKQMANwMAIAMgBEEFciIHQQN0IghqIAIgCGopAwA3AwAgAyAEQQZyIghBA3QiCWogAiAJaikDADcDACADIARBB3IiCUEDdCIKaiACIApqKQMANwMAIAMgBEEIciIKQQN0IgtqIAIgC2opAwA3AwAgAyAEQQlyIgtBA3QiDGogAiAMaikDADcDACADIARBCnIiDEEDdCINaiACIA1qKQMANwMAIAMgBEELciINQQN0Ig5qIAIgDmopAwA3AwAgAyAEQQxyIg5BA3QiD2ogAiAPaikDADcDACADIARBDXIiD0EDdCIQaiACIBBqKQMANwMAIAMgBEEOciIQQQN0IhFqIAIgEWopAwA3AwAgAyAEQQ9yIhFBA3QiEmogAiASaikDADcDACADIARB//8DcSAAQf//A3EgAUH//wNxIAVB//8DcSAGQf//A3EgB0H//wNxIAhB//8DcSAJQf//A3EgCkH//wNxIAtB//8DcSAMQf//A3EgDUH//wNxIA5B//8DcSAPQf//A3EgEEH//wNxIBFB//8DcRACIARB8ABJIQAgBEEQaiEEIAANAAtBACEBIANBAEEBQRBBEUEgQSFBMEExQcAAQcEAQdAAQdEAQeAAQeEAQfAAQfEAEAIgA0ECQQNBEkETQSJBI0EyQTNBwgBBwwBB0gBB0wBB4gBB4wBB8gBB8wAQAiADQQRBBUEUQRVBJEElQTRBNUHEAEHFAEHUAEHVAEHkAEHlAEH0AEH1ABACIANBBkEHQRZBF0EmQSdBNkE3QcYAQccAQdYAQdcAQeYAQecAQfYAQfcAEAIgA0EIQQlBGEEZQShBKUE4QTlByABByQBB2ABB2QBB6ABB6QBB+ABB+QAQAiADQQpBC0EaQRtBKkErQTpBO0HKAEHLAEHaAEHbAEHqAEHrAEH6AEH7ABACIANBDEENQRxBHUEsQS1BPEE9QcwAQc0AQdwAQd0AQewAQe0AQfwAQf0AEAIgA0EOQQ9BHkEfQS5BL0E+QT9BzgBBzwBB3gBB3wBB7gBB7wBB/gBB/wAQAgNAIAIgAUEDdCIAaiIEIAAgA2opAwAgBCkDAIU3AwAgAiAAQQhyIgRqIgUgAyAEaikDACAFKQMAhTcDACACIABBEHIiBGoiBSADIARqKQMAIAUpAwCFNwMAIAIgAEEYciIAaiIEIAAgA2opAwAgBCkDAIU3AwAgAUEEaiIBQYABRw0ACwsWACAAIAEgAiADEAMgACACIAIgAxADC3sCAX8BfiACIQkgATUCACEKIAQgBXIEQCABKAIEIANwIQkLIAAgCTYCACAAIAdBAWsgBSAEGyAIbCAGQQFrQQBBfyAGGyACIAlGG2oiASAFQQFqIAhsQQAgBBtqIAGtIAogCn5CIIh+QiCIp0F/c2ogByAIbHA2AgQgAAsEACMACwYAIAAkAAsQACMAIABrQXBxIgAkACAACwUAQYAICw==', imports)}

const loadWasm = async () => setupWasm(
  (instanceObject) => wasmSIMD(instanceObject),
  (instanceObject) => wasmNonSIMD(instanceObject),
);

export { loadWasm as default };
