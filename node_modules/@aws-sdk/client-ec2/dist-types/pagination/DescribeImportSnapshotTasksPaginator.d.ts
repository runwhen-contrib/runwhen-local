import { Paginator } from "@smithy/types";
import { DescribeImportSnapshotTasksCommandInput, DescribeImportSnapshotTasksCommandOutput } from "../commands/DescribeImportSnapshotTasksCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeImportSnapshotTasks: (config: EC2PaginationConfiguration, input: DescribeImportSnapshotTasksCommandInput, ...rest: any[]) => Paginator<DescribeImportSnapshotTasksCommandOutput>;
