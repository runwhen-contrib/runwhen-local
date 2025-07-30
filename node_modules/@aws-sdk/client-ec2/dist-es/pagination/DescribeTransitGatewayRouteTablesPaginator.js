import { createPaginator } from "@smithy/core";
import { DescribeTransitGatewayRouteTablesCommand, } from "../commands/DescribeTransitGatewayRouteTablesCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeTransitGatewayRouteTables = createPaginator(EC2Client, DescribeTransitGatewayRouteTablesCommand, "NextToken", "NextToken", "MaxResults");
