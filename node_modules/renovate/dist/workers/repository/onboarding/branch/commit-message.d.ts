import type { RenovateConfig } from '../../../../config/types';
import type { CommitMessage } from '../../model/commit-message';
export declare class OnboardingCommitMessageFactory {
    private readonly config;
    private readonly configFile;
    constructor(config: RenovateConfig, configFile: string);
    create(): CommitMessage;
}
