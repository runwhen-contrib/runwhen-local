import { Codec, Schema, SerdeFunctions, ShapeDeserializer, ShapeSerializer } from "@smithy/types";
/**
 * @alpha
 */
export declare class CborCodec implements Codec<Uint8Array, Uint8Array> {
    private serdeContext?;
    createSerializer(): CborShapeSerializer;
    createDeserializer(): CborShapeDeserializer;
    setSerdeContext(serdeContext: SerdeFunctions): void;
}
/**
 * @alpha
 */
export declare class CborShapeSerializer implements ShapeSerializer {
    private serdeContext?;
    private value;
    setSerdeContext(serdeContext: SerdeFunctions): void;
    write(schema: Schema, value: unknown): void;
    flush(): Uint8Array;
}
/**
 * @alpha
 */
export declare class CborShapeDeserializer implements ShapeDeserializer {
    private serdeContext?;
    setSerdeContext(serdeContext: SerdeFunctions): void;
    read(schema: Schema, bytes: Uint8Array): any;
    private readValue;
}
