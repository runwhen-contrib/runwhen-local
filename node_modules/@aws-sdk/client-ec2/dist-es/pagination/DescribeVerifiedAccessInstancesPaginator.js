import { createPaginator } from "@smithy/core";
import { DescribeVerifiedAccessInstancesCommand, } from "../commands/DescribeVerifiedAccessInstancesCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeVerifiedAccessInstances = createPaginator(EC2Client, DescribeVerifiedAccessInstancesCommand, "NextToken", "NextToken", "MaxResults");
