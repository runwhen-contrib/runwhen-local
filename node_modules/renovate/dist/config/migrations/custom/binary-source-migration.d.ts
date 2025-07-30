import { AbstractMigration } from '../base/abstract-migration';
export declare class BinarySourceMigration extends AbstractMigration {
    readonly propertyName = "binarySource";
    run(value: unknown): void;
}
