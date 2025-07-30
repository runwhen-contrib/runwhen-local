import { createPaginator } from "@smithy/core";
import { GetIpamPoolAllocationsCommand, } from "../commands/GetIpamPoolAllocationsCommand";
import { EC2Client } from "../EC2Client";
export const paginateGetIpamPoolAllocations = createPaginator(EC2Client, GetIpamPoolAllocationsCommand, "NextToken", "NextToken", "MaxResults");
