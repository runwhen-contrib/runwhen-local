import { createPaginator } from "@smithy/core";
import { DescribeVpcEndpointServicePermissionsCommand, } from "../commands/DescribeVpcEndpointServicePermissionsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeVpcEndpointServicePermissions = createPaginator(EC2Client, DescribeVpcEndpointServicePermissionsCommand, "NextToken", "NextToken", "MaxResults");
