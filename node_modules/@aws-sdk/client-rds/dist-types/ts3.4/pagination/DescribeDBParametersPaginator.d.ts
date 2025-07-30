import { Paginator } from "@smithy/types";
import {
  DescribeDBParametersCommandInput,
  DescribeDBParametersCommandOutput,
} from "../commands/DescribeDBParametersCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeDBParameters: (
  config: RDSPaginationConfiguration,
  input: DescribeDBParametersCommandInput,
  ...rest: any[]
) => Paginator<DescribeDBParametersCommandOutput>;
