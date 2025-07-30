import { AbstractMigration } from '../base/abstract-migration';
export declare class PackagesMigration extends AbstractMigration {
    readonly deprecated = true;
    readonly propertyName = "packages";
    run(value: unknown): void;
}
