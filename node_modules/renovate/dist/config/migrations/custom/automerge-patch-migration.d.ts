import { AbstractMigration } from '../base/abstract-migration';
export declare class AutomergePatchMigration extends AbstractMigration {
    readonly deprecated = true;
    readonly propertyName = "automergePatch";
    run(value: unknown): void;
}
