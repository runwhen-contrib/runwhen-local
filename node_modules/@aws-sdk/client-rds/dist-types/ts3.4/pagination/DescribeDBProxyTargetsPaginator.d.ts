import { Paginator } from "@smithy/types";
import {
  DescribeDBProxyTargetsCommandInput,
  DescribeDBProxyTargetsCommandOutput,
} from "../commands/DescribeDBProxyTargetsCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeDBProxyTargets: (
  config: RDSPaginationConfiguration,
  input: DescribeDBProxyTargetsCommandInput,
  ...rest: any[]
) => Paginator<DescribeDBProxyTargetsCommandOutput>;
