export interface HostRulesResult {
    additionalNpmrcContent: string[];
    additionalYarnRcYml?: any;
}
export declare function processHostRules(): HostRulesResult;
