import { createPaginator } from "@smithy/core";
import { DescribeCapacityBlockExtensionHistoryCommand, } from "../commands/DescribeCapacityBlockExtensionHistoryCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeCapacityBlockExtensionHistory = createPaginator(EC2Client, DescribeCapacityBlockExtensionHistoryCommand, "NextToken", "NextToken", "MaxResults");
