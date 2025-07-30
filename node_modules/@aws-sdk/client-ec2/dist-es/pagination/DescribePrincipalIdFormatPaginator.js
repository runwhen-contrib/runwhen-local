import { createPaginator } from "@smithy/core";
import { DescribePrincipalIdFormatCommand, } from "../commands/DescribePrincipalIdFormatCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribePrincipalIdFormat = createPaginator(EC2Client, DescribePrincipalIdFormatCommand, "NextToken", "NextToken", "MaxResults");
