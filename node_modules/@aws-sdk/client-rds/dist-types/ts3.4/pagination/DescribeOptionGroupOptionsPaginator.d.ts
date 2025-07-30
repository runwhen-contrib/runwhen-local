import { Paginator } from "@smithy/types";
import {
  DescribeOptionGroupOptionsCommandInput,
  DescribeOptionGroupOptionsCommandOutput,
} from "../commands/DescribeOptionGroupOptionsCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeOptionGroupOptions: (
  config: RDSPaginationConfiguration,
  input: DescribeOptionGroupOptionsCommandInput,
  ...rest: any[]
) => Paginator<DescribeOptionGroupOptionsCommandOutput>;
