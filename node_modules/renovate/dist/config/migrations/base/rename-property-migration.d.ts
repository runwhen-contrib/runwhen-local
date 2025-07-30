import type { RenovateConfig } from '../../types';
import { AbstractMigration } from './abstract-migration';
export declare class RenamePropertyMigration extends AbstractMigration {
    readonly deprecated = true;
    readonly propertyName: string;
    private readonly newPropertyName;
    constructor(deprecatedPropertyName: string, newPropertyName: string, originalConfig: RenovateConfig, migratedConfig: RenovateConfig);
    run(value: unknown): void;
}
