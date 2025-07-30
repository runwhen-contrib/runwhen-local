import { Paginator } from "@smithy/types";
import { DescribeRouteServerPeersCommandInput, DescribeRouteServerPeersCommandOutput } from "../commands/DescribeRouteServerPeersCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeRouteServerPeers: (config: EC2PaginationConfiguration, input: DescribeRouteServerPeersCommandInput, ...rest: any[]) => Paginator<DescribeRouteServerPeersCommandOutput>;
