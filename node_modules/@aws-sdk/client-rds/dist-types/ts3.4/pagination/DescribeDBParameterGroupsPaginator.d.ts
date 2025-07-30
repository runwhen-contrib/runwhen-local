import { Paginator } from "@smithy/types";
import {
  DescribeDBParameterGroupsCommandInput,
  DescribeDBParameterGroupsCommandOutput,
} from "../commands/DescribeDBParameterGroupsCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeDBParameterGroups: (
  config: RDSPaginationConfiguration,
  input: DescribeDBParameterGroupsCommandInput,
  ...rest: any[]
) => Paginator<DescribeDBParameterGroupsCommandOutput>;
