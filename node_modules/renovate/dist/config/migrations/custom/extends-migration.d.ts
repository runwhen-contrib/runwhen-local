import { AbstractMigration } from '../base/abstract-migration';
export declare class ExtendsMigration extends AbstractMigration {
    readonly propertyName = "extends";
    run(): void;
    private normalizePresets;
    private normalizePreset;
}
