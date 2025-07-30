import { createPaginator } from "@smithy/core";
import { DescribeImportImageTasksCommand, } from "../commands/DescribeImportImageTasksCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeImportImageTasks = createPaginator(EC2Client, DescribeImportImageTasksCommand, "NextToken", "NextToken", "MaxResults");
