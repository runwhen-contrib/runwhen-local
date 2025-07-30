import { AbstractMigration } from '../base/abstract-migration';
export declare class BaseBranchMigration extends AbstractMigration {
    readonly deprecated = true;
    readonly propertyName = "baseBranch";
    run(value: unknown): void;
}
