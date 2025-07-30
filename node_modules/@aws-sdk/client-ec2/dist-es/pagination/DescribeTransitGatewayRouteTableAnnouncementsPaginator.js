import { createPaginator } from "@smithy/core";
import { DescribeTransitGatewayRouteTableAnnouncementsCommand, } from "../commands/DescribeTransitGatewayRouteTableAnnouncementsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeTransitGatewayRouteTableAnnouncements = createPaginator(EC2Client, DescribeTransitGatewayRouteTableAnnouncementsCommand, "NextToken", "NextToken", "MaxResults");
