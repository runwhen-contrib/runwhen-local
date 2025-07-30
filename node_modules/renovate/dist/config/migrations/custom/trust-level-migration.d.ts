import { AbstractMigration } from '../base/abstract-migration';
export declare class TrustLevelMigration extends AbstractMigration {
    readonly deprecated = true;
    readonly propertyName = "trustLevel";
    run(value: unknown): void;
}
