import { Paginator } from "@smithy/types";
import {
  DescribeClientVpnEndpointsCommandInput,
  DescribeClientVpnEndpointsCommandOutput,
} from "../commands/DescribeClientVpnEndpointsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeClientVpnEndpoints: (
  config: EC2PaginationConfiguration,
  input: DescribeClientVpnEndpointsCommandInput,
  ...rest: any[]
) => Paginator<DescribeClientVpnEndpointsCommandOutput>;
