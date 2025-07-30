import { Paginator } from "@smithy/types";
import { DescribeDBInstanceAutomatedBackupsCommandInput, DescribeDBInstanceAutomatedBackupsCommandOutput } from "../commands/DescribeDBInstanceAutomatedBackupsCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeDBInstanceAutomatedBackups: (config: RDSPaginationConfiguration, input: DescribeDBInstanceAutomatedBackupsCommandInput, ...rest: any[]) => Paginator<DescribeDBInstanceAutomatedBackupsCommandOutput>;
