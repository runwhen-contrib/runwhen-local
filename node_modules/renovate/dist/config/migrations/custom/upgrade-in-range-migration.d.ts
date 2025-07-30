import { AbstractMigration } from '../base/abstract-migration';
export declare class UpgradeInRangeMigration extends AbstractMigration {
    readonly deprecated = true;
    readonly propertyName = "upgradeInRange";
    run(value: unknown): void;
}
