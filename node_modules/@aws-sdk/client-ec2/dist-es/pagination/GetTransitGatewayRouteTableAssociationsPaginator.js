import { createPaginator } from "@smithy/core";
import { GetTransitGatewayRouteTableAssociationsCommand, } from "../commands/GetTransitGatewayRouteTableAssociationsCommand";
import { EC2Client } from "../EC2Client";
export const paginateGetTransitGatewayRouteTableAssociations = createPaginator(EC2Client, GetTransitGatewayRouteTableAssociationsCommand, "NextToken", "NextToken", "MaxResults");
