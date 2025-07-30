import { createPaginator } from "@smithy/core";
import { DescribeDBLogFilesCommand, } from "../commands/DescribeDBLogFilesCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeDBLogFiles = createPaginator(RDSClient, DescribeDBLogFilesCommand, "Marker", "Marker", "MaxRecords");
