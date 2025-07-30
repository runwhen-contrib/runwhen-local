import { createPaginator } from "@smithy/core";
import { DescribeTransitGatewayPolicyTablesCommand, } from "../commands/DescribeTransitGatewayPolicyTablesCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeTransitGatewayPolicyTables = createPaginator(EC2Client, DescribeTransitGatewayPolicyTablesCommand, "NextToken", "NextToken", "MaxResults");
