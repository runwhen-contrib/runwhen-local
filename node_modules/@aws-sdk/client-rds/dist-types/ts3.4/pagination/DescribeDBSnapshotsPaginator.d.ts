import { Paginator } from "@smithy/types";
import {
  DescribeDBSnapshotsCommandInput,
  DescribeDBSnapshotsCommandOutput,
} from "../commands/DescribeDBSnapshotsCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeDBSnapshots: (
  config: RDSPaginationConfiguration,
  input: DescribeDBSnapshotsCommandInput,
  ...rest: any[]
) => Paginator<DescribeDBSnapshotsCommandOutput>;
