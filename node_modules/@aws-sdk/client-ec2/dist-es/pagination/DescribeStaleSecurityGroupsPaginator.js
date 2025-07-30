import { createPaginator } from "@smithy/core";
import { DescribeStaleSecurityGroupsCommand, } from "../commands/DescribeStaleSecurityGroupsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeStaleSecurityGroups = createPaginator(EC2Client, DescribeStaleSecurityGroupsCommand, "NextToken", "NextToken", "MaxResults");
