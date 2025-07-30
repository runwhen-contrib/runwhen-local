import { AbstractMigration } from '../base/abstract-migration';
export declare class AutomergeMigration extends AbstractMigration {
    readonly propertyName = "automerge";
    run(value: unknown): void;
}
