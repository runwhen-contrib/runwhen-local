import { Paginator } from "@smithy/types";
import { DescribeNetworkInsightsAnalysesCommandInput, DescribeNetworkInsightsAnalysesCommandOutput } from "../commands/DescribeNetworkInsightsAnalysesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeNetworkInsightsAnalyses: (config: EC2PaginationConfiguration, input: DescribeNetworkInsightsAnalysesCommandInput, ...rest: any[]) => Paginator<DescribeNetworkInsightsAnalysesCommandOutput>;
