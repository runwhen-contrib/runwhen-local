import { Paginator } from "@smithy/types";
import { DescribeClientVpnTargetNetworksCommandInput, DescribeClientVpnTargetNetworksCommandOutput } from "../commands/DescribeClientVpnTargetNetworksCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeClientVpnTargetNetworks: (config: EC2PaginationConfiguration, input: DescribeClientVpnTargetNetworksCommandInput, ...rest: any[]) => Paginator<DescribeClientVpnTargetNetworksCommandOutput>;
