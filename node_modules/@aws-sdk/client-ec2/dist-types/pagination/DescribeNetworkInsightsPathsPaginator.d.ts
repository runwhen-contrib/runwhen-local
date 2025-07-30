import { Paginator } from "@smithy/types";
import { DescribeNetworkInsightsPathsCommandInput, DescribeNetworkInsightsPathsCommandOutput } from "../commands/DescribeNetworkInsightsPathsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeNetworkInsightsPaths: (config: EC2PaginationConfiguration, input: DescribeNetworkInsightsPathsCommandInput, ...rest: any[]) => Paginator<DescribeNetworkInsightsPathsCommandOutput>;
