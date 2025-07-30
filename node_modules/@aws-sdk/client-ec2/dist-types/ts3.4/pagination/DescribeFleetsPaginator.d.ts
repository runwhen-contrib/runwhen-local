import { Paginator } from "@smithy/types";
import {
  DescribeFleetsCommandInput,
  DescribeFleetsCommandOutput,
} from "../commands/DescribeFleetsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeFleets: (
  config: EC2PaginationConfiguration,
  input: DescribeFleetsCommandInput,
  ...rest: any[]
) => Paginator<DescribeFleetsCommandOutput>;
