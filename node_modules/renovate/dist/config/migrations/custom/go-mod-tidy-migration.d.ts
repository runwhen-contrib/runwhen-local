import { AbstractMigration } from '../base/abstract-migration';
export declare class GoModTidyMigration extends AbstractMigration {
    readonly deprecated = true;
    readonly propertyName = "gomodTidy";
    run(value: unknown): void;
}
