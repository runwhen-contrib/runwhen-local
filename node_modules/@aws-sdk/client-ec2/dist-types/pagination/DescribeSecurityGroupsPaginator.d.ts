import { Paginator } from "@smithy/types";
import { DescribeSecurityGroupsCommandInput, DescribeSecurityGroupsCommandOutput } from "../commands/DescribeSecurityGroupsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeSecurityGroups: (config: EC2PaginationConfiguration, input: DescribeSecurityGroupsCommandInput, ...rest: any[]) => Paginator<DescribeSecurityGroupsCommandOutput>;
