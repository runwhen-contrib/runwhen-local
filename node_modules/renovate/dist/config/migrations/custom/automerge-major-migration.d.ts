import { AbstractMigration } from '../base/abstract-migration';
export declare class AutomergeMajorMigration extends AbstractMigration {
    readonly deprecated = true;
    readonly propertyName = "automergeMajor";
    run(value: unknown): void;
}
