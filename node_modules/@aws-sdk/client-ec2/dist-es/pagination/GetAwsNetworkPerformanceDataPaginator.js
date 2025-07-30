import { createPaginator } from "@smithy/core";
import { GetAwsNetworkPerformanceDataCommand, } from "../commands/GetAwsNetworkPerformanceDataCommand";
import { EC2Client } from "../EC2Client";
export const paginateGetAwsNetworkPerformanceData = createPaginator(EC2Client, GetAwsNetworkPerformanceDataCommand, "NextToken", "NextToken", "MaxResults");
