import { Paginator } from "@smithy/types";
import { DescribeExportTasksCommandInput, DescribeExportTasksCommandOutput } from "../commands/DescribeExportTasksCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeExportTasks: (config: RDSPaginationConfiguration, input: DescribeExportTasksCommandInput, ...rest: any[]) => Paginator<DescribeExportTasksCommandOutput>;
