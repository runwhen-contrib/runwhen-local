import { createPaginator } from "@smithy/core";
import { DescribeLocalGatewayRouteTableVpcAssociationsCommand, } from "../commands/DescribeLocalGatewayRouteTableVpcAssociationsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeLocalGatewayRouteTableVpcAssociations = createPaginator(EC2Client, DescribeLocalGatewayRouteTableVpcAssociationsCommand, "NextToken", "NextToken", "MaxResults");
