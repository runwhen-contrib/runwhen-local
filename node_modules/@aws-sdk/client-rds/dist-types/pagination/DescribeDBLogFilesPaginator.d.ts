import { Paginator } from "@smithy/types";
import { DescribeDBLogFilesCommandInput, DescribeDBLogFilesCommandOutput } from "../commands/DescribeDBLogFilesCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeDBLogFiles: (config: RDSPaginationConfiguration, input: DescribeDBLogFilesCommandInput, ...rest: any[]) => Paginator<DescribeDBLogFilesCommandOutput>;
