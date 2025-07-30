import { createPaginator } from "@smithy/core";
import { DescribeSpotPriceHistoryCommand, } from "../commands/DescribeSpotPriceHistoryCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeSpotPriceHistory = createPaginator(EC2Client, DescribeSpotPriceHistoryCommand, "NextToken", "NextToken", "MaxResults");
