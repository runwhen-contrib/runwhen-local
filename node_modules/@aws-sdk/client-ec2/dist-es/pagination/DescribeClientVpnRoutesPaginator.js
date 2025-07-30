import { createPaginator } from "@smithy/core";
import { DescribeClientVpnRoutesCommand, } from "../commands/DescribeClientVpnRoutesCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeClientVpnRoutes = createPaginator(EC2Client, DescribeClientVpnRoutesCommand, "NextToken", "NextToken", "MaxResults");
