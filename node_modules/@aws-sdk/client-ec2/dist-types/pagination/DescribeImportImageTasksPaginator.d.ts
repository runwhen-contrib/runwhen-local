import { Paginator } from "@smithy/types";
import { DescribeImportImageTasksCommandInput, DescribeImportImageTasksCommandOutput } from "../commands/DescribeImportImageTasksCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeImportImageTasks: (config: EC2PaginationConfiguration, input: DescribeImportImageTasksCommandInput, ...rest: any[]) => Paginator<DescribeImportImageTasksCommandOutput>;
