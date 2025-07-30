import { createPaginator } from "@smithy/core";
import { DescribeTransitGatewayPeeringAttachmentsCommand, } from "../commands/DescribeTransitGatewayPeeringAttachmentsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeTransitGatewayPeeringAttachments = createPaginator(EC2Client, DescribeTransitGatewayPeeringAttachmentsCommand, "NextToken", "NextToken", "MaxResults");
