import { Paginator } from "@smithy/types";
import { DescribeNetworkInsightsAccessScopeAnalysesCommandInput, DescribeNetworkInsightsAccessScopeAnalysesCommandOutput } from "../commands/DescribeNetworkInsightsAccessScopeAnalysesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeNetworkInsightsAccessScopeAnalyses: (config: EC2PaginationConfiguration, input: DescribeNetworkInsightsAccessScopeAnalysesCommandInput, ...rest: any[]) => Paginator<DescribeNetworkInsightsAccessScopeAnalysesCommandOutput>;
