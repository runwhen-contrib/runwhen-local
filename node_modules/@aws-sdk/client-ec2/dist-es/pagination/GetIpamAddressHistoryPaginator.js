import { createPaginator } from "@smithy/core";
import { GetIpamAddressHistoryCommand, } from "../commands/GetIpamAddressHistoryCommand";
import { EC2Client } from "../EC2Client";
export const paginateGetIpamAddressHistory = createPaginator(EC2Client, GetIpamAddressHistoryCommand, "NextToken", "NextToken", "MaxResults");
