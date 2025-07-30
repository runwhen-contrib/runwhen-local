import { AbstractMigration } from '../base/abstract-migration';
export declare class ScheduleMigration extends AbstractMigration {
    readonly propertyName = "schedule";
    run(value: unknown): void;
}
