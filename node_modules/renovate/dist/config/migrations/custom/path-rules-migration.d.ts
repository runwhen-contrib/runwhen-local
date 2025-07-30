import { AbstractMigration } from '../base/abstract-migration';
export declare class PathRulesMigration extends AbstractMigration {
    readonly deprecated = true;
    readonly propertyName = "pathRules";
    run(value: unknown): void;
}
