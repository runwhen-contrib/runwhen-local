import { createPaginator } from "@smithy/core";
import { DescribeClientVpnConnectionsCommand, } from "../commands/DescribeClientVpnConnectionsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeClientVpnConnections = createPaginator(EC2Client, DescribeClientVpnConnectionsCommand, "NextToken", "NextToken", "MaxResults");
