import { Paginator } from "@smithy/types";
import { DescribePublicIpv4PoolsCommandInput, DescribePublicIpv4PoolsCommandOutput } from "../commands/DescribePublicIpv4PoolsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribePublicIpv4Pools: (config: EC2PaginationConfiguration, input: DescribePublicIpv4PoolsCommandInput, ...rest: any[]) => Paginator<DescribePublicIpv4PoolsCommandOutput>;
