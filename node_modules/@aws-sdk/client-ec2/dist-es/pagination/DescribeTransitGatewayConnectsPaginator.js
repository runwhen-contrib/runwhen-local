import { createPaginator } from "@smithy/core";
import { DescribeTransitGatewayConnectsCommand, } from "../commands/DescribeTransitGatewayConnectsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeTransitGatewayConnects = createPaginator(EC2Client, DescribeTransitGatewayConnectsCommand, "NextToken", "NextToken", "MaxResults");
