import { createPaginator } from "@smithy/core";
import { DescribeLocalGatewayVirtualInterfaceGroupsCommand, } from "../commands/DescribeLocalGatewayVirtualInterfaceGroupsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeLocalGatewayVirtualInterfaceGroups = createPaginator(EC2Client, DescribeLocalGatewayVirtualInterfaceGroupsCommand, "NextToken", "NextToken", "MaxResults");
