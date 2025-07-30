import { Paginator } from "@smithy/types";
import { DescribeRouteServerEndpointsCommandInput, DescribeRouteServerEndpointsCommandOutput } from "../commands/DescribeRouteServerEndpointsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeRouteServerEndpoints: (config: EC2PaginationConfiguration, input: DescribeRouteServerEndpointsCommandInput, ...rest: any[]) => Paginator<DescribeRouteServerEndpointsCommandOutput>;
