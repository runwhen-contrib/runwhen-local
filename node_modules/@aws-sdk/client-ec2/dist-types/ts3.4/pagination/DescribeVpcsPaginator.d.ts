import { Paginator } from "@smithy/types";
import {
  DescribeVpcsCommandInput,
  DescribeVpcsCommandOutput,
} from "../commands/DescribeVpcsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeVpcs: (
  config: EC2PaginationConfiguration,
  input: DescribeVpcsCommandInput,
  ...rest: any[]
) => Paginator<DescribeVpcsCommandOutput>;
