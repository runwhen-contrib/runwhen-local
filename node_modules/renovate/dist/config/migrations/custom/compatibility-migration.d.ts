import { AbstractMigration } from '../base/abstract-migration';
export declare class CompatibilityMigration extends AbstractMigration {
    readonly deprecated = true;
    readonly propertyName = "compatibility";
    run(value: unknown): void;
}
