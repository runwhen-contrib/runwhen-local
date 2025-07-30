import { createPaginator } from "@smithy/core";
import { GetTransitGatewayPrefixListReferencesCommand, } from "../commands/GetTransitGatewayPrefixListReferencesCommand";
import { EC2Client } from "../EC2Client";
export const paginateGetTransitGatewayPrefixListReferences = createPaginator(EC2Client, GetTransitGatewayPrefixListReferencesCommand, "NextToken", "NextToken", "MaxResults");
