import { Paginator } from "@smithy/types";
import { DescribeExportImageTasksCommandInput, DescribeExportImageTasksCommandOutput } from "../commands/DescribeExportImageTasksCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeExportImageTasks: (config: EC2PaginationConfiguration, input: DescribeExportImageTasksCommandInput, ...rest: any[]) => Paginator<DescribeExportImageTasksCommandOutput>;
