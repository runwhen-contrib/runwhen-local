import { AbstractMigration } from '../base/abstract-migration';
export declare class DryRunMigration extends AbstractMigration {
    readonly propertyName = "dryRun";
    run(value: unknown): void;
}
