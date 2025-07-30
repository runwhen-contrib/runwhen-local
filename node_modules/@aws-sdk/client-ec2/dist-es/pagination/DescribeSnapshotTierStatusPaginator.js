import { createPaginator } from "@smithy/core";
import { DescribeSnapshotTierStatusCommand, } from "../commands/DescribeSnapshotTierStatusCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeSnapshotTierStatus = createPaginator(EC2Client, DescribeSnapshotTierStatusCommand, "NextToken", "NextToken", "MaxResults");
