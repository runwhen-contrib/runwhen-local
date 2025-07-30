import { Paginator } from "@smithy/types";
import {
  DescribeGlobalClustersCommandInput,
  DescribeGlobalClustersCommandOutput,
} from "../commands/DescribeGlobalClustersCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeGlobalClusters: (
  config: RDSPaginationConfiguration,
  input: DescribeGlobalClustersCommandInput,
  ...rest: any[]
) => Paginator<DescribeGlobalClustersCommandOutput>;
