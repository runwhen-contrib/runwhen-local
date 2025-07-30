import { Paginator } from "@smithy/types";
import {
  DescribeCoipPoolsCommandInput,
  DescribeCoipPoolsCommandOutput,
} from "../commands/DescribeCoipPoolsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeCoipPools: (
  config: EC2PaginationConfiguration,
  input: DescribeCoipPoolsCommandInput,
  ...rest: any[]
) => Paginator<DescribeCoipPoolsCommandOutput>;
