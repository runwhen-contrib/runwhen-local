import { createPaginator } from "@smithy/core";
import { DescribeStoreImageTasksCommand, } from "../commands/DescribeStoreImageTasksCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeStoreImageTasks = createPaginator(EC2Client, DescribeStoreImageTasksCommand, "NextToken", "NextToken", "MaxResults");
