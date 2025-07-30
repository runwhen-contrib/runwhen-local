import { AbstractMigration } from '../base/abstract-migration';
export declare class AutomergeTypeMigration extends AbstractMigration {
    readonly propertyName = "automergeType";
    run(value: unknown): void;
}
