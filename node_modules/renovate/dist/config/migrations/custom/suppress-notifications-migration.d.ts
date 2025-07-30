import { AbstractMigration } from '../base/abstract-migration';
export declare class SuppressNotificationsMigration extends AbstractMigration {
    readonly propertyName = "suppressNotifications";
    run(value: unknown): void;
}
