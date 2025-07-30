import { Paginator } from "@smithy/types";
import { DescribeDBProxiesCommandInput, DescribeDBProxiesCommandOutput } from "../commands/DescribeDBProxiesCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeDBProxies: (config: RDSPaginationConfiguration, input: DescribeDBProxiesCommandInput, ...rest: any[]) => Paginator<DescribeDBProxiesCommandOutput>;
