import { createPaginator } from "@smithy/core";
import { DescribeReservedInstancesOfferingsCommand, } from "../commands/DescribeReservedInstancesOfferingsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeReservedInstancesOfferings = createPaginator(EC2Client, DescribeReservedInstancesOfferingsCommand, "NextToken", "NextToken", "MaxResults");
