import { Paginator } from "@smithy/types";
import {
  DescribeIpv6PoolsCommandInput,
  DescribeIpv6PoolsCommandOutput,
} from "../commands/DescribeIpv6PoolsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeIpv6Pools: (
  config: EC2PaginationConfiguration,
  input: DescribeIpv6PoolsCommandInput,
  ...rest: any[]
) => Paginator<DescribeIpv6PoolsCommandOutput>;
