declare module "purepack" {
  function pack(
    arg: any,
    opts?: { floats?: boolean; sort_keys?: boolean; no_str8?: boolean }
  ): Buffer;
  function unpack(arg: Buffer, opts?: { no_ext?: boolean }): any;
}
