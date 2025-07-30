import { Paginator } from "@smithy/types";
import {
  DescribeDBClusterParameterGroupsCommandInput,
  DescribeDBClusterParameterGroupsCommandOutput,
} from "../commands/DescribeDBClusterParameterGroupsCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeDBClusterParameterGroups: (
  config: RDSPaginationConfiguration,
  input: DescribeDBClusterParameterGroupsCommandInput,
  ...rest: any[]
) => Paginator<DescribeDBClusterParameterGroupsCommandOutput>;
