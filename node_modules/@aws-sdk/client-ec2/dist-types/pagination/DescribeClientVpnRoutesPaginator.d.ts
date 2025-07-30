import { Paginator } from "@smithy/types";
import { DescribeClientVpnRoutesCommandInput, DescribeClientVpnRoutesCommandOutput } from "../commands/DescribeClientVpnRoutesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeClientVpnRoutes: (config: EC2PaginationConfiguration, input: DescribeClientVpnRoutesCommandInput, ...rest: any[]) => Paginator<DescribeClientVpnRoutesCommandOutput>;
