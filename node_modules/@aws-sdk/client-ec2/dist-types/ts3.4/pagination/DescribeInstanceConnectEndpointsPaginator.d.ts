import { Paginator } from "@smithy/types";
import {
  DescribeInstanceConnectEndpointsCommandInput,
  DescribeInstanceConnectEndpointsCommandOutput,
} from "../commands/DescribeInstanceConnectEndpointsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeInstanceConnectEndpoints: (
  config: EC2PaginationConfiguration,
  input: DescribeInstanceConnectEndpointsCommandInput,
  ...rest: any[]
) => Paginator<DescribeInstanceConnectEndpointsCommandOutput>;
