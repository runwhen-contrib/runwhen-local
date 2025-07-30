import { Paginator } from "@smithy/types";
import {
  DescribeVerifiedAccessEndpointsCommandInput,
  DescribeVerifiedAccessEndpointsCommandOutput,
} from "../commands/DescribeVerifiedAccessEndpointsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeVerifiedAccessEndpoints: (
  config: EC2PaginationConfiguration,
  input: DescribeVerifiedAccessEndpointsCommandInput,
  ...rest: any[]
) => Paginator<DescribeVerifiedAccessEndpointsCommandOutput>;
