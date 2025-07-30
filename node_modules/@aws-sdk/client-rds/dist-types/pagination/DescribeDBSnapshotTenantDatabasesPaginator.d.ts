import { Paginator } from "@smithy/types";
import { DescribeDBSnapshotTenantDatabasesCommandInput, DescribeDBSnapshotTenantDatabasesCommandOutput } from "../commands/DescribeDBSnapshotTenantDatabasesCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeDBSnapshotTenantDatabases: (config: RDSPaginationConfiguration, input: DescribeDBSnapshotTenantDatabasesCommandInput, ...rest: any[]) => Paginator<DescribeDBSnapshotTenantDatabasesCommandOutput>;
