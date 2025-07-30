import { Paginator } from "@smithy/types";
import { DescribeInstanceEventWindowsCommandInput, DescribeInstanceEventWindowsCommandOutput } from "../commands/DescribeInstanceEventWindowsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeInstanceEventWindows: (config: EC2PaginationConfiguration, input: DescribeInstanceEventWindowsCommandInput, ...rest: any[]) => Paginator<DescribeInstanceEventWindowsCommandOutput>;
