import { createPaginator } from "@smithy/core";
import { DescribeFastSnapshotRestoresCommand, } from "../commands/DescribeFastSnapshotRestoresCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeFastSnapshotRestores = createPaginator(EC2Client, DescribeFastSnapshotRestoresCommand, "NextToken", "NextToken", "MaxResults");
