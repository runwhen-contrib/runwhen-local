import { createPaginator } from "@smithy/core";
import { DescribeTransitGatewaysCommand, } from "../commands/DescribeTransitGatewaysCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeTransitGateways = createPaginator(EC2Client, DescribeTransitGatewaysCommand, "NextToken", "NextToken", "MaxResults");
