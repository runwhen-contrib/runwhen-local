import { Paginator } from "@smithy/types";
import {
  DescribeVerifiedAccessGroupsCommandInput,
  DescribeVerifiedAccessGroupsCommandOutput,
} from "../commands/DescribeVerifiedAccessGroupsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeVerifiedAccessGroups: (
  config: EC2PaginationConfiguration,
  input: DescribeVerifiedAccessGroupsCommandInput,
  ...rest: any[]
) => Paginator<DescribeVerifiedAccessGroupsCommandOutput>;
