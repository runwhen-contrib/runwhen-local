import { Paginator } from "@smithy/types";
import { DescribeTransitGatewayRouteTablesCommandInput, DescribeTransitGatewayRouteTablesCommandOutput } from "../commands/DescribeTransitGatewayRouteTablesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeTransitGatewayRouteTables: (config: EC2PaginationConfiguration, input: DescribeTransitGatewayRouteTablesCommandInput, ...rest: any[]) => Paginator<DescribeTransitGatewayRouteTablesCommandOutput>;
