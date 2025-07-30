import { createPaginator } from "@smithy/core";
import { DescribeInstanceTypeOfferingsCommand, } from "../commands/DescribeInstanceTypeOfferingsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeInstanceTypeOfferings = createPaginator(EC2Client, DescribeInstanceTypeOfferingsCommand, "NextToken", "NextToken", "MaxResults");
