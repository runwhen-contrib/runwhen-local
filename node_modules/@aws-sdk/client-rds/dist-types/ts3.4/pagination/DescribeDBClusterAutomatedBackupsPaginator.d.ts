import { Paginator } from "@smithy/types";
import {
  DescribeDBClusterAutomatedBackupsCommandInput,
  DescribeDBClusterAutomatedBackupsCommandOutput,
} from "../commands/DescribeDBClusterAutomatedBackupsCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeDBClusterAutomatedBackups: (
  config: RDSPaginationConfiguration,
  input: DescribeDBClusterAutomatedBackupsCommandInput,
  ...rest: any[]
) => Paginator<DescribeDBClusterAutomatedBackupsCommandOutput>;
