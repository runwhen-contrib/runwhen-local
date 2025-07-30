import { Paginator } from "@smithy/types";
import {
  DescribeDBClusterEndpointsCommandInput,
  DescribeDBClusterEndpointsCommandOutput,
} from "../commands/DescribeDBClusterEndpointsCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeDBClusterEndpoints: (
  config: RDSPaginationConfiguration,
  input: DescribeDBClusterEndpointsCommandInput,
  ...rest: any[]
) => Paginator<DescribeDBClusterEndpointsCommandOutput>;
