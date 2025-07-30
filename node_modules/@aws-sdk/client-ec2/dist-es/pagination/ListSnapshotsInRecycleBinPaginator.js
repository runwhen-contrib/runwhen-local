import { createPaginator } from "@smithy/core";
import { ListSnapshotsInRecycleBinCommand, } from "../commands/ListSnapshotsInRecycleBinCommand";
import { EC2Client } from "../EC2Client";
export const paginateListSnapshotsInRecycleBin = createPaginator(EC2Client, ListSnapshotsInRecycleBinCommand, "NextToken", "NextToken", "MaxResults");
