import { createPaginator } from "@smithy/core";
import { DescribeImportSnapshotTasksCommand, } from "../commands/DescribeImportSnapshotTasksCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeImportSnapshotTasks = createPaginator(EC2Client, DescribeImportSnapshotTasksCommand, "NextToken", "NextToken", "MaxResults");
