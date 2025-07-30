import { createPaginator } from "@smithy/core";
import { DescribeFlowLogsCommand, } from "../commands/DescribeFlowLogsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeFlowLogs = createPaginator(EC2Client, DescribeFlowLogsCommand, "NextToken", "NextToken", "MaxResults");
