import { AbstractMigration } from '../base/abstract-migration';
export declare class BranchPrefixMigration extends AbstractMigration {
    readonly propertyName = "branchPrefix";
    run(value: unknown): void;
}
