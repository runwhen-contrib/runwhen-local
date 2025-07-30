import { AbstractMigration } from '../base/abstract-migration';
export declare class PackageNameMigration extends AbstractMigration {
    readonly deprecated = true;
    readonly propertyName = "packageName";
    run(value: unknown): void;
}
