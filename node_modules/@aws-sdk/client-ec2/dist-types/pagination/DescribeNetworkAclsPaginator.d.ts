import { Paginator } from "@smithy/types";
import { DescribeNetworkAclsCommandInput, DescribeNetworkAclsCommandOutput } from "../commands/DescribeNetworkAclsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeNetworkAcls: (config: EC2PaginationConfiguration, input: DescribeNetworkAclsCommandInput, ...rest: any[]) => Paginator<DescribeNetworkAclsCommandOutput>;
