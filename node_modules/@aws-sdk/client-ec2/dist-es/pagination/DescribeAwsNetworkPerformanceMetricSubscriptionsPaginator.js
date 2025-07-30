import { createPaginator } from "@smithy/core";
import { DescribeAwsNetworkPerformanceMetricSubscriptionsCommand, } from "../commands/DescribeAwsNetworkPerformanceMetricSubscriptionsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeAwsNetworkPerformanceMetricSubscriptions = createPaginator(EC2Client, DescribeAwsNetworkPerformanceMetricSubscriptionsCommand, "NextToken", "NextToken", "MaxResults");
