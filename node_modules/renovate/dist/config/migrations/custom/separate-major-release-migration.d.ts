import { AbstractMigration } from '../base/abstract-migration';
export declare class SeparateMajorReleasesMigration extends AbstractMigration {
    readonly propertyName = "separateMajorReleases";
    run(value: unknown): void;
}
