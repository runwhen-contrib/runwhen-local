import { createPaginator } from "@smithy/core";
import { DescribeVerifiedAccessGroupsCommand, } from "../commands/DescribeVerifiedAccessGroupsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeVerifiedAccessGroups = createPaginator(EC2Client, DescribeVerifiedAccessGroupsCommand, "NextToken", "NextToken", "MaxResults");
