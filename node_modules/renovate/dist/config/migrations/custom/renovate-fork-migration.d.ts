import { AbstractMigration } from '../base/abstract-migration';
export declare class RenovateForkMigration extends AbstractMigration {
    readonly deprecated = true;
    readonly propertyName = "renovateFork";
    run(value: unknown): void;
}
