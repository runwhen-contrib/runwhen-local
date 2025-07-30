import { Paginator } from "@smithy/types";
import { DescribeDBInstancesCommandInput, DescribeDBInstancesCommandOutput } from "../commands/DescribeDBInstancesCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeDBInstances: (config: RDSPaginationConfiguration, input: DescribeDBInstancesCommandInput, ...rest: any[]) => Paginator<DescribeDBInstancesCommandOutput>;
