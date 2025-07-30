import { AbstractMigration } from '../base/abstract-migration';
export declare class PinVersionsMigration extends AbstractMigration {
    readonly deprecated = true;
    readonly propertyName = "pinVersions";
    run(value: unknown): void;
}
