import { Paginator } from "@smithy/types";
import {
  DescribeStaleSecurityGroupsCommandInput,
  DescribeStaleSecurityGroupsCommandOutput,
} from "../commands/DescribeStaleSecurityGroupsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeStaleSecurityGroups: (
  config: EC2PaginationConfiguration,
  input: DescribeStaleSecurityGroupsCommandInput,
  ...rest: any[]
) => Paginator<DescribeStaleSecurityGroupsCommandOutput>;
