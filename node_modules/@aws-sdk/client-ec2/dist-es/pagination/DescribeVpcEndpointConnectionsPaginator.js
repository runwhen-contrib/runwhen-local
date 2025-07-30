import { createPaginator } from "@smithy/core";
import { DescribeVpcEndpointConnectionsCommand, } from "../commands/DescribeVpcEndpointConnectionsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeVpcEndpointConnections = createPaginator(EC2Client, DescribeVpcEndpointConnectionsCommand, "NextToken", "NextToken", "MaxResults");
