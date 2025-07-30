import { createPaginator } from "@smithy/core";
import { DescribeLocalGatewayVirtualInterfacesCommand, } from "../commands/DescribeLocalGatewayVirtualInterfacesCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeLocalGatewayVirtualInterfaces = createPaginator(EC2Client, DescribeLocalGatewayVirtualInterfacesCommand, "NextToken", "NextToken", "MaxResults");
