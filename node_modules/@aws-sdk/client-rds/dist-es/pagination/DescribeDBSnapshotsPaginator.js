import { createPaginator } from "@smithy/core";
import { DescribeDBSnapshotsCommand, } from "../commands/DescribeDBSnapshotsCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeDBSnapshots = createPaginator(RDSClient, DescribeDBSnapshotsCommand, "Marker", "Marker", "MaxRecords");
