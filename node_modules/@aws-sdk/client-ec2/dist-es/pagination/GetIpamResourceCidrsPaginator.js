import { createPaginator } from "@smithy/core";
import { GetIpamResourceCidrsCommand, } from "../commands/GetIpamResourceCidrsCommand";
import { EC2Client } from "../EC2Client";
export const paginateGetIpamResourceCidrs = createPaginator(EC2Client, GetIpamResourceCidrsCommand, "NextToken", "NextToken", "MaxResults");
