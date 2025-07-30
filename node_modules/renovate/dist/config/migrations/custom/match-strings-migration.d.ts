import { AbstractMigration } from '../base/abstract-migration';
export declare class MatchStringsMigration extends AbstractMigration {
    readonly propertyName = "matchStrings";
    run(value: unknown): void;
}
