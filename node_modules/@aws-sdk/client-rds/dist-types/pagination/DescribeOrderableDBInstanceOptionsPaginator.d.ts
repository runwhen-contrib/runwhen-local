import { Paginator } from "@smithy/types";
import { DescribeOrderableDBInstanceOptionsCommandInput, DescribeOrderableDBInstanceOptionsCommandOutput } from "../commands/DescribeOrderableDBInstanceOptionsCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeOrderableDBInstanceOptions: (config: RDSPaginationConfiguration, input: DescribeOrderableDBInstanceOptionsCommandInput, ...rest: any[]) => Paginator<DescribeOrderableDBInstanceOptionsCommandOutput>;
