import type { RenovateConfig } from '../../types';
import type { Migration } from '../types';
export declare abstract class AbstractMigration implements Migration {
    readonly deprecated: boolean;
    abstract readonly propertyName: string | RegExp;
    private readonly originalConfig;
    private readonly migratedConfig;
    constructor(originalConfig: RenovateConfig, migratedConfig: RenovateConfig);
    abstract run(value: unknown, key: string): void;
    protected get<Key extends keyof RenovateConfig>(key: Key): RenovateConfig[Key];
    protected has<Key extends keyof RenovateConfig>(key: Key): boolean;
    protected setSafely<Key extends keyof RenovateConfig>(key: Key, value: RenovateConfig[Key]): void;
    protected setHard<Key extends keyof RenovateConfig>(key: Key, value: RenovateConfig[Key]): void;
    protected rewrite(value: unknown): void;
    protected delete(property?: string | RegExp): void;
}
