import { Paginator } from "@smithy/types";
import { DescribeDBProxyTargetsCommandInput, DescribeDBProxyTargetsCommandOutput } from "../commands/DescribeDBProxyTargetsCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeDBProxyTargets: (config: RDSPaginationConfiguration, input: DescribeDBProxyTargetsCommandInput, ...rest: any[]) => Paginator<DescribeDBProxyTargetsCommandOutput>;
