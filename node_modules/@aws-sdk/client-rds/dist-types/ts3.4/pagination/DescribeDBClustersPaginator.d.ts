import { Paginator } from "@smithy/types";
import {
  DescribeDBClustersCommandInput,
  DescribeDBClustersCommandOutput,
} from "../commands/DescribeDBClustersCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeDBClusters: (
  config: RDSPaginationConfiguration,
  input: DescribeDBClustersCommandInput,
  ...rest: any[]
) => Paginator<DescribeDBClustersCommandOutput>;
