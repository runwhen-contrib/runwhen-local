import { AbstractMigration } from '../base/abstract-migration';
export declare class BranchNameMigration extends AbstractMigration {
    readonly propertyName = "branchName";
    run(value: unknown): void;
}
