import { Paginator } from "@smithy/types";
import { DescribeDBProxyTargetGroupsCommandInput, DescribeDBProxyTargetGroupsCommandOutput } from "../commands/DescribeDBProxyTargetGroupsCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeDBProxyTargetGroups: (config: RDSPaginationConfiguration, input: DescribeDBProxyTargetGroupsCommandInput, ...rest: any[]) => Paginator<DescribeDBProxyTargetGroupsCommandOutput>;
