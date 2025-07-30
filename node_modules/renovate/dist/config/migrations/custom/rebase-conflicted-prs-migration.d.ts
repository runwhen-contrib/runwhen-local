import { AbstractMigration } from '../base/abstract-migration';
export declare class RebaseConflictedPrs extends AbstractMigration {
    readonly deprecated = true;
    readonly propertyName = "rebaseConflictedPrs";
    run(value: unknown): void;
}
