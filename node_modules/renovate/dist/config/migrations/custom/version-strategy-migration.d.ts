import { AbstractMigration } from '../base/abstract-migration';
export declare class VersionStrategyMigration extends AbstractMigration {
    readonly deprecated = true;
    readonly propertyName = "versionStrategy";
    run(value: unknown): void;
}
