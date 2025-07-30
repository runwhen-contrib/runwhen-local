import { AbstractMigration } from '../base/abstract-migration';
export declare class IgnoreNpmrcFileMigration extends AbstractMigration {
    readonly deprecated = true;
    readonly propertyName = "ignoreNpmrcFile";
    run(): void;
}
