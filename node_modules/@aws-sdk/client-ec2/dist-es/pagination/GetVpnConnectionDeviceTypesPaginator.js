import { createPaginator } from "@smithy/core";
import { GetVpnConnectionDeviceTypesCommand, } from "../commands/GetVpnConnectionDeviceTypesCommand";
import { EC2Client } from "../EC2Client";
export const paginateGetVpnConnectionDeviceTypes = createPaginator(EC2Client, GetVpnConnectionDeviceTypesCommand, "NextToken", "NextToken", "MaxResults");
