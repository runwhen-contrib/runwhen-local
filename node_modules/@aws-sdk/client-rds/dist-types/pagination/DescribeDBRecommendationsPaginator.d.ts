import { Paginator } from "@smithy/types";
import { DescribeDBRecommendationsCommandInput, DescribeDBRecommendationsCommandOutput } from "../commands/DescribeDBRecommendationsCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeDBRecommendations: (config: RDSPaginationConfiguration, input: DescribeDBRecommendationsCommandInput, ...rest: any[]) => Paginator<DescribeDBRecommendationsCommandOutput>;
