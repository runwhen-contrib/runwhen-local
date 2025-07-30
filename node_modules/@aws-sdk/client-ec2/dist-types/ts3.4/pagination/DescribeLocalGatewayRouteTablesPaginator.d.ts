import { Paginator } from "@smithy/types";
import {
  DescribeLocalGatewayRouteTablesCommandInput,
  DescribeLocalGatewayRouteTablesCommandOutput,
} from "../commands/DescribeLocalGatewayRouteTablesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeLocalGatewayRouteTables: (
  config: EC2PaginationConfiguration,
  input: DescribeLocalGatewayRouteTablesCommandInput,
  ...rest: any[]
) => Paginator<DescribeLocalGatewayRouteTablesCommandOutput>;
