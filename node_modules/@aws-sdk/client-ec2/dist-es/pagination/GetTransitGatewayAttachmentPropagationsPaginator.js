import { createPaginator } from "@smithy/core";
import { GetTransitGatewayAttachmentPropagationsCommand, } from "../commands/GetTransitGatewayAttachmentPropagationsCommand";
import { EC2Client } from "../EC2Client";
export const paginateGetTransitGatewayAttachmentPropagations = createPaginator(EC2Client, GetTransitGatewayAttachmentPropagationsCommand, "NextToken", "NextToken", "MaxResults");
