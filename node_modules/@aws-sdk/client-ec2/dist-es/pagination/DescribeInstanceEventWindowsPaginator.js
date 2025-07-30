import { createPaginator } from "@smithy/core";
import { DescribeInstanceEventWindowsCommand, } from "../commands/DescribeInstanceEventWindowsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeInstanceEventWindows = createPaginator(EC2Client, DescribeInstanceEventWindowsCommand, "NextToken", "NextToken", "MaxResults");
