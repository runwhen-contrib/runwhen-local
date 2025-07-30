import { createPaginator } from "@smithy/core";
import { SearchLocalGatewayRoutesCommand, } from "../commands/SearchLocalGatewayRoutesCommand";
import { EC2Client } from "../EC2Client";
export const paginateSearchLocalGatewayRoutes = createPaginator(EC2Client, SearchLocalGatewayRoutesCommand, "NextToken", "NextToken", "MaxResults");
