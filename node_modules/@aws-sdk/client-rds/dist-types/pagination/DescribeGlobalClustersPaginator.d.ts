import { Paginator } from "@smithy/types";
import { DescribeGlobalClustersCommandInput, DescribeGlobalClustersCommandOutput } from "../commands/DescribeGlobalClustersCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeGlobalClusters: (config: RDSPaginationConfiguration, input: DescribeGlobalClustersCommandInput, ...rest: any[]) => Paginator<DescribeGlobalClustersCommandOutput>;
