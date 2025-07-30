import { AbstractMigration } from '../base/abstract-migration';
export declare class RebaseStalePrsMigration extends AbstractMigration {
    readonly deprecated = true;
    readonly propertyName = "rebaseStalePrs";
    run(value: unknown): void;
}
