import { createPaginator } from "@smithy/core";
import { DescribeExportImageTasksCommand, } from "../commands/DescribeExportImageTasksCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeExportImageTasks = createPaginator(EC2Client, DescribeExportImageTasksCommand, "NextToken", "NextToken", "MaxResults");
