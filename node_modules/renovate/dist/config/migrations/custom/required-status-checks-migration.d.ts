import { AbstractMigration } from '../base/abstract-migration';
export declare class RequiredStatusChecksMigration extends AbstractMigration {
    readonly deprecated = true;
    readonly propertyName = "requiredStatusChecks";
    run(value: unknown): void;
}
