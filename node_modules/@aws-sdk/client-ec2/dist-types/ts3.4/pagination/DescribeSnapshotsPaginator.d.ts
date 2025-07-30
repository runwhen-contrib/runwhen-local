import { Paginator } from "@smithy/types";
import {
  DescribeSnapshotsCommandInput,
  DescribeSnapshotsCommandOutput,
} from "../commands/DescribeSnapshotsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeSnapshots: (
  config: EC2PaginationConfiguration,
  input: DescribeSnapshotsCommandInput,
  ...rest: any[]
) => Paginator<DescribeSnapshotsCommandOutput>;
