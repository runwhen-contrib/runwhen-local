import { createPaginator } from "@smithy/core";
import { DescribeDBEngineVersionsCommand, } from "../commands/DescribeDBEngineVersionsCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeDBEngineVersions = createPaginator(RDSClient, DescribeDBEngineVersionsCommand, "Marker", "Marker", "MaxRecords");
