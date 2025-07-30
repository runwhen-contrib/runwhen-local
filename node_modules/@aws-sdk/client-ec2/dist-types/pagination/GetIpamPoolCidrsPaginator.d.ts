import { Paginator } from "@smithy/types";
import { GetIpamPoolCidrsCommandInput, GetIpamPoolCidrsCommandOutput } from "../commands/GetIpamPoolCidrsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateGetIpamPoolCidrs: (config: EC2PaginationConfiguration, input: GetIpamPoolCidrsCommandInput, ...rest: any[]) => Paginator<GetIpamPoolCidrsCommandOutput>;
