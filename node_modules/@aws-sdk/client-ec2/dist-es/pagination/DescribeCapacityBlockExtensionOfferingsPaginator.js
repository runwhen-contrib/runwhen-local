import { createPaginator } from "@smithy/core";
import { DescribeCapacityBlockExtensionOfferingsCommand, } from "../commands/DescribeCapacityBlockExtensionOfferingsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeCapacityBlockExtensionOfferings = createPaginator(EC2Client, DescribeCapacityBlockExtensionOfferingsCommand, "NextToken", "NextToken", "MaxResults");
