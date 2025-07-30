import { createPaginator } from "@smithy/core";
import { DescribeVpcPeeringConnectionsCommand, } from "../commands/DescribeVpcPeeringConnectionsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeVpcPeeringConnections = createPaginator(EC2Client, DescribeVpcPeeringConnectionsCommand, "NextToken", "NextToken", "MaxResults");
