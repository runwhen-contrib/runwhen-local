import { createPaginator } from "@smithy/core";
import { DescribeTransitGatewayAttachmentsCommand, } from "../commands/DescribeTransitGatewayAttachmentsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeTransitGatewayAttachments = createPaginator(EC2Client, DescribeTransitGatewayAttachmentsCommand, "NextToken", "NextToken", "MaxResults");
