import { createPaginator } from "@smithy/core";
import { DescribeLocalGatewayRouteTableVirtualInterfaceGroupAssociationsCommand, } from "../commands/DescribeLocalGatewayRouteTableVirtualInterfaceGroupAssociationsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeLocalGatewayRouteTableVirtualInterfaceGroupAssociations = createPaginator(EC2Client, DescribeLocalGatewayRouteTableVirtualInterfaceGroupAssociationsCommand, "NextToken", "NextToken", "MaxResults");
