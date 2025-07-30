import { createPaginator } from "@smithy/core";
import { GetSecurityGroupsForVpcCommand, } from "../commands/GetSecurityGroupsForVpcCommand";
import { EC2Client } from "../EC2Client";
export const paginateGetSecurityGroupsForVpc = createPaginator(EC2Client, GetSecurityGroupsForVpcCommand, "NextToken", "NextToken", "MaxResults");
