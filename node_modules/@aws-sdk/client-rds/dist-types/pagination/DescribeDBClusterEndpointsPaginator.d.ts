import { Paginator } from "@smithy/types";
import { DescribeDBClusterEndpointsCommandInput, DescribeDBClusterEndpointsCommandOutput } from "../commands/DescribeDBClusterEndpointsCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeDBClusterEndpoints: (config: RDSPaginationConfiguration, input: DescribeDBClusterEndpointsCommandInput, ...rest: any[]) => Paginator<DescribeDBClusterEndpointsCommandOutput>;
