import { AbstractMigration } from '../base/abstract-migration';
export declare class PackagePatternMigration extends AbstractMigration {
    readonly deprecated = true;
    readonly propertyName = "packagePattern";
    run(value: unknown): void;
}
