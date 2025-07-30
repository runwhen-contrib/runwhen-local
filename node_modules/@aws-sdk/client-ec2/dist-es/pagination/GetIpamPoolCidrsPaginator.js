import { createPaginator } from "@smithy/core";
import { GetIpamPoolCidrsCommand, } from "../commands/GetIpamPoolCidrsCommand";
import { EC2Client } from "../EC2Client";
export const paginateGetIpamPoolCidrs = createPaginator(EC2Client, GetIpamPoolCidrsCommand, "NextToken", "NextToken", "MaxResults");
