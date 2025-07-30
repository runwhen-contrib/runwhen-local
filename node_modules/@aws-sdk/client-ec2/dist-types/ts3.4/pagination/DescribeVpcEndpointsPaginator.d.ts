import { Paginator } from "@smithy/types";
import {
  DescribeVpcEndpointsCommandInput,
  DescribeVpcEndpointsCommandOutput,
} from "../commands/DescribeVpcEndpointsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeVpcEndpoints: (
  config: EC2PaginationConfiguration,
  input: DescribeVpcEndpointsCommandInput,
  ...rest: any[]
) => Paginator<DescribeVpcEndpointsCommandOutput>;
