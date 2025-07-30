import { createPaginator } from "@smithy/core";
import { DescribeSourceRegionsCommand, } from "../commands/DescribeSourceRegionsCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeSourceRegions = createPaginator(RDSClient, DescribeSourceRegionsCommand, "Marker", "Marker", "MaxRecords");
