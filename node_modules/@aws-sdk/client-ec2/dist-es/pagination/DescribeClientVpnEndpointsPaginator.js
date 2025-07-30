import { createPaginator } from "@smithy/core";
import { DescribeClientVpnEndpointsCommand, } from "../commands/DescribeClientVpnEndpointsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeClientVpnEndpoints = createPaginator(EC2Client, DescribeClientVpnEndpointsCommand, "NextToken", "NextToken", "MaxResults");
