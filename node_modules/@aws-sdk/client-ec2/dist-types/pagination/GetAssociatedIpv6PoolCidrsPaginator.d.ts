import { Paginator } from "@smithy/types";
import { GetAssociatedIpv6PoolCidrsCommandInput, GetAssociatedIpv6PoolCidrsCommandOutput } from "../commands/GetAssociatedIpv6PoolCidrsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateGetAssociatedIpv6PoolCidrs: (config: EC2PaginationConfiguration, input: GetAssociatedIpv6PoolCidrsCommandInput, ...rest: any[]) => Paginator<GetAssociatedIpv6PoolCidrsCommandOutput>;
