import type { RenovateConfig } from '../../types';
import { AbstractMigration } from './abstract-migration';
export declare class RemovePropertyMigration extends AbstractMigration {
    readonly propertyName: string;
    constructor(propertyName: string, originalConfig: RenovateConfig, migratedConfig: RenovateConfig);
    run(): void;
}
