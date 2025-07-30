import { Paginator } from "@smithy/types";
import {
  DescribeTenantDatabasesCommandInput,
  DescribeTenantDatabasesCommandOutput,
} from "../commands/DescribeTenantDatabasesCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeTenantDatabases: (
  config: RDSPaginationConfiguration,
  input: DescribeTenantDatabasesCommandInput,
  ...rest: any[]
) => Paginator<DescribeTenantDatabasesCommandOutput>;
