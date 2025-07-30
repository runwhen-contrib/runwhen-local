import { Paginator } from "@smithy/types";
import {
  DescribeRouteTablesCommandInput,
  DescribeRouteTablesCommandOutput,
} from "../commands/DescribeRouteTablesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeRouteTables: (
  config: EC2PaginationConfiguration,
  input: DescribeRouteTablesCommandInput,
  ...rest: any[]
) => Paginator<DescribeRouteTablesCommandOutput>;
