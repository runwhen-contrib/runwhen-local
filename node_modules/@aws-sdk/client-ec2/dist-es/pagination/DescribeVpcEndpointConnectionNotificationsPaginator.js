import { createPaginator } from "@smithy/core";
import { DescribeVpcEndpointConnectionNotificationsCommand, } from "../commands/DescribeVpcEndpointConnectionNotificationsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeVpcEndpointConnectionNotifications = createPaginator(EC2Client, DescribeVpcEndpointConnectionNotificationsCommand, "NextToken", "NextToken", "MaxResults");
