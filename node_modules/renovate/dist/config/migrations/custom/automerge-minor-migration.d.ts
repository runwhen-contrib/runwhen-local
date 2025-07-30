import { AbstractMigration } from '../base/abstract-migration';
export declare class AutomergeMinorMigration extends AbstractMigration {
    readonly deprecated = true;
    readonly propertyName = "automergeMinor";
    run(value: unknown): void;
}
