import { AbstractMigration } from '../base/abstract-migration';
export declare class IgnoreNodeModulesMigration extends AbstractMigration {
    readonly deprecated = true;
    readonly propertyName = "ignoreNodeModules";
    run(value: unknown): void;
}
