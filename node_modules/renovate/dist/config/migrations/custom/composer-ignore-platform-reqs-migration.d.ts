import { AbstractMigration } from '../base/abstract-migration';
export declare class ComposerIgnorePlatformReqsMigration extends AbstractMigration {
    readonly propertyName = "composerIgnorePlatformReqs";
    run(value: unknown): void;
}
