import { createPaginator } from "@smithy/core";
import { GetAssociatedIpv6PoolCidrsCommand, } from "../commands/GetAssociatedIpv6PoolCidrsCommand";
import { EC2Client } from "../EC2Client";
export const paginateGetAssociatedIpv6PoolCidrs = createPaginator(EC2Client, GetAssociatedIpv6PoolCidrsCommand, "NextToken", "NextToken", "MaxResults");
