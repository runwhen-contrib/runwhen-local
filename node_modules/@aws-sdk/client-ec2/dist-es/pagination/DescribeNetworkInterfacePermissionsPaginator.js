import { createPaginator } from "@smithy/core";
import { DescribeNetworkInterfacePermissionsCommand, } from "../commands/DescribeNetworkInterfacePermissionsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeNetworkInterfacePermissions = createPaginator(EC2Client, DescribeNetworkInterfacePermissionsCommand, "NextToken", "NextToken", "MaxResults");
