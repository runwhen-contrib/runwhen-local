import { Paginator } from "@smithy/types";
import { DescribeDBSecurityGroupsCommandInput, DescribeDBSecurityGroupsCommandOutput } from "../commands/DescribeDBSecurityGroupsCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeDBSecurityGroups: (config: RDSPaginationConfiguration, input: DescribeDBSecurityGroupsCommandInput, ...rest: any[]) => Paginator<DescribeDBSecurityGroupsCommandOutput>;
