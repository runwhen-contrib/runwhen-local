import { Paginator } from "@smithy/types";
import { DescribeByoipCidrsCommandInput, DescribeByoipCidrsCommandOutput } from "../commands/DescribeByoipCidrsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeByoipCidrs: (config: EC2PaginationConfiguration, input: DescribeByoipCidrsCommandInput, ...rest: any[]) => Paginator<DescribeByoipCidrsCommandOutput>;
