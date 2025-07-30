import { AbstractMigration } from '../base/abstract-migration';
export declare class RequireConfigMigration extends AbstractMigration {
    readonly propertyName = "requireConfig";
    run(value: unknown): void;
}
