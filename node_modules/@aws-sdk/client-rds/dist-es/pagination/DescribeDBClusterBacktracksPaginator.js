import { createPaginator } from "@smithy/core";
import { DescribeDBClusterBacktracksCommand, } from "../commands/DescribeDBClusterBacktracksCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeDBClusterBacktracks = createPaginator(RDSClient, DescribeDBClusterBacktracksCommand, "Marker", "Marker", "MaxRecords");
