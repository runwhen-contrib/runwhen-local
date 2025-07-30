import { createPaginator } from "@smithy/core";
import { DescribeReplaceRootVolumeTasksCommand, } from "../commands/DescribeReplaceRootVolumeTasksCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeReplaceRootVolumeTasks = createPaginator(EC2Client, DescribeReplaceRootVolumeTasksCommand, "NextToken", "NextToken", "MaxResults");
