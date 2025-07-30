import { Paginator } from "@smithy/types";
import { DescribeIpamResourceDiscoveriesCommandInput, DescribeIpamResourceDiscoveriesCommandOutput } from "../commands/DescribeIpamResourceDiscoveriesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeIpamResourceDiscoveries: (config: EC2PaginationConfiguration, input: DescribeIpamResourceDiscoveriesCommandInput, ...rest: any[]) => Paginator<DescribeIpamResourceDiscoveriesCommandOutput>;
