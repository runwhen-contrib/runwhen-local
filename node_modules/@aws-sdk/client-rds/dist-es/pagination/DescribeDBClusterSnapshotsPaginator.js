import { createPaginator } from "@smithy/core";
import { DescribeDBClusterSnapshotsCommand, } from "../commands/DescribeDBClusterSnapshotsCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeDBClusterSnapshots = createPaginator(RDSClient, DescribeDBClusterSnapshotsCommand, "Marker", "Marker", "MaxRecords");
