import { createPaginator } from "@smithy/core";
import { DescribeTransitGatewayConnectPeersCommand, } from "../commands/DescribeTransitGatewayConnectPeersCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeTransitGatewayConnectPeers = createPaginator(EC2Client, DescribeTransitGatewayConnectPeersCommand, "NextToken", "NextToken", "MaxResults");
