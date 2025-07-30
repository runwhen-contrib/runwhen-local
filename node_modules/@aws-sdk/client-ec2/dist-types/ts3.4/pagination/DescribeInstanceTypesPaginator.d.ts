import { Paginator } from "@smithy/types";
import {
  DescribeInstanceTypesCommandInput,
  DescribeInstanceTypesCommandOutput,
} from "../commands/DescribeInstanceTypesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeInstanceTypes: (
  config: EC2PaginationConfiguration,
  input: DescribeInstanceTypesCommandInput,
  ...rest: any[]
) => Paginator<DescribeInstanceTypesCommandOutput>;
