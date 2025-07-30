import { Paginator } from "@smithy/types";
import {
  DescribeSubnetsCommandInput,
  DescribeSubnetsCommandOutput,
} from "../commands/DescribeSubnetsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeSubnets: (
  config: EC2PaginationConfiguration,
  input: DescribeSubnetsCommandInput,
  ...rest: any[]
) => Paginator<DescribeSubnetsCommandOutput>;
