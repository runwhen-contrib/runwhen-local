import { createPaginator } from "@smithy/core";
import { DescribeSnapshotsCommand, } from "../commands/DescribeSnapshotsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeSnapshots = createPaginator(EC2Client, DescribeSnapshotsCommand, "NextToken", "NextToken", "MaxResults");
