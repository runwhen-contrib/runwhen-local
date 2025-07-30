import { AbstractMigration } from '../base/abstract-migration';
export declare class EnabledManagersMigration extends AbstractMigration {
    readonly propertyName = "enabledManagers";
    run(value: unknown): void;
}
