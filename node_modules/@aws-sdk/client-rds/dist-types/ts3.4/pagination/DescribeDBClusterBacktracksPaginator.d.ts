import { Paginator } from "@smithy/types";
import {
  DescribeDBClusterBacktracksCommandInput,
  DescribeDBClusterBacktracksCommandOutput,
} from "../commands/DescribeDBClusterBacktracksCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeDBClusterBacktracks: (
  config: RDSPaginationConfiguration,
  input: DescribeDBClusterBacktracksCommandInput,
  ...rest: any[]
) => Paginator<DescribeDBClusterBacktracksCommandOutput>;
