import { createPaginator } from "@smithy/core";
import { GetTransitGatewayPolicyTableAssociationsCommand, } from "../commands/GetTransitGatewayPolicyTableAssociationsCommand";
import { EC2Client } from "../EC2Client";
export const paginateGetTransitGatewayPolicyTableAssociations = createPaginator(EC2Client, GetTransitGatewayPolicyTableAssociationsCommand, "NextToken", "NextToken", "MaxResults");
