import { Paginator } from "@smithy/types";
import { DescribeOptionGroupsCommandInput, DescribeOptionGroupsCommandOutput } from "../commands/DescribeOptionGroupsCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeOptionGroups: (config: RDSPaginationConfiguration, input: DescribeOptionGroupsCommandInput, ...rest: any[]) => Paginator<DescribeOptionGroupsCommandOutput>;
