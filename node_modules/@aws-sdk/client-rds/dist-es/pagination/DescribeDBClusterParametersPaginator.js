import { createPaginator } from "@smithy/core";
import { DescribeDBClusterParametersCommand, } from "../commands/DescribeDBClusterParametersCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeDBClusterParameters = createPaginator(RDSClient, DescribeDBClusterParametersCommand, "Marker", "Marker", "MaxRecords");
