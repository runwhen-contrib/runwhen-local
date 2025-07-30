import { createPaginator } from "@smithy/core";
import { DescribeTransitGatewayVpcAttachmentsCommand, } from "../commands/DescribeTransitGatewayVpcAttachmentsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeTransitGatewayVpcAttachments = createPaginator(EC2Client, DescribeTransitGatewayVpcAttachmentsCommand, "NextToken", "NextToken", "MaxResults");
