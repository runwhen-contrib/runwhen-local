import { Paginator } from "@smithy/types";
import {
  DescribeDBClusterSnapshotsCommandInput,
  DescribeDBClusterSnapshotsCommandOutput,
} from "../commands/DescribeDBClusterSnapshotsCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeDBClusterSnapshots: (
  config: RDSPaginationConfiguration,
  input: DescribeDBClusterSnapshotsCommandInput,
  ...rest: any[]
) => Paginator<DescribeDBClusterSnapshotsCommandOutput>;
