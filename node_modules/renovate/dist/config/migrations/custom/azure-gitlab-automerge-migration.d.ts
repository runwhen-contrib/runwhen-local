import { AbstractMigration } from '../base/abstract-migration';
export declare class AzureGitLabAutomergeMigration extends AbstractMigration {
    readonly deprecated = true;
    readonly propertyName: RegExp;
    run(value: unknown): void;
}
