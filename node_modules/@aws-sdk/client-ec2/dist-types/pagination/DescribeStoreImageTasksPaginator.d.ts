import { Paginator } from "@smithy/types";
import { DescribeStoreImageTasksCommandInput, DescribeStoreImageTasksCommandOutput } from "../commands/DescribeStoreImageTasksCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeStoreImageTasks: (config: EC2PaginationConfiguration, input: DescribeStoreImageTasksCommandInput, ...rest: any[]) => Paginator<DescribeStoreImageTasksCommandOutput>;
