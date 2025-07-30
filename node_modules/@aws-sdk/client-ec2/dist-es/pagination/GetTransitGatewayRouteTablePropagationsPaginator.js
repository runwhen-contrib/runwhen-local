import { createPaginator } from "@smithy/core";
import { GetTransitGatewayRouteTablePropagationsCommand, } from "../commands/GetTransitGatewayRouteTablePropagationsCommand";
import { EC2Client } from "../EC2Client";
export const paginateGetTransitGatewayRouteTablePropagations = createPaginator(EC2Client, GetTransitGatewayRouteTablePropagationsCommand, "NextToken", "NextToken", "MaxResults");
