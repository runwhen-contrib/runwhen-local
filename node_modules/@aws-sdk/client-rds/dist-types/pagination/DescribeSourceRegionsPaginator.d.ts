import { Paginator } from "@smithy/types";
import { DescribeSourceRegionsCommandInput, DescribeSourceRegionsCommandOutput } from "../commands/DescribeSourceRegionsCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeSourceRegions: (config: RDSPaginationConfiguration, input: DescribeSourceRegionsCommandInput, ...rest: any[]) => Paginator<DescribeSourceRegionsCommandOutput>;
