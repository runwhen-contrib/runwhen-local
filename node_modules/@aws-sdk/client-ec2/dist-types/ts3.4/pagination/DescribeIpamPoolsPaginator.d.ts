import { Paginator } from "@smithy/types";
import {
  DescribeIpamPoolsCommandInput,
  DescribeIpamPoolsCommandOutput,
} from "../commands/DescribeIpamPoolsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeIpamPools: (
  config: EC2PaginationConfiguration,
  input: DescribeIpamPoolsCommandInput,
  ...rest: any[]
) => Paginator<DescribeIpamPoolsCommandOutput>;
