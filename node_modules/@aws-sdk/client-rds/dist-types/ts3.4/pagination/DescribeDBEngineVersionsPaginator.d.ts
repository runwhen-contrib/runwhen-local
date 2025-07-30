import { Paginator } from "@smithy/types";
import {
  DescribeDBEngineVersionsCommandInput,
  DescribeDBEngineVersionsCommandOutput,
} from "../commands/DescribeDBEngineVersionsCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeDBEngineVersions: (
  config: RDSPaginationConfiguration,
  input: DescribeDBEngineVersionsCommandInput,
  ...rest: any[]
) => Paginator<DescribeDBEngineVersionsCommandOutput>;
