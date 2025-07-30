import Ajv, { AnySchemaObject } from "ajv/dist/2019";
export declare const draft7: (schema: AnySchemaObject) => void;
export declare const draft2019: (schema: AnySchemaObject) => void;
export declare const draft2020: (schema: AnySchemaObject) => void;
export declare function getAjv(): Ajv;
