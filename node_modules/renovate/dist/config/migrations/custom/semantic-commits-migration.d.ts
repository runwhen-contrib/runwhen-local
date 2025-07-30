import { AbstractMigration } from '../base/abstract-migration';
export declare class SemanticCommitsMigration extends AbstractMigration {
    readonly propertyName = "semanticCommits";
    run(value: unknown): void;
}
