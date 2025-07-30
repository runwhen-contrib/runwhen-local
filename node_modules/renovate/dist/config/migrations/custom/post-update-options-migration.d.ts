import { AbstractMigration } from '../base/abstract-migration';
export declare class PostUpdateOptionsMigration extends AbstractMigration {
    readonly propertyName = "postUpdateOptions";
    run(value: unknown): void;
}
