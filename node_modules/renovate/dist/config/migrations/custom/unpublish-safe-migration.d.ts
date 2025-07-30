import { AbstractMigration } from '../base/abstract-migration';
export declare class UnpublishSafeMigration extends AbstractMigration {
    private static readonly SUPPORTED_VALUES;
    readonly deprecated = true;
    readonly propertyName = "unpublishSafe";
    run(value: unknown): void;
    private isSupportedValue;
}
