import { Paginator } from "@smithy/types";
import {
  DescribeDBProxyEndpointsCommandInput,
  DescribeDBProxyEndpointsCommandOutput,
} from "../commands/DescribeDBProxyEndpointsCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeDBProxyEndpoints: (
  config: RDSPaginationConfiguration,
  input: DescribeDBProxyEndpointsCommandInput,
  ...rest: any[]
) => Paginator<DescribeDBProxyEndpointsCommandOutput>;
