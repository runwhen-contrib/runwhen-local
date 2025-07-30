import { Paginator } from "@smithy/types";
import { DescribeCapacityBlockExtensionHistoryCommandInput, DescribeCapacityBlockExtensionHistoryCommandOutput } from "../commands/DescribeCapacityBlockExtensionHistoryCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeCapacityBlockExtensionHistory: (config: EC2PaginationConfiguration, input: DescribeCapacityBlockExtensionHistoryCommandInput, ...rest: any[]) => Paginator<DescribeCapacityBlockExtensionHistoryCommandOutput>;
