import { createPaginator } from "@smithy/core";
import { DescribeSpotFleetRequestsCommand, } from "../commands/DescribeSpotFleetRequestsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeSpotFleetRequests = createPaginator(EC2Client, DescribeSpotFleetRequestsCommand, "NextToken", "NextToken", "MaxResults");
