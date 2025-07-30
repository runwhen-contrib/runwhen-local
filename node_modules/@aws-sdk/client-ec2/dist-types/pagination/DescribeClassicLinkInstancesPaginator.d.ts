import { Paginator } from "@smithy/types";
import { DescribeClassicLinkInstancesCommandInput, DescribeClassicLinkInstancesCommandOutput } from "../commands/DescribeClassicLinkInstancesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeClassicLinkInstances: (config: EC2PaginationConfiguration, input: DescribeClassicLinkInstancesCommandInput, ...rest: any[]) => Paginator<DescribeClassicLinkInstancesCommandOutput>;
