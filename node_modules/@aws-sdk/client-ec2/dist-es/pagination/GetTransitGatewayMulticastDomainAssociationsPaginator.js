import { createPaginator } from "@smithy/core";
import { GetTransitGatewayMulticastDomainAssociationsCommand, } from "../commands/GetTransitGatewayMulticastDomainAssociationsCommand";
import { EC2Client } from "../EC2Client";
export const paginateGetTransitGatewayMulticastDomainAssociations = createPaginator(EC2Client, GetTransitGatewayMulticastDomainAssociationsCommand, "NextToken", "NextToken", "MaxResults");
