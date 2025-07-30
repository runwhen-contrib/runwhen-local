import { MarshalError } from "./error";

/**
 * Parses a data exported by Ruby's `Marshal.load`.
 * @param buf A binary data to parse
 * @returns the decoded value
 * @throws {MarshalError} when the data contains an invalid format.
 */
export function parse(buf: Uint8Array): unknown {
  return new Parser(buf).read();
}

class Parser {
  private symbols: string[] = [];

  private objects: unknown[] = [];

  constructor(private buf: Uint8Array, private index = 0) {}

  public read(): unknown {
    this.symbols = [];
    this.objects = [];
    const major = this.readByte();
    const minor = this.readByte();
    if (major !== 4 || minor > 8) {
      throw new MarshalError(
        `incompatible marshal file format (can't be read): format version 4.8 required; ${major}.${minor} given`
      );
    }
    return this.readAny();
  }

  private readAny(): unknown {
    const tag = this.readByte();
    switch (tag) {
      // '"': an instance of String
      case 0x22:
        return this.entry(this.readString());
      // '/': an instance of Regexp
      case 0x2f: {
        const source = this.readString();
        // Discard flags
        this.readByte();
        return this.entry(new RegExp(source));
      }
      // '0': nil
      case 0x30:
        return null;
      // ':': an instance of Symbol
      case 0x3a: {
        const sym = this.readString();
        this.symbols.push(sym);
        return sym;
      }
      // ';': symbol reference
      case 0x3b: {
        const symref = this.readInt();
        if (symref < 0 || symref >= this.symbols.length) {
          throw new MarshalError("bad symbol");
        }
        return this.symbols[symref];
      }
      // '@': an object link
      case 0x40: {
        const objref = this.readInt();
        if (objref < 0 || objref >= this.objects.length) {
          throw new MarshalError("dump format error (unlinked)");
        }
        return this.objects[objref];
      }
      // 'C': an instance of String/Regexp/Array/Hash subclass
      case 0x43: {
        // Discard class name
        this.readAny();
        return this.readAny();
      }
      // 'F': false
      case 0x46:
        return false;
      // 'I': add instance variables
      case 0x49: {
        const obj = this.readAny();
        const length = this.readInt();
        for (let i = 0; i < length; i++) {
          // Discard instance variables
          this.readAny();
          this.readAny();
        }
        return obj;
      }
      // 'M': a module or class (old format)
      case 0x4d: {
        // Discard class/module name
        this.readBytes();
        return this.entry({});
      }
      // 'S': an instance of a struct
      case 0x53: {
        // Discard class name
        this.readAny();
        const length = this.readLength("struct");
        const struct: Record<string, unknown> = this.entry({});
        for (let i = 0; i < length; i++) {
          const key = this.readAny();
          const value = this.readAny();
          // Discard non-String keys
          if (typeof key === "number" || typeof key === "string") {
            Object.defineProperty(struct, key, {
              value,
              writable: true,
              configurable: true,
              enumerable: true,
            });
          }
        }
        return struct;
      }
      // 'T': true
      case 0x54:
        return true;
      // 'U': custom format (marshal_dump)
      case 0x55: {
        // Discard class name
        this.readAny();
        const obj = this.entry({});
        // Discard data
        this.readAny();
        return obj;
      }
      // '[': an instance of Array
      case 0x5b: {
        const length = this.readLength("array");
        const arr: unknown[] = this.entry([]);
        for (let i = 0; i < length; i++) {
          arr.push(this.readAny());
        }
        return arr;
      }
      // 'c': a class
      case 0x63: {
        // Discard class name
        this.readBytes();
        return this.entry({});
      }
      // 'd': TYPE_DATA
      case 0x64:
        throw new MarshalError("unimplemented: TYPE_DATA");
      // 'e': TYPE_EXTENDED
      case 0x65:
        throw new MarshalError("unimplemented: TYPE_EXTENDED");
      // 'f': an instance of Float
      case 0x66: {
        const s = this.readString();
        const f =
          s === "inf"
            ? Infinity
            : s === "-inf"
            ? -Infinity
            : s === "nan"
            ? NaN
            : parseFloat(s);
        return this.entry(f);
      }
      // 'i': an instance of Integer (small)
      case 0x69:
        return this.readInt();
      // 'l': an instance of Integer (large)
      case 0x6c: {
        const signChar = this.readByte();
        const length = this.readLength("string") * 2;
        let sum = 0;
        let magnitude = signChar === 0x2d ? -1 : 1;
        for (let i = 0; i < length; i++) {
          sum += this.readByte() * magnitude;
          magnitude *= 256;
        }
        return this.entry(sum);
      }
      // 'm': a module
      case 0x6d: {
        // Discard module name
        this.readBytes();
        return this.entry({});
      }
      // 'o': a plain object
      case 0x6f: {
        // Discard class name
        this.readAny();
        const obj = this.entry({});
        const length = this.readInt();
        for (let i = 0; i < length; i++) {
          // Discard instance variables
          this.readAny();
          this.readAny();
        }
        return obj;
      }
      // 'u': old custom format (_dump)
      case 0x75: {
        // Discard class name
        this.readAny();
        // Discard data
        this.readBytes();
        return this.entry({});
      }
      // '{': an instance of Hash (without default value)
      case 0x7b: {
        const length = this.readLength("hash");
        const hash: Record<string, unknown> = this.entry({});
        for (let i = 0; i < length; i++) {
          const key = this.readAny();
          const value = this.readAny();
          // Discard non-String keys
          if (typeof key === "number" || typeof key === "string") {
            Object.defineProperty(hash, key, {
              value,
              writable: true,
              configurable: true,
              enumerable: true,
            });
          }
        }
        return hash;
      }
      // '}': an instance of Hash (with default value)
      case 0x7d: {
        const length = this.readLength("hash");
        const hash: Record<string, unknown> = this.entry({});
        for (let i = 0; i < length; i++) {
          const key = this.readAny();
          const value = this.readAny();
          // Discard non-String keys
          if (typeof key === "number" || typeof key === "string") {
            Object.defineProperty(hash, key, {
              value,
              writable: true,
              configurable: true,
              enumerable: true,
            });
          }
        }
        hash["__ruby_default"] = this.readAny();
        return hash;
      }
      default:
        throw new MarshalError(`dump format error(0x${tag.toString(16)})`);
    }
  }

