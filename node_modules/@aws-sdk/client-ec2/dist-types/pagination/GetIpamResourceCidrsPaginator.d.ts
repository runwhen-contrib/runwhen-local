import { Paginator } from "@smithy/types";
import { GetIpamResourceCidrsCommandInput, GetIpamResourceCidrsCommandOutput } from "../commands/GetIpamResourceCidrsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateGetIpamResourceCidrs: (config: EC2PaginationConfiguration, input: GetIpamResourceCidrsCommandInput, ...rest: any[]) => Paginator<GetIpamResourceCidrsCommandOutput>;
