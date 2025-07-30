import { createPaginator } from "@smithy/core";
import { DescribeCapacityBlockOfferingsCommand, } from "../commands/DescribeCapacityBlockOfferingsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeCapacityBlockOfferings = createPaginator(EC2Client, DescribeCapacityBlockOfferingsCommand, "NextToken", "NextToken", "MaxResults");
