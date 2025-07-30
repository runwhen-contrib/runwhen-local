import { Paginator } from "@smithy/types";
import {
  DescribeDBProxiesCommandInput,
  DescribeDBProxiesCommandOutput,
} from "../commands/DescribeDBProxiesCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeDBProxies: (
  config: RDSPaginationConfiguration,
  input: DescribeDBProxiesCommandInput,
  ...rest: any[]
) => Paginator<DescribeDBProxiesCommandOutput>;
