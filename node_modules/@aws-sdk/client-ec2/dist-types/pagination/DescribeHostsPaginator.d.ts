import { Paginator } from "@smithy/types";
import { DescribeHostsCommandInput, DescribeHostsCommandOutput } from "../commands/DescribeHostsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeHosts: (config: EC2PaginationConfiguration, input: DescribeHostsCommandInput, ...rest: any[]) => Paginator<DescribeHostsCommandOutput>;