  private readLength(msg: string): number {
    const length = this.readInt();
    if (length < 0) {
      throw new MarshalError(`negative ${msg} size (or size too big)`);
    }
    return length;
  }

  private readInt(): number {
    const tag = this.readByte();
    if (tag === 0) {
      return 0;
    }
    if (tag >= 5 && tag < 128) {
      return tag - 5;
    }
    if (tag >= 128 && tag <= 251) {
      return tag - 251;
    }

    const length = tag < 128 ? tag : 256 - tag;
    let sum = 0;
    let magnitude = 1;
    for (let i = 0; i < length; i++) {
      sum += magnitude * this.readByte();
      magnitude *= 256;
    }
    if (tag >= 128) {
      sum -= magnitude;
    }
    return sum;
  }

  private readByte(): number {
    if (this.index >= this.buf.byteLength) {
      throw new MarshalError("marshal data too short");
    }
    const byte = this.buf[this.index];
    this.index++;
    return byte;
  }

  private readString(): string {
    const bytes = this.readBytes();
    if (typeof TextDecoder !== "function" && bytes.every((x) => x < 128)) {
      return String.fromCharCode(...Array.from(bytes));
    }
    return new TextDecoder().decode(bytes);
  }

  private readBytes(): Uint8Array {
    const length = this.readLength("string");
    if (this.index + length > this.buf.byteLength) {
      throw new MarshalError("marshal data too short");
    }
    const bytes = this.buf.subarray(this.index, this.index + length);
    this.index += length;
    return bytes;
  }

  private entry<T>(obj: T): T {
    this.objects.push(obj);
    return obj;
  }
}
