import { createPaginator } from "@smithy/core";
import { DescribeExportTasksCommand, } from "../commands/DescribeExportTasksCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeExportTasks = createPaginator(RDSClient, DescribeExportTasksCommand, "Marker", "Marker", "MaxRecords");
