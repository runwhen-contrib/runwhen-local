import { Paginator } from "@smithy/types";
import {
  DescribeDBSubnetGroupsCommandInput,
  DescribeDBSubnetGroupsCommandOutput,
} from "../commands/DescribeDBSubnetGroupsCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeDBSubnetGroups: (
  config: RDSPaginationConfiguration,
  input: DescribeDBSubnetGroupsCommandInput,
  ...rest: any[]
) => Paginator<DescribeDBSubnetGroupsCommandOutput>;
